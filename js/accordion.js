import Collapse from './collapse.js';

const NAME = 'accordion';

class Accordion {
  static get NAME() {
    return NAME;
  }

  static getOrCreateInstance(element, config) {
    return Collapse.getOrCreateInstance(element, config);
  }

  static getInstance(element) {
    return Collapse.getInstance(element);
  }
}

export default Accordion;
