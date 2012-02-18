var tddjs = (function () {
  function namespace(string) {
    var object = this;
    var levels = string.split(".");

    for(var i = 0, l = levels.length; i < l; i++) {
      if(typeof object[levels[i]] == "undefined") {
        object[levels[i]] = {};
      }

      object = object[levels[i]];
    }

    return object;
  }

  return {
    namespace: namespace
  };
}());

(function () {
  var id = 0;

  function uid(object) {
    if(typeof object.__uid != "number") {
      object.__uid = id++;
    }

    return object.__uid;
  }

  if(typeof tddjs == "object") {
    tddjs.uid = uid;
  }
}());

(function () {
  function iterator(collection) {
    var index = 0;
    var length = collection.length;

    function next() {
      var item = collection[index++];
      next.hasNext = index < length;
      return item;
    }

    next.hasNext = index < length;

    return next;
  }

  if(typeof tddjs == "object") {
    tddjs.iterator = iterator;
  }
}());

tddjs.isOwnProperty = (function() {
  var hasOwn = Object.prototype.hasOwnProperty;

  if(typeof hasOwn == "function") {
    return function(object, property) {
      return hasOwn.call(object, property);
    };
  } else {
    //...
  }
}());

tddjs.each = (function() {
  function unEnumerated(object, properties) {
    var length = properties.length;

    for(var i = 0; i < length; i++) {
      object[properties[i]] = true;
    }

    var enumerated = length;

    for(var prop in object) {
      if(tddjs.isOwnProperty(object, prop)) {
        enumerated -= 1;
        object[prop] = false;
      }
    }

    if(!enumerated) {
      return;
    }
    
    var needsFix = [];

    for(i = 0; i < length; i++) {
      if(object[properties[i]]) {
        needsFix.push(properties[i]);
      }
    }

    return needsFix;
  }

  var oFixes = unEnumerated({},
      ["toString", "toLocaleString", "valueOf",
      "hasOwnProperty", "isPrototypeOf", 
      "constructor", "propertyIsEnumerable"]);

  var fFixes = unEnumerated(
      function() {}, ["call", "apply", "prototype"]);

  if(fFixes && oFixes) {
    fFixes = oFixes.concat(fFixes);
  }

  var needsFix = { "object": oFixes, "function": fFixes };

  return function(object, callback) {
    if(typeof callback != "function") {
      throw new TypeError("callback is not a function");
    }

    for(var prop in object) {
      if(tddjs.isOwnProperty(object, prop)) {
        callback(prop, object[prop]);
      }
    }

    var fixes = needsFix[typeof object];

    if(fixes) {
      var property;
      for(var i = 0, l = fixes.length; i < l; i++) {
        property = fixes[i];

        if(tddjs.isOwnProperty(object, property)) {
          callback(property, object[property]);
        }
      }
    }
  };
}());

tddjs.extend = (function() {
  function extend(target, source) {
    target = target || {};

    if(!source) {
      return target;
    }

    tddjs.each(source, function(prop, val) {
      target[prop] = val;
    });

    return target;
  }
  return extend;
}());

tddjs.isHostMethod = (function () {
  function isHostMethod(object, property) {
    var type = typeof object[property];

    return type == "function" ||
      (type == "object" && !!object[property]) ||
      type == "unknown";
  }

  return isHostMethod;
}());

(function() {
  var dom = tddjs.namespace("dom");
  var _addEventHandler;

  if(!Function.prototype.call) {
    return;
  }

  function normalizeEvent(event) {
    event.preventDefault = function () {
      event.returnValue = false;
    };

    event.target = event.srcElement;

    return event;
  }

  if(tddjs.isHostMethod(document, "addEventListener")) {
    _addEventHandler = function(element, event, listener) {
      element.addEventListener(event, listener, false);
    };
  } else if (tddjs.isHostMethod(document, "attachEvent")) {
    _addEventHandler = function(element, event, listener) {
      element.attachEvent("on" + event, function () {
        var event = normalizeEvent(window.event);
        listener.call(element, event);
        return event.returnValue;
      });
    };
  } else {
    return ;
  }

  dom.addEventHandler = _addEventHandler;
}());
