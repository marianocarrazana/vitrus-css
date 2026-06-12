import { createPopper } from '@popperjs/core';
import BaseComponent from './base-component.js';
import EventHandler from './dom/event-handler.js';
import TemplateFactory from './util/template-factory.js';
import { getElement } from './util/index.js';

const NAME = 'tooltip';
const EVENT_KEY = `.vitrus.${NAME}`;
const EVENT_SHOW = `show${EVENT_KEY}`;
const EVENT_SHOWN = `shown${EVENT_KEY}`;
const EVENT_HIDE = `hide${EVENT_KEY}`;
const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
const CLASS_NAME_FADE = 'fade';
const CLASS_NAME_SHOW = 'show';
const SELECTOR_TOOLTIP_INNER = '.tooltip-inner';

const Default = {
  animation: true,
  container: 'body',
  delay: 0,
  html: false,
  offset: [0, 6],
  placement: 'top',
  title: '',
  trigger: 'hover focus',
  template:
    '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
};

class Tooltip extends BaseComponent {
  constructor(element, config) {
    super(element);
    this._isEnabled = true;
    this._timeout = 0;
    this._popper = null;
    this._tip = null;
    this._activeTrigger = {};
    this._config = this._getConfig(config);
    this._setListeners();
  }

  static get Default() {
    return Default;
  }

  static get NAME() {
    return NAME;
  }

  enable() {
    this._isEnabled = true;
  }

  disable() {
    this._isEnabled = false;
  }

  toggle() {
    if (!this._isEnabled) {
      return;
    }
    if (this._isShown()) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if (!this._isEnabled || !this._getTitle()) {
      return;
    }
    if (EventHandler.trigger(this._element, EVENT_SHOW).defaultPrevented) {
      return;
    }
    this._disposePopper();
    const tip = this._getTipElement();
    this._element.setAttribute('aria-describedby', tip.getAttribute('id'));
    this._config.container.append(tip);
    this._popper = createPopper(this._element, tip, {
      placement: this._config.placement,
      modifiers: [{ name: 'offset', options: { offset: this._config.offset } }],
    });
    const placement = this._config.placement.split('-')[0];
    tip.classList.add(`bs-tooltip-${placement}`, CLASS_NAME_SHOW);
    this._queueCallback(() => EventHandler.trigger(this._element, EVENT_SHOWN), tip, this._config.animation);
  }

  hide() {
    if (!this._isShown()) {
      return;
    }
    if (EventHandler.trigger(this._element, EVENT_HIDE).defaultPrevented) {
      return;
    }
    const tip = this._tip;
    tip.classList.remove(CLASS_NAME_SHOW);
    this._popper?.destroy();
    this._popper = null;
    this._queueCallback(() => {
      this._element.removeAttribute('aria-describedby');
      tip.remove();
      this._tip = null;
      EventHandler.trigger(this._element, EVENT_HIDDEN);
    }, tip, this._config.animation);
  }

  dispose() {
    window.clearTimeout(this._timeout);
    this.hide();
    super.dispose();
  }

  update() {
    this._popper?.update();
  }

  _isShown() {
    return this._tip?.classList.contains(CLASS_NAME_SHOW) ?? false;
  }

  _getTipElement() {
    if (this._tip) {
      return this._tip;
    }
    const content = { [SELECTOR_TOOLTIP_INNER]: this._getTitle() };
    const tip = new TemplateFactory({
      ...this._config,
      content,
    }).toHtml();
    const tipId = `vitrus-tooltip-${Math.floor(Math.random() * 1000000)}`;
    tip.setAttribute('id', tipId);
    if (this._config.animation) {
      tip.classList.add(CLASS_NAME_FADE);
    }
    this._tip = tip;
    return tip;
  }

  _getTitle() {
    return this._config.title || this._element.getAttribute('data-vitrus-title') || this._element.getAttribute('title') || '';
  }

  _getConfig(config) {
    const el = this._element;
    const delay = Number.parseInt(el.getAttribute('data-vitrus-delay'), 10);
    return {
      ...Default,
      title: el.getAttribute('data-vitrus-title') || el.getAttribute('title') || '',
      placement: el.getAttribute('data-vitrus-placement') || Default.placement,
      trigger: el.getAttribute('data-vitrus-trigger') || Default.trigger,
      delay: Number.isNaN(delay) ? Default.delay : delay,
      container: getElement(config?.container) || document.body,
      ...(typeof config === 'object' && config ? config : {}),
    };
  }

  _setListeners() {
    const triggers = this._config.trigger.split(' ');
    for (const trigger of triggers) {
      if (trigger === 'click') {
        EventHandler.on(this._element, 'click', () => this.toggle());
      } else if (trigger === 'hover') {
        EventHandler.on(this._element, 'mouseenter', () => this._enter());
        EventHandler.on(this._element, 'mouseleave', () => this._leave());
      } else if (trigger === 'focus') {
        EventHandler.on(this._element, 'focusin', () => this._enter());
        EventHandler.on(this._element, 'focusout', () => this._leave());
      }
    }
  }

  _enter() {
    window.clearTimeout(this._timeout);
    this._timeout = window.setTimeout(() => this.show(), this._config.delay);
  }

  _leave() {
    window.clearTimeout(this._timeout);
    this._timeout = window.setTimeout(() => this.hide(), this._config.delay);
  }

  _disposePopper() {
    this._popper?.destroy();
    this._popper = null;
    if (this._tip) {
      this._tip.remove();
      this._tip = null;
    }
  }

  static jQueryInterface(config) {
    return this.each(function eachTooltip() {
      const data = Tooltip.getOrCreateInstance(this, config);
      if (typeof config === 'string') {
        data[config]();
      }
    });
  }
}

EventHandler.on(document, 'click', (event) => {
  const toggle = event.target.closest('[data-vitrus-toggle="tooltip"]');
  if (!toggle) {
    return;
  }
  event.preventDefault();
  Tooltip.getOrCreateInstance(toggle).toggle();
});

export default Tooltip;
