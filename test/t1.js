var xson = require('../');
var fs   = require('fs');

var obj = xson.toJson(fs.readFileSync(__dirname + '/data2.xml', 'utf8'));

var str = JSON.stringify(obj, null, 2);
console.log(str);
fs.writeFileSync(__dirname + '/out.json', str);

var xml = xson.toXml(str, 4);
console.log(xml)
fs.writeFileSync(__dirname + '/out2.xml', xml);