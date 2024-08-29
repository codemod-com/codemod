/*! @license
The MIT License (MIT)

Copyright (c) 2024 dfordp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"default",{enumerable:true,get:function(){return transform}});function transform(file,api){const j=api.jscodeshift;const root=j(file.source);let dirtyFlag=false;root.find(j.CallExpression,{callee:{name:"watch"}}).forEach(path=>{const args=path.value.arguments;if(j.ArrowFunctionExpression.check(args[0])){const firstArg=args[0];if(j.BlockStatement.check(firstArg.body)===false){const newBody=j.arrayExpression([firstArg.body,j.memberExpression(j.optionalMemberExpression(j.identifier("context"),j.identifier("dir"),false,true),j.identifier("value"))]);firstArg.body=newBody;dirtyFlag=true}}if(j.ArrowFunctionExpression.check(args[1])){const secondArg=args[1];if(secondArg.params.length>0){secondArg.params=[];dirtyFlag=true}}});return dirtyFlag?root.toSource():undefined}