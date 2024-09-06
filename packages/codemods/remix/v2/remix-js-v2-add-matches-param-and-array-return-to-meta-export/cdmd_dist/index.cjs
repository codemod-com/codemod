/*! @license
The MIT License (MIT)

Copyright (c) 2024 dfordp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"default",{enumerable:true,get:function(){return transform}});function transform(file,api,options){const j=api.jscodeshift;const root=j(file.source);let dirtyFlag=false;root.find(j.ExportNamedDeclaration).forEach(path=>{const declaration=path.node.declaration;if(j.VariableDeclaration.check(declaration)){const declarator=declaration.declarations[0];if(j.VariableDeclarator.check(declarator)&&j.Identifier.check(declarator.id)&&declarator.id.name==="meta"){const init=declarator.init;if(j.FunctionExpression.check(init)||j.ArrowFunctionExpression.check(init)){const params=init.params;if(params.length===1&&j.ObjectPattern.check(params[0])){params[0].properties.push(j.property.from({kind:"init",key:j.identifier("matches"),value:j.identifier("matches"),shorthand:true}));dirtyFlag=true}root.find(j.BlockStatement).forEach(blockPath=>{const body=blockPath.node.body;body.forEach((statement,index)=>{if(j.ReturnStatement.check(statement)&&j.ObjectExpression.check(statement.argument)){body[index]=j.returnStatement(j.arrayExpression([statement.argument]));dirtyFlag=true}})})}}}});return dirtyFlag?root.toSource():undefined}