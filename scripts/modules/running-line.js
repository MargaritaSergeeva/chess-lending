export function initRunningLines() {
  const template = document.querySelector("#running-line-template");
  const roots = document.querySelectorAll("[data-running-line-root]");

  if (!(template instanceof HTMLTemplateElement) || roots.length === 0) {
    return;
  }

  roots.forEach((root) => {
    root.replaceChildren(template.content.cloneNode(true));
  });
}
