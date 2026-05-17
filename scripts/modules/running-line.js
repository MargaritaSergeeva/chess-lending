export function initRunningLines() {
  const source = document.querySelector("[data-running-line-source]");
  const targets = document.querySelectorAll("[data-running-line-target]");

  if (!(source instanceof HTMLElement) || targets.length === 0) {
    return;
  }

  targets.forEach((target) => {
    if (!(target instanceof HTMLElement)) {
      return;
    }

    target.replaceChildren(...Array.from(source.children).map((child) => child.cloneNode(true)));
  });
}
