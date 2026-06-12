import Data from './dom/data.js';
import EventHandler from './dom/event-handler.js';
import { executeAfterTransition, getElement } from './util/index.js';

export default class BaseComponent {
  constructor(element) {
    element = getElement(element);
    if (!element) {
      return;
    }
    this._element = element;
    Data.set(element, this.constructor.DATA_KEY, this);
  }

  dispose() {
    Data.remove(this._element, this.constructor.DATA_KEY);
    EventHandler.off(this._element, this.constructor.EVENT_KEY);
    this._element = null;
  }

  _queueCallback(callback, element, isAnimated = true) {
    executeAfterTransition(callback, element, isAnimated);
  }

  static getInstance(element) {
    return Data.get(getElement(element), this.DATA_KEY);
  }

  static getOrCreateInstance(element, config = {}) {
    return this.getInstance(element) || new this(element, config);
  }

  static get DATA_KEY() {
    return `vitrus.${this.NAME}`;
  }

  static get EVENT_KEY() {
    return `.${this.DATA_KEY}`;
  }

  static eventName(name) {
    return `${name}${this.EVENT_KEY}`;
  }
}
