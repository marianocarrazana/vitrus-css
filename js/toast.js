import BaseComponent from './base-component.js';
import EventHandler from './dom/event-handler.js';

const NAME = 'toast';
const DATA_KEY = 'vitrus.toast';
const EVENT_KEY = `.${DATA_KEY}`;
const EVENT_SHOW = `show${EVENT_KEY}`;
const EVENT_SHOWN = `shown${EVENT_KEY}`;
const EVENT_HIDE = `hide${EVENT_KEY}`;
const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
const EVENT_CLICK = 'click';
const CLASS_NAME_SHOW = 'show';
const CLASS_NAME_HIDE = 'hide';

const Default = {
  animation: true,
  autohide: true,
  delay: 5000,
};

class Toast extends BaseComponent {
  constructor(element, config) {
    super(element);
    this._config = this._getConfig(config);
    this._timeout = null;
    this._hasMouseInteraction = false;
    this._hasKeyboardInteraction = false;
    this._setListeners();
  }

  static get Default() {
    return Default;
  }

  static get NAME() {
    return NAME;
  }

  show() {
    if (!EventHandler.trigger(this._element, EVENT_SHOW).defaultPrevented) {
      this._clearTimeout();
      this._element.classList.remove(CLASS_NAME_HIDE);
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW);
      this._element.classList.remove(CLASS_NAME_HIDE);
      this._queueCallback(
        () => {
          EventHandler.trigger(this._element, EVENT_SHOWN);
          this._maybeScheduleHide();
        },
        this._element,
        this._config.animation,
      );
    }
  }

  hide() {
    if (!this._element.classList.contains(CLASS_NAME_SHOW)) {
      return;
    }
    if (!EventHandler.trigger(this._element, EVENT_HIDE).defaultPrevented) {
      this._element.classList.add(CLASS_NAME_HIDE);
      this._queueCallback(
        () => {
          this._element.classList.remove(CLASS_NAME_SHOW, CLASS_NAME_HIDE);
          EventHandler.trigger(this._element, EVENT_HIDDEN);
        },
        this._element,
        this._config.animation,
      );
    }
  }

  dispose() {
    this._clearTimeout();
    if (this._element.classList.contains(CLASS_NAME_SHOW)) {
      this._element.classList.remove(CLASS_NAME_SHOW);
    }
    super.dispose();
  }

  _getConfig(config) {
    config = { ...Default, ...Toast.Default, ...config };
    return config;
  }

  _maybeScheduleHide() {
    if (!this._config.autohide) {
      return;
    }
    this._timeout = window.setTimeout(() => {
      if (!this._hasMouseInteraction && !this._hasKeyboardInteraction) {
        this.hide();
      }
    }, this._config.delay);
  }

  _onInteraction(event, isInteracting) {
    switch (event.type) {
      case 'mouseover':
      case 'mouseout':
        this._hasMouseInteraction = isInteracting;
        break;
      case 'focusin':
      case 'focusout':
        this._hasKeyboardInteraction = isInteracting;
        break;
      default:
        break;
    }
    if (!isInteracting) {
      this._maybeScheduleHide();
    }
  }

  _setListeners() {
    EventHandler.on(this._element, EVENT_CLICK, (event) => {
      if (event.target.classList.contains('btn-close')) {
        this.hide();
      }
    });
    EventHandler.on(this._element, 'mouseover', (e) => this._onInteraction(e, true));
    EventHandler.on(this._element, 'mouseout', (e) => this._onInteraction(e, false));
    EventHandler.on(this._element, 'focusin', (e) => this._onInteraction(e, true));
    EventHandler.on(this._element, 'focusout', (e) => this._onInteraction(e, false));
  }

  _clearTimeout() {
    window.clearTimeout(this._timeout);
    this._timeout = null;
  }

  static jQueryInterface(config) {
    return this.each(function eachToast() {
      const data = Toast.getOrCreateInstance(this, config);
      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      }
    });
  }
}

function reflow(element) {
  element.offsetHeight;
}

EventHandler.on(document, 'click', (event) => {
  const trigger = event.target.closest('[data-vitrus-dismiss="toast"]');
  if (!trigger) {
    return;
  }
  const toast = trigger.closest('.toast');
  if (!toast) {
    return;
  }
  Toast.getOrCreateInstance(toast).hide();
});

export default Toast;
