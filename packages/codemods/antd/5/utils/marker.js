/*! @license
MIT LICENSE

Copyright (c) 2015-present Ant UED, https://xtech.antfin.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

The source code has been taken from https://github.com/ant-design/codemod-v5/blob/main/transforms/utils/marker.js

Changes to the original file: 
1. changed imports to esm 
2. removed getDependencies
*/

import fs from "fs";
import os from "os";
import path from "path";

const markerPath = path.join(
  process.env.NODE_ENV === "local" ? process.cwd() : os.tmpdir(),
  "./antd5-codemod-marker.log",
);

const newline = "\n";

function ensureFile() {
  return fs.openSync(markerPath, "w");
}

function markDependency(depName) {
  ensureFile();
  return fs.appendFileSync(markerPath, depName + newline, "utf8");
}

export { markDependency };
