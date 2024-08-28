/*! @license
The MIT License (MIT)

Copyright (c) 2024 yugal41735

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"default",{enumerable:true,get:function(){return transform}});function transform(file,api,options){const j=api.jscodeshift;const root=j(file.source);let dirtyFlag=false;root.find(j.CallExpression,{callee:{name:"parseTransaction"}}).forEach(path=>{if(path.node.arguments.length===1){path.replace(j.callExpression(j.memberExpression(j.identifier("Transaction"),j.identifier("from")),path.node.arguments));dirtyFlag=true}});root.find(j.CallExpression,{callee:{name:"serializeTransaction"}}).forEach(path=>{if(path.node.arguments.length>=1){path.replace(j.memberExpression(j.callExpression(j.memberExpression(j.identifier("Transaction"),j.identifier("from")),[path.node.arguments[0]]),j.identifier("serialized")));dirtyFlag=true}});if(dirtyFlag){root.find(j.ImportDeclaration,{source:{value:"anotherlib"}}).forEach(path=>{path.node.specifiers=path.node.specifiers.filter(specifier=>{return!(j.ImportSpecifier.check(specifier)&&specifier.imported.name==="Transaction")});if(path.node.specifiers.length===0){j(path).remove()}})}return dirtyFlag?root.toSource():undefined}