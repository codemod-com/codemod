/*! @license
The MIT License (MIT)

Copyright (c) 2024 yugal41735

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"default",{enumerable:true,get:function(){return transform}});function transform(file,api){const j=api.jscodeshift;const root=j(file.source);let dirtyFlag=false;root.find(j.ImportDeclaration).forEach(path=>{if(j.Literal.check(path.node.source)&&path.node.source.value==="@ethersproject/providers"){path.node.source.value="ethers/providers";dirtyFlag=true}});root.find(j.VariableDeclarator).forEach(path=>{if(j.ObjectPattern.check(path.node.id)&&path.node.init&&j.Identifier.check(path.node.init)&&path.node.init.name==="providers"){path.node.id.properties.forEach(property=>{if(j.Identifier.check(property.key)&&property.key.name==="InfuraProvider"){if(path.node.id.properties.length===1){j(path).remove()}else{path.node.id.properties=path.node.id.properties.filter(prop=>prop.key.name!=="InfuraProvider")}const importDeclaration=j.importDeclaration([j.importSpecifier(j.identifier("InfuraProvider"))],j.literal("ethers"));root.get().node.program.body.unshift(importDeclaration);dirtyFlag=true}})}});return dirtyFlag?root.toSource():undefined}