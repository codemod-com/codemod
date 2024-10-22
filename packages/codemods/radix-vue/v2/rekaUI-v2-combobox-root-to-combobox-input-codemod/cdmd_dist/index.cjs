/*! @license
The MIT License (MIT)

Copyright (c) 2024 dfordp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"default",{enumerable:true,get:function(){return transform}});function transform(file,api,options){const j=api.jscodeshift;const root=j(file.source);let dirtyFlag=false;root.find(j.JSXElement,{openingElement:{name:{name:"ComboboxRoot"}}}).forEach(path=>{const openingElement=path.value.openingElement;const children=path.value.children;let searchTermAttr,displayValueAttr;openingElement.attributes=openingElement.attributes.filter(attr=>{if(j.JSXAttribute.check(attr)&&j.JSXIdentifier.check(attr.name)){if(attr.name.name==="v-model:search-term"){searchTermAttr=attr;return false}if(attr.name.name===":display-value"){displayValueAttr=attr;return false}}return true});if(searchTermAttr&&displayValueAttr){dirtyFlag=true;const comboboxInput=j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier("ComboboxInput"),[j.jsxAttribute(j.jsxIdentifier("v-model"),searchTermAttr.value),displayValueAttr]),j.jsxClosingElement(j.jsxIdentifier("ComboboxInput")),children);path.value.children=[j.jsxText("\n    "),comboboxInput,j.jsxText("\n  ")]}});return dirtyFlag?root.toSource():undefined}