import EventHandler from '../dom/event-handler.js';
import SelectorEngine from '../dom/selector-engine.js';

const DATA_KEY = 'vitrus.focustrap';
const EVENT_KEY = `.${DATA_KEY}`;
const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY}`;

const TAB_KEY = 'Tab';
const TAB_NAV_FORWARD = 'forward';
const TAB_NAV_BACKWARD = 'backward';

const Default = {
  autofocus: true,
};

class FocusTrap {
  constructor(config) {
    this._config = { ...Default, ...config };
    this._isActive = false;
    this._lastTabNavDirection = null;
  }

  activate() {
    if (this._isActive) {
      return;
    }
    if (this._config.autofocus) {
      this._config.trapElement.focus();
    }
    EventHandler.on(document, EVENT_FOCUSIN, (event) => this._handleFocusin(event));
    EventHandler.on(document, EVENT_KEYDOWN_TAB, (event) => this._handleKeydown(event));
    this._isActive = true;
  }

  deactivate() {
    if (!this._isActive) {
      return;
    }
    this._isActive = false;
    EventHandler.off(document, EVENT_KEY);
  }

  _handleFocusin(event) {
    const { trapElement } = this._config;
    if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
      return;
    }
    const focusables = SelectorEngine.find('[tabindex]:not([tabindex="-1"])', trapElement);
    if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
      focusables[0]?.focus();
    } else {
      focusables[focusables.length - 1]?.focus();
    }
  }

  _handleKeydown(event) {
    if (event.key !== TAB_KEY) {
      return;
    }
    this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
  }
}

export default FocusTrap;
