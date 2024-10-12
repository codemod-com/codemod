/*! @license
The MIT License (MIT)

Copyright (c) 2024 dfordp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"default",{enumerable:true,get:function(){return transform}});function transform(file,api,options){const j=api.jscodeshift;const root=j(file.source);let dirtyFlag=false;root.find(j.FunctionDeclaration,{id:{name:"startServer"}}).forEach(path=>{const body=path.node.body.body;const hasEnableCompileCache=body.some(statement=>j.ExpressionStatement.check(statement)&&j.CallExpression.check(statement.expression)&&j.MemberExpression.check(statement.expression.callee)&&j.Identifier.check(statement.expression.callee.object)&&statement.expression.callee.object.name==="module"&&j.Identifier.check(statement.expression.callee.property)&&statement.expression.callee.property.name==="enableCompileCache");if(!hasEnableCompileCache){const enableCompileCacheCall=j.variableDeclaration("const",[j.variableDeclarator(j.identifier("result"),j.callExpression(j.memberExpression(j.identifier("module"),j.identifier("enableCompileCache")),[]))]);body.unshift(enableCompileCacheCall);dirtyFlag=true}});return dirtyFlag?root.toSource():undefined}