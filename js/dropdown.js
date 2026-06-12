import { createPopper } from '@popperjs/core';
import BaseComponent from './base-component.js';
import EventHandler from './dom/event-handler.js';
import SelectorEngine from './dom/selector-engine.js';
import { isVisible } from './util/index.js';

const NAME = 'dropdown';
const DATA_KEY = 'vitrus.dropdown';
const EVENT_KEY = `.${DATA_KEY}`;
const EVENT_SHOW = `show${EVENT_KEY}`;
const EVENT_SHOWN = `shown${EVENT_KEY}`;
const EVENT_HIDE = `hide${EVENT_KEY}`;
const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
const EVENT_CLICK = 'click';
const EVENT_KEYDOWN = 'keydown';
const CLASS_NAME_SHOW = 'show';
const SELECTOR_MENU = '.dropdown-menu';
const SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';

const Default = {
  autoClose: true,
  boundary: 'clippingParents',
  display: 'dynamic',
  offset: [0, 2],
  popperConfig: null,
  reference: 'toggle',
};

class Dropdown extends BaseComponent {
  constructor(element, config) {
    super(element);
    this._popper = null;
    this._parent = this._element.parentNode;
    this._menu = SelectorEngine.findOne(SELECTOR_MENU, this._parent);
    this._inNavbar = this._detectNavbar();
    this._config = this._getConfig(config);
  }

  static get Default() {
    return Default;
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
    if (this._isShown() || !isVisible(this._element)) {
      return;
    }
    if (!EventHandler.trigger(this._element, EVENT_SHOW).defaultPrevented) {
      this._createPopper();
      if ('ontouchstart' in document.documentElement && !this._parent.closest('.navbar-nav')) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, 'mouseover', () => {});
        }
      }
      this._element.focus();
      this._element.setAttribute('aria-expanded', 'true');
      this._menu.classList.add(CLASS_NAME_SHOW);
      this._menu.setAttribute('data-vitrus-popper', 'static');
      EventHandler.trigger(this._element, EVENT_SHOWN);
    }
  }

  hide() {
    if (!this._isShown()) {
      return;
    }
    if (!EventHandler.trigger(this._element, EVENT_HIDE).defaultPrevented) {
      this._popper?.destroy();
      this._popper = null;
      this._menu.classList.remove(CLASS_NAME_SHOW);
      this._element.setAttribute('aria-expanded', 'false');
      this._menu.removeAttribute('data-vitrus-popper');
      EventHandler.trigger(this._element, EVENT_HIDDEN);
    }
  }

  dispose() {
    this.hide();
    super.dispose();
  }

  update() {
    this._popper?.update();
  }

  _getConfig(config) {
    config = { ...Default, ...Dropdown.Default, ...config };
    return config;
  }

  _createPopper() {
    if (this._popper) {
      this._popper.destroy();
    }
    const referenceElement = this._getReferenceElement();
    const popperConfig = this._getPopperConfig();
    this._popper = createPopper(referenceElement, this._menu, popperConfig);
  }

  _getPopperConfig() {
    const defaultBsPopperConfig = {
      placement: this._getPlacement(),
      modifiers: [
        {
          name: 'preventOverflow',
          options: { boundary: this._config.boundary },
        },
        {
          name: 'offset',
          options: { offset: this._config.offset },
        },
      ],
    };
    if (this._config.popperConfig) {
      return { ...defaultBsPopperConfig, ...this._config.popperConfig };
    }
    return defaultBsPopperConfig;
  }

  _getPlacement() {
    const parentDropdown = this._parent;
    if (parentDropdown.classList.contains('dropend')) {
      return 'right-start';
    }
    if (parentDropdown.classList.contains('dropstart')) {
      return 'left-start';
    }
    if (parentDropdown.classList.contains('dropup')) {
      return 'top-start';
    }
    return 'bottom-start';
  }

  _getReferenceElement() {
    if (this._config.reference === 'parent') {
      return this._parent;
    }
    return this._element;
  }

  _isShown() {
    return this._menu.classList.contains(CLASS_NAME_SHOW);
  }

  _detectNavbar() {
    return this._element.closest('.navbar') !== null;
  }

  static jQueryInterface(config) {
    return this.each(function eachDropdown() {
      const data = Dropdown.getOrCreateInstance(this, config);
      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      }
    });
  }

  static clearMenus(event) {
    if (event.button === 2 || event.type === 'keyup' && event.key !== 'Tab') {
      return;
    }
    const openToggles = SelectorEngine.find('[data-vitrus-toggle="dropdown"][aria-expanded="true"]');
    for (const toggle of openToggles) {
      const context = Dropdown.getInstance(toggle);
      if (!context || context._config.autoClose === false) {
        continue;
      }
      const composedPath = event.composedPath();
      const isMenuTarget = composedPath.includes(context._menu);
      if (
        event.composedPath().includes(context._element) ||
        (context._config.autoClose === 'inside' && isMenuTarget) ||
        (context._config.autoClose === 'outside' && !isMenuTarget)
      ) {
        continue;
      }
      context.hide();
    }
  }

  static dataApiKeydownHandler(event) {
    const isInput = /input|textarea/i.test(event.target.tagName);
    const isEscape = event.key === 'Escape';
    const isUpOrDown = event.key === 'ArrowUp' || event.key === 'ArrowDown';
    if ((!isUpOrDown && !isEscape) || isInput) {
      return;
    }
    event.preventDefault();
    const toggle = event.target.closest('[data-vitrus-toggle="dropdown"]');
    const instance = Dropdown.getOrCreateInstance(toggle);
    if (isEscape) {
      instance.hide();
      toggle.focus();
      return;
    }
    if (!instance._isShown()) {
      instance.show();
      event.target.focus();
      return;
    }
    const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, instance._menu);
    const index = items.indexOf(event.target);
    if (event.key === 'ArrowUp' && index > 0) {
      items[index - 1].focus();
    }
    if (event.key === 'ArrowDown' && index < items.length - 1) {
      items[index + 1].focus();
    }
  }
}

EventHandler.on(document, EVENT_CLICK, Dropdown.clearMenus);
EventHandler.on(document, 'keyup', Dropdown.clearMenus);
EventHandler.on(document, EVENT_KEYDOWN, '[data-vitrus-toggle="dropdown"]', Dropdown.dataApiKeydownHandler);
EventHandler.on(document, EVENT_CLICK, (event) => {
  const toggle = event.target.closest('[data-vitrus-toggle="dropdown"]');
  if (!toggle) {
    return;
  }
  event.preventDefault();
  Dropdown.getOrCreateInstance(toggle).toggle();
});

export default Dropdown;
