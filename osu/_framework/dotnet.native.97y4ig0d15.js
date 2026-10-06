
var createDotnetRuntime = (() => {
  var _scriptDir = import.meta.url;
  
  return (
async function(moduleArg = {}) {

// Support for growable heap + pthreads, where the buffer may change, so JS views
// must be updated.
function GROWABLE_HEAP_I8() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP8;
}
function GROWABLE_HEAP_U8() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU8;
}
function GROWABLE_HEAP_I16() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP16;
}
function GROWABLE_HEAP_U16() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU16;
}
function GROWABLE_HEAP_I32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAP32;
}
function GROWABLE_HEAP_U32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPU32;
}
function GROWABLE_HEAP_F32() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPF32;
}
function GROWABLE_HEAP_F64() {
  if (wasmMemory.buffer != HEAP8.buffer) {
    updateMemoryViews();
  }
  return HEAPF64;
}

var Module = moduleArg;

var readyPromiseResolve, readyPromiseReject;

Module["ready"] = new Promise((resolve, reject) => {
 readyPromiseResolve = resolve;
 readyPromiseReject = reject;
});

if (_nativeModuleLoaded) throw new Error("Native module already loaded");

_nativeModuleLoaded = true;

createDotnetRuntime = Module = moduleArg(Module);

var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
 throw toThrow;
};

var ENVIRONMENT_IS_WEB = typeof window == "object";

var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";

var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";

var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

var ENVIRONMENT_IS_PTHREAD = Module["ENVIRONMENT_IS_PTHREAD"] || false;

var scriptDirectory = "";

function locateFile(path) {
 if (Module["locateFile"]) {
  return Module["locateFile"](path, scriptDirectory);
 }
 return scriptDirectory + path;
}

var read_, readAsync, readBinary;

if (ENVIRONMENT_IS_NODE) {
 const {createRequire: createRequire} = await import("module");
 /** @suppress{duplicate} */ var require = createRequire(import.meta.url);
 var fs = require("fs");
 var nodePath = require("path");
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = nodePath.dirname(scriptDirectory) + "/";
 } else {
  scriptDirectory = require("url").fileURLToPath(new URL("./", import.meta.url));
 }
 read_ = (filename, binary) => {
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  return fs.readFileSync(filename, binary ? undefined : "utf8");
 };
 readBinary = filename => {
  var ret = read_(filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  return ret;
 };
 readAsync = (filename, onload, onerror, binary = true) => {
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  fs.readFile(filename, binary ? undefined : "utf8", (err, data) => {
   if (err) onerror(err); else onload(binary ? data.buffer : data);
  });
 };
 if (!Module["thisProgram"] && process.argv.length > 1) {
  thisProgram = process.argv[1].replace(/\\/g, "/");
 }
 arguments_ = process.argv.slice(2);
 quit_ = (status, toThrow) => {
  process.exitCode = status;
  throw toThrow;
 };
 global.Worker = require("worker_threads").Worker;
} else if (ENVIRONMENT_IS_SHELL) {
 if (typeof read != "undefined") {
  read_ = read;
 }
 readBinary = f => {
  if (typeof readbuffer == "function") {
   return new Uint8Array(readbuffer(f));
  }
  let data = read(f, "binary");
  assert(typeof data == "object");
  return data;
 };
 readAsync = (f, onload, onerror) => {
  setTimeout(() => onload(readBinary(f)));
 };
 if (typeof clearTimeout == "undefined") {
  globalThis.clearTimeout = id => {};
 }
 if (typeof setTimeout == "undefined") {
  globalThis.setTimeout = f => (typeof f == "function") ? f() : abort();
 }
 if (typeof scriptArgs != "undefined") {
  arguments_ = scriptArgs;
 } else if (typeof arguments != "undefined") {
  arguments_ = arguments;
 }
 if (typeof quit == "function") {
  quit_ = (status, toThrow) => {
   setTimeout(() => {
    if (!(toThrow instanceof ExitStatus)) {
     let toLog = toThrow;
     if (toThrow && typeof toThrow == "object" && toThrow.stack) {
      toLog = [ toThrow, toThrow.stack ];
     }
     err(`exiting due to exception: ${toLog}`);
    }
    quit(status);
   });
   throw toThrow;
  };
 }
 if (typeof print != "undefined") {
  if (typeof console == "undefined") console = /** @type{!Console} */ ({});
  console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
  console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr != "undefined" ? printErr : print);
 }
} else  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = self.location.href;
 } else if (typeof document != "undefined" && document.currentScript) {
  scriptDirectory = document.currentScript.src;
 }
 if (_scriptDir) {
  scriptDirectory = _scriptDir;
 }
 if (scriptDirectory.startsWith("blob:")) {
  scriptDirectory = "";
 } else {
  scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
 }
 if (!ENVIRONMENT_IS_NODE) {
  read_ = url => {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, false);
   xhr.send(null);
   return xhr.responseText;
  };
  if (ENVIRONMENT_IS_WORKER) {
   readBinary = url => {
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    xhr.responseType = "arraybuffer";
    xhr.send(null);
    return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
   };
  }
  readAsync = (url, onload, onerror) => {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, true);
   xhr.responseType = "arraybuffer";
   xhr.onload = () => {
    if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
     onload(xhr.response);
     return;
    }
    onerror();
   };
   xhr.onerror = onerror;
   xhr.send(null);
  };
 }
} else  {}

if (ENVIRONMENT_IS_NODE) {
 if (typeof performance == "undefined") {
  global.performance = require("perf_hooks").performance;
 }
}

var defaultPrint = console.log.bind(console);

var defaultPrintErr = console.error.bind(console);

if (ENVIRONMENT_IS_NODE) {
 defaultPrint = (...args) => fs.writeSync(1, args.join(" ") + "\n");
 defaultPrintErr = (...args) => fs.writeSync(2, args.join(" ") + "\n");
}

var out = Module["print"] || defaultPrint;

var err = Module["printErr"] || defaultPrintErr;

Object.assign(Module, moduleOverrides);

moduleOverrides = null;

if (Module["arguments"]) arguments_ = Module["arguments"];

if (Module["thisProgram"]) thisProgram = Module["thisProgram"];

if (Module["quit"]) quit_ = Module["quit"];

var wasmBinary;

if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];

if (typeof atob == "undefined") {
 if (typeof global != "undefined" && typeof globalThis == "undefined") {
  globalThis = global;
 }
 /**
   * Decodes a base64 string.
   * @param {string} input The string to decode.
   */ globalThis.atob = function(input) {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  do {
   enc1 = keyStr.indexOf(input.charAt(i++));
   enc2 = keyStr.indexOf(input.charAt(i++));
   enc3 = keyStr.indexOf(input.charAt(i++));
   enc4 = keyStr.indexOf(input.charAt(i++));
   chr1 = (enc1 << 2) | (enc2 >> 4);
   chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
   chr3 = ((enc3 & 3) << 6) | enc4;
   output = output + String.fromCharCode(chr1);
   if (enc3 !== 64) {
    output = output + String.fromCharCode(chr2);
   }
   if (enc4 !== 64) {
    output = output + String.fromCharCode(chr3);
   }
  } while (i < input.length);
  return output;
 };
}

function intArrayFromBase64(s) {
 if (typeof ENVIRONMENT_IS_NODE != "undefined" && ENVIRONMENT_IS_NODE) {
  var buf = Buffer.from(s, "base64");
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
 }
 var decoded = atob(s);
 var bytes = new Uint8Array(decoded.length);
 for (var i = 0; i < decoded.length; ++i) {
  bytes[i] = decoded.charCodeAt(i);
 }
 return bytes;
}

function tryParseAsDataURI(filename) {
 if (!isDataURI(filename)) {
  return;
 }
 return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}

var wasmMemory;

var wasmModule;

var ABORT = false;

var EXITSTATUS;

/** @type {function(*, string=)} */ function assert(condition, text) {
 if (!condition) {
  abort(text);
 }
}

var HEAP, /** @type {!Int8Array} */ HEAP8, /** @type {!Uint8Array} */ HEAPU8, /** @type {!Int16Array} */ HEAP16, /** @type {!Uint16Array} */ HEAPU16, /** @type {!Int32Array} */ HEAP32, /** @type {!Uint32Array} */ HEAPU32, /** @type {!Float32Array} */ HEAPF32, /* BigInt64Array type is not correctly defined in closure
/** not-@type {!BigInt64Array} */ HEAP64, /* BigUInt64Array type is not correctly defined in closure
/** not-t@type {!BigUint64Array} */ HEAPU64, /** @type {!Float64Array} */ HEAPF64;

function updateMemoryViews() {
 var b = wasmMemory.buffer;
 Module["HEAP8"] = HEAP8 = new Int8Array(b);
 Module["HEAP16"] = HEAP16 = new Int16Array(b);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
 Module["HEAP32"] = HEAP32 = new Int32Array(b);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
 Module["HEAP64"] = HEAP64 = new BigInt64Array(b);
 Module["HEAPU64"] = HEAPU64 = new BigUint64Array(b);
}

var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 268435456;

if (ENVIRONMENT_IS_PTHREAD) {
 wasmMemory = Module["wasmMemory"];
} else {
 if (Module["wasmMemory"]) {
  wasmMemory = Module["wasmMemory"];
 } else {
  wasmMemory = new WebAssembly.Memory({
   "initial": INITIAL_MEMORY / 65536,
   "maximum": 2147483648 / 65536,
   "shared": true
  });
  if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
   err("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag");
   if (ENVIRONMENT_IS_NODE) {
    err("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)");
   }
   throw Error("bad memory");
  }
 }
}

updateMemoryViews();

INITIAL_MEMORY = wasmMemory.buffer.byteLength;

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATEXIT__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

var runtimeExited = false;

function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
 runtimeInitialized = true;
 if (ENVIRONMENT_IS_PTHREAD) return;
 if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
 FS.ignorePermissions = false;
 TTY.init();
 SOCKFS.root = FS.mount(SOCKFS, {}, null);
 callRuntimeCallbacks(__ATINIT__);
}

function exitRuntime() {
 if (ENVIRONMENT_IS_PTHREAD) return;
 ___funcs_on_exit();
 callRuntimeCallbacks(__ATEXIT__);
 FS.quit();
 TTY.shutdown();
 PThread.terminateAllThreads();
 runtimeExited = true;
}

function postRun() {
 if (ENVIRONMENT_IS_PTHREAD) return;
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}

function addOnExit(cb) {
 __ATEXIT__.unshift(cb);
}

function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

function getUniqueRunDependency(id) {
 return id;
}

function addRunDependency(id) {
 runDependencies++;
 Module["monitorRunDependencies"]?.(runDependencies);
}

function removeRunDependency(id) {
 runDependencies--;
 Module["monitorRunDependencies"]?.(runDependencies);
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}

/** @param {string|number=} what */ function abort(what) {
 Module["onAbort"]?.(what);
 what = "Aborted(" + what + ")";
 err(what);
 ABORT = true;
 EXITSTATUS = 1;
 what += ". Build with -sASSERTIONS for more info.";
 if (runtimeInitialized) {
  ___trap();
 }
 /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
 readyPromiseReject(e);
 throw e;
}

var dataURIPrefix = "data:application/octet-stream;base64,";

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */ var isDataURI = filename => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = filename => filename.startsWith("file://");

var wasmBinaryFile;

if (Module["locateFile"]) {
 wasmBinaryFile = "dotnet.native.wasm";
 if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
 }
} else {
 if (ENVIRONMENT_IS_SHELL) wasmBinaryFile = "dotnet.native.wasm"; else  wasmBinaryFile = new URL("dotnet.native.wasm", import.meta.url).href;
}

function getBinarySync(file) {
 if (file == wasmBinaryFile && wasmBinary) {
  return new Uint8Array(wasmBinary);
 }
 if (readBinary) {
  return readBinary(file);
 }
 throw "both async and sync fetching of the wasm failed";
}

function getBinaryPromise(binaryFile) {
 if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
  if (typeof fetch == "function" && !isFileURI(binaryFile)) {
   return fetch(binaryFile, {
    credentials: "same-origin"
   }).then(response => {
    if (!response["ok"]) {
     throw `failed to load wasm binary file at '${binaryFile}'`;
    }
    return response["arrayBuffer"]();
   }).catch(() => getBinarySync(binaryFile));
  } else if (readAsync) {
   return new Promise((resolve, reject) => {
    readAsync(binaryFile, response => resolve(new Uint8Array(/** @type{!ArrayBuffer} */ (response))), reject);
   });
  }
 }
 return Promise.resolve().then(() => getBinarySync(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
 return getBinaryPromise(binaryFile).then(binary => WebAssembly.instantiate(binary, imports)).then(receiver, reason => {
  err(`failed to asynchronously prepare wasm: ${reason}`);
  abort(reason);
 });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
 if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) &&  !isFileURI(binaryFile) &&  !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
  return fetch(binaryFile, {
   credentials: "same-origin"
  }).then(response => {
   /** @suppress {checkTypes} */ var result = WebAssembly.instantiateStreaming(response, imports);
   return result.then(callback, function(reason) {
    err(`wasm streaming compile failed: ${reason}`);
    err("falling back to ArrayBuffer instantiation");
    return instantiateArrayBuffer(binaryFile, imports, callback);
   });
  });
 }
 return instantiateArrayBuffer(binaryFile, imports, callback);
}

function createWasm() {
 var info = {
  "env": wasmImports,
  "wasi_snapshot_preview1": wasmImports
 };
 /** @param {WebAssembly.Module=} module*/ function receiveInstance(instance, module) {
  wasmExports = instance.exports;
  Module["wasmExports"] = wasmExports;
  registerTLSInit(wasmExports["_emscripten_tls_init"]);
  wasmTable = wasmExports["__indirect_function_table"];
  addOnInit(wasmExports["__wasm_call_ctors"]);
  wasmModule = module;
  removeRunDependency("wasm-instantiate");
  return wasmExports;
 }
 addRunDependency("wasm-instantiate");
 function receiveInstantiationResult(result) {
  receiveInstance(result["instance"], result["module"]);
 }
 if (Module["instantiateWasm"]) {
  try {
   return Module["instantiateWasm"](info, receiveInstance);
  } catch (e) {
   err(`Module.instantiateWasm callback failed with error: ${e}`);
   readyPromiseReject(e);
  }
 }
 instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
 return {};
}

/** @constructor */ function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = `Program terminated with exit(${status})`;
 this.status = status;
}

var terminateWorker = worker => {
 worker.terminate();
 worker.onmessage = e => {};
};

var killThread = pthread_ptr => {
 var worker = PThread.pthreads[pthread_ptr];
 delete PThread.pthreads[pthread_ptr];
 terminateWorker(worker);
 __emscripten_thread_free_data(pthread_ptr);
 PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
 worker.pthread_ptr = 0;
};

var cancelThread = pthread_ptr => {
 var worker = PThread.pthreads[pthread_ptr];
 worker.postMessage({
  "cmd": "cancel"
 });
};

var cleanupThread = pthread_ptr => {
 var worker = PThread.pthreads[pthread_ptr];
 PThread.returnWorkerToPool(worker);
};

var zeroMemory = (address, size) => {
 GROWABLE_HEAP_U8().fill(0, address, address + size);
 return address;
};

var spawnThread = threadParams => {
 var worker = PThread.getNewWorker();
 if (!worker) {
  return 6;
 }
 PThread.runningWorkers.push(worker);
 PThread.pthreads[threadParams.pthread_ptr] = worker;
 worker.pthread_ptr = threadParams.pthread_ptr;
 var msg = {
  "cmd": "run",
  "start_routine": threadParams.startRoutine,
  "arg": threadParams.arg,
  "pthread_ptr": threadParams.pthread_ptr
 };
 if (ENVIRONMENT_IS_NODE) {
  worker.unref();
 }
 worker.postMessage(msg, threadParams.transferList);
 return 0;
};

var runtimeKeepaliveCounter = 0;

var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;

var withStackSave = f => {
 var stack = stackSave();
 var ret = f();
 stackRestore(stack);
 return ret;
};

var MAX_INT53 = 9007199254740992;

var MIN_INT53 = -9007199254740992;

var bigintToI53Checked = num => (num < MIN_INT53 || num > MAX_INT53) ? NaN : Number(num);

/** @type{function(number, (number|boolean), ...number)} */ var proxyToMainThread = (funcIndex, emAsmAddr, sync, ...callArgs) => withStackSave(() => {
 var serializedNumCallArgs = callArgs.length * 2;
 var args = stackAlloc(serializedNumCallArgs * 8);
 var b = ((args) >> 3);
 for (var i = 0; i < callArgs.length; i++) {
  var arg = callArgs[i];
  if (typeof arg == "bigint") {
   HEAP64[b + 2 * i] = 1n;
   HEAP64[b + 2 * i + 1] = arg;
  } else {
   HEAP64[b + 2 * i] = 0n;
   GROWABLE_HEAP_F64()[b + 2 * i + 1] = arg;
  }
 }
 return __emscripten_run_on_main_thread_js(funcIndex, emAsmAddr, serializedNumCallArgs, args, sync);
});

function _proc_exit(code) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(0, 0, 1, code);
 EXITSTATUS = code;
 if (!keepRuntimeAlive()) {
  PThread.terminateAllThreads();
  Module["onExit"]?.(code);
  ABORT = true;
 }
 quit_(code, new ExitStatus(code));
}

/** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
 EXITSTATUS = status;
 if (ENVIRONMENT_IS_PTHREAD) {
  exitOnMainThread(status);
  throw "unwind";
 }
 if (!keepRuntimeAlive()) {
  exitRuntime();
 }
 _proc_exit(status);
};

var _exit = exitJS;

var handleException = e => {
 if (e instanceof ExitStatus || e == "unwind") {
  return EXITSTATUS;
 }
 quit_(1, e);
};

var PThread = {
 unusedWorkers: [],
 runningWorkers: [],
 tlsInitFunctions: [],
 pthreads: {},
 init() {
  if (ENVIRONMENT_IS_PTHREAD) {
   PThread.initWorker();
  } else {
   PThread.initMainThread();
  }
 },
 initMainThread() {
  addOnPreRun(() => {
   addRunDependency("loading-workers");
   PThread.loadWasmModuleToAllWorkers(() => removeRunDependency("loading-workers"));
  });
 },
 initWorker() {
  PThread["receiveObjectTransfer"] = PThread.receiveObjectTransfer;
  PThread["threadInitTLS"] = PThread.threadInitTLS;
  PThread["setExitStatus"] = PThread.setExitStatus;
  noExitRuntime = false;
 },
 setExitStatus: status => EXITSTATUS = status,
 terminateAllThreads__deps: [ "$terminateWorker" ],
 terminateAllThreads: () => {
  for (var worker of PThread.runningWorkers) {
   terminateWorker(worker);
  }
  for (var worker of PThread.unusedWorkers) {
   terminateWorker(worker);
  }
  PThread.unusedWorkers = [];
  PThread.runningWorkers = [];
  PThread.pthreads = [];
 },
 returnWorkerToPool: worker => {
  var pthread_ptr = worker.pthread_ptr;
  delete PThread.pthreads[pthread_ptr];
  PThread.unusedWorkers.push(worker);
  PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
  worker.pthread_ptr = 0;
  __emscripten_thread_free_data(pthread_ptr);
 },
 receiveObjectTransfer(data) {},
 threadInitTLS() {
  PThread.tlsInitFunctions.forEach(f => f());
 },
 loadWasmModuleToWorker: worker => new Promise(onFinishedLoading => {
  worker.onmessage = e => {
   var d = e["data"];
   var cmd = d["cmd"];
   if (d["targetThread"] && d["targetThread"] != _pthread_self()) {
    var targetWorker = PThread.pthreads[d["targetThread"]];
    if (targetWorker) {
     targetWorker.postMessage(d, d["transferList"]);
    } else {
     err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d["targetThread"]}, but that thread no longer exists!`);
    }
    return;
   }
   if (cmd === "checkMailbox") {
    checkMailbox();
   } else if (cmd === "spawnThread") {
    spawnThread(d);
   } else if (cmd === "cleanupThread") {
    cleanupThread(d["thread"]);
   } else if (cmd === "killThread") {
    killThread(d["thread"]);
   } else if (cmd === "cancelThread") {
    cancelThread(d["thread"]);
   } else if (cmd === "loaded") {
    worker.loaded = true;
    onFinishedLoading(worker);
   } else if (cmd === "alert") {
    alert(`Thread ${d["threadId"]}: ${d["text"]}`);
   } else if (d.target === "setimmediate") {
    worker.postMessage(d);
   } else if (cmd === "callHandler") {
    Module[d["handler"]](...d["args"]);
   } else if (cmd) {
    err(`worker sent an unknown command ${cmd}`);
   }
  };
  worker.onerror = e => {
   var message = "worker sent an error!";
   err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
   throw e;
  };
  if (ENVIRONMENT_IS_NODE) {
   worker.on("message", data => worker.onmessage({
    data: data
   }));
   worker.on("error", e => worker.onerror(e));
  }
  var handlers = [];
  var knownHandlers = [ "onExit", "onAbort", "print", "printErr" ];
  for (var handler of knownHandlers) {
   if (Module.hasOwnProperty(handler)) {
    handlers.push(handler);
   }
  }
  worker.postMessage({
   "cmd": "load",
   "handlers": handlers,
   "urlOrBlob": Module["mainScriptUrlOrBlob"],
   "wasmMemory": wasmMemory,
   "wasmModule": wasmModule
  });
 }),
 loadWasmModuleToAllWorkers(onMaybeReady) {
  onMaybeReady();
 },
 allocateUnusedWorker() {
  var worker;
  if (!Module["locateFile"]) {
   worker = new Worker(new URL("dotnet.native.worker.mjs", import.meta.url), {
    type: "module"
   });
  } else {
   var pthreadMainJs = locateFile("dotnet.native.worker.mjs");
   worker = new Worker(pthreadMainJs, {
    type: "module"
   });
  }
  PThread.unusedWorkers.push(worker);
 },
 getNewWorker() {
  if (PThread.unusedWorkers.length == 0) {
   PThread.allocateUnusedWorker();
   PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
  }
  return PThread.unusedWorkers.pop();
 }
};

Module["PThread"] = PThread;

var callRuntimeCallbacks = callbacks => {
 while (callbacks.length > 0) {
  callbacks.shift()(Module);
 }
};

var establishStackSpace = () => {
 var pthread_ptr = _pthread_self();
 var stackHigh = GROWABLE_HEAP_U32()[(((pthread_ptr) + (52)) >> 2)];
 var stackSize = GROWABLE_HEAP_U32()[(((pthread_ptr) + (56)) >> 2)];
 var stackLow = stackHigh - stackSize;
 _emscripten_stack_set_limits(stackHigh, stackLow);
 stackRestore(stackHigh);
};

Module["establishStackSpace"] = establishStackSpace;

function exitOnMainThread(returnCode) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(1, 0, 0, returnCode);
 _exit(returnCode);
}

/**
     * @param {number} ptr
     * @param {string} type
     */ function getValue(ptr, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  return GROWABLE_HEAP_I8()[ptr];

 case "i8":
  return GROWABLE_HEAP_I8()[ptr];

 case "i16":
  return GROWABLE_HEAP_I16()[((ptr) >> 1)];

 case "i32":
  return GROWABLE_HEAP_I32()[((ptr) >> 2)];

 case "i64":
  return HEAP64[((ptr) >> 3)];

 case "float":
  return GROWABLE_HEAP_F32()[((ptr) >> 2)];

 case "double":
  return GROWABLE_HEAP_F64()[((ptr) >> 3)];

 case "*":
  return GROWABLE_HEAP_U32()[((ptr) >> 2)];

 default:
  abort(`invalid type for getValue: ${type}`);
 }
}

var wasmTableMirror = [];

var wasmTable;

var getWasmTableEntry = funcPtr => {
 var func = wasmTableMirror[funcPtr];
 if (!func) {
  if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
  wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
 }
 return func;
};

var invokeEntryPoint = (ptr, arg) => {
 runtimeKeepaliveCounter = 0;
 var result = getWasmTableEntry(ptr)(arg);
 function finish(result) {
  if (keepRuntimeAlive()) {
   PThread.setExitStatus(result);
  } else {
   __emscripten_thread_exit(result);
  }
 }
 finish(result);
};

Module["invokeEntryPoint"] = invokeEntryPoint;

var noExitRuntime = Module["noExitRuntime"] || false;

var registerTLSInit = tlsInitFunc => PThread.tlsInitFunctions.push(tlsInitFunc);

/**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */ function setValue(ptr, value, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  GROWABLE_HEAP_I8()[ptr] = value;
  break;

 case "i8":
  GROWABLE_HEAP_I8()[ptr] = value;
  break;

 case "i16":
  GROWABLE_HEAP_I16()[((ptr) >> 1)] = value;
  break;

 case "i32":
  GROWABLE_HEAP_I32()[((ptr) >> 2)] = value;
  break;

 case "i64":
  HEAP64[((ptr) >> 3)] = BigInt(value);
  break;

 case "float":
  GROWABLE_HEAP_F32()[((ptr) >> 2)] = value;
  break;

 case "double":
  GROWABLE_HEAP_F64()[((ptr) >> 3)] = value;
  break;

 case "*":
  GROWABLE_HEAP_U32()[((ptr) >> 2)] = value;
  break;

 default:
  abort(`invalid type for setValue: ${type}`);
 }
}

/**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */ var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
 var endIdx = idx + maxBytesToRead;
 var str = "";
 while (!(idx >= endIdx)) {
  var u0 = heapOrArray[idx++];
  if (!u0) return str;
  if (!(u0 & 128)) {
   str += String.fromCharCode(u0);
   continue;
  }
  var u1 = heapOrArray[idx++] & 63;
  if ((u0 & 224) == 192) {
   str += String.fromCharCode(((u0 & 31) << 6) | u1);
   continue;
  }
  var u2 = heapOrArray[idx++] & 63;
  if ((u0 & 240) == 224) {
   u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
  } else {
   u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
  }
  if (u0 < 65536) {
   str += String.fromCharCode(u0);
  } else {
   var ch = u0 - 65536;
   str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
  }
 }
 return str;
};

/**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */ var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(GROWABLE_HEAP_U8(), ptr, maxBytesToRead) : "";

var ___assert_fail = (condition, filename, line, func) => {
 abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);
};

var ___emscripten_init_main_thread_js = tb => {
 __emscripten_thread_init(tb, /*is_main=*/ !ENVIRONMENT_IS_WORKER, /*is_runtime=*/ 1, /*can_block=*/ !ENVIRONMENT_IS_WEB, /*default_stacksize=*/ 2097152, /*start_profiling=*/ false);
 PThread.threadInitTLS();
};

var ___emscripten_thread_cleanup = thread => {
 if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread); else postMessage({
  "cmd": "cleanupThread",
  "thread": thread
 });
};

function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(2, 0, 1, pthread_ptr, attr, startRoutine, arg);
 return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg);
}

var ___pthread_create_js = (pthread_ptr, attr, startRoutine, arg) => {
 if (typeof SharedArrayBuffer == "undefined") {
  err("Current environment does not support SharedArrayBuffer, pthreads are not available!");
  return 6;
 }
 var transferList = [];
 var error = 0;
 if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
  return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg);
 }
 if (error) return error;
 var threadParams = {
  startRoutine: startRoutine,
  pthread_ptr: pthread_ptr,
  arg: arg,
  transferList: transferList
 };
 if (ENVIRONMENT_IS_PTHREAD) {
  threadParams.cmd = "spawnThread";
  postMessage(threadParams, transferList);
  return 0;
 }
 return spawnThread(threadParams);
};

var PATH = {
 isAbs: path => path.charAt(0) === "/",
 splitPath: filename => {
  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  return splitPathRe.exec(filename).slice(1);
 },
 normalizeArray: (parts, allowAboveRoot) => {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
   var last = parts[i];
   if (last === ".") {
    parts.splice(i, 1);
   } else if (last === "..") {
    parts.splice(i, 1);
    up++;
   } else if (up) {
    parts.splice(i, 1);
    up--;
   }
  }
  if (allowAboveRoot) {
   for (;up; up--) {
    parts.unshift("..");
   }
  }
  return parts;
 },
 normalize: path => {
  var isAbsolute = PATH.isAbs(path), trailingSlash = path.substr(-1) === "/";
  path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
   path = ".";
  }
  if (path && trailingSlash) {
   path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
 },
 dirname: path => {
  var result = PATH.splitPath(path), root = result[0], dir = result[1];
  if (!root && !dir) {
   return ".";
  }
  if (dir) {
   dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
 },
 basename: path => {
  if (path === "/") return "/";
  path = PATH.normalize(path);
  path = path.replace(/\/$/, "");
  var lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) return path;
  return path.substr(lastSlash + 1);
 },
 join: (...paths) => PATH.normalize(paths.join("/")),
 join2: (l, r) => PATH.normalize(l + "/" + r)
};

var initRandomFill = () => {
 if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
  return view => (view.set(crypto.getRandomValues(new Uint8Array(view.byteLength))), 
  view);
 } else if (ENVIRONMENT_IS_NODE) {
  try {
   var crypto_module = require("crypto");
   var randomFillSync = crypto_module["randomFillSync"];
   if (randomFillSync) {
    return view => crypto_module["randomFillSync"](view);
   }
   var randomBytes = crypto_module["randomBytes"];
   return view => (view.set(randomBytes(view.byteLength)),  view);
  } catch (e) {}
 }
 abort("initRandomDevice");
};

var randomFill = view => (randomFill = initRandomFill())(view);

var PATH_FS = {
 resolve: (...args) => {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
   var path = (i >= 0) ? args[i] : FS.cwd();
   if (typeof path != "string") {
    throw new TypeError("Arguments to path.resolve must be strings");
   } else if (!path) {
    return "";
   }
   resolvedPath = path + "/" + resolvedPath;
   resolvedAbsolute = PATH.isAbs(path);
  }
  resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
  return ((resolvedAbsolute ? "/" : "") + resolvedPath) || ".";
 },
 relative: (from, to) => {
  from = PATH_FS.resolve(from).substr(1);
  to = PATH_FS.resolve(to).substr(1);
  function trim(arr) {
   var start = 0;
   for (;start < arr.length; start++) {
    if (arr[start] !== "") break;
   }
   var end = arr.length - 1;
   for (;end >= 0; end--) {
    if (arr[end] !== "") break;
   }
   if (start > end) return [];
   return arr.slice(start, end - start + 1);
  }
  var fromParts = trim(from.split("/"));
  var toParts = trim(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
   if (fromParts[i] !== toParts[i]) {
    samePartsLength = i;
    break;
   }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
   outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
 }
};

var FS_stdin_getChar_buffer = [];

var lengthBytesUTF8 = str => {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var c = str.charCodeAt(i);
  if (c <= 127) {
   len++;
  } else if (c <= 2047) {
   len += 2;
  } else if (c >= 55296 && c <= 57343) {
   len += 4;
   ++i;
  } else {
   len += 3;
  }
 }
 return len;
};

var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) {
   var u1 = str.charCodeAt(++i);
   u = 65536 + ((u & 1023) << 10) | (u1 & 1023);
  }
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   heap[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   heap[outIdx++] = 192 | (u >> 6);
   heap[outIdx++] = 128 | (u & 63);
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   heap[outIdx++] = 224 | (u >> 12);
   heap[outIdx++] = 128 | ((u >> 6) & 63);
   heap[outIdx++] = 128 | (u & 63);
  } else {
   if (outIdx + 3 >= endIdx) break;
   heap[outIdx++] = 240 | (u >> 18);
   heap[outIdx++] = 128 | ((u >> 12) & 63);
   heap[outIdx++] = 128 | ((u >> 6) & 63);
   heap[outIdx++] = 128 | (u & 63);
  }
 }
 heap[outIdx] = 0;
 return outIdx - startIdx;
};

/** @type {function(string, boolean=, number=)} */ function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}

var FS_stdin_getChar = () => {
 if (!FS_stdin_getChar_buffer.length) {
  var result = null;
  if (ENVIRONMENT_IS_NODE) {
   var BUFSIZE = 256;
   var buf = Buffer.alloc(BUFSIZE);
   var bytesRead = 0;
   /** @suppress {missingProperties} */ var fd = process.stdin.fd;
   try {
    bytesRead = fs.readSync(fd, buf);
   } catch (e) {
    if (e.toString().includes("EOF")) bytesRead = 0; else throw e;
   }
   if (bytesRead > 0) {
    result = buf.slice(0, bytesRead).toString("utf-8");
   } else {
    result = null;
   }
  } else if (typeof window != "undefined" && typeof window.prompt == "function") {
   result = window.prompt("Input: ");
   if (result !== null) {
    result += "\n";
   }
  } else if (typeof readline == "function") {
   result = readline();
   if (result !== null) {
    result += "\n";
   }
  }
  if (!result) {
   return null;
  }
  FS_stdin_getChar_buffer = intArrayFromString(result, true);
 }
 return FS_stdin_getChar_buffer.shift();
};

var TTY = {
 ttys: [],
 init() {},
 shutdown() {},
 register(dev, ops) {
  TTY.ttys[dev] = {
   input: [],
   output: [],
   ops: ops
  };
  FS.registerDevice(dev, TTY.stream_ops);
 },
 stream_ops: {
  open(stream) {
   var tty = TTY.ttys[stream.node.rdev];
   if (!tty) {
    throw new FS.ErrnoError(43);
   }
   stream.tty = tty;
   stream.seekable = false;
  },
  close(stream) {
   stream.tty.ops.fsync(stream.tty);
  },
  fsync(stream) {
   stream.tty.ops.fsync(stream.tty);
  },
  read(stream, buffer, offset, length, pos) {
   /* ignored */ if (!stream.tty || !stream.tty.ops.get_char) {
    throw new FS.ErrnoError(60);
   }
   var bytesRead = 0;
   for (var i = 0; i < length; i++) {
    var result;
    try {
     result = stream.tty.ops.get_char(stream.tty);
    } catch (e) {
     throw new FS.ErrnoError(29);
    }
    if (result === undefined && bytesRead === 0) {
     throw new FS.ErrnoError(6);
    }
    if (result === null || result === undefined) break;
    bytesRead++;
    buffer[offset + i] = result;
   }
   if (bytesRead) {
    stream.node.timestamp = Date.now();
   }
   return bytesRead;
  },
  write(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.put_char) {
    throw new FS.ErrnoError(60);
   }
   try {
    for (var i = 0; i < length; i++) {
     stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
    }
   } catch (e) {
    throw new FS.ErrnoError(29);
   }
   if (length) {
    stream.node.timestamp = Date.now();
   }
   return i;
  }
 },
 default_tty_ops: {
  get_char(tty) {
   return FS_stdin_getChar();
  },
  put_char(tty, val) {
   if (val === null || val === 10) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  fsync(tty) {
   if (tty.output && tty.output.length > 0) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  },
  ioctl_tcgets(tty) {
   return {
    c_iflag: 25856,
    c_oflag: 5,
    c_cflag: 191,
    c_lflag: 35387,
    c_cc: [ 3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
   };
  },
  ioctl_tcsets(tty, optional_actions, data) {
   return 0;
  },
  ioctl_tiocgwinsz(tty) {
   return [ 24, 80 ];
  }
 },
 default_tty1_ops: {
  put_char(tty, val) {
   if (val === null || val === 10) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  fsync(tty) {
   if (tty.output && tty.output.length > 0) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  }
 }
};

var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;

var mmapAlloc = size => {
 size = alignMemory(size, 65536);
 var ptr = _emscripten_builtin_memalign(65536, size);
 if (!ptr) return 0;
 return zeroMemory(ptr, size);
};

var MEMFS = {
 ops_table: null,
 mount(mount) {
  return MEMFS.createNode(null, "/", 16384 | 511, /* 0777 */ 0);
 },
 createNode(parent, name, mode, dev) {
  if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
   throw new FS.ErrnoError(63);
  }
  MEMFS.ops_table ||= {
   dir: {
    node: {
     getattr: MEMFS.node_ops.getattr,
     setattr: MEMFS.node_ops.setattr,
     lookup: MEMFS.node_ops.lookup,
     mknod: MEMFS.node_ops.mknod,
     rename: MEMFS.node_ops.rename,
     unlink: MEMFS.node_ops.unlink,
     rmdir: MEMFS.node_ops.rmdir,
     readdir: MEMFS.node_ops.readdir,
     symlink: MEMFS.node_ops.symlink
    },
    stream: {
     llseek: MEMFS.stream_ops.llseek
    }
   },
   file: {
    node: {
     getattr: MEMFS.node_ops.getattr,
     setattr: MEMFS.node_ops.setattr
    },
    stream: {
     llseek: MEMFS.stream_ops.llseek,
     read: MEMFS.stream_ops.read,
     write: MEMFS.stream_ops.write,
     allocate: MEMFS.stream_ops.allocate,
     mmap: MEMFS.stream_ops.mmap,
     msync: MEMFS.stream_ops.msync
    }
   },
   link: {
    node: {
     getattr: MEMFS.node_ops.getattr,
     setattr: MEMFS.node_ops.setattr,
     readlink: MEMFS.node_ops.readlink
    },
    stream: {}
   },
   chrdev: {
    node: {
     getattr: MEMFS.node_ops.getattr,
     setattr: MEMFS.node_ops.setattr
    },
    stream: FS.chrdev_stream_ops
   }
  };
  var node = FS.createNode(parent, name, mode, dev);
  if (FS.isDir(node.mode)) {
   node.node_ops = MEMFS.ops_table.dir.node;
   node.stream_ops = MEMFS.ops_table.dir.stream;
   node.contents = {};
  } else if (FS.isFile(node.mode)) {
   node.node_ops = MEMFS.ops_table.file.node;
   node.stream_ops = MEMFS.ops_table.file.stream;
   node.usedBytes = 0;
   node.contents = null;
  } else if (FS.isLink(node.mode)) {
   node.node_ops = MEMFS.ops_table.link.node;
   node.stream_ops = MEMFS.ops_table.link.stream;
  } else if (FS.isChrdev(node.mode)) {
   node.node_ops = MEMFS.ops_table.chrdev.node;
   node.stream_ops = MEMFS.ops_table.chrdev.stream;
  }
  node.timestamp = Date.now();
  if (parent) {
   parent.contents[name] = node;
   parent.timestamp = node.timestamp;
  }
  return node;
 },
 getFileDataAsTypedArray(node) {
  if (!node.contents) return new Uint8Array(0);
  if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
  return new Uint8Array(node.contents);
 },
 expandFileStorage(node, newCapacity) {
  var prevCapacity = node.contents ? node.contents.length : 0;
  if (prevCapacity >= newCapacity) return;
  var CAPACITY_DOUBLING_MAX = 1024 * 1024;
  newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
  if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
  var oldContents = node.contents;
  node.contents = new Uint8Array(newCapacity);
  if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
 },
 resizeFileStorage(node, newSize) {
  if (node.usedBytes == newSize) return;
  if (newSize == 0) {
   node.contents = null;
   node.usedBytes = 0;
  } else {
   var oldContents = node.contents;
   node.contents = new Uint8Array(newSize);
   if (oldContents) {
    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
   }
   node.usedBytes = newSize;
  }
 },
 node_ops: {
  getattr(node) {
   var attr = {};
   attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
   attr.ino = node.id;
   attr.mode = node.mode;
   attr.nlink = 1;
   attr.uid = 0;
   attr.gid = 0;
   attr.rdev = node.rdev;
   if (FS.isDir(node.mode)) {
    attr.size = 4096;
   } else if (FS.isFile(node.mode)) {
    attr.size = node.usedBytes;
   } else if (FS.isLink(node.mode)) {
    attr.size = node.link.length;
   } else {
    attr.size = 0;
   }
   attr.atime = new Date(node.timestamp);
   attr.mtime = new Date(node.timestamp);
   attr.ctime = new Date(node.timestamp);
   attr.blksize = 4096;
   attr.blocks = Math.ceil(attr.size / attr.blksize);
   return attr;
  },
  setattr(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
   if (attr.size !== undefined) {
    MEMFS.resizeFileStorage(node, attr.size);
   }
  },
  lookup(parent, name) {
   throw FS.genericErrors[44];
  },
  mknod(parent, name, mode, dev) {
   return MEMFS.createNode(parent, name, mode, dev);
  },
  rename(old_node, new_dir, new_name) {
   if (FS.isDir(old_node.mode)) {
    var new_node;
    try {
     new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (new_node) {
     for (var i in new_node.contents) {
      throw new FS.ErrnoError(55);
     }
    }
   }
   delete old_node.parent.contents[old_node.name];
   old_node.parent.timestamp = Date.now();
   old_node.name = new_name;
   new_dir.contents[new_name] = old_node;
   new_dir.timestamp = old_node.parent.timestamp;
   old_node.parent = new_dir;
  },
  unlink(parent, name) {
   delete parent.contents[name];
   parent.timestamp = Date.now();
  },
  rmdir(parent, name) {
   var node = FS.lookupNode(parent, name);
   for (var i in node.contents) {
    throw new FS.ErrnoError(55);
   }
   delete parent.contents[name];
   parent.timestamp = Date.now();
  },
  readdir(node) {
   var entries = [ ".", ".." ];
   for (var key of Object.keys(node.contents)) {
    entries.push(key);
   }
   return entries;
  },
  symlink(parent, newname, oldpath) {
   var node = MEMFS.createNode(parent, newname, 511 | /* 0777 */ 40960, 0);
   node.link = oldpath;
   return node;
  },
  readlink(node) {
   if (!FS.isLink(node.mode)) {
    throw new FS.ErrnoError(28);
   }
   return node.link;
  }
 },
 stream_ops: {
  read(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= stream.node.usedBytes) return 0;
   var size = Math.min(stream.node.usedBytes - position, length);
   if (size > 8 && contents.subarray) {
    buffer.set(contents.subarray(position, position + size), offset);
   } else {
    for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
   }
   return size;
  },
  write(stream, buffer, offset, length, position, canOwn) {
   if (buffer.buffer === GROWABLE_HEAP_I8().buffer) {
    canOwn = false;
   }
   if (!length) return 0;
   var node = stream.node;
   node.timestamp = Date.now();
   if (buffer.subarray && (!node.contents || node.contents.subarray)) {
    if (canOwn) {
     node.contents = buffer.subarray(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (node.usedBytes === 0 && position === 0) {
     node.contents = buffer.slice(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (position + length <= node.usedBytes) {
     node.contents.set(buffer.subarray(offset, offset + length), position);
     return length;
    }
   }
   MEMFS.expandFileStorage(node, position + length);
   if (node.contents.subarray && buffer.subarray) {
    node.contents.set(buffer.subarray(offset, offset + length), position);
   } else {
    for (var i = 0; i < length; i++) {
     node.contents[position + i] = buffer[offset + i];
    }
   }
   node.usedBytes = Math.max(node.usedBytes, position + length);
   return length;
  },
  llseek(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.usedBytes;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(28);
   }
   return position;
  },
  allocate(stream, offset, length) {
   MEMFS.expandFileStorage(stream.node, offset + length);
   stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
  },
  mmap(stream, length, position, prot, flags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(43);
   }
   var ptr;
   var allocated;
   var contents = stream.node.contents;
   if (!(flags & 2) && contents.buffer === GROWABLE_HEAP_I8().buffer) {
    allocated = false;
    ptr = contents.byteOffset;
   } else {
    if (position > 0 || position + length < contents.length) {
     if (contents.subarray) {
      contents = contents.subarray(position, position + length);
     } else {
      contents = Array.prototype.slice.call(contents, position, position + length);
     }
    }
    allocated = true;
    ptr = mmapAlloc(length);
    if (!ptr) {
     throw new FS.ErrnoError(48);
    }
    GROWABLE_HEAP_I8().set(contents, ptr);
   }
   return {
    ptr: ptr,
    allocated: allocated
   };
  },
  msync(stream, buffer, offset, length, mmapFlags) {
   MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
   return 0;
  }
 }
};

/** @param {boolean=} noRunDep */ var asyncLoad = (url, onload, onerror, noRunDep) => {
 var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
 readAsync(url, arrayBuffer => {
  onload(new Uint8Array(arrayBuffer));
  if (dep) removeRunDependency(dep);
 }, event => {
  if (onerror) {
   onerror();
  } else {
   throw `Loading data file "${url}" failed.`;
  }
 });
 if (dep) addRunDependency(dep);
};

var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
 FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
};

var preloadPlugins = Module["preloadPlugins"] || [];

var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
 if (typeof Browser != "undefined") Browser.init();
 var handled = false;
 preloadPlugins.forEach(plugin => {
  if (handled) return;
  if (plugin["canHandle"](fullname)) {
   plugin["handle"](byteArray, fullname, finish, onerror);
   handled = true;
  }
 });
 return handled;
};

var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
 var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
 var dep = getUniqueRunDependency(`cp ${fullname}`);
 function processData(byteArray) {
  function finish(byteArray) {
   preFinish?.();
   if (!dontCreateFile) {
    FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
   }
   onload?.();
   removeRunDependency(dep);
  }
  if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
   onerror?.();
   removeRunDependency(dep);
  })) {
   return;
  }
  finish(byteArray);
 }
 addRunDependency(dep);
 if (typeof url == "string") {
  asyncLoad(url, processData, onerror);
 } else {
  processData(url);
 }
};

var FS_modeStringToFlags = str => {
 var flagModes = {
  "r": 0,
  "r+": 2,
  "w": 512 | 64 | 1,
  "w+": 512 | 64 | 2,
  "a": 1024 | 64 | 1,
  "a+": 1024 | 64 | 2
 };
 var flags = flagModes[str];
 if (typeof flags == "undefined") {
  throw new Error(`Unknown file open mode: ${str}`);
 }
 return flags;
};

var FS_getMode = (canRead, canWrite) => {
 var mode = 0;
 if (canRead) mode |= 292 | 73;
 if (canWrite) mode |= 146;
 return mode;
};

var FS = {
 root: null,
 mounts: [],
 devices: {},
 streams: [],
 nextInode: 1,
 nameTable: null,
 currentPath: "/",
 initialized: false,
 ignorePermissions: true,
 ErrnoError: class {
  constructor(errno) {
   this.name = "ErrnoError";
   this.errno = errno;
  }
 },
 genericErrors: {},
 filesystems: null,
 syncFSRequests: 0,
 FSStream: class {
  constructor() {
   this.shared = {};
  }
  get object() {
   return this.node;
  }
  set object(val) {
   this.node = val;
  }
  get isRead() {
   return (this.flags & 2097155) !== 1;
  }
  get isWrite() {
   return (this.flags & 2097155) !== 0;
  }
  get isAppend() {
   return (this.flags & 1024);
  }
  get flags() {
   return this.shared.flags;
  }
  set flags(val) {
   this.shared.flags = val;
  }
  get position() {
   return this.shared.position;
  }
  set position(val) {
   this.shared.position = val;
  }
 },
 FSNode: class {
  constructor(parent, name, mode, rdev) {
   if (!parent) {
    parent = this;
   }
   this.parent = parent;
   this.mount = parent.mount;
   this.mounted = null;
   this.id = FS.nextInode++;
   this.name = name;
   this.mode = mode;
   this.node_ops = {};
   this.stream_ops = {};
   this.rdev = rdev;
   this.readMode = 292 | /*292*/ 73;
   /*73*/ this.writeMode = 146;
  }
  /*146*/ get read() {
   return (this.mode & this.readMode) === this.readMode;
  }
  set read(val) {
   val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
  }
  get write() {
   return (this.mode & this.writeMode) === this.writeMode;
  }
  set write(val) {
   val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
  }
  get isFolder() {
   return FS.isDir(this.mode);
  }
  get isDevice() {
   return FS.isChrdev(this.mode);
  }
 },
 lookupPath(path, opts = {}) {
  path = PATH_FS.resolve(path);
  if (!path) return {
   path: "",
   node: null
  };
  var defaults = {
   follow_mount: true,
   recurse_count: 0
  };
  opts = Object.assign(defaults, opts);
  if (opts.recurse_count > 8) {
   throw new FS.ErrnoError(32);
  }
  var parts = path.split("/").filter(p => !!p);
  var current = FS.root;
  var current_path = "/";
  for (var i = 0; i < parts.length; i++) {
   var islast = (i === parts.length - 1);
   if (islast && opts.parent) {
    break;
   }
   current = FS.lookupNode(current, parts[i]);
   current_path = PATH.join2(current_path, parts[i]);
   if (FS.isMountpoint(current)) {
    if (!islast || (islast && opts.follow_mount)) {
     current = current.mounted.root;
    }
   }
   if (!islast || opts.follow) {
    var count = 0;
    while (FS.isLink(current.mode)) {
     var link = FS.readlink(current_path);
     current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
     var lookup = FS.lookupPath(current_path, {
      recurse_count: opts.recurse_count + 1
     });
     current = lookup.node;
     if (count++ > 40) {
      throw new FS.ErrnoError(32);
     }
    }
   }
  }
  return {
   path: current_path,
   node: current
  };
 },
 getPath(node) {
  var path;
  while (true) {
   if (FS.isRoot(node)) {
    var mount = node.mount.mountpoint;
    if (!path) return mount;
    return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path;
   }
   path = path ? `${node.name}/${path}` : node.name;
   node = node.parent;
  }
 },
 hashName(parentid, name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
   hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return ((parentid + hash) >>> 0) % FS.nameTable.length;
 },
 hashAddNode(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  node.name_next = FS.nameTable[hash];
  FS.nameTable[hash] = node;
 },
 hashRemoveNode(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  if (FS.nameTable[hash] === node) {
   FS.nameTable[hash] = node.name_next;
  } else {
   var current = FS.nameTable[hash];
   while (current) {
    if (current.name_next === node) {
     current.name_next = node.name_next;
     break;
    }
    current = current.name_next;
   }
  }
 },
 lookupNode(parent, name) {
  var errCode = FS.mayLookup(parent);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  var hash = FS.hashName(parent.id, name);
  for (var node = FS.nameTable[hash]; node; node = node.name_next) {
   var nodeName = node.name;
   if (node.parent.id === parent.id && nodeName === name) {
    return node;
   }
  }
  return FS.lookup(parent, name);
 },
 createNode(parent, name, mode, rdev) {
  var node = new FS.FSNode(parent, name, mode, rdev);
  FS.hashAddNode(node);
  return node;
 },
 destroyNode(node) {
  FS.hashRemoveNode(node);
 },
 isRoot(node) {
  return node === node.parent;
 },
 isMountpoint(node) {
  return !!node.mounted;
 },
 isFile(mode) {
  return (mode & 61440) === 32768;
 },
 isDir(mode) {
  return (mode & 61440) === 16384;
 },
 isLink(mode) {
  return (mode & 61440) === 40960;
 },
 isChrdev(mode) {
  return (mode & 61440) === 8192;
 },
 isBlkdev(mode) {
  return (mode & 61440) === 24576;
 },
 isFIFO(mode) {
  return (mode & 61440) === 4096;
 },
 isSocket(mode) {
  return (mode & 49152) === 49152;
 },
 flagsToPermissionString(flag) {
  var perms = [ "r", "w", "rw" ][flag & 3];
  if ((flag & 512)) {
   perms += "w";
  }
  return perms;
 },
 nodePermissions(node, perms) {
  if (FS.ignorePermissions) {
   return 0;
  }
  if (perms.includes("r") && !(node.mode & 292)) {
   return 2;
  } else if (perms.includes("w") && !(node.mode & 146)) {
   return 2;
  } else if (perms.includes("x") && !(node.mode & 73)) {
   return 2;
  }
  return 0;
 },
 mayLookup(dir) {
  if (!FS.isDir(dir.mode)) return 54;
  var errCode = FS.nodePermissions(dir, "x");
  if (errCode) return errCode;
  if (!dir.node_ops.lookup) return 2;
  return 0;
 },
 mayCreate(dir, name) {
  try {
   var node = FS.lookupNode(dir, name);
   return 20;
  } catch (e) {}
  return FS.nodePermissions(dir, "wx");
 },
 mayDelete(dir, name, isdir) {
  var node;
  try {
   node = FS.lookupNode(dir, name);
  } catch (e) {
   return e.errno;
  }
  var errCode = FS.nodePermissions(dir, "wx");
  if (errCode) {
   return errCode;
  }
  if (isdir) {
   if (!FS.isDir(node.mode)) {
    return 54;
   }
   if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
    return 10;
   }
  } else {
   if (FS.isDir(node.mode)) {
    return 31;
   }
  }
  return 0;
 },
 mayOpen(node, flags) {
  if (!node) {
   return 44;
  }
  if (FS.isLink(node.mode)) {
   return 32;
  } else if (FS.isDir(node.mode)) {
   if (FS.flagsToPermissionString(flags) !== "r" ||  (flags & 512)) {
    return 31;
   }
  }
  return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
 },
 MAX_OPEN_FDS: 4096,
 nextfd() {
  for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
   if (!FS.streams[fd]) {
    return fd;
   }
  }
  throw new FS.ErrnoError(33);
 },
 getStreamChecked(fd) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(8);
  }
  return stream;
 },
 getStream: fd => FS.streams[fd],
 createStream(stream, fd = -1) {
  stream = Object.assign(new FS.FSStream, stream);
  if (fd == -1) {
   fd = FS.nextfd();
  }
  stream.fd = fd;
  FS.streams[fd] = stream;
  return stream;
 },
 closeStream(fd) {
  FS.streams[fd] = null;
 },
 dupStream(origStream, fd = -1) {
  var stream = FS.createStream(origStream, fd);
  stream.stream_ops?.dup?.(stream);
  return stream;
 },
 chrdev_stream_ops: {
  open(stream) {
   var device = FS.getDevice(stream.node.rdev);
   stream.stream_ops = device.stream_ops;
   stream.stream_ops.open?.(stream);
  },
  llseek() {
   throw new FS.ErrnoError(70);
  }
 },
 major: dev => ((dev) >> 8),
 minor: dev => ((dev) & 255),
 makedev: (ma, mi) => ((ma) << 8 | (mi)),
 registerDevice(dev, ops) {
  FS.devices[dev] = {
   stream_ops: ops
  };
 },
 getDevice: dev => FS.devices[dev],
 getMounts(mount) {
  var mounts = [];
  var check = [ mount ];
  while (check.length) {
   var m = check.pop();
   mounts.push(m);
   check.push(...m.mounts);
  }
  return mounts;
 },
 syncfs(populate, callback) {
  if (typeof populate == "function") {
   callback = populate;
   populate = false;
  }
  FS.syncFSRequests++;
  if (FS.syncFSRequests > 1) {
   err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
  }
  var mounts = FS.getMounts(FS.root.mount);
  var completed = 0;
  function doCallback(errCode) {
   FS.syncFSRequests--;
   return callback(errCode);
  }
  function done(errCode) {
   if (errCode) {
    if (!done.errored) {
     done.errored = true;
     return doCallback(errCode);
    }
    return;
   }
   if (++completed >= mounts.length) {
    doCallback(null);
   }
  }
  mounts.forEach(mount => {
   if (!mount.type.syncfs) {
    return done(null);
   }
   mount.type.syncfs(mount, populate, done);
  });
 },
 mount(type, opts, mountpoint) {
  var root = mountpoint === "/";
  var pseudo = !mountpoint;
  var node;
  if (root && FS.root) {
   throw new FS.ErrnoError(10);
  } else if (!root && !pseudo) {
   var lookup = FS.lookupPath(mountpoint, {
    follow_mount: false
   });
   mountpoint = lookup.path;
   node = lookup.node;
   if (FS.isMountpoint(node)) {
    throw new FS.ErrnoError(10);
   }
   if (!FS.isDir(node.mode)) {
    throw new FS.ErrnoError(54);
   }
  }
  var mount = {
   type: type,
   opts: opts,
   mountpoint: mountpoint,
   mounts: []
  };
  var mountRoot = type.mount(mount);
  mountRoot.mount = mount;
  mount.root = mountRoot;
  if (root) {
   FS.root = mountRoot;
  } else if (node) {
   node.mounted = mount;
   if (node.mount) {
    node.mount.mounts.push(mount);
   }
  }
  return mountRoot;
 },
 unmount(mountpoint) {
  var lookup = FS.lookupPath(mountpoint, {
   follow_mount: false
  });
  if (!FS.isMountpoint(lookup.node)) {
   throw new FS.ErrnoError(28);
  }
  var node = lookup.node;
  var mount = node.mounted;
  var mounts = FS.getMounts(mount);
  Object.keys(FS.nameTable).forEach(hash => {
   var current = FS.nameTable[hash];
   while (current) {
    var next = current.name_next;
    if (mounts.includes(current.mount)) {
     FS.destroyNode(current);
    }
    current = next;
   }
  });
  node.mounted = null;
  var idx = node.mount.mounts.indexOf(mount);
  node.mount.mounts.splice(idx, 1);
 },
 lookup(parent, name) {
  return parent.node_ops.lookup(parent, name);
 },
 mknod(path, mode, dev) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  if (!name || name === "." || name === "..") {
   throw new FS.ErrnoError(28);
  }
  var errCode = FS.mayCreate(parent, name);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.mknod) {
   throw new FS.ErrnoError(63);
  }
  return parent.node_ops.mknod(parent, name, mode, dev);
 },
 create(path, mode) {
  mode = mode !== undefined ? mode : 438;
  /* 0666 */ mode &= 4095;
  mode |= 32768;
  return FS.mknod(path, mode, 0);
 },
 mkdir(path, mode) {
  mode = mode !== undefined ? mode : 511;
  /* 0777 */ mode &= 511 | 512;
  mode |= 16384;
  return FS.mknod(path, mode, 0);
 },
 mkdirTree(path, mode) {
  var dirs = path.split("/");
  var d = "";
  for (var i = 0; i < dirs.length; ++i) {
   if (!dirs[i]) continue;
   d += "/" + dirs[i];
   try {
    FS.mkdir(d, mode);
   } catch (e) {
    if (e.errno != 20) throw e;
   }
  }
 },
 mkdev(path, mode, dev) {
  if (typeof dev == "undefined") {
   dev = mode;
   mode = 438;
  }
  /* 0666 */ mode |= 8192;
  return FS.mknod(path, mode, dev);
 },
 symlink(oldpath, newpath) {
  if (!PATH_FS.resolve(oldpath)) {
   throw new FS.ErrnoError(44);
  }
  var lookup = FS.lookupPath(newpath, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(44);
  }
  var newname = PATH.basename(newpath);
  var errCode = FS.mayCreate(parent, newname);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.symlink) {
   throw new FS.ErrnoError(63);
  }
  return parent.node_ops.symlink(parent, newname, oldpath);
 },
 rename(old_path, new_path) {
  var old_dirname = PATH.dirname(old_path);
  var new_dirname = PATH.dirname(new_path);
  var old_name = PATH.basename(old_path);
  var new_name = PATH.basename(new_path);
  var lookup, old_dir, new_dir;
  lookup = FS.lookupPath(old_path, {
   parent: true
  });
  old_dir = lookup.node;
  lookup = FS.lookupPath(new_path, {
   parent: true
  });
  new_dir = lookup.node;
  if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
  if (old_dir.mount !== new_dir.mount) {
   throw new FS.ErrnoError(75);
  }
  var old_node = FS.lookupNode(old_dir, old_name);
  var relative = PATH_FS.relative(old_path, new_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(28);
  }
  relative = PATH_FS.relative(new_path, old_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(55);
  }
  var new_node;
  try {
   new_node = FS.lookupNode(new_dir, new_name);
  } catch (e) {}
  if (old_node === new_node) {
   return;
  }
  var isdir = FS.isDir(old_node.mode);
  var errCode = FS.mayDelete(old_dir, old_name, isdir);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!old_dir.node_ops.rename) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
   throw new FS.ErrnoError(10);
  }
  if (new_dir !== old_dir) {
   errCode = FS.nodePermissions(old_dir, "w");
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
  }
  FS.hashRemoveNode(old_node);
  try {
   old_dir.node_ops.rename(old_node, new_dir, new_name);
  } catch (e) {
   throw e;
  } finally {
   FS.hashAddNode(old_node);
  }
 },
 rmdir(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var errCode = FS.mayDelete(parent, name, true);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.rmdir) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(10);
  }
  parent.node_ops.rmdir(parent, name);
  FS.destroyNode(node);
 },
 readdir(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node.node_ops.readdir) {
   throw new FS.ErrnoError(54);
  }
  return node.node_ops.readdir(node);
 },
 unlink(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(44);
  }
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var errCode = FS.mayDelete(parent, name, false);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.unlink) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(10);
  }
  parent.node_ops.unlink(parent, name);
  FS.destroyNode(node);
 },
 readlink(path) {
  var lookup = FS.lookupPath(path);
  var link = lookup.node;
  if (!link) {
   throw new FS.ErrnoError(44);
  }
  if (!link.node_ops.readlink) {
   throw new FS.ErrnoError(28);
  }
  return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
 },
 stat(path, dontFollow) {
  var lookup = FS.lookupPath(path, {
   follow: !dontFollow
  });
  var node = lookup.node;
  if (!node) {
   throw new FS.ErrnoError(44);
  }
  if (!node.node_ops.getattr) {
   throw new FS.ErrnoError(63);
  }
  return node.node_ops.getattr(node);
 },
 lstat(path) {
  return FS.stat(path, true);
 },
 chmod(path, mode, dontFollow) {
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  node.node_ops.setattr(node, {
   mode: (mode & 4095) | (node.mode & ~4095),
   timestamp: Date.now()
  });
 },
 lchmod(path, mode) {
  FS.chmod(path, mode, true);
 },
 fchmod(fd, mode) {
  var stream = FS.getStreamChecked(fd);
  FS.chmod(stream.node, mode);
 },
 chown(path, uid, gid, dontFollow) {
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  node.node_ops.setattr(node, {
   timestamp: Date.now()
  });
 },
 lchown(path, uid, gid) {
  FS.chown(path, uid, gid, true);
 },
 fchown(fd, uid, gid) {
  var stream = FS.getStreamChecked(fd);
  FS.chown(stream.node, uid, gid);
 },
 truncate(path, len) {
  if (len < 0) {
   throw new FS.ErrnoError(28);
  }
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isDir(node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!FS.isFile(node.mode)) {
   throw new FS.ErrnoError(28);
  }
  var errCode = FS.nodePermissions(node, "w");
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  node.node_ops.setattr(node, {
   size: len,
   timestamp: Date.now()
  });
 },
 ftruncate(fd, len) {
  var stream = FS.getStreamChecked(fd);
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(28);
  }
  FS.truncate(stream.node, len);
 },
 utime(path, atime, mtime) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  node.node_ops.setattr(node, {
   timestamp: Math.max(atime, mtime)
  });
 },
 open(path, flags, mode) {
  if (path === "") {
   throw new FS.ErrnoError(44);
  }
  flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
  mode = typeof mode == "undefined" ? 438 : /* 0666 */ mode;
  if ((flags & 64)) {
   mode = (mode & 4095) | 32768;
  } else {
   mode = 0;
  }
  var node;
  if (typeof path == "object") {
   node = path;
  } else {
   path = PATH.normalize(path);
   try {
    var lookup = FS.lookupPath(path, {
     follow: !(flags & 131072)
    });
    node = lookup.node;
   } catch (e) {}
  }
  var created = false;
  if ((flags & 64)) {
   if (node) {
    if ((flags & 128)) {
     throw new FS.ErrnoError(20);
    }
   } else {
    node = FS.mknod(path, mode, 0);
    created = true;
   }
  }
  if (!node) {
   throw new FS.ErrnoError(44);
  }
  if (FS.isChrdev(node.mode)) {
   flags &= ~512;
  }
  if ((flags & 65536) && !FS.isDir(node.mode)) {
   throw new FS.ErrnoError(54);
  }
  if (!created) {
   var errCode = FS.mayOpen(node, flags);
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
  }
  if ((flags & 512) && !created) {
   FS.truncate(node, 0);
  }
  flags &= ~(128 | 512 | 131072);
  var stream = FS.createStream({
   node: node,
   path: FS.getPath(node),
   flags: flags,
   seekable: true,
   position: 0,
   stream_ops: node.stream_ops,
   ungotten: [],
   error: false
  });
  if (stream.stream_ops.open) {
   stream.stream_ops.open(stream);
  }
  if (Module["logReadFiles"] && !(flags & 1)) {
   if (!FS.readFiles) FS.readFiles = {};
   if (!(path in FS.readFiles)) {
    FS.readFiles[path] = 1;
   }
  }
  return stream;
 },
 close(stream) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (stream.getdents) stream.getdents = null;
  try {
   if (stream.stream_ops.close) {
    stream.stream_ops.close(stream);
   }
  } catch (e) {
   throw e;
  } finally {
   FS.closeStream(stream.fd);
  }
  stream.fd = null;
 },
 isClosed(stream) {
  return stream.fd === null;
 },
 llseek(stream, offset, whence) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (!stream.seekable || !stream.stream_ops.llseek) {
   throw new FS.ErrnoError(70);
  }
  if (whence != 0 && whence != 1 && whence != 2) {
   throw new FS.ErrnoError(28);
  }
  stream.position = stream.stream_ops.llseek(stream, offset, whence);
  stream.ungotten = [];
  return stream.position;
 },
 read(stream, buffer, offset, length, position) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(28);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(8);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!stream.stream_ops.read) {
   throw new FS.ErrnoError(28);
  }
  var seeking = typeof position != "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(70);
  }
  var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
  if (!seeking) stream.position += bytesRead;
  return bytesRead;
 },
 write(stream, buffer, offset, length, position, canOwn) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(28);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(8);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!stream.stream_ops.write) {
   throw new FS.ErrnoError(28);
  }
  if (stream.seekable && stream.flags & 1024) {
   FS.llseek(stream, 0, 2);
  }
  var seeking = typeof position != "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(70);
  }
  var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
  if (!seeking) stream.position += bytesWritten;
  return bytesWritten;
 },
 allocate(stream, offset, length) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (offset < 0 || length <= 0) {
   throw new FS.ErrnoError(28);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(8);
  }
  if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(43);
  }
  if (!stream.stream_ops.allocate) {
   throw new FS.ErrnoError(138);
  }
  stream.stream_ops.allocate(stream, offset, length);
 },
 mmap(stream, length, position, prot, flags) {
  if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
   throw new FS.ErrnoError(2);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(2);
  }
  if (!stream.stream_ops.mmap) {
   throw new FS.ErrnoError(43);
  }
  return stream.stream_ops.mmap(stream, length, position, prot, flags);
 },
 msync(stream, buffer, offset, length, mmapFlags) {
  if (!stream.stream_ops.msync) {
   return 0;
  }
  return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
 },
 ioctl(stream, cmd, arg) {
  if (!stream.stream_ops.ioctl) {
   throw new FS.ErrnoError(59);
  }
  return stream.stream_ops.ioctl(stream, cmd, arg);
 },
 readFile(path, opts = {}) {
  opts.flags = opts.flags || 0;
  opts.encoding = opts.encoding || "binary";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error(`Invalid encoding type "${opts.encoding}"`);
  }
  var ret;
  var stream = FS.open(path, opts.flags);
  var stat = FS.stat(path);
  var length = stat.size;
  var buf = new Uint8Array(length);
  FS.read(stream, buf, 0, length, 0);
  if (opts.encoding === "utf8") {
   ret = UTF8ArrayToString(buf, 0);
  } else if (opts.encoding === "binary") {
   ret = buf;
  }
  FS.close(stream);
  return ret;
 },
 writeFile(path, data, opts = {}) {
  opts.flags = opts.flags || 577;
  var stream = FS.open(path, opts.flags, opts.mode);
  if (typeof data == "string") {
   var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
   var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
   FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
  } else if (ArrayBuffer.isView(data)) {
   FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
  } else {
   throw new Error("Unsupported data type");
  }
  FS.close(stream);
 },
 cwd: () => FS.currentPath,
 chdir(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  if (lookup.node === null) {
   throw new FS.ErrnoError(44);
  }
  if (!FS.isDir(lookup.node.mode)) {
   throw new FS.ErrnoError(54);
  }
  var errCode = FS.nodePermissions(lookup.node, "x");
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  FS.currentPath = lookup.path;
 },
 createDefaultDirectories() {
  FS.mkdir("/tmp");
  FS.mkdir("/home");
  FS.mkdir("/home/web_user");
 },
 createDefaultDevices() {
  FS.mkdir("/dev");
  FS.registerDevice(FS.makedev(1, 3), {
   read: () => 0,
   write: (stream, buffer, offset, length, pos) => length
  });
  FS.mkdev("/dev/null", FS.makedev(1, 3));
  TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
  TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
  FS.mkdev("/dev/tty", FS.makedev(5, 0));
  FS.mkdev("/dev/tty1", FS.makedev(6, 0));
  var randomBuffer = new Uint8Array(1024), randomLeft = 0;
  var randomByte = () => {
   if (randomLeft === 0) {
    randomLeft = randomFill(randomBuffer).byteLength;
   }
   return randomBuffer[--randomLeft];
  };
  FS.createDevice("/dev", "random", randomByte);
  FS.createDevice("/dev", "urandom", randomByte);
  FS.mkdir("/dev/shm");
  FS.mkdir("/dev/shm/tmp");
 },
 createSpecialDirectories() {
  FS.mkdir("/proc");
  var proc_self = FS.mkdir("/proc/self");
  FS.mkdir("/proc/self/fd");
  FS.mount({
   mount() {
    var node = FS.createNode(proc_self, "fd", 16384 | 511, /* 0777 */ 73);
    node.node_ops = {
     lookup(parent, name) {
      var fd = +name;
      var stream = FS.getStreamChecked(fd);
      var ret = {
       parent: null,
       mount: {
        mountpoint: "fake"
       },
       node_ops: {
        readlink: () => stream.path
       }
      };
      ret.parent = ret;
      return ret;
     }
    };
    return node;
   }
  }, {}, "/proc/self/fd");
 },
 createStandardStreams() {
  if (Module["stdin"]) {
   FS.createDevice("/dev", "stdin", Module["stdin"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdin");
  }
  if (Module["stdout"]) {
   FS.createDevice("/dev", "stdout", null, Module["stdout"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdout");
  }
  if (Module["stderr"]) {
   FS.createDevice("/dev", "stderr", null, Module["stderr"]);
  } else {
   FS.symlink("/dev/tty1", "/dev/stderr");
  }
  var stdin = FS.open("/dev/stdin", 0);
  var stdout = FS.open("/dev/stdout", 1);
  var stderr = FS.open("/dev/stderr", 1);
 },
 staticInit() {
  [ 44 ].forEach(code => {
   FS.genericErrors[code] = new FS.ErrnoError(code);
   FS.genericErrors[code].stack = "<generic error, no stack>";
  });
  FS.nameTable = new Array(4096);
  FS.mount(MEMFS, {}, "/");
  FS.createDefaultDirectories();
  FS.createDefaultDevices();
  FS.createSpecialDirectories();
  FS.filesystems = {
   "MEMFS": MEMFS
  };
 },
 init(input, output, error) {
  FS.init.initialized = true;
  Module["stdin"] = input || Module["stdin"];
  Module["stdout"] = output || Module["stdout"];
  Module["stderr"] = error || Module["stderr"];
  FS.createStandardStreams();
 },
 quit() {
  FS.init.initialized = false;
  _fflush(0);
  for (var i = 0; i < FS.streams.length; i++) {
   var stream = FS.streams[i];
   if (!stream) {
    continue;
   }
   FS.close(stream);
  }
 },
 findObject(path, dontResolveLastLink) {
  var ret = FS.analyzePath(path, dontResolveLastLink);
  if (!ret.exists) {
   return null;
  }
  return ret.object;
 },
 analyzePath(path, dontResolveLastLink) {
  try {
   var lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   path = lookup.path;
  } catch (e) {}
  var ret = {
   isRoot: false,
   exists: false,
   error: 0,
   name: null,
   path: null,
   object: null,
   parentExists: false,
   parentPath: null,
   parentObject: null
  };
  try {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   ret.parentExists = true;
   ret.parentPath = lookup.path;
   ret.parentObject = lookup.node;
   ret.name = PATH.basename(path);
   lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   ret.exists = true;
   ret.path = lookup.path;
   ret.object = lookup.node;
   ret.name = lookup.node.name;
   ret.isRoot = lookup.path === "/";
  } catch (e) {
   ret.error = e.errno;
  }
  return ret;
 },
 createPath(parent, path, canRead, canWrite) {
  parent = typeof parent == "string" ? parent : FS.getPath(parent);
  var parts = path.split("/").reverse();
  while (parts.length) {
   var part = parts.pop();
   if (!part) continue;
   var current = PATH.join2(parent, part);
   try {
    FS.mkdir(current);
   } catch (e) {}
   parent = current;
  }
  return current;
 },
 createFile(parent, name, properties, canRead, canWrite) {
  var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
  var mode = FS_getMode(canRead, canWrite);
  return FS.create(path, mode);
 },
 createDataFile(parent, name, data, canRead, canWrite, canOwn) {
  var path = name;
  if (parent) {
   parent = typeof parent == "string" ? parent : FS.getPath(parent);
   path = name ? PATH.join2(parent, name) : parent;
  }
  var mode = FS_getMode(canRead, canWrite);
  var node = FS.create(path, mode);
  if (data) {
   if (typeof data == "string") {
    var arr = new Array(data.length);
    for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
    data = arr;
   }
   FS.chmod(node, mode | 146);
   var stream = FS.open(node, 577);
   FS.write(stream, data, 0, data.length, 0, canOwn);
   FS.close(stream);
   FS.chmod(node, mode);
  }
 },
 createDevice(parent, name, input, output) {
  var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
  var mode = FS_getMode(!!input, !!output);
  if (!FS.createDevice.major) FS.createDevice.major = 64;
  var dev = FS.makedev(FS.createDevice.major++, 0);
  FS.registerDevice(dev, {
   open(stream) {
    stream.seekable = false;
   },
   close(stream) {
    if (output?.buffer?.length) {
     output(10);
    }
   },
   read(stream, buffer, offset, length, pos) {
    /* ignored */ var bytesRead = 0;
    for (var i = 0; i < length; i++) {
     var result;
     try {
      result = input();
     } catch (e) {
      throw new FS.ErrnoError(29);
     }
     if (result === undefined && bytesRead === 0) {
      throw new FS.ErrnoError(6);
     }
     if (result === null || result === undefined) break;
     bytesRead++;
     buffer[offset + i] = result;
    }
    if (bytesRead) {
     stream.node.timestamp = Date.now();
    }
    return bytesRead;
   },
   write(stream, buffer, offset, length, pos) {
    for (var i = 0; i < length; i++) {
     try {
      output(buffer[offset + i]);
     } catch (e) {
      throw new FS.ErrnoError(29);
     }
    }
    if (length) {
     stream.node.timestamp = Date.now();
    }
    return i;
   }
  });
  return FS.mkdev(path, mode, dev);
 },
 forceLoadFile(obj) {
  if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
  if (typeof XMLHttpRequest != "undefined") {
   throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
  } else if (read_) {
   try {
    obj.contents = intArrayFromString(read_(obj.url), true);
    obj.usedBytes = obj.contents.length;
   } catch (e) {
    throw new FS.ErrnoError(29);
   }
  } else {
   throw new Error("Cannot load without read() or XMLHttpRequest.");
  }
 },
 createLazyFile(parent, name, url, canRead, canWrite) {
  class LazyUint8Array {
   constructor() {
    this.lengthKnown = false;
    this.chunks = [];
   }
   get(idx) {
    if (idx > this.length - 1 || idx < 0) {
     return undefined;
    }
    var chunkOffset = idx % this.chunkSize;
    var chunkNum = (idx / this.chunkSize) | 0;
    return this.getter(chunkNum)[chunkOffset];
   }
   setDataGetter(getter) {
    this.getter = getter;
   }
   cacheLength() {
    var xhr = new XMLHttpRequest;
    xhr.open("HEAD", url, false);
    xhr.send(null);
    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
    var datalength = Number(xhr.getResponseHeader("Content-length"));
    var header;
    var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
    var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
    var chunkSize = 1024 * 1024;
    if (!hasByteServing) chunkSize = datalength;
    var doXHR = (from, to) => {
     if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
     if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
     var xhr = new XMLHttpRequest;
     xhr.open("GET", url, false);
     if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
     xhr.responseType = "arraybuffer";
     if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/plain; charset=x-user-defined");
     }
     xhr.send(null);
     if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
     if (xhr.response !== undefined) {
      return new Uint8Array(/** @type{Array<number>} */ (xhr.response || []));
     }
     return intArrayFromString(xhr.responseText || "", true);
    };
    var lazyArray = this;
    lazyArray.setDataGetter(chunkNum => {
     var start = chunkNum * chunkSize;
     var end = (chunkNum + 1) * chunkSize - 1;
     end = Math.min(end, datalength - 1);
     if (typeof lazyArray.chunks[chunkNum] == "undefined") {
      lazyArray.chunks[chunkNum] = doXHR(start, end);
     }
     if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
     return lazyArray.chunks[chunkNum];
    });
    if (usesGzip || !datalength) {
     chunkSize = datalength = 1;
     datalength = this.getter(0).length;
     chunkSize = datalength;
     out("LazyFiles on gzip forces download of the whole file when length is accessed");
    }
    this._length = datalength;
    this._chunkSize = chunkSize;
    this.lengthKnown = true;
   }
   get length() {
    if (!this.lengthKnown) {
     this.cacheLength();
    }
    return this._length;
   }
   get chunkSize() {
    if (!this.lengthKnown) {
     this.cacheLength();
    }
    return this._chunkSize;
   }
  }
  if (typeof XMLHttpRequest != "undefined") {
   if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
   var lazyArray = new LazyUint8Array;
   var properties = {
    isDevice: false,
    contents: lazyArray
   };
  } else {
   var properties = {
    isDevice: false,
    url: url
   };
  }
  var node = FS.createFile(parent, name, properties, canRead, canWrite);
  if (properties.contents) {
   node.contents = properties.contents;
  } else if (properties.url) {
   node.contents = null;
   node.url = properties.url;
  }
  Object.defineProperties(node, {
   usedBytes: {
    get: function() {
     return this.contents.length;
    }
   }
  });
  var stream_ops = {};
  var keys = Object.keys(node.stream_ops);
  keys.forEach(key => {
   var fn = node.stream_ops[key];
   stream_ops[key] = (...args) => {
    FS.forceLoadFile(node);
    return fn(...args);
   };
  });
  function writeChunks(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= contents.length) return 0;
   var size = Math.min(contents.length - position, length);
   if (contents.slice) {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents[position + i];
    }
   } else {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents.get(position + i);
    }
   }
   return size;
  }
  stream_ops.read = (stream, buffer, offset, length, position) => {
   FS.forceLoadFile(node);
   return writeChunks(stream, buffer, offset, length, position);
  };
  stream_ops.mmap = (stream, length, position, prot, flags) => {
   FS.forceLoadFile(node);
   var ptr = mmapAlloc(length);
   if (!ptr) {
    throw new FS.ErrnoError(48);
   }
   writeChunks(stream, GROWABLE_HEAP_I8(), ptr, length, position);
   return {
    ptr: ptr,
    allocated: true
   };
  };
  node.stream_ops = stream_ops;
  return node;
 }
};

var SYSCALLS = {
 DEFAULT_POLLMASK: 5,
 calculateAt(dirfd, path, allowEmpty) {
  if (PATH.isAbs(path)) {
   return path;
  }
  var dir;
  if (dirfd === -100) {
   dir = FS.cwd();
  } else {
   var dirstream = SYSCALLS.getStreamFromFD(dirfd);
   dir = dirstream.path;
  }
  if (path.length == 0) {
   if (!allowEmpty) {
    throw new FS.ErrnoError(44);
   }
   return dir;
  }
  return PATH.join2(dir, path);
 },
 doStat(func, path, buf) {
  var stat = func(path);
  GROWABLE_HEAP_I32()[((buf) >> 2)] = stat.dev;
  GROWABLE_HEAP_I32()[(((buf) + (4)) >> 2)] = stat.mode;
  GROWABLE_HEAP_U32()[(((buf) + (8)) >> 2)] = stat.nlink;
  GROWABLE_HEAP_I32()[(((buf) + (12)) >> 2)] = stat.uid;
  GROWABLE_HEAP_I32()[(((buf) + (16)) >> 2)] = stat.gid;
  GROWABLE_HEAP_I32()[(((buf) + (20)) >> 2)] = stat.rdev;
  HEAP64[(((buf) + (24)) >> 3)] = BigInt(stat.size);
  GROWABLE_HEAP_I32()[(((buf) + (32)) >> 2)] = 4096;
  GROWABLE_HEAP_I32()[(((buf) + (36)) >> 2)] = stat.blocks;
  var atime = stat.atime.getTime();
  var mtime = stat.mtime.getTime();
  var ctime = stat.ctime.getTime();
  HEAP64[(((buf) + (40)) >> 3)] = BigInt(Math.floor(atime / 1e3));
  GROWABLE_HEAP_U32()[(((buf) + (48)) >> 2)] = (atime % 1e3) * 1e3;
  HEAP64[(((buf) + (56)) >> 3)] = BigInt(Math.floor(mtime / 1e3));
  GROWABLE_HEAP_U32()[(((buf) + (64)) >> 2)] = (mtime % 1e3) * 1e3;
  HEAP64[(((buf) + (72)) >> 3)] = BigInt(Math.floor(ctime / 1e3));
  GROWABLE_HEAP_U32()[(((buf) + (80)) >> 2)] = (ctime % 1e3) * 1e3;
  HEAP64[(((buf) + (88)) >> 3)] = BigInt(stat.ino);
  return 0;
 },
 doMsync(addr, stream, len, flags, offset) {
  if (!FS.isFile(stream.node.mode)) {
   throw new FS.ErrnoError(43);
  }
  if (flags & 2) {
   return 0;
  }
  var buffer = GROWABLE_HEAP_U8().slice(addr, addr + len);
  FS.msync(stream, buffer, offset, len, flags);
 },
 varargs: undefined,
 get() {
  var ret = GROWABLE_HEAP_I32()[((+SYSCALLS.varargs) >> 2)];
  SYSCALLS.varargs += 4;
  return ret;
 },
 getp() {
  return SYSCALLS.get();
 },
 getStr(ptr) {
  var ret = UTF8ToString(ptr);
  return ret;
 },
 getStreamFromFD(fd) {
  var stream = FS.getStreamChecked(fd);
  return stream;
 }
};

function ___syscall_chdir(path) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(3, 0, 1, path);
 try {
  path = SYSCALLS.getStr(path);
  FS.chdir(path);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_chmod(path, mode) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(4, 0, 1, path, mode);
 try {
  path = SYSCALLS.getStr(path);
  FS.chmod(path, mode);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

var SOCKFS = {
 mount(mount) {
  Module["websocket"] = (Module["websocket"] && ("object" === typeof Module["websocket"])) ? Module["websocket"] : {};
  Module["websocket"]._callbacks = {};
  Module["websocket"]["on"] = /** @this{Object} */ function(event, callback) {
   if ("function" === typeof callback) {
    this._callbacks[event] = callback;
   }
   return this;
  };
  Module["websocket"].emit = /** @this{Object} */ function(event, param) {
   if ("function" === typeof this._callbacks[event]) {
    this._callbacks[event].call(this, param);
   }
  };
  return FS.createNode(null, "/", 16384 | 511, /* 0777 */ 0);
 },
 createSocket(family, type, protocol) {
  type &= ~526336;
  var streaming = type == 1;
  if (streaming && protocol && protocol != 6) {
   throw new FS.ErrnoError(66);
  }
  var sock = {
   family: family,
   type: type,
   protocol: protocol,
   server: null,
   error: null,
   peers: {},
   pending: [],
   recv_queue: [],
   sock_ops: SOCKFS.websocket_sock_ops
  };
  var name = SOCKFS.nextname();
  var node = FS.createNode(SOCKFS.root, name, 49152, 0);
  node.sock = sock;
  var stream = FS.createStream({
   path: name,
   node: node,
   flags: 2,
   seekable: false,
   stream_ops: SOCKFS.stream_ops
  });
  sock.stream = stream;
  return sock;
 },
 getSocket(fd) {
  var stream = FS.getStream(fd);
  if (!stream || !FS.isSocket(stream.node.mode)) {
   return null;
  }
  return stream.node.sock;
 },
 stream_ops: {
  poll(stream) {
   var sock = stream.node.sock;
   return sock.sock_ops.poll(sock);
  },
  ioctl(stream, request, varargs) {
   var sock = stream.node.sock;
   return sock.sock_ops.ioctl(sock, request, varargs);
  },
  read(stream, buffer, offset, length, position) {
   /* ignored */ var sock = stream.node.sock;
   var msg = sock.sock_ops.recvmsg(sock, length);
   if (!msg) {
    return 0;
   }
   buffer.set(msg.buffer, offset);
   return msg.buffer.length;
  },
  write(stream, buffer, offset, length, position) {
   /* ignored */ var sock = stream.node.sock;
   return sock.sock_ops.sendmsg(sock, buffer, offset, length);
  },
  close(stream) {
   var sock = stream.node.sock;
   sock.sock_ops.close(sock);
  }
 },
 nextname() {
  if (!SOCKFS.nextname.current) {
   SOCKFS.nextname.current = 0;
  }
  return "socket[" + (SOCKFS.nextname.current++) + "]";
 },
 websocket_sock_ops: {
  createPeer(sock, addr, port) {
   var ws;
   if (typeof addr == "object") {
    ws = addr;
    addr = null;
    port = null;
   }
   if (ws) {
    if (ws._socket) {
     addr = ws._socket.remoteAddress;
     port = ws._socket.remotePort;
    } else  {
     var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
     if (!result) {
      throw new Error("WebSocket URL must be in the format ws(s)://address:port");
     }
     addr = result[1];
     port = parseInt(result[2], 10);
    }
   } else {
    try {
     var runtimeConfig = (Module["websocket"] && ("object" === typeof Module["websocket"]));
     var url = "ws:#".replace("#", "//");
     if (runtimeConfig) {
      if ("string" === typeof Module["websocket"]["url"]) {
       url = Module["websocket"]["url"];
      }
     }
     if (url === "ws://" || url === "wss://") {
      var parts = addr.split("/");
      url = url + parts[0] + ":" + port + "/" + parts.slice(1).join("/");
     }
     var subProtocols = "binary";
     if (runtimeConfig) {
      if ("string" === typeof Module["websocket"]["subprotocol"]) {
       subProtocols = Module["websocket"]["subprotocol"];
      }
     }
     var opts = undefined;
     if (subProtocols !== "null") {
      subProtocols = subProtocols.replace(/^ +| +$/g, "").split(/ *, */);
      opts = subProtocols;
     }
     if (runtimeConfig && null === Module["websocket"]["subprotocol"]) {
      subProtocols = "null";
      opts = undefined;
     }
     var WebSocketConstructor;
     if (ENVIRONMENT_IS_NODE) {
      WebSocketConstructor = /** @type{(typeof WebSocket)} */ (require("ws"));
     } else {
      WebSocketConstructor = WebSocket;
     }
     ws = new WebSocketConstructor(url, opts);
     ws.binaryType = "arraybuffer";
    } catch (e) {
     throw new FS.ErrnoError(23);
    }
   }
   var peer = {
    addr: addr,
    port: port,
    socket: ws,
    dgram_send_queue: []
   };
   SOCKFS.websocket_sock_ops.addPeer(sock, peer);
   SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
   if (sock.type === 2 && typeof sock.sport != "undefined") {
    peer.dgram_send_queue.push(new Uint8Array([ 255, 255, 255, 255, "p".charCodeAt(0), "o".charCodeAt(0), "r".charCodeAt(0), "t".charCodeAt(0), ((sock.sport & 65280) >> 8), (sock.sport & 255) ]));
   }
   return peer;
  },
  getPeer(sock, addr, port) {
   return sock.peers[addr + ":" + port];
  },
  addPeer(sock, peer) {
   sock.peers[peer.addr + ":" + peer.port] = peer;
  },
  removePeer(sock, peer) {
   delete sock.peers[peer.addr + ":" + peer.port];
  },
  handlePeerEvents(sock, peer) {
   var first = true;
   var handleOpen = function() {
    Module["websocket"].emit("open", sock.stream.fd);
    try {
     var queued = peer.dgram_send_queue.shift();
     while (queued) {
      peer.socket.send(queued);
      queued = peer.dgram_send_queue.shift();
     }
    } catch (e) {
     peer.socket.close();
    }
   };
   function handleMessage(data) {
    if (typeof data == "string") {
     var encoder = new TextEncoder;
     data = encoder.encode(data);
    } else  {
     assert(data.byteLength !== undefined);
     if (data.byteLength == 0) {
      return;
     }
     data = new Uint8Array(data);
    }
    var wasfirst = first;
    first = false;
    if (wasfirst && data.length === 10 && data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 && data[4] === "p".charCodeAt(0) && data[5] === "o".charCodeAt(0) && data[6] === "r".charCodeAt(0) && data[7] === "t".charCodeAt(0)) {
     var newport = ((data[8] << 8) | data[9]);
     SOCKFS.websocket_sock_ops.removePeer(sock, peer);
     peer.port = newport;
     SOCKFS.websocket_sock_ops.addPeer(sock, peer);
     return;
    }
    sock.recv_queue.push({
     addr: peer.addr,
     port: peer.port,
     data: data
    });
    Module["websocket"].emit("message", sock.stream.fd);
   }
   if (ENVIRONMENT_IS_NODE) {
    peer.socket.on("open", handleOpen);
    peer.socket.on("message", function(data, isBinary) {
     if (!isBinary) {
      return;
     }
     handleMessage((new Uint8Array(data)).buffer);
    });
    peer.socket.on("close", function() {
     Module["websocket"].emit("close", sock.stream.fd);
    });
    peer.socket.on("error", function(error) {
     sock.error = 14;
     Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
    });
   } else {
    peer.socket.onopen = handleOpen;
    peer.socket.onclose = function() {
     Module["websocket"].emit("close", sock.stream.fd);
    };
    peer.socket.onmessage = function peer_socket_onmessage(event) {
     handleMessage(event.data);
    };
    peer.socket.onerror = function(error) {
     sock.error = 14;
     Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
    };
   }
  },
  poll(sock) {
   if (sock.type === 1 && sock.server) {
    return sock.pending.length ? (64 | 1) : 0;
   }
   var mask = 0;
   var dest = sock.type === 1 ?  SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null;
   if (sock.recv_queue.length || !dest ||  (dest && dest.socket.readyState === dest.socket.CLOSING) || (dest && dest.socket.readyState === dest.socket.CLOSED)) {
    mask |= (64 | 1);
   }
   if (!dest ||  (dest && dest.socket.readyState === dest.socket.OPEN)) {
    mask |= 4;
   }
   if ((dest && dest.socket.readyState === dest.socket.CLOSING) || (dest && dest.socket.readyState === dest.socket.CLOSED)) {
    mask |= 16;
   }
   return mask;
  },
  ioctl(sock, request, arg) {
   switch (request) {
   case 21531:
    var bytes = 0;
    if (sock.recv_queue.length) {
     bytes = sock.recv_queue[0].data.length;
    }
    GROWABLE_HEAP_I32()[((arg) >> 2)] = bytes;
    return 0;

   default:
    return 28;
   }
  },
  close(sock) {
   if (sock.server) {
    try {
     sock.server.close();
    } catch (e) {}
    sock.server = null;
   }
   var peers = Object.keys(sock.peers);
   for (var i = 0; i < peers.length; i++) {
    var peer = sock.peers[peers[i]];
    try {
     peer.socket.close();
    } catch (e) {}
    SOCKFS.websocket_sock_ops.removePeer(sock, peer);
   }
   return 0;
  },
  bind(sock, addr, port) {
   if (typeof sock.saddr != "undefined" || typeof sock.sport != "undefined") {
    throw new FS.ErrnoError(28);
   }
   sock.saddr = addr;
   sock.sport = port;
   if (sock.type === 2) {
    if (sock.server) {
     sock.server.close();
     sock.server = null;
    }
    try {
     sock.sock_ops.listen(sock, 0);
    } catch (e) {
     if (!(e.name === "ErrnoError")) throw e;
     if (e.errno !== 138) throw e;
    }
   }
  },
  connect(sock, addr, port) {
   if (sock.server) {
    throw new FS.ErrnoError(138);
   }
   if (typeof sock.daddr != "undefined" && typeof sock.dport != "undefined") {
    var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
    if (dest) {
     if (dest.socket.readyState === dest.socket.CONNECTING) {
      throw new FS.ErrnoError(7);
     } else {
      throw new FS.ErrnoError(30);
     }
    }
   }
   var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
   sock.daddr = peer.addr;
   sock.dport = peer.port;
   throw new FS.ErrnoError(26);
  },
  listen(sock, backlog) {
   if (!ENVIRONMENT_IS_NODE) {
    throw new FS.ErrnoError(138);
   }
   if (sock.server) {
    throw new FS.ErrnoError(28);
   }
   var WebSocketServer = require("ws").Server;
   var host = sock.saddr;
   sock.server = new WebSocketServer({
    host: host,
    port: sock.sport
   });
   Module["websocket"].emit("listen", sock.stream.fd);
   sock.server.on("connection", function(ws) {
    if (sock.type === 1) {
     var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
     var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
     newsock.daddr = peer.addr;
     newsock.dport = peer.port;
     sock.pending.push(newsock);
     Module["websocket"].emit("connection", newsock.stream.fd);
    } else {
     SOCKFS.websocket_sock_ops.createPeer(sock, ws);
     Module["websocket"].emit("connection", sock.stream.fd);
    }
   });
   sock.server.on("close", function() {
    Module["websocket"].emit("close", sock.stream.fd);
    sock.server = null;
   });
   sock.server.on("error", function(error) {
    sock.error = 23;
    Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "EHOSTUNREACH: Host is unreachable" ]);
   });
  },
  accept(listensock) {
   if (!listensock.server || !listensock.pending.length) {
    throw new FS.ErrnoError(28);
   }
   var newsock = listensock.pending.shift();
   newsock.stream.flags = listensock.stream.flags;
   return newsock;
  },
  getname(sock, peer) {
   var addr, port;
   if (peer) {
    if (sock.daddr === undefined || sock.dport === undefined) {
     throw new FS.ErrnoError(53);
    }
    addr = sock.daddr;
    port = sock.dport;
   } else {
    addr = sock.saddr || 0;
    port = sock.sport || 0;
   }
   return {
    addr: addr,
    port: port
   };
  },
  sendmsg(sock, buffer, offset, length, addr, port) {
   if (sock.type === 2) {
    if (addr === undefined || port === undefined) {
     addr = sock.daddr;
     port = sock.dport;
    }
    if (addr === undefined || port === undefined) {
     throw new FS.ErrnoError(17);
    }
   } else {
    addr = sock.daddr;
    port = sock.dport;
   }
   var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
   if (sock.type === 1) {
    if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
     throw new FS.ErrnoError(53);
    } else if (dest.socket.readyState === dest.socket.CONNECTING) {
     throw new FS.ErrnoError(6);
    }
   }
   if (ArrayBuffer.isView(buffer)) {
    offset += buffer.byteOffset;
    buffer = buffer.buffer;
   }
   var data;
   if (buffer instanceof SharedArrayBuffer) {
    data = new Uint8Array(new Uint8Array(buffer.slice(offset, offset + length))).buffer;
   } else {
    data = buffer.slice(offset, offset + length);
   }
   if (sock.type === 2) {
    if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
     if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
      dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
     }
     dest.dgram_send_queue.push(data);
     return length;
    }
   }
   try {
    dest.socket.send(data);
    return length;
   } catch (e) {
    throw new FS.ErrnoError(28);
   }
  },
  recvmsg(sock, length) {
   if (sock.type === 1 && sock.server) {
    throw new FS.ErrnoError(53);
   }
   var queued = sock.recv_queue.shift();
   if (!queued) {
    if (sock.type === 1) {
     var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
     if (!dest) {
      throw new FS.ErrnoError(53);
     }
     if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
      return null;
     }
     throw new FS.ErrnoError(6);
    }
    throw new FS.ErrnoError(6);
   }
   var queuedLength = queued.data.byteLength || queued.data.length;
   var queuedOffset = queued.data.byteOffset || 0;
   var queuedBuffer = queued.data.buffer || queued.data;
   var bytesRead = Math.min(length, queuedLength);
   var res = {
    buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
    addr: queued.addr,
    port: queued.port
   };
   if (sock.type === 1 && bytesRead < queuedLength) {
    var bytesRemaining = queuedLength - bytesRead;
    queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
    sock.recv_queue.unshift(queued);
   }
   return res;
  }
 }
};

var getSocketFromFD = fd => {
 var socket = SOCKFS.getSocket(fd);
 if (!socket) throw new FS.ErrnoError(8);
 return socket;
};

var Sockets = {
 BUFFER_SIZE: 10240,
 MAX_BUFFER_SIZE: 10485760,
 nextFd: 1,
 fds: {},
 nextport: 1,
 maxport: 65535,
 peer: null,
 connections: {},
 portmap: {},
 localAddr: 4261412874,
 addrPool: [ 33554442, 50331658, 67108874, 83886090, 100663306, 117440522, 134217738, 150994954, 167772170, 184549386, 201326602, 218103818, 234881034 ]
};

var inetNtop4 = addr => (addr & 255) + "." + ((addr >> 8) & 255) + "." + ((addr >> 16) & 255) + "." + ((addr >> 24) & 255);

var inetNtop6 = ints => {
 var str = "";
 var word = 0;
 var longest = 0;
 var lastzero = 0;
 var zstart = 0;
 var len = 0;
 var i = 0;
 var parts = [ ints[0] & 65535, (ints[0] >> 16), ints[1] & 65535, (ints[1] >> 16), ints[2] & 65535, (ints[2] >> 16), ints[3] & 65535, (ints[3] >> 16) ];
 var hasipv4 = true;
 var v4part = "";
 for (i = 0; i < 5; i++) {
  if (parts[i] !== 0) {
   hasipv4 = false;
   break;
  }
 }
 if (hasipv4) {
  v4part = inetNtop4(parts[6] | (parts[7] << 16));
  if (parts[5] === -1) {
   str = "::ffff:";
   str += v4part;
   return str;
  }
  if (parts[5] === 0) {
   str = "::";
   if (v4part === "0.0.0.0") v4part = "";
   if (v4part === "0.0.0.1") v4part = "1";
   str += v4part;
   return str;
  }
 }
 for (word = 0; word < 8; word++) {
  if (parts[word] === 0) {
   if (word - lastzero > 1) {
    len = 0;
   }
   lastzero = word;
   len++;
  }
  if (len > longest) {
   longest = len;
   zstart = word - longest + 1;
  }
 }
 for (word = 0; word < 8; word++) {
  if (longest > 1) {
   if (parts[word] === 0 && word >= zstart && word < (zstart + longest)) {
    if (word === zstart) {
     str += ":";
     if (zstart === 0) str += ":";
    }
    continue;
   }
  }
  str += Number(_ntohs(parts[word] & 65535)).toString(16);
  str += word < 7 ? ":" : "";
 }
 return str;
};

var readSockaddr = (sa, salen) => {
 var family = GROWABLE_HEAP_I16()[((sa) >> 1)];
 var port = _ntohs(GROWABLE_HEAP_U16()[(((sa) + (2)) >> 1)]);
 var addr;
 switch (family) {
 case 2:
  if (salen !== 16) {
   return {
    errno: 28
   };
  }
  addr = GROWABLE_HEAP_I32()[(((sa) + (4)) >> 2)];
  addr = inetNtop4(addr);
  break;

 case 10:
  if (salen !== 28) {
   return {
    errno: 28
   };
  }
  addr = [ GROWABLE_HEAP_I32()[(((sa) + (8)) >> 2)], GROWABLE_HEAP_I32()[(((sa) + (12)) >> 2)], GROWABLE_HEAP_I32()[(((sa) + (16)) >> 2)], GROWABLE_HEAP_I32()[(((sa) + (20)) >> 2)] ];
  addr = inetNtop6(addr);
  break;

 default:
  return {
   errno: 5
  };
 }
 return {
  family: family,
  addr: addr,
  port: port
 };
};

var inetPton4 = str => {
 var b = str.split(".");
 for (var i = 0; i < 4; i++) {
  var tmp = Number(b[i]);
  if (isNaN(tmp)) return null;
  b[i] = tmp;
 }
 return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
};

/** @suppress {checkTypes} */ var jstoi_q = str => parseInt(str);

var inetPton6 = str => {
 var words;
 var w, offset, z, i;
 /* http://home.deds.nl/~aeron/regex/ */ var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
 var parts = [];
 if (!valid6regx.test(str)) {
  return null;
 }
 if (str === "::") {
  return [ 0, 0, 0, 0, 0, 0, 0, 0 ];
 }
 if (str.startsWith("::")) {
  str = str.replace("::", "Z:");
 } else  {
  str = str.replace("::", ":Z:");
 }
 if (str.indexOf(".") > 0) {
  str = str.replace(new RegExp("[.]", "g"), ":");
  words = str.split(":");
  words[words.length - 4] = jstoi_q(words[words.length - 4]) + jstoi_q(words[words.length - 3]) * 256;
  words[words.length - 3] = jstoi_q(words[words.length - 2]) + jstoi_q(words[words.length - 1]) * 256;
  words = words.slice(0, words.length - 2);
 } else {
  words = str.split(":");
 }
 offset = 0;
 z = 0;
 for (w = 0; w < words.length; w++) {
  if (typeof words[w] == "string") {
   if (words[w] === "Z") {
    for (z = 0; z < (8 - words.length + 1); z++) {
     parts[w + z] = 0;
    }
    offset = z - 1;
   } else {
    parts[w + offset] = _htons(parseInt(words[w], 16));
   }
  } else {
   parts[w + offset] = words[w];
  }
 }
 return [ (parts[1] << 16) | parts[0], (parts[3] << 16) | parts[2], (parts[5] << 16) | parts[4], (parts[7] << 16) | parts[6] ];
};

var DNS = {
 address_map: {
  id: 1,
  addrs: {},
  names: {}
 },
 lookup_name(name) {
  var res = inetPton4(name);
  if (res !== null) {
   return name;
  }
  res = inetPton6(name);
  if (res !== null) {
   return name;
  }
  var addr;
  if (DNS.address_map.addrs[name]) {
   addr = DNS.address_map.addrs[name];
  } else {
   var id = DNS.address_map.id++;
   assert(id < 65535, "exceeded max address mappings of 65535");
   addr = "172.29." + (id & 255) + "." + (id & 65280);
   DNS.address_map.names[addr] = name;
   DNS.address_map.addrs[name] = addr;
  }
  return addr;
 },
 lookup_addr(addr) {
  if (DNS.address_map.names[addr]) {
   return DNS.address_map.names[addr];
  }
  return null;
 }
};

/** @param {boolean=} allowNull */ var getSocketAddress = (addrp, addrlen, allowNull) => {
 if (allowNull && addrp === 0) return null;
 var info = readSockaddr(addrp, addrlen);
 if (info.errno) throw new FS.ErrnoError(info.errno);
 info.addr = DNS.lookup_addr(info.addr) || info.addr;
 return info;
};

function ___syscall_connect(fd, addr, addrlen, d1, d2, d3) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(5, 0, 1, fd, addr, addrlen, d1, d2, d3);
 try {
  var sock = getSocketFromFD(fd);
  var info = getSocketAddress(addr, addrlen);
  sock.sock_ops.connect(sock, info.addr, info.port);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_faccessat(dirfd, path, amode, flags) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(6, 0, 1, dirfd, path, amode, flags);
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  if (amode & ~7) {
   return -28;
  }
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node) {
   return -44;
  }
  var perms = "";
  if (amode & 4) perms += "r";
  if (amode & 2) perms += "w";
  if (amode & 1) perms += "x";
  if (perms && /* otherwise, they've just passed F_OK */ FS.nodePermissions(node, perms)) {
   return -2;
  }
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_fadvise64(fd, offset, len, advice) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(7, 0, 0, fd, offset, len, advice);
 return 0;
}

function ___syscall_fallocate(fd, mode, offset, len) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(8, 0, 1, fd, mode, offset, len);
 offset = bigintToI53Checked(offset);
 len = bigintToI53Checked(len);
 try {
  if (isNaN(offset)) return 61;
  var stream = SYSCALLS.getStreamFromFD(fd);
  FS.allocate(stream, offset, len);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_fchmod(fd, mode) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(9, 0, 1, fd, mode);
 try {
  FS.fchmod(fd, mode);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_fchown32(fd, owner, group) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(10, 0, 1, fd, owner, group);
 try {
  FS.fchown(fd, owner, group);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_fcntl64(fd, cmd, varargs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(11, 0, 1, fd, cmd, varargs);
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  switch (cmd) {
  case 0:
   {
    var arg = SYSCALLS.get();
    if (arg < 0) {
     return -28;
    }
    while (FS.streams[arg]) {
     arg++;
    }
    var newStream;
    newStream = FS.dupStream(stream, arg);
    return newStream.fd;
   }

  case 1:
  case 2:
   return 0;

  case 3:
   return stream.flags;

  case 4:
   {
    var arg = SYSCALLS.get();
    stream.flags |= arg;
    return 0;
   }

  case 12:
   {
    var arg = SYSCALLS.getp();
    var offset = 0;
    GROWABLE_HEAP_I16()[(((arg) + (offset)) >> 1)] = 2;
    return 0;
   }

  case 13:
  case 14:
   return 0;
  }
  return -28;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_fstat64(fd, buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(12, 0, 1, fd, buf);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  return SYSCALLS.doStat(FS.stat, stream.path, buf);
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_statfs64(path, size, buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(14, 0, 1, path, size, buf);
 try {
  path = SYSCALLS.getStr(path);
  GROWABLE_HEAP_I32()[(((buf) + (4)) >> 2)] = 4096;
  GROWABLE_HEAP_I32()[(((buf) + (40)) >> 2)] = 4096;
  GROWABLE_HEAP_I32()[(((buf) + (8)) >> 2)] = 1e6;
  GROWABLE_HEAP_I32()[(((buf) + (12)) >> 2)] = 5e5;
  GROWABLE_HEAP_I32()[(((buf) + (16)) >> 2)] = 5e5;
  GROWABLE_HEAP_I32()[(((buf) + (20)) >> 2)] = FS.nextInode;
  GROWABLE_HEAP_I32()[(((buf) + (24)) >> 2)] = 1e6;
  GROWABLE_HEAP_I32()[(((buf) + (28)) >> 2)] = 42;
  GROWABLE_HEAP_I32()[(((buf) + (44)) >> 2)] = 2;
  GROWABLE_HEAP_I32()[(((buf) + (36)) >> 2)] = 255;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_fstatfs64(fd, size, buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(13, 0, 1, fd, size, buf);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  return ___syscall_statfs64(0, size, buf);
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_ftruncate64(fd, length) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(15, 0, 1, fd, length);
 length = bigintToI53Checked(length);
 try {
  if (isNaN(length)) return 61;
  FS.ftruncate(fd, length);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, GROWABLE_HEAP_U8(), outPtr, maxBytesToWrite);

function ___syscall_getcwd(buf, size) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(16, 0, 1, buf, size);
 try {
  if (size === 0) return -28;
  var cwd = FS.cwd();
  var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
  if (size < cwdLengthInBytes) return -68;
  stringToUTF8(cwd, buf, size);
  return cwdLengthInBytes;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_getdents64(fd, dirp, count) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(17, 0, 1, fd, dirp, count);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  stream.getdents ||= FS.readdir(stream.path);
  var struct_size = 280;
  var pos = 0;
  var off = FS.llseek(stream, 0, 1);
  var idx = Math.floor(off / struct_size);
  while (idx < stream.getdents.length && pos + struct_size <= count) {
   var id;
   var type;
   var name = stream.getdents[idx];
   if (name === ".") {
    id = stream.node.id;
    type = 4;
   } else if (name === "..") {
    var lookup = FS.lookupPath(stream.path, {
     parent: true
    });
    id = lookup.node.id;
    type = 4;
   } else {
    var child = FS.lookupNode(stream.node, name);
    id = child.id;
    type = FS.isChrdev(child.mode) ? 2 :  FS.isDir(child.mode) ? 4 :  FS.isLink(child.mode) ? 10 :  8;
   }
   HEAP64[((dirp + pos) >> 3)] = BigInt(id);
   HEAP64[(((dirp + pos) + (8)) >> 3)] = BigInt((idx + 1) * struct_size);
   GROWABLE_HEAP_I16()[(((dirp + pos) + (16)) >> 1)] = 280;
   GROWABLE_HEAP_I8()[(dirp + pos) + (18)] = type;
   stringToUTF8(name, dirp + pos + 19, 256);
   pos += struct_size;
   idx += 1;
  }
  FS.llseek(stream, idx * struct_size, 0);
  return pos;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_ioctl(fd, op, varargs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(18, 0, 1, fd, op, varargs);
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  switch (op) {
  case 21509:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21505:
   {
    if (!stream.tty) return -59;
    if (stream.tty.ops.ioctl_tcgets) {
     var termios = stream.tty.ops.ioctl_tcgets(stream);
     var argp = SYSCALLS.getp();
     GROWABLE_HEAP_I32()[((argp) >> 2)] = termios.c_iflag || 0;
     GROWABLE_HEAP_I32()[(((argp) + (4)) >> 2)] = termios.c_oflag || 0;
     GROWABLE_HEAP_I32()[(((argp) + (8)) >> 2)] = termios.c_cflag || 0;
     GROWABLE_HEAP_I32()[(((argp) + (12)) >> 2)] = termios.c_lflag || 0;
     for (var i = 0; i < 32; i++) {
      GROWABLE_HEAP_I8()[(argp + i) + (17)] = termios.c_cc[i] || 0;
     }
     return 0;
    }
    return 0;
   }

  case 21510:
  case 21511:
  case 21512:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21506:
  case 21507:
  case 21508:
   {
    if (!stream.tty) return -59;
    if (stream.tty.ops.ioctl_tcsets) {
     var argp = SYSCALLS.getp();
     var c_iflag = GROWABLE_HEAP_I32()[((argp) >> 2)];
     var c_oflag = GROWABLE_HEAP_I32()[(((argp) + (4)) >> 2)];
     var c_cflag = GROWABLE_HEAP_I32()[(((argp) + (8)) >> 2)];
     var c_lflag = GROWABLE_HEAP_I32()[(((argp) + (12)) >> 2)];
     var c_cc = [];
     for (var i = 0; i < 32; i++) {
      c_cc.push(GROWABLE_HEAP_I8()[(argp + i) + (17)]);
     }
     return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
      c_iflag: c_iflag,
      c_oflag: c_oflag,
      c_cflag: c_cflag,
      c_lflag: c_lflag,
      c_cc: c_cc
     });
    }
    return 0;
   }

  case 21519:
   {
    if (!stream.tty) return -59;
    var argp = SYSCALLS.getp();
    GROWABLE_HEAP_I32()[((argp) >> 2)] = 0;
    return 0;
   }

  case 21520:
   {
    if (!stream.tty) return -59;
    return -28;
   }

  case 21531:
   {
    var argp = SYSCALLS.getp();
    return FS.ioctl(stream, op, argp);
   }

  case 21523:
   {
    if (!stream.tty) return -59;
    if (stream.tty.ops.ioctl_tiocgwinsz) {
     var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
     var argp = SYSCALLS.getp();
     GROWABLE_HEAP_I16()[((argp) >> 1)] = winsize[0];
     GROWABLE_HEAP_I16()[(((argp) + (2)) >> 1)] = winsize[1];
    }
    return 0;
   }

  case 21524:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21515:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  default:
   return -28;
  }
 }  catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_lstat64(path, buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(19, 0, 1, path, buf);
 try {
  path = SYSCALLS.getStr(path);
  return SYSCALLS.doStat(FS.lstat, path, buf);
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_mkdirat(dirfd, path, mode) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(20, 0, 1, dirfd, path, mode);
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  path = PATH.normalize(path);
  if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
  FS.mkdir(path, mode, 0);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_newfstatat(dirfd, path, buf, flags) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(21, 0, 1, dirfd, path, buf, flags);
 try {
  path = SYSCALLS.getStr(path);
  var nofollow = flags & 256;
  var allowEmpty = flags & 4096;
  flags = flags & (~6400);
  path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
  return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_openat(dirfd, path, flags, varargs) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(22, 0, 1, dirfd, path, flags, varargs);
 SYSCALLS.varargs = varargs;
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  var mode = varargs ? SYSCALLS.get() : 0;
  return FS.open(path, flags, mode).fd;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(23, 0, 1, dirfd, path, buf, bufsize);
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  if (bufsize <= 0) return -28;
  var ret = FS.readlink(path);
  var len = Math.min(bufsize, lengthBytesUTF8(ret));
  var endChar = GROWABLE_HEAP_I8()[buf + len];
  stringToUTF8(ret, buf, bufsize + 1);
  GROWABLE_HEAP_I8()[buf + len] = endChar;
  return len;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(24, 0, 1, olddirfd, oldpath, newdirfd, newpath);
 try {
  oldpath = SYSCALLS.getStr(oldpath);
  newpath = SYSCALLS.getStr(newpath);
  oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
  newpath = SYSCALLS.calculateAt(newdirfd, newpath);
  FS.rename(oldpath, newpath);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_rmdir(path) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(25, 0, 1, path);
 try {
  path = SYSCALLS.getStr(path);
  FS.rmdir(path);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_sendto(fd, message, length, flags, addr, addr_len) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(26, 0, 1, fd, message, length, flags, addr, addr_len);
 try {
  var sock = getSocketFromFD(fd);
  var dest = getSocketAddress(addr, addr_len, true);
  if (!dest) {
   return FS.write(sock.stream, GROWABLE_HEAP_I8(), message, length);
  }
  return sock.sock_ops.sendmsg(sock, GROWABLE_HEAP_I8(), message, length, dest.addr, dest.port);
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_socket(domain, type, protocol) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(27, 0, 1, domain, type, protocol);
 try {
  var sock = SOCKFS.createSocket(domain, type, protocol);
  return sock.stream.fd;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_stat64(path, buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(28, 0, 1, path, buf);
 try {
  path = SYSCALLS.getStr(path);
  return SYSCALLS.doStat(FS.stat, path, buf);
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_symlink(target, linkpath) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(29, 0, 1, target, linkpath);
 try {
  target = SYSCALLS.getStr(target);
  linkpath = SYSCALLS.getStr(linkpath);
  FS.symlink(target, linkpath);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function ___syscall_unlinkat(dirfd, path, flags) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(30, 0, 1, dirfd, path, flags);
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  if (flags === 0) {
   FS.unlink(path);
  } else if (flags === 512) {
   FS.rmdir(path);
  } else {
   abort("Invalid flags passed to unlinkat");
  }
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

var readI53FromI64 = ptr => GROWABLE_HEAP_U32()[((ptr) >> 2)] + GROWABLE_HEAP_I32()[(((ptr) + (4)) >> 2)] * 4294967296;

function ___syscall_utimensat(dirfd, path, times, flags) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(31, 0, 1, dirfd, path, times, flags);
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path, true);
  if (!times) {
   var atime = Date.now();
   var mtime = atime;
  } else {
   var seconds = readI53FromI64(times);
   var nanoseconds = GROWABLE_HEAP_I32()[(((times) + (8)) >> 2)];
   atime = (seconds * 1e3) + (nanoseconds / (1e3 * 1e3));
   times += 16;
   seconds = readI53FromI64(times);
   nanoseconds = GROWABLE_HEAP_I32()[(((times) + (8)) >> 2)];
   mtime = (seconds * 1e3) + (nanoseconds / (1e3 * 1e3));
  }
  FS.utime(path, atime, mtime);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

var nowIsMonotonic = 1;

var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;

var maybeExit = () => {
 if (runtimeExited) {
  return;
 }
 if (!keepRuntimeAlive()) {
  try {
   if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS); else _exit(EXITSTATUS);
  } catch (e) {
   handleException(e);
  }
 }
};

var callUserCallback = func => {
 if (runtimeExited || ABORT) {
  return;
 }
 try {
  func();
  maybeExit();
 } catch (e) {
  handleException(e);
 }
};

var __emscripten_thread_mailbox_await = pthread_ptr => {
 if (typeof Atomics.waitAsync === "function") {
  var wait = Atomics.waitAsync(GROWABLE_HEAP_I32(), ((pthread_ptr) >> 2), pthread_ptr);
  wait.value.then(checkMailbox);
  var waitingAsync = pthread_ptr + 128;
  Atomics.store(GROWABLE_HEAP_I32(), ((waitingAsync) >> 2), 1);
 }
};

Module["__emscripten_thread_mailbox_await"] = __emscripten_thread_mailbox_await;

var checkMailbox = () => {
 var pthread_ptr = _pthread_self();
 if (pthread_ptr) {
  __emscripten_thread_mailbox_await(pthread_ptr);
  callUserCallback(__emscripten_check_mailbox);
 }
};

Module["checkMailbox"] = checkMailbox;

var __emscripten_notify_mailbox_postmessage = (targetThreadId, currThreadId, mainThreadId) => {
 if (targetThreadId == currThreadId) {
  setTimeout(checkMailbox);
 } else if (ENVIRONMENT_IS_PTHREAD) {
  postMessage({
   "targetThread": targetThreadId,
   "cmd": "checkMailbox"
  });
 } else {
  var worker = PThread.pthreads[targetThreadId];
  if (!worker) {
   return;
  }
  worker.postMessage({
   "cmd": "checkMailbox"
  });
 }
};

var proxiedJSCallArgs = [];

var __emscripten_receive_on_main_thread_js = (funcIndex, emAsmAddr, callingThread, numCallArgs, args) => {
 numCallArgs /= 2;
 proxiedJSCallArgs.length = numCallArgs;
 var b = ((args) >> 3);
 for (var i = 0; i < numCallArgs; i++) {
  if (HEAP64[b + 2 * i]) {
   proxiedJSCallArgs[i] = HEAP64[b + 2 * i + 1];
  } else {
   proxiedJSCallArgs[i] = GROWABLE_HEAP_F64()[b + 2 * i + 1];
  }
 }
 var func = proxiedFunctionTable[funcIndex];
 PThread.currentProxiedOperationCallerThread = callingThread;
 var rtn = func(...proxiedJSCallArgs);
 PThread.currentProxiedOperationCallerThread = 0;
 return rtn;
};

var __emscripten_thread_set_strongref = thread => {
 if (ENVIRONMENT_IS_NODE) {
  PThread.pthreads[thread].ref();
 }
};

function __gmtime_js(time, tmPtr) {
 time = bigintToI53Checked(time);
 var date = new Date(time * 1e3);
 GROWABLE_HEAP_I32()[((tmPtr) >> 2)] = date.getUTCSeconds();
 GROWABLE_HEAP_I32()[(((tmPtr) + (4)) >> 2)] = date.getUTCMinutes();
 GROWABLE_HEAP_I32()[(((tmPtr) + (8)) >> 2)] = date.getUTCHours();
 GROWABLE_HEAP_I32()[(((tmPtr) + (12)) >> 2)] = date.getUTCDate();
 GROWABLE_HEAP_I32()[(((tmPtr) + (16)) >> 2)] = date.getUTCMonth();
 GROWABLE_HEAP_I32()[(((tmPtr) + (20)) >> 2)] = date.getUTCFullYear() - 1900;
 GROWABLE_HEAP_I32()[(((tmPtr) + (24)) >> 2)] = date.getUTCDay();
 var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
 var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
 GROWABLE_HEAP_I32()[(((tmPtr) + (28)) >> 2)] = yday;
}

var isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

var MONTH_DAYS_LEAP_CUMULATIVE = [ 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335 ];

var MONTH_DAYS_REGULAR_CUMULATIVE = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 ];

var ydayFromDate = date => {
 var leap = isLeapYear(date.getFullYear());
 var monthDaysCumulative = (leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE);
 var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
 return yday;
};

function __localtime_js(time, tmPtr) {
 time = bigintToI53Checked(time);
 var date = new Date(time * 1e3);
 GROWABLE_HEAP_I32()[((tmPtr) >> 2)] = date.getSeconds();
 GROWABLE_HEAP_I32()[(((tmPtr) + (4)) >> 2)] = date.getMinutes();
 GROWABLE_HEAP_I32()[(((tmPtr) + (8)) >> 2)] = date.getHours();
 GROWABLE_HEAP_I32()[(((tmPtr) + (12)) >> 2)] = date.getDate();
 GROWABLE_HEAP_I32()[(((tmPtr) + (16)) >> 2)] = date.getMonth();
 GROWABLE_HEAP_I32()[(((tmPtr) + (20)) >> 2)] = date.getFullYear() - 1900;
 GROWABLE_HEAP_I32()[(((tmPtr) + (24)) >> 2)] = date.getDay();
 var yday = ydayFromDate(date) | 0;
 GROWABLE_HEAP_I32()[(((tmPtr) + (28)) >> 2)] = yday;
 GROWABLE_HEAP_I32()[(((tmPtr) + (36)) >> 2)] = -(date.getTimezoneOffset() * 60);
 var start = new Date(date.getFullYear(), 0, 1);
 var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
 var winterOffset = start.getTimezoneOffset();
 var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
 GROWABLE_HEAP_I32()[(((tmPtr) + (32)) >> 2)] = dst;
}

function __mmap_js(len, prot, flags, fd, offset, allocated, addr) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(32, 0, 1, len, prot, flags, fd, offset, allocated, addr);
 offset = bigintToI53Checked(offset);
 try {
  if (isNaN(offset)) return 61;
  var stream = SYSCALLS.getStreamFromFD(fd);
  var res = FS.mmap(stream, len, offset, prot, flags);
  var ptr = res.ptr;
  GROWABLE_HEAP_I32()[((allocated) >> 2)] = res.allocated;
  GROWABLE_HEAP_U32()[((addr) >> 2)] = ptr;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function __msync_js(addr, len, prot, flags, fd, offset) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(33, 0, 1, addr, len, prot, flags, fd, offset);
 offset = bigintToI53Checked(offset);
 try {
  if (isNaN(offset)) return 61;
  SYSCALLS.doMsync(addr, SYSCALLS.getStreamFromFD(fd), len, flags, offset);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

function __munmap_js(addr, len, prot, flags, fd, offset) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(34, 0, 1, addr, len, prot, flags, fd, offset);
 offset = bigintToI53Checked(offset);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  if (prot & 2) {
   SYSCALLS.doMsync(addr, stream, len, flags, offset);
  }
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

var __timegm_js = function(tmPtr) {
 var ret = (() => {
  var time = Date.UTC(GROWABLE_HEAP_I32()[(((tmPtr) + (20)) >> 2)] + 1900, GROWABLE_HEAP_I32()[(((tmPtr) + (16)) >> 2)], GROWABLE_HEAP_I32()[(((tmPtr) + (12)) >> 2)], GROWABLE_HEAP_I32()[(((tmPtr) + (8)) >> 2)], GROWABLE_HEAP_I32()[(((tmPtr) + (4)) >> 2)], GROWABLE_HEAP_I32()[((tmPtr) >> 2)], 0);
  var date = new Date(time);
  GROWABLE_HEAP_I32()[(((tmPtr) + (24)) >> 2)] = date.getUTCDay();
  var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
  var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
  GROWABLE_HEAP_I32()[(((tmPtr) + (28)) >> 2)] = yday;
  return date.getTime() / 1e3;
 })();
 return BigInt(ret);
};

var __tzset_js = (timezone, daylight, std_name, dst_name) => {
 var currentYear = (new Date).getFullYear();
 var winter = new Date(currentYear, 0, 1);
 var summer = new Date(currentYear, 6, 1);
 var winterOffset = winter.getTimezoneOffset();
 var summerOffset = summer.getTimezoneOffset();
 var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
 GROWABLE_HEAP_U32()[((timezone) >> 2)] = stdTimezoneOffset * 60;
 GROWABLE_HEAP_I32()[((daylight) >> 2)] = Number(winterOffset != summerOffset);
 function extractZone(date) {
  var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
  return match ? match[1] : "GMT";
 }
 var winterName = extractZone(winter);
 var summerName = extractZone(summer);
 if (summerOffset < winterOffset) {
  stringToUTF8(winterName, std_name, 7);
  stringToUTF8(summerName, dst_name, 7);
 } else {
  stringToUTF8(winterName, dst_name, 7);
  stringToUTF8(summerName, std_name, 7);
 }
};

var _abort = () => {
 abort("");
};

var warnOnce = text => {
 warnOnce.shown ||= {};
 if (!warnOnce.shown[text]) {
  warnOnce.shown[text] = 1;
  if (ENVIRONMENT_IS_NODE) text = "warning: " + text;
  err(text);
 }
};

var _emscripten_check_blocking_allowed = () => {};

var _emscripten_clear_timeout = clearTimeout;

var _emscripten_date_now = () => Date.now();

var runtimeKeepalivePush = () => {
 runtimeKeepaliveCounter += 1;
};

var _emscripten_exit_with_live_runtime = () => {
 runtimeKeepalivePush();
 throw "unwind";
};

function __emscripten_runtime_keepalive_clear() {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(36, 0, 1);
 noExitRuntime = false;
 runtimeKeepaliveCounter = 0;
}

function _emscripten_force_exit(status) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(35, 0, 1, status);
 __emscripten_runtime_keepalive_clear();
 _exit(status);
}

Module["_emscripten_force_exit"] = _emscripten_force_exit;

var getHeapMax = () =>  2147483648;

var _emscripten_get_heap_max = () => getHeapMax();

var _emscripten_get_now;

_emscripten_get_now = () => performance.timeOrigin + performance.now();

var _emscripten_get_now_res = () => {
 if (ENVIRONMENT_IS_NODE) {
  return 1;
 }
 return 1e3;
};

var _emscripten_num_logical_cores = () => ENVIRONMENT_IS_NODE ? require("os").cpus().length : navigator["hardwareConcurrency"];

var growMemory = size => {
 var b = wasmMemory.buffer;
 var pages = (size - b.byteLength + 65535) / 65536;
 try {
  wasmMemory.grow(pages);
  updateMemoryViews();
  return 1;
 } /*success*/ catch (e) {}
};

var _emscripten_resize_heap = requestedSize => {
 var oldSize = GROWABLE_HEAP_U8().length;
 requestedSize >>>= 0;
 if (requestedSize <= oldSize) {
  return false;
 }
 var maxHeapSize = getHeapMax();
 if (requestedSize > maxHeapSize) {
  return false;
 }
 var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
 for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
  var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
  overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
  var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
  var replacement = growMemory(newSize);
  if (replacement) {
   return true;
  }
 }
 return false;
};

var runtimeKeepalivePop = () => {
 runtimeKeepaliveCounter -= 1;
};

/** @param {number=} timeout */ var safeSetTimeout = (func, timeout) => {
 runtimeKeepalivePush();
 return setTimeout(() => {
  runtimeKeepalivePop();
  callUserCallback(func);
 }, timeout);
};

var _emscripten_set_timeout = (cb, msecs, userData) => safeSetTimeout(() => getWasmTableEntry(cb)(userData), msecs);

var _emscripten_unwind_to_js_event_loop = () => {
 throw "unwind";
};

var ENV = {};

var getExecutableName = () => thisProgram || "./this.program";

var getEnvStrings = () => {
 if (!getEnvStrings.strings) {
  var lang = ((typeof navigator == "object" && navigator.languages && navigator.languages[0]) || "C").replace("-", "_") + ".UTF-8";
  var env = {
   "USER": "web_user",
   "LOGNAME": "web_user",
   "PATH": "/",
   "PWD": "/",
   "HOME": "/home/web_user",
   "LANG": lang,
   "_": getExecutableName()
  };
  for (var x in ENV) {
   if (ENV[x] === undefined) delete env[x]; else env[x] = ENV[x];
  }
  var strings = [];
  for (var x in env) {
   strings.push(`${x}=${env[x]}`);
  }
  getEnvStrings.strings = strings;
 }
 return getEnvStrings.strings;
};

var stringToAscii = (str, buffer) => {
 for (var i = 0; i < str.length; ++i) {
  GROWABLE_HEAP_I8()[buffer++] = str.charCodeAt(i);
 }
 GROWABLE_HEAP_I8()[buffer] = 0;
};

var _environ_get = function(__environ, environ_buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(37, 0, 1, __environ, environ_buf);
 var bufSize = 0;
 getEnvStrings().forEach((string, i) => {
  var ptr = environ_buf + bufSize;
  GROWABLE_HEAP_U32()[(((__environ) + (i * 4)) >> 2)] = ptr;
  stringToAscii(string, ptr);
  bufSize += string.length + 1;
 });
 return 0;
};

var _environ_sizes_get = function(penviron_count, penviron_buf_size) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(38, 0, 1, penviron_count, penviron_buf_size);
 var strings = getEnvStrings();
 GROWABLE_HEAP_U32()[((penviron_count) >> 2)] = strings.length;
 var bufSize = 0;
 strings.forEach(string => bufSize += string.length + 1);
 GROWABLE_HEAP_U32()[((penviron_buf_size) >> 2)] = bufSize;
 return 0;
};

function _fd_close(fd) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(39, 0, 1, fd);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  FS.close(stream);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

function _fd_fdstat_get(fd, pbuf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(40, 0, 1, fd, pbuf);
 try {
  var rightsBase = 0;
  var rightsInheriting = 0;
  var flags = 0;
  {
   var stream = SYSCALLS.getStreamFromFD(fd);
   var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
  }
  GROWABLE_HEAP_I8()[pbuf] = type;
  GROWABLE_HEAP_I16()[(((pbuf) + (2)) >> 1)] = flags;
  HEAP64[(((pbuf) + (8)) >> 3)] = BigInt(rightsBase);
  HEAP64[(((pbuf) + (16)) >> 3)] = BigInt(rightsInheriting);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

/** @param {number=} offset */ var doReadv = (stream, iov, iovcnt, offset) => {
 var ret = 0;
 for (var i = 0; i < iovcnt; i++) {
  var ptr = GROWABLE_HEAP_U32()[((iov) >> 2)];
  var len = GROWABLE_HEAP_U32()[(((iov) + (4)) >> 2)];
  iov += 8;
  var curr = FS.read(stream, GROWABLE_HEAP_I8(), ptr, len, offset);
  if (curr < 0) return -1;
  ret += curr;
  if (curr < len) break;
  if (typeof offset !== "undefined") {
   offset += curr;
  }
 }
 return ret;
};

function _fd_pread(fd, iov, iovcnt, offset, pnum) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(41, 0, 1, fd, iov, iovcnt, offset, pnum);
 offset = bigintToI53Checked(offset);
 try {
  if (isNaN(offset)) return 61;
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = doReadv(stream, iov, iovcnt, offset);
  GROWABLE_HEAP_U32()[((pnum) >> 2)] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

/** @param {number=} offset */ var doWritev = (stream, iov, iovcnt, offset) => {
 var ret = 0;
 for (var i = 0; i < iovcnt; i++) {
  var ptr = GROWABLE_HEAP_U32()[((iov) >> 2)];
  var len = GROWABLE_HEAP_U32()[(((iov) + (4)) >> 2)];
  iov += 8;
  var curr = FS.write(stream, GROWABLE_HEAP_I8(), ptr, len, offset);
  if (curr < 0) return -1;
  ret += curr;
  if (typeof offset !== "undefined") {
   offset += curr;
  }
 }
 return ret;
};

function _fd_pwrite(fd, iov, iovcnt, offset, pnum) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(42, 0, 1, fd, iov, iovcnt, offset, pnum);
 offset = bigintToI53Checked(offset);
 try {
  if (isNaN(offset)) return 61;
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = doWritev(stream, iov, iovcnt, offset);
  GROWABLE_HEAP_U32()[((pnum) >> 2)] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

function _fd_read(fd, iov, iovcnt, pnum) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(43, 0, 1, fd, iov, iovcnt, pnum);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = doReadv(stream, iov, iovcnt);
  GROWABLE_HEAP_U32()[((pnum) >> 2)] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

function _fd_seek(fd, offset, whence, newOffset) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(44, 0, 1, fd, offset, whence, newOffset);
 offset = bigintToI53Checked(offset);
 try {
  if (isNaN(offset)) return 61;
  var stream = SYSCALLS.getStreamFromFD(fd);
  FS.llseek(stream, offset, whence);
  HEAP64[((newOffset) >> 3)] = BigInt(stream.position);
  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

function _fd_sync(fd) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(45, 0, 1, fd);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  if (stream.stream_ops?.fsync) {
   return stream.stream_ops.fsync(stream);
  }
  return 0;
 }  catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

function _fd_write(fd, iov, iovcnt, pnum) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(46, 0, 1, fd, iov, iovcnt, pnum);
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = doWritev(stream, iov, iovcnt);
  GROWABLE_HEAP_U32()[((pnum) >> 2)] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

var _getentropy = (buffer, size) => {
 randomFill(GROWABLE_HEAP_U8().subarray(buffer, buffer + size));
 return 0;
};

var webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance = ctx =>  !!(ctx.dibvbi = ctx.getExtension("WEBGL_draw_instanced_base_vertex_base_instance"));

var webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance = ctx => !!(ctx.mdibvbi = ctx.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance"));

var webgl_enable_WEBGL_multi_draw = ctx => !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));

var getEmscriptenSupportedExtensions = ctx => {
 var supportedExtensions = [  "EXT_color_buffer_float", "EXT_conservative_depth", "EXT_disjoint_timer_query_webgl2", "EXT_texture_norm16", "NV_shader_noperspective_interpolation", "WEBGL_clip_cull_distance",  "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "KHR_parallel_shader_compile", "OES_texture_float_linear", "WEBGL_blend_func_extended", "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw" ];
 return (ctx.getSupportedExtensions() || []).filter(ext => supportedExtensions.includes(ext));
};

var GL = {
 counter: 1,
 buffers: [],
 programs: [],
 framebuffers: [],
 renderbuffers: [],
 textures: [],
 shaders: [],
 vaos: [],
 contexts: {},
 offscreenCanvases: {},
 queries: [],
 samplers: [],
 transformFeedbacks: [],
 syncs: [],
 stringCache: {},
 stringiCache: {},
 unpackAlignment: 4,
 recordError: errorCode => {
  if (!GL.lastError) {
   GL.lastError = errorCode;
  }
 },
 getNewId: table => {
  var ret = GL.counter++;
  for (var i = table.length; i < ret; i++) {
   table[i] = null;
  }
  return ret;
 },
 genObject: (n, buffers, createFunction, objectTable) => {
  for (var i = 0; i < n; i++) {
   var buffer = GLctx[createFunction]();
   var id = buffer && GL.getNewId(objectTable);
   if (buffer) {
    buffer.name = id;
    objectTable[id] = buffer;
   } else {
    GL.recordError(1282);
   }
   GROWABLE_HEAP_I32()[(((buffers) + (i * 4)) >> 2)] = id;
  }
 },
 getSource: (shader, count, string, length) => {
  var source = "";
  for (var i = 0; i < count; ++i) {
   var len = length ? GROWABLE_HEAP_U32()[(((length) + (i * 4)) >> 2)] : undefined;
   source += UTF8ToString(GROWABLE_HEAP_U32()[(((string) + (i * 4)) >> 2)], len);
  }
  return source;
 },
 createContext: (/** @type {HTMLCanvasElement} */ canvas, webGLContextAttributes) => {
  if (!canvas.getContextSafariWebGL2Fixed) {
   canvas.getContextSafariWebGL2Fixed = canvas.getContext;
   /** @type {function(this:HTMLCanvasElement, string, (Object|null)=): (Object|null)} */ function fixedGetContext(ver, attrs) {
    var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
    return ((ver == "webgl") == (gl instanceof WebGLRenderingContext)) ? gl : null;
   }
   canvas.getContext = fixedGetContext;
  }
  var ctx = canvas.getContext("webgl2", webGLContextAttributes);
  if (!ctx) return 0;
  var handle = GL.registerContext(ctx, webGLContextAttributes);
  return handle;
 },
 registerContext: (ctx, webGLContextAttributes) => {
  var handle = _malloc(8);
  GROWABLE_HEAP_U32()[(((handle) + (4)) >> 2)] = _pthread_self();
  var context = {
   handle: handle,
   attributes: webGLContextAttributes,
   version: webGLContextAttributes.majorVersion,
   GLctx: ctx
  };
  if (ctx.canvas) ctx.canvas.GLctxObject = context;
  GL.contexts[handle] = context;
  if (typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
   GL.initExtensions(context);
  }
  return handle;
 },
 makeContextCurrent: contextHandle => {
  GL.currentContext = GL.contexts[contextHandle];
  Module.ctx = GLctx = GL.currentContext?.GLctx;
  return !(contextHandle && !GLctx);
 },
 getContext: contextHandle => GL.contexts[contextHandle],
 deleteContext: contextHandle => {
  if (GL.currentContext === GL.contexts[contextHandle]) {
   GL.currentContext = null;
  }
  if (typeof JSEvents == "object") {
   JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
  }
  if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) {
   GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
  }
  _free(GL.contexts[contextHandle].handle);
  GL.contexts[contextHandle] = null;
 },
 initExtensions: context => {
  context ||= GL.currentContext;
  if (context.initExtensionsDone) return;
  context.initExtensionsDone = true;
  var GLctx = context.GLctx;
  webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
  webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
  if (context.version >= 2) {
   GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query_webgl2");
  }
  if (context.version < 2 || !GLctx.disjointTimerQueryExt) {
   GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
  }
  webgl_enable_WEBGL_multi_draw(GLctx);
  getEmscriptenSupportedExtensions(GLctx).forEach(ext => {
   if (!ext.includes("lose_context") && !ext.includes("debug")) {
    GLctx.getExtension(ext);
   }
  });
 }
};

var _glActiveTexture = x0 => GLctx.activeTexture(x0);

var _glAttachShader = (program, shader) => {
 GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
};

var _glBindBuffer = (target, buffer) => {
 if (target == 35051) /*GL_PIXEL_PACK_BUFFER*/ {
  GLctx.currentPixelPackBufferBinding = buffer;
 } else if (target == 35052) /*GL_PIXEL_UNPACK_BUFFER*/ {
  GLctx.currentPixelUnpackBufferBinding = buffer;
 }
 GLctx.bindBuffer(target, GL.buffers[buffer]);
};

var _glBindBufferBase = (target, index, buffer) => {
 GLctx.bindBufferBase(target, index, GL.buffers[buffer]);
};

var _glBindFramebuffer = (target, framebuffer) => {
 GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
};

var _glBindRenderbuffer = (target, renderbuffer) => {
 GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
};

var _glBindTexture = (target, texture) => {
 GLctx.bindTexture(target, GL.textures[texture]);
};

var _glBindVertexArray = vao => {
 GLctx.bindVertexArray(GL.vaos[vao]);
};

var _glBlendEquationSeparate = (x0, x1) => GLctx.blendEquationSeparate(x0, x1);

var _glBlendFuncSeparate = (x0, x1, x2, x3) => GLctx.blendFuncSeparate(x0, x1, x2, x3);

var _glBufferData = (target, size, data, usage) => {
 if (true) {
  if (data && size) {
   GLctx.bufferData(target, GROWABLE_HEAP_U8(), usage, data, size);
  } else {
   GLctx.bufferData(target, size, usage);
  }
  return;
 }
 GLctx.bufferData(target, data ? GROWABLE_HEAP_U8().subarray(data, data + size) : size, usage);
};

var _glBufferSubData = (target, offset, size, data) => {
 if (true) {
  size && GLctx.bufferSubData(target, offset, GROWABLE_HEAP_U8(), data, size);
  return;
 }
 GLctx.bufferSubData(target, offset, GROWABLE_HEAP_U8().subarray(data, data + size));
};

var _glClear = x0 => GLctx.clear(x0);

var _glClearColor = (x0, x1, x2, x3) => GLctx.clearColor(x0, x1, x2, x3);

var _glClearDepthf = x0 => GLctx.clearDepth(x0);

var _glClearStencil = x0 => GLctx.clearStencil(x0);

var _glColorMask = (red, green, blue, alpha) => {
 GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
};

var _glCompileShader = shader => {
 GLctx.compileShader(GL.shaders[shader]);
};

var _glCreateProgram = () => {
 var id = GL.getNewId(GL.programs);
 var program = GLctx.createProgram();
 program.name = id;
 program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
 program.uniformIdCounter = 1;
 GL.programs[id] = program;
 return id;
};

var _glCreateShader = shaderType => {
 var id = GL.getNewId(GL.shaders);
 GL.shaders[id] = GLctx.createShader(shaderType);
 return id;
};

var _glDeleteBuffers = (n, buffers) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((buffers) + (i * 4)) >> 2)];
  var buffer = GL.buffers[id];
  if (!buffer) continue;
  GLctx.deleteBuffer(buffer);
  buffer.name = 0;
  GL.buffers[id] = null;
  if (id == GLctx.currentPixelPackBufferBinding) GLctx.currentPixelPackBufferBinding = 0;
  if (id == GLctx.currentPixelUnpackBufferBinding) GLctx.currentPixelUnpackBufferBinding = 0;
 }
};

var _glDeleteFramebuffers = (n, framebuffers) => {
 for (var i = 0; i < n; ++i) {
  var id = GROWABLE_HEAP_I32()[(((framebuffers) + (i * 4)) >> 2)];
  var framebuffer = GL.framebuffers[id];
  if (!framebuffer) continue;
  GLctx.deleteFramebuffer(framebuffer);
  framebuffer.name = 0;
  GL.framebuffers[id] = null;
 }
};

var _glDeleteProgram = id => {
 if (!id) return;
 var program = GL.programs[id];
 if (!program) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GLctx.deleteProgram(program);
 program.name = 0;
 GL.programs[id] = null;
};

var _glDeleteRenderbuffers = (n, renderbuffers) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((renderbuffers) + (i * 4)) >> 2)];
  var renderbuffer = GL.renderbuffers[id];
  if (!renderbuffer) continue;
  GLctx.deleteRenderbuffer(renderbuffer);
  renderbuffer.name = 0;
  GL.renderbuffers[id] = null;
 }
};

var _glDeleteShader = id => {
 if (!id) return;
 var shader = GL.shaders[id];
 if (!shader) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 GLctx.deleteShader(shader);
 GL.shaders[id] = null;
};

var _glDeleteTextures = (n, textures) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((textures) + (i * 4)) >> 2)];
  var texture = GL.textures[id];
  if (!texture) continue;
  GLctx.deleteTexture(texture);
  texture.name = 0;
  GL.textures[id] = null;
 }
};

var _glDeleteVertexArrays = (n, vaos) => {
 for (var i = 0; i < n; i++) {
  var id = GROWABLE_HEAP_I32()[(((vaos) + (i * 4)) >> 2)];
  GLctx.deleteVertexArray(GL.vaos[id]);
  GL.vaos[id] = null;
 }
};

var _glDepthFunc = x0 => GLctx.depthFunc(x0);

var _glDepthMask = flag => {
 GLctx.depthMask(!!flag);
};

var _glDetachShader = (program, shader) => {
 GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
};

var _glDisable = x0 => GLctx.disable(x0);

var _glDrawElements = (mode, count, type, indices) => {
 GLctx.drawElements(mode, count, type, indices);
};

var _glEnable = x0 => GLctx.enable(x0);

var _glEnableVertexAttribArray = index => {
 GLctx.enableVertexAttribArray(index);
};

var _glFinish = () => GLctx.finish();

var _glFramebufferRenderbuffer = (target, attachment, renderbuffertarget, renderbuffer) => {
 GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
};

var _glFramebufferTexture2D = (target, attachment, textarget, texture, level) => {
 GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
};

var _glGenBuffers = (n, buffers) => {
 GL.genObject(n, buffers, "createBuffer", GL.buffers);
};

var _glGenFramebuffers = (n, ids) => {
 GL.genObject(n, ids, "createFramebuffer", GL.framebuffers);
};

var _glGenRenderbuffers = (n, renderbuffers) => {
 GL.genObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
};

var _glGenTextures = (n, textures) => {
 GL.genObject(n, textures, "createTexture", GL.textures);
};

var _glGenVertexArrays = (n, arrays) => {
 GL.genObject(n, arrays, "createVertexArray", GL.vaos);
};

var _glGenerateMipmap = x0 => GLctx.generateMipmap(x0);

var writeI53ToI64 = (ptr, num) => {
 GROWABLE_HEAP_U32()[((ptr) >> 2)] = num;
 var lower = GROWABLE_HEAP_U32()[((ptr) >> 2)];
 GROWABLE_HEAP_U32()[(((ptr) + (4)) >> 2)] = (num - lower) / 4294967296;
};

var webglGetExtensions = function $webglGetExtensions() {
 var exts = getEmscriptenSupportedExtensions(GLctx);
 exts = exts.concat(exts.map(e => "GL_" + e));
 return exts;
};

var emscriptenWebGLGet = (name_, p, type) => {
 if (!p) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 var ret = undefined;
 switch (name_) {
 case 36346:
  ret = 1;
  break;

 case 36344:
  if (type != 0 && type != 1) {
   GL.recordError(1280);
  }
  return;

 case 34814:
 case 36345:
  ret = 0;
  break;

 case 34466:
  var formats = GLctx.getParameter(34467);
  /*GL_COMPRESSED_TEXTURE_FORMATS*/ ret = formats ? formats.length : 0;
  break;

 case 33309:
  if (GL.currentContext.version < 2) {
   GL.recordError(1282);
   /* GL_INVALID_OPERATION */ return;
  }
  ret = webglGetExtensions().length;
  break;

 case 33307:
 case 33308:
  if (GL.currentContext.version < 2) {
   GL.recordError(1280);
   return;
  }
  ret = name_ == 33307 ? 3 : 0;
  break;
 }
 if (ret === undefined) {
  var result = GLctx.getParameter(name_);
  switch (typeof result) {
  case "number":
   ret = result;
   break;

  case "boolean":
   ret = result ? 1 : 0;
   break;

  case "string":
   GL.recordError(1280);
   return;

  case "object":
   if (result === null) {
    switch (name_) {
    case 34964:
    case 35725:
    case 34965:
    case 36006:
    case 36007:
    case 32873:
    case 34229:
    case 36662:
    case 36663:
    case 35053:
    case 35055:
    case 36010:
    case 35097:
    case 35869:
    case 32874:
    case 36389:
    case 35983:
    case 35368:
    case 34068:
     {
      ret = 0;
      break;
     }

    default:
     {
      GL.recordError(1280);
      return;
     }
    }
   } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
    for (var i = 0; i < result.length; ++i) {
     switch (type) {
     case 0:
      GROWABLE_HEAP_I32()[(((p) + (i * 4)) >> 2)] = result[i];
      break;

     case 2:
      GROWABLE_HEAP_F32()[(((p) + (i * 4)) >> 2)] = result[i];
      break;

     case 4:
      GROWABLE_HEAP_I8()[(p) + (i)] = result[i] ? 1 : 0;
      break;
     }
    }
    return;
   } else {
    try {
     ret = result.name | 0;
    } catch (e) {
     GL.recordError(1280);
     err(`GL_INVALID_ENUM in glGet${type}v: Unknown object returned from WebGL getParameter(${name_})! (error: ${e})`);
     return;
    }
   }
   break;

  default:
   GL.recordError(1280);
   err(`GL_INVALID_ENUM in glGet${type}v: Native code calling glGet${type}v(${name_}) and it returns ${result} of type ${typeof (result)}!`);
   return;
  }
 }
 switch (type) {
 case 1:
  writeI53ToI64(p, ret);
  break;

 case 0:
  GROWABLE_HEAP_I32()[((p) >> 2)] = ret;
  break;

 case 2:
  GROWABLE_HEAP_F32()[((p) >> 2)] = ret;
  break;

 case 4:
  GROWABLE_HEAP_I8()[p] = ret ? 1 : 0;
  break;
 }
};

var _glGetIntegerv = (name_, p) => emscriptenWebGLGet(name_, p, 0);

var _glGetProgramInfoLog = (program, maxLength, length, infoLog) => {
 var log = GLctx.getProgramInfoLog(GL.programs[program]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) GROWABLE_HEAP_I32()[((length) >> 2)] = numBytesWrittenExclNull;
};

var _glGetProgramiv = (program, pname, p) => {
 if (!p) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 if (program >= GL.counter) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 program = GL.programs[program];
 if (pname == 35716) {
  var log = GLctx.getProgramInfoLog(program);
  if (log === null) log = "(unknown error)";
  GROWABLE_HEAP_I32()[((p) >> 2)] = log.length + 1;
 } else if (pname == 35719) /* GL_ACTIVE_UNIFORM_MAX_LENGTH */ {
  if (!program.maxUniformLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35718); /*GL_ACTIVE_UNIFORMS*/ ++i) {
    program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1);
   }
  }
  GROWABLE_HEAP_I32()[((p) >> 2)] = program.maxUniformLength;
 } else if (pname == 35722) /* GL_ACTIVE_ATTRIBUTE_MAX_LENGTH */ {
  if (!program.maxAttributeLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35721); /*GL_ACTIVE_ATTRIBUTES*/ ++i) {
    program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1);
   }
  }
  GROWABLE_HEAP_I32()[((p) >> 2)] = program.maxAttributeLength;
 } else if (pname == 35381) /* GL_ACTIVE_UNIFORM_BLOCK_MAX_NAME_LENGTH */ {
  if (!program.maxUniformBlockNameLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35382); /*GL_ACTIVE_UNIFORM_BLOCKS*/ ++i) {
    program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1);
   }
  }
  GROWABLE_HEAP_I32()[((p) >> 2)] = program.maxUniformBlockNameLength;
 } else {
  GROWABLE_HEAP_I32()[((p) >> 2)] = GLctx.getProgramParameter(program, pname);
 }
};

var _glGetShaderInfoLog = (shader, maxLength, length, infoLog) => {
 var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) GROWABLE_HEAP_I32()[((length) >> 2)] = numBytesWrittenExclNull;
};

var _glGetShaderiv = (shader, pname, p) => {
 if (!p) {
  GL.recordError(1281);
  /* GL_INVALID_VALUE */ return;
 }
 if (pname == 35716) {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  var logLength = log ? log.length + 1 : 0;
  GROWABLE_HEAP_I32()[((p) >> 2)] = logLength;
 } else if (pname == 35720) {
  var source = GLctx.getShaderSource(GL.shaders[shader]);
  var sourceLength = source ? source.length + 1 : 0;
  GROWABLE_HEAP_I32()[((p) >> 2)] = sourceLength;
 } else {
  GROWABLE_HEAP_I32()[((p) >> 2)] = GLctx.getShaderParameter(GL.shaders[shader], pname);
 }
};

var stringToNewUTF8 = str => {
 var size = lengthBytesUTF8(str) + 1;
 var ret = _malloc(size);
 if (ret) stringToUTF8(str, ret, size);
 return ret;
};

var _glGetString = name_ => {
 var ret = GL.stringCache[name_];
 if (!ret) {
  switch (name_) {
  case 7939:
   /* GL_EXTENSIONS */ ret = stringToNewUTF8(webglGetExtensions().join(" "));
   break;

  case 7936:
  /* GL_VENDOR */ case 7937:
  /* GL_RENDERER */ case 37445:
  /* UNMASKED_VENDOR_WEBGL */ case 37446:
   /* UNMASKED_RENDERER_WEBGL */ var s = GLctx.getParameter(name_);
   if (!s) {
    GL.recordError(1280);
   }
   ret = s ? stringToNewUTF8(s) : 0;
   break;

  case 7938:
   /* GL_VERSION */ var glVersion = GLctx.getParameter(7938);
   if (true) glVersion = `OpenGL ES 3.0 (${glVersion})`; else {
    glVersion = `OpenGL ES 2.0 (${glVersion})`;
   }
   ret = stringToNewUTF8(glVersion);
   break;

  case 35724:
   /* GL_SHADING_LANGUAGE_VERSION */ var glslVersion = GLctx.getParameter(35724);
   var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
   var ver_num = glslVersion.match(ver_re);
   if (ver_num !== null) {
    if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
    glslVersion = `OpenGL ES GLSL ES ${ver_num[1]} (${glslVersion})`;
   }
   ret = stringToNewUTF8(glslVersion);
   break;

  default:
   GL.recordError(1280);
  }
  GL.stringCache[name_] = ret;
 }
 return ret;
};

var _glGetStringi = (name, index) => {
 if (GL.currentContext.version < 2) {
  GL.recordError(1282);
  return 0;
 }
 var stringiCache = GL.stringiCache[name];
 if (stringiCache) {
  if (index < 0 || index >= stringiCache.length) {
   GL.recordError(1281);
   /*GL_INVALID_VALUE*/ return 0;
  }
  return stringiCache[index];
 }
 switch (name) {
 case 7939:
  /* GL_EXTENSIONS */ var exts = webglGetExtensions().map(stringToNewUTF8);
  stringiCache = GL.stringiCache[name] = exts;
  if (index < 0 || index >= stringiCache.length) {
   GL.recordError(1281);
   /*GL_INVALID_VALUE*/ return 0;
  }
  return stringiCache[index];

 default:
  GL.recordError(1280);
  /*GL_INVALID_ENUM*/ return 0;
 }
};

var _glGetUniformBlockIndex = (program, uniformBlockName) => GLctx.getUniformBlockIndex(GL.programs[program], UTF8ToString(uniformBlockName));

/** @noinline */ var webglGetLeftBracePos = name => name.slice(-1) == "]" && name.lastIndexOf("[");

var webglPrepareUniformLocationsBeforeFirstUse = program => {
 var uniformLocsById = program.uniformLocsById,  uniformSizeAndIdsByName = program.uniformSizeAndIdsByName,  i, j;
 if (!uniformLocsById) {
  program.uniformLocsById = uniformLocsById = {};
  program.uniformArrayNamesById = {};
  for (i = 0; i < GLctx.getProgramParameter(program, 35718); /*GL_ACTIVE_UNIFORMS*/ ++i) {
   var u = GLctx.getActiveUniform(program, i);
   var nm = u.name;
   var sz = u.size;
   var lb = webglGetLeftBracePos(nm);
   var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
   var id = program.uniformIdCounter;
   program.uniformIdCounter += sz;
   uniformSizeAndIdsByName[arrayName] = [ sz, id ];
   for (j = 0; j < sz; ++j) {
    uniformLocsById[id] = j;
    program.uniformArrayNamesById[id++] = arrayName;
   }
  }
 }
};

var _glGetUniformLocation = (program, name) => {
 name = UTF8ToString(name);
 if (program = GL.programs[program]) {
  webglPrepareUniformLocationsBeforeFirstUse(program);
  var uniformLocsById = program.uniformLocsById;
  var arrayIndex = 0;
  var uniformBaseName = name;
  var leftBrace = webglGetLeftBracePos(name);
  if (leftBrace > 0) {
   arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
   uniformBaseName = name.slice(0, leftBrace);
  }
  var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
  if (sizeAndId && arrayIndex < sizeAndId[0]) {
   arrayIndex += sizeAndId[1];
   if ((uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name))) {
    return arrayIndex;
   }
  }
 } else {
  GL.recordError(1281);
 }
 /* GL_INVALID_VALUE */ return -1;
};

var _glHint = (x0, x1) => GLctx.hint(x0, x1);

var tempFixedLengthArray = [];

var _glInvalidateFramebuffer = (target, numAttachments, attachments) => {
 var list = tempFixedLengthArray[numAttachments];
 for (var i = 0; i < numAttachments; i++) {
  list[i] = GROWABLE_HEAP_I32()[(((attachments) + (i * 4)) >> 2)];
 }
 GLctx.invalidateFramebuffer(target, list);
};

var _glLinkProgram = program => {
 program = GL.programs[program];
 GLctx.linkProgram(program);
 program.uniformLocsById = 0;
 program.uniformSizeAndIdsByName = {};
};

var _glPixelStorei = (pname, param) => {
 if (pname == 3317) /* GL_UNPACK_ALIGNMENT */ {
  GL.unpackAlignment = param;
 }
 GLctx.pixelStorei(pname, param);
};

var computeUnpackAlignedImageSize = (width, height, sizePerPixel, alignment) => {
 function roundedToNextMultipleOf(x, y) {
  return (x + y - 1) & -y;
 }
 var plainRowSize = width * sizePerPixel;
 var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
 return height * alignedRowSize;
};

var colorChannelsInGlTextureFormat = format => {
 var colorChannels = {
  5: 3,
  6: 4,
  8: 2,
  29502: 3,
  29504: 4,
  26917: 2,
  26918: 2,
  29846: 3,
  29847: 4
 };
 return colorChannels[format - 6402] || 1;
};

var heapObjectForWebGLType = type => {
 type -= 5120;
 if (type == 0) return GROWABLE_HEAP_I8();
 if (type == 1) return GROWABLE_HEAP_U8();
 if (type == 2) return GROWABLE_HEAP_I16();
 if (type == 4) return GROWABLE_HEAP_I32();
 if (type == 6) return GROWABLE_HEAP_F32();
 if (type == 5 || type == 28922 || type == 28520 || type == 30779 || type == 30782) return GROWABLE_HEAP_U32();
 return GROWABLE_HEAP_U16();
};

var toTypedArrayIndex = (pointer, heap) => pointer >>> (31 - Math.clz32(heap.BYTES_PER_ELEMENT));

var emscriptenWebGLGetTexPixelData = (type, format, width, height, pixels, internalFormat) => {
 var heap = heapObjectForWebGLType(type);
 var sizePerPixel = colorChannelsInGlTextureFormat(format) * heap.BYTES_PER_ELEMENT;
 var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel, GL.unpackAlignment);
 return heap.subarray(toTypedArrayIndex(pixels, heap), toTypedArrayIndex(pixels + bytes, heap));
};

var _glReadPixels = (x, y, width, height, format, type, pixels) => {
 if (true) {
  if (GLctx.currentPixelPackBufferBinding) {
   GLctx.readPixels(x, y, width, height, format, type, pixels);
   return;
  }
  var heap = heapObjectForWebGLType(type);
  var target = toTypedArrayIndex(pixels, heap);
  GLctx.readPixels(x, y, width, height, format, type, heap, target);
  return;
 }
 var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
 if (!pixelData) {
  GL.recordError(1280);
  /*GL_INVALID_ENUM*/ return;
 }
 GLctx.readPixels(x, y, width, height, format, type, pixelData);
};

var _glRenderbufferStorage = (x0, x1, x2, x3) => GLctx.renderbufferStorage(x0, x1, x2, x3);

var _glScissor = (x0, x1, x2, x3) => GLctx.scissor(x0, x1, x2, x3);

var _glShaderSource = (shader, count, string, length) => {
 var source = GL.getSource(shader, count, string, length);
 GLctx.shaderSource(GL.shaders[shader], source);
};

var _glStencilFunc = (x0, x1, x2) => GLctx.stencilFunc(x0, x1, x2);

var _glStencilOp = (x0, x1, x2) => GLctx.stencilOp(x0, x1, x2);

var _glTexImage2D = (target, level, internalFormat, width, height, border, format, type, pixels) => {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding) {
   GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
   return;
  }
  if (pixels) {
   var heap = heapObjectForWebGLType(type);
   var index = toTypedArrayIndex(pixels, heap);
   GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, heap, index);
   return;
  }
 }
 var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null;
 GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
};

var _glTexParameteri = (x0, x1, x2) => GLctx.texParameteri(x0, x1, x2);

var _glTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, type, pixels) => {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding) {
   GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
   return;
  }
  if (pixels) {
   var heap = heapObjectForWebGLType(type);
   GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, heap, toTypedArrayIndex(pixels, heap));
   return;
  }
 }
 var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0) : null;
 GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
};

var webglGetUniformLocation = location => {
 var p = GLctx.currentProgram;
 if (p) {
  var webglLoc = p.uniformLocsById[location];
  if (typeof webglLoc == "number") {
   p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? `[${webglLoc}]` : ""));
  }
  return webglLoc;
 } else {
  GL.recordError(1282);
 }
};

var _glUniform1f = (location, v0) => {
 GLctx.uniform1f(webglGetUniformLocation(location), v0);
};

var _glUniform1i = (location, v0) => {
 GLctx.uniform1i(webglGetUniformLocation(location), v0);
};

var _glUniform2fv = (location, count, value) => {
 count && GLctx.uniform2fv(webglGetUniformLocation(location), GROWABLE_HEAP_F32(), ((value) >> 2), count * 2);
};

var _glUniform3fv = (location, count, value) => {
 count && GLctx.uniform3fv(webglGetUniformLocation(location), GROWABLE_HEAP_F32(), ((value) >> 2), count * 3);
};

var _glUniform4fv = (location, count, value) => {
 count && GLctx.uniform4fv(webglGetUniformLocation(location), GROWABLE_HEAP_F32(), ((value) >> 2), count * 4);
};

var _glUniformBlockBinding = (program, uniformBlockIndex, uniformBlockBinding) => {
 program = GL.programs[program];
 GLctx.uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding);
};

var _glUniformMatrix2fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), ((value) >> 2), count * 4);
};

var _glUniformMatrix3fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), ((value) >> 2), count * 9);
};

var _glUniformMatrix4fv = (location, count, transpose, value) => {
 count && GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, GROWABLE_HEAP_F32(), ((value) >> 2), count * 16);
};

var _glUseProgram = program => {
 program = GL.programs[program];
 GLctx.useProgram(program);
 GLctx.currentProgram = program;
};

var _glVertexAttribIPointer = (index, size, type, stride, ptr) => {
 GLctx.vertexAttribIPointer(index, size, type, stride, ptr);
};

var _glVertexAttribPointer = (index, size, type, normalized, stride, ptr) => {
 GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
};

var _glViewport = (x0, x1, x2, x3) => GLctx.viewport(x0, x1, x2, x3);

var DOTNET = {
 setup: function setup(emscriptenBuildOptions) {
  const modulePThread = PThread;
  const dotnet_replacements = {
   fetch: globalThis.fetch,
   ENVIRONMENT_IS_WORKER: ENVIRONMENT_IS_WORKER,
   require: require,
   modulePThread: modulePThread,
   scriptDirectory: scriptDirectory
  };
  ENVIRONMENT_IS_WORKER = dotnet_replacements.ENVIRONMENT_IS_WORKER;
  Module.__dotnet_runtime.initializeReplacements(dotnet_replacements);
  noExitRuntime = dotnet_replacements.noExitRuntime;
  fetch = dotnet_replacements.fetch;
  require = dotnet_replacements.require;
  _scriptDir = __dirname = scriptDirectory = dotnet_replacements.scriptDirectory;
  Module.__dotnet_runtime.passEmscriptenInternals({
   isPThread: ENVIRONMENT_IS_PTHREAD,
   quit_: quit_,
   ExitStatus: ExitStatus,
   updateMemoryViews: updateMemoryViews,
   getMemory: () => wasmMemory,
   getWasmIndirectFunctionTable: () => wasmTable
  }, emscriptenBuildOptions);
  if (ENVIRONMENT_IS_PTHREAD) {
   Module.config = {};
   Module.__dotnet_runtime.configureWorkerStartup(Module);
  } else {
   Module.__dotnet_runtime.configureEmscriptenStartup(Module);
  }
 }
};

function _mono_interp_tier_prepare_jiterpreter() {
 return {
  runtime_idx: 7
 };
}

function _mono_wasm_browser_entropy() {
 return {
  runtime_idx: 18
 };
}

function _mono_wasm_cancel_promise() {
 return {
  runtime_idx: 26
 };
}

function _mono_wasm_console_clear() {
 return {
  runtime_idx: 20
 };
}

function _mono_wasm_dump_threads() {
 return {
  runtime_idx: 40
 };
}

function _mono_wasm_free_method_data() {
 return {
  runtime_idx: 13
 };
}

function _mono_wasm_get_locale_info() {
 return {
  runtime_idx: 27
 };
}

function _mono_wasm_install_js_worker_interop() {
 return {
  runtime_idx: 41
 };
}

function _mono_wasm_invoke_js_function() {
 return {
  runtime_idx: 23
 };
}

function _mono_wasm_invoke_jsimport_MT() {
 return {
  runtime_idx: 43
 };
}

function _mono_wasm_process_current_pid() {
 return {
  runtime_idx: 19
 };
}

function _mono_wasm_pthread_on_pthread_attached() {
 return {
  runtime_idx: 34
 };
}

function _mono_wasm_pthread_on_pthread_registered() {
 return {
  runtime_idx: 33
 };
}

function _mono_wasm_pthread_on_pthread_unregistered() {
 return {
  runtime_idx: 35
 };
}

function _mono_wasm_pthread_set_name() {
 return {
  runtime_idx: 36
 };
}

function _mono_wasm_release_cs_owned_object() {
 return {
  runtime_idx: 21
 };
}

function _mono_wasm_resolve_or_reject_promise() {
 return {
  runtime_idx: 25
 };
}

function _mono_wasm_schedule_synchronization_context() {
 return {
  runtime_idx: 39
 };
}

function _mono_wasm_set_entrypoint_breakpoint() {
 return {
  runtime_idx: 17
 };
}

function _mono_wasm_start_deputy_thread_async() {
 return {
  runtime_idx: 37
 };
}

function _mono_wasm_start_io_thread_async() {
 return {
  runtime_idx: 38
 };
}

function _mono_wasm_trace_logger() {
 return {
  runtime_idx: 16
 };
}

function _mono_wasm_uninstall_js_worker_interop() {
 return {
  runtime_idx: 42
 };
}

function _mono_wasm_warn_about_blocking_wait() {
 return {
  runtime_idx: 44
 };
}

var osuWeb = {
 EV_MOUSE_MOVE: 1,
 EV_MOUSE_RELATIVE: 2,
 EV_MOUSE_DOWN: 3,
 EV_MOUSE_UP: 4,
 EV_WHEEL: 5,
 EV_KEY_DOWN: 6,
 EV_KEY_UP: 7,
 EV_TEXT: 8,
 EV_RESIZE: 9,
 EV_FOCUS: 10,
 EV_MOUSE_ENTER: 11,
 EV_TOUCH_DOWN: 12,
 EV_TOUCH_MOVE: 13,
 EV_TOUCH_UP: 14,
 EV_VISIBILITY: 15,
 EV_DROP: 16,
 EV_FULLSCREEN: 17,
 EV_POINTER_LOCK: 18,
 EV_CLOSE: 19,
 keyCodes: [ "Unknown", "Escape", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13", "F14", "F15", "F16", "F17", "F18", "F19", "F20", "F21", "F22", "F23", "F24", "Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace", "Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash", "CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter", "ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight", "ControlLeft", "MetaLeft", "AltLeft", "Space", "AltRight", "MetaRight", "ContextMenu", "ControlRight", "PrintScreen", "ScrollLock", "Pause", "Insert", "Home", "PageUp", "Delete", "End", "PageDown", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "NumLock", "NumpadDivide", "NumpadMultiply", "NumpadSubtract", "NumpadAdd", "NumpadEnter", "NumpadDecimal", "Numpad0", "Numpad1", "Numpad2", "Numpad3", "Numpad4", "Numpad5", "Numpad6", "Numpad7", "Numpad8", "Numpad9", "IntlBackslash", "NumpadEqual", "Sleep", "AudioVolumeMute", "AudioVolumeDown", "AudioVolumeUp", "MediaTrackNext", "MediaTrackPrevious", "MediaStop", "MediaPlayPause" ],
 init() {
  if (typeof document !== "undefined") return;
  const report = text => {
   try {
    (Module["printErr"] || console.error)(text);
   } catch {
    console.error(text);
   }
  };
  const wrapEntry = invoke => function(ptr, arg) {
   try {
    return invoke(ptr, arg);
   } catch (ex) {
    if (ex !== "unwind") report("[osu!web] thread crashed: " + (ex && ex.stack ? ex.stack : ex));
    throw ex;
   }
  };
  let entry = Module["invokeEntryPoint"] ? wrapEntry(Module["invokeEntryPoint"]) : undefined;
  Object.defineProperty(Module, "invokeEntryPoint", {
   configurable: true,
   get: () => entry,
   set: v => {
    entry = v ? wrapEntry(v) : v;
   }
  });
  self.addEventListener("error", e => {
   const err = e.error;
   report("[osu!web] worker crashed: " + (err && err.stack ? err.stack : e.message));
  });
  self.addEventListener("unhandledrejection", e => {
   const r = e.reason;
   report("[osu!web] worker unhandled rejection: " + (r && r.stack ? r.stack : r));
  });
  globalThis.osuYield = ms => new Promise(r => setTimeout(r, ms));
  self.addEventListener("message", e => {
   if (e.data && e.data.osuCanvas) {
    osuWeb.canvas = e.data.osuCanvas;
   }
  });
 },
 push(type, a, b, c, x, y, z, w) {
  _osu_push_event(type, a | 0, b | 0, c | 0, x || 0, y || 0, z || 0, w || 0);
 },
 uiCanvas: null,
 uiInitialised: false,
 touchIds: null,
 keyIndex: null,
 heldModifierKeyEvents: []
};

var osuAudio = {
 ctx: null,
 buffers: null,
 voices: null,
 pending: null,
 analysed: null,
 init() {
  if (osuAudio.buffers) return;
  osuAudio.buffers = new Map;
  osuAudio.voices = new Map;
  osuAudio.pending = new Map;
  osuAudio.analysed = new Set;
 },
 context() {
  osuAudio.init();
  if (osuAudio.ctx) return osuAudio.ctx;
  const ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)({
   latencyHint: "interactive"
  });
  osuAudio.ctx = ctx;
  const update = () => {
   const running = ctx.state === "running" ? 1 : 0;
   _osu_audio_set_context_running(running);
   if (running) osuAudio.resumePending();
  };
  ctx.onstatechange = update;
  update();
  const unlock = () => {
   if (ctx.state !== "running") ctx.resume().catch(() => {});
  };
  for (const ev of [ "pointerdown", "keydown", "touchstart" ]) window.addEventListener(ev, unlock, {
   capture: true
  });
  const analyse = () => {
   for (const id of osuAudio.analysed) {
    const voice = osuAudio.voices.get(id);
    if (!voice || !voice.analyser) continue;
    const slot = _osu_audio_slot_ptr(id);
    const bins = voice.freq || (voice.freq = new Float32Array(voice.analyser.frequencyBinCount));
    voice.analyser.getFloatFrequencyData(bins);
    let peak = 0;
    for (let i = 0; i < 256; i++) {
     const v = i < bins.length ? Math.max(0, Math.min(1, Math.pow(10, bins[i] / 20) * 4)) : 0;
     GROWABLE_HEAP_F32()[(slot + 56 >> 2) + i] = v;
     if (v > peak) peak = v;
    }
    GROWABLE_HEAP_F32()[slot + 48 >> 2] = peak;
    GROWABLE_HEAP_F32()[slot + 52 >> 2] = peak;
   }
   requestAnimationFrame(analyse);
  };
  requestAnimationFrame(analyse);
  return ctx;
 },
 now: () => performance.timeOrigin + performance.now(),
 stopVoice(id) {
  const voice = osuAudio.voices.get(id);
  if (!voice) return;
  osuAudio.voices.delete(id);
  try {
   voice.source.onended = null;
   voice.source.stop();
  } catch {}
  try {
   voice.source.disconnect();
   voice.gain.disconnect();
   voice.pan.disconnect();
  } catch {}
 },
 start(id, p) {
  const ctx = osuAudio.context();
  const buffer = osuAudio.buffers.get(p.buffer);
  const slot = _osu_audio_slot_ptr(id);
  osuAudio.stopVoice(id);
  if (!buffer) return;
  if (ctx.state !== "running") {
   if (p.resume) osuAudio.pending.set(id, p);
   return;
  }
  let offset = p.offset;
  if (p.resume && GROWABLE_HEAP_I32()[slot + 44 >> 2] === p.generation) {
   const lateness = osuAudio.now() - GROWABLE_HEAP_F64()[slot + 8 >> 3];
   if (lateness > 0 && lateness < 5e3) offset += lateness * p.rate;
  }
  const lengthMs = buffer.duration * 1e3;
  if (p.looping && lengthMs > 0 && offset >= lengthMs) {
   const loopStart = Math.min(p.loopStart, lengthMs);
   offset = loopStart + (offset - loopStart) % Math.max(1, lengthMs - loopStart);
  }
  if (offset >= lengthMs && !p.looping) {
   GROWABLE_HEAP_I32()[slot + 40 >> 2] = 1;
   return;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = Math.max(0, p.rate);
  source.loop = !!p.looping;
  if (p.looping) {
   source.loopStart = p.loopStart / 1e3;
   source.loopEnd = buffer.duration;
  }
  const gain = ctx.createGain();
  gain.gain.value = p.volume;
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
  if (pan.pan) pan.pan.value = Math.max(-1, Math.min(1, p.balance));
  source.connect(gain).connect(pan).connect(ctx.destination);
  const voice = {
   source: source,
   gain: gain,
   pan: pan,
   analyser: null,
   buffer: p.buffer
  };
  osuAudio.voices.set(id, voice);
  if (osuAudio.analysed.has(id)) osuAudio.attachAnalyser(id);
  const generation = p.generation;
  source.onended = () => {
   if (osuAudio.voices.get(id) !== voice) return;
   osuAudio.voices.delete(id);
   if (GROWABLE_HEAP_I32()[slot + 44 >> 2] === generation) GROWABLE_HEAP_I32()[slot + 40 >> 2] = 1;
  };
  source.start(0, Math.max(0, offset / 1e3));
  if (p.resume) {
   GROWABLE_HEAP_F64()[slot >> 3] = offset;
   GROWABLE_HEAP_F64()[slot + 8 >> 3] = osuAudio.now();
  }
 },
 resumePending() {
  const pending = [ ...osuAudio.pending ];
  osuAudio.pending.clear();
  for (const [id, p] of pending) {
   const slot = _osu_audio_slot_ptr(id);
   if (!GROWABLE_HEAP_I32()[slot + 32 >> 2] || GROWABLE_HEAP_I32()[slot + 44 >> 2] !== p.generation) continue;
   p.offset = GROWABLE_HEAP_F64()[slot >> 3];
   GROWABLE_HEAP_F64()[slot + 8 >> 3] = osuAudio.now();
   osuAudio.start(id, p);
  }
 },
 attachAnalyser(id) {
  const voice = osuAudio.voices.get(id);
  if (!voice || voice.analyser) return;
  const analyser = osuAudio.ctx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = .5;
  voice.pan.connect(analyser);
  voice.analyser = analyser;
 }
};

function _osu_js_audio_free(id) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(47, 0, 0, id);
 osuAudio.init();
 osuAudio.stopVoice(id);
 osuAudio.pending.delete(id);
 osuAudio.analysed.delete(id);
 osuAudio.buffers.delete(id);
}

function _osu_js_audio_load(id, data, length) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(48, 0, 1, id, data, length);
 const bytes = GROWABLE_HEAP_U8().slice(data, data + length);
 const slot = _osu_audio_slot_ptr(id);
 GROWABLE_HEAP_I32()[slot + 36 >> 2] = 0;
 let ctx;
 try {
  ctx = osuAudio.context();
 } catch (e) {
  console.error("[osu!web] audio unavailable", e);
  GROWABLE_HEAP_I32()[slot + 36 >> 2] = -1;
  return;
 }
 ctx.decodeAudioData(bytes.buffer).then(buffer => {
  osuAudio.buffers.set(id, buffer);
  GROWABLE_HEAP_F64()[slot + 24 >> 3] = buffer.duration * 1e3;
  GROWABLE_HEAP_I32()[slot + 36 >> 2] = 1;
 }, err => {
  console.warn("[osu!web] audio decode failed", err);
  GROWABLE_HEAP_I32()[slot + 36 >> 2] = -1;
 });
}

function _osu_js_audio_play(id, buffer, offset, rate, volume, balance, looping, loopStart, generation, resume) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(49, 0, 0, id, buffer, offset, rate, volume, balance, looping, loopStart, generation, resume);
 osuAudio.init();
 osuAudio.start(id, {
  buffer: buffer,
  offset: offset,
  rate: rate,
  volume: volume,
  balance: balance,
  looping: looping,
  loopStart: loopStart,
  generation: generation,
  resume: resume
 });
}

function _osu_js_audio_set_analyse(id, enabled) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(50, 0, 0, id, enabled);
 osuAudio.init();
 if (enabled) {
  osuAudio.analysed.add(id);
  osuAudio.attachAnalyser(id);
 } else osuAudio.analysed.delete(id);
}

function _osu_js_audio_set_params(id, rate, volume, balance, looping, loopStart) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(51, 0, 0, id, rate, volume, balance, looping, loopStart);
 osuAudio.init();
 const voice = osuAudio.voices.get(id);
 const pending = osuAudio.pending.get(id);
 if (pending) Object.assign(pending, {
  rate: rate,
  volume: volume,
  balance: balance,
  looping: looping,
  loopStart: loopStart
 });
 if (!voice) return;
 const t = osuAudio.ctx.currentTime;
 voice.source.playbackRate.setValueAtTime(Math.max(0, rate), t);
 voice.gain.gain.setValueAtTime(volume, t);
 if (voice.pan.pan) voice.pan.pan.setValueAtTime(Math.max(-1, Math.min(1, balance)), t);
 voice.source.loop = !!looping;
 if (looping) voice.source.loopStart = loopStart / 1e3;
}

function _osu_js_audio_stop(id) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(52, 0, 0, id);
 osuAudio.init();
 osuAudio.pending.delete(id);
 osuAudio.stopVoice(id);
}

var _osu_js_create_gl = antialias => {
 const attrs = {
  majorVersion: 2,
  minorVersion: 0,
  alpha: false,
  depth: true,
  stencil: true,
  antialias: !!antialias,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
  powerPreference: "high-performance",
  desynchronized: true,
  failIfMajorPerformanceCaveat: false,
  enableExtensionsByDefault: true
 };
 const ctx = osuWeb.canvas.getContext("webgl2", attrs);
 if (!ctx) return 0;
 const handle = GL.registerContext(ctx, attrs);
 GL.makeContextCurrent(handle);
 osuWeb.gl = ctx;
 return handle;
};

var _osu_js_has_canvas = () => osuWeb.canvas ? 1 : 0;

var _osu_js_log_native_stack = message => {
 const limit = Error.stackTraceLimit;
 Error.stackTraceLimit = 80;
 const stack = (new Error).stack.split("\n").filter(l => l.includes("wasm-function")).map(l => l.replace(/ \(http.*$/, "")).join("\n");
 Error.stackTraceLimit = limit;
 console.warn("[osu!web] " + UTF8ToString(message) + "\n" + stack);
};

var _osu_js_now = () => performance.timeOrigin + performance.now();

function _osu_js_request_canvas(thread) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(53, 0, 0, thread);
 const worker = PThread.pthreads[thread];
 const offscreen = globalThis.osuOffscreenCanvas || document.getElementById("osu-canvas").transferControlToOffscreen();
 globalThis.osuOffscreenCanvas = null;
 worker.postMessage({
  osuCanvas: offscreen
 }, [ offscreen ]);
}

var _osu_js_set_canvas_size = (width, height) => {
 if (osuWeb.canvas.width !== width) osuWeb.canvas.width = width;
 if (osuWeb.canvas.height !== height) osuWeb.canvas.height = height;
};

var _osu_js_start_frame_loop = callback => {
 const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame.bind(self) : (f => setTimeout(() => f(performance.now()), 1e3 / 60));
 const tick = time => {
  try {
   getWasmTableEntry(callback)(time);
  } catch (ex) {
   const text = "[osu!web] frame crashed: " + (ex && ex.stack ? ex.stack : ex);
   try {
    (Module["printErr"] || console.error)(text);
   } catch {
    console.error(text);
   }
   throw ex;
  } finally {
   raf(tick);
  }
 };
 raf(tick);
};

function _osu_js_ui_fatal(text) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(54, 0, 1, text);
 const s = UTF8ToString(text);
 if (globalThis.osuShowFatal) globalThis.osuShowFatal(s); else console.error(s);
}

var _osu_js_ui_init = function() {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(55, 0, 0);
 if (osuWeb.uiInitialised) return;
 osuWeb.uiInitialised = true;
 const canvas = document.getElementById("osu-canvas");
 osuWeb.uiCanvas = canvas;
 osuWeb.keyIndex = new Map(osuWeb.keyCodes.map((c, i) => [ c, i ]));
 osuWeb.touchIds = new Map;  const dprParam = parseFloat(new URLSearchParams(location.search).get("dpr") || globalThis.__osuDpr);
 const maxScale = () => Math.min(window.devicePixelRatio || 1, 1.5);
 let renderScale = maxScale();
 const dpr = () => dprParam > 0 ? Math.min(dprParam, maxScale() * 2) : Math.max(1, Math.min(renderScale, maxScale()));
 const push = osuWeb.push;
 const sendSize = () => {
  const r = canvas.getBoundingClientRect();
  push(osuWeb.EV_RESIZE, Math.max(1, Math.round(r.width * dpr())), Math.max(1, Math.round(r.height * dpr())), 0, 1);
 };
 new ResizeObserver(sendSize).observe(canvas);
 window.addEventListener("resize", sendSize);
 sendSize();
 const pos = e => {
  const r = canvas.getBoundingClientRect();
  return [ (e.clientX - r.left) * dpr(), (e.clientY - r.top) * dpr() ];
 };
 const touchId = e => {
  if (!osuWeb.touchIds.has(e.pointerId)) {
   let id = 0;
   const used = new Set(osuWeb.touchIds.values());
   while (used.has(id)) id++;
   osuWeb.touchIds.set(e.pointerId, id);
  }
  return osuWeb.touchIds.get(e.pointerId);
 };
 canvas.addEventListener("pointermove", e => {
  if (e.pointerType === "touch") {
   const [x, y] = pos(e);
   push(osuWeb.EV_TOUCH_MOVE, touchId(e), 0, 0, x, y);
   return;
  }
  if (document.pointerLockElement === canvas) {
   push(osuWeb.EV_MOUSE_RELATIVE, 0, 0, 0, e.movementX * dpr(), e.movementY * dpr());
   return;
  }
  const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [ e ];
  for (const ce of (events.length ? events : [ e ])) {
   const [x, y] = pos(ce);
   push(osuWeb.EV_MOUSE_MOVE, 0, 0, 0, x, y);
  }
 });
 canvas.addEventListener("pointerdown", e => {
  canvas.focus();
  if (e.pointerType === "touch") {
   const [x, y] = pos(e);
   push(osuWeb.EV_TOUCH_DOWN, touchId(e), 0, 0, x, y);
  } else {
   const [x, y] = pos(e);
   push(osuWeb.EV_MOUSE_MOVE, 0, 0, 0, x, y);
   push(osuWeb.EV_MOUSE_DOWN, e.button);
  }
  canvas.setPointerCapture(e.pointerId);
  e.preventDefault();
 });
 const pointerUp = e => {
  if (e.pointerType === "touch") {
   const [x, y] = pos(e);
   push(osuWeb.EV_TOUCH_UP, touchId(e), 0, 0, x, y);
   osuWeb.touchIds.delete(e.pointerId);
  } else if (e.type === "pointerup") {
   push(osuWeb.EV_MOUSE_UP, e.button);
  }
 };
 canvas.addEventListener("pointerup", pointerUp);
 canvas.addEventListener("pointercancel", pointerUp);
 canvas.addEventListener("pointerenter", () => push(osuWeb.EV_MOUSE_ENTER, 1));
 canvas.addEventListener("pointerleave", () => push(osuWeb.EV_MOUSE_ENTER, 0));
 canvas.addEventListener("contextmenu", e => e.preventDefault());
 canvas.addEventListener("wheel", e => {
  let dx = -e.deltaX, dy = -e.deltaY, precise = 1;
  if (e.deltaMode === 1) {
   precise = 0;
  } else  if (e.deltaMode === 2) {
   dx *= 3;
   dy *= 3;
   precise = 0;
  } else  {
   const notch = Math.abs(e.deltaY) >= 50 && Math.abs(e.deltaY % 100) < .01;
   dx /= 100;
   dy /= 100;
   precise = notch ? 0 : 1;
  }
  push(osuWeb.EV_WHEEL, precise, 0, 0, dx, dy);
  e.preventDefault();
 }, {
  passive: false
 });
 const browserShortcut = e => (e.ctrlKey || e.metaKey) && [ "KeyL", "KeyT", "KeyW", "KeyN", "Tab" ].includes(e.code) && e.shiftKey === false && e.code !== "KeyW";
 const mods = [ [ "ctrlKey", "ControlLeft", "ControlRight" ], [ "shiftKey", "ShiftLeft", "ShiftRight" ], [ "altKey", "AltLeft", "AltRight" ], [ "metaKey", "MetaLeft", "MetaRight" ] ];
 const heldMods = {};
 const syncMods = (e, down) => {
  for (const [flag, left, right] of mods) {
   if (e.code === left || e.code === right) {
    heldMods[flag] = down;
    continue;
   }
   if (!!e[flag] !== !!heldMods[flag]) {
    heldMods[flag] = !!e[flag];
    push(e[flag] ? osuWeb.EV_KEY_DOWN : osuWeb.EV_KEY_UP, osuWeb.keyIndex.get(left) || 0, 0);
   }
  }
 };
 window.addEventListener("keydown", e => {
  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") && e.target.id !== "osu-ime") return;
  const idx = osuWeb.keyIndex.get(e.code) || 0;
  syncMods(e, true);
  push(osuWeb.EV_KEY_DOWN, idx, e.repeat ? 1 : 0);
  if (e.key.length === 1 || (e.key.length === 2 && e.key.codePointAt(0) > 65535)) {
   if (!e.ctrlKey && !e.metaKey) push(osuWeb.EV_TEXT, e.key.codePointAt(0));
  }
  const isPaste = (e.ctrlKey || e.metaKey) && e.code === "KeyV";
  const isCopy = (e.ctrlKey || e.metaKey) && (e.code === "KeyC" || e.code === "KeyX");
  const devtools = e.code === "F12" || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyI");
  if (!isPaste && !isCopy && !devtools && !browserShortcut(e)) e.preventDefault();
 });
 window.addEventListener("keyup", e => {
  const idx = osuWeb.keyIndex.get(e.code) || 0;
  syncMods(e, false);
  push(osuWeb.EV_KEY_UP, idx);
  e.preventDefault();
 });
 window.addEventListener("paste", e => {
  const text = e.clipboardData ? e.clipboardData.getData("text/plain") : "";
  const ptr = stringToNewUTF8(text || "");
  _osu_set_clipboard_cache(ptr);
  _free(ptr);
 });
 window.addEventListener("focus", () => push(osuWeb.EV_FOCUS, 1));
 window.addEventListener("blur", () => {
  push(osuWeb.EV_FOCUS, 0);
  push(osuWeb.EV_KEY_UP, -1);
 });
 document.addEventListener("visibilitychange", () => push(osuWeb.EV_VISIBILITY, document.visibilityState === "visible" ? 1 : 0));
 document.addEventListener("fullscreenchange", () => push(osuWeb.EV_FULLSCREEN, document.fullscreenElement ? 1 : 0));
 document.addEventListener("pointerlockchange", () => push(osuWeb.EV_POINTER_LOCK, document.pointerLockElement === canvas ? 1 : 0));
 window.addEventListener("beforeunload", () => push(osuWeb.EV_CLOSE, 0));
 const writeDropped = async file => {
  const dir = "/tmp/dropped";
  try {
   FS.mkdirTree(dir);
  } catch {}
  const safeName = file.name.replace(/[\/\\]/g, "_");
  let path = `${dir}/${Date.now()}-${safeName}`;
  const data = new Uint8Array(await file.arrayBuffer());
  FS.writeFile(path, data);
  const ptr = stringToNewUTF8(path);
  push(osuWeb.EV_DROP, ptr);
 };
 globalThis.osuImportFiles = async files => {
  for (const f of files) {
   try {
    await writeDropped(f);
   } catch (err) {
    console.error("[osu!web] failed to import dropped file", f.name, err);
   }
  }
 };
 const dropTarget = document.body;
 dropTarget.addEventListener("dragover", e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
  document.body.classList.add("osu-dragging");
 });
 dropTarget.addEventListener("dragleave", e => {
  if (e.target === dropTarget || e.target === canvas) document.body.classList.remove("osu-dragging");
 });
 dropTarget.addEventListener("drop", e => {
  e.preventDefault();
  document.body.classList.remove("osu-dragging");
  if (e.dataTransfer && e.dataTransfer.files.length) globalThis.osuImportFiles(Array.from(e.dataTransfer.files));
 });
 canvas.tabIndex = 0;
 canvas.focus();
 push(osuWeb.EV_FOCUS, document.hasFocus() ? 1 : 0);
};

function _osu_js_ui_open_url(url) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(56, 0, 1, url);
 window.open(UTF8ToString(url), "_blank", "noopener");
}

var _osu_js_ui_set_clipboard = function(text) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(57, 0, 1, text);
 const s = UTF8ToString(text);
 if (navigator.clipboard) navigator.clipboard.writeText(s).catch(() => {});
};

function _osu_js_ui_set_cursor_visible(visible) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(58, 0, 0, visible);
 const c = document.getElementById("osu-canvas");
 if (c) c.style.cursor = visible ? "default" : "none";
}

function _osu_js_ui_set_fullscreen(fullscreen) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(59, 0, 0, fullscreen);
 try {
  if (fullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen({
   navigationUI: "hide"
  }).catch(() => {}); else if (!fullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
 } catch {}
}

function _osu_js_ui_set_pointer_lock(locked) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(60, 0, 0, locked);
 const c = document.getElementById("osu-canvas");
 try {
  if (locked && document.pointerLockElement !== c) {
   const r = c.requestPointerLock({
    unadjustedMovement: true
   });
   if (r && r.catch) r.catch(() => c.requestPointerLock());
  } else if (!locked && document.pointerLockElement) document.exitPointerLock();
 } catch {}
}

function _osu_js_ui_set_title(title) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(61, 0, 1, title);
 document.title = UTF8ToString(title);
}

var arraySum = (array, index) => {
 var sum = 0;
 for (var i = 0; i <= index; sum += array[i++]) {}
 return sum;
};

var MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var addDays = (date, days) => {
 var newDate = new Date(date.getTime());
 while (days > 0) {
  var leap = isLeapYear(newDate.getFullYear());
  var currentMonth = newDate.getMonth();
  var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
  if (days > daysInCurrentMonth - newDate.getDate()) {
   days -= (daysInCurrentMonth - newDate.getDate() + 1);
   newDate.setDate(1);
   if (currentMonth < 11) {
    newDate.setMonth(currentMonth + 1);
   } else {
    newDate.setMonth(0);
    newDate.setFullYear(newDate.getFullYear() + 1);
   }
  } else {
   newDate.setDate(newDate.getDate() + days);
   return newDate;
  }
 }
 return newDate;
};

var writeArrayToMemory = (array, buffer) => {
 GROWABLE_HEAP_I8().set(array, buffer);
};

var _strftime = (s, maxsize, format, tm) => {
 var tm_zone = GROWABLE_HEAP_U32()[(((tm) + (40)) >> 2)];
 var date = {
  tm_sec: GROWABLE_HEAP_I32()[((tm) >> 2)],
  tm_min: GROWABLE_HEAP_I32()[(((tm) + (4)) >> 2)],
  tm_hour: GROWABLE_HEAP_I32()[(((tm) + (8)) >> 2)],
  tm_mday: GROWABLE_HEAP_I32()[(((tm) + (12)) >> 2)],
  tm_mon: GROWABLE_HEAP_I32()[(((tm) + (16)) >> 2)],
  tm_year: GROWABLE_HEAP_I32()[(((tm) + (20)) >> 2)],
  tm_wday: GROWABLE_HEAP_I32()[(((tm) + (24)) >> 2)],
  tm_yday: GROWABLE_HEAP_I32()[(((tm) + (28)) >> 2)],
  tm_isdst: GROWABLE_HEAP_I32()[(((tm) + (32)) >> 2)],
  tm_gmtoff: GROWABLE_HEAP_I32()[(((tm) + (36)) >> 2)],
  tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
 };
 var pattern = UTF8ToString(format);
 var EXPANSION_RULES_1 = {
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m/%d/%y",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%r": "%I:%M:%S %p",
  "%R": "%H:%M",
  "%T": "%H:%M:%S",
  "%x": "%m/%d/%y",
  "%X": "%H:%M:%S",
  "%Ec": "%c",
  "%EC": "%C",
  "%Ex": "%m/%d/%y",
  "%EX": "%H:%M:%S",
  "%Ey": "%y",
  "%EY": "%Y",
  "%Od": "%d",
  "%Oe": "%e",
  "%OH": "%H",
  "%OI": "%I",
  "%Om": "%m",
  "%OM": "%M",
  "%OS": "%S",
  "%Ou": "%u",
  "%OU": "%U",
  "%OV": "%V",
  "%Ow": "%w",
  "%OW": "%W",
  "%Oy": "%y"
 };
 for (var rule in EXPANSION_RULES_1) {
  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
 }
 var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
 function leadingSomething(value, digits, character) {
  var str = typeof value == "number" ? value.toString() : (value || "");
  while (str.length < digits) {
   str = character[0] + str;
  }
  return str;
 }
 function leadingNulls(value, digits) {
  return leadingSomething(value, digits, "0");
 }
 function compareByDay(date1, date2) {
  function sgn(value) {
   return value < 0 ? -1 : (value > 0 ? 1 : 0);
  }
  var compare;
  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
   if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
    compare = sgn(date1.getDate() - date2.getDate());
   }
  }
  return compare;
 }
 function getFirstWeekStartDate(janFourth) {
  switch (janFourth.getDay()) {
  case 0:
   return new Date(janFourth.getFullYear() - 1, 11, 29);

  case 1:
   return janFourth;

  case 2:
   return new Date(janFourth.getFullYear(), 0, 3);

  case 3:
   return new Date(janFourth.getFullYear(), 0, 2);

  case 4:
   return new Date(janFourth.getFullYear(), 0, 1);

  case 5:
   return new Date(janFourth.getFullYear() - 1, 11, 31);

  case 6:
   return new Date(janFourth.getFullYear() - 1, 11, 30);
  }
 }
 function getWeekBasedYear(date) {
  var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
   if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
    return thisDate.getFullYear() + 1;
   }
   return thisDate.getFullYear();
  }
  return thisDate.getFullYear() - 1;
 }
 var EXPANSION_RULES_2 = {
  "%a": date => WEEKDAYS[date.tm_wday].substring(0, 3),
  "%A": date => WEEKDAYS[date.tm_wday],
  "%b": date => MONTHS[date.tm_mon].substring(0, 3),
  "%B": date => MONTHS[date.tm_mon],
  "%C": date => {
   var year = date.tm_year + 1900;
   return leadingNulls((year / 100) | 0, 2);
  },
  "%d": date => leadingNulls(date.tm_mday, 2),
  "%e": date => leadingSomething(date.tm_mday, 2, " "),
  "%g": date => getWeekBasedYear(date).toString().substring(2),
  "%G": getWeekBasedYear,
  "%H": date => leadingNulls(date.tm_hour, 2),
  "%I": date => {
   var twelveHour = date.tm_hour;
   if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
   return leadingNulls(twelveHour, 2);
  },
  "%j": date => leadingNulls(date.tm_mday + arraySum(isLeapYear(date.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, date.tm_mon - 1), 3),
  "%m": date => leadingNulls(date.tm_mon + 1, 2),
  "%M": date => leadingNulls(date.tm_min, 2),
  "%n": () => "\n",
  "%p": date => {
   if (date.tm_hour >= 0 && date.tm_hour < 12) {
    return "AM";
   }
   return "PM";
  },
  "%S": date => leadingNulls(date.tm_sec, 2),
  "%t": () => "\t",
  "%u": date => date.tm_wday || 7,
  "%U": date => {
   var days = date.tm_yday + 7 - date.tm_wday;
   return leadingNulls(Math.floor(days / 7), 2);
  },
  "%V": date => {
   var val = Math.floor((date.tm_yday + 7 - (date.tm_wday + 6) % 7) / 7);
   if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
    val++;
   }
   if (!val) {
    val = 52;
    var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
    if (dec31 == 4 || (dec31 == 5 && isLeapYear(date.tm_year % 400 - 1))) {
     val++;
    }
   } else if (val == 53) {
    var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
    if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
   }
   return leadingNulls(val, 2);
  },
  "%w": date => date.tm_wday,
  "%W": date => {
   var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
   return leadingNulls(Math.floor(days / 7), 2);
  },
  "%y": date => (date.tm_year + 1900).toString().substring(2),
  "%Y": date => date.tm_year + 1900,
  "%z": date => {
   var off = date.tm_gmtoff;
   var ahead = off >= 0;
   off = Math.abs(off) / 60;
   off = (off / 60) * 100 + (off % 60);
   return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
  },
  "%Z": date => date.tm_zone,
  "%%": () => "%"
 };
 pattern = pattern.replace(/%%/g, "\0\0");
 for (var rule in EXPANSION_RULES_2) {
  if (pattern.includes(rule)) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
  }
 }
 pattern = pattern.replace(/\0\0/g, "%");
 var bytes = intArrayFromString(pattern, false);
 if (bytes.length > maxsize) {
  return 0;
 }
 writeArrayToMemory(bytes, s);
 return bytes.length - 1;
};

var _strftime_l = (s, maxsize, format, tm, loc) => _strftime(s, maxsize, format, tm);

var getCFunc = ident => {
 var func = Module["_" + ident];
 return func;
};

var stringToUTF8OnStack = str => {
 var size = lengthBytesUTF8(str) + 1;
 var ret = stackAlloc(size);
 stringToUTF8(str, ret, size);
 return ret;
};

/**
     * @param {string|null=} returnType
     * @param {Array=} argTypes
     * @param {Arguments|Array=} args
     * @param {Object=} opts
     */ var ccall = (ident, returnType, argTypes, args, opts) => {
 var toC = {
  "string": str => {
   var ret = 0;
   if (str !== null && str !== undefined && str !== 0) {
    ret = stringToUTF8OnStack(str);
   }
   return ret;
  },
  "array": arr => {
   var ret = stackAlloc(arr.length);
   writeArrayToMemory(arr, ret);
   return ret;
  }
 };
 function convertReturnValue(ret) {
  if (returnType === "string") {
   return UTF8ToString(ret);
  }
  if (returnType === "boolean") return Boolean(ret);
  return ret;
 }
 var func = getCFunc(ident);
 var cArgs = [];
 var stack = 0;
 if (args) {
  for (var i = 0; i < args.length; i++) {
   var converter = toC[argTypes[i]];
   if (converter) {
    if (stack === 0) stack = stackSave();
    cArgs[i] = converter(args[i]);
   } else {
    cArgs[i] = args[i];
   }
  }
 }
 var ret = func(...cArgs);
 function onDone(ret) {
  if (stack !== 0) stackRestore(stack);
  return convertReturnValue(ret);
 }
 ret = onDone(ret);
 return ret;
};

/**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */ var cwrap = (ident, returnType, argTypes, opts) => {
 var numericArgs = !argTypes || argTypes.every(type => type === "number" || type === "boolean");
 var numericRet = returnType !== "string";
 if (numericRet && numericArgs && !opts) {
  return getCFunc(ident);
 }
 return (...args) => ccall(ident, returnType, argTypes, args, opts);
};

var uleb128Encode = (n, target) => {
 if (n < 128) {
  target.push(n);
 } else {
  target.push((n % 128) | 128, n >> 7);
 }
};

var sigToWasmTypes = sig => {
 var typeNames = {
  "i": "i32",
  "j": "i64",
  "f": "f32",
  "d": "f64",
  "e": "externref",
  "p": "i32"
 };
 var type = {
  parameters: [],
  results: sig[0] == "v" ? [] : [ typeNames[sig[0]] ]
 };
 for (var i = 1; i < sig.length; ++i) {
  type.parameters.push(typeNames[sig[i]]);
 }
 return type;
};

var generateFuncType = (sig, target) => {
 var sigRet = sig.slice(0, 1);
 var sigParam = sig.slice(1);
 var typeCodes = {
  "i": 127,
  "p": 127,
  "j": 126,
  "f": 125,
  "d": 124,
  "e": 111
 };
 target.push(96);
 /* form: func */ uleb128Encode(sigParam.length, target);
 for (var i = 0; i < sigParam.length; ++i) {
  target.push(typeCodes[sigParam[i]]);
 }
 if (sigRet == "v") {
  target.push(0);
 } else {
  target.push(1, typeCodes[sigRet]);
 }
};

var convertJsFunctionToWasm = (func, sig) => {
 if (typeof WebAssembly.Function == "function") {
  return new WebAssembly.Function(sigToWasmTypes(sig), func);
 }
 var typeSectionBody = [ 1 ];
 generateFuncType(sig, typeSectionBody);
 var bytes = [ 0, 97, 115, 109,  1, 0, 0, 0,  1 ];
 uleb128Encode(typeSectionBody.length, bytes);
 bytes.push(...typeSectionBody);
 bytes.push(2, 7,  1, 1, 101, 1, 102, 0, 0, 7, 5,  1, 1, 102, 0, 0);
 var module = new WebAssembly.Module(new Uint8Array(bytes));
 var instance = new WebAssembly.Instance(module, {
  "e": {
   "f": func
  }
 });
 var wrappedFunc = instance.exports["f"];
 return wrappedFunc;
};

var updateTableMap = (offset, count) => {
 if (functionsInTableMap) {
  for (var i = offset; i < offset + count; i++) {
   var item = getWasmTableEntry(i);
   if (item) {
    functionsInTableMap.set(item, i);
   }
  }
 }
};

var functionsInTableMap;

var getFunctionAddress = func => {
 if (!functionsInTableMap) {
  functionsInTableMap = new WeakMap;
  updateTableMap(0, wasmTable.length);
 }
 return functionsInTableMap.get(func) || 0;
};

var freeTableIndexes = [];

var getEmptyTableSlot = () => {
 if (freeTableIndexes.length) {
  return freeTableIndexes.pop();
 }
 try {
  wasmTable.grow(1);
 } catch (err) {
  if (!(err instanceof RangeError)) {
   throw err;
  }
  throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
 }
 return wasmTable.length - 1;
};

var setWasmTableEntry = (idx, func) => {
 wasmTable.set(idx, func);
 wasmTableMirror[idx] = wasmTable.get(idx);
};

/** @param {string=} sig */ var addFunction = (func, sig) => {
 var rtn = getFunctionAddress(func);
 if (rtn) {
  return rtn;
 }
 var ret = getEmptyTableSlot();
 try {
  setWasmTableEntry(ret, func);
 } catch (err) {
  if (!(err instanceof TypeError)) {
   throw err;
  }
  var wrapped = convertJsFunctionToWasm(func, sig);
  setWasmTableEntry(ret, wrapped);
 }
 functionsInTableMap.set(func, ret);
 return ret;
};

var FS_unlink = path => FS.unlink(path);

PThread.init();

FS.createPreloadedFile = FS_createPreloadedFile;

FS.staticInit();

Module["FS_createPath"] = FS.createPath;

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPath"] = FS.createPath;

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

Module["FS_unlink"] = FS.unlink;

Module["FS_createLazyFile"] = FS.createLazyFile;

Module["FS_createDevice"] = FS.createDevice;

var GLctx;

for (var i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i));

DOTNET.setup({
 wasmEnableSIMD: true,
 wasmEnableEH: true,
 enableAotProfiler: false,
 enableDevToolsProfiler: false,
 enableLogProfiler: false,
 enableEventPipe: false,
 runAOTCompilation: true,
 wasmEnableThreads: true,
 gitHash: "95017c711e6afc1085133d440e42b4bd78155701"
});

FS.createPath = function(parent, path, canRead, canWrite) {
 var current = typeof parent === "string" ? parent : FS.getPath(parent);
 for (var part of path.split("/")) {
  if (!part) continue;
  current = PATH.join2(current, part);
  try {
   FS.mkdir(current);
  } catch (e) {
   if (!e || e.errno !== 20) /* EEXIST */ throw e;
  }
 }
 return current;
};

osuWeb.init();

var proxiedFunctionTable = [ _proc_exit, exitOnMainThread, pthreadCreateProxied, ___syscall_chdir, ___syscall_chmod, ___syscall_connect, ___syscall_faccessat, ___syscall_fadvise64, ___syscall_fallocate, ___syscall_fchmod, ___syscall_fchown32, ___syscall_fcntl64, ___syscall_fstat64, ___syscall_fstatfs64, ___syscall_statfs64, ___syscall_ftruncate64, ___syscall_getcwd, ___syscall_getdents64, ___syscall_ioctl, ___syscall_lstat64, ___syscall_mkdirat, ___syscall_newfstatat, ___syscall_openat, ___syscall_readlinkat, ___syscall_renameat, ___syscall_rmdir, ___syscall_sendto, ___syscall_socket, ___syscall_stat64, ___syscall_symlink, ___syscall_unlinkat, ___syscall_utimensat, __mmap_js, __msync_js, __munmap_js, _emscripten_force_exit, __emscripten_runtime_keepalive_clear, _environ_get, _environ_sizes_get, _fd_close, _fd_fdstat_get, _fd_pread, _fd_pwrite, _fd_read, _fd_seek, _fd_sync, _fd_write, _osu_js_audio_free, _osu_js_audio_load, _osu_js_audio_play, _osu_js_audio_set_analyse, _osu_js_audio_set_params, _osu_js_audio_stop, _osu_js_request_canvas, _osu_js_ui_fatal, _osu_js_ui_init, _osu_js_ui_open_url, _osu_js_ui_set_clipboard, _osu_js_ui_set_cursor_visible, _osu_js_ui_set_fullscreen, _osu_js_ui_set_pointer_lock, _osu_js_ui_set_title ];

var wasmImports = {
 /** @export */ __assert_fail: ___assert_fail,
 /** @export */ __emscripten_init_main_thread_js: ___emscripten_init_main_thread_js,
 /** @export */ __emscripten_thread_cleanup: ___emscripten_thread_cleanup,
 /** @export */ __pthread_create_js: ___pthread_create_js,
 /** @export */ __syscall_chdir: ___syscall_chdir,
 /** @export */ __syscall_chmod: ___syscall_chmod,
 /** @export */ __syscall_connect: ___syscall_connect,
 /** @export */ __syscall_faccessat: ___syscall_faccessat,
 /** @export */ __syscall_fadvise64: ___syscall_fadvise64,
 /** @export */ __syscall_fallocate: ___syscall_fallocate,
 /** @export */ __syscall_fchmod: ___syscall_fchmod,
 /** @export */ __syscall_fchown32: ___syscall_fchown32,
 /** @export */ __syscall_fcntl64: ___syscall_fcntl64,
 /** @export */ __syscall_fstat64: ___syscall_fstat64,
 /** @export */ __syscall_fstatfs64: ___syscall_fstatfs64,
 /** @export */ __syscall_ftruncate64: ___syscall_ftruncate64,
 /** @export */ __syscall_getcwd: ___syscall_getcwd,
 /** @export */ __syscall_getdents64: ___syscall_getdents64,
 /** @export */ __syscall_ioctl: ___syscall_ioctl,
 /** @export */ __syscall_lstat64: ___syscall_lstat64,
 /** @export */ __syscall_mkdirat: ___syscall_mkdirat,
 /** @export */ __syscall_newfstatat: ___syscall_newfstatat,
 /** @export */ __syscall_openat: ___syscall_openat,
 /** @export */ __syscall_readlinkat: ___syscall_readlinkat,
 /** @export */ __syscall_renameat: ___syscall_renameat,
 /** @export */ __syscall_rmdir: ___syscall_rmdir,
 /** @export */ __syscall_sendto: ___syscall_sendto,
 /** @export */ __syscall_socket: ___syscall_socket,
 /** @export */ __syscall_stat64: ___syscall_stat64,
 /** @export */ __syscall_statfs64: ___syscall_statfs64,
 /** @export */ __syscall_symlink: ___syscall_symlink,
 /** @export */ __syscall_unlinkat: ___syscall_unlinkat,
 /** @export */ __syscall_utimensat: ___syscall_utimensat,
 /** @export */ _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
 /** @export */ _emscripten_notify_mailbox_postmessage: __emscripten_notify_mailbox_postmessage,
 /** @export */ _emscripten_receive_on_main_thread_js: __emscripten_receive_on_main_thread_js,
 /** @export */ _emscripten_thread_mailbox_await: __emscripten_thread_mailbox_await,
 /** @export */ _emscripten_thread_set_strongref: __emscripten_thread_set_strongref,
 /** @export */ _gmtime_js: __gmtime_js,
 /** @export */ _localtime_js: __localtime_js,
 /** @export */ _mmap_js: __mmap_js,
 /** @export */ _msync_js: __msync_js,
 /** @export */ _munmap_js: __munmap_js,
 /** @export */ _timegm_js: __timegm_js,
 /** @export */ _tzset_js: __tzset_js,
 /** @export */ abort: _abort,
 /** @export */ emscripten_check_blocking_allowed: _emscripten_check_blocking_allowed,
 /** @export */ emscripten_clear_timeout: _emscripten_clear_timeout,
 /** @export */ emscripten_date_now: _emscripten_date_now,
 /** @export */ emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
 /** @export */ emscripten_force_exit: _emscripten_force_exit,
 /** @export */ emscripten_get_heap_max: _emscripten_get_heap_max,
 /** @export */ emscripten_get_now: _emscripten_get_now,
 /** @export */ emscripten_get_now_res: _emscripten_get_now_res,
 /** @export */ emscripten_num_logical_cores: _emscripten_num_logical_cores,
 /** @export */ emscripten_resize_heap: _emscripten_resize_heap,
 /** @export */ emscripten_set_timeout: _emscripten_set_timeout,
 /** @export */ emscripten_unwind_to_js_event_loop: _emscripten_unwind_to_js_event_loop,
 /** @export */ environ_get: _environ_get,
 /** @export */ environ_sizes_get: _environ_sizes_get,
 /** @export */ exit: _exit,
 /** @export */ fd_close: _fd_close,
 /** @export */ fd_fdstat_get: _fd_fdstat_get,
 /** @export */ fd_pread: _fd_pread,
 /** @export */ fd_pwrite: _fd_pwrite,
 /** @export */ fd_read: _fd_read,
 /** @export */ fd_seek: _fd_seek,
 /** @export */ fd_sync: _fd_sync,
 /** @export */ fd_write: _fd_write,
 /** @export */ getentropy: _getentropy,
 /** @export */ glActiveTexture: _glActiveTexture,
 /** @export */ glAttachShader: _glAttachShader,
 /** @export */ glBindBuffer: _glBindBuffer,
 /** @export */ glBindBufferBase: _glBindBufferBase,
 /** @export */ glBindFramebuffer: _glBindFramebuffer,
 /** @export */ glBindRenderbuffer: _glBindRenderbuffer,
 /** @export */ glBindTexture: _glBindTexture,
 /** @export */ glBindVertexArray: _glBindVertexArray,
 /** @export */ glBlendEquationSeparate: _glBlendEquationSeparate,
 /** @export */ glBlendFuncSeparate: _glBlendFuncSeparate,
 /** @export */ glBufferData: _glBufferData,
 /** @export */ glBufferSubData: _glBufferSubData,
 /** @export */ glClear: _glClear,
 /** @export */ glClearColor: _glClearColor,
 /** @export */ glClearDepthf: _glClearDepthf,
 /** @export */ glClearStencil: _glClearStencil,
 /** @export */ glColorMask: _glColorMask,
 /** @export */ glCompileShader: _glCompileShader,
 /** @export */ glCreateProgram: _glCreateProgram,
 /** @export */ glCreateShader: _glCreateShader,
 /** @export */ glDeleteBuffers: _glDeleteBuffers,
 /** @export */ glDeleteFramebuffers: _glDeleteFramebuffers,
 /** @export */ glDeleteProgram: _glDeleteProgram,
 /** @export */ glDeleteRenderbuffers: _glDeleteRenderbuffers,
 /** @export */ glDeleteShader: _glDeleteShader,
 /** @export */ glDeleteTextures: _glDeleteTextures,
 /** @export */ glDeleteVertexArrays: _glDeleteVertexArrays,
 /** @export */ glDepthFunc: _glDepthFunc,
 /** @export */ glDepthMask: _glDepthMask,
 /** @export */ glDetachShader: _glDetachShader,
 /** @export */ glDisable: _glDisable,
 /** @export */ glDrawElements: _glDrawElements,
 /** @export */ glEnable: _glEnable,
 /** @export */ glEnableVertexAttribArray: _glEnableVertexAttribArray,
 /** @export */ glFinish: _glFinish,
 /** @export */ glFramebufferRenderbuffer: _glFramebufferRenderbuffer,
 /** @export */ glFramebufferTexture2D: _glFramebufferTexture2D,
 /** @export */ glGenBuffers: _glGenBuffers,
 /** @export */ glGenFramebuffers: _glGenFramebuffers,
 /** @export */ glGenRenderbuffers: _glGenRenderbuffers,
 /** @export */ glGenTextures: _glGenTextures,
 /** @export */ glGenVertexArrays: _glGenVertexArrays,
 /** @export */ glGenerateMipmap: _glGenerateMipmap,
 /** @export */ glGetIntegerv: _glGetIntegerv,
 /** @export */ glGetProgramInfoLog: _glGetProgramInfoLog,
 /** @export */ glGetProgramiv: _glGetProgramiv,
 /** @export */ glGetShaderInfoLog: _glGetShaderInfoLog,
 /** @export */ glGetShaderiv: _glGetShaderiv,
 /** @export */ glGetString: _glGetString,
 /** @export */ glGetStringi: _glGetStringi,
 /** @export */ glGetUniformBlockIndex: _glGetUniformBlockIndex,
 /** @export */ glGetUniformLocation: _glGetUniformLocation,
 /** @export */ glHint: _glHint,
 /** @export */ glInvalidateFramebuffer: _glInvalidateFramebuffer,
 /** @export */ glLinkProgram: _glLinkProgram,
 /** @export */ glPixelStorei: _glPixelStorei,
 /** @export */ glReadPixels: _glReadPixels,
 /** @export */ glRenderbufferStorage: _glRenderbufferStorage,
 /** @export */ glScissor: _glScissor,
 /** @export */ glShaderSource: _glShaderSource,
 /** @export */ glStencilFunc: _glStencilFunc,
 /** @export */ glStencilOp: _glStencilOp,
 /** @export */ glTexImage2D: _glTexImage2D,
 /** @export */ glTexParameteri: _glTexParameteri,
 /** @export */ glTexSubImage2D: _glTexSubImage2D,
 /** @export */ glUniform1f: _glUniform1f,
 /** @export */ glUniform1i: _glUniform1i,
 /** @export */ glUniform2fv: _glUniform2fv,
 /** @export */ glUniform3fv: _glUniform3fv,
 /** @export */ glUniform4fv: _glUniform4fv,
 /** @export */ glUniformBlockBinding: _glUniformBlockBinding,
 /** @export */ glUniformMatrix2fv: _glUniformMatrix2fv,
 /** @export */ glUniformMatrix3fv: _glUniformMatrix3fv,
 /** @export */ glUniformMatrix4fv: _glUniformMatrix4fv,
 /** @export */ glUseProgram: _glUseProgram,
 /** @export */ glVertexAttribIPointer: _glVertexAttribIPointer,
 /** @export */ glVertexAttribPointer: _glVertexAttribPointer,
 /** @export */ glViewport: _glViewport,
 /** @export */ memory: wasmMemory || Module["wasmMemory"],
 /** @export */ mono_interp_tier_prepare_jiterpreter: _mono_interp_tier_prepare_jiterpreter,
 /** @export */ mono_wasm_browser_entropy: _mono_wasm_browser_entropy,
 /** @export */ mono_wasm_cancel_promise: _mono_wasm_cancel_promise,
 /** @export */ mono_wasm_console_clear: _mono_wasm_console_clear,
 /** @export */ mono_wasm_dump_threads: _mono_wasm_dump_threads,
 /** @export */ mono_wasm_free_method_data: _mono_wasm_free_method_data,
 /** @export */ mono_wasm_get_locale_info: _mono_wasm_get_locale_info,
 /** @export */ mono_wasm_install_js_worker_interop: _mono_wasm_install_js_worker_interop,
 /** @export */ mono_wasm_invoke_js_function: _mono_wasm_invoke_js_function,
 /** @export */ mono_wasm_invoke_jsimport_MT: _mono_wasm_invoke_jsimport_MT,
 /** @export */ mono_wasm_process_current_pid: _mono_wasm_process_current_pid,
 /** @export */ mono_wasm_pthread_on_pthread_attached: _mono_wasm_pthread_on_pthread_attached,
 /** @export */ mono_wasm_pthread_on_pthread_registered: _mono_wasm_pthread_on_pthread_registered,
 /** @export */ mono_wasm_pthread_on_pthread_unregistered: _mono_wasm_pthread_on_pthread_unregistered,
 /** @export */ mono_wasm_pthread_set_name: _mono_wasm_pthread_set_name,
 /** @export */ mono_wasm_release_cs_owned_object: _mono_wasm_release_cs_owned_object,
 /** @export */ mono_wasm_resolve_or_reject_promise: _mono_wasm_resolve_or_reject_promise,
 /** @export */ mono_wasm_schedule_synchronization_context: _mono_wasm_schedule_synchronization_context,
 /** @export */ mono_wasm_set_entrypoint_breakpoint: _mono_wasm_set_entrypoint_breakpoint,
 /** @export */ mono_wasm_start_deputy_thread_async: _mono_wasm_start_deputy_thread_async,
 /** @export */ mono_wasm_start_io_thread_async: _mono_wasm_start_io_thread_async,
 /** @export */ mono_wasm_trace_logger: _mono_wasm_trace_logger,
 /** @export */ mono_wasm_uninstall_js_worker_interop: _mono_wasm_uninstall_js_worker_interop,
 /** @export */ mono_wasm_warn_about_blocking_wait: _mono_wasm_warn_about_blocking_wait,
 /** @export */ osu_js_audio_free: _osu_js_audio_free,
 /** @export */ osu_js_audio_load: _osu_js_audio_load,
 /** @export */ osu_js_audio_play: _osu_js_audio_play,
 /** @export */ osu_js_audio_set_analyse: _osu_js_audio_set_analyse,
 /** @export */ osu_js_audio_set_params: _osu_js_audio_set_params,
 /** @export */ osu_js_audio_stop: _osu_js_audio_stop,
 /** @export */ osu_js_create_gl: _osu_js_create_gl,
 /** @export */ osu_js_has_canvas: _osu_js_has_canvas,
 /** @export */ osu_js_log_native_stack: _osu_js_log_native_stack,
 /** @export */ osu_js_now: _osu_js_now,
 /** @export */ osu_js_request_canvas: _osu_js_request_canvas,
 /** @export */ osu_js_set_canvas_size: _osu_js_set_canvas_size,
 /** @export */ osu_js_start_frame_loop: _osu_js_start_frame_loop,
 /** @export */ osu_js_ui_fatal: _osu_js_ui_fatal,
 /** @export */ osu_js_ui_init: _osu_js_ui_init,
 /** @export */ osu_js_ui_open_url: _osu_js_ui_open_url,
 /** @export */ osu_js_ui_set_clipboard: _osu_js_ui_set_clipboard,
 /** @export */ osu_js_ui_set_cursor_visible: _osu_js_ui_set_cursor_visible,
 /** @export */ osu_js_ui_set_fullscreen: _osu_js_ui_set_fullscreen,
 /** @export */ osu_js_ui_set_pointer_lock: _osu_js_ui_set_pointer_lock,
 /** @export */ osu_js_ui_set_title: _osu_js_ui_set_title,
 /** @export */ strftime: _strftime,
 /** @export */ strftime_l: _strftime_l
};

var wasmExports = createWasm();

var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["__wasm_call_ctors"])();

var _osu_push_event = Module["_osu_push_event"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_osu_push_event = Module["_osu_push_event"] = wasmExports["osu_push_event"])(a0, a1, a2, a3, a4, a5, a6, a7);

var _osu_malloc = a0 => (_osu_malloc = wasmExports["osu_malloc"])(a0);

var _malloc = Module["_malloc"] = a0 => (_malloc = Module["_malloc"] = wasmExports["malloc"])(a0);

var _free = Module["_free"] = a0 => (_free = Module["_free"] = wasmExports["free"])(a0);

var _pthread_self = Module["_pthread_self"] = () => (_pthread_self = Module["_pthread_self"] = wasmExports["pthread_self"])();

var _osu_set_clipboard_cache = a0 => (_osu_set_clipboard_cache = wasmExports["osu_set_clipboard_cache"])(a0);

var _osu_audio_slot_ptr = a0 => (_osu_audio_slot_ptr = wasmExports["osu_audio_slot_ptr"])(a0);

var _osu_audio_set_context_running = a0 => (_osu_audio_set_context_running = wasmExports["osu_audio_set_context_running"])(a0);

var _osu_log_native_stack = Module["_osu_log_native_stack"] = a0 => (_osu_log_native_stack = Module["_osu_log_native_stack"] = wasmExports["osu_log_native_stack"])(a0);

var _pow = Module["_pow"] = (a0, a1) => (_pow = Module["_pow"] = wasmExports["pow"])(a0, a1);

var _log = Module["_log"] = a0 => (_log = Module["_log"] = wasmExports["log"])(a0);

var _cos = Module["_cos"] = a0 => (_cos = Module["_cos"] = wasmExports["cos"])(a0);

var _sin = Module["_sin"] = a0 => (_sin = Module["_sin"] = wasmExports["sin"])(a0);

var _atan2 = Module["_atan2"] = (a0, a1) => (_atan2 = Module["_atan2"] = wasmExports["atan2"])(a0, a1);

var _asin = Module["_asin"] = a0 => (_asin = Module["_asin"] = wasmExports["asin"])(a0);

var _tan = Module["_tan"] = a0 => (_tan = Module["_tan"] = wasmExports["tan"])(a0);

var _atan = Module["_atan"] = a0 => (_atan = Module["_atan"] = wasmExports["atan"])(a0);

var _acos = Module["_acos"] = a0 => (_acos = Module["_acos"] = wasmExports["acos"])(a0);

var _exp = Module["_exp"] = a0 => (_exp = Module["_exp"] = wasmExports["exp"])(a0);

var _log2 = Module["_log2"] = a0 => (_log2 = Module["_log2"] = wasmExports["log2"])(a0);

var _mono_wasm_register_root = Module["_mono_wasm_register_root"] = (a0, a1, a2) => (_mono_wasm_register_root = Module["_mono_wasm_register_root"] = wasmExports["mono_wasm_register_root"])(a0, a1, a2);

var _mono_wasm_deregister_root = Module["_mono_wasm_deregister_root"] = a0 => (_mono_wasm_deregister_root = Module["_mono_wasm_deregister_root"] = wasmExports["mono_wasm_deregister_root"])(a0);

var _mono_wasm_add_assembly = Module["_mono_wasm_add_assembly"] = (a0, a1, a2) => (_mono_wasm_add_assembly = Module["_mono_wasm_add_assembly"] = wasmExports["mono_wasm_add_assembly"])(a0, a1, a2);

var _mono_wasm_add_satellite_assembly = Module["_mono_wasm_add_satellite_assembly"] = (a0, a1, a2, a3) => (_mono_wasm_add_satellite_assembly = Module["_mono_wasm_add_satellite_assembly"] = wasmExports["mono_wasm_add_satellite_assembly"])(a0, a1, a2, a3);

var _mono_wasm_setenv = Module["_mono_wasm_setenv"] = (a0, a1) => (_mono_wasm_setenv = Module["_mono_wasm_setenv"] = wasmExports["mono_wasm_setenv"])(a0, a1);

var _mono_wasm_getenv = Module["_mono_wasm_getenv"] = a0 => (_mono_wasm_getenv = Module["_mono_wasm_getenv"] = wasmExports["mono_wasm_getenv"])(a0);

var _mono_wasm_load_runtime = Module["_mono_wasm_load_runtime"] = (a0, a1, a2, a3) => (_mono_wasm_load_runtime = Module["_mono_wasm_load_runtime"] = wasmExports["mono_wasm_load_runtime"])(a0, a1, a2, a3);

var _mono_wasm_invoke_jsexport = Module["_mono_wasm_invoke_jsexport"] = (a0, a1) => (_mono_wasm_invoke_jsexport = Module["_mono_wasm_invoke_jsexport"] = wasmExports["mono_wasm_invoke_jsexport"])(a0, a1);

var _mono_wasm_print_thread_dump = Module["_mono_wasm_print_thread_dump"] = () => (_mono_wasm_print_thread_dump = Module["_mono_wasm_print_thread_dump"] = wasmExports["mono_wasm_print_thread_dump"])();

var _mono_wasm_invoke_jsexport_async_post = Module["_mono_wasm_invoke_jsexport_async_post"] = (a0, a1, a2) => (_mono_wasm_invoke_jsexport_async_post = Module["_mono_wasm_invoke_jsexport_async_post"] = wasmExports["mono_wasm_invoke_jsexport_async_post"])(a0, a1, a2);

var _mono_wasm_invoke_jsexport_sync = Module["_mono_wasm_invoke_jsexport_sync"] = (a0, a1) => (_mono_wasm_invoke_jsexport_sync = Module["_mono_wasm_invoke_jsexport_sync"] = wasmExports["mono_wasm_invoke_jsexport_sync"])(a0, a1);

var _mono_wasm_invoke_jsexport_sync_send = Module["_mono_wasm_invoke_jsexport_sync_send"] = (a0, a1, a2) => (_mono_wasm_invoke_jsexport_sync_send = Module["_mono_wasm_invoke_jsexport_sync_send"] = wasmExports["mono_wasm_invoke_jsexport_sync_send"])(a0, a1, a2);

var _mono_wasm_synchronization_context_pump = Module["_mono_wasm_synchronization_context_pump"] = () => (_mono_wasm_synchronization_context_pump = Module["_mono_wasm_synchronization_context_pump"] = wasmExports["mono_wasm_synchronization_context_pump"])();

var _mono_wasm_string_from_utf16_ref = Module["_mono_wasm_string_from_utf16_ref"] = (a0, a1, a2) => (_mono_wasm_string_from_utf16_ref = Module["_mono_wasm_string_from_utf16_ref"] = wasmExports["mono_wasm_string_from_utf16_ref"])(a0, a1, a2);

var _mono_wasm_exec_regression = Module["_mono_wasm_exec_regression"] = (a0, a1) => (_mono_wasm_exec_regression = Module["_mono_wasm_exec_regression"] = wasmExports["mono_wasm_exec_regression"])(a0, a1);

var _mono_wasm_exit = Module["_mono_wasm_exit"] = a0 => (_mono_wasm_exit = Module["_mono_wasm_exit"] = wasmExports["mono_wasm_exit"])(a0);

var _fflush = a0 => (_fflush = wasmExports["fflush"])(a0);

var _mono_wasm_set_main_args = Module["_mono_wasm_set_main_args"] = (a0, a1) => (_mono_wasm_set_main_args = Module["_mono_wasm_set_main_args"] = wasmExports["mono_wasm_set_main_args"])(a0, a1);

var _mono_wasm_strdup = Module["_mono_wasm_strdup"] = a0 => (_mono_wasm_strdup = Module["_mono_wasm_strdup"] = wasmExports["mono_wasm_strdup"])(a0);

var _mono_wasm_parse_runtime_options = Module["_mono_wasm_parse_runtime_options"] = (a0, a1) => (_mono_wasm_parse_runtime_options = Module["_mono_wasm_parse_runtime_options"] = wasmExports["mono_wasm_parse_runtime_options"])(a0, a1);

var _mono_wasm_intern_string_ref = Module["_mono_wasm_intern_string_ref"] = a0 => (_mono_wasm_intern_string_ref = Module["_mono_wasm_intern_string_ref"] = wasmExports["mono_wasm_intern_string_ref"])(a0);

var _mono_wasm_string_get_data_ref = Module["_mono_wasm_string_get_data_ref"] = (a0, a1, a2, a3) => (_mono_wasm_string_get_data_ref = Module["_mono_wasm_string_get_data_ref"] = wasmExports["mono_wasm_string_get_data_ref"])(a0, a1, a2, a3);

var _mono_wasm_write_managed_pointer_unsafe = Module["_mono_wasm_write_managed_pointer_unsafe"] = (a0, a1) => (_mono_wasm_write_managed_pointer_unsafe = Module["_mono_wasm_write_managed_pointer_unsafe"] = wasmExports["mono_wasm_write_managed_pointer_unsafe"])(a0, a1);

var _mono_wasm_copy_managed_pointer = Module["_mono_wasm_copy_managed_pointer"] = (a0, a1) => (_mono_wasm_copy_managed_pointer = Module["_mono_wasm_copy_managed_pointer"] = wasmExports["mono_wasm_copy_managed_pointer"])(a0, a1);

var _mono_wasm_init_finalizer_thread = Module["_mono_wasm_init_finalizer_thread"] = () => (_mono_wasm_init_finalizer_thread = Module["_mono_wasm_init_finalizer_thread"] = wasmExports["mono_wasm_init_finalizer_thread"])();

var _mono_wasm_i52_to_f64 = Module["_mono_wasm_i52_to_f64"] = (a0, a1) => (_mono_wasm_i52_to_f64 = Module["_mono_wasm_i52_to_f64"] = wasmExports["mono_wasm_i52_to_f64"])(a0, a1);

var _mono_wasm_u52_to_f64 = Module["_mono_wasm_u52_to_f64"] = (a0, a1) => (_mono_wasm_u52_to_f64 = Module["_mono_wasm_u52_to_f64"] = wasmExports["mono_wasm_u52_to_f64"])(a0, a1);

var _mono_wasm_f64_to_u52 = Module["_mono_wasm_f64_to_u52"] = (a0, a1) => (_mono_wasm_f64_to_u52 = Module["_mono_wasm_f64_to_u52"] = wasmExports["mono_wasm_f64_to_u52"])(a0, a1);

var _mono_wasm_f64_to_i52 = Module["_mono_wasm_f64_to_i52"] = (a0, a1) => (_mono_wasm_f64_to_i52 = Module["_mono_wasm_f64_to_i52"] = wasmExports["mono_wasm_f64_to_i52"])(a0, a1);

var _mono_wasm_method_get_full_name = Module["_mono_wasm_method_get_full_name"] = a0 => (_mono_wasm_method_get_full_name = Module["_mono_wasm_method_get_full_name"] = wasmExports["mono_wasm_method_get_full_name"])(a0);

var _mono_wasm_method_get_name = Module["_mono_wasm_method_get_name"] = a0 => (_mono_wasm_method_get_name = Module["_mono_wasm_method_get_name"] = wasmExports["mono_wasm_method_get_name"])(a0);

var _mono_wasm_method_get_name_ex = Module["_mono_wasm_method_get_name_ex"] = a0 => (_mono_wasm_method_get_name_ex = Module["_mono_wasm_method_get_name_ex"] = wasmExports["mono_wasm_method_get_name_ex"])(a0);

var _mono_wasm_get_f32_unaligned = Module["_mono_wasm_get_f32_unaligned"] = a0 => (_mono_wasm_get_f32_unaligned = Module["_mono_wasm_get_f32_unaligned"] = wasmExports["mono_wasm_get_f32_unaligned"])(a0);

var _mono_wasm_get_f64_unaligned = Module["_mono_wasm_get_f64_unaligned"] = a0 => (_mono_wasm_get_f64_unaligned = Module["_mono_wasm_get_f64_unaligned"] = wasmExports["mono_wasm_get_f64_unaligned"])(a0);

var _mono_wasm_get_i32_unaligned = Module["_mono_wasm_get_i32_unaligned"] = a0 => (_mono_wasm_get_i32_unaligned = Module["_mono_wasm_get_i32_unaligned"] = wasmExports["mono_wasm_get_i32_unaligned"])(a0);

var _mono_wasm_is_zero_page_reserved = Module["_mono_wasm_is_zero_page_reserved"] = () => (_mono_wasm_is_zero_page_reserved = Module["_mono_wasm_is_zero_page_reserved"] = wasmExports["mono_wasm_is_zero_page_reserved"])();

var _mono_wasm_read_as_bool_or_null_unsafe = Module["_mono_wasm_read_as_bool_or_null_unsafe"] = a0 => (_mono_wasm_read_as_bool_or_null_unsafe = Module["_mono_wasm_read_as_bool_or_null_unsafe"] = wasmExports["mono_wasm_read_as_bool_or_null_unsafe"])(a0);

var _mono_wasm_assembly_load = Module["_mono_wasm_assembly_load"] = a0 => (_mono_wasm_assembly_load = Module["_mono_wasm_assembly_load"] = wasmExports["mono_wasm_assembly_load"])(a0);

var _mono_wasm_assembly_find_class = Module["_mono_wasm_assembly_find_class"] = (a0, a1, a2) => (_mono_wasm_assembly_find_class = Module["_mono_wasm_assembly_find_class"] = wasmExports["mono_wasm_assembly_find_class"])(a0, a1, a2);

var _mono_wasm_assembly_find_method = Module["_mono_wasm_assembly_find_method"] = (a0, a1, a2) => (_mono_wasm_assembly_find_method = Module["_mono_wasm_assembly_find_method"] = wasmExports["mono_wasm_assembly_find_method"])(a0, a1, a2);

var _mono_aot_osu_Web_get_method = Module["_mono_aot_osu_Web_get_method"] = a0 => (_mono_aot_osu_Web_get_method = Module["_mono_aot_osu_Web_get_method"] = wasmExports["mono_aot_osu_Web_get_method"])(a0);

var _mono_aot_Microsoft_CSharp_get_method = Module["_mono_aot_Microsoft_CSharp_get_method"] = a0 => (_mono_aot_Microsoft_CSharp_get_method = Module["_mono_aot_Microsoft_CSharp_get_method"] = wasmExports["mono_aot_Microsoft_CSharp_get_method"])(a0);

var _mono_aot_Microsoft_VisualBasic_Core_get_method = Module["_mono_aot_Microsoft_VisualBasic_Core_get_method"] = a0 => (_mono_aot_Microsoft_VisualBasic_Core_get_method = Module["_mono_aot_Microsoft_VisualBasic_Core_get_method"] = wasmExports["mono_aot_Microsoft_VisualBasic_Core_get_method"])(a0);

var _mono_aot_Microsoft_VisualBasic_get_method = Module["_mono_aot_Microsoft_VisualBasic_get_method"] = a0 => (_mono_aot_Microsoft_VisualBasic_get_method = Module["_mono_aot_Microsoft_VisualBasic_get_method"] = wasmExports["mono_aot_Microsoft_VisualBasic_get_method"])(a0);

var _mono_aot_Microsoft_Win32_Primitives_get_method = Module["_mono_aot_Microsoft_Win32_Primitives_get_method"] = a0 => (_mono_aot_Microsoft_Win32_Primitives_get_method = Module["_mono_aot_Microsoft_Win32_Primitives_get_method"] = wasmExports["mono_aot_Microsoft_Win32_Primitives_get_method"])(a0);

var _mono_aot_Microsoft_Win32_Registry_get_method = Module["_mono_aot_Microsoft_Win32_Registry_get_method"] = a0 => (_mono_aot_Microsoft_Win32_Registry_get_method = Module["_mono_aot_Microsoft_Win32_Registry_get_method"] = wasmExports["mono_aot_Microsoft_Win32_Registry_get_method"])(a0);

var _mono_aot_System_AppContext_get_method = Module["_mono_aot_System_AppContext_get_method"] = a0 => (_mono_aot_System_AppContext_get_method = Module["_mono_aot_System_AppContext_get_method"] = wasmExports["mono_aot_System_AppContext_get_method"])(a0);

var _mono_aot_System_Buffers_get_method = Module["_mono_aot_System_Buffers_get_method"] = a0 => (_mono_aot_System_Buffers_get_method = Module["_mono_aot_System_Buffers_get_method"] = wasmExports["mono_aot_System_Buffers_get_method"])(a0);

var _mono_aot_System_Collections_Concurrent_get_method = Module["_mono_aot_System_Collections_Concurrent_get_method"] = a0 => (_mono_aot_System_Collections_Concurrent_get_method = Module["_mono_aot_System_Collections_Concurrent_get_method"] = wasmExports["mono_aot_System_Collections_Concurrent_get_method"])(a0);

var _mono_aot_System_Collections_Immutable_get_method = Module["_mono_aot_System_Collections_Immutable_get_method"] = a0 => (_mono_aot_System_Collections_Immutable_get_method = Module["_mono_aot_System_Collections_Immutable_get_method"] = wasmExports["mono_aot_System_Collections_Immutable_get_method"])(a0);

var _mono_aot_System_Collections_NonGeneric_get_method = Module["_mono_aot_System_Collections_NonGeneric_get_method"] = a0 => (_mono_aot_System_Collections_NonGeneric_get_method = Module["_mono_aot_System_Collections_NonGeneric_get_method"] = wasmExports["mono_aot_System_Collections_NonGeneric_get_method"])(a0);

var _mono_aot_System_Collections_Specialized_get_method = Module["_mono_aot_System_Collections_Specialized_get_method"] = a0 => (_mono_aot_System_Collections_Specialized_get_method = Module["_mono_aot_System_Collections_Specialized_get_method"] = wasmExports["mono_aot_System_Collections_Specialized_get_method"])(a0);

var _mono_aot_System_Collections_get_method = Module["_mono_aot_System_Collections_get_method"] = a0 => (_mono_aot_System_Collections_get_method = Module["_mono_aot_System_Collections_get_method"] = wasmExports["mono_aot_System_Collections_get_method"])(a0);

var _mono_aot_System_ComponentModel_Annotations_get_method = Module["_mono_aot_System_ComponentModel_Annotations_get_method"] = a0 => (_mono_aot_System_ComponentModel_Annotations_get_method = Module["_mono_aot_System_ComponentModel_Annotations_get_method"] = wasmExports["mono_aot_System_ComponentModel_Annotations_get_method"])(a0);

var _mono_aot_System_ComponentModel_DataAnnotations_get_method = Module["_mono_aot_System_ComponentModel_DataAnnotations_get_method"] = a0 => (_mono_aot_System_ComponentModel_DataAnnotations_get_method = Module["_mono_aot_System_ComponentModel_DataAnnotations_get_method"] = wasmExports["mono_aot_System_ComponentModel_DataAnnotations_get_method"])(a0);

var _mono_aot_System_ComponentModel_EventBasedAsync_get_method = Module["_mono_aot_System_ComponentModel_EventBasedAsync_get_method"] = a0 => (_mono_aot_System_ComponentModel_EventBasedAsync_get_method = Module["_mono_aot_System_ComponentModel_EventBasedAsync_get_method"] = wasmExports["mono_aot_System_ComponentModel_EventBasedAsync_get_method"])(a0);

var _mono_aot_System_ComponentModel_Primitives_get_method = Module["_mono_aot_System_ComponentModel_Primitives_get_method"] = a0 => (_mono_aot_System_ComponentModel_Primitives_get_method = Module["_mono_aot_System_ComponentModel_Primitives_get_method"] = wasmExports["mono_aot_System_ComponentModel_Primitives_get_method"])(a0);

var _mono_aot_System_ComponentModel_TypeConverter_get_method = Module["_mono_aot_System_ComponentModel_TypeConverter_get_method"] = a0 => (_mono_aot_System_ComponentModel_TypeConverter_get_method = Module["_mono_aot_System_ComponentModel_TypeConverter_get_method"] = wasmExports["mono_aot_System_ComponentModel_TypeConverter_get_method"])(a0);

var _mono_aot_System_ComponentModel_get_method = Module["_mono_aot_System_ComponentModel_get_method"] = a0 => (_mono_aot_System_ComponentModel_get_method = Module["_mono_aot_System_ComponentModel_get_method"] = wasmExports["mono_aot_System_ComponentModel_get_method"])(a0);

var _mono_aot_System_Configuration_get_method = Module["_mono_aot_System_Configuration_get_method"] = a0 => (_mono_aot_System_Configuration_get_method = Module["_mono_aot_System_Configuration_get_method"] = wasmExports["mono_aot_System_Configuration_get_method"])(a0);

var _mono_aot_System_Console_get_method = Module["_mono_aot_System_Console_get_method"] = a0 => (_mono_aot_System_Console_get_method = Module["_mono_aot_System_Console_get_method"] = wasmExports["mono_aot_System_Console_get_method"])(a0);

var _mono_aot_System_Core_get_method = Module["_mono_aot_System_Core_get_method"] = a0 => (_mono_aot_System_Core_get_method = Module["_mono_aot_System_Core_get_method"] = wasmExports["mono_aot_System_Core_get_method"])(a0);

var _mono_aot_System_Data_Common_get_method = Module["_mono_aot_System_Data_Common_get_method"] = a0 => (_mono_aot_System_Data_Common_get_method = Module["_mono_aot_System_Data_Common_get_method"] = wasmExports["mono_aot_System_Data_Common_get_method"])(a0);

var _mono_aot_System_Data_DataSetExtensions_get_method = Module["_mono_aot_System_Data_DataSetExtensions_get_method"] = a0 => (_mono_aot_System_Data_DataSetExtensions_get_method = Module["_mono_aot_System_Data_DataSetExtensions_get_method"] = wasmExports["mono_aot_System_Data_DataSetExtensions_get_method"])(a0);

var _mono_aot_System_Data_get_method = Module["_mono_aot_System_Data_get_method"] = a0 => (_mono_aot_System_Data_get_method = Module["_mono_aot_System_Data_get_method"] = wasmExports["mono_aot_System_Data_get_method"])(a0);

var _mono_aot_System_Diagnostics_Contracts_get_method = Module["_mono_aot_System_Diagnostics_Contracts_get_method"] = a0 => (_mono_aot_System_Diagnostics_Contracts_get_method = Module["_mono_aot_System_Diagnostics_Contracts_get_method"] = wasmExports["mono_aot_System_Diagnostics_Contracts_get_method"])(a0);

var _mono_aot_System_Diagnostics_Debug_get_method = Module["_mono_aot_System_Diagnostics_Debug_get_method"] = a0 => (_mono_aot_System_Diagnostics_Debug_get_method = Module["_mono_aot_System_Diagnostics_Debug_get_method"] = wasmExports["mono_aot_System_Diagnostics_Debug_get_method"])(a0);

var _mono_aot_System_Diagnostics_DiagnosticSource_get_method = Module["_mono_aot_System_Diagnostics_DiagnosticSource_get_method"] = a0 => (_mono_aot_System_Diagnostics_DiagnosticSource_get_method = Module["_mono_aot_System_Diagnostics_DiagnosticSource_get_method"] = wasmExports["mono_aot_System_Diagnostics_DiagnosticSource_get_method"])(a0);

var _mono_aot_System_Diagnostics_FileVersionInfo_get_method = Module["_mono_aot_System_Diagnostics_FileVersionInfo_get_method"] = a0 => (_mono_aot_System_Diagnostics_FileVersionInfo_get_method = Module["_mono_aot_System_Diagnostics_FileVersionInfo_get_method"] = wasmExports["mono_aot_System_Diagnostics_FileVersionInfo_get_method"])(a0);

var _mono_aot_System_Diagnostics_Process_get_method = Module["_mono_aot_System_Diagnostics_Process_get_method"] = a0 => (_mono_aot_System_Diagnostics_Process_get_method = Module["_mono_aot_System_Diagnostics_Process_get_method"] = wasmExports["mono_aot_System_Diagnostics_Process_get_method"])(a0);

var _mono_aot_System_Diagnostics_StackTrace_get_method = Module["_mono_aot_System_Diagnostics_StackTrace_get_method"] = a0 => (_mono_aot_System_Diagnostics_StackTrace_get_method = Module["_mono_aot_System_Diagnostics_StackTrace_get_method"] = wasmExports["mono_aot_System_Diagnostics_StackTrace_get_method"])(a0);

var _mono_aot_System_Diagnostics_TextWriterTraceListener_get_method = Module["_mono_aot_System_Diagnostics_TextWriterTraceListener_get_method"] = a0 => (_mono_aot_System_Diagnostics_TextWriterTraceListener_get_method = Module["_mono_aot_System_Diagnostics_TextWriterTraceListener_get_method"] = wasmExports["mono_aot_System_Diagnostics_TextWriterTraceListener_get_method"])(a0);

var _mono_aot_System_Diagnostics_Tools_get_method = Module["_mono_aot_System_Diagnostics_Tools_get_method"] = a0 => (_mono_aot_System_Diagnostics_Tools_get_method = Module["_mono_aot_System_Diagnostics_Tools_get_method"] = wasmExports["mono_aot_System_Diagnostics_Tools_get_method"])(a0);

var _mono_aot_System_Diagnostics_TraceSource_get_method = Module["_mono_aot_System_Diagnostics_TraceSource_get_method"] = a0 => (_mono_aot_System_Diagnostics_TraceSource_get_method = Module["_mono_aot_System_Diagnostics_TraceSource_get_method"] = wasmExports["mono_aot_System_Diagnostics_TraceSource_get_method"])(a0);

var _mono_aot_System_Diagnostics_Tracing_get_method = Module["_mono_aot_System_Diagnostics_Tracing_get_method"] = a0 => (_mono_aot_System_Diagnostics_Tracing_get_method = Module["_mono_aot_System_Diagnostics_Tracing_get_method"] = wasmExports["mono_aot_System_Diagnostics_Tracing_get_method"])(a0);

var _mono_aot_System_Drawing_Primitives_get_method = Module["_mono_aot_System_Drawing_Primitives_get_method"] = a0 => (_mono_aot_System_Drawing_Primitives_get_method = Module["_mono_aot_System_Drawing_Primitives_get_method"] = wasmExports["mono_aot_System_Drawing_Primitives_get_method"])(a0);

var _mono_aot_System_Drawing_get_method = Module["_mono_aot_System_Drawing_get_method"] = a0 => (_mono_aot_System_Drawing_get_method = Module["_mono_aot_System_Drawing_get_method"] = wasmExports["mono_aot_System_Drawing_get_method"])(a0);

var _mono_aot_System_Dynamic_Runtime_get_method = Module["_mono_aot_System_Dynamic_Runtime_get_method"] = a0 => (_mono_aot_System_Dynamic_Runtime_get_method = Module["_mono_aot_System_Dynamic_Runtime_get_method"] = wasmExports["mono_aot_System_Dynamic_Runtime_get_method"])(a0);

var _mono_aot_System_Formats_Asn1_get_method = Module["_mono_aot_System_Formats_Asn1_get_method"] = a0 => (_mono_aot_System_Formats_Asn1_get_method = Module["_mono_aot_System_Formats_Asn1_get_method"] = wasmExports["mono_aot_System_Formats_Asn1_get_method"])(a0);

var _mono_aot_System_Formats_Tar_get_method = Module["_mono_aot_System_Formats_Tar_get_method"] = a0 => (_mono_aot_System_Formats_Tar_get_method = Module["_mono_aot_System_Formats_Tar_get_method"] = wasmExports["mono_aot_System_Formats_Tar_get_method"])(a0);

var _mono_aot_System_Globalization_Calendars_get_method = Module["_mono_aot_System_Globalization_Calendars_get_method"] = a0 => (_mono_aot_System_Globalization_Calendars_get_method = Module["_mono_aot_System_Globalization_Calendars_get_method"] = wasmExports["mono_aot_System_Globalization_Calendars_get_method"])(a0);

var _mono_aot_System_Globalization_Extensions_get_method = Module["_mono_aot_System_Globalization_Extensions_get_method"] = a0 => (_mono_aot_System_Globalization_Extensions_get_method = Module["_mono_aot_System_Globalization_Extensions_get_method"] = wasmExports["mono_aot_System_Globalization_Extensions_get_method"])(a0);

var _mono_aot_System_Globalization_get_method = Module["_mono_aot_System_Globalization_get_method"] = a0 => (_mono_aot_System_Globalization_get_method = Module["_mono_aot_System_Globalization_get_method"] = wasmExports["mono_aot_System_Globalization_get_method"])(a0);

var _mono_aot_System_IO_Compression_Brotli_get_method = Module["_mono_aot_System_IO_Compression_Brotli_get_method"] = a0 => (_mono_aot_System_IO_Compression_Brotli_get_method = Module["_mono_aot_System_IO_Compression_Brotli_get_method"] = wasmExports["mono_aot_System_IO_Compression_Brotli_get_method"])(a0);

var _mono_aot_System_IO_Compression_FileSystem_get_method = Module["_mono_aot_System_IO_Compression_FileSystem_get_method"] = a0 => (_mono_aot_System_IO_Compression_FileSystem_get_method = Module["_mono_aot_System_IO_Compression_FileSystem_get_method"] = wasmExports["mono_aot_System_IO_Compression_FileSystem_get_method"])(a0);

var _mono_aot_System_IO_Compression_ZipFile_get_method = Module["_mono_aot_System_IO_Compression_ZipFile_get_method"] = a0 => (_mono_aot_System_IO_Compression_ZipFile_get_method = Module["_mono_aot_System_IO_Compression_ZipFile_get_method"] = wasmExports["mono_aot_System_IO_Compression_ZipFile_get_method"])(a0);

var _mono_aot_System_IO_Compression_get_method = Module["_mono_aot_System_IO_Compression_get_method"] = a0 => (_mono_aot_System_IO_Compression_get_method = Module["_mono_aot_System_IO_Compression_get_method"] = wasmExports["mono_aot_System_IO_Compression_get_method"])(a0);

var _mono_aot_System_IO_FileSystem_AccessControl_get_method = Module["_mono_aot_System_IO_FileSystem_AccessControl_get_method"] = a0 => (_mono_aot_System_IO_FileSystem_AccessControl_get_method = Module["_mono_aot_System_IO_FileSystem_AccessControl_get_method"] = wasmExports["mono_aot_System_IO_FileSystem_AccessControl_get_method"])(a0);

var _mono_aot_System_IO_FileSystem_DriveInfo_get_method = Module["_mono_aot_System_IO_FileSystem_DriveInfo_get_method"] = a0 => (_mono_aot_System_IO_FileSystem_DriveInfo_get_method = Module["_mono_aot_System_IO_FileSystem_DriveInfo_get_method"] = wasmExports["mono_aot_System_IO_FileSystem_DriveInfo_get_method"])(a0);

var _mono_aot_System_IO_FileSystem_Primitives_get_method = Module["_mono_aot_System_IO_FileSystem_Primitives_get_method"] = a0 => (_mono_aot_System_IO_FileSystem_Primitives_get_method = Module["_mono_aot_System_IO_FileSystem_Primitives_get_method"] = wasmExports["mono_aot_System_IO_FileSystem_Primitives_get_method"])(a0);

var _mono_aot_System_IO_FileSystem_Watcher_get_method = Module["_mono_aot_System_IO_FileSystem_Watcher_get_method"] = a0 => (_mono_aot_System_IO_FileSystem_Watcher_get_method = Module["_mono_aot_System_IO_FileSystem_Watcher_get_method"] = wasmExports["mono_aot_System_IO_FileSystem_Watcher_get_method"])(a0);

var _mono_aot_System_IO_FileSystem_get_method = Module["_mono_aot_System_IO_FileSystem_get_method"] = a0 => (_mono_aot_System_IO_FileSystem_get_method = Module["_mono_aot_System_IO_FileSystem_get_method"] = wasmExports["mono_aot_System_IO_FileSystem_get_method"])(a0);

var _mono_aot_System_IO_IsolatedStorage_get_method = Module["_mono_aot_System_IO_IsolatedStorage_get_method"] = a0 => (_mono_aot_System_IO_IsolatedStorage_get_method = Module["_mono_aot_System_IO_IsolatedStorage_get_method"] = wasmExports["mono_aot_System_IO_IsolatedStorage_get_method"])(a0);

var _mono_aot_System_IO_MemoryMappedFiles_get_method = Module["_mono_aot_System_IO_MemoryMappedFiles_get_method"] = a0 => (_mono_aot_System_IO_MemoryMappedFiles_get_method = Module["_mono_aot_System_IO_MemoryMappedFiles_get_method"] = wasmExports["mono_aot_System_IO_MemoryMappedFiles_get_method"])(a0);

var _mono_aot_System_IO_Pipelines_get_method = Module["_mono_aot_System_IO_Pipelines_get_method"] = a0 => (_mono_aot_System_IO_Pipelines_get_method = Module["_mono_aot_System_IO_Pipelines_get_method"] = wasmExports["mono_aot_System_IO_Pipelines_get_method"])(a0);

var _mono_aot_System_IO_Pipes_AccessControl_get_method = Module["_mono_aot_System_IO_Pipes_AccessControl_get_method"] = a0 => (_mono_aot_System_IO_Pipes_AccessControl_get_method = Module["_mono_aot_System_IO_Pipes_AccessControl_get_method"] = wasmExports["mono_aot_System_IO_Pipes_AccessControl_get_method"])(a0);

var _mono_aot_System_IO_Pipes_get_method = Module["_mono_aot_System_IO_Pipes_get_method"] = a0 => (_mono_aot_System_IO_Pipes_get_method = Module["_mono_aot_System_IO_Pipes_get_method"] = wasmExports["mono_aot_System_IO_Pipes_get_method"])(a0);

var _mono_aot_System_IO_UnmanagedMemoryStream_get_method = Module["_mono_aot_System_IO_UnmanagedMemoryStream_get_method"] = a0 => (_mono_aot_System_IO_UnmanagedMemoryStream_get_method = Module["_mono_aot_System_IO_UnmanagedMemoryStream_get_method"] = wasmExports["mono_aot_System_IO_UnmanagedMemoryStream_get_method"])(a0);

var _mono_aot_System_IO_get_method = Module["_mono_aot_System_IO_get_method"] = a0 => (_mono_aot_System_IO_get_method = Module["_mono_aot_System_IO_get_method"] = wasmExports["mono_aot_System_IO_get_method"])(a0);

var _mono_aot_System_Linq_AsyncEnumerable_get_method = Module["_mono_aot_System_Linq_AsyncEnumerable_get_method"] = a0 => (_mono_aot_System_Linq_AsyncEnumerable_get_method = Module["_mono_aot_System_Linq_AsyncEnumerable_get_method"] = wasmExports["mono_aot_System_Linq_AsyncEnumerable_get_method"])(a0);

var _mono_aot_System_Linq_Expressions_get_method = Module["_mono_aot_System_Linq_Expressions_get_method"] = a0 => (_mono_aot_System_Linq_Expressions_get_method = Module["_mono_aot_System_Linq_Expressions_get_method"] = wasmExports["mono_aot_System_Linq_Expressions_get_method"])(a0);

var _mono_aot_System_Linq_Parallel_get_method = Module["_mono_aot_System_Linq_Parallel_get_method"] = a0 => (_mono_aot_System_Linq_Parallel_get_method = Module["_mono_aot_System_Linq_Parallel_get_method"] = wasmExports["mono_aot_System_Linq_Parallel_get_method"])(a0);

var _mono_aot_System_Linq_Queryable_get_method = Module["_mono_aot_System_Linq_Queryable_get_method"] = a0 => (_mono_aot_System_Linq_Queryable_get_method = Module["_mono_aot_System_Linq_Queryable_get_method"] = wasmExports["mono_aot_System_Linq_Queryable_get_method"])(a0);

var _mono_aot_System_Linq_get_method = Module["_mono_aot_System_Linq_get_method"] = a0 => (_mono_aot_System_Linq_get_method = Module["_mono_aot_System_Linq_get_method"] = wasmExports["mono_aot_System_Linq_get_method"])(a0);

var _mono_aot_System_Memory_get_method = Module["_mono_aot_System_Memory_get_method"] = a0 => (_mono_aot_System_Memory_get_method = Module["_mono_aot_System_Memory_get_method"] = wasmExports["mono_aot_System_Memory_get_method"])(a0);

var _mono_aot_System_Net_Http_Json_get_method = Module["_mono_aot_System_Net_Http_Json_get_method"] = a0 => (_mono_aot_System_Net_Http_Json_get_method = Module["_mono_aot_System_Net_Http_Json_get_method"] = wasmExports["mono_aot_System_Net_Http_Json_get_method"])(a0);

var _mono_aot_System_Net_Http_get_method = Module["_mono_aot_System_Net_Http_get_method"] = a0 => (_mono_aot_System_Net_Http_get_method = Module["_mono_aot_System_Net_Http_get_method"] = wasmExports["mono_aot_System_Net_Http_get_method"])(a0);

var _mono_aot_System_Net_HttpListener_get_method = Module["_mono_aot_System_Net_HttpListener_get_method"] = a0 => (_mono_aot_System_Net_HttpListener_get_method = Module["_mono_aot_System_Net_HttpListener_get_method"] = wasmExports["mono_aot_System_Net_HttpListener_get_method"])(a0);

var _mono_aot_System_Net_Mail_get_method = Module["_mono_aot_System_Net_Mail_get_method"] = a0 => (_mono_aot_System_Net_Mail_get_method = Module["_mono_aot_System_Net_Mail_get_method"] = wasmExports["mono_aot_System_Net_Mail_get_method"])(a0);

var _mono_aot_System_Net_NameResolution_get_method = Module["_mono_aot_System_Net_NameResolution_get_method"] = a0 => (_mono_aot_System_Net_NameResolution_get_method = Module["_mono_aot_System_Net_NameResolution_get_method"] = wasmExports["mono_aot_System_Net_NameResolution_get_method"])(a0);

var _mono_aot_System_Net_NetworkInformation_get_method = Module["_mono_aot_System_Net_NetworkInformation_get_method"] = a0 => (_mono_aot_System_Net_NetworkInformation_get_method = Module["_mono_aot_System_Net_NetworkInformation_get_method"] = wasmExports["mono_aot_System_Net_NetworkInformation_get_method"])(a0);

var _mono_aot_System_Net_Ping_get_method = Module["_mono_aot_System_Net_Ping_get_method"] = a0 => (_mono_aot_System_Net_Ping_get_method = Module["_mono_aot_System_Net_Ping_get_method"] = wasmExports["mono_aot_System_Net_Ping_get_method"])(a0);

var _mono_aot_System_Net_Primitives_get_method = Module["_mono_aot_System_Net_Primitives_get_method"] = a0 => (_mono_aot_System_Net_Primitives_get_method = Module["_mono_aot_System_Net_Primitives_get_method"] = wasmExports["mono_aot_System_Net_Primitives_get_method"])(a0);

var _mono_aot_System_Net_Quic_get_method = Module["_mono_aot_System_Net_Quic_get_method"] = a0 => (_mono_aot_System_Net_Quic_get_method = Module["_mono_aot_System_Net_Quic_get_method"] = wasmExports["mono_aot_System_Net_Quic_get_method"])(a0);

var _mono_aot_System_Net_Requests_get_method = Module["_mono_aot_System_Net_Requests_get_method"] = a0 => (_mono_aot_System_Net_Requests_get_method = Module["_mono_aot_System_Net_Requests_get_method"] = wasmExports["mono_aot_System_Net_Requests_get_method"])(a0);

var _mono_aot_System_Net_Security_get_method = Module["_mono_aot_System_Net_Security_get_method"] = a0 => (_mono_aot_System_Net_Security_get_method = Module["_mono_aot_System_Net_Security_get_method"] = wasmExports["mono_aot_System_Net_Security_get_method"])(a0);

var _mono_aot_System_Net_ServerSentEvents_get_method = Module["_mono_aot_System_Net_ServerSentEvents_get_method"] = a0 => (_mono_aot_System_Net_ServerSentEvents_get_method = Module["_mono_aot_System_Net_ServerSentEvents_get_method"] = wasmExports["mono_aot_System_Net_ServerSentEvents_get_method"])(a0);

var _mono_aot_System_Net_ServicePoint_get_method = Module["_mono_aot_System_Net_ServicePoint_get_method"] = a0 => (_mono_aot_System_Net_ServicePoint_get_method = Module["_mono_aot_System_Net_ServicePoint_get_method"] = wasmExports["mono_aot_System_Net_ServicePoint_get_method"])(a0);

var _mono_aot_System_Net_Sockets_get_method = Module["_mono_aot_System_Net_Sockets_get_method"] = a0 => (_mono_aot_System_Net_Sockets_get_method = Module["_mono_aot_System_Net_Sockets_get_method"] = wasmExports["mono_aot_System_Net_Sockets_get_method"])(a0);

var _mono_aot_System_Net_WebClient_get_method = Module["_mono_aot_System_Net_WebClient_get_method"] = a0 => (_mono_aot_System_Net_WebClient_get_method = Module["_mono_aot_System_Net_WebClient_get_method"] = wasmExports["mono_aot_System_Net_WebClient_get_method"])(a0);

var _mono_aot_System_Net_WebHeaderCollection_get_method = Module["_mono_aot_System_Net_WebHeaderCollection_get_method"] = a0 => (_mono_aot_System_Net_WebHeaderCollection_get_method = Module["_mono_aot_System_Net_WebHeaderCollection_get_method"] = wasmExports["mono_aot_System_Net_WebHeaderCollection_get_method"])(a0);

var _mono_aot_System_Net_WebProxy_get_method = Module["_mono_aot_System_Net_WebProxy_get_method"] = a0 => (_mono_aot_System_Net_WebProxy_get_method = Module["_mono_aot_System_Net_WebProxy_get_method"] = wasmExports["mono_aot_System_Net_WebProxy_get_method"])(a0);

var _mono_aot_System_Net_WebSockets_Client_get_method = Module["_mono_aot_System_Net_WebSockets_Client_get_method"] = a0 => (_mono_aot_System_Net_WebSockets_Client_get_method = Module["_mono_aot_System_Net_WebSockets_Client_get_method"] = wasmExports["mono_aot_System_Net_WebSockets_Client_get_method"])(a0);

var _mono_aot_System_Net_WebSockets_get_method = Module["_mono_aot_System_Net_WebSockets_get_method"] = a0 => (_mono_aot_System_Net_WebSockets_get_method = Module["_mono_aot_System_Net_WebSockets_get_method"] = wasmExports["mono_aot_System_Net_WebSockets_get_method"])(a0);

var _mono_aot_System_Net_get_method = Module["_mono_aot_System_Net_get_method"] = a0 => (_mono_aot_System_Net_get_method = Module["_mono_aot_System_Net_get_method"] = wasmExports["mono_aot_System_Net_get_method"])(a0);

var _mono_aot_System_Numerics_Vectors_get_method = Module["_mono_aot_System_Numerics_Vectors_get_method"] = a0 => (_mono_aot_System_Numerics_Vectors_get_method = Module["_mono_aot_System_Numerics_Vectors_get_method"] = wasmExports["mono_aot_System_Numerics_Vectors_get_method"])(a0);

var _mono_aot_System_Numerics_get_method = Module["_mono_aot_System_Numerics_get_method"] = a0 => (_mono_aot_System_Numerics_get_method = Module["_mono_aot_System_Numerics_get_method"] = wasmExports["mono_aot_System_Numerics_get_method"])(a0);

var _mono_aot_System_ObjectModel_get_method = Module["_mono_aot_System_ObjectModel_get_method"] = a0 => (_mono_aot_System_ObjectModel_get_method = Module["_mono_aot_System_ObjectModel_get_method"] = wasmExports["mono_aot_System_ObjectModel_get_method"])(a0);

var _mono_aot_System_Private_DataContractSerialization_get_method = Module["_mono_aot_System_Private_DataContractSerialization_get_method"] = a0 => (_mono_aot_System_Private_DataContractSerialization_get_method = Module["_mono_aot_System_Private_DataContractSerialization_get_method"] = wasmExports["mono_aot_System_Private_DataContractSerialization_get_method"])(a0);

var _mono_aot_System_Private_Uri_get_method = Module["_mono_aot_System_Private_Uri_get_method"] = a0 => (_mono_aot_System_Private_Uri_get_method = Module["_mono_aot_System_Private_Uri_get_method"] = wasmExports["mono_aot_System_Private_Uri_get_method"])(a0);

var _mono_aot_System_Private_Xml_Linq_get_method = Module["_mono_aot_System_Private_Xml_Linq_get_method"] = a0 => (_mono_aot_System_Private_Xml_Linq_get_method = Module["_mono_aot_System_Private_Xml_Linq_get_method"] = wasmExports["mono_aot_System_Private_Xml_Linq_get_method"])(a0);

var _mono_aot_System_Private_Xml_get_method = Module["_mono_aot_System_Private_Xml_get_method"] = a0 => (_mono_aot_System_Private_Xml_get_method = Module["_mono_aot_System_Private_Xml_get_method"] = wasmExports["mono_aot_System_Private_Xml_get_method"])(a0);

var _mono_aot_System_Reflection_DispatchProxy_get_method = Module["_mono_aot_System_Reflection_DispatchProxy_get_method"] = a0 => (_mono_aot_System_Reflection_DispatchProxy_get_method = Module["_mono_aot_System_Reflection_DispatchProxy_get_method"] = wasmExports["mono_aot_System_Reflection_DispatchProxy_get_method"])(a0);

var _mono_aot_System_Reflection_Emit_ILGeneration_get_method = Module["_mono_aot_System_Reflection_Emit_ILGeneration_get_method"] = a0 => (_mono_aot_System_Reflection_Emit_ILGeneration_get_method = Module["_mono_aot_System_Reflection_Emit_ILGeneration_get_method"] = wasmExports["mono_aot_System_Reflection_Emit_ILGeneration_get_method"])(a0);

var _mono_aot_System_Reflection_Emit_Lightweight_get_method = Module["_mono_aot_System_Reflection_Emit_Lightweight_get_method"] = a0 => (_mono_aot_System_Reflection_Emit_Lightweight_get_method = Module["_mono_aot_System_Reflection_Emit_Lightweight_get_method"] = wasmExports["mono_aot_System_Reflection_Emit_Lightweight_get_method"])(a0);

var _mono_aot_System_Reflection_Emit_get_method = Module["_mono_aot_System_Reflection_Emit_get_method"] = a0 => (_mono_aot_System_Reflection_Emit_get_method = Module["_mono_aot_System_Reflection_Emit_get_method"] = wasmExports["mono_aot_System_Reflection_Emit_get_method"])(a0);

var _mono_aot_System_Reflection_Extensions_get_method = Module["_mono_aot_System_Reflection_Extensions_get_method"] = a0 => (_mono_aot_System_Reflection_Extensions_get_method = Module["_mono_aot_System_Reflection_Extensions_get_method"] = wasmExports["mono_aot_System_Reflection_Extensions_get_method"])(a0);

var _mono_aot_System_Reflection_Metadata_get_method = Module["_mono_aot_System_Reflection_Metadata_get_method"] = a0 => (_mono_aot_System_Reflection_Metadata_get_method = Module["_mono_aot_System_Reflection_Metadata_get_method"] = wasmExports["mono_aot_System_Reflection_Metadata_get_method"])(a0);

var _mono_aot_System_Reflection_Primitives_get_method = Module["_mono_aot_System_Reflection_Primitives_get_method"] = a0 => (_mono_aot_System_Reflection_Primitives_get_method = Module["_mono_aot_System_Reflection_Primitives_get_method"] = wasmExports["mono_aot_System_Reflection_Primitives_get_method"])(a0);

var _mono_aot_System_Reflection_TypeExtensions_get_method = Module["_mono_aot_System_Reflection_TypeExtensions_get_method"] = a0 => (_mono_aot_System_Reflection_TypeExtensions_get_method = Module["_mono_aot_System_Reflection_TypeExtensions_get_method"] = wasmExports["mono_aot_System_Reflection_TypeExtensions_get_method"])(a0);

var _mono_aot_System_Reflection_get_method = Module["_mono_aot_System_Reflection_get_method"] = a0 => (_mono_aot_System_Reflection_get_method = Module["_mono_aot_System_Reflection_get_method"] = wasmExports["mono_aot_System_Reflection_get_method"])(a0);

var _mono_aot_System_Resources_Reader_get_method = Module["_mono_aot_System_Resources_Reader_get_method"] = a0 => (_mono_aot_System_Resources_Reader_get_method = Module["_mono_aot_System_Resources_Reader_get_method"] = wasmExports["mono_aot_System_Resources_Reader_get_method"])(a0);

var _mono_aot_System_Resources_ResourceManager_get_method = Module["_mono_aot_System_Resources_ResourceManager_get_method"] = a0 => (_mono_aot_System_Resources_ResourceManager_get_method = Module["_mono_aot_System_Resources_ResourceManager_get_method"] = wasmExports["mono_aot_System_Resources_ResourceManager_get_method"])(a0);

var _mono_aot_System_Resources_Writer_get_method = Module["_mono_aot_System_Resources_Writer_get_method"] = a0 => (_mono_aot_System_Resources_Writer_get_method = Module["_mono_aot_System_Resources_Writer_get_method"] = wasmExports["mono_aot_System_Resources_Writer_get_method"])(a0);

var _mono_aot_System_Runtime_CompilerServices_Unsafe_get_method = Module["_mono_aot_System_Runtime_CompilerServices_Unsafe_get_method"] = a0 => (_mono_aot_System_Runtime_CompilerServices_Unsafe_get_method = Module["_mono_aot_System_Runtime_CompilerServices_Unsafe_get_method"] = wasmExports["mono_aot_System_Runtime_CompilerServices_Unsafe_get_method"])(a0);

var _mono_aot_System_Runtime_CompilerServices_VisualC_get_method = Module["_mono_aot_System_Runtime_CompilerServices_VisualC_get_method"] = a0 => (_mono_aot_System_Runtime_CompilerServices_VisualC_get_method = Module["_mono_aot_System_Runtime_CompilerServices_VisualC_get_method"] = wasmExports["mono_aot_System_Runtime_CompilerServices_VisualC_get_method"])(a0);

var _mono_aot_System_Runtime_Extensions_get_method = Module["_mono_aot_System_Runtime_Extensions_get_method"] = a0 => (_mono_aot_System_Runtime_Extensions_get_method = Module["_mono_aot_System_Runtime_Extensions_get_method"] = wasmExports["mono_aot_System_Runtime_Extensions_get_method"])(a0);

var _mono_aot_System_Runtime_Handles_get_method = Module["_mono_aot_System_Runtime_Handles_get_method"] = a0 => (_mono_aot_System_Runtime_Handles_get_method = Module["_mono_aot_System_Runtime_Handles_get_method"] = wasmExports["mono_aot_System_Runtime_Handles_get_method"])(a0);

var _mono_aot_System_Runtime_InteropServices_JavaScript_get_method = Module["_mono_aot_System_Runtime_InteropServices_JavaScript_get_method"] = a0 => (_mono_aot_System_Runtime_InteropServices_JavaScript_get_method = Module["_mono_aot_System_Runtime_InteropServices_JavaScript_get_method"] = wasmExports["mono_aot_System_Runtime_InteropServices_JavaScript_get_method"])(a0);

var _mono_aot_System_Runtime_InteropServices_RuntimeInformation_get_method = Module["_mono_aot_System_Runtime_InteropServices_RuntimeInformation_get_method"] = a0 => (_mono_aot_System_Runtime_InteropServices_RuntimeInformation_get_method = Module["_mono_aot_System_Runtime_InteropServices_RuntimeInformation_get_method"] = wasmExports["mono_aot_System_Runtime_InteropServices_RuntimeInformation_get_method"])(a0);

var _mono_aot_System_Runtime_InteropServices_get_method = Module["_mono_aot_System_Runtime_InteropServices_get_method"] = a0 => (_mono_aot_System_Runtime_InteropServices_get_method = Module["_mono_aot_System_Runtime_InteropServices_get_method"] = wasmExports["mono_aot_System_Runtime_InteropServices_get_method"])(a0);

var _mono_aot_System_Runtime_Intrinsics_get_method = Module["_mono_aot_System_Runtime_Intrinsics_get_method"] = a0 => (_mono_aot_System_Runtime_Intrinsics_get_method = Module["_mono_aot_System_Runtime_Intrinsics_get_method"] = wasmExports["mono_aot_System_Runtime_Intrinsics_get_method"])(a0);

var _mono_aot_System_Runtime_Loader_get_method = Module["_mono_aot_System_Runtime_Loader_get_method"] = a0 => (_mono_aot_System_Runtime_Loader_get_method = Module["_mono_aot_System_Runtime_Loader_get_method"] = wasmExports["mono_aot_System_Runtime_Loader_get_method"])(a0);

var _log10 = Module["_log10"] = a0 => (_log10 = Module["_log10"] = wasmExports["log10"])(a0);

var _mono_aot_System_Runtime_Numerics_get_method = Module["_mono_aot_System_Runtime_Numerics_get_method"] = a0 => (_mono_aot_System_Runtime_Numerics_get_method = Module["_mono_aot_System_Runtime_Numerics_get_method"] = wasmExports["mono_aot_System_Runtime_Numerics_get_method"])(a0);

var _mono_aot_System_Runtime_Serialization_Formatters_get_method = Module["_mono_aot_System_Runtime_Serialization_Formatters_get_method"] = a0 => (_mono_aot_System_Runtime_Serialization_Formatters_get_method = Module["_mono_aot_System_Runtime_Serialization_Formatters_get_method"] = wasmExports["mono_aot_System_Runtime_Serialization_Formatters_get_method"])(a0);

var _mono_aot_System_Runtime_Serialization_Json_get_method = Module["_mono_aot_System_Runtime_Serialization_Json_get_method"] = a0 => (_mono_aot_System_Runtime_Serialization_Json_get_method = Module["_mono_aot_System_Runtime_Serialization_Json_get_method"] = wasmExports["mono_aot_System_Runtime_Serialization_Json_get_method"])(a0);

var _mono_aot_System_Runtime_Serialization_Primitives_get_method = Module["_mono_aot_System_Runtime_Serialization_Primitives_get_method"] = a0 => (_mono_aot_System_Runtime_Serialization_Primitives_get_method = Module["_mono_aot_System_Runtime_Serialization_Primitives_get_method"] = wasmExports["mono_aot_System_Runtime_Serialization_Primitives_get_method"])(a0);

var _mono_aot_System_Runtime_Serialization_Xml_get_method = Module["_mono_aot_System_Runtime_Serialization_Xml_get_method"] = a0 => (_mono_aot_System_Runtime_Serialization_Xml_get_method = Module["_mono_aot_System_Runtime_Serialization_Xml_get_method"] = wasmExports["mono_aot_System_Runtime_Serialization_Xml_get_method"])(a0);

var _mono_aot_System_Runtime_Serialization_get_method = Module["_mono_aot_System_Runtime_Serialization_get_method"] = a0 => (_mono_aot_System_Runtime_Serialization_get_method = Module["_mono_aot_System_Runtime_Serialization_get_method"] = wasmExports["mono_aot_System_Runtime_Serialization_get_method"])(a0);

var _mono_aot_System_Runtime_get_method = Module["_mono_aot_System_Runtime_get_method"] = a0 => (_mono_aot_System_Runtime_get_method = Module["_mono_aot_System_Runtime_get_method"] = wasmExports["mono_aot_System_Runtime_get_method"])(a0);

var _mono_aot_System_Security_AccessControl_get_method = Module["_mono_aot_System_Security_AccessControl_get_method"] = a0 => (_mono_aot_System_Security_AccessControl_get_method = Module["_mono_aot_System_Security_AccessControl_get_method"] = wasmExports["mono_aot_System_Security_AccessControl_get_method"])(a0);

var _mono_aot_System_Security_Claims_get_method = Module["_mono_aot_System_Security_Claims_get_method"] = a0 => (_mono_aot_System_Security_Claims_get_method = Module["_mono_aot_System_Security_Claims_get_method"] = wasmExports["mono_aot_System_Security_Claims_get_method"])(a0);

var _mono_aot_System_Security_Cryptography_Algorithms_get_method = Module["_mono_aot_System_Security_Cryptography_Algorithms_get_method"] = a0 => (_mono_aot_System_Security_Cryptography_Algorithms_get_method = Module["_mono_aot_System_Security_Cryptography_Algorithms_get_method"] = wasmExports["mono_aot_System_Security_Cryptography_Algorithms_get_method"])(a0);

var _mono_aot_System_Security_Cryptography_Cng_get_method = Module["_mono_aot_System_Security_Cryptography_Cng_get_method"] = a0 => (_mono_aot_System_Security_Cryptography_Cng_get_method = Module["_mono_aot_System_Security_Cryptography_Cng_get_method"] = wasmExports["mono_aot_System_Security_Cryptography_Cng_get_method"])(a0);

var _mono_aot_System_Security_Cryptography_Csp_get_method = Module["_mono_aot_System_Security_Cryptography_Csp_get_method"] = a0 => (_mono_aot_System_Security_Cryptography_Csp_get_method = Module["_mono_aot_System_Security_Cryptography_Csp_get_method"] = wasmExports["mono_aot_System_Security_Cryptography_Csp_get_method"])(a0);

var _mono_aot_System_Security_Cryptography_Encoding_get_method = Module["_mono_aot_System_Security_Cryptography_Encoding_get_method"] = a0 => (_mono_aot_System_Security_Cryptography_Encoding_get_method = Module["_mono_aot_System_Security_Cryptography_Encoding_get_method"] = wasmExports["mono_aot_System_Security_Cryptography_Encoding_get_method"])(a0);

var _mono_aot_System_Security_Cryptography_OpenSsl_get_method = Module["_mono_aot_System_Security_Cryptography_OpenSsl_get_method"] = a0 => (_mono_aot_System_Security_Cryptography_OpenSsl_get_method = Module["_mono_aot_System_Security_Cryptography_OpenSsl_get_method"] = wasmExports["mono_aot_System_Security_Cryptography_OpenSsl_get_method"])(a0);

var _mono_aot_System_Security_Cryptography_Primitives_get_method = Module["_mono_aot_System_Security_Cryptography_Primitives_get_method"] = a0 => (_mono_aot_System_Security_Cryptography_Primitives_get_method = Module["_mono_aot_System_Security_Cryptography_Primitives_get_method"] = wasmExports["mono_aot_System_Security_Cryptography_Primitives_get_method"])(a0);

var _mono_aot_System_Security_Cryptography_X509Certificates_get_method = Module["_mono_aot_System_Security_Cryptography_X509Certificates_get_method"] = a0 => (_mono_aot_System_Security_Cryptography_X509Certificates_get_method = Module["_mono_aot_System_Security_Cryptography_X509Certificates_get_method"] = wasmExports["mono_aot_System_Security_Cryptography_X509Certificates_get_method"])(a0);

var _mono_aot_System_Security_Cryptography_get_method = Module["_mono_aot_System_Security_Cryptography_get_method"] = a0 => (_mono_aot_System_Security_Cryptography_get_method = Module["_mono_aot_System_Security_Cryptography_get_method"] = wasmExports["mono_aot_System_Security_Cryptography_get_method"])(a0);

var _mono_aot_System_Security_Principal_Windows_get_method = Module["_mono_aot_System_Security_Principal_Windows_get_method"] = a0 => (_mono_aot_System_Security_Principal_Windows_get_method = Module["_mono_aot_System_Security_Principal_Windows_get_method"] = wasmExports["mono_aot_System_Security_Principal_Windows_get_method"])(a0);

var _mono_aot_System_Security_Principal_get_method = Module["_mono_aot_System_Security_Principal_get_method"] = a0 => (_mono_aot_System_Security_Principal_get_method = Module["_mono_aot_System_Security_Principal_get_method"] = wasmExports["mono_aot_System_Security_Principal_get_method"])(a0);

var _mono_aot_System_Security_SecureString_get_method = Module["_mono_aot_System_Security_SecureString_get_method"] = a0 => (_mono_aot_System_Security_SecureString_get_method = Module["_mono_aot_System_Security_SecureString_get_method"] = wasmExports["mono_aot_System_Security_SecureString_get_method"])(a0);

var _mono_aot_System_Security_get_method = Module["_mono_aot_System_Security_get_method"] = a0 => (_mono_aot_System_Security_get_method = Module["_mono_aot_System_Security_get_method"] = wasmExports["mono_aot_System_Security_get_method"])(a0);

var _mono_aot_System_ServiceModel_Web_get_method = Module["_mono_aot_System_ServiceModel_Web_get_method"] = a0 => (_mono_aot_System_ServiceModel_Web_get_method = Module["_mono_aot_System_ServiceModel_Web_get_method"] = wasmExports["mono_aot_System_ServiceModel_Web_get_method"])(a0);

var _mono_aot_System_ServiceProcess_get_method = Module["_mono_aot_System_ServiceProcess_get_method"] = a0 => (_mono_aot_System_ServiceProcess_get_method = Module["_mono_aot_System_ServiceProcess_get_method"] = wasmExports["mono_aot_System_ServiceProcess_get_method"])(a0);

var _mono_aot_System_Text_Encoding_CodePages_get_method = Module["_mono_aot_System_Text_Encoding_CodePages_get_method"] = a0 => (_mono_aot_System_Text_Encoding_CodePages_get_method = Module["_mono_aot_System_Text_Encoding_CodePages_get_method"] = wasmExports["mono_aot_System_Text_Encoding_CodePages_get_method"])(a0);

var _mono_aot_System_Text_Encoding_Extensions_get_method = Module["_mono_aot_System_Text_Encoding_Extensions_get_method"] = a0 => (_mono_aot_System_Text_Encoding_Extensions_get_method = Module["_mono_aot_System_Text_Encoding_Extensions_get_method"] = wasmExports["mono_aot_System_Text_Encoding_Extensions_get_method"])(a0);

var _mono_aot_System_Text_Encoding_get_method = Module["_mono_aot_System_Text_Encoding_get_method"] = a0 => (_mono_aot_System_Text_Encoding_get_method = Module["_mono_aot_System_Text_Encoding_get_method"] = wasmExports["mono_aot_System_Text_Encoding_get_method"])(a0);

var _mono_aot_System_Text_Encodings_Web_get_method = Module["_mono_aot_System_Text_Encodings_Web_get_method"] = a0 => (_mono_aot_System_Text_Encodings_Web_get_method = Module["_mono_aot_System_Text_Encodings_Web_get_method"] = wasmExports["mono_aot_System_Text_Encodings_Web_get_method"])(a0);

var _mono_aot_System_Text_Json_get_method = Module["_mono_aot_System_Text_Json_get_method"] = a0 => (_mono_aot_System_Text_Json_get_method = Module["_mono_aot_System_Text_Json_get_method"] = wasmExports["mono_aot_System_Text_Json_get_method"])(a0);

var _mono_aot_System_Text_RegularExpressions_get_method = Module["_mono_aot_System_Text_RegularExpressions_get_method"] = a0 => (_mono_aot_System_Text_RegularExpressions_get_method = Module["_mono_aot_System_Text_RegularExpressions_get_method"] = wasmExports["mono_aot_System_Text_RegularExpressions_get_method"])(a0);

var _mono_aot_System_Threading_AccessControl_get_method = Module["_mono_aot_System_Threading_AccessControl_get_method"] = a0 => (_mono_aot_System_Threading_AccessControl_get_method = Module["_mono_aot_System_Threading_AccessControl_get_method"] = wasmExports["mono_aot_System_Threading_AccessControl_get_method"])(a0);

var _mono_aot_System_Threading_Channels_get_method = Module["_mono_aot_System_Threading_Channels_get_method"] = a0 => (_mono_aot_System_Threading_Channels_get_method = Module["_mono_aot_System_Threading_Channels_get_method"] = wasmExports["mono_aot_System_Threading_Channels_get_method"])(a0);

var _mono_aot_System_Threading_Overlapped_get_method = Module["_mono_aot_System_Threading_Overlapped_get_method"] = a0 => (_mono_aot_System_Threading_Overlapped_get_method = Module["_mono_aot_System_Threading_Overlapped_get_method"] = wasmExports["mono_aot_System_Threading_Overlapped_get_method"])(a0);

var _mono_aot_System_Threading_Tasks_Dataflow_get_method = Module["_mono_aot_System_Threading_Tasks_Dataflow_get_method"] = a0 => (_mono_aot_System_Threading_Tasks_Dataflow_get_method = Module["_mono_aot_System_Threading_Tasks_Dataflow_get_method"] = wasmExports["mono_aot_System_Threading_Tasks_Dataflow_get_method"])(a0);

var _mono_aot_System_Threading_Tasks_Extensions_get_method = Module["_mono_aot_System_Threading_Tasks_Extensions_get_method"] = a0 => (_mono_aot_System_Threading_Tasks_Extensions_get_method = Module["_mono_aot_System_Threading_Tasks_Extensions_get_method"] = wasmExports["mono_aot_System_Threading_Tasks_Extensions_get_method"])(a0);

var _mono_aot_System_Threading_Tasks_Parallel_get_method = Module["_mono_aot_System_Threading_Tasks_Parallel_get_method"] = a0 => (_mono_aot_System_Threading_Tasks_Parallel_get_method = Module["_mono_aot_System_Threading_Tasks_Parallel_get_method"] = wasmExports["mono_aot_System_Threading_Tasks_Parallel_get_method"])(a0);

var _mono_aot_System_Threading_Tasks_get_method = Module["_mono_aot_System_Threading_Tasks_get_method"] = a0 => (_mono_aot_System_Threading_Tasks_get_method = Module["_mono_aot_System_Threading_Tasks_get_method"] = wasmExports["mono_aot_System_Threading_Tasks_get_method"])(a0);

var _mono_aot_System_Threading_Thread_get_method = Module["_mono_aot_System_Threading_Thread_get_method"] = a0 => (_mono_aot_System_Threading_Thread_get_method = Module["_mono_aot_System_Threading_Thread_get_method"] = wasmExports["mono_aot_System_Threading_Thread_get_method"])(a0);

var _mono_aot_System_Threading_ThreadPool_get_method = Module["_mono_aot_System_Threading_ThreadPool_get_method"] = a0 => (_mono_aot_System_Threading_ThreadPool_get_method = Module["_mono_aot_System_Threading_ThreadPool_get_method"] = wasmExports["mono_aot_System_Threading_ThreadPool_get_method"])(a0);

var _mono_aot_System_Threading_Timer_get_method = Module["_mono_aot_System_Threading_Timer_get_method"] = a0 => (_mono_aot_System_Threading_Timer_get_method = Module["_mono_aot_System_Threading_Timer_get_method"] = wasmExports["mono_aot_System_Threading_Timer_get_method"])(a0);

var _mono_aot_System_Threading_get_method = Module["_mono_aot_System_Threading_get_method"] = a0 => (_mono_aot_System_Threading_get_method = Module["_mono_aot_System_Threading_get_method"] = wasmExports["mono_aot_System_Threading_get_method"])(a0);

var _mono_aot_System_Transactions_Local_get_method = Module["_mono_aot_System_Transactions_Local_get_method"] = a0 => (_mono_aot_System_Transactions_Local_get_method = Module["_mono_aot_System_Transactions_Local_get_method"] = wasmExports["mono_aot_System_Transactions_Local_get_method"])(a0);

var _mono_aot_System_Transactions_get_method = Module["_mono_aot_System_Transactions_get_method"] = a0 => (_mono_aot_System_Transactions_get_method = Module["_mono_aot_System_Transactions_get_method"] = wasmExports["mono_aot_System_Transactions_get_method"])(a0);

var _mono_aot_System_ValueTuple_get_method = Module["_mono_aot_System_ValueTuple_get_method"] = a0 => (_mono_aot_System_ValueTuple_get_method = Module["_mono_aot_System_ValueTuple_get_method"] = wasmExports["mono_aot_System_ValueTuple_get_method"])(a0);

var _mono_aot_System_Web_HttpUtility_get_method = Module["_mono_aot_System_Web_HttpUtility_get_method"] = a0 => (_mono_aot_System_Web_HttpUtility_get_method = Module["_mono_aot_System_Web_HttpUtility_get_method"] = wasmExports["mono_aot_System_Web_HttpUtility_get_method"])(a0);

var _mono_aot_System_Web_get_method = Module["_mono_aot_System_Web_get_method"] = a0 => (_mono_aot_System_Web_get_method = Module["_mono_aot_System_Web_get_method"] = wasmExports["mono_aot_System_Web_get_method"])(a0);

var _mono_aot_System_Windows_get_method = Module["_mono_aot_System_Windows_get_method"] = a0 => (_mono_aot_System_Windows_get_method = Module["_mono_aot_System_Windows_get_method"] = wasmExports["mono_aot_System_Windows_get_method"])(a0);

var _mono_aot_System_Xml_Linq_get_method = Module["_mono_aot_System_Xml_Linq_get_method"] = a0 => (_mono_aot_System_Xml_Linq_get_method = Module["_mono_aot_System_Xml_Linq_get_method"] = wasmExports["mono_aot_System_Xml_Linq_get_method"])(a0);

var _mono_aot_System_Xml_ReaderWriter_get_method = Module["_mono_aot_System_Xml_ReaderWriter_get_method"] = a0 => (_mono_aot_System_Xml_ReaderWriter_get_method = Module["_mono_aot_System_Xml_ReaderWriter_get_method"] = wasmExports["mono_aot_System_Xml_ReaderWriter_get_method"])(a0);

var _mono_aot_System_Xml_Serialization_get_method = Module["_mono_aot_System_Xml_Serialization_get_method"] = a0 => (_mono_aot_System_Xml_Serialization_get_method = Module["_mono_aot_System_Xml_Serialization_get_method"] = wasmExports["mono_aot_System_Xml_Serialization_get_method"])(a0);

var _mono_aot_System_Xml_XDocument_get_method = Module["_mono_aot_System_Xml_XDocument_get_method"] = a0 => (_mono_aot_System_Xml_XDocument_get_method = Module["_mono_aot_System_Xml_XDocument_get_method"] = wasmExports["mono_aot_System_Xml_XDocument_get_method"])(a0);

var _mono_aot_System_Xml_XPath_XDocument_get_method = Module["_mono_aot_System_Xml_XPath_XDocument_get_method"] = a0 => (_mono_aot_System_Xml_XPath_XDocument_get_method = Module["_mono_aot_System_Xml_XPath_XDocument_get_method"] = wasmExports["mono_aot_System_Xml_XPath_XDocument_get_method"])(a0);

var _mono_aot_System_Xml_XPath_get_method = Module["_mono_aot_System_Xml_XPath_get_method"] = a0 => (_mono_aot_System_Xml_XPath_get_method = Module["_mono_aot_System_Xml_XPath_get_method"] = wasmExports["mono_aot_System_Xml_XPath_get_method"])(a0);

var _mono_aot_System_Xml_XmlDocument_get_method = Module["_mono_aot_System_Xml_XmlDocument_get_method"] = a0 => (_mono_aot_System_Xml_XmlDocument_get_method = Module["_mono_aot_System_Xml_XmlDocument_get_method"] = wasmExports["mono_aot_System_Xml_XmlDocument_get_method"])(a0);

var _mono_aot_System_Xml_XmlSerializer_get_method = Module["_mono_aot_System_Xml_XmlSerializer_get_method"] = a0 => (_mono_aot_System_Xml_XmlSerializer_get_method = Module["_mono_aot_System_Xml_XmlSerializer_get_method"] = wasmExports["mono_aot_System_Xml_XmlSerializer_get_method"])(a0);

var _mono_aot_System_Xml_get_method = Module["_mono_aot_System_Xml_get_method"] = a0 => (_mono_aot_System_Xml_get_method = Module["_mono_aot_System_Xml_get_method"] = wasmExports["mono_aot_System_Xml_get_method"])(a0);

var _mono_aot_System_get_method = Module["_mono_aot_System_get_method"] = a0 => (_mono_aot_System_get_method = Module["_mono_aot_System_get_method"] = wasmExports["mono_aot_System_get_method"])(a0);

var _mono_aot_WindowsBase_get_method = Module["_mono_aot_WindowsBase_get_method"] = a0 => (_mono_aot_WindowsBase_get_method = Module["_mono_aot_WindowsBase_get_method"] = wasmExports["mono_aot_WindowsBase_get_method"])(a0);

var _mono_aot_mscorlib_get_method = Module["_mono_aot_mscorlib_get_method"] = a0 => (_mono_aot_mscorlib_get_method = Module["_mono_aot_mscorlib_get_method"] = wasmExports["mono_aot_mscorlib_get_method"])(a0);

var _mono_aot_netstandard_get_method = Module["_mono_aot_netstandard_get_method"] = a0 => (_mono_aot_netstandard_get_method = Module["_mono_aot_netstandard_get_method"] = wasmExports["mono_aot_netstandard_get_method"])(a0);

var _cosf = Module["_cosf"] = a0 => (_cosf = Module["_cosf"] = wasmExports["cosf"])(a0);

var _sinf = Module["_sinf"] = a0 => (_sinf = Module["_sinf"] = wasmExports["sinf"])(a0);

var _fma = Module["_fma"] = (a0, a1, a2) => (_fma = Module["_fma"] = wasmExports["fma"])(a0, a1, a2);

var _log2f = Module["_log2f"] = a0 => (_log2f = Module["_log2f"] = wasmExports["log2f"])(a0);

var _expf = Module["_expf"] = a0 => (_expf = Module["_expf"] = wasmExports["expf"])(a0);

var _powf = Module["_powf"] = (a0, a1) => (_powf = Module["_powf"] = wasmExports["powf"])(a0, a1);

var _fmaf = Module["_fmaf"] = (a0, a1, a2) => (_fmaf = Module["_fmaf"] = wasmExports["fmaf"])(a0, a1, a2);

var _log10f = Module["_log10f"] = a0 => (_log10f = Module["_log10f"] = wasmExports["log10f"])(a0);

var _fmodf = Module["_fmodf"] = (a0, a1) => (_fmodf = Module["_fmodf"] = wasmExports["fmodf"])(a0, a1);

var _mono_aot_corlib_get_method = Module["_mono_aot_corlib_get_method"] = a0 => (_mono_aot_corlib_get_method = Module["_mono_aot_corlib_get_method"] = wasmExports["mono_aot_corlib_get_method"])(a0);

var _mono_aot_AutoMapper_get_method = Module["_mono_aot_AutoMapper_get_method"] = a0 => (_mono_aot_AutoMapper_get_method = Module["_mono_aot_AutoMapper_get_method"] = wasmExports["mono_aot_AutoMapper_get_method"])(a0);

var _mono_aot_DiffPlex_get_method = Module["_mono_aot_DiffPlex_get_method"] = a0 => (_mono_aot_DiffPlex_get_method = Module["_mono_aot_DiffPlex_get_method"] = wasmExports["mono_aot_DiffPlex_get_method"])(a0);

var _mono_aot_HtmlAgilityPack_get_method = Module["_mono_aot_HtmlAgilityPack_get_method"] = a0 => (_mono_aot_HtmlAgilityPack_get_method = Module["_mono_aot_HtmlAgilityPack_get_method"] = wasmExports["mono_aot_HtmlAgilityPack_get_method"])(a0);

var _mono_aot_Humanizer_get_method = Module["_mono_aot_Humanizer_get_method"] = a0 => (_mono_aot_Humanizer_get_method = Module["_mono_aot_Humanizer_get_method"] = wasmExports["mono_aot_Humanizer_get_method"])(a0);

var _mono_aot_JetBrains_Annotations_get_method = Module["_mono_aot_JetBrains_Annotations_get_method"] = a0 => (_mono_aot_JetBrains_Annotations_get_method = Module["_mono_aot_JetBrains_Annotations_get_method"] = wasmExports["mono_aot_JetBrains_Annotations_get_method"])(a0);

var _mono_aot_Markdig_get_method = Module["_mono_aot_Markdig_get_method"] = a0 => (_mono_aot_Markdig_get_method = Module["_mono_aot_Markdig_get_method"] = wasmExports["mono_aot_Markdig_get_method"])(a0);

var _mono_aot_MessagePack_get_method = Module["_mono_aot_MessagePack_get_method"] = a0 => (_mono_aot_MessagePack_get_method = Module["_mono_aot_MessagePack_get_method"] = wasmExports["mono_aot_MessagePack_get_method"])(a0);

var _mono_aot_MessagePack_Annotations_get_method = Module["_mono_aot_MessagePack_Annotations_get_method"] = a0 => (_mono_aot_MessagePack_Annotations_get_method = Module["_mono_aot_MessagePack_Annotations_get_method"] = wasmExports["mono_aot_MessagePack_Annotations_get_method"])(a0);

var _mono_aot_Microsoft_AspNetCore_Connections_Abstractions_get_method = Module["_mono_aot_Microsoft_AspNetCore_Connections_Abstractions_get_method"] = a0 => (_mono_aot_Microsoft_AspNetCore_Connections_Abstractions_get_method = Module["_mono_aot_Microsoft_AspNetCore_Connections_Abstractions_get_method"] = wasmExports["mono_aot_Microsoft_AspNetCore_Connections_Abstractions_get_method"])(a0);

var _mono_aot_Microsoft_AspNetCore_Http_Connections_Client_get_method = Module["_mono_aot_Microsoft_AspNetCore_Http_Connections_Client_get_method"] = a0 => (_mono_aot_Microsoft_AspNetCore_Http_Connections_Client_get_method = Module["_mono_aot_Microsoft_AspNetCore_Http_Connections_Client_get_method"] = wasmExports["mono_aot_Microsoft_AspNetCore_Http_Connections_Client_get_method"])(a0);

var _mono_aot_Microsoft_AspNetCore_Http_Connections_Common_get_method = Module["_mono_aot_Microsoft_AspNetCore_Http_Connections_Common_get_method"] = a0 => (_mono_aot_Microsoft_AspNetCore_Http_Connections_Common_get_method = Module["_mono_aot_Microsoft_AspNetCore_Http_Connections_Common_get_method"] = wasmExports["mono_aot_Microsoft_AspNetCore_Http_Connections_Common_get_method"])(a0);

var _mono_aot_Microsoft_AspNetCore_SignalR_Client_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Client_get_method"] = a0 => (_mono_aot_Microsoft_AspNetCore_SignalR_Client_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Client_get_method"] = wasmExports["mono_aot_Microsoft_AspNetCore_SignalR_Client_get_method"])(a0);

var _mono_aot_Microsoft_AspNetCore_SignalR_Client_Core_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Client_Core_get_method"] = a0 => (_mono_aot_Microsoft_AspNetCore_SignalR_Client_Core_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Client_Core_get_method"] = wasmExports["mono_aot_Microsoft_AspNetCore_SignalR_Client_Core_get_method"])(a0);

var _mono_aot_Microsoft_AspNetCore_SignalR_Common_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Common_get_method"] = a0 => (_mono_aot_Microsoft_AspNetCore_SignalR_Common_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Common_get_method"] = wasmExports["mono_aot_Microsoft_AspNetCore_SignalR_Common_get_method"])(a0);

var _mono_aot_Microsoft_AspNetCore_SignalR_Protocols_Json_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Protocols_Json_get_method"] = a0 => (_mono_aot_Microsoft_AspNetCore_SignalR_Protocols_Json_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Protocols_Json_get_method"] = wasmExports["mono_aot_Microsoft_AspNetCore_SignalR_Protocols_Json_get_method"])(a0);

var _mono_aot_Microsoft_AspNetCore_SignalR_Protocols_MessagePack_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Protocols_MessagePack_get_method"] = a0 => (_mono_aot_Microsoft_AspNetCore_SignalR_Protocols_MessagePack_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Protocols_MessagePack_get_method"] = wasmExports["mono_aot_Microsoft_AspNetCore_SignalR_Protocols_MessagePack_get_method"])(a0);

var _mono_aot_Microsoft_AspNetCore_SignalR_Protocols_NewtonsoftJson_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Protocols_NewtonsoftJson_get_method"] = a0 => (_mono_aot_Microsoft_AspNetCore_SignalR_Protocols_NewtonsoftJson_get_method = Module["_mono_aot_Microsoft_AspNetCore_SignalR_Protocols_NewtonsoftJson_get_method"] = wasmExports["mono_aot_Microsoft_AspNetCore_SignalR_Protocols_NewtonsoftJson_get_method"])(a0);

var _mono_aot_Microsoft_Data_Sqlite_get_method = Module["_mono_aot_Microsoft_Data_Sqlite_get_method"] = a0 => (_mono_aot_Microsoft_Data_Sqlite_get_method = Module["_mono_aot_Microsoft_Data_Sqlite_get_method"] = wasmExports["mono_aot_Microsoft_Data_Sqlite_get_method"])(a0);

var _mono_aot_Microsoft_Extensions_Configuration_Abstractions_get_method = Module["_mono_aot_Microsoft_Extensions_Configuration_Abstractions_get_method"] = a0 => (_mono_aot_Microsoft_Extensions_Configuration_Abstractions_get_method = Module["_mono_aot_Microsoft_Extensions_Configuration_Abstractions_get_method"] = wasmExports["mono_aot_Microsoft_Extensions_Configuration_Abstractions_get_method"])(a0);

var _mono_aot_Microsoft_Extensions_DependencyInjection_get_method = Module["_mono_aot_Microsoft_Extensions_DependencyInjection_get_method"] = a0 => (_mono_aot_Microsoft_Extensions_DependencyInjection_get_method = Module["_mono_aot_Microsoft_Extensions_DependencyInjection_get_method"] = wasmExports["mono_aot_Microsoft_Extensions_DependencyInjection_get_method"])(a0);

var _mono_aot_Microsoft_Extensions_DependencyInjection_Abstractions_get_method = Module["_mono_aot_Microsoft_Extensions_DependencyInjection_Abstractions_get_method"] = a0 => (_mono_aot_Microsoft_Extensions_DependencyInjection_Abstractions_get_method = Module["_mono_aot_Microsoft_Extensions_DependencyInjection_Abstractions_get_method"] = wasmExports["mono_aot_Microsoft_Extensions_DependencyInjection_Abstractions_get_method"])(a0);

var _mono_aot_Microsoft_Extensions_Features_get_method = Module["_mono_aot_Microsoft_Extensions_Features_get_method"] = a0 => (_mono_aot_Microsoft_Extensions_Features_get_method = Module["_mono_aot_Microsoft_Extensions_Features_get_method"] = wasmExports["mono_aot_Microsoft_Extensions_Features_get_method"])(a0);

var _mono_aot_Microsoft_Extensions_Logging_get_method = Module["_mono_aot_Microsoft_Extensions_Logging_get_method"] = a0 => (_mono_aot_Microsoft_Extensions_Logging_get_method = Module["_mono_aot_Microsoft_Extensions_Logging_get_method"] = wasmExports["mono_aot_Microsoft_Extensions_Logging_get_method"])(a0);

var _mono_aot_Microsoft_Extensions_Logging_Abstractions_get_method = Module["_mono_aot_Microsoft_Extensions_Logging_Abstractions_get_method"] = a0 => (_mono_aot_Microsoft_Extensions_Logging_Abstractions_get_method = Module["_mono_aot_Microsoft_Extensions_Logging_Abstractions_get_method"] = wasmExports["mono_aot_Microsoft_Extensions_Logging_Abstractions_get_method"])(a0);

var _mono_aot_Microsoft_Extensions_ObjectPool_get_method = Module["_mono_aot_Microsoft_Extensions_ObjectPool_get_method"] = a0 => (_mono_aot_Microsoft_Extensions_ObjectPool_get_method = Module["_mono_aot_Microsoft_Extensions_ObjectPool_get_method"] = wasmExports["mono_aot_Microsoft_Extensions_ObjectPool_get_method"])(a0);

var _mono_aot_Microsoft_Extensions_Options_get_method = Module["_mono_aot_Microsoft_Extensions_Options_get_method"] = a0 => (_mono_aot_Microsoft_Extensions_Options_get_method = Module["_mono_aot_Microsoft_Extensions_Options_get_method"] = wasmExports["mono_aot_Microsoft_Extensions_Options_get_method"])(a0);

var _mono_aot_Microsoft_Extensions_Primitives_get_method = Module["_mono_aot_Microsoft_Extensions_Primitives_get_method"] = a0 => (_mono_aot_Microsoft_Extensions_Primitives_get_method = Module["_mono_aot_Microsoft_Extensions_Primitives_get_method"] = wasmExports["mono_aot_Microsoft_Extensions_Primitives_get_method"])(a0);

var _mono_aot_Microsoft_NET_StringTools_get_method = Module["_mono_aot_Microsoft_NET_StringTools_get_method"] = a0 => (_mono_aot_Microsoft_NET_StringTools_get_method = Module["_mono_aot_Microsoft_NET_StringTools_get_method"] = wasmExports["mono_aot_Microsoft_NET_StringTools_get_method"])(a0);

var _mono_aot_Microsoft_Toolkit_HighPerformance_get_method = Module["_mono_aot_Microsoft_Toolkit_HighPerformance_get_method"] = a0 => (_mono_aot_Microsoft_Toolkit_HighPerformance_get_method = Module["_mono_aot_Microsoft_Toolkit_HighPerformance_get_method"] = wasmExports["mono_aot_Microsoft_Toolkit_HighPerformance_get_method"])(a0);

var _mono_aot_MongoDB_Bson_get_method = Module["_mono_aot_MongoDB_Bson_get_method"] = a0 => (_mono_aot_MongoDB_Bson_get_method = Module["_mono_aot_MongoDB_Bson_get_method"] = wasmExports["mono_aot_MongoDB_Bson_get_method"])(a0);

var _mono_aot_Newtonsoft_Json_get_method = Module["_mono_aot_Newtonsoft_Json_get_method"] = a0 => (_mono_aot_Newtonsoft_Json_get_method = Module["_mono_aot_Newtonsoft_Json_get_method"] = wasmExports["mono_aot_Newtonsoft_Json_get_method"])(a0);

var _mono_aot_osuTK_get_method = Module["_mono_aot_osuTK_get_method"] = a0 => (_mono_aot_osuTK_get_method = Module["_mono_aot_osuTK_get_method"] = wasmExports["mono_aot_osuTK_get_method"])(a0);

var _mono_aot_ppy_Veldrid_get_method = Module["_mono_aot_ppy_Veldrid_get_method"] = a0 => (_mono_aot_ppy_Veldrid_get_method = Module["_mono_aot_ppy_Veldrid_get_method"] = wasmExports["mono_aot_ppy_Veldrid_get_method"])(a0);

var _mono_aot_ppy_Veldrid_OpenGLBindings_get_method = Module["_mono_aot_ppy_Veldrid_OpenGLBindings_get_method"] = a0 => (_mono_aot_ppy_Veldrid_OpenGLBindings_get_method = Module["_mono_aot_ppy_Veldrid_OpenGLBindings_get_method"] = wasmExports["mono_aot_ppy_Veldrid_OpenGLBindings_get_method"])(a0);

var _mono_aot_ppy_Veldrid_SPIRV_get_method = Module["_mono_aot_ppy_Veldrid_SPIRV_get_method"] = a0 => (_mono_aot_ppy_Veldrid_SPIRV_get_method = Module["_mono_aot_ppy_Veldrid_SPIRV_get_method"] = wasmExports["mono_aot_ppy_Veldrid_SPIRV_get_method"])(a0);

var _mono_aot_Remotion_Linq_get_method = Module["_mono_aot_Remotion_Linq_get_method"] = a0 => (_mono_aot_Remotion_Linq_get_method = Module["_mono_aot_Remotion_Linq_get_method"] = wasmExports["mono_aot_Remotion_Linq_get_method"])(a0);

var _mono_aot_Sentry_get_method = Module["_mono_aot_Sentry_get_method"] = a0 => (_mono_aot_Sentry_get_method = Module["_mono_aot_Sentry_get_method"] = wasmExports["mono_aot_Sentry_get_method"])(a0);

var _mono_aot_SharpCompress_get_method = Module["_mono_aot_SharpCompress_get_method"] = a0 => (_mono_aot_SharpCompress_get_method = Module["_mono_aot_SharpCompress_get_method"] = wasmExports["mono_aot_SharpCompress_get_method"])(a0);

var _mono_aot_SharpFNT_get_method = Module["_mono_aot_SharpFNT_get_method"] = a0 => (_mono_aot_SharpFNT_get_method = Module["_mono_aot_SharpFNT_get_method"] = wasmExports["mono_aot_SharpFNT_get_method"])(a0);

var _mono_aot_SixLabors_ImageSharp_get_method = Module["_mono_aot_SixLabors_ImageSharp_get_method"] = a0 => (_mono_aot_SixLabors_ImageSharp_get_method = Module["_mono_aot_SixLabors_ImageSharp_get_method"] = wasmExports["mono_aot_SixLabors_ImageSharp_get_method"])(a0);

var _mono_aot_SQLitePCLRaw_batteries_v2_get_method = Module["_mono_aot_SQLitePCLRaw_batteries_v2_get_method"] = a0 => (_mono_aot_SQLitePCLRaw_batteries_v2_get_method = Module["_mono_aot_SQLitePCLRaw_batteries_v2_get_method"] = wasmExports["mono_aot_SQLitePCLRaw_batteries_v2_get_method"])(a0);

var _mono_aot_SQLitePCLRaw_core_get_method = Module["_mono_aot_SQLitePCLRaw_core_get_method"] = a0 => (_mono_aot_SQLitePCLRaw_core_get_method = Module["_mono_aot_SQLitePCLRaw_core_get_method"] = wasmExports["mono_aot_SQLitePCLRaw_core_get_method"])(a0);

var _mono_aot_SQLitePCLRaw_provider_e_sqlite3_get_method = Module["_mono_aot_SQLitePCLRaw_provider_e_sqlite3_get_method"] = a0 => (_mono_aot_SQLitePCLRaw_provider_e_sqlite3_get_method = Module["_mono_aot_SQLitePCLRaw_provider_e_sqlite3_get_method"] = wasmExports["mono_aot_SQLitePCLRaw_provider_e_sqlite3_get_method"])(a0);

var _mono_aot_StbiSharp_get_method = Module["_mono_aot_StbiSharp_get_method"] = a0 => (_mono_aot_StbiSharp_get_method = Module["_mono_aot_StbiSharp_get_method"] = wasmExports["mono_aot_StbiSharp_get_method"])(a0);

var _mono_aot_System_Numerics_Tensors_get_method = Module["_mono_aot_System_Numerics_Tensors_get_method"] = a0 => (_mono_aot_System_Numerics_Tensors_get_method = Module["_mono_aot_System_Numerics_Tensors_get_method"] = wasmExports["mono_aot_System_Numerics_Tensors_get_method"])(a0);

var _mono_aot_TagLibSharp_get_method = Module["_mono_aot_TagLibSharp_get_method"] = a0 => (_mono_aot_TagLibSharp_get_method = Module["_mono_aot_TagLibSharp_get_method"] = wasmExports["mono_aot_TagLibSharp_get_method"])(a0);

var _mono_aot_Vortice_Mathematics_get_method = Module["_mono_aot_Vortice_Mathematics_get_method"] = a0 => (_mono_aot_Vortice_Mathematics_get_method = Module["_mono_aot_Vortice_Mathematics_get_method"] = wasmExports["mono_aot_Vortice_Mathematics_get_method"])(a0);

var _mono_aot_osu_Framework_get_method = Module["_mono_aot_osu_Framework_get_method"] = a0 => (_mono_aot_osu_Framework_get_method = Module["_mono_aot_osu_Framework_get_method"] = wasmExports["mono_aot_osu_Framework_get_method"])(a0);

var _mono_aot_osu_Game_get_method = Module["_mono_aot_osu_Game_get_method"] = a0 => (_mono_aot_osu_Game_get_method = Module["_mono_aot_osu_Game_get_method"] = wasmExports["mono_aot_osu_Game_get_method"])(a0);

var _mono_aot_osu_Game_Rulesets_Catch_get_method = Module["_mono_aot_osu_Game_Rulesets_Catch_get_method"] = a0 => (_mono_aot_osu_Game_Rulesets_Catch_get_method = Module["_mono_aot_osu_Game_Rulesets_Catch_get_method"] = wasmExports["mono_aot_osu_Game_Rulesets_Catch_get_method"])(a0);

var _mono_aot_osu_Game_Rulesets_Mania_get_method = Module["_mono_aot_osu_Game_Rulesets_Mania_get_method"] = a0 => (_mono_aot_osu_Game_Rulesets_Mania_get_method = Module["_mono_aot_osu_Game_Rulesets_Mania_get_method"] = wasmExports["mono_aot_osu_Game_Rulesets_Mania_get_method"])(a0);

var _mono_aot_osu_Game_Rulesets_Osu_get_method = Module["_mono_aot_osu_Game_Rulesets_Osu_get_method"] = a0 => (_mono_aot_osu_Game_Rulesets_Osu_get_method = Module["_mono_aot_osu_Game_Rulesets_Osu_get_method"] = wasmExports["mono_aot_osu_Game_Rulesets_Osu_get_method"])(a0);

var _mono_aot_osu_Game_Rulesets_Taiko_get_method = Module["_mono_aot_osu_Game_Rulesets_Taiko_get_method"] = a0 => (_mono_aot_osu_Game_Rulesets_Taiko_get_method = Module["_mono_aot_osu_Game_Rulesets_Taiko_get_method"] = wasmExports["mono_aot_osu_Game_Rulesets_Taiko_get_method"])(a0);

var _mono_aot_Realm_get_method = Module["_mono_aot_Realm_get_method"] = a0 => (_mono_aot_Realm_get_method = Module["_mono_aot_Realm_get_method"] = wasmExports["mono_aot_Realm_get_method"])(a0);

var _mono_aot_aot_instances_get_method = Module["_mono_aot_aot_instances_get_method"] = a0 => (_mono_aot_aot_instances_get_method = Module["_mono_aot_aot_instances_get_method"] = wasmExports["mono_aot_aot_instances_get_method"])(a0);

var _mono_wasm_send_dbg_command_with_parms = Module["_mono_wasm_send_dbg_command_with_parms"] = (a0, a1, a2, a3, a4, a5, a6) => (_mono_wasm_send_dbg_command_with_parms = Module["_mono_wasm_send_dbg_command_with_parms"] = wasmExports["mono_wasm_send_dbg_command_with_parms"])(a0, a1, a2, a3, a4, a5, a6);

var _mono_wasm_send_dbg_command = Module["_mono_wasm_send_dbg_command"] = (a0, a1, a2, a3, a4) => (_mono_wasm_send_dbg_command = Module["_mono_wasm_send_dbg_command"] = wasmExports["mono_wasm_send_dbg_command"])(a0, a1, a2, a3, a4);

var _mono_jiterp_register_jit_call_thunk = Module["_mono_jiterp_register_jit_call_thunk"] = (a0, a1) => (_mono_jiterp_register_jit_call_thunk = Module["_mono_jiterp_register_jit_call_thunk"] = wasmExports["mono_jiterp_register_jit_call_thunk"])(a0, a1);

var _mono_jiterp_stackval_to_data = Module["_mono_jiterp_stackval_to_data"] = (a0, a1, a2) => (_mono_jiterp_stackval_to_data = Module["_mono_jiterp_stackval_to_data"] = wasmExports["mono_jiterp_stackval_to_data"])(a0, a1, a2);

var _mono_jiterp_stackval_from_data = Module["_mono_jiterp_stackval_from_data"] = (a0, a1, a2) => (_mono_jiterp_stackval_from_data = Module["_mono_jiterp_stackval_from_data"] = wasmExports["mono_jiterp_stackval_from_data"])(a0, a1, a2);

var _mono_jiterp_get_arg_offset = Module["_mono_jiterp_get_arg_offset"] = (a0, a1, a2) => (_mono_jiterp_get_arg_offset = Module["_mono_jiterp_get_arg_offset"] = wasmExports["mono_jiterp_get_arg_offset"])(a0, a1, a2);

var _mono_jiterp_overflow_check_i4 = Module["_mono_jiterp_overflow_check_i4"] = (a0, a1, a2) => (_mono_jiterp_overflow_check_i4 = Module["_mono_jiterp_overflow_check_i4"] = wasmExports["mono_jiterp_overflow_check_i4"])(a0, a1, a2);

var _mono_jiterp_overflow_check_u4 = Module["_mono_jiterp_overflow_check_u4"] = (a0, a1, a2) => (_mono_jiterp_overflow_check_u4 = Module["_mono_jiterp_overflow_check_u4"] = wasmExports["mono_jiterp_overflow_check_u4"])(a0, a1, a2);

var _mono_jiterp_ld_delegate_method_ptr = Module["_mono_jiterp_ld_delegate_method_ptr"] = (a0, a1) => (_mono_jiterp_ld_delegate_method_ptr = Module["_mono_jiterp_ld_delegate_method_ptr"] = wasmExports["mono_jiterp_ld_delegate_method_ptr"])(a0, a1);

var _mono_jiterp_interp_entry = Module["_mono_jiterp_interp_entry"] = (a0, a1) => (_mono_jiterp_interp_entry = Module["_mono_jiterp_interp_entry"] = wasmExports["mono_jiterp_interp_entry"])(a0, a1);

var _fmod = Module["_fmod"] = (a0, a1) => (_fmod = Module["_fmod"] = wasmExports["fmod"])(a0, a1);

var _asinh = Module["_asinh"] = a0 => (_asinh = Module["_asinh"] = wasmExports["asinh"])(a0);

var _acosh = Module["_acosh"] = a0 => (_acosh = Module["_acosh"] = wasmExports["acosh"])(a0);

var _atanh = Module["_atanh"] = a0 => (_atanh = Module["_atanh"] = wasmExports["atanh"])(a0);

var _cbrt = Module["_cbrt"] = a0 => (_cbrt = Module["_cbrt"] = wasmExports["cbrt"])(a0);

var _cosh = Module["_cosh"] = a0 => (_cosh = Module["_cosh"] = wasmExports["cosh"])(a0);

var _sinh = Module["_sinh"] = a0 => (_sinh = Module["_sinh"] = wasmExports["sinh"])(a0);

var _tanh = Module["_tanh"] = a0 => (_tanh = Module["_tanh"] = wasmExports["tanh"])(a0);

var _asinf = Module["_asinf"] = a0 => (_asinf = Module["_asinf"] = wasmExports["asinf"])(a0);

var _asinhf = Module["_asinhf"] = a0 => (_asinhf = Module["_asinhf"] = wasmExports["asinhf"])(a0);

var _acosf = Module["_acosf"] = a0 => (_acosf = Module["_acosf"] = wasmExports["acosf"])(a0);

var _acoshf = Module["_acoshf"] = a0 => (_acoshf = Module["_acoshf"] = wasmExports["acoshf"])(a0);

var _atanf = Module["_atanf"] = a0 => (_atanf = Module["_atanf"] = wasmExports["atanf"])(a0);

var _atanhf = Module["_atanhf"] = a0 => (_atanhf = Module["_atanhf"] = wasmExports["atanhf"])(a0);

var _cbrtf = Module["_cbrtf"] = a0 => (_cbrtf = Module["_cbrtf"] = wasmExports["cbrtf"])(a0);

var _coshf = Module["_coshf"] = a0 => (_coshf = Module["_coshf"] = wasmExports["coshf"])(a0);

var _logf = Module["_logf"] = a0 => (_logf = Module["_logf"] = wasmExports["logf"])(a0);

var _sinhf = Module["_sinhf"] = a0 => (_sinhf = Module["_sinhf"] = wasmExports["sinhf"])(a0);

var _tanf = Module["_tanf"] = a0 => (_tanf = Module["_tanf"] = wasmExports["tanf"])(a0);

var _tanhf = Module["_tanhf"] = a0 => (_tanhf = Module["_tanhf"] = wasmExports["tanhf"])(a0);

var _atan2f = Module["_atan2f"] = (a0, a1) => (_atan2f = Module["_atan2f"] = wasmExports["atan2f"])(a0, a1);

var _mono_jiterp_get_polling_required_address = Module["_mono_jiterp_get_polling_required_address"] = () => (_mono_jiterp_get_polling_required_address = Module["_mono_jiterp_get_polling_required_address"] = wasmExports["mono_jiterp_get_polling_required_address"])();

var _mono_jiterp_prof_enter = Module["_mono_jiterp_prof_enter"] = (a0, a1) => (_mono_jiterp_prof_enter = Module["_mono_jiterp_prof_enter"] = wasmExports["mono_jiterp_prof_enter"])(a0, a1);

var _mono_jiterp_prof_samplepoint = Module["_mono_jiterp_prof_samplepoint"] = (a0, a1) => (_mono_jiterp_prof_samplepoint = Module["_mono_jiterp_prof_samplepoint"] = wasmExports["mono_jiterp_prof_samplepoint"])(a0, a1);

var _mono_jiterp_prof_leave = Module["_mono_jiterp_prof_leave"] = (a0, a1) => (_mono_jiterp_prof_leave = Module["_mono_jiterp_prof_leave"] = wasmExports["mono_jiterp_prof_leave"])(a0, a1);

var _mono_jiterp_do_safepoint = Module["_mono_jiterp_do_safepoint"] = (a0, a1) => (_mono_jiterp_do_safepoint = Module["_mono_jiterp_do_safepoint"] = wasmExports["mono_jiterp_do_safepoint"])(a0, a1);

var _mono_jiterp_imethod_to_ftnptr = Module["_mono_jiterp_imethod_to_ftnptr"] = a0 => (_mono_jiterp_imethod_to_ftnptr = Module["_mono_jiterp_imethod_to_ftnptr"] = wasmExports["mono_jiterp_imethod_to_ftnptr"])(a0);

var _mono_jiterp_enum_hasflag = Module["_mono_jiterp_enum_hasflag"] = (a0, a1, a2, a3) => (_mono_jiterp_enum_hasflag = Module["_mono_jiterp_enum_hasflag"] = wasmExports["mono_jiterp_enum_hasflag"])(a0, a1, a2, a3);

var _mono_jiterp_get_simd_intrinsic = Module["_mono_jiterp_get_simd_intrinsic"] = (a0, a1) => (_mono_jiterp_get_simd_intrinsic = Module["_mono_jiterp_get_simd_intrinsic"] = wasmExports["mono_jiterp_get_simd_intrinsic"])(a0, a1);

var _mono_jiterp_get_simd_opcode = Module["_mono_jiterp_get_simd_opcode"] = (a0, a1) => (_mono_jiterp_get_simd_opcode = Module["_mono_jiterp_get_simd_opcode"] = wasmExports["mono_jiterp_get_simd_opcode"])(a0, a1);

var _mono_jiterp_get_opcode_info = Module["_mono_jiterp_get_opcode_info"] = (a0, a1) => (_mono_jiterp_get_opcode_info = Module["_mono_jiterp_get_opcode_info"] = wasmExports["mono_jiterp_get_opcode_info"])(a0, a1);

var _mono_jiterp_placeholder_trace = Module["_mono_jiterp_placeholder_trace"] = (a0, a1, a2, a3) => (_mono_jiterp_placeholder_trace = Module["_mono_jiterp_placeholder_trace"] = wasmExports["mono_jiterp_placeholder_trace"])(a0, a1, a2, a3);

var _mono_jiterp_placeholder_jit_call = Module["_mono_jiterp_placeholder_jit_call"] = (a0, a1, a2, a3) => (_mono_jiterp_placeholder_jit_call = Module["_mono_jiterp_placeholder_jit_call"] = wasmExports["mono_jiterp_placeholder_jit_call"])(a0, a1, a2, a3);

var _mono_jiterp_get_interp_entry_func = Module["_mono_jiterp_get_interp_entry_func"] = a0 => (_mono_jiterp_get_interp_entry_func = Module["_mono_jiterp_get_interp_entry_func"] = wasmExports["mono_jiterp_get_interp_entry_func"])(a0);

var _mono_jiterp_is_enabled = Module["_mono_jiterp_is_enabled"] = () => (_mono_jiterp_is_enabled = Module["_mono_jiterp_is_enabled"] = wasmExports["mono_jiterp_is_enabled"])();

var _mono_jiterp_encode_leb64_ref = Module["_mono_jiterp_encode_leb64_ref"] = (a0, a1, a2) => (_mono_jiterp_encode_leb64_ref = Module["_mono_jiterp_encode_leb64_ref"] = wasmExports["mono_jiterp_encode_leb64_ref"])(a0, a1, a2);

var _mono_jiterp_encode_leb52 = Module["_mono_jiterp_encode_leb52"] = (a0, a1, a2) => (_mono_jiterp_encode_leb52 = Module["_mono_jiterp_encode_leb52"] = wasmExports["mono_jiterp_encode_leb52"])(a0, a1, a2);

var _mono_jiterp_encode_leb_signed_boundary = Module["_mono_jiterp_encode_leb_signed_boundary"] = (a0, a1, a2) => (_mono_jiterp_encode_leb_signed_boundary = Module["_mono_jiterp_encode_leb_signed_boundary"] = wasmExports["mono_jiterp_encode_leb_signed_boundary"])(a0, a1, a2);

var _mono_jiterp_increase_entry_count = Module["_mono_jiterp_increase_entry_count"] = a0 => (_mono_jiterp_increase_entry_count = Module["_mono_jiterp_increase_entry_count"] = wasmExports["mono_jiterp_increase_entry_count"])(a0);

var _mono_jiterp_object_unbox = Module["_mono_jiterp_object_unbox"] = a0 => (_mono_jiterp_object_unbox = Module["_mono_jiterp_object_unbox"] = wasmExports["mono_jiterp_object_unbox"])(a0);

var _mono_jiterp_type_is_byref = Module["_mono_jiterp_type_is_byref"] = a0 => (_mono_jiterp_type_is_byref = Module["_mono_jiterp_type_is_byref"] = wasmExports["mono_jiterp_type_is_byref"])(a0);

var _mono_jiterp_value_copy = Module["_mono_jiterp_value_copy"] = (a0, a1, a2) => (_mono_jiterp_value_copy = Module["_mono_jiterp_value_copy"] = wasmExports["mono_jiterp_value_copy"])(a0, a1, a2);

var _mono_jiterp_try_newobj_inlined = Module["_mono_jiterp_try_newobj_inlined"] = (a0, a1) => (_mono_jiterp_try_newobj_inlined = Module["_mono_jiterp_try_newobj_inlined"] = wasmExports["mono_jiterp_try_newobj_inlined"])(a0, a1);

var _mono_jiterp_try_newstr = Module["_mono_jiterp_try_newstr"] = (a0, a1) => (_mono_jiterp_try_newstr = Module["_mono_jiterp_try_newstr"] = wasmExports["mono_jiterp_try_newstr"])(a0, a1);

var _mono_jiterp_try_newarr = Module["_mono_jiterp_try_newarr"] = (a0, a1, a2) => (_mono_jiterp_try_newarr = Module["_mono_jiterp_try_newarr"] = wasmExports["mono_jiterp_try_newarr"])(a0, a1, a2);

var _mono_jiterp_gettype_ref = Module["_mono_jiterp_gettype_ref"] = (a0, a1) => (_mono_jiterp_gettype_ref = Module["_mono_jiterp_gettype_ref"] = wasmExports["mono_jiterp_gettype_ref"])(a0, a1);

var _mono_jiterp_has_parent_fast = Module["_mono_jiterp_has_parent_fast"] = (a0, a1) => (_mono_jiterp_has_parent_fast = Module["_mono_jiterp_has_parent_fast"] = wasmExports["mono_jiterp_has_parent_fast"])(a0, a1);

var _mono_jiterp_implements_interface = Module["_mono_jiterp_implements_interface"] = (a0, a1) => (_mono_jiterp_implements_interface = Module["_mono_jiterp_implements_interface"] = wasmExports["mono_jiterp_implements_interface"])(a0, a1);

var _mono_jiterp_is_special_interface = Module["_mono_jiterp_is_special_interface"] = a0 => (_mono_jiterp_is_special_interface = Module["_mono_jiterp_is_special_interface"] = wasmExports["mono_jiterp_is_special_interface"])(a0);

var _mono_jiterp_implements_special_interface = Module["_mono_jiterp_implements_special_interface"] = (a0, a1, a2) => (_mono_jiterp_implements_special_interface = Module["_mono_jiterp_implements_special_interface"] = wasmExports["mono_jiterp_implements_special_interface"])(a0, a1, a2);

var _mono_jiterp_cast_v2 = Module["_mono_jiterp_cast_v2"] = (a0, a1, a2, a3) => (_mono_jiterp_cast_v2 = Module["_mono_jiterp_cast_v2"] = wasmExports["mono_jiterp_cast_v2"])(a0, a1, a2, a3);

var _mono_jiterp_localloc = Module["_mono_jiterp_localloc"] = (a0, a1, a2) => (_mono_jiterp_localloc = Module["_mono_jiterp_localloc"] = wasmExports["mono_jiterp_localloc"])(a0, a1, a2);

var _mono_jiterp_ldtsflda = Module["_mono_jiterp_ldtsflda"] = (a0, a1) => (_mono_jiterp_ldtsflda = Module["_mono_jiterp_ldtsflda"] = wasmExports["mono_jiterp_ldtsflda"])(a0, a1);

var _mono_jiterp_box_ref = Module["_mono_jiterp_box_ref"] = (a0, a1, a2, a3) => (_mono_jiterp_box_ref = Module["_mono_jiterp_box_ref"] = wasmExports["mono_jiterp_box_ref"])(a0, a1, a2, a3);

var _mono_jiterp_conv = Module["_mono_jiterp_conv"] = (a0, a1, a2) => (_mono_jiterp_conv = Module["_mono_jiterp_conv"] = wasmExports["mono_jiterp_conv"])(a0, a1, a2);

var _mono_jiterp_relop_fp = Module["_mono_jiterp_relop_fp"] = (a0, a1, a2) => (_mono_jiterp_relop_fp = Module["_mono_jiterp_relop_fp"] = wasmExports["mono_jiterp_relop_fp"])(a0, a1, a2);

var _mono_jiterp_get_size_of_stackval = Module["_mono_jiterp_get_size_of_stackval"] = () => (_mono_jiterp_get_size_of_stackval = Module["_mono_jiterp_get_size_of_stackval"] = wasmExports["mono_jiterp_get_size_of_stackval"])();

var _mono_jiterp_type_get_raw_value_size = Module["_mono_jiterp_type_get_raw_value_size"] = a0 => (_mono_jiterp_type_get_raw_value_size = Module["_mono_jiterp_type_get_raw_value_size"] = wasmExports["mono_jiterp_type_get_raw_value_size"])(a0);

var _mono_jiterp_trace_bailout = Module["_mono_jiterp_trace_bailout"] = a0 => (_mono_jiterp_trace_bailout = Module["_mono_jiterp_trace_bailout"] = wasmExports["mono_jiterp_trace_bailout"])(a0);

var _mono_jiterp_get_trace_bailout_count = Module["_mono_jiterp_get_trace_bailout_count"] = a0 => (_mono_jiterp_get_trace_bailout_count = Module["_mono_jiterp_get_trace_bailout_count"] = wasmExports["mono_jiterp_get_trace_bailout_count"])(a0);

var _mono_jiterp_adjust_abort_count = Module["_mono_jiterp_adjust_abort_count"] = (a0, a1) => (_mono_jiterp_adjust_abort_count = Module["_mono_jiterp_adjust_abort_count"] = wasmExports["mono_jiterp_adjust_abort_count"])(a0, a1);

var _mono_jiterp_interp_entry_prologue = Module["_mono_jiterp_interp_entry_prologue"] = (a0, a1) => (_mono_jiterp_interp_entry_prologue = Module["_mono_jiterp_interp_entry_prologue"] = wasmExports["mono_jiterp_interp_entry_prologue"])(a0, a1);

var _mono_jiterp_get_opcode_value_table_entry = Module["_mono_jiterp_get_opcode_value_table_entry"] = a0 => (_mono_jiterp_get_opcode_value_table_entry = Module["_mono_jiterp_get_opcode_value_table_entry"] = wasmExports["mono_jiterp_get_opcode_value_table_entry"])(a0);

var _mono_jiterp_get_trace_hit_count = Module["_mono_jiterp_get_trace_hit_count"] = a0 => (_mono_jiterp_get_trace_hit_count = Module["_mono_jiterp_get_trace_hit_count"] = wasmExports["mono_jiterp_get_trace_hit_count"])(a0);

var _mono_jiterp_parse_option = Module["_mono_jiterp_parse_option"] = a0 => (_mono_jiterp_parse_option = Module["_mono_jiterp_parse_option"] = wasmExports["mono_jiterp_parse_option"])(a0);

var _mono_jiterp_get_options_version = Module["_mono_jiterp_get_options_version"] = () => (_mono_jiterp_get_options_version = Module["_mono_jiterp_get_options_version"] = wasmExports["mono_jiterp_get_options_version"])();

var _mono_jiterp_get_options_as_json = Module["_mono_jiterp_get_options_as_json"] = () => (_mono_jiterp_get_options_as_json = Module["_mono_jiterp_get_options_as_json"] = wasmExports["mono_jiterp_get_options_as_json"])();

var _mono_jiterp_get_option_as_int = Module["_mono_jiterp_get_option_as_int"] = a0 => (_mono_jiterp_get_option_as_int = Module["_mono_jiterp_get_option_as_int"] = wasmExports["mono_jiterp_get_option_as_int"])(a0);

var _mono_jiterp_object_has_component_size = Module["_mono_jiterp_object_has_component_size"] = a0 => (_mono_jiterp_object_has_component_size = Module["_mono_jiterp_object_has_component_size"] = wasmExports["mono_jiterp_object_has_component_size"])(a0);

var _mono_jiterp_get_hashcode = Module["_mono_jiterp_get_hashcode"] = a0 => (_mono_jiterp_get_hashcode = Module["_mono_jiterp_get_hashcode"] = wasmExports["mono_jiterp_get_hashcode"])(a0);

var _mono_jiterp_try_get_hashcode = Module["_mono_jiterp_try_get_hashcode"] = a0 => (_mono_jiterp_try_get_hashcode = Module["_mono_jiterp_try_get_hashcode"] = wasmExports["mono_jiterp_try_get_hashcode"])(a0);

var _mono_jiterp_get_signature_has_this = Module["_mono_jiterp_get_signature_has_this"] = a0 => (_mono_jiterp_get_signature_has_this = Module["_mono_jiterp_get_signature_has_this"] = wasmExports["mono_jiterp_get_signature_has_this"])(a0);

var _mono_jiterp_get_signature_return_type = Module["_mono_jiterp_get_signature_return_type"] = a0 => (_mono_jiterp_get_signature_return_type = Module["_mono_jiterp_get_signature_return_type"] = wasmExports["mono_jiterp_get_signature_return_type"])(a0);

var _mono_jiterp_get_signature_param_count = Module["_mono_jiterp_get_signature_param_count"] = a0 => (_mono_jiterp_get_signature_param_count = Module["_mono_jiterp_get_signature_param_count"] = wasmExports["mono_jiterp_get_signature_param_count"])(a0);

var _mono_jiterp_get_signature_params = Module["_mono_jiterp_get_signature_params"] = a0 => (_mono_jiterp_get_signature_params = Module["_mono_jiterp_get_signature_params"] = wasmExports["mono_jiterp_get_signature_params"])(a0);

var _mono_jiterp_type_to_ldind = Module["_mono_jiterp_type_to_ldind"] = a0 => (_mono_jiterp_type_to_ldind = Module["_mono_jiterp_type_to_ldind"] = wasmExports["mono_jiterp_type_to_ldind"])(a0);

var _mono_jiterp_type_to_stind = Module["_mono_jiterp_type_to_stind"] = a0 => (_mono_jiterp_type_to_stind = Module["_mono_jiterp_type_to_stind"] = wasmExports["mono_jiterp_type_to_stind"])(a0);

var _mono_jiterp_get_array_rank = Module["_mono_jiterp_get_array_rank"] = (a0, a1) => (_mono_jiterp_get_array_rank = Module["_mono_jiterp_get_array_rank"] = wasmExports["mono_jiterp_get_array_rank"])(a0, a1);

var _mono_jiterp_get_array_element_size = Module["_mono_jiterp_get_array_element_size"] = (a0, a1) => (_mono_jiterp_get_array_element_size = Module["_mono_jiterp_get_array_element_size"] = wasmExports["mono_jiterp_get_array_element_size"])(a0, a1);

var _mono_jiterp_set_object_field = Module["_mono_jiterp_set_object_field"] = (a0, a1, a2, a3) => (_mono_jiterp_set_object_field = Module["_mono_jiterp_set_object_field"] = wasmExports["mono_jiterp_set_object_field"])(a0, a1, a2, a3);

var _mono_jiterp_debug_count = Module["_mono_jiterp_debug_count"] = () => (_mono_jiterp_debug_count = Module["_mono_jiterp_debug_count"] = wasmExports["mono_jiterp_debug_count"])();

var _mono_jiterp_stelem_ref = Module["_mono_jiterp_stelem_ref"] = (a0, a1, a2) => (_mono_jiterp_stelem_ref = Module["_mono_jiterp_stelem_ref"] = wasmExports["mono_jiterp_stelem_ref"])(a0, a1, a2);

var _mono_jiterp_get_member_offset = Module["_mono_jiterp_get_member_offset"] = a0 => (_mono_jiterp_get_member_offset = Module["_mono_jiterp_get_member_offset"] = wasmExports["mono_jiterp_get_member_offset"])(a0);

var _mono_jiterp_get_counter = Module["_mono_jiterp_get_counter"] = a0 => (_mono_jiterp_get_counter = Module["_mono_jiterp_get_counter"] = wasmExports["mono_jiterp_get_counter"])(a0);

var _mono_jiterp_modify_counter = Module["_mono_jiterp_modify_counter"] = (a0, a1) => (_mono_jiterp_modify_counter = Module["_mono_jiterp_modify_counter"] = wasmExports["mono_jiterp_modify_counter"])(a0, a1);

var _mono_jiterp_write_number_unaligned = Module["_mono_jiterp_write_number_unaligned"] = (a0, a1, a2) => (_mono_jiterp_write_number_unaligned = Module["_mono_jiterp_write_number_unaligned"] = wasmExports["mono_jiterp_write_number_unaligned"])(a0, a1, a2);

var _mono_jiterp_get_rejected_trace_count = Module["_mono_jiterp_get_rejected_trace_count"] = () => (_mono_jiterp_get_rejected_trace_count = Module["_mono_jiterp_get_rejected_trace_count"] = wasmExports["mono_jiterp_get_rejected_trace_count"])();

var _mono_jiterp_boost_back_branch_target = Module["_mono_jiterp_boost_back_branch_target"] = a0 => (_mono_jiterp_boost_back_branch_target = Module["_mono_jiterp_boost_back_branch_target"] = wasmExports["mono_jiterp_boost_back_branch_target"])(a0);

var _mono_jiterp_is_imethod_var_address_taken = Module["_mono_jiterp_is_imethod_var_address_taken"] = (a0, a1) => (_mono_jiterp_is_imethod_var_address_taken = Module["_mono_jiterp_is_imethod_var_address_taken"] = wasmExports["mono_jiterp_is_imethod_var_address_taken"])(a0, a1);

var _mono_jiterp_initialize_table = Module["_mono_jiterp_initialize_table"] = (a0, a1, a2) => (_mono_jiterp_initialize_table = Module["_mono_jiterp_initialize_table"] = wasmExports["mono_jiterp_initialize_table"])(a0, a1, a2);

var _mono_jiterp_allocate_table_entry = Module["_mono_jiterp_allocate_table_entry"] = a0 => (_mono_jiterp_allocate_table_entry = Module["_mono_jiterp_allocate_table_entry"] = wasmExports["mono_jiterp_allocate_table_entry"])(a0);

var _mono_jiterp_tlqueue_next = Module["_mono_jiterp_tlqueue_next"] = a0 => (_mono_jiterp_tlqueue_next = Module["_mono_jiterp_tlqueue_next"] = wasmExports["mono_jiterp_tlqueue_next"])(a0);

var _mono_jiterp_tlqueue_add = Module["_mono_jiterp_tlqueue_add"] = (a0, a1) => (_mono_jiterp_tlqueue_add = Module["_mono_jiterp_tlqueue_add"] = wasmExports["mono_jiterp_tlqueue_add"])(a0, a1);

var _mono_jiterp_tlqueue_clear = Module["_mono_jiterp_tlqueue_clear"] = a0 => (_mono_jiterp_tlqueue_clear = Module["_mono_jiterp_tlqueue_clear"] = wasmExports["mono_jiterp_tlqueue_clear"])(a0);

var _mono_interp_pgo_load_table = Module["_mono_interp_pgo_load_table"] = (a0, a1) => (_mono_interp_pgo_load_table = Module["_mono_interp_pgo_load_table"] = wasmExports["mono_interp_pgo_load_table"])(a0, a1);

var _mono_interp_pgo_save_table = Module["_mono_interp_pgo_save_table"] = (a0, a1) => (_mono_interp_pgo_save_table = Module["_mono_interp_pgo_save_table"] = wasmExports["mono_interp_pgo_save_table"])(a0, a1);

var _mono_llvm_cpp_catch_exception = Module["_mono_llvm_cpp_catch_exception"] = (a0, a1, a2) => (_mono_llvm_cpp_catch_exception = Module["_mono_llvm_cpp_catch_exception"] = wasmExports["mono_llvm_cpp_catch_exception"])(a0, a1, a2);

var _mono_jiterp_begin_catch = Module["_mono_jiterp_begin_catch"] = a0 => (_mono_jiterp_begin_catch = Module["_mono_jiterp_begin_catch"] = wasmExports["mono_jiterp_begin_catch"])(a0);

var _mono_jiterp_end_catch = Module["_mono_jiterp_end_catch"] = () => (_mono_jiterp_end_catch = Module["_mono_jiterp_end_catch"] = wasmExports["mono_jiterp_end_catch"])();

var _posix_memalign = Module["_posix_memalign"] = (a0, a1, a2) => (_posix_memalign = Module["_posix_memalign"] = wasmExports["posix_memalign"])(a0, a1, a2);

var _emscripten_main_runtime_thread_id = Module["_emscripten_main_runtime_thread_id"] = () => (_emscripten_main_runtime_thread_id = Module["_emscripten_main_runtime_thread_id"] = wasmExports["emscripten_main_runtime_thread_id"])();

var _mono_wasm_create_deputy_thread = Module["_mono_wasm_create_deputy_thread"] = () => (_mono_wasm_create_deputy_thread = Module["_mono_wasm_create_deputy_thread"] = wasmExports["mono_wasm_create_deputy_thread"])();

var _mono_wasm_create_io_thread = Module["_mono_wasm_create_io_thread"] = () => (_mono_wasm_create_io_thread = Module["_mono_wasm_create_io_thread"] = wasmExports["mono_wasm_create_io_thread"])();

var _mono_wasm_register_ui_thread = Module["_mono_wasm_register_ui_thread"] = () => (_mono_wasm_register_ui_thread = Module["_mono_wasm_register_ui_thread"] = wasmExports["mono_wasm_register_ui_thread"])();

var _mono_wasm_register_io_thread = Module["_mono_wasm_register_io_thread"] = () => (_mono_wasm_register_io_thread = Module["_mono_wasm_register_io_thread"] = wasmExports["mono_wasm_register_io_thread"])();

var _mono_threads_wasm_sync_run_in_target_thread_done = Module["_mono_threads_wasm_sync_run_in_target_thread_done"] = a0 => (_mono_threads_wasm_sync_run_in_target_thread_done = Module["_mono_threads_wasm_sync_run_in_target_thread_done"] = wasmExports["mono_threads_wasm_sync_run_in_target_thread_done"])(a0);

var _mono_wasm_gc_lock = Module["_mono_wasm_gc_lock"] = () => (_mono_wasm_gc_lock = Module["_mono_wasm_gc_lock"] = wasmExports["mono_wasm_gc_lock"])();

var _mono_wasm_gc_unlock = Module["_mono_wasm_gc_unlock"] = () => (_mono_wasm_gc_unlock = Module["_mono_wasm_gc_unlock"] = wasmExports["mono_wasm_gc_unlock"])();

var _mono_print_method_from_ip = Module["_mono_print_method_from_ip"] = a0 => (_mono_print_method_from_ip = Module["_mono_print_method_from_ip"] = wasmExports["mono_print_method_from_ip"])(a0);

var _mono_wasm_load_icu_data = Module["_mono_wasm_load_icu_data"] = a0 => (_mono_wasm_load_icu_data = Module["_mono_wasm_load_icu_data"] = wasmExports["mono_wasm_load_icu_data"])(a0);

var _ntohs = Module["_ntohs"] = a0 => (_ntohs = Module["_ntohs"] = wasmExports["ntohs"])(a0);

var _htons = Module["_htons"] = a0 => (_htons = Module["_htons"] = wasmExports["htons"])(a0);

var _memset = Module["_memset"] = (a0, a1, a2) => (_memset = Module["_memset"] = wasmExports["memset"])(a0, a1, a2);

var __emscripten_tls_init = Module["__emscripten_tls_init"] = () => (__emscripten_tls_init = Module["__emscripten_tls_init"] = wasmExports["_emscripten_tls_init"])();

var _emscripten_builtin_memalign = (a0, a1) => (_emscripten_builtin_memalign = wasmExports["emscripten_builtin_memalign"])(a0, a1);

var ___funcs_on_exit = () => (___funcs_on_exit = wasmExports["__funcs_on_exit"])();

var __emscripten_thread_init = Module["__emscripten_thread_init"] = (a0, a1, a2, a3, a4, a5) => (__emscripten_thread_init = Module["__emscripten_thread_init"] = wasmExports["_emscripten_thread_init"])(a0, a1, a2, a3, a4, a5);

var __emscripten_thread_crashed = Module["__emscripten_thread_crashed"] = () => (__emscripten_thread_crashed = Module["__emscripten_thread_crashed"] = wasmExports["_emscripten_thread_crashed"])();

var _emscripten_main_thread_process_queued_calls = () => (_emscripten_main_thread_process_queued_calls = wasmExports["emscripten_main_thread_process_queued_calls"])();

var _htonl = a0 => (_htonl = wasmExports["htonl"])(a0);

var __emscripten_run_on_main_thread_js = (a0, a1, a2, a3, a4) => (__emscripten_run_on_main_thread_js = wasmExports["_emscripten_run_on_main_thread_js"])(a0, a1, a2, a3, a4);

var __emscripten_thread_free_data = a0 => (__emscripten_thread_free_data = wasmExports["_emscripten_thread_free_data"])(a0);

var __emscripten_thread_exit = Module["__emscripten_thread_exit"] = a0 => (__emscripten_thread_exit = Module["__emscripten_thread_exit"] = wasmExports["_emscripten_thread_exit"])(a0);

var _sbrk = Module["_sbrk"] = a0 => (_sbrk = Module["_sbrk"] = wasmExports["sbrk"])(a0);

var __emscripten_check_mailbox = () => (__emscripten_check_mailbox = wasmExports["_emscripten_check_mailbox"])();

var _memalign = Module["_memalign"] = (a0, a1) => (_memalign = Module["_memalign"] = wasmExports["memalign"])(a0, a1);

var ___trap = () => (___trap = wasmExports["__trap"])();

var _emscripten_stack_set_limits = (a0, a1) => (_emscripten_stack_set_limits = wasmExports["emscripten_stack_set_limits"])(a0, a1);

var stackSave = Module["stackSave"] = () => (stackSave = Module["stackSave"] = wasmExports["stackSave"])();

var stackRestore = Module["stackRestore"] = a0 => (stackRestore = Module["stackRestore"] = wasmExports["stackRestore"])(a0);

var stackAlloc = Module["stackAlloc"] = a0 => (stackAlloc = Module["stackAlloc"] = wasmExports["stackAlloc"])(a0);

Module["addRunDependency"] = addRunDependency;

Module["removeRunDependency"] = removeRunDependency;

Module["FS_createPath"] = FS.createPath;

Module["FS_createLazyFile"] = FS.createLazyFile;

Module["FS_createDevice"] = FS.createDevice;

Module["out"] = out;

Module["err"] = err;

Module["abort"] = abort;

Module["wasmMemory"] = wasmMemory;

Module["wasmExports"] = wasmExports;

Module["keepRuntimeAlive"] = keepRuntimeAlive;

Module["runtimeKeepalivePush"] = runtimeKeepalivePush;

Module["runtimeKeepalivePop"] = runtimeKeepalivePop;

Module["maybeExit"] = maybeExit;

Module["ccall"] = ccall;

Module["cwrap"] = cwrap;

Module["addFunction"] = addFunction;

Module["setValue"] = setValue;

Module["getValue"] = getValue;

Module["UTF8ArrayToString"] = UTF8ArrayToString;

Module["UTF8ToString"] = UTF8ToString;

Module["stringToUTF8Array"] = stringToUTF8Array;

Module["lengthBytesUTF8"] = lengthBytesUTF8;

Module["ExitStatus"] = ExitStatus;

Module["safeSetTimeout"] = safeSetTimeout;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

Module["FS"] = FS;

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_unlink"] = FS.unlink;

Module["PThread"] = PThread;

var calledRun;

dependenciesFulfilled = function runCaller() {
 if (!calledRun) run();
 if (!calledRun) dependenciesFulfilled = runCaller;
};

function run() {
 if (runDependencies > 0) {
  return;
 }
 if (ENVIRONMENT_IS_PTHREAD) {
  readyPromiseResolve(Module);
  initRuntime();
  startWorker(Module);
  return;
 }
 preRun();
 if (runDependencies > 0) {
  return;
 }
 function doRun() {
  if (calledRun) return;
  calledRun = true;
  Module["calledRun"] = true;
  if (ABORT) return;
  initRuntime();
  readyPromiseResolve(Module);
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout(function() {
   setTimeout(function() {
    Module["setStatus"]("");
   }, 1);
   doRun();
  }, 1);
 } else {
  doRun();
 }
}

if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}

run();


  if (!ENVIRONMENT_IS_PTHREAD) globalThis.__osuFs = FS;
  return moduleArg.ready
}
);
})();
export default createDotnetRuntime;
var fetch = fetch || undefined; var require = require || undefined; var __dirname = __dirname || ''; var _nativeModuleLoaded = false;
