const AUTOPLAY_DELAY = 4000;
const LIVE_POLITE_RESET_DELAY = 250;

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
  const scope = root?.closest(".participants__container") ?? root;

  if (!root || !scope) {
    return;
  }

  const track = root.querySelector("[data-participants-track]");
  const prevButton = scope.querySelector("[data-participants-prev]");
  const nextButton = scope.querySelector("[data-participants-next]");
  const currentElement = scope.querySelector("[data-participants-current]");
  const totalElement = scope.querySelector("[data-participants-total]");
  const statusElement = currentElement.closest(".participants__status");
  const initialSlides = Array.from(track?.children ?? []);

  if (
    !track ||
    !prevButton ||
    !nextButton ||
    !currentElement ||
    !(statusElement instanceof HTMLElement) ||
    !totalElement ||
    initialSlides.length === 0
  ) {
    return;
  }

  initialSlides.forEach((slide, index) => {
    if (slide instanceof HTMLElement) {
      slide.dataset.realIndex = String(index);
    }
  });

  let itemsPerView = getItemsPerView();
  let autoplayId = 0;
  let liveResetId = 0;
  let isAnimating = false;
  let cancelAnimationCompletion = null;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  totalElement.textContent = String(initialSlides.length);
  statusElement.setAttribute("aria-live", "off");

  function getSlides() {
    return Array.from(track.children);
  }

  function getGap() {
    return Number.parseFloat(getComputedStyle(track).gap) || 0;
  }

  function getSlideWidth() {
    const firstSlide = track.children[0];

    if (!(firstSlide instanceof HTMLElement)) {
      return 0;
    }

    return firstSlide.getBoundingClientRect().width;
  }

  function getStepOffset() {
    return itemsPerView * (getSlideWidth() + getGap());
  }

  function setTrackPosition(offset, withTransition = true) {
    track.style.transition = withTransition ? "" : "none";
    track.style.transform = `translateX(${offset}px)`;
  }

  function commitInstantPosition(offset) {
    setTrackPosition(offset, false);
    void track.offsetHeight;
    track.style.transition = "";
  }

  function syncStatus() {
    const firstSlide = track.children[0];

    if (!(firstSlide instanceof HTMLElement)) {
      return;
    }

    const startIndex = Number(firstSlide.dataset.realIndex ?? 0);
    const visibleLastSlide = Math.min(initialSlides.length, startIndex + itemsPerView);

    currentElement.textContent = String(visibleLastSlide);
  }

  function restoreCanonicalOrder(startIndex = 0) {
    const orderedSlides = [
      ...initialSlides.slice(startIndex),
      ...initialSlides.slice(0, startIndex),
    ];

    track.replaceChildren(...orderedSlides);
    commitInstantPosition(0);
    syncStatus();
  }

  function clearLiveReset() {
    window.clearTimeout(liveResetId);
    liveResetId = 0;
  }

  function announceStatus() {
    statusElement.setAttribute("aria-live", "polite");
    clearLiveReset();
    liveResetId = window.setTimeout(() => {
      statusElement.setAttribute("aria-live", "off");
      liveResetId = 0;
    }, LIVE_POLITE_RESET_DELAY);
  }

  function finishAnimation(callback) {
    cancelAnimationCompletion?.();

    const handleTransitionEnd = (event) => {
      if (event.target !== track || event.propertyName !== "transform") {
        return;
      }

      track.removeEventListener("transitionend", handleTransitionEnd);
      cancelAnimationCompletion = null;
      callback();
      isAnimating = false;
    };

    cancelAnimationCompletion = () => {
      track.removeEventListener("transitionend", handleTransitionEnd);
      cancelAnimationCompletion = null;
    };

    track.addEventListener("transitionend", handleTransitionEnd);
  }

  function restartAutoplay() {
    if (reducedMotionQuery.matches) {
      return;
    }

    window.clearInterval(autoplayId);
    autoplayId = window.setInterval(() => {
      goNext();
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    window.clearInterval(autoplayId);
    autoplayId = 0;
  }

  function goNext() {
    if (isAnimating) {
      return false;
    }

    if (getStepOffset() === 0) {
      return false;
    }

    isAnimating = true;
    setTrackPosition(-getStepOffset());

    finishAnimation(() => {
      const slides = getSlides();
      const movedSlides = slides.slice(0, itemsPerView);

      movedSlides.forEach((slide) => {
        track.append(slide);
      });

      commitInstantPosition(0);
      syncStatus();
    });

    return true;
  }

  function goPrev() {
    if (isAnimating) {
      return false;
    }

    if (getStepOffset() === 0) {
      return false;
    }

    isAnimating = true;

    const slides = getSlides();
    const movedSlides = slides.slice(-itemsPerView);

    movedSlides.forEach((slide) => {
      track.prepend(slide);
    });

    commitInstantPosition(-getStepOffset());

    requestAnimationFrame(() => {
      setTrackPosition(0);
    });

    finishAnimation(() => {
      syncStatus();
    });

    return true;
  }

  prevButton.addEventListener("click", () => {
    const didMove = goPrev();

    if (!didMove) {
      return;
    }

    announceStatus();
    restartAutoplay();
  });

  nextButton.addEventListener("click", () => {
    const didMove = goNext();

    if (!didMove) {
      return;
    }

    announceStatus();
    restartAutoplay();
  });

  scope.addEventListener("mouseenter", stopAutoplay);
  scope.addEventListener("mouseleave", restartAutoplay);
  scope.addEventListener("focusin", stopAutoplay);
  scope.addEventListener("focusout", (event) => {
    if (event.relatedTarget instanceof Node && scope.contains(event.relatedTarget)) {
      return;
    }

    restartAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
      return;
    }

    restartAutoplay();
  });

  reducedMotionQuery.addEventListener("change", () => {
    if (reducedMotionQuery.matches) {
      stopAutoplay();
      return;
    }

    restartAutoplay();
  });

  window.addEventListener("resize", () => {
    const firstSlide = track.children[0];
    const currentStartIndex = firstSlide instanceof HTMLElement
      ? Number(firstSlide.dataset.realIndex ?? 0)
      : 0;

    itemsPerView = getItemsPerView();
    const normalizedStartIndex =
      Math.floor(currentStartIndex / itemsPerView) * itemsPerView;

    isAnimating = false;
    cancelAnimationCompletion?.();
    clearLiveReset();
    statusElement.setAttribute("aria-live", "off");
    restoreCanonicalOrder(normalizedStartIndex);
  });

  itemsPerView = getItemsPerView();
  restoreCanonicalOrder(0);
  restartAutoplay();
}
