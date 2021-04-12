import { useContext, createContext } from 'react';
import { jsx } from 'react/jsx-runtime';

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/** returns a list of properties used by the given accessor function */
function trace(accessorFn) {
  var result = []; // shoutout to <https://github.com/kjleitz/black-hole-object>

  var proxy = new Proxy({}, {
    get: function get(_, prop, receiver) {
      result.push(prop);
      return receiver;
    }
  });
  if (accessorFn) accessorFn(proxy);
  return result;
}

function clone(obj) {
  if (obj === null) return obj;
  if (Array.isArray(obj)) return _toConsumableArray(obj);
  if (_typeof(obj) === 'object') return _objectSpread2({}, obj);
  throw new Error("".concat(_typeof(obj), " is not a supported type"));
}
/** locates a property on source and replaces it with the supplied value */


function apply(source, locatorFn, value) {
  if (!locatorFn) return value;
  var path = trace(locatorFn); // full replacement if there's no locator or it returns the source itself

  if (!path.length) return value;
  var tail = path.pop();
  var result = clone(source);
  var subResult = result; // clone each node along the path down to the target

  path.forEach(function (prop) {
    subResult[prop] = clone(subResult[prop]);
    subResult = subResult[prop];
  }); // return the entire original object if the targeted prop already matches value

  if (subResult[tail] === value) return source;
  subResult[tail] = value;
  return result;
}
/** creates an apply function that can be passed to setState */

function partialApply(locatorFn, valueFn) {
  return function (source) {
    var scoped = locatorFn(source);
    var value = valueFn(scoped);
    return apply(source, locatorFn, value);
  };
}

var ScopeContext = /*#__PURE__*/createContext();
function Scope(_ref) {
  var value = _ref.value,
      setValue = _ref.setValue,
      children = _ref.children;
  return /*#__PURE__*/jsx(ScopeContext.Provider, {
    value: {
      value: value,
      setValue: setValue
    },
    children: children
  });
}
function useScopedValue(selectorFn) {
  var _useContext = useContext(ScopeContext),
      value = _useContext.value,
      setValue = _useContext.setValue;

  var partial = selectorFn ? selectorFn(value) : value;

  function setPartial(valueOrFn) {
    if (typeof valueOrFn === 'function') {
      setValue(partialApply(selectorFn, valueOrFn));
    } else {
      setValue(apply(value, selectorFn, valueOrFn));
    }
  }

  return [partial, setPartial];
}

export { Scope, useScopedValue };
