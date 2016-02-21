

module.exports.toJson = __parseXml;


var SP_MAP = {
  ' '  : 1,
  "\n" : 1,
  "\t" : 1,
  "\r" : 1,
};


var ATTR_KEY = '$attr';
var TEXT_KEY = '$text';


function __parseXml(txt) {
  var _i    = 0;
  var ret   = {};
  var tmp   = [];
  var name  = null;


  while (_i < txt.length) {
    p(ret, 0);
  }
  return ret;


  function p(currRef, f) {
    var tag = null;
    var cf = 0;
    var settagname = false;
    var enda;

    while (_i < txt.length) {
      // if (issp()) console.log('f', txt[_i], f)
      // console.log('', _i, "\t>>>", txt[_i], "\t", f)

      switch (f) {

        case 0: // begin new tag
          skipSpace(0,0);
          if (txt[_i] == '<') {
            if (txt[_i + 1] == '!') {
              f = 10;
              cf = 0;
              break;
            }
            if (txt[_i + 1] == '/') {
              f = 5;
              break;
            }
            if (txt[_i + 1] == '?') ++_i;
            f = 1;
            tag = null;
            skipSpace(1, -1);
          }
          break;

        case 1: // tag name
          settagname = false;
          if (issp() /*txt[_i] == ' '*/) {
            skipSpace(0, -1);
            if (tmp.length > 0) {
              if (txt[_i + 1] != '>') {
                f = 3;
                settagname = true;
              }
            } else if (tag) {
              f = 3;
            }
          } else if (txt[_i] == '>') {
            if (txt[_i - 1] == '/' || txt[_i - 1] == '?') {
              tmp.pop();
              f = 0;
            } else {
              f = 2;
              skipSpace(1, -1);
            }
            // console.log('ta', tag, settagname)
            if (!tag) {
              settagname = true;
            }
          } else {
            // if (issp()) throw new Error("不应该有空格");
            // console.log('settag >>', "'", txt[_i], "'");
            tmp.push(txt[_i]);
          }
          if (settagname) {
            tag = saveName();
            // console.log('tag', tag);

            if (currRef[tag]) {
              if (currRef[tag].constructor == Array) {
                var s = currRef[tag];
                tag = s.length;
                currRef = s;

              } else {
                var s = currRef[tag];
                currRef[tag] = [s];
                currRef = currRef[tag];
                tag = 1;
                currRef[tag] = null;
              }
            } else {
              currRef[tag] = null;
            }
          }
          break;

        case 3: // tag attribute name
          if (txt[_i] == '=') {
            f = 4;
            saveName();
            skipSpace(1, 0);
            // console.log('[name]', name)
            if (txt[_i] == '"' || txt[_i] == "'") {
              enda = txt[_i];
            } else {
              throw new Error('属性中不应该有 ' + txt[_i]);
            }
          } else if (txt[_i] != ' ') {
            tmp.push(txt[_i]);
          }
          break;

        case 4: // tag attribute value
          if (txt[_i] == enda) {
            if (tmp.length > 0) {
              pushAttr();
              f = 1;
            }
          } else {
            tmp.push(txt[_i]);
          }
          break;

        case 2: // tag body
          if (txt[_i] == '<') {
            if (txt[_i + 1] == '!') {
              f = 10;
              cf = 2;
              break;
            }
            if (txt[_i + 1] == '/') {
              pushSome(null, tmp.join('').trim());
              tmp = [];
              // console.log('tbody', txt[_i], txt[_i+1], currRef[tag]);
              f = 5;
              break;
            }

            // console.log('pppp1', tag)
            // f = 1;
            // tmp = [];
            skipSpace(1, 0);
            pushSome(true);
            p(currRef[tag], 1);
            
          } else {
            f = 6;
            --_i;
          }
          break;

        case 6: // string body
          // console.log('sbody', _i, "\t>>>", txt[_i], "\t", f)
          if (txt[_i] == '<') {
            // console.log('sbody return', tmp.join(''))
            if (txt[_i + 1] == '!') {
              f = 10;
              cf = 6;
              break;
            }
            // pushSome(null, tmp.join(''));
            // tmp = [];
            f = 2;
            cf = 6;
            --_i;
          } else {
            tmp.push(txt[_i]);
          }
          break;

        case 5: // tag end
          if (txt[_i] == '>') {
            return;
          }
          break;

        case 10:
          if (txt[_i] == '-' && 
              txt[_i+1] == '-' &&
              txt[_i+2] == '>' ) {
            _i += 3;
            f = cf;
            skipSpace(1, -1);
          }
          break;
      }
      ++_i;
    }

    function pushSome(obj, text, attr) {
      if (obj) {
        if (currRef[tag]) {
          if (currRef[tag].constructor === String) {
            var t = currRef[tag];
            currRef[tag] = {};
            currRet[tag][TEXT_KEY] = t;
          } else {
            // throw new Error('conflict1');
          }
        } else {
          currRef[tag] = {};
        }
      } else if (text) {
        if (currRef[tag]) {
          if (currRef[tag].constructor === Object) {
            currRef[tag][TEXT_KEY] = tmp.join('');
          } else {
            throw new Error('conflict2 ' + tag);
          }
        } else {
          currRef[tag] = text;
        }
      } else if (attr) {
        if (currRef[tag]) {
          if (currRef[tag].constructor === String) {
            var t = currRef[tag];
            currRef[tag] = {};
            currRet[tag][TEXT_KEY] = t;
          }
        } else {
          currRef[tag] = {};
        }
      }
    }

    function pushAttr() {
      pushSome(null, null, true);

      if (!currRef[tag][ATTR_KEY]) 
        currRef[tag][ATTR_KEY] = {};

      currRef[tag][ATTR_KEY][name] = tmp.join('');
      // console.log('[val]', tmp.join(''))
      tmp = [];
    }
  }


  function skipSpace(_in, _out) {
    _i += _in;
    while (issp()) { ++_i; }
    _i += _out;
  }


  function issp() {
    return SP_MAP[ txt[_i] ];
  }


  function saveName() {
    name = tmp.join('').trim();
    tmp = [];   
    return name;
  }
}