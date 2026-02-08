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
     MOBILE (4in 宽画板：按屏幕宽度永远等比缩放 + 撑高 + 排序)
     需要 HTML：
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

    // 离开手机断点时清理
    if (!MOBILE_MQ.matches) {
      art.style.transform = "";
      wrap.style.height = "";
      return;
    }

    // 先去掉 transform，获取“设计宽度”的真实 px（4in => px）
    art.style.transform = "none";

    // 断点切换/样式切换时，必须等一帧再测量
    requestAnimationFrame(() => {
      // 用实际渲染宽度算（更稳，不依赖 96px/in 的假设）
      const designW = art.getBoundingClientRect().width;

      // 视口宽用 clientWidth 更稳（避免包含滚动条）
      const vw = document.documentElement.clientWidth;

      // ✅ 关键：永远按宽度贴满屏幕（可放大也可缩小）
      const scale = vw / designW;

      // 高度：未缩放内容高度
      const rawH = art.scrollHeight || art.getBoundingClientRect().height;

      art.style.transformOrigin = "top left";
      art.style.transform = `scale(${scale})`;

      // ✅ 撑开缩放后高度，让页面可以正常滚动
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

  // 断点变化时也刷新（电脑缩到手机/手机拉回电脑）
  if (MOBILE_MQ.addEventListener) {
    MOBILE_MQ.addEventListener("change", refreshAll);
  } else {
    // Safari 旧版本
    MOBILE_MQ.addListener(refreshAll);
  }

  refreshAll();
})();
