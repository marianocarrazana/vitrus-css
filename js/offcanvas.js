import BaseComponent from './base-component.js';
import EventHandler from './dom/event-handler.js';
import SelectorEngine from './dom/selector-engine.js';
import Backdrop from './util/backdrop.js';
import FocusTrap from './util/focustrap.js';
import ScrollBarHelper from './util/scrollbar.js';
import { getElementFromSelector, reflow } from './util/index.js';

const NAME = 'offcanvas';
const DATA_KEY = 'vitrus.offcanvas';
const EVENT_KEY = `.${DATA_KEY}`;
const EVENT_SHOW = `show${EVENT_KEY}`;
const EVENT_SHOWN = `shown${EVENT_KEY}`;
const EVENT_HIDE = `hide${EVENT_KEY}`;
const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY}`;
const CLASS_NAME_SHOW = 'show';
const CLASS_NAME_BACKDROP = 'offcanvas-backdrop';
const OPEN_SELECTOR = '.offcanvas.show';
const SELECTOR_DATA_TOGGLE = '[data-vitrus-toggle="offcanvas"]';

const Default = {
  backdrop: true,
  keyboard: true,
  scroll: false,
};

class Offcanvas extends BaseComponent {
  constructor(element, config) {
    super(element);
    this._config = this._getConfig(config);
    this._isShown = false;
    this._backdrop = this._initializeBackDrop();
    this._focustrap = new FocusTrap({ trapElement: this._element });
    this._scrollBar = new ScrollBarHelper();
    this._addEventListeners();
  }

  static get Default() {
    return Default;
  }

  static get NAME() {
    return NAME;
  }

  toggle(relatedTarget) {
    if (this._isShown) {
      this.hide();
    } else {
      this.show(relatedTarget);
    }
  }

  show(relatedTarget) {
    if (this._isShown) {
      return;
    }
    if (!EventHandler.trigger(this._element, EVENT_SHOW, { relatedTarget }).defaultPrevented) {
      this._isShown = true;
      this._element.classList.add(CLASS_NAME_SHOW);
      this._element.setAttribute('aria-modal', 'true');
      this._element.setAttribute('role', 'dialog');
      if (!this._config.scroll) {
        this._scrollBar.hide();
      }
      reflow(this._element);
      this._element.style.visibility = 'visible';
      this._backdrop.show(() => {
        this._focustrap.activate();
        EventHandler.trigger(this._element, EVENT_SHOWN, { relatedTarget });
      });
    }
  }

  hide() {
    if (!this._isShown) {
      return;
    }
    if (!EventHandler.trigger(this._element, EVENT_HIDE).defaultPrevented) {
      this._focustrap.deactivate();
      this._element.blur();
      this._isShown = false;
      this._element.classList.remove(CLASS_NAME_SHOW);
      this._backdrop.hide(() => {
        this._element.setAttribute('aria-hidden', 'true');
        this._element.removeAttribute('aria-modal');
        this._element.removeAttribute('role');
        this._element.style.visibility = 'hidden';
        if (!this._config.scroll) {
          this._scrollBar.reset();
        }
        EventHandler.trigger(this._element, EVENT_HIDDEN);
      });
    }
  }

  dispose() {
    this._backdrop.dispose();
    this._focustrap.deactivate();
    super.dispose();
  }

  _getConfig(config) {
    config = { ...Default, ...Offcanvas.Default, ...config };
    return config;
  }

  _initializeBackDrop() {
    const clickCallback = () => {
      if (this._config.backdrop === 'static') {
        EventHandler.trigger(this._element, EVENT_HIDE);
        return;
      }
      this.hide();
    };
    return new Backdrop({
      className: CLASS_NAME_BACKDROP,
      isVisible: Boolean(this._config.backdrop),
      isAnimated: true,
      rootElement: document.body,
      clickCallback,
    });
  }

  _addEventListeners() {
    EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, (event) => {
      if (event.key === 'Escape' && this._config.keyboard) {
        this.hide();
      }
    });
  }

  static jQueryInterface(config, relatedTarget) {
    return this.each(function eachOffcanvas() {
      const data = Offcanvas.getOrCreateInstance(this, config);
      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](relatedTarget);
      }
    });
  }

  static dataApiClickHandler(event) {
    const toggle = event.delegateTarget ?? event.target.closest(SELECTOR_DATA_TOGGLE);
    if (!toggle) {
      return;
    }
    const target = getElementFromSelector(toggle);
    if (toggle.tagName === 'A' || toggle.tagName === 'AREA') {
      event.preventDefault();
    }
    if (!target) {
      return;
    }
    Offcanvas.getOrCreateInstance(target).toggle(toggle);
  }
}

EventHandler.on(document, 'click', SELECTOR_DATA_TOGGLE, Offcanvas.dataApiClickHandler);

EventHandler.on(document, 'click', (event) => {
  const trigger = event.target.closest('[data-vitrus-dismiss="offcanvas"]');
  if (!trigger) {
    return;
  }
  const offcanvas = trigger.closest('.offcanvas');
  if (!offcanvas) {
    return;
  }
  Offcanvas.getOrCreateInstance(offcanvas).hide();
});

for (const element of SelectorEngine.find(OPEN_SELECTOR)) {
  Offcanvas.getOrCreateInstance(element);
}

export default Offcanvas;
