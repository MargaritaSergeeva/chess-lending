function getItemsPerView() {
  if (window.innerWidth <= 500) {
    return 1;
  }

  if (window.innerWidth <= 1000) {
    return 2;
  }

  return 3;
}

export function initParticipantsSlider() {
  const root = document.querySelector("[data-participants-slider]");

  if (!root) {
    return;
  }

  const track = root.querySelector("[data-participants-track]");
  const prevButton = document.querySelector("[data-participants-prev]");
  const nextButton = document.querySelector("[data-participants-next]");
  const currentElement = document.querySelector("[data-participants-current]");
  const totalElement = document.querySelector("[data-participants-total]");
  const slides = Array.from(track?.children ?? []);

  if (
    !track ||
    !prevButton ||
    !nextButton ||
    !currentElement ||
    !totalElement ||
    slides.length === 0
  ) {
    return;
  }

  let currentIndex = 0;

  totalElement.textContent = String(slides.length);

  function getSliderState() {
    const itemsPerView = getItemsPerView();

    return {
      itemsPerView,
      maxIndex: Math.max(0, slides.length - itemsPerView),
    };
  }

  function update() {
    const { itemsPerView, maxIndex } = getSliderState();

    currentIndex = Math.min(currentIndex, maxIndex);

    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    const slideWidth = slides[0].getBoundingClientRect().width;
    const offset = currentIndex * (slideWidth + gap);
    const visibleLastSlide = Math.min(slides.length, currentIndex + itemsPerView);

    track.style.transform = `translateX(-${offset}px)`;
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === maxIndex;
    currentElement.textContent = String(visibleLastSlide);
  }

  prevButton.addEventListener("click", () => {
    if (currentIndex === 0) {
      return;
    }

    currentIndex = Math.max(0, currentIndex - getItemsPerView());
    update();
  });

  nextButton.addEventListener("click", () => {
    const { itemsPerView, maxIndex } = getSliderState();

    if (currentIndex >= maxIndex) {
      return;
    }

    currentIndex = Math.min(maxIndex, currentIndex + itemsPerView);
    update();
  });

  window.addEventListener("resize", update);
  update();
}
