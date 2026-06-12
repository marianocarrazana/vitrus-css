import EventHandler from '../dom/event-handler.js';
import { executeAfterTransition, getElement } from './index.js';

const CLASS_NAME_BACKDROP = 'modal-backdrop';
const CLASS_NAME_FADE = 'fade';
const CLASS_NAME_SHOW = 'show';
const EVENT_CLICK = 'click';

const Default = {
  className: CLASS_NAME_BACKDROP,
  isVisible: true,
  isAnimated: false,
  rootElement: 'body',
  clickCallback: null,
};

const DefaultType = {
  className: 'string',
  isVisible: 'boolean',
  isAnimated: 'boolean',
  rootElement: '(element|string)',
  clickCallback: '(function|null)',
};

class Backdrop {
  constructor(config) {
    this._config = this._getConfig(config);
    this._isAppended = false;
    this._element = null;
  }

  show(callback) {
    if (!this._config.isVisible) {
      executeAfterTransition(callback);
      return;
    }
    this._append();
    if (this._config.isAnimated) {
      reflow(this._element);
    }
    this._element.classList.add(CLASS_NAME_SHOW);
    this._emulateAnimation(() => {
      executeAfterTransition(callback);
    });
  }

  hide(callback) {
    if (!this._config.isVisible) {
      executeAfterTransition(callback);
      return;
    }
    this._getElement().classList.remove(CLASS_NAME_SHOW);
    this._emulateAnimation(() => {
      this.dispose();
      executeAfterTransition(callback);
    });
  }

  dispose() {
    if (!this._isAppended) {
      return;
    }
    EventHandler.off(this._element, EVENT_CLICK);
    this._element.remove();
    this._isAppended = false;
    this._element = null;
  }

  _getElement() {
    if (!this._element) {
      const backdrop = document.createElement('div');
      backdrop.className = this._config.className;
      if (this._config.isAnimated) {
        backdrop.classList.add(CLASS_NAME_FADE);
      }
      this._element = backdrop;
    }
    return this._element;
  }

  _configAfterMerge(config) {
    config.rootElement = getElement(config.rootElement);
    return config;
  }

  _append() {
    if (this._isAppended) {
      return;
    }
    const element = this._getElement();
    this._config.rootElement.append(element);
    EventHandler.on(element, EVENT_CLICK, () => {
      executeAfterTransition(this._config.clickCallback);
    });
    this._isAppended = true;
  }

  _emulateAnimation(callback) {
    executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
  }

  _getConfig(config) {
    config = { ...Default, ...config };
    return this._configAfterMerge(config);
  }

  static get Default() {
    return Default;
  }

  static get DefaultType() {
    return DefaultType;
  }
}

function reflow(element) {
  element.offsetHeight;
}

export default Backdrop;
