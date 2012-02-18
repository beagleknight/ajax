(function() {
  var xhr;
  var ajax = tddjs.namespace("ajax");

  var options = [
    function() {
      return new ActiveXObject("Microsoft.XMLHTTP");
    },

    function() {
      return new XMLHttpRequest();
    }
  ];

  for(var i = 0, l = options.length; i < l; i++) {
    try {
      xhr = options[i]();

      if(typeof xhr.readyState == "number" &&
          tddjs.isHostMethod(xhr, "open") &&
          tddjs.isHostMethod(xhr, "send") &&
          tddjs.isHostMethod(xhr, "setRequestHeader")) {
        ajax.create = options[i];
        break;
      }
    } catch(e) { }
  }
}());


tddjs.noop = function() {};

(function() {
  var ajax = tddjs.namespace("ajax");

  if(!ajax.create) {
    return;
  }

  function requestComplete(transport, options) {
    var status = transport.status;

    if(status == 200 || (tddjs.isLocal() && !status)) {
      if(typeof options.success == "function") {
        options.success(transport);
      }
    }
  }

  function get(url, options) {
    if(typeof url != "string") {
      throw new TypeError("URL should be string");
    }

    options = options || {};
    var transport = tddjs.ajax.create();
    transport.open("GET", url, true);

    transport.onreadystatechange = function() {
      if(transport.readyState == 4) {
       requestComplete(transport, options);
       transport.onreadystatechange = tddjs.noop;
      } 
    };

    transport.send(null);
  }

  ajax.get = get;
}());
