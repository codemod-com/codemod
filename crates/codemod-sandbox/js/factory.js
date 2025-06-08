import { fetch } from './capabilities.js';
import { Parser, Language } from 'web-tree-sitter';

export const RAW_WASM = Symbol();
export default function() {

let wasm;
 function __wbg_set_wasm(val) {
wasm = val;
}


let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
}
return cachedUint8ArrayMemory0;
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
? function (arg, view) {
return cachedTextEncoder.encodeInto(arg, view);
}
: function (arg, view) {
const buf = cachedTextEncoder.encode(arg);
view.set(buf);
return {
read: arg.length,
written: buf.length
};
});

function passStringToWasm0(arg, malloc, realloc) {

if (realloc === undefined) {
const buf = cachedTextEncoder.encode(arg);
const ptr = malloc(buf.length, 1) >>> 0;
getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
WASM_VECTOR_LEN = buf.length;
return ptr;
}

let len = arg.length;
let ptr = malloc(len, 1) >>> 0;

const mem = getUint8ArrayMemory0();

let offset = 0;

for (; offset < len; offset++) {
const code = arg.charCodeAt(offset);
if (code > 0x7F) break;
mem[ptr + offset] = code;
}

if (offset !== len) {
if (offset !== 0) {
arg = arg.slice(offset);
}
ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
const ret = encodeString(arg, view);

offset += ret.written;
ptr = realloc(ptr, len, offset, 1) >>> 0;
}

WASM_VECTOR_LEN = offset;
return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
}
return cachedDataViewMemory0;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
ptr = ptr >>> 0;
return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function addToExternrefTable0(obj) {
const idx = wasm.__externref_table_alloc();
wasm.__wbindgen_export_4.set(idx, obj);
return idx;
}

function handleError(f, args) {
try {
return f.apply(this, args);
} catch (e) {
const idx = addToExternrefTable0(e);
wasm.__wbindgen_exn_store(idx);
}
}

function isLikeNone(x) {
return x === undefined || x === null;
}

function passArrayJsValueToWasm0(array, malloc) {
const ptr = malloc(array.length * 4, 4) >>> 0;
for (let i = 0; i < array.length; i++) {
const add = addToExternrefTable0(array[i]);
getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
}
WASM_VECTOR_LEN = array.length;
return ptr;
}

function getArrayJsValueFromWasm0(ptr, len) {
ptr = ptr >>> 0;
const mem = getDataViewMemory0();
const result = [];
for (let i = ptr; i < ptr + 4 * len; i += 4) {
result.push(wasm.__wbindgen_export_4.get(mem.getUint32(i, true)));
}
wasm.__externref_drop_slice(ptr, len);
return result;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
? { register: () => {}, unregister: () => {} }
: new FinalizationRegistry(state => {
wasm.__wbindgen_export_7.get(state.dtor)(state.a, state.b)
});

function makeMutClosure(arg0, arg1, dtor, f) {
const state = { a: arg0, b: arg1, cnt: 1, dtor };
const real = (...args) => {
// First up with a closure we increment the internal reference
// count. This ensures that the Rust closure environment won't
// be deallocated while we're invoking it.
state.cnt++;
const a = state.a;
state.a = 0;
try {
return f(a, state.b, ...args);
} finally {
if (--state.cnt === 0) {
wasm.__wbindgen_export_7.get(state.dtor)(a, state.b);
CLOSURE_DTORS.unregister(state);
} else {
state.a = a;
}
}
};
real.original = state;
CLOSURE_DTORS.register(real, state, state);
return real;
}

function debugString(val) {
// primitive types
const type = typeof val;
if (type == 'number' || type == 'boolean' || val == null) {
return  `${val}`;
}
if (type == 'string') {
return `"${val}"`;
}
if (type == 'symbol') {
const description = val.description;
if (description == null) {
return 'Symbol';
} else {
return `Symbol(${description})`;
}
}
if (type == 'function') {
const name = val.name;
if (typeof name == 'string' && name.length > 0) {
return `Function(${name})`;
} else {
return 'Function';
}
}
// objects
if (Array.isArray(val)) {
const length = val.length;
let debug = '[';
if (length > 0) {
debug += debugString(val[0]);
}
for(let i = 1; i < length; i++) {
debug += ', ' + debugString(val[i]);
}
debug += ']';
return debug;
}
// Test for built-in
const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
let className;
if (builtInMatches && builtInMatches.length > 1) {
className = builtInMatches[1];
} else {
// Failed to match the standard '[object ClassName]'
return toString.call(val);
}
if (className == 'Object') {
// we're a user defined class or Object
// JSON.stringify avoids problems with cycles, and is generally much
// easier than looping through ownProperties of `val`.
try {
return 'Object(' + JSON.stringify(val) + ')';
} catch (_) {
return 'Object';
}
}
// errors
if (val instanceof Error) {
return `${val.name}: ${val.message}\n${val.stack}`;
}
// TODO we could test for more things here, like `Set`s and `Map`s.
return className;
}
/**
* @param {Function | null} [locate_file]
* @returns {Promise<void>}
*/
 function initializeTreeSitter(locate_file) {
const ret = wasm.initializeTreeSitter(isLikeNone(locate_file) ? 0 : addToExternrefTable0(locate_file));
return ret;
}

/**
* @param {string} lang_name
* @param {string} parser_path
* @returns {Promise<void>}
*/
 function setupParser(lang_name, parser_path) {
const ptr0 = passStringToWasm0(lang_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len0 = WASM_VECTOR_LEN;
const ptr1 = passStringToWasm0(parser_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len1 = WASM_VECTOR_LEN;
const ret = wasm.setupParser(ptr0, len0, ptr1, len1);
return ret;
}

/**
* @param {string} invocation_id
* @param {string} method
* @param {string} name
* @param {any} modules
* @param {string} code
* @param {string} json
* @returns {Promise<any>}
*/
 function run_module(invocation_id, method, name, modules, code, json) {
const ptr0 = passStringToWasm0(invocation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len0 = WASM_VECTOR_LEN;
const ptr1 = passStringToWasm0(method, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len1 = WASM_VECTOR_LEN;
const ptr2 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len2 = WASM_VECTOR_LEN;
const ptr3 = passStringToWasm0(code, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len3 = WASM_VECTOR_LEN;
const ptr4 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len4 = WASM_VECTOR_LEN;
const ret = wasm.run_module(ptr0, len0, ptr1, len1, ptr2, len2, modules, ptr3, len3, ptr4, len4);
return ret;
}

function takeFromExternrefTable0(idx) {
const value = wasm.__wbindgen_export_4.get(idx);
wasm.__externref_table_dealloc(idx);
return value;
}
/**
* @param {string} src
* @param {any[]} configs
* @returns {any}
*/
 function scanFind(src, configs) {
const ptr0 = passStringToWasm0(src, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len0 = WASM_VECTOR_LEN;
const ptr1 = passArrayJsValueToWasm0(configs, wasm.__wbindgen_malloc);
const len1 = WASM_VECTOR_LEN;
const ret = wasm.scanFind(ptr0, len0, ptr1, len1);
if (ret[2]) {
throw takeFromExternrefTable0(ret[1]);
}
return takeFromExternrefTable0(ret[0]);
}

/**
* @param {string} src
* @param {any[]} configs
* @returns {string}
*/
 function scanFix(src, configs) {
let deferred4_0;
let deferred4_1;
try {
const ptr0 = passStringToWasm0(src, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len0 = WASM_VECTOR_LEN;
const ptr1 = passArrayJsValueToWasm0(configs, wasm.__wbindgen_malloc);
const len1 = WASM_VECTOR_LEN;
const ret = wasm.scanFix(ptr0, len0, ptr1, len1);
var ptr3 = ret[0];
var len3 = ret[1];
if (ret[3]) {
ptr3 = 0; len3 = 0;
throw takeFromExternrefTable0(ret[2]);
}
deferred4_0 = ptr3;
deferred4_1 = len3;
return getStringFromWasm0(ptr3, len3);
} finally {
wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
}
}

/**
* @param {string} src
* @returns {any}
*/
 function dumpASTNodes(src) {
const ptr0 = passStringToWasm0(src, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len0 = WASM_VECTOR_LEN;
const ret = wasm.dumpASTNodes(ptr0, len0);
if (ret[2]) {
throw takeFromExternrefTable0(ret[1]);
}
return takeFromExternrefTable0(ret[0]);
}

/**
* @param {string} src
* @param {string | null} [selector]
* @returns {any}
*/
 function dumpPattern(src, selector) {
const ptr0 = passStringToWasm0(src, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len0 = WASM_VECTOR_LEN;
var ptr1 = isLikeNone(selector) ? 0 : passStringToWasm0(selector, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
var len1 = WASM_VECTOR_LEN;
const ret = wasm.dumpPattern(ptr0, len0, ptr1, len1);
if (ret[2]) {
throw takeFromExternrefTable0(ret[1]);
}
return takeFromExternrefTable0(ret[0]);
}

function __wbg_adapter_50(arg0, arg1, arg2) {
wasm.closure2211_externref_shim(arg0, arg1, arg2);
}

function __wbg_adapter_200(arg0, arg1, arg2, arg3) {
wasm.closure2233_externref_shim(arg0, arg1, arg2, arg3);
}

 function __wbg_String_8f0eb39a4a4c2f66(arg0, arg1) {
const ret = String(arg1);
const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len1 = WASM_VECTOR_LEN;
getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

 function __wbg_atob_b687cf564517d11e(arg0, arg1, arg2) {
const ret = atob(getStringFromWasm0(arg1, arg2));
const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len1 = WASM_VECTOR_LEN;
getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

 function __wbg_btoa_f1cc8b23625c1733(arg0, arg1, arg2) {
const ret = btoa(getStringFromWasm0(arg1, arg2));
const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len1 = WASM_VECTOR_LEN;
getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

 function __wbg_buffer_609cc3eee51ed158(arg0) {
const ret = arg0.buffer;
return ret;
};

 function __wbg_call_672a4d21634d4a24() { return handleError(function (arg0, arg1) {
const ret = arg0.call(arg1);
return ret;
}, arguments) };

 function __wbg_call_7cccdd69e0791ae2() { return handleError(function (arg0, arg1, arg2) {
const ret = arg0.call(arg1, arg2);
return ret;
}, arguments) };

 function __wbg_childCount_a6b8bf01a93e53da(arg0) {
const ret = arg0.childCount;
return ret;
};

 function __wbg_childForFieldId_e1ff577760482763(arg0, arg1) {
const ret = arg0.childForFieldId(arg1);
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

 function __wbg_childForFieldName_c30c3ad6e6d7b2d5(arg0, arg1, arg2) {
const ret = arg0.childForFieldName(getStringFromWasm0(arg1, arg2));
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

 function __wbg_child_1ecd54afc9b93ff5(arg0, arg1) {
const ret = arg0.child(arg1 >>> 0);
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

 function __wbg_children_9c7bca8276138d26(arg0, arg1) {
const ret = arg1.children;
const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
const len1 = WASM_VECTOR_LEN;
getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

 function __wbg_column_e22f48f18c5be5af(arg0) {
const ret = arg0.column;
return ret;
};

 function __wbg_currentFieldId_45a539bb96e00de6(arg0) {
const ret = arg0.currentFieldId;
return isLikeNone(ret) ? 0xFFFFFF : ret;
};

 function __wbg_currentFieldName_2bf460c2ff4cb55f(arg0) {
const ret = arg0.currentFieldName;
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

 function __wbg_currentNode_71762eadafc49fc0(arg0) {
const ret = arg0.currentNode;
return ret;
};

 function __wbg_done_769e5ede4b31c67b(arg0) {
const ret = arg0.done;
return ret;
};

 function __wbg_endIndex_d3aa1552abc6599c(arg0) {
const ret = arg0.endIndex;
return ret;
};

 function __wbg_endPosition_a4796193570eccbd(arg0) {
const ret = arg0.endPosition;
return ret;
};

 function __wbg_entries_3265d4158b33e5dc(arg0) {
const ret = Object.entries(arg0);
return ret;
};

 function __wbg_error_55b26df739c2fe8b(arg0, arg1) {
var v0 = getArrayJsValueFromWasm0(arg0, arg1).slice();
wasm.__wbindgen_free(arg0, arg1 * 4, 4);
console.error(...v0);
};

 function __wbg_fetch_71724d6f0f8d9962(arg0, arg1, arg2, arg3) {
let deferred0_0;
let deferred0_1;
let deferred1_0;
let deferred1_1;
try {
deferred0_0 = arg0;
deferred0_1 = arg1;
deferred1_0 = arg2;
deferred1_1 = arg3;
const ret = fetch(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
return ret;
} finally {
wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
}
};

 function __wbg_fieldIdForName_ed243dd7e35f4861(arg0, arg1, arg2) {
const ret = arg0.fieldIdForName(getStringFromWasm0(arg1, arg2));
return isLikeNone(ret) ? 0xFFFFFF : ret;
};

 function __wbg_from_2a5d3e218e67aa85(arg0) {
const ret = Array.from(arg0);
return ret;
};

 function __wbg_get_67b2ba62fc30de12() { return handleError(function (arg0, arg1) {
const ret = Reflect.get(arg0, arg1);
return ret;
}, arguments) };

 function __wbg_get_b9b93047fe3cf45b(arg0, arg1) {
const ret = arg0[arg1 >>> 0];
return ret;
};

 function __wbg_getwithrefkey_1dc361bd10053bfe(arg0, arg1) {
const ret = arg0[arg1];
return ret;
};

 function __wbg_gotoFirstChild_252ce106a4886852(arg0) {
const ret = arg0.gotoFirstChild();
return ret;
};

 function __wbg_gotoNextSibling_04b8655b389f7e62(arg0) {
const ret = arg0.gotoNextSibling();
return ret;
};

 function __wbg_gotoParent_667cb6debc76112d(arg0) {
const ret = arg0.gotoParent();
return ret;
};

 function __wbg_idForNodeType_f69d5a20ec58af31(arg0, arg1, arg2, arg3) {
const ret = arg0.idForNodeType(getStringFromWasm0(arg1, arg2), arg3 !== 0);
return ret;
};

 function __wbg_id_46703548bec1f10b(arg0) {
const ret = arg0.id;
return ret;
};

 function __wbg_init_89fd7d76d7bb0691(arg0) {
const ret = Parser.init(arg0);
return ret;
};

 function __wbg_instanceof_ArrayBuffer_e14585432e3737fc(arg0) {
let result;
try {
result = arg0 instanceof ArrayBuffer;
} catch (_) {
result = false;
}
const ret = result;
return ret;
};

 function __wbg_instanceof_Error_4d54113b22d20306(arg0) {
let result;
try {
result = arg0 instanceof Error;
} catch (_) {
result = false;
}
const ret = result;
return ret;
};

 function __wbg_instanceof_Map_f3469ce2244d2430(arg0) {
let result;
try {
result = arg0 instanceof Map;
} catch (_) {
result = false;
}
const ret = result;
return ret;
};

 function __wbg_instanceof_Uint8Array_17156bcf118086a9(arg0) {
let result;
try {
result = arg0 instanceof Uint8Array;
} catch (_) {
result = false;
}
const ret = result;
return ret;
};

 function __wbg_isArray_a1eab7e0d067391b(arg0) {
const ret = Array.isArray(arg0);
return ret;
};

 function __wbg_isMissing_fdcbb1d762ec3abf(arg0) {
const ret = arg0.isMissing;
return ret;
};

 function __wbg_isNamed_e49e788404dd0c6b(arg0) {
const ret = arg0.isNamed;
return ret;
};

 function __wbg_isSafeInteger_343e2beeeece1bb0(arg0) {
const ret = Number.isSafeInteger(arg0);
return ret;
};

 function __wbg_iterator_9a24c88df860dc65() {
const ret = Symbol.iterator;
return ret;
};

 function __wbg_length_a446193dc22c12f8(arg0) {
const ret = arg0.length;
return ret;
};

 function __wbg_length_e2d2a49132c1b256(arg0) {
const ret = arg0.length;
return ret;
};

 function __wbg_load_ac005a13bbebdb0b(arg0, arg1) {
const ret = Language.load(getStringFromWasm0(arg0, arg1));
return ret;
};

 function __wbg_log_b79a24d377a91090(arg0, arg1) {
var v0 = getArrayJsValueFromWasm0(arg0, arg1).slice();
wasm.__wbindgen_free(arg0, arg1 * 4, 4);
console.log(...v0);
};

 function __wbg_message_97a2af9b89d693a3(arg0) {
const ret = arg0.message;
return ret;
};

 function __wbg_namedChildCount_44a0f24db74f4d08(arg0) {
const ret = arg0.namedChildCount;
return ret;
};

 function __wbg_new_23a2665fac83c611(arg0, arg1) {
try {
var state0 = {a: arg0, b: arg1};
var cb0 = (arg0, arg1) => {
const a = state0.a;
state0.a = 0;
try {
return __wbg_adapter_200(a, state0.b, arg0, arg1);
} finally {
state0.a = a;
}
};
const ret = new Promise(cb0);
return ret;
} finally {
state0.a = state0.b = 0;
}
};

 function __wbg_new_405e22f390576ce2() {
const ret = new Object();
return ret;
};

 function __wbg_new_5e0be73521bc8c17() {
const ret = new Map();
return ret;
};

 function __wbg_new_617dbf964b61f53e() { return handleError(function () {
const ret = new Parser();
return ret;
}, arguments) };

 function __wbg_new_78feb108b6472713() {
const ret = new Array();
return ret;
};

 function __wbg_new_a12002a7f91c75be(arg0) {
const ret = new Uint8Array(arg0);
return ret;
};

 function __wbg_newnoargs_105ed471475aaf50(arg0, arg1) {
const ret = new Function(getStringFromWasm0(arg0, arg1));
return ret;
};

 function __wbg_nextSibling_b371f151ed94a89b(arg0) {
const ret = arg0.nextSibling;
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

 function __wbg_next_25feadfc0913fea9(arg0) {
const ret = arg0.next;
return ret;
};

 function __wbg_next_6574e1a8a62d1055() { return handleError(function (arg0) {
const ret = arg0.next();
return ret;
}, arguments) };

 function __wbg_parent_647e5f3765673032(arg0) {
const ret = arg0.parent;
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

 function __wbg_parse_211b75b6b50e2da5() { return handleError(function (arg0, arg1, arg2, arg3) {
const ret = arg0.parse(arg1, arg2, arg3);
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments) };

 function __wbg_previousSibling_0d5cdd5a811cedb2(arg0) {
const ret = arg0.previousSibling;
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

 function __wbg_push_737cfc8c1432c2c6(arg0, arg1) {
const ret = arg0.push(arg1);
return ret;
};

 function __wbg_queueMicrotask_97d92b4fcc8a61c5(arg0) {
queueMicrotask(arg0);
};

 function __wbg_queueMicrotask_d3219def82552485(arg0) {
const ret = arg0.queueMicrotask;
return ret;
};

 function __wbg_resolve_4851785c9c5f573d(arg0) {
const ret = Promise.resolve(arg0);
return ret;
};

 function __wbg_rootNode_5b87afbf1cb30f6f(arg0) {
const ret = arg0.rootNode;
return ret;
};

 function __wbg_row_3a241ac449e90b14(arg0) {
const ret = arg0.row;
return ret;
};

 function __wbg_setLanguage_183086649e428443() { return handleError(function (arg0, arg1) {
arg0.setLanguage(arg1);
}, arguments) };

 function __wbg_set_37837023f3d740e8(arg0, arg1, arg2) {
arg0[arg1 >>> 0] = arg2;
};

 function __wbg_set_3f1d0b984ed272ed(arg0, arg1, arg2) {
arg0[arg1] = arg2;
};

 function __wbg_set_65595bdd868b3009(arg0, arg1, arg2) {
arg0.set(arg1, arg2 >>> 0);
};

 function __wbg_set_8fc6bf8a5b1071d1(arg0, arg1, arg2) {
const ret = arg0.set(arg1, arg2);
return ret;
};

 function __wbg_set_bb8cecf6a62b9f46() { return handleError(function (arg0, arg1, arg2) {
const ret = Reflect.set(arg0, arg1, arg2);
return ret;
}, arguments) };

 function __wbg_startIndex_466622c3156f49af(arg0) {
const ret = arg0.startIndex;
return ret;
};

 function __wbg_startPosition_222a04896d7d160c(arg0) {
const ret = arg0.startPosition;
return ret;
};

 function __wbg_static_accessor_GLOBAL_88a902d13a557d07() {
const ret = typeof global === 'undefined' ? null : global;
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

 function __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0() {
const ret = typeof globalThis === 'undefined' ? null : globalThis;
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

 function __wbg_static_accessor_SELF_37c5d418e4bf5819() {
const ret = typeof self === 'undefined' ? null : self;
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

 function __wbg_static_accessor_WINDOW_5de37043a91a9c40() {
const ret = typeof window === 'undefined' ? null : window;
return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

 function __wbg_text_8bf8fa91111a698f(arg0) {
const ret = arg0.text;
return ret;
};

 function __wbg_then_44b73946d2fb3e7d(arg0, arg1) {
const ret = arg0.then(arg1);
return ret;
};

 function __wbg_then_48b406749878a531(arg0, arg1, arg2) {
const ret = arg0.then(arg1, arg2);
return ret;
};

 function __wbg_typeId_e158ac425466c562(arg0) {
const ret = arg0.typeId;
return ret;
};

 function __wbg_type_8c03f5de5dcc70e8(arg0) {
const ret = arg0.type;
return ret;
};

 function __wbg_value_cd1ffa7b1ab794f1(arg0) {
const ret = arg0.value;
return ret;
};

 function __wbg_walk_5a10ef3cc747c1a7(arg0) {
const ret = arg0.walk();
return ret;
};

 function __wbg_warn_dec08065228a61fc(arg0, arg1) {
var v0 = getArrayJsValueFromWasm0(arg0, arg1).slice();
wasm.__wbindgen_free(arg0, arg1 * 4, 4);
console.warn(...v0);
};

 function __wbindgen_bigint_from_i64(arg0) {
const ret = arg0;
return ret;
};

 function __wbindgen_bigint_from_u64(arg0) {
const ret = BigInt.asUintN(64, arg0);
return ret;
};

 function __wbindgen_bigint_get_as_i64(arg0, arg1) {
const v = arg1;
const ret = typeof(v) === 'bigint' ? v : undefined;
getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

 function __wbindgen_boolean_get(arg0) {
const v = arg0;
const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
return ret;
};

 function __wbindgen_cb_drop(arg0) {
const obj = arg0.original;
if (obj.cnt-- == 1) {
obj.a = 0;
return true;
}
const ret = false;
return ret;
};

 function __wbindgen_closure_wrapper6118(arg0, arg1, arg2) {
const ret = makeMutClosure(arg0, arg1, 2212, __wbg_adapter_50);
return ret;
};

 function __wbindgen_debug_string(arg0, arg1) {
const ret = debugString(arg1);
const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
const len1 = WASM_VECTOR_LEN;
getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

 function __wbindgen_error_new(arg0, arg1) {
const ret = new Error(getStringFromWasm0(arg0, arg1));
return ret;
};

 function __wbindgen_in(arg0, arg1) {
const ret = arg0 in arg1;
return ret;
};

 function __wbindgen_init_externref_table() {
const table = wasm.__wbindgen_export_4;
const offset = table.grow(4);
table.set(0, undefined);
table.set(offset + 0, undefined);
table.set(offset + 1, null);
table.set(offset + 2, true);
table.set(offset + 3, false);
;
};

 function __wbindgen_is_bigint(arg0) {
const ret = typeof(arg0) === 'bigint';
return ret;
};

 function __wbindgen_is_function(arg0) {
const ret = typeof(arg0) === 'function';
return ret;
};

 function __wbindgen_is_object(arg0) {
const val = arg0;
const ret = typeof(val) === 'object' && val !== null;
return ret;
};

 function __wbindgen_is_string(arg0) {
const ret = typeof(arg0) === 'string';
return ret;
};

 function __wbindgen_is_undefined(arg0) {
const ret = arg0 === undefined;
return ret;
};

 function __wbindgen_jsval_eq(arg0, arg1) {
const ret = arg0 === arg1;
return ret;
};

 function __wbindgen_jsval_loose_eq(arg0, arg1) {
const ret = arg0 == arg1;
return ret;
};

 function __wbindgen_memory() {
const ret = wasm.memory;
return ret;
};

 function __wbindgen_number_get(arg0, arg1) {
const obj = arg1;
const ret = typeof(obj) === 'number' ? obj : undefined;
getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

 function __wbindgen_number_new(arg0) {
const ret = arg0;
return ret;
};

 function __wbindgen_string_get(arg0, arg1) {
const obj = arg1;
const ret = typeof(obj) === 'string' ? obj : undefined;
var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
var len1 = WASM_VECTOR_LEN;
getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

 function __wbindgen_string_new(arg0, arg1) {
const ret = getStringFromWasm0(arg0, arg1);
return ret;
};

 function __wbindgen_throw(arg0, arg1) {
throw new Error(getStringFromWasm0(arg0, arg1));
};

return {
  [RAW_WASM]: wasm,
  __wbg_set_wasm,
  initializeTreeSitter,
  setupParser,
  run_module,
  scanFind,
  scanFix,
  dumpASTNodes,
  dumpPattern,
  __wbg_String_8f0eb39a4a4c2f66,
  __wbg_atob_b687cf564517d11e,
  __wbg_btoa_f1cc8b23625c1733,
  __wbg_buffer_609cc3eee51ed158,
  __wbg_call_672a4d21634d4a24,
  __wbg_call_7cccdd69e0791ae2,
  __wbg_childCount_a6b8bf01a93e53da,
  __wbg_childForFieldId_e1ff577760482763,
  __wbg_childForFieldName_c30c3ad6e6d7b2d5,
  __wbg_child_1ecd54afc9b93ff5,
  __wbg_children_9c7bca8276138d26,
  __wbg_column_e22f48f18c5be5af,
  __wbg_currentFieldId_45a539bb96e00de6,
  __wbg_currentFieldName_2bf460c2ff4cb55f,
  __wbg_currentNode_71762eadafc49fc0,
  __wbg_done_769e5ede4b31c67b,
  __wbg_endIndex_d3aa1552abc6599c,
  __wbg_endPosition_a4796193570eccbd,
  __wbg_entries_3265d4158b33e5dc,
  __wbg_error_55b26df739c2fe8b,
  __wbg_fetch_71724d6f0f8d9962,
  __wbg_fieldIdForName_ed243dd7e35f4861,
  __wbg_from_2a5d3e218e67aa85,
  __wbg_get_67b2ba62fc30de12,
  __wbg_get_b9b93047fe3cf45b,
  __wbg_getwithrefkey_1dc361bd10053bfe,
  __wbg_gotoFirstChild_252ce106a4886852,
  __wbg_gotoNextSibling_04b8655b389f7e62,
  __wbg_gotoParent_667cb6debc76112d,
  __wbg_idForNodeType_f69d5a20ec58af31,
  __wbg_id_46703548bec1f10b,
  __wbg_init_89fd7d76d7bb0691,
  __wbg_instanceof_ArrayBuffer_e14585432e3737fc,
  __wbg_instanceof_Error_4d54113b22d20306,
  __wbg_instanceof_Map_f3469ce2244d2430,
  __wbg_instanceof_Uint8Array_17156bcf118086a9,
  __wbg_isArray_a1eab7e0d067391b,
  __wbg_isMissing_fdcbb1d762ec3abf,
  __wbg_isNamed_e49e788404dd0c6b,
  __wbg_isSafeInteger_343e2beeeece1bb0,
  __wbg_iterator_9a24c88df860dc65,
  __wbg_length_a446193dc22c12f8,
  __wbg_length_e2d2a49132c1b256,
  __wbg_load_ac005a13bbebdb0b,
  __wbg_log_b79a24d377a91090,
  __wbg_message_97a2af9b89d693a3,
  __wbg_namedChildCount_44a0f24db74f4d08,
  __wbg_new_23a2665fac83c611,
  __wbg_new_405e22f390576ce2,
  __wbg_new_5e0be73521bc8c17,
  __wbg_new_617dbf964b61f53e,
  __wbg_new_78feb108b6472713,
  __wbg_new_a12002a7f91c75be,
  __wbg_newnoargs_105ed471475aaf50,
  __wbg_nextSibling_b371f151ed94a89b,
  __wbg_next_25feadfc0913fea9,
  __wbg_next_6574e1a8a62d1055,
  __wbg_parent_647e5f3765673032,
  __wbg_parse_211b75b6b50e2da5,
  __wbg_previousSibling_0d5cdd5a811cedb2,
  __wbg_push_737cfc8c1432c2c6,
  __wbg_queueMicrotask_97d92b4fcc8a61c5,
  __wbg_queueMicrotask_d3219def82552485,
  __wbg_resolve_4851785c9c5f573d,
  __wbg_rootNode_5b87afbf1cb30f6f,
  __wbg_row_3a241ac449e90b14,
  __wbg_setLanguage_183086649e428443,
  __wbg_set_37837023f3d740e8,
  __wbg_set_3f1d0b984ed272ed,
  __wbg_set_65595bdd868b3009,
  __wbg_set_8fc6bf8a5b1071d1,
  __wbg_set_bb8cecf6a62b9f46,
  __wbg_startIndex_466622c3156f49af,
  __wbg_startPosition_222a04896d7d160c,
  __wbg_static_accessor_GLOBAL_88a902d13a557d07,
  __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0,
  __wbg_static_accessor_SELF_37c5d418e4bf5819,
  __wbg_static_accessor_WINDOW_5de37043a91a9c40,
  __wbg_text_8bf8fa91111a698f,
  __wbg_then_44b73946d2fb3e7d,
  __wbg_then_48b406749878a531,
  __wbg_typeId_e158ac425466c562,
  __wbg_type_8c03f5de5dcc70e8,
  __wbg_value_cd1ffa7b1ab794f1,
  __wbg_walk_5a10ef3cc747c1a7,
  __wbg_warn_dec08065228a61fc,
  __wbindgen_bigint_from_i64,
  __wbindgen_bigint_from_u64,
  __wbindgen_bigint_get_as_i64,
  __wbindgen_boolean_get,
  __wbindgen_cb_drop,
  __wbindgen_closure_wrapper6118,
  __wbindgen_debug_string,
  __wbindgen_error_new,
  __wbindgen_in,
  __wbindgen_init_externref_table,
  __wbindgen_is_bigint,
  __wbindgen_is_function,
  __wbindgen_is_object,
  __wbindgen_is_string,
  __wbindgen_is_undefined,
  __wbindgen_jsval_eq,
  __wbindgen_jsval_loose_eq,
  __wbindgen_memory,
  __wbindgen_number_get,
  __wbindgen_number_new,
  __wbindgen_string_get,
  __wbindgen_string_new,
  __wbindgen_throw,
  Parser: Parser,
  Language: Language,
};
}