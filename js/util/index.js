export function getElement(object) {
  if (typeof object === 'string' && object.length > 0) {
    return document.querySelector(object);
  }
  if (object instanceof HTMLElement) {
    return object;
  }
  return null;
}

export function getSelectorFromElement(element) {
  const selector = element.getAttribute('data-vitrus-target');
  if (selector === '#' || !selector) {
    return null;
  }
  return selector;
}

export function getElementFromSelector(element) {
  const selector = getSelectorFromElement(element);
  if (!selector) {
    return null;
  }
  return document.querySelector(selector);
}

export function isVisible(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }
  if (element.classList.contains('d-none')) {
    return false;
  }
  if (element.offsetParent !== null) {
    return true;
  }
  return getComputedStyle(element).getPropertyValue('visibility') === 'visible';
}

export function reflow(element) {
  element.offsetHeight;
}

export function triggerTransitionEnd(element) {
  element.dispatchEvent(new Event('transitionend'));
}

export function executeAfterTransition(callback, transitionElement, waitForTransition = true) {
  if (!waitForTransition) {
    callback();
    return;
  }
  const duration = getTransitionDurationFromElement(transitionElement);
  if (!duration) {
    callback();
    return;
  }
  const emulatedDuration = duration * 5 + 10;
  let called = false;
  const handler = ({ target }) => {
    if (target !== transitionElement) {
      return;
    }
    called = true;
    transitionElement.removeEventListener('transitionend', handler);
    callback();
  };
  transitionElement.addEventListener('transitionend', handler);
  setTimeout(() => {
    if (!called) {
      triggerTransitionEnd(transitionElement);
    }
  }, emulatedDuration);
}

export function getTransitionDurationFromElement(element) {
  if (!element) {
    return 0;
  }
  let { transitionDuration, transitionDelay } = window.getComputedStyle(element);
  const floatTransitionDuration = Number.parseFloat(transitionDuration);
  const floatTransitionDelay = Number.parseFloat(transitionDelay);
  if (!floatTransitionDuration && !floatTransitionDelay) {
    return 0;
  }
  transitionDuration = transitionDuration.split(',')[0];
  transitionDelay = transitionDelay.split(',')[0];
  return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * 1000;
}
