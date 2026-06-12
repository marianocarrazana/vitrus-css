import { sanitizeHtml, DefaultAllowlist } from './sanitizer.js';

const NAME = 'TemplateFactory';

const Default = {
  allowList: DefaultAllowlist,
  content: {},
  extraClass: '',
  html: false,
  sanitize: true,
  sanitizeFn: null,
  template: '<div></div>',
};

class TemplateFactory {
  constructor(config) {
    this._config = this._getConfig(config);
  }

  getContent() {
    return Object.values(this._config.content)
      .map((content) => this._resolvePossibleFunction(content))
      .filter(Boolean);
  }

  hasContent() {
    return this.getContent().length > 0;
  }

  changeContent(content) {
    this._checkContent(content);
    this._config.content = { ...this._config.content, ...content };
  }

  toHtml() {
    const templateWrapper = document.createElement('div');
    templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
    for (const [selector, text] of Object.entries(this._config.content)) {
      this._setContent(templateWrapper, text, selector);
    }
    return templateWrapper.children[0];
  }

  _getConfig(config) {
    this._config = { ...Default, ...config };
    return this._config;
  }

  _maybeSanitize(arg) {
    return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
  }

  _resolvePossibleFunction(arg) {
    return typeof arg === 'function' ? arg() : arg;
  }

  _setContent(template, content, selector) {
    const templateElement = template.querySelector(selector);
    if (!templateElement) {
      return;
    }
    content = this._resolvePossibleFunction(content);
    if (!content) {
      templateElement.remove();
      return;
    }
    if (this._config.html) {
      templateElement.innerHTML = this._maybeSanitize(content);
      return;
    }
    templateElement.textContent = content;
  }

  _checkContent(arg) {
    for (const [selector, content] of Object.entries(arg)) {
      this._checkContentSelector(selector);
      this._checkContentObject(content);
    }
  }

  _checkContentSelector(selector) {
    if (!selector) {
      throw new Error(`${NAME}: content selector is required`);
    }
  }

  _checkContentObject(content) {
    if (content === null || typeof content === 'undefined') {
      throw new Error(`${NAME}: content object requires a title and/or content`);
    }
  }
}

export default TemplateFactory;
