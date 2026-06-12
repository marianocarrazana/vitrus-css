import Tooltip from './tooltip.js';
import EventHandler from './dom/event-handler.js';
import TemplateFactory from './util/template-factory.js';

const NAME = 'popover';
const SELECTOR_TITLE = '.popover-header';
const SELECTOR_CONTENT = '.popover-body';

const Default = {
  ...Tooltip.Default,
  content: '',
  offset: [0, 8],
  placement: 'right',
  template:
    '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
  trigger: 'click',
};

class Popover extends Tooltip {
  static get Default() {
    return Default;
  }

  static get NAME() {
    return NAME;
  }

  _getTipElement() {
    if (this._tip) {
      return this._tip;
    }
    const content = {
      [SELECTOR_TITLE]: this._getTitle(),
      [SELECTOR_CONTENT]: this._getContent(),
    };
    const tip = new TemplateFactory({
      ...this._config,
      content,
    }).toHtml();
    const tipId = `vitrus-popover-${Math.floor(Math.random() * 1000000)}`;
    tip.setAttribute('id', tipId);
    if (this._config.animation) {
      tip.classList.add('fade');
    }
    this._tip = tip;
    return tip;
  }

  _getContent() {
    return (
      this._config.content ||
      this._element.getAttribute('data-vitrus-content') ||
      ''
    );
  }

  show() {
    if (!this._isEnabled || (!this._getTitle() && !this._getContent())) {
      return;
    }
    super.show();
  }

  _getConfig(config) {
    const base = {
      ...Tooltip.Default,
      title: this._element.getAttribute('data-vitrus-title') || this._element.getAttribute('title') || '',
      content: this._element.getAttribute('data-vitrus-content') || '',
      placement: this._element.getAttribute('data-vitrus-placement') || Default.placement,
      trigger: this._element.getAttribute('data-vitrus-trigger') || Default.trigger,
      container: document.body,
      ...(typeof config === 'object' && config ? config : {}),
    };
    return base;
  }
}

EventHandler.on(document, 'click', (event) => {
  const toggle = event.target.closest('[data-vitrus-toggle="popover"]');
  if (!toggle) {
    return;
  }
  event.preventDefault();
  Popover.getOrCreateInstance(toggle).toggle();
});

export default Popover;
