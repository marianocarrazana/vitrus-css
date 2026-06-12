import BaseComponent from './base-component.js';
import EventHandler from './dom/event-handler.js';
import SelectorEngine from './dom/selector-engine.js';
import { getElement, getSelectorFromElement, isVisible } from './util/index.js';

const NAME = 'tab';
const DATA_KEY = 'vitrus.tab';
const EVENT_KEY = `.${DATA_KEY}`;
const EVENT_HIDE = `hide${EVENT_KEY}`;
const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
const EVENT_SHOW = `show${EVENT_KEY}`;
const EVENT_SHOWN = `shown${EVENT_KEY}`;
const CLASS_NAME_ACTIVE = 'active';
const SELECTOR_INNER = `.nav-link, .list-group-item, [role="tab"], [role="button"]`;

function getTabTarget(element) {
  const selector =
    getSelectorFromElement(element) ||
    (element.getAttribute('href')?.startsWith('#') ? element.getAttribute('href') : null);
  return selector ? getElement(selector) : null;
}

class Tab extends BaseComponent {
  static get NAME() {
    return NAME;
  }

  show() {
    if (
      this._element.classList.contains(CLASS_NAME_ACTIVE) ||
      !isVisible(this._element)
    ) {
      return;
    }
    let previous;
    const listElement = this._element.closest('.nav, .list-group');
    if (listElement) {
      const itemSelector =
        this._element.nodeName === 'LI' ? ':scope > li > .active' : ':scope > .active';
      previous = SelectorEngine.find(itemSelector, listElement).find(
        (element) => element !== this._element,
      );
    }
    if (
      previous &&
      !EventHandler.trigger(previous, EVENT_HIDE, { relatedTarget: this._element })
    ) {
      return;
    }
    if (
      !EventHandler.trigger(this._element, EVENT_SHOW, {
        relatedTarget: previous,
      })
    ) {
      return;
    }
    if (previous) {
      this._deactivate(previous);
    }
    this._activate(this._element);
    if (previous) {
      EventHandler.trigger(previous, EVENT_HIDDEN, { relatedTarget: this._element });
    }
    EventHandler.trigger(this._element, EVENT_SHOWN, { relatedTarget: previous });
  }

  _activate(element) {
    if (!element) {
      return;
    }
    element.classList.add(CLASS_NAME_ACTIVE);
    if (element.getAttribute('role') === 'tab') {
      element.setAttribute('aria-selected', 'true');
    }
    const target = getTabTarget(element);
    if (target) {
      const tabContent = target.closest('.tab-content');
      if (tabContent) {
        SelectorEngine.find('.active', tabContent).forEach((pane) => {
          pane.classList.remove(CLASS_NAME_ACTIVE);
        });
      }
      target.classList.add(CLASS_NAME_ACTIVE);
      if (target.classList.contains('fade')) {
        target.classList.add('show');
      }
    }
  }

  _deactivate(element) {
    if (!element) {
      return;
    }
    element.classList.remove(CLASS_NAME_ACTIVE);
    if (element.getAttribute('role') === 'tab') {
      element.setAttribute('aria-selected', 'false');
    }
    const target = getTabTarget(element);
    if (target) {
      target.classList.remove(CLASS_NAME_ACTIVE);
      if (target.classList.contains('fade')) {
        target.classList.remove('show');
      }
    }
  }

  static jQueryInterface(config) {
    return this.each(function eachTab() {
      const data = Tab.getOrCreateInstance(this);
      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      }
    });
  }

  static dataApiClickHandler(event) {
    const innerElem = event.target.closest(SELECTOR_INNER);
    if (!innerElem) {
      return;
    }
    const toggle =
      innerElem.closest(
        '[data-vitrus-toggle="tab"], [data-vitrus-toggle="pill"], [data-vitrus-toggle="list"]',
      ) || innerElem;
    const toggleType = toggle.getAttribute('data-vitrus-toggle');
    if (
      toggleType === 'tab' ||
      toggleType === 'pill' ||
      toggleType === 'list' ||
      innerElem.getAttribute('role') === 'tab'
    ) {
      event.preventDefault();
    }
    Tab.getOrCreateInstance(toggle.matches(SELECTOR_INNER) ? toggle : innerElem).show();
  }

  static dataApiKeydownHandler(event) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const innerElem = event.target.closest(SELECTOR_INNER);
    if (!innerElem) {
      return;
    }
    const listElement = innerElem.closest('.nav, .list-group');
    if (!listElement) {
      return;
    }
    const items = SelectorEngine.find(SELECTOR_INNER, listElement).filter(isVisible);
    let index = items.indexOf(innerElem);
    if (event.key === 'Home') {
      index = 0;
    }
    if (event.key === 'End') {
      index = items.length - 1;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      index = index <= 0 ? items.length - 1 : index - 1;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      index = index >= items.length - 1 ? 0 : index + 1;
    }
    items[index]?.focus();
    Tab.getOrCreateInstance(items[index]).show();
  }
}

EventHandler.on(document, 'click', Tab.dataApiClickHandler);
EventHandler.on(document, 'keydown', SELECTOR_INNER, Tab.dataApiKeydownHandler);

export default Tab;
