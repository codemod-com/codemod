/*! @license
The MIT License (MIT)

Copyright (c) 2024 dfordp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"default",{enumerable:true,get:function(){return transform}});function transform(file,api){const j=api.jscodeshift;const root=j(file.source);let dirtyFlag=false;const scriptSetupBlock=`
<script setup lang="ts">
function pagingFunc(date: DateValue, sign: -1 | 1) { 
  if (sign === -1) 
    return date.subtract({ years: 1 }) 
  return date.add({ years: 1 }) 
} 
</script>
`;const hasScriptSetup=root.find(j.Program).some(path=>path.node.body.some(node=>j.Literal.check(node)&&node.value.includes('<script setup lang="ts">')));if(!hasScriptSetup){root.get().node.program.body.unshift(j.template.statement([scriptSetupBlock]));dirtyFlag=true}root.find(j.JSXOpeningElement,{name:{name:"CalendarPrev"}}).forEach(path=>{const stepAttr=path.node.attributes.find(attr=>j.JSXAttribute.check(attr)&&attr.name.name==="step"&&attr.value.value==="year");if(stepAttr){path.node.attributes=path.node.attributes.filter(attr=>attr!==stepAttr);path.node.attributes.push(j.jsxAttribute(j.jsxIdentifier(":prev-page"),j.jsxExpressionContainer(j.arrowFunctionExpression([j.identifier("date")],j.callExpression(j.identifier("pagingFunc"),[j.identifier("date"),j.literal(-1)])))));dirtyFlag=true}});root.find(j.JSXOpeningElement,{name:{name:"CalendarNext"}}).forEach(path=>{const stepAttr=path.node.attributes.find(attr=>j.JSXAttribute.check(attr)&&attr.name.name==="step"&&attr.value.value==="year");if(stepAttr){path.node.attributes=path.node.attributes.filter(attr=>attr!==stepAttr);path.node.attributes.push(j.jsxAttribute(j.jsxIdentifier(":next-page"),j.jsxExpressionContainer(j.arrowFunctionExpression([j.identifier("date")],j.callExpression(j.identifier("pagingFunc"),[j.identifier("date"),j.literal(1)])))));dirtyFlag=true}});root.find(j.JSXElement,{openingElement:{name:{name:"template"}}}).forEach(path=>{const children=path.node.children.filter(child=>child.type!=="Literal"||child.value.trim()!=="");path.node.children=[j.jsxText("\n  "),...children,j.jsxText("\n")];dirtyFlag=true});return dirtyFlag?root.toSource():undefined}