(() => {
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

  function refreshAll() {
    setScale();
    requestAnimationFrame(syncTopSpacerAndVar);
  }

  window.addEventListener("resize", refreshAll, { passive: true });
  window.addEventListener("load", refreshAll);

  refreshAll();
})();
