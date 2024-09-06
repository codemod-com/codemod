/*! @license
The MIT License (MIT)

Copyright (c) 2024 dfordp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"default",{enumerable:true,get:function(){return transform}});function transform(file,api,options){const j=api.jscodeshift;const root=j(file.source);let dirtyFlag=false;root.find(j.MemberExpression,{object:{type:"MemberExpression",object:{type:"Identifier",name:"fetcher"},property:{name:"submission"}}}).forEach(path=>{const propertyName=path.value.property.name;if(["formData","formMethod","formAction"].includes(propertyName)){j(path).replaceWith(j.memberExpression(j.identifier("fetcher"),j.identifier(propertyName)));dirtyFlag=true}});root.find(j.MemberExpression,{object:{type:"Identifier",name:"fetcher"},property:{name:"type"}}).forEach(path=>{const parent=path.parent;if(parent.node.type==="ExpressionStatement"){parent.insertBefore(j.expressionStatement(j.literal("")))}});return dirtyFlag?root.toSource({quote:"single",trailingComma:true}):undefined}