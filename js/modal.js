import BaseComponent from './base-component.js';
import EventHandler from './dom/event-handler.js';
import SelectorEngine from './dom/selector-engine.js';
import Backdrop from './util/backdrop.js';
import FocusTrap from './util/focustrap.js';
import ScrollBarHelper from './util/scrollbar.js';
import {
  executeAfterTransition,
  getElementFromSelector,
  reflow,
} from './util/index.js';

const NAME = 'modal';
const DATA_KEY = 'vitrus.modal';
const EVENT_KEY = `.${DATA_KEY}`;
const EVENT_SHOW = `show${EVENT_KEY}`;
const EVENT_SHOWN = `shown${EVENT_KEY}`;
const EVENT_HIDE = `hide${EVENT_KEY}`;
const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY}`;
const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY}`;
const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY}`;
const CLASS_NAME_OPEN = 'modal-open';
const CLASS_NAME_STATIC = 'modal-static';
const CLASS_NAME_FADE = 'fade';
const CLASS_NAME_SHOW = 'show';
const OPEN_SELECTOR = '.modal.show';
const SELECTOR_DIALOG = '.modal-dialog';
const SELECTOR_MODAL_BODY = '.modal-body';
const SELECTOR_DATA_TOGGLE = '[data-vitrus-toggle="modal"]';

const Default = {
  backdrop: true,
  focus: true,
  keyboard: true,
};

class Modal extends BaseComponent {
  constructor(element, config) {
    super(element);
    this._config = this._getConfig(config);
    this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
    this._backdrop = this._initializeBackDrop();
    this._focustrap = this._initializeFocusTrap();
    this._isShown = false;
    this._isTransitioning = false;
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
    if (this._isShown || this._isTransitioning) {
      return;
    }
    if (!EventHandler.trigger(this._element, EVENT_SHOW, { relatedTarget }).defaultPrevented) {
      this._isShown = true;
      this._isTransitioning = true;
      this._scrollBar.hide();
      document.body.classList.add(CLASS_NAME_OPEN);
      this._adjustDialog();
      this._backdrop.show(() => this._showElement(relatedTarget));
    }
  }

  hide() {
    if (!this._isShown || this._isTransitioning) {
      return;
    }
    if (!EventHandler.trigger(this._element, EVENT_HIDE).defaultPrevented) {
      this._isShown = false;
      this._isTransitioning = true;
      this._focustrap.deactivate();
      this._element.classList.remove(CLASS_NAME_SHOW);
      this._queueCallback(
        () => this._hideModal(),
        this._element,
        this._isAnimated(),
      );
    }
  }

  dispose() {
    this._backdrop.dispose();
    this._focustrap.deactivate();
    super.dispose();
  }

  handleUpdate() {
    this._adjustDialog();
  }

  _getConfig(config) {
    config = { ...Default, ...Modal.Default, ...config };
    return config;
  }

  _initializeBackDrop() {
    return new Backdrop({
      isVisible: Boolean(this._config.backdrop),
      isAnimated: this._isAnimated(),
    });
  }

  _initializeFocusTrap() {
    return new FocusTrap({ trapElement: this._element });
  }

  _showElement(relatedTarget) {
    const isAnimated = this._isAnimated();
    if (!this._element.parentNode) {
      document.body.append(this._element);
    }
    this._element.style.display = 'block';
    this._element.removeAttribute('aria-hidden');
    this._element.setAttribute('aria-modal', 'true');
    this._element.setAttribute('role', 'dialog');
    this._element.scrollTop = 0;
    const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._element);
    if (modalBody) {
      modalBody.scrollTop = 0;
    }
    reflow(this._element);
    this._element.classList.add(CLASS_NAME_SHOW);
    if (this._config.focus) {
      this._focustrap.activate();
    }
    this._queueCallback(
      () => {
        this._isTransitioning = false;
        EventHandler.trigger(this._element, EVENT_SHOWN, { relatedTarget });
      },
      this._element,
      isAnimated,
    );
  }

  _addEventListeners() {
    EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, (event) => {
      if (event.key === 'Escape' && this._config.keyboard) {
        event.preventDefault();
        this.hide();
      }
    });
    EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, (event) => {
      EventHandler.one(this._element, EVENT_CLICK_DISMISS, (event2) => {
        if (this._element !== event.target || this._element !== event2.target) {
          return;
        }
        if (this._config.backdrop === 'static') {
          this._triggerBackdropTransition();
          return;
        }
        if (this._config.backdrop) {
          this.hide();
        }
      });
    });
  }

  _hideModal() {
    this._element.style.display = 'none';
    this._element.setAttribute('aria-hidden', 'true');
    this._element.removeAttribute('aria-modal');
    this._element.removeAttribute('role');
    this._isTransitioning = false;
    this._backdrop.hide(() => {
      document.body.classList.remove(CLASS_NAME_OPEN);
      this._resetAdjustments();
      this._scrollBar.reset();
      EventHandler.trigger(this._element, EVENT_HIDDEN);
    });
  }

  _isAnimated() {
    return this._element.classList.contains(CLASS_NAME_FADE);
  }

  _triggerBackdropTransition() {
    EventHandler.trigger(this._element, EVENT_HIDE);
    const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
    const initialOverflowY = this._element.style.overflowY;
    if (!isModalOverflowing) {
      this._element.style.overflowY = 'hidden';
    }
    this._element.classList.add(CLASS_NAME_STATIC);
    this._queueCallback(() => {
      this._element.classList.remove(CLASS_NAME_STATIC);
      if (!isModalOverflowing) {
        executeAfterTransition(() => {
          this._element.style.overflowY = initialOverflowY;
        }, this._dialog);
      }
    }, this._dialog);
  }

  _adjustDialog() {
    const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
    const scrollbarWidth = this._scrollBar.getWidth();
    const isBodyOverflowing = scrollbarWidth > 0;
    if (isBodyOverflowing && !isModalOverflowing) {
      const property = 'padding-right';
      this._element.style[property] = `${scrollbarWidth}px`;
    }
    if (!isBodyOverflowing && isModalOverflowing) {
      this._element.style.paddingLeft = `${scrollbarWidth}px`;
    }
  }

  _resetAdjustments() {
    this._element.style.paddingLeft = '';
    this._element.style.paddingRight = '';
  }

  static jQueryInterface(config, relatedTarget) {
    return this.each(function eachModal() {
      const data = Modal.getOrCreateInstance(this, config);
      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](relatedTarget);
      }
    });
  }

  static dataApiClickHandler(event) {
    const target = getElementFromSelector(event.target);
    if (event.target.tagName === 'A' || event.target.tagName === 'AREA') {
      event.preventDefault();
    }
    if (!target) {
      return;
    }
    const modal = Modal.getOrCreateInstance(target);
    modal.toggle();
  }
}

EventHandler.on(document, 'click', SELECTOR_DATA_TOGGLE, Modal.dataApiClickHandler);
EventHandler.on(window, 'resize', () => {
  for (const element of SelectorEngine.find(OPEN_SELECTOR)) {
    Modal.getOrCreateInstance(element).handleUpdate();
  }
});

function getDismissTrigger(element) {
  if (!element?.getAttribute) {
    return null;
  }
  if (element.getAttribute('data-vitrus-dismiss') !== 'modal') {
    return null;
  }
  return element.closest('.modal');
}

EventHandler.on(document, 'click', (event) => {
  const modal = getDismissTrigger(event.target);
  if (!modal) {
    return;
  }
  const instance = Modal.getInstance(modal);
  instance?.hide();
});

export default Modal;
