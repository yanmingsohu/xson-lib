

module.exports.toXml = __toXmlTxt;


var ATTR_KEY = '$attr';
var TEXT_KEY = '$text';


function __toXmlTxt(_o, beautifier) {
  var ret       = [];
  var _         = function(s) { s && ret.push(s); return _; };
  var TAB_SIZE  = 2;
  var tabc      = 0 - TAB_SIZE;

  if (_o.constructor == String) {
    _o = JSON.parse(_o);
  }

  if (!isNaN(beautifier)) {
    TAB_SIZE = parseInt(beautifier);
    tabc     = 0 - TAB_SIZE;
  }

  head();
  pobj(_o);

  return ret.join('');


  function head() {
    var xmlinfo = _o.xml || { "$attr": {"version":"1.0","encoding":"utf-8"} };
    _('<?xml')(wattr(xmlinfo))('?>');
    enter();
    delete _o.xml;
  }


  function pobj(o) {
    for (var n in o) {
      if (n == ATTR_KEY) {
        continue;

      } else if (n == TEXT_KEY) {
        _(o[n]);

      } else if (!o[n]) {
        _("<")(n)("/>");
        enter();

      } else {
        tabc += TAB_SIZE;
        ctype(n, wattr(o[n]), o[n]);
        tabc -= TAB_SIZE;
      }
    }
  }


  function ctype(n, attr, o) {
    if (o.constructor == String) {
      wtag(n, attr, o);
    }
    else if (o.constructor == Array) {
      for (var i=0; i<o.length; ++i) {
        ctype(n, wattr(o[i]), o[i]);
      }
    }
    else if (o.constructor == Buffer) {
      wtag(n, attr, o.toString());
    }
    else if (typeof o == 'object') {
      wtag(n, attr, function() { enter(); pobj(o); });
    } else {
      wtag(n, attr, o);
    }
  }


  function wtag(name, attr, content) {
    tab();
    _("<")(name)(attr)(">");
    if (content) {
      if (typeof content == 'function') {
        content();
        tab();
      } else {
        _(content);
      }
    }
    _("</")(name)(">");
    enter();
  }


  function wattr(o) {
    var a = o[ATTR_KEY];
    if (!a) return '';
    var ret1 = [];
    var _1 = function(s) { ret1.push(s); return _1; };

    for (var n in a) {
      _1(' ')(n)('="')(a[n])('"');
    }
    return ret1.join('');
  }


  function enter() {
    if (!beautifier) return;
    _("\n");
  }


  function tab() {
    if (!beautifier) return;
    for (var i=0; i<tabc; ++i) _(' ');
  }
}
