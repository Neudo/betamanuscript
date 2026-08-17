export function scrollElementToTopInstantly(element: HTMLElement | null) {
  element?.scrollTo({ behavior: "instant", left: 0, top: 0 });
}

export function scrollToTopInstantly() {
  window.scrollTo({ behavior: "instant", left: 0, top: 0 });
}
