const namespaceRegex = /[^.]*(?=\..*)/;

function getTypeEvent(event) {
  return event.replace(namespaceRegex, '');
}

function getNamespaceEvent(event) {
  return event.match(namespaceRegex)?.[0] ?? '';
}

function bootstrapHandler(element, fn) {
  return function handler(event) {
    if (event.delegateTarget !== element) {
      return;
    }
    handler.oneOff = handler.oneOff || event.oneOff;
    if (handler.oneOff) {
      EventHandler.off(element, event.type, fn);
    }
    return fn.apply(element, [event]);
  };
}

function bootstrapDelegationHandler(element, selector, fn) {
  return function handler(event) {
    const domElements = element.querySelectorAll(selector);
    let { target } = event;
    while (target && target !== element) {
      for (const domElement of domElements) {
        if (domElement === target) {
          event.delegateTarget = target;
          if (handler.oneOff) {
            EventHandler.off(element, event.type, selector, fn);
          }
          return fn.apply(target, [event]);
        }
      }
      target = target.parentNode;
    }
  };
}

function findHandler(events, callable, delegationSelector = null) {
  return events.find((event) => {
    return (
      event.callable === callable &&
      event.delegationSelector === delegationSelector
    );
  });
}

function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
  const isDelegated = typeof handler === 'string';
  const callable = isDelegated ? delegationFunction : handler;
  let typeEvent = getTypeEvent(originalTypeEvent);
  if (!isDelegated) {
    typeEvent = originalTypeEvent;
  }
  return [isDelegated, callable, typeEvent];
}

function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
  const [isDelegated, callable, typeEvent] = normalizeParameters(
    originalTypeEvent,
    handler,
    delegationFunction,
  );
  if (!callable) {
    return;
  }
  const events = getElementEvents(element);
  const handlerKey = isDelegated
    ? bootstrapDelegationHandler(element, handler, callable)
    : bootstrapHandler(element, callable);
  handlerKey.oneOff = oneOff;
  handlerKey.delegationSelector = isDelegated ? handler : null;
  handlerKey.callable = callable;
  handlerKey.originalTypeEvent = originalTypeEvent;
  events.push(handlerKey);
  element.addEventListener(typeEvent, handlerKey, false);
}

function removeHandler(element, events, typeEvent, handler, delegationSelector) {
  const fn = findHandler(events, handler, delegationSelector);
  if (!fn) {
    return;
  }
  element.removeEventListener(getTypeEvent(fn.originalTypeEvent), fn, false);
  events.splice(events.indexOf(fn), 1);
}

function getElementEvents(element) {
  if (!element.vitrusEventRegistry) {
    element.vitrusEventRegistry = {};
  }
  return element.vitrusEventRegistry;
}

const EventHandler = {
  on(element, event, handler, delegationFunction) {
    addHandler(element, event, handler, delegationFunction, false);
  },

  one(element, event, handler, delegationFunction) {
    addHandler(element, event, handler, delegationFunction, true);
  },

  off(element, originalTypeEvent, handler, delegationFunction) {
    const events = getElementEvents(element);
    const typeEvent = getTypeEvent(originalTypeEvent);
    const namespace = getNamespaceEvent(originalTypeEvent);
    for (const event of events.slice()) {
      if (
        event.originalTypeEvent === originalTypeEvent ||
        (typeEvent && typeEvent !== event.originalTypeEvent) ||
        (namespace && namespace !== event.namespace)
      ) {
        continue;
      }
      removeHandler(
        element,
        events,
        event.originalTypeEvent,
        event.callable,
        event.delegationSelector,
      );
    }
    if (typeof handler === 'string') {
      removeHandler(element, events, originalTypeEvent, delegationFunction, handler);
    } else if (handler) {
      removeHandler(element, events, originalTypeEvent, handler, null);
    }
  },

  trigger(element, event, args) {
    if (typeof event !== 'string' || !event) {
      return null;
    }
    const typeEvent = getTypeEvent(event);
    const inNamespace = event !== typeEvent;
    let defaultPrevented = false;
    const evt = new Event(event, { bubbles: true, cancelable: true });
    evt.preventDefault = function preventDefault() {
      defaultPrevented = true;
      Event.prototype.preventDefault.call(this);
    };
    if (args) {
      for (const [key, value] of Object.entries(args)) {
        Object.defineProperty(evt, key, { value, configurable: true });
      }
    }
    element.dispatchEvent(evt);
    if (inNamespace) {
      const namespaceEvent = new Event(typeEvent, { bubbles: true, cancelable: true });
      element.dispatchEvent(namespaceEvent);
    }
    return !defaultPrevented;
  },
};

export default EventHandler;
