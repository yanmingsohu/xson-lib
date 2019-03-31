# XML JSON 互相转换

> 无任何库依赖
> 没有 xml 有效性验证, 错误的 json 会生成错误的 xml
> 错误的 xml 会生成无效的 json


## Install

npm install --save xson-lib



## Usage

```js
var xson = require('xson-lib');

var json = xson.toJson(xml_string);
var json_string = json.stringify(json);

var xml  = xson.toXml(json_jsonstring, beautifier[bool])
```