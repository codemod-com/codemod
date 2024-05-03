/*! @license
The MIT License (MIT)

Copyright (c) 2024 dmytrohryshyn

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
"use strict";var s=Object.defineProperty;var d=Object.getOwnPropertyDescriptor;var m=Object.getOwnPropertyNames;var l=Object.prototype.hasOwnProperty;var p=(o,e)=>{for(var r in e)s(o,r,{get:e[r],enumerable:!0})},u=(o,e,r,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of m(e))!l.call(o,t)&&t!==r&&s(o,t,{get:()=>e[t],enumerable:!(n=d(e,t))||n.enumerable});return o};var y=o=>u(s({},"__esModule",{value:!0}),o);var A={};p(A,{default:()=>a});module.exports=y(A);function a(o,e,r){let n=e.jscodeshift,t=n(o.source);function f(i,c){i.node.comments&&(c.comments=i.node.comments),n(i).replaceWith(c)}return t.find(n.VariableDeclaration).forEach(i=>{i.node.declarations[0].id.name==="mapStateToProps"&&(i.node.declarations[0].init.params[0].typeAnnotation=n.tsTypeAnnotation(n.tsTypeReference(n.identifier("State"))),f(i,i.node))}),t.toSource()}
