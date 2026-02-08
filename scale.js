(() => {
  /* =========================
     DESKTOP (你原来的逻辑，原封不动保留)
     ========================= */
  const DESIGN_W = 15 * 96; // 15in 的 CSS 像素宽度基准（1440px）

  function setScale() {
    const vw = window.innerWidth;
    let s = vw / DESIGN_W;
    s = Math.max(0.35, Math.min(s, 1.25));
    document.documentElement.style.setProperty("--s", String(s));
  }

  function syncTopSpacerAndVar() {
    const topFixed = document.getElementById("topFixed");
    const spacer = document.getElementById("topSpacer");
    if (!topFixed || !spacer) return;

    const h = topFixed.getBoundingClientRect().height;
    spacer.style.height = `${h}px`;
    document.documentElement.style.setProperty("--top-fixed-h", `${h}px`);
  }

  /* =========================
     MOBILE (新增：4in 宽画板缩放 + 撑高 + 排序)
     需要 HTML 里存在：
       - #mobileArtboard  (data-artboard-w="4")
       - #mobileScaleWrap
       - #mProjectList 内有 .m-project[data-order]
     ========================= */
  const MOBILE_MQ = window.matchMedia("(max-width: 768px)");

  function sortMobileProjects() {
    const list = document.getElementById("mProjectList");
    if (!list) return;

    const items = Array.from(list.querySelectorAll(".m-project"));
    if (items.length === 0) return;

    items.sort(
      (a, b) =>
        parseInt(b.dataset.order || "0", 10) - parseInt(a.dataset.order || "0", 10)
    );
    items.forEach((it) => list.appendChild(it));
  }

  function scaleMobileArtboard() {
    const art = document.getElementById("mobileArtboard");
    const wrap = document.getElementById("mobileScaleWrap");
    if (!art || !wrap) return;

    // 只在手机断点做；离开手机断点时清理
    if (!MOBILE_MQ.matches) {
      art.style.transform = "";
      wrap.style.height = "";
      return;
    }

    const wIn = parseFloat(art.dataset.artboardW || "4");
    const artW = wIn * 96; // CSS inch -> px

    // ✅ 只按宽度 fit（高度由内容决定，可滚动）
    const vw = window.innerWidth;
    const scale = Math.min(1, vw / artW);

    // 先去掉 transform，拿到未缩放真实高度
    art.style.transform = "none";

    // 断点切换（desktop→mobile）时，这里必须等一帧再量高度，否则可能量到 0
    requestAnimationFrame(() => {
      const rawH = art.scrollHeight || art.getBoundingClientRect().height;

      art.style.transformOrigin = "top left";
      art.style.transform = `scale(${scale})`;

      // ✅ 关键：撑开缩放后的高度，让页面能滚动，不会“都消失”
      wrap.style.height = `${rawH * scale}px`;
    });
  }

  /* =========================
     Refresh
     ========================= */
  function refreshAll() {
    // desktop 部分：保持你原逻辑
    setScale();
    requestAnimationFrame(syncTopSpacerAndVar);

    // mobile 部分：排序 + 缩放
    sortMobileProjects();
    scaleMobileArtboard();
  }

  window.addEventListener("resize", refreshAll, { passive: true });
  window.addEventListener("load", refreshAll);

  // ✅ 断点变化时也刷新（电脑缩到手机/手机拉回电脑）
  if (MOBILE_MQ.addEventListener) {
    MOBILE_MQ.addEventListener("change", refreshAll);
  } else {
    // Safari 旧版本
    MOBILE_MQ.addListener(refreshAll);
  }

  refreshAll();
})();
