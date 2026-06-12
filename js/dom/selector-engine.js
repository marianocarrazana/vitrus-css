const SelectorEngine = {
  find(selector, element = document.documentElement) {
    return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
  },

  findOne(selector, element = document.documentElement, reverse = false) {
    const elements = SelectorEngine.find(selector, element);
    if (!elements.length) {
      return null;
    }
    return reverse ? elements[elements.length - 1] : elements[0];
  },

  children(element, selector) {
    return [].concat(...element.children).filter((child) => child.matches(selector));
  },

  parents(element, selector) {
    const parents = [];
    let ancestor = element.parentNode;
    while (ancestor && ancestor.nodeType === Node.ELEMENT_NODE && ancestor.nodeType !== 11) {
      if (selector) {
        if (ancestor.matches(selector)) {
          parents.push(ancestor);
        }
      } else {
        parents.push(ancestor);
      }
      ancestor = ancestor.parentNode;
    }
    return parents;
  },

  prev(element, selector) {
    let previous = element.previousElementSibling;
    while (previous) {
      if (previous.matches(selector)) {
        return [previous];
      }
      previous = previous.previousElementSibling;
    }
    return [];
  },

  next(element, selector) {
    let next = element.nextElementSibling;
    while (next) {
      if (next.matches(selector)) {
        return [next];
      }
      next = next.nextElementSibling;
    }
    return [];
  },
};

export default SelectorEngine;
