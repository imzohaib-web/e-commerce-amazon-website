export function initBackToTopFooter() {
  const backToTopFooter = document.querySelector('.js-back-to-top-footer');
  if (!backToTopFooter) {
    return;
  }

  backToTopFooter.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

export function initScrollToTopButton(buttonSelector = '.js-scroll-to-top') {
  const scrollToTopButton = document.querySelector(buttonSelector);
  if (!scrollToTopButton) {
    return;
  }

  scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  return scrollToTopButton;
}
