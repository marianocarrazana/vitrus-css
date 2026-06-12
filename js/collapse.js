import BaseComponent from './base-component.js';
import EventHandler from './dom/event-handler.js';
import SelectorEngine from './dom/selector-engine.js';
import { getElementFromSelector, reflow } from './util/index.js';

const NAME = 'collapse';
const DATA_KEY = 'vitrus.collapse';
const EVENT_KEY = `.${DATA_KEY}`;
const EVENT_SHOW = `show${EVENT_KEY}`;
const EVENT_SHOWN = `shown${EVENT_KEY}`;
const EVENT_HIDE = `hide${EVENT_KEY}`;
const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
const CLASS_NAME_SHOW = 'show';
const CLASS_NAME_COLLAPSE = 'collapse';
const CLASS_NAME_COLLAPSING = 'collapsing';
const CLASS_NAME_COLLAPSED = 'collapsed';
const DIMENSION_WIDTH = 'width';
const DIMENSION_HEIGHT = 'height';

class Collapse extends BaseComponent {
  constructor(element, config) {
    super(element);
    this._isTransitioning = false;
    this._config = { ...Collapse.Default, ...config };
    this._triggerArray = [];
    const toggleList = SelectorEngine.find(
      `[data-vitrus-toggle="collapse"][data-vitrus-target="#${element.id}"],[data-vitrus-toggle="collapse"][data-vitrus-target=".${element.classList[0]}"]`,
    );
    for (const elem of toggleList) {
      const selector = elem.getAttribute('data-vitrus-target');
      const filterElement = SelectorEngine.find(selector).filter(
        (foundElement) => foundElement === this._element,
      );
      if (selector && filterElement.length) {
        this._triggerArray.push(elem);
      }
    }
    this._initializeChildren();
    if (!this._config.toggle) {
      this.show();
    }
  }

  static get Default() {
    return { toggle: true, parent: null };
  }

  static get NAME() {
    return NAME;
  }

  toggle() {
    if (this._isShown()) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if (this._isTransitioning || this._isShown()) {
      return;
    }
    let actives = [];
    if (this._config.parent) {
      actives = this._getFirstLevelChildren(
        `${CLASS_NAME_COLLAPSE}.${CLASS_NAME_SHOW}`,
      ).filter((element) => element !== this._element);
    }
    if (actives.length) {
      const activeInstance = Collapse.getInstance(actives[0]);
      if (activeInstance && activeInstance._isTransitioning) {
        return;
      }
    }
    if (!EventHandler.trigger(this._element, EVENT_SHOW)) {
      return;
    }
    for (const active of actives) {
      Collapse.getOrCreateInstance(active, { toggle: false }).hide();
    }
    const dimension = this._getDimension();
    this._element.classList.remove(CLASS_NAME_COLLAPSE);
    this._element.classList.add(CLASS_NAME_COLLAPSING);
    this._element.style[dimension] = '0';
    this._addAriaAndCollapsedClass(this._triggerArray, true);
    this._isTransitioning = true;
    const complete = () => {
      this._isTransitioning = false;
      this._element.classList.remove(CLASS_NAME_COLLAPSING);
      this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW);
      this._element.style[dimension] = '';
      EventHandler.trigger(this._element, EVENT_SHOWN);
    };
    const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
    const scrollSize = `scroll${capitalizedDimension}`;
    this._queueCallback(complete, this._element, true);
    this._element.style[dimension] = `${this._element[scrollSize]}px`;
  }

  hide() {
    if (this._isTransitioning || !this._isShown()) {
      return;
    }
    if (!EventHandler.trigger(this._element, EVENT_HIDE)) {
      return;
    }
    const dimension = this._getDimension();
    this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
    reflow(this._element);
    this._element.classList.add(CLASS_NAME_COLLAPSING);
    this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW);
    this._addAriaAndCollapsedClass(this._triggerArray, false);
    this._isTransitioning = true;
    const complete = () => {
      this._isTransitioning = false;
      this._element.classList.remove(CLASS_NAME_COLLAPSING);
      this._element.classList.add(CLASS_NAME_COLLAPSE);
      this._element.style[dimension] = '';
      EventHandler.trigger(this._element, EVENT_HIDDEN);
    };
    this._element.style[dimension] = '';
    this._queueCallback(complete, this._element, true);
  }

  _isShown() {
    return this._element.classList.contains(CLASS_NAME_SHOW);
  }

  _getDimension() {
    return this._element.classList.contains('collapse-horizontal')
      ? DIMENSION_WIDTH
      : DIMENSION_HEIGHT;
  }

  _initializeChildren() {
    if (!this._config.parent) {
      return;
    }
    const children = this._getFirstLevelChildren(CLASS_NAME_COLLAPSE);
    for (const element of children) {
      const selected = element.getAttribute('data-vitrus-parent') === this._config.parent;
      if (selected) {
        Collapse.getOrCreateInstance(element, { toggle: false });
      }
    }
  }

  _getFirstLevelChildren(selector) {
    const children = SelectorEngine.find(selector, this._config.parent);
    return children.filter(
      (element) => !SelectorEngine.find(selector, element).length,
    );
  }

  _addAriaAndCollapsedClass(triggerArray, isOpen) {
    if (!triggerArray.length) {
      return;
    }
    for (const element of triggerArray) {
      element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
      element.setAttribute('aria-expanded', isOpen);
    }
  }

  static jQueryInterface(config) {
    const _config = {};
    if (typeof config === 'string' && /show|hide/.test(config)) {
      _config.toggle = false;
    }
    return this.each(function eachCollapse() {
      const data = Collapse.getOrCreateInstance(this, _config);
      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      }
    });
  }

  static dataApiClickHandler(event) {
    const triggers = ['A', 'AREA', 'BUTTON'];
    if (event.target.tagName && !triggers.includes(event.target.tagName)) {
      return;
    }
    const selector = event.target.closest('[data-vitrus-toggle="collapse"]');
    if (!selector) {
      return;
    }
    const target = getElementFromSelector(selector);
    const config = {
      toggle: false,
    };
    const collapseData = Collapse.getInstance(target);
    if (collapseData) {
      if (collapseData._isTransitioning) {
        return;
      }
      if (collapseData._config.toggle) {
        collapseData.toggle();
        return;
      }
    }
    if (!target) {
      return;
    }
    const data = Collapse.getOrCreateInstance(target, config);
    data.toggle();
  }
}

EventHandler.on(document, 'click', Collapse.dataApiClickHandler);

export default Collapse;
