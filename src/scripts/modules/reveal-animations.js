const REVEAL_GROUPS = [
  { selector: ".hero__brand", stagger: 0, variant: "soft" },
  { selector: ".hero__title-line", stagger: 90, variant: "wide" },
  { selector: ".hero__description", stagger: 0, variant: "soft" },
  { selector: ".hero__actions .button", stagger: 110, variant: "soft" },
  { selector: ".support__title", stagger: 0, variant: "wide" },
  { selector: ".event__media", stagger: 0, variant: "wide" },
  { selector: ".event__content > *", stagger: 90, variant: "soft" },
  { selector: ".stages__header", stagger: 0, variant: "soft" },
  { selector: ".stages__slide", stagger: 90, variant: "soft" },
  { selector: ".stages__controls", stagger: 0, variant: "soft" },
  { selector: ".participants__top", stagger: 0, variant: "soft" },
  { selector: ".participants__slider", stagger: 0, variant: "soft" },
  { selector: ".participants__controls", stagger: 0, variant: "soft" },
  { selector: ".footer__body", stagger: 0, variant: "soft" },
];

export function initRevealAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const elements = [];

  REVEAL_GROUPS.forEach(({ selector, stagger, variant }) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (!(element instanceof HTMLElement) || element.classList.contains("reveal")) {
        return;
      }

      element.classList.add("reveal");

      if (variant) {
        element.classList.add(`reveal--${variant}`);
      }

      element.style.setProperty("--reveal-delay", `${index * stagger}ms`);
      elements.push(element);
    });
  });

  if (elements.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
}
