const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top';
const SELECTOR_STICKY_CONTENT = '.sticky-top';
const PROPERTY_PADDING = 'padding-right';
const PROPERTY_MARGIN = 'margin-right';

class ScrollBarHelper {
  getWidth() {
    const documentWidth = document.documentElement.clientWidth;
    return Math.abs(window.innerWidth - documentWidth);
  }

  hide() {
    const width = this.getWidth();
    this._disableOverFlow();
    this._setElementAttributes(this._getElement(), PROPERTY_PADDING, (calculatedWidth) => calculatedWidth + width);
    this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, (calculatedWidth) => calculatedWidth + width);
    this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, (calculatedWidth) => calculatedWidth - width);
  }

  reset() {
    this._resetElementAttributes(this._getElement(), PROPERTY_PADDING);
    this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
    this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
    this._resetOverflow();
  }

  isOverflowing() {
    return this.getWidth() > 0;
  }

  _disableOverFlow() {
    this._saveInitialAttribute(this._getElement(), 'overflow');
    this._getElement().style.overflow = 'hidden';
  }

  _resetOverflow() {
    this._resetElementAttributes(this._getElement(), 'overflow');
  }

  _getElement() {
    return document.body;
  }

  _setElementAttributes(selector, styleProperty, callback) {
    const scrollbarWidth = this.getWidth();
    const manipulationCallBack = (element) => {
      if (element !== this._getElement() && window.innerWidth > element.clientWidth + scrollbarWidth) {
        return;
      }
      this._saveInitialAttribute(element, styleProperty);
      const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
      element.style.setProperty(
        styleProperty,
        `${callback(Number.parseFloat(calculatedValue))}px`,
      );
    };
    this._applyManipulationCallback(selector, manipulationCallBack);
  }

  _saveInitialAttribute(element, styleProperty) {
    const actualValue = element.style.getPropertyValue(styleProperty);
    if (actualValue) {
      element.setAttribute(`data-vitrus-${styleProperty}`, actualValue);
    }
  }

  _resetElementAttributes(selector, styleProperty) {
    const manipulationCallBack = (element) => {
      const value = element.getAttribute(`data-vitrus-${styleProperty}`);
      if (!value) {
        element.style.removeProperty(styleProperty);
        return;
      }
      element.removeAttribute(`data-vitrus-${styleProperty}`);
      element.style.setProperty(styleProperty, value);
    };
    this._applyManipulationCallback(selector, manipulationCallBack);
  }

  _applyManipulationCallback(selector, callBack) {
    if (typeof selector === 'string') {
      document.querySelectorAll(selector).forEach(callBack);
      return;
    }
    callBack(selector);
  }
}

export default ScrollBarHelper;
