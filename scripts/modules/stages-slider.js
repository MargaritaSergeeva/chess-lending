const DESKTOP_MIN_WIDTH = 1200;

export function initStagesSlider() {
  const root = document.querySelector("[data-stages-slider]");

  if (!root) {
    return;
  }

  const track = root.querySelector("[data-stages-track]");
  const prevButton = root.querySelector("[data-stages-prev]");
  const nextButton = root.querySelector("[data-stages-next]");
  const dotsRoot = root.querySelector("[data-stages-dots]");
  const slides = Array.from(track?.children ?? []);

  if (!track || !prevButton || !nextButton || !dotsRoot || slides.length === 0) {
    return;
  }

  let currentPage = 0;
  const pageCount = slides.length;

  function buildDots(count) {
    dotsRoot.innerHTML = "";

    for (let index = 0; index < count; index += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-controls__dot";
      dot.setAttribute("aria-label", `Перейти к странице ${index + 1}`);
      dot.addEventListener("click", () => {
        currentPage = index;
        update();
      });
      dotsRoot.append(dot);
    }
  }

  function update() {
    const isDesktop = window.innerWidth >= DESKTOP_MIN_WIDTH;

    if (isDesktop) {
      currentPage = 0;
      track.style.transform = "";
      prevButton.disabled = true;
      nextButton.disabled = true;
      dotsRoot.innerHTML = "";
      return;
    }

    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    const slideWidth = slides[0].getBoundingClientRect().width;

    currentPage = Math.min(currentPage, pageCount - 1);

    const dots = Array.from(dotsRoot.children);
    if (dots.length !== pageCount) {
      buildDots(pageCount);
    }

    const offset = currentPage * (slideWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    prevButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage === pageCount - 1;

    Array.from(dotsRoot.children).forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentPage);
    });
  }

  prevButton.addEventListener("click", () => {
    if (currentPage === 0) {
      return;
    }

    currentPage -= 1;
    update();
  });

  nextButton.addEventListener("click", () => {
    if (currentPage >= pageCount - 1) {
      return;
    }

    currentPage += 1;
    update();
  });

  window.addEventListener("resize", update);
  update();
}
