const MOBILE_LAYOUT_WIDTH = 375;

export function initPageScale() {
  const wrap = document.querySelector(".page__scale-wrap");
  const body = document.querySelector(".page__scale-body");

  if (!wrap || !body) {
    return;
  }

  function clearScale() {
    wrap.style.removeProperty("--page-scale-height");
    body.style.removeProperty("--page-scale");
  }

  function updateScale() {
    const viewportWidth = window.innerWidth;

    if (viewportWidth >= MOBILE_LAYOUT_WIDTH) {
      clearScale();
      return;
    }

    const scale = viewportWidth / MOBILE_LAYOUT_WIDTH;
    const sourceHeight = body.scrollHeight;

    body.style.setProperty("--page-scale", String(scale));
    wrap.style.setProperty("--page-scale-height", `${sourceHeight * scale}px`);
  }

  const resizeObserver = new ResizeObserver(() => {
    updateScale();
  });

  resizeObserver.observe(body);

  window.addEventListener("resize", updateScale);
  window.addEventListener("load", updateScale);

  updateScale();
}
