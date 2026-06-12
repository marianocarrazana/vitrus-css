import BaseComponent from './base-component.js';
import EventHandler from './dom/event-handler.js';

const NAME = 'alert';
const DATA_KEY = 'vitrus.alert';
const EVENT_KEY = `.${DATA_KEY}`;
const EVENT_CLOSE = `close${EVENT_KEY}`;
const EVENT_CLOSED = `closed${EVENT_KEY}`;
const CLASS_NAME_FADE = 'fade';
const CLASS_NAME_SHOW = 'show';

class Alert extends BaseComponent {
  static get NAME() {
    return NAME;
  }

  close() {
    if (!EventHandler.trigger(this._element, EVENT_CLOSE)) {
      return;
    }
    this._element.classList.remove(CLASS_NAME_SHOW);
    const isAnimated = this._element.classList.contains(CLASS_NAME_FADE);
    this._queueCallback(
      () => this._destroyElement(),
      this._element,
      isAnimated,
    );
  }

  _destroyElement() {
    this._element.remove();
    EventHandler.trigger(this._element, EVENT_CLOSED);
    this.dispose();
  }

  static jQueryInterface(config) {
    return this.each(function eachAlert() {
      const data = Alert.getOrCreateInstance(this);
      if (config === 'close') {
        data[config]();
      }
    });
  }

  static dataApiClickHandler(event) {
    const target = getElementFromDismissTrigger(event.target);
    if (!target) {
      return;
    }
    const alert = Alert.getOrCreateInstance(target);
    alert.close();
  }
}

function getElementFromDismissTrigger(trigger) {
  if (!trigger || !trigger.getAttribute) {
    return null;
  }
  const dismiss = trigger.getAttribute('data-vitrus-dismiss');
  if (dismiss !== 'alert') {
    return null;
  }
  return trigger.closest('.alert');
}

EventHandler.on(document, 'click', Alert.dataApiClickHandler, '[data-vitrus-dismiss="alert"]');

export default Alert;
