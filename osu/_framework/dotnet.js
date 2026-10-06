//! Licensed to the .NET Foundation under one or more agreements.
//! The .NET Foundation licenses this file to you under the MIT license.

var e=!0;const t=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,8,1,6,0,6,64,25,11,11])),o=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,15,1,13,0,65,1,253,15,65,2,253,15,253,128,2,11])),n=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11])),r=Symbol.for("wasm promise_control");function i(e,t){let o=null;const n=new Promise((function(n,r){o={isDone:!1,promise:null,resolve:t=>{o.isDone||(o.isDone=!0,n(t),e&&e())},reject:e=>{o.isDone||(o.isDone=!0,r(e),t&&t())}}}));o.promise=n;const i=n;return i[r]=o,{promise:i,promise_control:o}}function s(e){return e[r]}function a(e){e&&function(e){return void 0!==e[r]}(e)||qe(!1,"Promise is not controllable")}const l="__mono_message__",c=["debug","log","trace","warn","info","error"],d="MONO_WASM: ";let u,m,f,g;function p(e){g=e}function h(e){if(Ne.diagnosticTracing){const t="function"==typeof e?e():e;console.debug(d+t)}}function w(e,...t){console.info(d+e,...t)}function b(e,...t){console.info(e,...t)}function y(e,...t){console.warn(d+e,...t)}function v(e,...t){if(t&&t.length>0&&t[0]&&"object"==typeof t[0]){if(t[0].silent)return;if(t[0].toString)return void console.error(d+e,t[0].toString())}console.error(d+e,...t)}let _,E,T="",x=(new Date).valueOf();function j(t,o,n){return function(...r){try{let i=r[0];if(void 0===i)i="undefined";else if(null===i)i="null";else if("function"==typeof i)i=i.toString();else if("string"!=typeof i)try{i=JSON.stringify(i)}catch(e){i=i.toString()}if("string"==typeof i&&e){if(Pe&&-1!==i.indexOf("keeping the worker alive for asynchronous operation"))return;if(0===i.indexOf("MONO_WASM: ")||0===i.indexOf("[MONO]")){const e=new Date;x!==e.valueOf()&&(T=e.toISOString().substring(11,23),x=e.valueOf()),i=`[${g} ${T}] ${i}`}}o(n?JSON.stringify({method:t,payload:i,arguments:r.slice(1)}):[t+i,...r.slice(1)])}catch(e){f.error(`proxyConsole failed: ${e}`)}}}function R(e,t,o){m=t,g=e,f={...t};const n=`${o}/console`.replace("https://","wss://").replace("http://","ws://");u=new WebSocket(n),u.addEventListener("error",O),u.addEventListener("close",D),function(){for(const e of c)m[e]=j(`console.${e}`,A,!0)}()}function S(e){let t=30;const o=()=>{u?0==u.bufferedAmount||0==t?(e&&b(e),function(){for(const e of c)m[e]=j(`console.${e}`,f.log,!1)}(),u.removeEventListener("error",O),u.removeEventListener("close",D),u.close(1e3,e),u=void 0):(t--,globalThis.setTimeout(o,100)):e&&f&&f.log(e)};o()}function A(e){u&&u.readyState===WebSocket.OPEN?u.send(e):f.log(e)}function O(e){f.error(`[${g}] proxy console websocket error: ${e}`,e)}function D(e){f.debug(`[${g}] proxy console websocket closed: ${e}`,e)}function k(){Ne.preferredIcuAsset=I(Ne.config);let e="invariant"==Ne.config.globalizationMode;if(!e)if(Ne.preferredIcuAsset)Ne.diagnosticTracing&&h("ICU data archive(s) available, disabling invariant mode");else{if("custom"===Ne.config.globalizationMode||"all"===Ne.config.globalizationMode||"sharded"===Ne.config.globalizationMode){const e="invariant globalization mode is inactive and no ICU data archives are available";throw v(`ERROR: ${e}`),new Error(e)}Ne.diagnosticTracing&&h("ICU data archive(s) not available, using invariant globalization mode"),e=!0,Ne.preferredIcuAsset=null}const t="DOTNET_SYSTEM_GLOBALIZATION_INVARIANT",o=Ne.config.environmentVariables;if(void 0===o[t]&&e&&(o[t]="1"),void 0===o.TZ)try{const e=Intl.DateTimeFormat().resolvedOptions().timeZone||null;e&&(o.TZ=e)}catch(e){w("failed to detect timezone, will fallback to UTC")}}function I(e){var t;if((null===(t=e.resources)||void 0===t?void 0:t.icu)&&"invariant"!=e.globalizationMode){const t=e.applicationCulture||(Ce?globalThis.navigator&&globalThis.navigator.languages&&globalThis.navigator.languages[0]:Intl.DateTimeFormat().resolvedOptions().locale),o=e.resources.icu;let n=null;if("custom"===e.globalizationMode){if(o.length>=1)return o[0].name}else t&&"all"!==e.globalizationMode?"sharded"===e.globalizationMode&&(n=function(e){const t=e.split("-")[0];return"en"===t||["fr","fr-FR","it","it-IT","de","de-DE","es","es-ES"].includes(e)?"icudt_EFIGS.dat":["zh","ko","ja"].includes(t)?"icudt_CJK.dat":"icudt_no_CJK.dat"}(t)):n="icudt.dat";if(n)for(let e=0;e<o.length;e++){const t=o[e];if(t.virtualPath===n)return t.name}}return e.globalizationMode="invariant",null}const P=class{constructor(e){this.url=e}toString(){return this.url}};async function C(e,t){try{const o="function"==typeof globalThis.fetch;if(De){const n=e.startsWith("file://");if(!n&&o)return globalThis.fetch(e,t||{credentials:"same-origin"});_||(E=ze.require("url"),_=ze.require("fs")),n&&(e=E.fileURLToPath(e));const r=await _.promises.readFile(e);return{ok:!0,headers:{length:0,get:()=>null},url:e,arrayBuffer:()=>r,json:()=>JSON.parse(r),text:()=>{throw new Error("NotImplementedException")}}}if(o)return globalThis.fetch(e,t||{credentials:"same-origin"});if("function"==typeof read)return{ok:!0,url:e,headers:{length:0,get:()=>null},arrayBuffer:()=>new Uint8Array(read(e,"binary")),json:()=>JSON.parse(read(e,"utf8")),text:()=>read(e,"utf8")}}catch(t){return{ok:!1,url:e,status:500,headers:{length:0,get:()=>null},statusText:"ERR28: "+t,arrayBuffer:()=>{throw t},json:()=>{throw t},text:()=>{throw t}}}throw new Error("No fetch implementation available")}function M(e){return"string"!=typeof e&&qe(!1,"url must be a string"),!L(e)&&0!==e.indexOf("./")&&0!==e.indexOf("../")&&globalThis.URL&&globalThis.document&&globalThis.document.baseURI&&(e=new URL(e,globalThis.document.baseURI).toString()),e}const U=/^[a-zA-Z][a-zA-Z\d+\-.]*?:\/\//,N=/[a-zA-Z]:[\\/]/;function L(e){return De||Me?e.startsWith("/")||e.startsWith("\\")||-1!==e.indexOf("///")||N.test(e):U.test(e)}let $,z=0;const W=[],F=[],B=new Map,V={"js-module-threads":!0,"js-module-runtime":!0,"js-module-dotnet":!0,"js-module-native":!0,"js-module-diagnostics":!0},q={...V,"js-module-library-initializer":!0},J={...V,dotnetwasm:!0,heap:!0,manifest:!0},H={...q,manifest:!0},Z={...q,dotnetwasm:!0},Q={dotnetwasm:!0,symbols:!0},G={...q,dotnetwasm:!0,symbols:!0},K={symbols:!0};function X(e){return!("icu"==e.behavior&&e.name!=Ne.preferredIcuAsset)}function Y(e,t,o){null!=t||(t=[]),qe(1==t.length,`Expect to have one ${o} asset in resources`);const n=t[0];return n.behavior=o,ee(n),e.push(n),n}function ee(e){J[e.behavior]&&B.set(e.behavior,e)}function te(e){qe(J[e],`Unknown single asset behavior ${e}`);const t=B.get(e);if(t&&!t.resolvedUrl)if(t.resolvedUrl=Ne.locateFile(t.name),V[t.behavior]){const e=he(t);e?("string"!=typeof e&&qe(!1,"loadBootResource response for 'dotnetjs' type should be a URL string"),t.resolvedUrl=e):t.resolvedUrl=ue(t.resolvedUrl,t.behavior)}else if("dotnetwasm"!==t.behavior)throw new Error(`Unknown single asset behavior ${e}`);return t}function oe(e){const t=te(e);return qe(t,`Single asset for ${e} not found`),t}let ne=!1;async function re(){if(!ne){ne=!0,Ne.diagnosticTracing&&h("mono_download_assets");try{const e=[],t=[],o=(e,t)=>{!G[e.behavior]&&X(e)&&Ne.expected_instantiated_assets_count++,!Z[e.behavior]&&X(e)&&(Ne.expected_downloaded_assets_count++,t.push(le(e)))};for(const t of W)o(t,e);for(const e of F)o(e,t);Ne.allDownloadsQueued.promise_control.resolve(),Promise.all([...e,...t]).then((()=>{Ne.allDownloadsFinished.promise_control.resolve()})).catch((e=>{throw Ne.err("Error in mono_download_assets: "+e),et(1,e),e})),await Ne.runtimeModuleLoaded.promise;const n=async e=>{const t=await e;if(t.buffer){if(!G[t.behavior]){t.buffer&&"object"==typeof t.buffer||qe(!1,"asset buffer must be array-like or buffer-like or promise of these"),"string"!=typeof t.resolvedUrl&&qe(!1,"resolvedUrl must be string");const e=t.resolvedUrl,o=await t.buffer,n=new Uint8Array(o);we(t),await Ue.beforeOnRuntimeInitialized.promise,Ue.instantiate_asset(t,e,n)}}else Q[t.behavior]?("symbols"===t.behavior&&(await Ue.instantiate_symbols_asset(t),we(t)),Q[t.behavior]&&++Ne.actual_downloaded_assets_count):(t.isOptional||qe(!1,"Expected asset to have the downloaded buffer"),!Z[t.behavior]&&X(t)&&Ne.expected_downloaded_assets_count--,!G[t.behavior]&&X(t)&&Ne.expected_instantiated_assets_count--)},r=[],i=[];for(const t of e)r.push(n(t));for(const e of t)i.push(n(e));Promise.all(r).then((()=>{Pe||Ue.coreAssetsInMemory.promise_control.resolve()})).catch((e=>{throw Ne.err("Error in mono_download_assets: "+e),et(1,e),e})),Promise.all(i).then((async()=>{Pe||(await Ue.coreAssetsInMemory.promise,Ue.allAssetsInMemory.promise_control.resolve())})).catch((e=>{throw Ne.err("Error in mono_download_assets: "+e),et(1,e),e}))}catch(e){throw Ne.err("Error in mono_download_assets: "+e),e}}}let ie=!1;function se(){if(ie)return;ie=!0;const e=Ne.config,t=[];if(e.assets)for(const t of e.assets)"object"!=typeof t&&qe(!1,`asset must be object, it was ${typeof t} : ${t}`),"string"!=typeof t.behavior&&qe(!1,"asset behavior must be known string"),"string"!=typeof t.name&&qe(!1,"asset name must be string"),t.resolvedUrl&&"string"!=typeof t.resolvedUrl&&qe(!1,"asset resolvedUrl could be string"),t.hash&&"string"!=typeof t.hash&&qe(!1,"asset resolvedUrl could be string"),t.pendingDownload&&"object"!=typeof t.pendingDownload&&qe(!1,"asset pendingDownload could be object"),t.isCore?W.push(t):F.push(t),ee(t);else if(e.resources){const o=e.resources;o.wasmNative||qe(!1,"resources.wasmNative must be defined"),o.jsModuleNative||qe(!1,"resources.jsModuleNative must be defined"),o.jsModuleRuntime||qe(!1,"resources.jsModuleRuntime must be defined"),o.jsModuleWorker||qe(!1,"resources.jsModuleWorker must be defined"),Y(F,o.wasmNative,"dotnetwasm"),Y(t,o.jsModuleNative,"js-module-native"),Y(t,o.jsModuleRuntime,"js-module-runtime"),o.jsModuleDiagnostics&&Y(t,o.jsModuleDiagnostics,"js-module-diagnostics"),Y(t,o.jsModuleWorker,"js-module-threads");const n=(e,t,o)=>{const n=e;n.behavior=t,o?(n.isCore=!0,W.push(n)):F.push(n)};if(o.coreAssembly)for(let e=0;e<o.coreAssembly.length;e++)n(o.coreAssembly[e],"assembly",!0);if(o.assembly)for(let e=0;e<o.assembly.length;e++)n(o.assembly[e],"assembly",!o.coreAssembly);if(0!=e.debugLevel&&Ne.isDebuggingSupported()){if(o.corePdb)for(let e=0;e<o.corePdb.length;e++)n(o.corePdb[e],"pdb",!0);if(o.pdb)for(let e=0;e<o.pdb.length;e++)n(o.pdb[e],"pdb",!o.corePdb)}if(e.loadAllSatelliteResources&&o.satelliteResources)for(const e in o.satelliteResources)for(let t=0;t<o.satelliteResources[e].length;t++){const r=o.satelliteResources[e][t];r.culture=e,n(r,"resource",!o.coreAssembly)}if(o.coreVfs)for(let e=0;e<o.coreVfs.length;e++)n(o.coreVfs[e],"vfs",!0);if(o.vfs)for(let e=0;e<o.vfs.length;e++)n(o.vfs[e],"vfs",!o.coreVfs);const r=I(e);if(r&&o.icu)for(let e=0;e<o.icu.length;e++){const t=o.icu[e];t.name===r&&n(t,"icu",!1)}if(o.wasmSymbols)for(let e=0;e<o.wasmSymbols.length;e++)n(o.wasmSymbols[e],"symbols",!1)}if(e.appsettings)for(let t=0;t<e.appsettings.length;t++){const o=e.appsettings[t],n=be(o);"appsettings.json"!==n&&n!==`appsettings.${e.applicationEnvironment}.json`||F.push({name:o,behavior:"vfs",cache:"no-cache",useCredentials:!0})}e.assets=[...W,...F,...t]}async function ae(e){const t=await le(e);return await t.pendingDownloadInternal.response,t.buffer}async function le(e){try{return await ce(e)}catch(t){if(!Ne.enableDownloadRetry)throw t;if(Me||De)throw t;if(e.pendingDownload&&e.pendingDownloadInternal==e.pendingDownload)throw t;if(e.resolvedUrl&&-1!=e.resolvedUrl.indexOf("file://"))throw t;if(t&&404==t.status)throw t;e.pendingDownloadInternal=void 0,await Ne.allDownloadsQueued.promise;try{return Ne.diagnosticTracing&&h(`Retrying download '${e.name}'`),await ce(e)}catch(t){return e.pendingDownloadInternal=void 0,await new Promise((e=>globalThis.setTimeout(e,100))),Ne.diagnosticTracing&&h(`Retrying download (2) '${e.name}' after delay`),await ce(e)}}}async function ce(e){for(;$;)await $.promise;try{++z,z==Ne.maxParallelDownloads&&(Ne.diagnosticTracing&&h("Throttling further parallel downloads"),$=i());const t=await async function(e){if(e.pendingDownload&&(e.pendingDownloadInternal=e.pendingDownload),e.pendingDownloadInternal&&e.pendingDownloadInternal.response)return e.pendingDownloadInternal.response;if(e.buffer){const t=await e.buffer;return e.resolvedUrl||(e.resolvedUrl="undefined://"+e.name),e.pendingDownloadInternal={url:e.resolvedUrl,name:e.name,response:Promise.resolve({ok:!0,arrayBuffer:()=>t,json:()=>JSON.parse(new TextDecoder("utf-8").decode(t)),text:()=>{throw new Error("NotImplementedException")},headers:{get:()=>{}}})},e.pendingDownloadInternal.response}const t=e.loadRemote&&Ne.config.remoteSources?Ne.config.remoteSources:[""];let o;for(let n of t){n=n.trim(),"./"===n&&(n="");const t=de(e,n);e.name===t?Ne.diagnosticTracing&&h(`Attempting to download '${t}'`):Ne.diagnosticTracing&&h(`Attempting to download '${t}' for ${e.name}`);try{e.resolvedUrl=t;const n=ge(e);if(e.pendingDownloadInternal=n,o=await n.response,!o||!o.ok)continue;return o}catch(e){o||(o={ok:!1,url:t,status:0,statusText:""+e});continue}}const n=e.isOptional||e.name.match(/\.pdb$/)&&Ne.config.ignorePdbLoadErrors;if(o||qe(!1,`Response undefined ${e.name}`),!n){const t=new Error(`download '${o.url}' for ${e.name} failed ${o.status} ${o.statusText}`);throw t.status=o.status,t}w(`optional download '${o.url}' for ${e.name} failed ${o.status} ${o.statusText}`)}(e);return t?(Q[e.behavior]||(e.buffer=await t.arrayBuffer(),++Ne.actual_downloaded_assets_count),e):e}finally{if(--z,$&&z==Ne.maxParallelDownloads-1){Ne.diagnosticTracing&&h("Resuming more parallel downloads");const e=$;$=void 0,e.promise_control.resolve()}}}function de(e,t){let o;return null==t&&qe(!1,`sourcePrefix must be provided for ${e.name}`),e.resolvedUrl?o=e.resolvedUrl:(o=""===t?"assembly"===e.behavior||"pdb"===e.behavior?e.name:"resource"===e.behavior&&e.culture&&""!==e.culture?`${e.culture}/${e.name}`:e.name:t+e.name,o=ue(Ne.locateFile(o),e.behavior)),o&&"string"==typeof o||qe(!1,"attemptUrl need to be path or url string"),o}function ue(e,t){return Ne.modulesUniqueQuery&&H[t]&&(e+=Ne.modulesUniqueQuery),e}let me=0;const fe=new Set;function ge(e){try{e.resolvedUrl||qe(!1,"Request's resolvedUrl must be set");const t=function(e){let t=e.resolvedUrl;if(Ne.loadBootResource){const o=he(e);if(o instanceof Promise)return o;"string"==typeof o&&(t=o)}const o={};return e.cache?o.cache=e.cache:Ne.config.disableNoCacheFetch||(o.cache="no-cache"),e.useCredentials?o.credentials="include":!Ne.config.disableIntegrityCheck&&e.hash&&(o.integrity=e.hash),Ne.fetch_like(t,o)}(e),o={name:e.name,url:e.resolvedUrl,response:t};return fe.add(e.name),o.response.then((()=>{"assembly"==e.behavior&&Ne.loadedAssemblies.push(e.name),me++,Ne.onDownloadResourceProgress&&Ne.onDownloadResourceProgress(me,fe.size)})),o}catch(t){const o={ok:!1,url:e.resolvedUrl,status:500,statusText:"ERR29: "+t,arrayBuffer:()=>{throw t},json:()=>{throw t}};return{name:e.name,url:e.resolvedUrl,response:Promise.resolve(o)}}}const pe={resource:"assembly",assembly:"assembly",pdb:"pdb",icu:"globalization",vfs:"configuration",manifest:"manifest",dotnetwasm:"dotnetwasm","js-module-dotnet":"dotnetjs","js-module-native":"dotnetjs","js-module-runtime":"dotnetjs","js-module-threads":"dotnetjs"};function he(e){var t;if(Ne.loadBootResource){const o=null!==(t=e.hash)&&void 0!==t?t:"",n=e.resolvedUrl,r=pe[e.behavior];if(r){const t=Ne.loadBootResource(r,e.name,n,o,e.behavior);return"string"==typeof t?M(t):t}}}function we(e){e.pendingDownloadInternal=null,e.pendingDownload=null,e.buffer=null,e.moduleExports=null}function be(e){let t=e.lastIndexOf("/");return t>=0&&t++,e.substring(t)}async function ye(e){e&&await Promise.all((null!=e?e:[]).map((e=>async function(e){try{const t=e.name;if(!e.moduleExports){const o=ue(Ne.locateFile(t),"js-module-library-initializer");Ne.diagnosticTracing&&h(`Attempting to import '${o}' for ${e}`),e.moduleExports=await import(/*! webpackIgnore: true */o)}Ne.libraryInitializers.push({scriptName:t,exports:e.moduleExports})}catch(t){y(`Failed to import library initializer '${e}': ${t}`)}}(e))))}async function ve(e,t){if(!Ne.libraryInitializers)return;const o=[];for(let n=0;n<Ne.libraryInitializers.length;n++){const r=Ne.libraryInitializers[n];r.exports[e]&&o.push(_e(r.scriptName,e,(()=>r.exports[e](...t))))}await Promise.all(o)}async function _e(e,t,o){try{await o()}catch(o){throw y(`Failed to invoke '${t}' on library initializer '${e}': ${o}`),et(1,o),o}}function Ee(e,t){if(e===t)return e;const o={...t};return void 0!==o.assets&&o.assets!==e.assets&&(o.assets=[...e.assets||[],...o.assets||[]]),void 0!==o.resources&&(o.resources=xe(e.resources||{assembly:[],jsModuleNative:[],jsModuleRuntime:[],wasmNative:[]},o.resources)),void 0!==o.environmentVariables&&(o.environmentVariables={...e.environmentVariables||{},...o.environmentVariables||{}}),void 0!==o.runtimeOptions&&o.runtimeOptions!==e.runtimeOptions&&(o.runtimeOptions=[...e.runtimeOptions||[],...o.runtimeOptions||[]]),Object.assign(e,o)}function Te(e,t){if(e===t)return e;const o={...t};return o.config&&(e.config||(e.config={}),o.config=Ee(e.config,o.config)),Object.assign(e,o)}function xe(e,t){if(e===t)return e;const o={...t};return void 0!==o.coreAssembly&&(o.coreAssembly=[...e.coreAssembly||[],...o.coreAssembly||[]]),void 0!==o.assembly&&(o.assembly=[...e.assembly||[],...o.assembly||[]]),void 0!==o.lazyAssembly&&(o.lazyAssembly=[...e.lazyAssembly||[],...o.lazyAssembly||[]]),void 0!==o.corePdb&&(o.corePdb=[...e.corePdb||[],...o.corePdb||[]]),void 0!==o.pdb&&(o.pdb=[...e.pdb||[],...o.pdb||[]]),void 0!==o.jsModuleWorker&&(o.jsModuleWorker=[...e.jsModuleWorker||[],...o.jsModuleWorker||[]]),void 0!==o.jsModuleNative&&(o.jsModuleNative=[...e.jsModuleNative||[],...o.jsModuleNative||[]]),void 0!==o.jsModuleDiagnostics&&(o.jsModuleDiagnostics=[...e.jsModuleDiagnostics||[],...o.jsModuleDiagnostics||[]]),void 0!==o.jsModuleRuntime&&(o.jsModuleRuntime=[...e.jsModuleRuntime||[],...o.jsModuleRuntime||[]]),void 0!==o.wasmSymbols&&(o.wasmSymbols=[...e.wasmSymbols||[],...o.wasmSymbols||[]]),void 0!==o.wasmNative&&(o.wasmNative=[...e.wasmNative||[],...o.wasmNative||[]]),void 0!==o.icu&&(o.icu=[...e.icu||[],...o.icu||[]]),void 0!==o.satelliteResources&&(o.satelliteResources=function(e,t){if(e===t)return e;for(const o in t)e[o]=[...e[o]||[],...t[o]||[]];return e}(e.satelliteResources||{},o.satelliteResources||{})),void 0!==o.modulesAfterConfigLoaded&&(o.modulesAfterConfigLoaded=[...e.modulesAfterConfigLoaded||[],...o.modulesAfterConfigLoaded||[]]),void 0!==o.modulesAfterRuntimeReady&&(o.modulesAfterRuntimeReady=[...e.modulesAfterRuntimeReady||[],...o.modulesAfterRuntimeReady||[]]),void 0!==o.extensions&&(o.extensions={...e.extensions||{},...o.extensions||{}}),void 0!==o.vfs&&(o.vfs=[...e.vfs||[],...o.vfs||[]]),Object.assign(e,o)}function je(){const e=Ne.config;if(e.environmentVariables=e.environmentVariables||{},e.runtimeOptions=e.runtimeOptions||[],e.resources=e.resources||{assembly:[],jsModuleNative:[],jsModuleWorker:[],jsModuleRuntime:[],wasmNative:[],vfs:[],satelliteResources:{}},e.assets){Ne.diagnosticTracing&&h("config.assets is deprecated, use config.resources instead");for(const t of e.assets){const o={};switch(t.behavior){case"assembly":o.assembly=[t];break;case"pdb":o.pdb=[t];break;case"resource":o.satelliteResources={},o.satelliteResources[t.culture]=[t];break;case"icu":o.icu=[t];break;case"symbols":o.wasmSymbols=[t];break;case"vfs":o.vfs=[t];break;case"dotnetwasm":o.wasmNative=[t];break;case"js-module-threads":o.jsModuleWorker=[t];break;case"js-module-runtime":o.jsModuleRuntime=[t];break;case"js-module-native":o.jsModuleNative=[t];break;case"js-module-diagnostics":o.jsModuleDiagnostics=[t];break;case"js-module-dotnet":break;default:throw new Error(`Unexpected behavior ${t.behavior} of asset ${t.name}`)}xe(e.resources,o)}}e.debugLevel,e.applicationEnvironment||(e.applicationEnvironment="Production"),Number.isInteger(e.pthreadPoolInitialSize)||(e.pthreadPoolInitialSize=5),Number.isInteger(e.pthreadPoolUnusedSize)||(e.pthreadPoolUnusedSize=1),null==e.jsThreadBlockingMode&&(e.jsThreadBlockingMode="PreventSynchronousJSExport"),void 0===e.environmentVariables.MONO_SLEEP_ABORT_LIMIT&&(e.environmentVariables.MONO_SLEEP_ABORT_LIMIT="5000"),e.applicationCulture&&(e.environmentVariables.LANG=`${e.applicationCulture}.UTF-8`),Ue.diagnosticTracing=Ne.diagnosticTracing=!!e.diagnosticTracing,Ue.waitForDebugger=e.waitForDebugger,Ne.maxParallelDownloads=e.maxParallelDownloads||Ne.maxParallelDownloads,Ne.enableDownloadRetry=void 0!==e.enableDownloadRetry?e.enableDownloadRetry:Ne.enableDownloadRetry}let Re=!1;async function Se(e){var t;if(Re)return void await Ne.afterConfigLoaded.promise;let o;try{if(e.configSrc||Ne.config&&0!==Object.keys(Ne.config).length&&(Ne.config.assets||Ne.config.resources)||(e.configSrc="dotnet.boot.js"),o=e.configSrc,Re=!0,o&&(Ne.diagnosticTracing&&h("mono_wasm_load_config"),await async function(e){const t=e.configSrc,o=Ne.locateFile(t);let n=null;void 0!==Ne.loadBootResource&&(n=Ne.loadBootResource("manifest",t,o,"","manifest"));let r,i=null;if(n)if("string"==typeof n)n.includes(".json")?(i=await s(M(n)),r=await Oe(i)):r=(await import(M(n))).config;else{const e=await n;"function"==typeof e.json?(i=e,r=await Oe(i)):r=e.config}else o.includes(".json")?(i=await s(ue(o,"manifest")),r=await Oe(i)):r=(await import(ue(o,"manifest"))).config;function s(e){return Ne.fetch_like(e,{method:"GET",credentials:"include",cache:"no-cache"})}Ne.config.applicationEnvironment&&(r.applicationEnvironment=Ne.config.applicationEnvironment),Ee(Ne.config,r)}(e)),je(),await ye(null===(t=Ne.config.resources)||void 0===t?void 0:t.modulesAfterConfigLoaded),await ve("onRuntimeConfigLoaded",[Ne.config]),e.onConfigLoaded)try{await e.onConfigLoaded(Ne.config,$e),je()}catch(e){throw v("onConfigLoaded() failed",e),e}je(),Ne.afterConfigLoaded.promise_control.resolve(Ne.config)}catch(t){const n=`Failed to load config file ${o} ${t} ${null==t?void 0:t.stack}`;throw Ne.config=e.config=Object.assign(Ne.config,{message:n,error:t,isError:!0}),et(1,new Error(n)),t}}function Ae(){return!!globalThis.navigator&&(Ne.isChromium||Ne.isFirefox)}async function Oe(e){const t=Ne.config,o=await e.json();t.applicationEnvironment||o.applicationEnvironment||(o.applicationEnvironment=e.headers.get("Blazor-Environment")||e.headers.get("DotNet-Environment")||void 0),o.environmentVariables||(o.environmentVariables={});const n=e.headers.get("DOTNET-MODIFIABLE-ASSEMBLIES");n&&(o.environmentVariables.DOTNET_MODIFIABLE_ASSEMBLIES=n);const r=e.headers.get("ASPNETCORE-BROWSER-TOOLS");return r&&(o.environmentVariables.__ASPNETCORE_BROWSER_TOOLS=r),o}"function"!=typeof importScripts||globalThis.onmessage||(globalThis.dotnetSidecar=!0);const De="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,ke="function"==typeof importScripts,Ie=ke&&"undefined"!=typeof dotnetSidecar,Pe=ke&&!Ie,Ce="object"==typeof window||ke&&!De,Me=!Ce&&!De;let Ue={},Ne={},Le={},$e={},ze={},We=!1;const Fe={},Be={config:Fe},Ve={mono:{},binding:{},internal:ze,module:Be,loaderHelpers:Ne,runtimeHelpers:Ue,diagnosticHelpers:Le,api:$e};function qe(e,t){if(e)return;const o="Assert failed: "+("function"==typeof t?t():t),n=new Error(o);v(o,n),Ue.nativeAbort(n)}function Je(){return void 0!==Ne.exitCode}function He(){return Ue.runtimeReady&&!Je()}function Ze(){Je()&&qe(!1,`.NET runtime already exited with ${Ne.exitCode} ${Ne.exitReason}. You can use runtime.runMain() which doesn't exit the runtime.`),Pe?Ue.runtimeReady||qe(!1,"The WebWorker is not attached to the runtime. See https://github.com/dotnet/runtime/blob/main/src/mono/wasm/threads.md#JS-interop-on-dedicated-threads"):Ue.runtimeReady||qe(!1,".NET runtime didn't start yet. Please call dotnet.create() first.")}function Qe(){Ce&&(globalThis.addEventListener("unhandledrejection",ot),globalThis.addEventListener("error",nt))}let Ge,Ke;function Xe(e){Ke&&Ke(e),et(e,Ne.exitReason)}function Ye(e){var t;if(Ge&&Ge(e||Ne.exitReason),(null===(t=Ne.config)||void 0===t?void 0:t.dumpThreadsOnNonZeroExit)&&Ue.mono_wasm_print_thread_dump&&void 0===Ne.exitCode)try{Ue.mono_wasm_print_thread_dump()}catch(e){}et(1,e||Ne.exitReason)}function et(t,o){var n,r;const i=o&&"object"==typeof o;t=i&&"number"==typeof o.status?o.status:void 0===t?-1:t;const s=i&&"string"==typeof o.message?o.message:""+o;(o=i?o:Ue.ExitStatus?function(e,t){const o=new Ue.ExitStatus(e);return o.message=t,o.toString=()=>t,o}(t,s):new Error("Exit with code "+t+" "+s)).status=t,o.message||(o.message=s);const a=""+(o.stack||(new Error).stack);try{Object.defineProperty(o,"stack",{get:()=>a})}catch(e){}const l=!!o.silent;if(o.silent=!0,Je())Ne.diagnosticTracing&&h("mono_exit called after exit");else{try{Be.onAbort==Ye&&(Be.onAbort=Ge),Be.onExit==Xe&&(Be.onExit=Ke),Ce&&(globalThis.removeEventListener("unhandledrejection",ot),globalThis.removeEventListener("error",nt)),Ue.runtimeReady?(Ue.jiterpreter_dump_stats&&Ue.jiterpreter_dump_stats(!1),0===t&&(null===(n=Ne.config)||void 0===n?void 0:n.interopCleanupOnExit)&&Ue.forceDisposeProxies(!0,!0),e&&0!==t&&(null===(r=Ne.config)||void 0===r?void 0:r.dumpThreadsOnNonZeroExit)&&Ue.dumpThreads()):(Ne.diagnosticTracing&&h(`abort_startup, reason: ${o}`),function(e){Ne.allDownloadsQueued.promise_control.reject(e),Ne.allDownloadsFinished.promise_control.reject(e),Ne.afterConfigLoaded.promise_control.reject(e),Ne.wasmCompilePromise.promise_control.reject(e),Ne.runtimeModuleLoaded.promise_control.reject(e),Ue.dotnetReady&&(Ue.dotnetReady.promise_control.reject(e),Ue.afterInstantiateWasm.promise_control.reject(e),Ue.beforePreInit.promise_control.reject(e),Ue.afterPreInit.promise_control.reject(e),Ue.afterPreRun.promise_control.reject(e),Ue.beforeOnRuntimeInitialized.promise_control.reject(e),Ue.afterOnRuntimeInitialized.promise_control.reject(e),Ue.afterPostRun.promise_control.reject(e))}(o))}catch(e){y("mono_exit A failed",e)}try{l||(function(e,t){if(0!==e&&t){const e=Ue.ExitStatus&&t instanceof Ue.ExitStatus?h:v;"string"==typeof t?e(t):(void 0===t.stack&&(t.stack=(new Error).stack+""),t.message?e(Ue.stringify_as_error_with_stack?Ue.stringify_as_error_with_stack(t.message+"\n"+t.stack):t.message+"\n"+t.stack):e(JSON.stringify(t)))}!Pe&&Ne.config&&(Ne.config.logExitCode?Ne.config.forwardConsoleLogsToWS?S("WASM EXIT "+e):b("WASM EXIT "+e):Ne.config.forwardConsoleLogsToWS&&S())}(t,o),function(e){if(Ce&&!Pe&&Ne.config&&Ne.config.appendElementOnExit&&document){const t=document.createElement("label");t.id="tests_done",0!==e&&(t.style.background="red"),t.innerHTML=""+e,document.body.appendChild(t)}}(t))}catch(e){y("mono_exit B failed",e)}Ne.exitCode=t,Ne.exitReason||(Ne.exitReason=o),!Pe&&Ue.runtimeReady&&Be.runtimeKeepalivePop()}if(Ne.config&&Ne.config.asyncFlushOnExit&&0===t)throw(async()=>{try{await async function(){try{const e=await import(/*! webpackIgnore: true */"process"),t=e=>new Promise(((t,o)=>{e.on("error",o),e.end("","utf8",t)})),o=t(e.stderr),n=t(e.stdout);let r;const i=new Promise((e=>{r=setTimeout((()=>e("timeout")),1e3)}));await Promise.race([Promise.all([n,o]),i]),clearTimeout(r)}catch(e){v(`flushing std* streams failed: ${e}`)}}()}finally{tt(t,o)}})(),o;tt(t,o)}function tt(e,t){if(Pe&&Ue.runtimeReady&&Ue.nativeAbort)throw Ue.nativeAbort(t),t;if(Ue.runtimeReady&&Ue.nativeExit)try{Ue.nativeExit(e)}catch(e){!Ue.ExitStatus||e instanceof Ue.ExitStatus||y("set_exit_code_and_quit_now failed: "+e.toString())}if(0!==e||!Ce)throw De&&ze.process?ze.process.exit(e):Ue.quit&&Ue.quit(e,t),t}function ot(e){rt(e,e.reason,"rejection")}function nt(e){rt(e,e.error,"error")}function rt(e,t,o){e.preventDefault();try{t||(t=new Error("Unhandled "+o)),void 0===t.stack&&(t.stack=(new Error).stack),t.stack=t.stack+"",t.silent||(v("Unhandled error:",t),et(1,t))}catch(e){}}!function(e){if(We)throw new Error("Loader module already loaded");We=!0,Ue=e.runtimeHelpers,Ne=e.loaderHelpers,Le=e.diagnosticHelpers,$e=e.api,ze=e.internal,Object.assign($e,{INTERNAL:ze,invokeLibraryInitializers:ve}),Object.assign(e.module,{config:Ee(Fe,{environmentVariables:{}})});const r={mono_wasm_bindings_is_ready:!1,config:e.module.config,diagnosticTracing:!1,nativeAbort:e=>{throw e||new Error("abort")},nativeExit:e=>{throw new Error("exit:"+e)}},l={gitHash:"95017c711e6afc1085133d440e42b4bd78155701",config:e.module.config,diagnosticTracing:!1,maxParallelDownloads:16,enableDownloadRetry:!0,_loaded_files:[],loadedFiles:[],loadedAssemblies:[],libraryInitializers:[],workerNextNumber:1,actual_downloaded_assets_count:0,actual_instantiated_assets_count:0,expected_downloaded_assets_count:0,expected_instantiated_assets_count:0,afterConfigLoaded:i(),allDownloadsQueued:i(),allDownloadsFinished:i(),wasmCompilePromise:i(),runtimeModuleLoaded:i(),loadingWorkers:i(),is_exited:Je,is_runtime_running:He,assert_runtime_running:Ze,mono_exit:et,createPromiseController:i,getPromiseController:s,assertIsControllablePromise:a,mono_download_assets:re,resolve_single_asset_path:oe,setup_proxy_console:R,set_thread_prefix:p,installUnhandledErrorHandler:Qe,retrieve_asset_download:ae,invokeLibraryInitializers:ve,isDebuggingSupported:Ae,exceptions:t,simd:n,relaxedSimd:o};Object.assign(Ue,r),Object.assign(Ne,l)}(Ve);let it,st,at,lt=!1,ct=!1;async function dt(e){if(!ct){if(ct=!0,Ce&&Ne.config.forwardConsoleLogsToWS&&void 0!==globalThis.WebSocket&&R("main",globalThis.console,globalThis.location.origin),Be||qe(!1,"Null moduleConfig"),Ne.config||qe(!1,"Null moduleConfig.config"),"function"==typeof e){const t=e(Ve.api);if(t.ready)throw new Error("Module.ready couldn't be redefined.");Object.assign(Be,t),Te(Be,t)}else{if("object"!=typeof e)throw new Error("Can't use moduleFactory callback of createDotnetRuntime function.");Te(Be,e)}await async function(e){if(De){const e=await import(/*! webpackIgnore: true */"process"),t=14;if(e.versions.node.split(".")[0]<t)throw new Error(`NodeJS at '${e.execPath}' has too low version '${e.versions.node}', please use at least ${t}. See also https://aka.ms/dotnet-wasm-features`)}const t=/*! webpackIgnore: true */import.meta.url,o=t.indexOf("?");var n;if(o>0&&(Ne.modulesUniqueQuery=t.substring(o)),Ne.scriptUrl=t.replace(/\\/g,"/").replace(/[?#].*/,""),Ne.scriptDirectory=(n=Ne.scriptUrl).slice(0,n.lastIndexOf("/"))+"/",Ne.locateFile=e=>"URL"in globalThis&&globalThis.URL!==P?new URL(e,Ne.scriptDirectory).toString():L(e)?e:Ne.scriptDirectory+e,Ne.fetch_like=C,Ne.out=console.log,Ne.err=console.error,Ne.onDownloadResourceProgress=e.onDownloadResourceProgress,Ce&&globalThis.navigator){const e=globalThis.navigator,t=e.userAgentData&&e.userAgentData.brands;t&&t.length>0?Ne.isChromium=t.some((e=>"Google Chrome"===e.brand||"Microsoft Edge"===e.brand||"Chromium"===e.brand)):e.userAgent&&(Ne.isChromium=e.userAgent.includes("Chrome"),Ne.isFirefox=e.userAgent.includes("Firefox"))}ze.require=De?await import(/*! webpackIgnore: true */"module").then((e=>e.createRequire(/*! webpackIgnore: true */import.meta.url))):Promise.resolve((()=>{throw new Error("require not supported")})),void 0===globalThis.URL&&(globalThis.URL=P)}(Be)}}async function ut(e){return await dt(e),Ge=Be.onAbort,Ke=Be.onExit,Be.onAbort=Ye,Be.onExit=Xe,Be.ENVIRONMENT_IS_PTHREAD?async function(){(function(){const e=new MessageChannel,t=e.port1,o=e.port2;t.addEventListener("message",(e=>{var n,r;n=JSON.parse(e.data.config),r=JSON.parse(e.data.monoThreadInfo),lt?Ne.diagnosticTracing&&h("mono config already received"):(Ee(Ne.config,n),Ue.monoThreadInfo=r,je(),Ne.diagnosticTracing&&h("mono config received"),lt=!0,Ne.afterConfigLoaded.promise_control.resolve(Ne.config),Ce&&n.forwardConsoleLogsToWS&&void 0!==globalThis.WebSocket&&Ne.setup_proxy_console("worker-idle",console,globalThis.location.origin)),t.close(),o.close()}),{once:!0}),t.start(),self.postMessage({[l]:{monoCmd:"preload",port:o}},[o])})(),await Ne.afterConfigLoaded.promise,function(){const e=Ne.config;e.assets||qe(!1,"config.assets must be defined");for(const t of e.assets)ee(t),K[t.behavior]&&F.push(t)}(),setTimeout((async()=>{try{await re()}catch(e){et(1,e)}}),0);const e=mt(),t=await Promise.all(e);return await ft(t),Be}():async function(){var e;await Se(Be),se();const t=mt();(async function(){try{const e=oe("dotnetwasm");await le(e),e&&e.pendingDownloadInternal&&e.pendingDownloadInternal.response||qe(!1,"Can't load dotnet.native.wasm");const t=await e.pendingDownloadInternal.response,o=t.headers&&t.headers.get?t.headers.get("Content-Type"):void 0;let n;if("function"==typeof WebAssembly.compileStreaming&&"application/wasm"===o)n=await WebAssembly.compileStreaming(t);else{Ce&&"application/wasm"!==o&&y('WebAssembly resource does not have the expected content type "application/wasm", so falling back to slower ArrayBuffer instantiation.');const e=await t.arrayBuffer();Ne.diagnosticTracing&&h("instantiate_wasm_module buffered"),n=Me?await Promise.resolve(new WebAssembly.Module(e)):await WebAssembly.compile(e)}e.pendingDownloadInternal=null,e.pendingDownload=null,e.buffer=null,e.moduleExports=null,Ne.wasmCompilePromise.promise_control.resolve(n)}catch(e){Ne.wasmCompilePromise.promise_control.reject(e)}})(),setTimeout((async()=>{try{k(),function(){const e=oe("js-module-threads"),t=[];for(let o=0;o<Ne.config.pthreadPoolInitialSize;o++){const o=Ne.workerNextNumber++,n=new Worker(e.resolvedUrl,{name:"dotnet-worker-"+o.toString().padStart(3,"0"),type:"module"});n.info={workerNumber:o,pthreadId:0,reuseCount:0,updateCount:0,threadPrefix:"          -    ",threadName:"emscripten-pool"},t.push(n)}Ne.loadingWorkers.promise_control.resolve(t)}(),await re()}catch(e){et(1,e)}}),0);const o=await Promise.all(t);return await ft(o),await Ue.dotnetReady.promise,await ye(null===(e=Ne.config.resources)||void 0===e?void 0:e.modulesAfterRuntimeReady),await ve("onRuntimeReady",[Ve.api]),$e}()}function mt(){const e=oe("js-module-runtime"),t=oe("js-module-native");if(it&&st)return[it,st,at];"object"==typeof e.moduleExports?it=e.moduleExports:(Ne.diagnosticTracing&&h(`Attempting to import '${e.resolvedUrl}' for ${e.name}`),it=import(/*! webpackIgnore: true */e.resolvedUrl)),"object"==typeof t.moduleExports?st=t.moduleExports:(Ne.diagnosticTracing&&h(`Attempting to import '${t.resolvedUrl}' for ${t.name}`),st=import(/*! webpackIgnore: true */t.resolvedUrl));const o=te("js-module-diagnostics");return o&&("object"==typeof o.moduleExports?at=o.moduleExports:(Ne.diagnosticTracing&&h(`Attempting to import '${o.resolvedUrl}' for ${o.name}`),at=import(/*! webpackIgnore: true */o.resolvedUrl))),[it,st,at]}async function ft(e){const{initializeExports:t,initializeReplacements:o,configureRuntimeStartup:n,configureEmscriptenStartup:r,configureWorkerStartup:i,setRuntimeGlobals:s,passEmscriptenInternals:a}=e[0],{default:l}=e[1],c=e[2];s(Ve),t(Ve),c&&c.setRuntimeGlobals(Ve),await n(Be),Ne.runtimeModuleLoaded.promise_control.resolve(),l((e=>(Object.assign(Be,{ready:e.ready,__dotnet_runtime:{initializeReplacements:o,configureEmscriptenStartup:r,configureWorkerStartup:i,passEmscriptenInternals:a}}),Be))).catch((e=>{if(e.message&&e.message.toLowerCase().includes("out of memory"))throw new Error(".NET runtime has failed to start, because too much memory was requested. Please decrease the memory by adjusting EmccMaximumHeapSize. See also https://aka.ms/dotnet-wasm-features");throw e}))}const gt=new class{withModuleConfig(e){try{return Te(Be,e),this}catch(e){throw et(1,e),e}}withOnConfigLoaded(e){try{return Te(Be,{onConfigLoaded:e}),this}catch(e){throw et(1,e),e}}withConsoleForwarding(){try{return Ee(Fe,{forwardConsoleLogsToWS:!0}),this}catch(e){throw et(1,e),e}}withExitOnUnhandledError(){try{return Ee(Fe,{exitOnUnhandledError:!0}),Qe(),this}catch(e){throw et(1,e),e}}withAsyncFlushOnExit(){try{return Ee(Fe,{asyncFlushOnExit:!0}),this}catch(e){throw et(1,e),e}}withExitCodeLogging(){try{return Ee(Fe,{logExitCode:!0}),this}catch(e){throw et(1,e),e}}withElementOnExit(){try{return Ee(Fe,{appendElementOnExit:!0}),this}catch(e){throw et(1,e),e}}withInteropCleanupOnExit(){try{return Ee(Fe,{interopCleanupOnExit:!0}),this}catch(e){throw et(1,e),e}}withDumpThreadsOnNonZeroExit(){try{return Ee(Fe,{dumpThreadsOnNonZeroExit:!0}),this}catch(e){throw et(1,e),e}}withWaitingForDebugger(e){try{return Ee(Fe,{waitForDebugger:e}),this}catch(e){throw et(1,e),e}}withInterpreterPgo(e,t){try{return Ee(Fe,{interpreterPgo:e,interpreterPgoSaveDelay:t}),Fe.runtimeOptions?Fe.runtimeOptions.push("--interp-pgo-recording"):Fe.runtimeOptions=["--interp-pgo-recording"],this}catch(e){throw et(1,e),e}}withConfig(e){try{return Ee(Fe,e),this}catch(e){throw et(1,e),e}}withConfigSrc(e){try{return e&&"string"==typeof e||qe(!1,"must be file path or URL"),Te(Be,{configSrc:e}),this}catch(e){throw et(1,e),e}}withVirtualWorkingDirectory(e){try{return e&&"string"==typeof e||qe(!1,"must be directory path"),Ee(Fe,{virtualWorkingDirectory:e}),this}catch(e){throw et(1,e),e}}withEnvironmentVariable(e,t){try{const o={};return o[e]=t,Ee(Fe,{environmentVariables:o}),this}catch(e){throw et(1,e),e}}withEnvironmentVariables(e){try{return e&&"object"==typeof e||qe(!1,"must be dictionary object"),Ee(Fe,{environmentVariables:e}),this}catch(e){throw et(1,e),e}}withDiagnosticTracing(e){try{return"boolean"!=typeof e&&qe(!1,"must be boolean"),Ee(Fe,{diagnosticTracing:e}),this}catch(e){throw et(1,e),e}}withDebugging(e){try{return null!=e&&"number"==typeof e||qe(!1,"must be number"),Ee(Fe,{debugLevel:e}),this}catch(e){throw et(1,e),e}}withApplicationArguments(...e){try{return e&&Array.isArray(e)||qe(!1,"must be array of strings"),Ee(Fe,{applicationArguments:e}),this}catch(e){throw et(1,e),e}}withRuntimeOptions(e){try{return e&&Array.isArray(e)||qe(!1,"must be array of strings"),Fe.runtimeOptions?Fe.runtimeOptions.push(...e):Fe.runtimeOptions=e,this}catch(e){throw et(1,e),e}}withMainAssembly(e){try{return Ee(Fe,{mainAssemblyName:e}),this}catch(e){throw et(1,e),e}}withApplicationArgumentsFromQuery(){try{if(!globalThis.window)throw new Error("Missing window to the query parameters from");if(void 0===globalThis.URLSearchParams)throw new Error("URLSearchParams is supported");const e=new URLSearchParams(globalThis.window.location.search).getAll("arg");return this.withApplicationArguments(...e)}catch(e){throw et(1,e),e}}withApplicationEnvironment(e){try{return Ee(Fe,{applicationEnvironment:e}),this}catch(e){throw et(1,e),e}}withApplicationCulture(e){try{return Ee(Fe,{applicationCulture:e}),this}catch(e){throw et(1,e),e}}withResourceLoader(e){try{return Ne.loadBootResource=e,this}catch(e){throw et(1,e),e}}async download(){try{await async function(){dt(Be),await Se(Be),se(),k(),re(),await Ne.allDownloadsFinished.promise}()}catch(e){throw et(1,e),e}}async create(){try{return this.instance||(this.instance=await async function(){return await ut(Be),Ve.api}()),this.instance}catch(e){throw et(1,e),e}}async run(){try{return Be.config||qe(!1,"Null moduleConfig.config"),this.instance||await this.create(),this.instance.runMainAndExit()}catch(e){throw et(1,e),e}}},pt=et,ht=ut;Me||"function"==typeof globalThis.URL||qe(!1,"This browser/engine doesn't support URL API. Please use a modern version. See also https://aka.ms/dotnet-wasm-features"),"function"!=typeof globalThis.BigInt64Array&&qe(!1,"This browser/engine doesn't support BigInt64Array API. Please use a modern version. See also https://aka.ms/dotnet-wasm-features"),(Me||De)&&qe(!1,"This build of dotnet is multi-threaded, it doesn't support shell environments like V8 or NodeJS. See also https://aka.ms/dotnet-wasm-features"),void 0===globalThis.SharedArrayBuffer&&qe(!1,"SharedArrayBuffer is not enabled on this page. Please use a modern browser and set Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy http headers. See also https://aka.ms/dotnet-wasm-features"),"function"!=typeof globalThis.EventTarget&&qe(!1,"This browser/engine doesn't support EventTarget API. Please use a modern version. See also https://aka.ms/dotnet-wasm-features"),gt.withConfig(/*json-start*/{
  "mainAssemblyName": "osu.Web",
  "resources": {
    "hash": "sha256-6+Can9Q0tKOfFEuagQyeIs66CZkXx/Q7Mj7RRQQ67Jc=",
    "jsModuleWorker": [
      {
        "name": "dotnet.native.worker.8duaz980cg.mjs"
      }
    ],
    "jsModuleNative": [
      {
        "name": "dotnet.native.97y4ig0d15.js"
      }
    ],
    "jsModuleRuntime": [
      {
        "name": "dotnet.runtime.mfs72m3m3i.js"
      }
    ],
    "wasmNative": [
      {
        "name": "dotnet.native.1h55uk4ho3.wasm",
        "hash": "sha256-CyekSHe6H2W9Clrc/PxSlWfuQtMHdS8HMV2hFREa9kY=",
        "cache": "force-cache"
      }
    ],
    "icu": [
      {
        "virtualPath": "icudt_CJK.dat",
        "name": "icudt_CJK.tjcz0u77k5.dat",
        "hash": "sha256-SZLtQnRc0JkwqHab0VUVP7T3uBPSeYzxzDnpxPpUnHk=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "icudt_EFIGS.dat",
        "name": "icudt_EFIGS.tptq2av103.dat",
        "hash": "sha256-8fItetYY8kQ0ww6oxwTLiT3oXlBwHKumbeP2pRF4yTc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "icudt_no_CJK.dat",
        "name": "icudt_no_CJK.lfu7j35m59.dat",
        "hash": "sha256-L7sV7NEYP37/Qr2FPCePo5cJqRgTXRwGHuwF5Q+0Nfs=",
        "cache": "force-cache"
      }
    ],
    "coreAssembly": [
      {
        "virtualPath": "AutoMapper.wasm",
        "name": "AutoMapper.wprof9o37n.wasm",
        "hash": "sha256-rOqGwP3m/9T8wX+duKWikSlr+go4Z4R5JNc+7Wo9JLs=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Commons.Music.Midi.wasm",
        "name": "Commons.Music.Midi.g9g2oiz0og.wasm",
        "hash": "sha256-1I5vMeS63nEixRnfh7vleKcz/1WVnBgf6Z+j6Fcg0aM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "DiffPlex.wasm",
        "name": "DiffPlex.31ty50f5ui.wasm",
        "hash": "sha256-ieOXxrfPxb+Uk/ya8yeHwlB+TsUoxvRjSrGP2Y3vNDI=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "FFmpeg.AutoGen.wasm",
        "name": "FFmpeg.AutoGen.bw2kl3d1w6.wasm",
        "hash": "sha256-q3xy9pgTvDpMOYQbRfSdSEZFeZSLU+hQqmMc3elbo6g=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "HidSharpCore.wasm",
        "name": "HidSharpCore.c6a3mco1wf.wasm",
        "hash": "sha256-RJypTH4iuncUrHmVOiWTYFC9ObDqnwYwE1qSDiktMo4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "HtmlAgilityPack.wasm",
        "name": "HtmlAgilityPack.950vivd1kf.wasm",
        "hash": "sha256-fVC/fiQeQF8VkdS22xxD2GpxWd3juVmDFBQFd8eQ9t8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Humanizer.wasm",
        "name": "Humanizer.37nwun0amc.wasm",
        "hash": "sha256-kagOJL2dolmFNHuCalcGbSGGsL9FrnUY8B1PvEI9KSo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "JetBrains.Annotations.wasm",
        "name": "JetBrains.Annotations.g0rovi1oie.wasm",
        "hash": "sha256-wLV67W73QSh29CB+LnGA+GPBp1LmOV/bkYfpjq1Purk=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Markdig.wasm",
        "name": "Markdig.42a9e3ollz.wasm",
        "hash": "sha256-1OoMsONu1fr8S1YVzcKYhGWhngECSRnDtUCWfvTTCGk=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "MessagePack.Annotations.wasm",
        "name": "MessagePack.Annotations.c9soiu37e0.wasm",
        "hash": "sha256-8OByM4BSyAP8hhcqxogemOavBZHGPXwaa9b9z6Gv0n8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "MessagePack.wasm",
        "name": "MessagePack.eicyfncfpn.wasm",
        "hash": "sha256-KuEy/u4KZfO0kdflPP4bLzt8sKfplVo60tN+ixzCrZQ=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.AspNetCore.Connections.Abstractions.wasm",
        "name": "Microsoft.AspNetCore.Connections.Abstractions.c1qzk7wc2b.wasm",
        "hash": "sha256-cIHQkCZKEt7u3rUFJiA/vb9+5sPp4puvZkaxjwVApkU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.AspNetCore.Http.Connections.Client.wasm",
        "name": "Microsoft.AspNetCore.Http.Connections.Client.01i89q174p.wasm",
        "hash": "sha256-RC7c3lVebT8jP/abeEYNvVV0FnVfi5lni49Pnx5pl+o=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.AspNetCore.Http.Connections.Common.wasm",
        "name": "Microsoft.AspNetCore.Http.Connections.Common.v3lnn4ew66.wasm",
        "hash": "sha256-ZU5ePm3UuRWbDKnTRbBLyrgz1HW0eaAqj3Q2ZdTmy1o=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.AspNetCore.SignalR.Client.Core.wasm",
        "name": "Microsoft.AspNetCore.SignalR.Client.Core.jikqzcpanx.wasm",
        "hash": "sha256-pVJa66yx1/6qa8kqCku/IEdMkx0Xij8dFvYjYBBGfOM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.AspNetCore.SignalR.Client.wasm",
        "name": "Microsoft.AspNetCore.SignalR.Client.i2ecy70mlj.wasm",
        "hash": "sha256-xs9KwS4QXXLOWBbzViAkA6KezByjqy3pp6y/wrqWhkI=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.AspNetCore.SignalR.Common.wasm",
        "name": "Microsoft.AspNetCore.SignalR.Common.vxh7nnuco8.wasm",
        "hash": "sha256-k2kO7fWnLykb8Pf3e0s5s7cBISR/PfzF48YXnvEEOjg=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.AspNetCore.SignalR.Protocols.Json.wasm",
        "name": "Microsoft.AspNetCore.SignalR.Protocols.Json.j2wgy9kx5a.wasm",
        "hash": "sha256-W6zDn/BKhTJ1t1fcthMwX86zSYcuL4mcy3YHUJJPx4s=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.AspNetCore.SignalR.Protocols.MessagePack.wasm",
        "name": "Microsoft.AspNetCore.SignalR.Protocols.MessagePack.akdv39yyun.wasm",
        "hash": "sha256-ap3R1WkzsVUUyPCUIPNOwHaOA+F1uaSXegr1jXXty5Q=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.AspNetCore.SignalR.Protocols.NewtonsoftJson.wasm",
        "name": "Microsoft.AspNetCore.SignalR.Protocols.NewtonsoftJson.9c6nun9xzy.wasm",
        "hash": "sha256-JxYxUQe3lqmEnTcUYpMZWLl6vSo7YkP3GOXKdGz4V5I=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.CSharp.wasm",
        "name": "Microsoft.CSharp.ckdxq01uom.wasm",
        "hash": "sha256-FFOTBPqY2m+90/Tm5+ib3Mafg9DFojoaMjdFh5hc3CU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Data.Sqlite.wasm",
        "name": "Microsoft.Data.Sqlite.1r6ddockbm.wasm",
        "hash": "sha256-bbAaqOt2mCpVnH28sMakZ8keQjriVA+tV4/vsVuamQ0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Diagnostics.NETCore.Client.wasm",
        "name": "Microsoft.Diagnostics.NETCore.Client.dnyu0b9thn.wasm",
        "hash": "sha256-Fxkj7J38PjuWO31ERL9s0Rn1uq4PL4funIbWIDWUUOU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Diagnostics.Runtime.wasm",
        "name": "Microsoft.Diagnostics.Runtime.l6akk7lw3f.wasm",
        "hash": "sha256-cy8j3+hemgr/g3dihO2xFtFZGe8zW4DTSyRW2LdE9Iw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Extensions.Configuration.Abstractions.wasm",
        "name": "Microsoft.Extensions.Configuration.Abstractions.0po36xwfef.wasm",
        "hash": "sha256-xElt0lRMKi0LJDIQsO2ym04ZPMOI2n+F6DQfTIuPm1Y=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Extensions.DependencyInjection.wasm",
        "name": "Microsoft.Extensions.DependencyInjection.aztlca80fu.wasm",
        "hash": "sha256-+gDzCLyJagmOiFWZvjRsNqzO5LaqEL/P4WArBXkVZx0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Extensions.DependencyInjection.Abstractions.wasm",
        "name": "Microsoft.Extensions.DependencyInjection.Abstractions.nvndk4qntj.wasm",
        "hash": "sha256-Iz79SxtRnB1kRcDUV3gc9UbSPlkgeluw5uueiLY81VA=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Extensions.Features.wasm",
        "name": "Microsoft.Extensions.Features.90h3uic0aq.wasm",
        "hash": "sha256-J2Fmf/8ZMELZoOdmw3sLCXcNhL5h3kXwmg6YgaOw3l4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Extensions.Logging.Abstractions.wasm",
        "name": "Microsoft.Extensions.Logging.Abstractions.ezgkcw7qdz.wasm",
        "hash": "sha256-BnGU0DWgbrWa33svyFbopuqfp18JTgRRWdGTzOPbX3Q=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Extensions.Logging.wasm",
        "name": "Microsoft.Extensions.Logging.87k0fythn3.wasm",
        "hash": "sha256-vFI7JjZSntXHK+A3ymf12EflfGKN+MYQ3MvMJ+WwcEE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Extensions.ObjectPool.wasm",
        "name": "Microsoft.Extensions.ObjectPool.u1aj21jdz4.wasm",
        "hash": "sha256-og92vOKFO8gPXZE3cMRyoDeXiY/wqsjmc8gD3j2w0Pg=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Extensions.Options.wasm",
        "name": "Microsoft.Extensions.Options.4t74hhz8pt.wasm",
        "hash": "sha256-iMWpRpZgsehPtnht/BYKsuSnmxSUxEQESeKPlq8oeNw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Extensions.Primitives.wasm",
        "name": "Microsoft.Extensions.Primitives.63nnlofdxu.wasm",
        "hash": "sha256-XmYBXJrENYfL8LP2MY+1Ar6fVtXXcjwmiYpFZZhCvZw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.NET.StringTools.wasm",
        "name": "Microsoft.NET.StringTools.rg8qrbve0x.wasm",
        "hash": "sha256-pdv1fLzPQCWrjc2bRVjC+luHmvdsn8hQj+rQbplnGPU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Toolkit.HighPerformance.wasm",
        "name": "Microsoft.Toolkit.HighPerformance.gpmlxw07vt.wasm",
        "hash": "sha256-zJi3ahBJNvyvb+Mi2FqvYGs7H+ITKxaud0H+mE9UTJw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.VisualBasic.wasm",
        "name": "Microsoft.VisualBasic.0e5fchkecn.wasm",
        "hash": "sha256-+AZA2Jpi7YedyPg/Z7OAvV4jcPpueAU4ylSeRvJDt80=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.VisualBasic.Core.wasm",
        "name": "Microsoft.VisualBasic.Core.a70qzz6jmr.wasm",
        "hash": "sha256-hhLzwCpdQ8QwqoMowxhx75AaNLYICxOLvkDruZ41Vww=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Win32.Primitives.wasm",
        "name": "Microsoft.Win32.Primitives.20fh4wdtv3.wasm",
        "hash": "sha256-zoWsy12vp6HP+IecbmtpCYRyJCkCOPSDiUmWXjZrlBo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Microsoft.Win32.Registry.wasm",
        "name": "Microsoft.Win32.Registry.knk32ifdit.wasm",
        "hash": "sha256-sHrJo1pHxoD+Bj24m3R23AnhJmOaKk2NUSD6fK8OGHU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "MongoDB.Bson.wasm",
        "name": "MongoDB.Bson.ftf49pcbdu.wasm",
        "hash": "sha256-7allKpAsHQ3jEVdSpmUtgpQjbyPE/Ozwda0DDwvi9KE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Newtonsoft.Json.wasm",
        "name": "Newtonsoft.Json.7nwps67rq0.wasm",
        "hash": "sha256-feprp68G4fjzgl8foBviyM7L09pKFutDzpqksES4xIE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "OpenTabletDriver.Configurations.wasm",
        "name": "OpenTabletDriver.Configurations.98ps43dgc1.wasm",
        "hash": "sha256-ua6yfOo6eQNjdJrwxXx1mqDyh61WT2+rhd0lkjTkre8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "OpenTabletDriver.Native.wasm",
        "name": "OpenTabletDriver.Native.pb3gba32hz.wasm",
        "hash": "sha256-1XfmB/cTS8d047LFqsXL/rXY0/Wr14hXvTYIIcJVTn4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "OpenTabletDriver.Plugin.wasm",
        "name": "OpenTabletDriver.Plugin.pskgw8to08.wasm",
        "hash": "sha256-tyKQg9OEKmyh8VxGA5CZ9U3hXDxGR3kVPNcvsvbb99A=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "OpenTabletDriver.wasm",
        "name": "OpenTabletDriver.eipar0a4m6.wasm",
        "hash": "sha256-WsVWuBwuXoORSFyF6ghrpx1yiwRybUPHZlM8dhS8NGs=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Realm.wasm",
        "name": "Realm.w1za977oy1.wasm",
        "hash": "sha256-9GRuK6aNFzJz2TBrtaFqv5eMtpCm8ckODZcHcAdGIjA=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Remotion.Linq.wasm",
        "name": "Remotion.Linq.n1mea1y1jx.wasm",
        "hash": "sha256-G7X6xD/Bew4yb7YQj9tqFH+WibaPPQvmmghuQdvg3FU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "SDL2-CS.wasm",
        "name": "SDL2-CS.ot6agg504f.wasm",
        "hash": "sha256-DOFmy6D0E2dXF/WCX3aTxbi9jGHx41ms5IjvXOc1xKQ=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "SDL3-CS.wasm",
        "name": "SDL3-CS.mdqlxgj8jk.wasm",
        "hash": "sha256-Nla12u6JhIiZ81Hj3MGqt2f2yTsVSnLcMYbVJejiaNs=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "SQLitePCLRaw.batteries_v2.wasm",
        "name": "SQLitePCLRaw.batteries_v2.ps6yf84j1b.wasm",
        "hash": "sha256-6eWV05bRew8sP8F19s83Ls1+R/WsRicWUoJBoqraOE0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "SQLitePCLRaw.core.wasm",
        "name": "SQLitePCLRaw.core.en3nz220k3.wasm",
        "hash": "sha256-xiLbgx3SaP3J9v7cOMEz3NlkPXX779Uu4DzZ55L37XU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "SQLitePCLRaw.provider.e_sqlite3.wasm",
        "name": "SQLitePCLRaw.provider.e_sqlite3.43duazkvm7.wasm",
        "hash": "sha256-wFNDHzVPO0he7qwPrPQU+NFKYqt86Xr+uh2/fIhUvo4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Sentry.wasm",
        "name": "Sentry.qovcj7ebrl.wasm",
        "hash": "sha256-lsX2L6GPqEruEDFIyTS+WnxX2rj2nfJzPyRUrSbptNU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "SharpCompress.wasm",
        "name": "SharpCompress.rm35za72ve.wasm",
        "hash": "sha256-XQMEWBTajmiCLFA4lkBrSMY/A7r7stkigtlIZgSZJ58=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "SharpFNT.wasm",
        "name": "SharpFNT.2ouyzor4op.wasm",
        "hash": "sha256-wuIkfcvIci07WhZBmkcPiSIDbpSaCxz/aikedaARa4U=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "SharpGen.Runtime.wasm",
        "name": "SharpGen.Runtime.1myi7cvl22.wasm",
        "hash": "sha256-Rzk3xxb6ISrJzj45fixLlPqnIsR/p2UvZU0jbbSAYe4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "SharpGen.Runtime.COM.wasm",
        "name": "SharpGen.Runtime.COM.kmpgdete53.wasm",
        "hash": "sha256-vFqrdjcTOn9e+zHlWajq3jNpZCMrcai7kNXKxoxrh3Q=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "SixLabors.ImageSharp.wasm",
        "name": "SixLabors.ImageSharp.fqfpg92tjg.wasm",
        "hash": "sha256-GbD1VliMDUH8IgEjtdiKGTl8ulJ0wsaPxoReZ0iqUxg=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "StbiSharp.wasm",
        "name": "StbiSharp.r7eokk0i61.wasm",
        "hash": "sha256-Cb5+ochlvMPQ7sXEpYJxtQA3Dq1xKIBBKvsm6GQRepM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.wasm",
        "name": "System.3ema1lmm3n.wasm",
        "hash": "sha256-24R0nyeRs7RGnzKBxgY6qJjvUGf4IANIElLbnuqN0cI=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.AppContext.wasm",
        "name": "System.AppContext.jwujeh069z.wasm",
        "hash": "sha256-M1WENJWA+3wr2NvHhLXh44JWWE4VVZag928GiVWbXG0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Buffers.wasm",
        "name": "System.Buffers.y0isk1x97h.wasm",
        "hash": "sha256-QtI7D2XiD7NyCRDNW7Q5jPY5RrljqkJWOofJWLBpLOo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Collections.Concurrent.wasm",
        "name": "System.Collections.Concurrent.7yxdmbq4u3.wasm",
        "hash": "sha256-4ZCS4zJwGMXqZaXIw2fem2Op73utTlwaHdIdsINnRAM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Collections.Immutable.wasm",
        "name": "System.Collections.Immutable.q77wxy8v50.wasm",
        "hash": "sha256-ekqaqyEasX6XRJ0DtflKCtejpkcZX61t5h27QZYnFM8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Collections.NonGeneric.wasm",
        "name": "System.Collections.NonGeneric.3k2h89tsfa.wasm",
        "hash": "sha256-M8MTtgU8FvV2LZL/bHn6lMsJ/m+tVuOApSJ/9t+I78k=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Collections.Specialized.wasm",
        "name": "System.Collections.Specialized.op4mb98brb.wasm",
        "hash": "sha256-XLDlF9dxrLlkhOBvL2lQEmK8mIkmAIlcCcXjS/ct1v0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Collections.wasm",
        "name": "System.Collections.mgjm1kcvkv.wasm",
        "hash": "sha256-+gJDy+jaFwqfUI10vduEVYaUOByi2n5qfMOVbXepu68=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.ComponentModel.Annotations.wasm",
        "name": "System.ComponentModel.Annotations.okvu54f75u.wasm",
        "hash": "sha256-WGCTVZqvFaBhD9XRf1bb3JlELTU63j7E91Ggx/K3DaA=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.ComponentModel.DataAnnotations.wasm",
        "name": "System.ComponentModel.DataAnnotations.led9l5awu3.wasm",
        "hash": "sha256-40rhAIB8j+yJ1YvnDmQ2rPIVWKNJO6UHLv/U4oSxlBI=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.ComponentModel.EventBasedAsync.wasm",
        "name": "System.ComponentModel.EventBasedAsync.gu8xxfkii2.wasm",
        "hash": "sha256-CMjMH3Z/sFVve6sxikmjN7+mPmIk8fNp4ehlL51ggBQ=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.ComponentModel.Primitives.wasm",
        "name": "System.ComponentModel.Primitives.w0jv5mjyxi.wasm",
        "hash": "sha256-8KBD5mM2BSuyK5fSwatMYq6uMqZiPQJ/HJwG1p3S+FY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.ComponentModel.TypeConverter.wasm",
        "name": "System.ComponentModel.TypeConverter.y2ks7rue02.wasm",
        "hash": "sha256-qmeamr6pbCp7FGvLf+0H4o67qUI52pfKD6t2DjYnlfM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.ComponentModel.wasm",
        "name": "System.ComponentModel.3xf86qxhkx.wasm",
        "hash": "sha256-aT/QkrnJFCqod94t7qbu9lSv2l7QGxjPmh9J9IQrcjk=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Configuration.wasm",
        "name": "System.Configuration.bn9vghjcq8.wasm",
        "hash": "sha256-l2Yo9KFaXkgXpXguTZdnuTCytOYuPLjF8cZT0HHWwlg=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Console.wasm",
        "name": "System.Console.keragaef8q.wasm",
        "hash": "sha256-xD5riug8f0arDWJYtNqIOiMnJEozrywshYNUWG+3gr4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Core.wasm",
        "name": "System.Core.c3suqq86hs.wasm",
        "hash": "sha256-SBSsGK9bmNffRBssfWuDm46fmDsp5/QRJ1xkkWmht8U=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Data.wasm",
        "name": "System.Data.68zf2yu2oo.wasm",
        "hash": "sha256-6jUvj1E94RySb1zTTvcpNcltQa2n3p4oTxQhStiL5/A=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Data.Common.wasm",
        "name": "System.Data.Common.o0gc5buxev.wasm",
        "hash": "sha256-GC0ynV+SmrEExRR7zRRUfAjPV0mw1jHJvelVKvJCBzc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Data.DataSetExtensions.wasm",
        "name": "System.Data.DataSetExtensions.5fm360ikxl.wasm",
        "hash": "sha256-QXrN9ZMMpWZeFTBu6yZlaw5lYx1+tUxEjhfaNEdHG4o=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Diagnostics.Contracts.wasm",
        "name": "System.Diagnostics.Contracts.6iten2600d.wasm",
        "hash": "sha256-3qs7NasGHXh+zRPWaMeXJXFSIPLS4iV1TeGUXH9iNaM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Diagnostics.Debug.wasm",
        "name": "System.Diagnostics.Debug.622sixg49n.wasm",
        "hash": "sha256-kpDQTiMcfbO9nP5Mja6gzL4XTOp/9ixE1CD739WQlMo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Diagnostics.DiagnosticSource.wasm",
        "name": "System.Diagnostics.DiagnosticSource.59g0dgrjev.wasm",
        "hash": "sha256-SS8HlB1qFV8c/P2pmI+iJb0yPuvC6BilzyfIpi16nT4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Diagnostics.FileVersionInfo.wasm",
        "name": "System.Diagnostics.FileVersionInfo.y7d249ld9w.wasm",
        "hash": "sha256-bodGiMj1mlwCAndE2GFcsay3q7Ck0jOSD6aWpYKGoCc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Diagnostics.Process.wasm",
        "name": "System.Diagnostics.Process.77crunxk8m.wasm",
        "hash": "sha256-fd8IVZDdV9HgWL5mY/zq6n/7eD2UHL2N2N/wVtISyM8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Diagnostics.StackTrace.wasm",
        "name": "System.Diagnostics.StackTrace.ctaymmi5eu.wasm",
        "hash": "sha256-wEa9VHZMenXCr++/qAHOU0npylEPHvZGmlvdKtT7xfk=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Diagnostics.TextWriterTraceListener.wasm",
        "name": "System.Diagnostics.TextWriterTraceListener.wl5ybmwoly.wasm",
        "hash": "sha256-5FMxU1Gtte9eBrbAF/bDhpuFWgkWi5Z81dFQEVM3rdg=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Diagnostics.Tools.wasm",
        "name": "System.Diagnostics.Tools.roy5445ugj.wasm",
        "hash": "sha256-2yLIVwYrPkQWk0Vxh+qS+KxNElAj+Z4UTmjJNv8uYNk=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Diagnostics.TraceSource.wasm",
        "name": "System.Diagnostics.TraceSource.l1w2hf2uut.wasm",
        "hash": "sha256-RwTvddjw3qq3LPu3ntJhmnc9LUBD2M/vx3S11fx/mgo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Diagnostics.Tracing.wasm",
        "name": "System.Diagnostics.Tracing.tpedmz8jyf.wasm",
        "hash": "sha256-P/IYo8kxLommHpifWtZkBMA1t6SEqiJizG/gUCbpevs=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Drawing.wasm",
        "name": "System.Drawing.8gcjjqj0pu.wasm",
        "hash": "sha256-OG93onlStdjfWzcLq3GSd7p2posHrpoBAptujpzu/ks=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Drawing.Primitives.wasm",
        "name": "System.Drawing.Primitives.158c97obdb.wasm",
        "hash": "sha256-NRk5cE9X1+lw/s2awtN1wBQ75P77keIrxXUJ5ATrfTA=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Dynamic.Runtime.wasm",
        "name": "System.Dynamic.Runtime.023zrvzh9x.wasm",
        "hash": "sha256-yL5qlZRpb8jHMNsapIzA7qNxs9DZvvAJx3/hCobHnpM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Formats.Asn1.wasm",
        "name": "System.Formats.Asn1.ts2esm97f9.wasm",
        "hash": "sha256-rQkwDYIpmIlttF2Eo1HOnm+LWOwGt9LDNUU5Wg9UD/0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Formats.Tar.wasm",
        "name": "System.Formats.Tar.zk2btok9jd.wasm",
        "hash": "sha256-0/5iS4T6MfBtJWamVM1LDFkIcIKJrtYg1LVkN8Ys3SM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Globalization.Calendars.wasm",
        "name": "System.Globalization.Calendars.10g6hyjy3k.wasm",
        "hash": "sha256-gb8ndHQ5edkgeIuuwJAZmpSvDSqmmSPYJbBgTzel/ps=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Globalization.Extensions.wasm",
        "name": "System.Globalization.Extensions.hrinfrismg.wasm",
        "hash": "sha256-vZkkaKr0ImZEgmnHPzo/msMMeEJQCqxSo2mTbfOzRzw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Globalization.wasm",
        "name": "System.Globalization.uvs4rah8fk.wasm",
        "hash": "sha256-xiEtuDrnECbsdmpAPAp2VzmtL1v4IfFyExR96Fud89Y=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.wasm",
        "name": "System.IO.4j645gw40d.wasm",
        "hash": "sha256-8KAD71Rcb1edG/x+Cx4wUA8/0cmGUGSciPma6jeXLXo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.Compression.wasm",
        "name": "System.IO.Compression.ft3v8bt2pu.wasm",
        "hash": "sha256-7XZlyLChv+bqsbx6LrVqGEtH5dnWDMG8D8IE9pK4Jnw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.Compression.Brotli.wasm",
        "name": "System.IO.Compression.Brotli.wwokie61jk.wasm",
        "hash": "sha256-4FoDnHfnH/ia6KuLaDG66iq6ufyucGeB8+kVV5hsA7o=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.Compression.FileSystem.wasm",
        "name": "System.IO.Compression.FileSystem.88jdddz3sw.wasm",
        "hash": "sha256-aOwoN3Ibisa2gVhxzBpktC2L4SEDgvRphJChLSaTA+Q=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.Compression.ZipFile.wasm",
        "name": "System.IO.Compression.ZipFile.75oop09p1e.wasm",
        "hash": "sha256-xebI9MxSR9TPyWgnriZinhwi3zFwtbiurXBakcCYZgY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.FileSystem.AccessControl.wasm",
        "name": "System.IO.FileSystem.AccessControl.pn4onjmsl1.wasm",
        "hash": "sha256-a8/DRdIgz0D6ncsYFK2j/I4GOZLoOlR9CaSd4Oxy1C8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.FileSystem.DriveInfo.wasm",
        "name": "System.IO.FileSystem.DriveInfo.lj67h520e9.wasm",
        "hash": "sha256-H96Bdp9zD5as/JhjBDlLPzzGh1uJiQLzwIhM1oDv7kw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.FileSystem.Primitives.wasm",
        "name": "System.IO.FileSystem.Primitives.d1jmhkzu0e.wasm",
        "hash": "sha256-H8W0uho5WxWoH8hgJZEmNbdPpPYUgD8xkWHRSKx7MMc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.FileSystem.Watcher.wasm",
        "name": "System.IO.FileSystem.Watcher.rpe3g8jlp8.wasm",
        "hash": "sha256-wfLr+W6LWx+RjFMAN9+o4CnwZGuPJZD/0YIiPaVeHdE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.FileSystem.wasm",
        "name": "System.IO.FileSystem.o6jtz51fup.wasm",
        "hash": "sha256-YA3yQ7lL5H0WBYDoElU5ZeVKxPgfltC+tweV2Ybbn/A=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.IsolatedStorage.wasm",
        "name": "System.IO.IsolatedStorage.0otti4vtgd.wasm",
        "hash": "sha256-cE2hnKOXtEtBo99EIt+/qWedG4WoUgICRlKQD5kPTEA=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.MemoryMappedFiles.wasm",
        "name": "System.IO.MemoryMappedFiles.gckwg5wikh.wasm",
        "hash": "sha256-AA2/FW+XVDTxwD8dp3KcMgtbk+CmsaUj+Xl0XEbSiLw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.Pipelines.wasm",
        "name": "System.IO.Pipelines.34b8fz2i7e.wasm",
        "hash": "sha256-Q2WYQCJ4PLoFdqNbpnnk6uyIhesffT9iWCxRnSG8iGI=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.Pipes.AccessControl.wasm",
        "name": "System.IO.Pipes.AccessControl.x52zu3rgxm.wasm",
        "hash": "sha256-S5Cym3iQLsP/3Y3WVlIHGQyz6MI1FhocJ4WIOF4EUvk=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.Pipes.wasm",
        "name": "System.IO.Pipes.9l5uyws2a9.wasm",
        "hash": "sha256-zZmhibfoNd9+aKtYP1zjITp42+kSXXlr4tr90aKoOi0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.IO.UnmanagedMemoryStream.wasm",
        "name": "System.IO.UnmanagedMemoryStream.o8cpjnlard.wasm",
        "hash": "sha256-yHbYTenL8GXOuqqmxkdwREWeOUezLPi2eCSzn979C+k=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Linq.AsyncEnumerable.wasm",
        "name": "System.Linq.AsyncEnumerable.g8lyoao1rx.wasm",
        "hash": "sha256-ACBfOvGHD9uWiumu7+dToO63Nkqza8drgXR3MWKtCe0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Linq.Expressions.wasm",
        "name": "System.Linq.Expressions.3d208kt2eu.wasm",
        "hash": "sha256-Ccy2EVbEptHDGZlcgKv+61VJ6kK/vNcQoKDaBtj0Ooc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Linq.Parallel.wasm",
        "name": "System.Linq.Parallel.q357p6fng4.wasm",
        "hash": "sha256-llYPKK/K9vBa/TBUUwb2o7gIH6BuNdUZ5NzoKThbSyw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Linq.Queryable.wasm",
        "name": "System.Linq.Queryable.l2lmpmc27s.wasm",
        "hash": "sha256-09rsIdicN2CUt5v9sUK9VM0IBboQr8yHwhiKiH0GIfE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Linq.wasm",
        "name": "System.Linq.yhshkgq5lx.wasm",
        "hash": "sha256-hl5PSxpiufhAcPGoy8NmxEJPIog1BBzRCOGZoltac4A=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Memory.wasm",
        "name": "System.Memory.lxabc0ewys.wasm",
        "hash": "sha256-54enoGiikLPDx39lUmXvvU7J5SOjcq75UxtJlmKubGQ=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.Http.Json.wasm",
        "name": "System.Net.Http.Json.5n08t7iktt.wasm",
        "hash": "sha256-QY7kN0ajlrJD/DZl2Sole3kWnkbReFBYztKx2KBs5so=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.Http.wasm",
        "name": "System.Net.Http.l7lu52mb8b.wasm",
        "hash": "sha256-H6zIL/Z9DKr5PHq3DZ5v/qufNJXfKJiiZ2OJX6yhYeM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.HttpListener.wasm",
        "name": "System.Net.HttpListener.9jpdrlnuko.wasm",
        "hash": "sha256-hSH38Bficu0cOdXZDAxRxY2xkBd6P6CipN+pN7RdVfE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.Mail.wasm",
        "name": "System.Net.Mail.qjk4ple5n7.wasm",
        "hash": "sha256-+nHvVvvznnvGkt+KQzAAyXXe6RQYPeAtuldt8Lx5klQ=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.NameResolution.wasm",
        "name": "System.Net.NameResolution.g0ul80qw10.wasm",
        "hash": "sha256-MDMNBBbbx49YUJDma4GGtllWlsJLo6shiWW1IvMWHOo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.NetworkInformation.wasm",
        "name": "System.Net.NetworkInformation.1tpje88ozk.wasm",
        "hash": "sha256-m4hEp4RJhATGjgwzyZVIj+NR8eQqQ+rfQq+rG4cy0Mk=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.Ping.wasm",
        "name": "System.Net.Ping.2v4xklb9cb.wasm",
        "hash": "sha256-3o416gkuDTQON300y49TcIr+bQmB5WBl+iJ5T2yyXms=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.Primitives.wasm",
        "name": "System.Net.Primitives.5x7dz5gkvw.wasm",
        "hash": "sha256-p19jXGegdpOM5XH4bVfMD4xV0LShOPee3i2xCYZF5T8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.Quic.wasm",
        "name": "System.Net.Quic.8dhmgjj4ns.wasm",
        "hash": "sha256-bG0i3NjR9nQ6C94B++S5sj8uK6Si+iQEDr3CtBakD/s=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.Requests.wasm",
        "name": "System.Net.Requests.clps9xsack.wasm",
        "hash": "sha256-kH26SEmVHixx8uDxsZgIAjUWGou2V7JNwPvqINf5MuY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.Security.wasm",
        "name": "System.Net.Security.zbf9m4grc7.wasm",
        "hash": "sha256-39uuI/yYfu447dcz6lCzd/RiturkTLr+myQQ0yz0G6s=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.ServerSentEvents.wasm",
        "name": "System.Net.ServerSentEvents.1a3kx6yzkq.wasm",
        "hash": "sha256-mcaqQ88veqsDRN1jaucLsDkqPkEbWU+ebF4EksDOYjQ=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.ServicePoint.wasm",
        "name": "System.Net.ServicePoint.xbhxnytx4l.wasm",
        "hash": "sha256-/STSB/pmoEd7eBP1ewThAYMeJGveTDOrKftoV06TyiI=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.Sockets.wasm",
        "name": "System.Net.Sockets.1f5lmaut7n.wasm",
        "hash": "sha256-rWzxC0GpUsVrkW32dXD5tFz826AGZZ9gtl8Qqb2Ie7E=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.WebClient.wasm",
        "name": "System.Net.WebClient.n2d9fo6si6.wasm",
        "hash": "sha256-b9lJkgy7LBovMr4AG5JgRc3ueyGkvbpcMaVQixtNccY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.WebHeaderCollection.wasm",
        "name": "System.Net.WebHeaderCollection.h5uoqnpmrl.wasm",
        "hash": "sha256-Wysud0k8XR+a8wH0AuzFV4sOz02M+7DQsCi5toTq6es=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.WebProxy.wasm",
        "name": "System.Net.WebProxy.ql8uijyq0c.wasm",
        "hash": "sha256-8lpAaq4lYC6/JyZ3tW2QwFH3HbG2HWWZ4FAFPUcuTLA=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.WebSockets.wasm",
        "name": "System.Net.WebSockets.iq6usstdpg.wasm",
        "hash": "sha256-ZuYbPLEoDcbDxL+3gocasnRHLsVMGj6MeuisGREUEmI=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.WebSockets.Client.wasm",
        "name": "System.Net.WebSockets.Client.wj6gi4bllu.wasm",
        "hash": "sha256-1Ki+eXFdxKbYUTabG0FfR6hPOBtPdYn73LUZJc6rx9w=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Net.wasm",
        "name": "System.Net.w1hpj3bo6r.wasm",
        "hash": "sha256-bE5JhulvXs+VFtgIW1IMKhELHc5gUDe0EPzNiDtoZpE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Numerics.Tensors.wasm",
        "name": "System.Numerics.Tensors.r3xx7dzxnt.wasm",
        "hash": "sha256-Ka9JyzFAoS2rKg+AE/1/OsnHiWasI9HHyAnvF7N0VT0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Numerics.Vectors.wasm",
        "name": "System.Numerics.Vectors.enyefgm6f2.wasm",
        "hash": "sha256-FsrSH10vwm3e100r824Qxjx8y4whH/bDTD6RxeT5qe0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Numerics.wasm",
        "name": "System.Numerics.lyu36wqn19.wasm",
        "hash": "sha256-g5p6oqfQl2OUj/Or3JJiTCnkMEiv5Yl6r3Aki08Xdvc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.ObjectModel.wasm",
        "name": "System.ObjectModel.41badu8y52.wasm",
        "hash": "sha256-WLuddR9bbTtKZfAk77IQkp0oMPnyWbjnwqRoXy05yec=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Private.CoreLib.wasm",
        "name": "System.Private.CoreLib.6awft0y5sb.wasm",
        "hash": "sha256-0hFOdkhXNiLGQu6JrJtih4YiT+TroW9Sic5c3t/OOtU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Private.DataContractSerialization.wasm",
        "name": "System.Private.DataContractSerialization.toua009upz.wasm",
        "hash": "sha256-3clfA1baPw1ugWVP8hqNQqKRJ8lGugOl7CIiUizn+YU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Private.Uri.wasm",
        "name": "System.Private.Uri.4404udpk8b.wasm",
        "hash": "sha256-bGRYY8S0IBbby+ZtJlsZG/22qY0OVbbxZRwxGj84aIg=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Private.Xml.wasm",
        "name": "System.Private.Xml.wectmw10my.wasm",
        "hash": "sha256-GEoalwSK7gwxJnOtLx1+FOsL8b8Xe/QcIv2g+nOoA5w=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Private.Xml.Linq.wasm",
        "name": "System.Private.Xml.Linq.ojgt30c5zu.wasm",
        "hash": "sha256-BNxYTfahdKBWOl++pUdM2HLHBQobtu2wAwbzLhQjBgc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Reflection.DispatchProxy.wasm",
        "name": "System.Reflection.DispatchProxy.a74p216aty.wasm",
        "hash": "sha256-hqdt/9lL5Jl2XWGKAhzcGbHDihREdaP8iml7xkI4WNo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Reflection.Emit.ILGeneration.wasm",
        "name": "System.Reflection.Emit.ILGeneration.6vmybu8220.wasm",
        "hash": "sha256-QsvYHPIjGFQRFlAhvkEScg1lHJqkNBELqV1zW+wEs+I=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Reflection.Emit.Lightweight.wasm",
        "name": "System.Reflection.Emit.Lightweight.1kkqincfsi.wasm",
        "hash": "sha256-kXjDG0P+/4kZbb+HHIZK3hba5yKrNRDmCx9JRurI2WI=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Reflection.Emit.wasm",
        "name": "System.Reflection.Emit.akmptrylzk.wasm",
        "hash": "sha256-htho2exkk0C6++BJT8rJH7yMBISv6DL+Vswsk/r0E24=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Reflection.Extensions.wasm",
        "name": "System.Reflection.Extensions.zr5bhwfczd.wasm",
        "hash": "sha256-/xKkpAsqwNQ8soTda97aUed6al1D9dGTdTA2lRvrLxM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Reflection.Metadata.wasm",
        "name": "System.Reflection.Metadata.7lvue0g8ru.wasm",
        "hash": "sha256-lTatZSS6SLnTPjg3wOpB8ANfazoc0B8ByouN/EW/mS0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Reflection.Primitives.wasm",
        "name": "System.Reflection.Primitives.vjzh9joosh.wasm",
        "hash": "sha256-OyMNbEvWoDUEmHr1k58QuS7ryTRLnHxGvTxNAskYBoY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Reflection.TypeExtensions.wasm",
        "name": "System.Reflection.TypeExtensions.4ktu6oxxzi.wasm",
        "hash": "sha256-JGdBZrT4vcF530H1uV7i4xih3wiGxr9LkRWoVE3fhlo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Reflection.wasm",
        "name": "System.Reflection.mk3jyxvh13.wasm",
        "hash": "sha256-1k6WUVW1mJwUKSKAwvKj5wtG/WTYf3scCmFyc4uRtWs=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Resources.Reader.wasm",
        "name": "System.Resources.Reader.41ppfyz2vc.wasm",
        "hash": "sha256-+DE3yDPtRF5JM8T52ycQt1qSAJ0vbjX5nu4Zoj+SuZ4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Resources.ResourceManager.wasm",
        "name": "System.Resources.ResourceManager.sfwvfmw1ea.wasm",
        "hash": "sha256-CIM4gUMmot/+RliOJhpf94ZlIsAr4YiEfWvOAXbovMU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Resources.Writer.wasm",
        "name": "System.Resources.Writer.11v050ya3p.wasm",
        "hash": "sha256-FWLGhJPmRLo6pIXlD7VTNgIifxbXJG/X92qK4gCG6v8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.CompilerServices.Unsafe.wasm",
        "name": "System.Runtime.CompilerServices.Unsafe.puz1xm53oc.wasm",
        "hash": "sha256-P6tIzozdCJqHiy0zGjuPtLVfOYb5yb0QPwFMwMUn4AY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.CompilerServices.VisualC.wasm",
        "name": "System.Runtime.CompilerServices.VisualC.vxfvgnd5qd.wasm",
        "hash": "sha256-cz5+K4r3D0pC3vSMh3I8Z9VVQfHIB4aJ0aBHi81HgwQ=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.Extensions.wasm",
        "name": "System.Runtime.Extensions.i7gntui96b.wasm",
        "hash": "sha256-Mnk3n1eK4eqTEZkm/ZfT7LQmGdwGAoF2anLqrZbDPbM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.Handles.wasm",
        "name": "System.Runtime.Handles.00oxj4o6ov.wasm",
        "hash": "sha256-QIVT4ckpz17JUAEsvaaKYYH35Ou8V9ErIKuwNI05CZU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.InteropServices.JavaScript.wasm",
        "name": "System.Runtime.InteropServices.JavaScript.saa488bsuy.wasm",
        "hash": "sha256-JOXPBH2U9dgS4PKJ64EYIyjRQvrranFpfTqkGnH27kM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.InteropServices.RuntimeInformation.wasm",
        "name": "System.Runtime.InteropServices.RuntimeInformation.my7qeqbhfh.wasm",
        "hash": "sha256-zhC5CCW9nCkqGXdOfIfwawjFHi5JjlQNnD8pGkdfWoE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.InteropServices.wasm",
        "name": "System.Runtime.InteropServices.i1nhw2m2sz.wasm",
        "hash": "sha256-5tYlr0r+6I9UXAbPqH88/p7wMxL6b2+mJYFdvtLC44Q=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.Intrinsics.wasm",
        "name": "System.Runtime.Intrinsics.zzupwpj5i8.wasm",
        "hash": "sha256-0QIoTaWBWEjzCoyjgrhIt5YpIRlkxc2ui4Oo770IrlA=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.Loader.wasm",
        "name": "System.Runtime.Loader.3mzflpjy79.wasm",
        "hash": "sha256-9bSiQhUR5B/+GethXEgFVwoHO/oYk97XNOGnibQE9Zo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.Numerics.wasm",
        "name": "System.Runtime.Numerics.y4sdgixpfy.wasm",
        "hash": "sha256-TkhQ8ELW/Rz6WBnld1byv2ZIyviVBc5/5wQyzTAUaoU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.Serialization.Formatters.wasm",
        "name": "System.Runtime.Serialization.Formatters.qekclpwuko.wasm",
        "hash": "sha256-rlThMz543In5Ja+xGtkLCO1C4tkBnyIG++7td7b0LtE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.Serialization.Json.wasm",
        "name": "System.Runtime.Serialization.Json.4n7u09advh.wasm",
        "hash": "sha256-MCbIAsHQBugo8qpJp51Z0UHPviJI013X8cqoUXXfa7M=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.Serialization.Primitives.wasm",
        "name": "System.Runtime.Serialization.Primitives.billet2nq3.wasm",
        "hash": "sha256-I6JWwkVrirAZfaoGbPRaBZDD/e+T8rnMF1qfrB7HAB8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.Serialization.Xml.wasm",
        "name": "System.Runtime.Serialization.Xml.ny21jmziti.wasm",
        "hash": "sha256-P4CWph0hEmcsfiwKYkRp4me/5o8puJqWxBfj0AcLfWk=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.Serialization.wasm",
        "name": "System.Runtime.Serialization.qcxaur5wqs.wasm",
        "hash": "sha256-pr4aZh6q8+LiDRjtVtJkkLeCZuVgRF9iOhru3cXTfUY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Runtime.wasm",
        "name": "System.Runtime.j0ib7tdmpz.wasm",
        "hash": "sha256-83oiiohxPWBdbYDOWz3zxyGUbKRrfFB5Q4MPmfi5bl0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.AccessControl.wasm",
        "name": "System.Security.AccessControl.x3vffxlhcl.wasm",
        "hash": "sha256-PW65H/DY5mtNUYdU+7DBiBnHQkhOfO32mr8P+F3V6uM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.Claims.wasm",
        "name": "System.Security.Claims.44ygo8ejy2.wasm",
        "hash": "sha256-TBecWYTvxUPs/eoGL6JN9au0r5TBDpc+PWD7fJK7nUs=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.Cryptography.Algorithms.wasm",
        "name": "System.Security.Cryptography.Algorithms.8zijp1svfw.wasm",
        "hash": "sha256-LDzYiGnR0brxYcFNo0ocBo59dYZZb9MBe3ild2znJSc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.Cryptography.Cng.wasm",
        "name": "System.Security.Cryptography.Cng.yxagtt77no.wasm",
        "hash": "sha256-ZpyrNDtC+3ti6m3d6mhH1as/m+ZFqLtc2bZBFNtuVH8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.Cryptography.Csp.wasm",
        "name": "System.Security.Cryptography.Csp.uhfbvvau84.wasm",
        "hash": "sha256-Mp7WemXwikMFbyEZOblQA8l8wqAZ5jhmh6QboTii32o=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.Cryptography.Encoding.wasm",
        "name": "System.Security.Cryptography.Encoding.2ywrusvy8q.wasm",
        "hash": "sha256-duIpVcBN7g31lDD77yYuAG3xM3U5GZtePHznUiVz0m4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.Cryptography.OpenSsl.wasm",
        "name": "System.Security.Cryptography.OpenSsl.oa268u7i92.wasm",
        "hash": "sha256-4H6EYIOcQKX7spTR+G74jmTVJg6+MgAtY9g8b22KcFg=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.Cryptography.Primitives.wasm",
        "name": "System.Security.Cryptography.Primitives.5uhvqe8puk.wasm",
        "hash": "sha256-DX5w2C46UrZY0ubTaEn3lxmlfYnJFHE1TN8wI4qsMgc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.Cryptography.X509Certificates.wasm",
        "name": "System.Security.Cryptography.X509Certificates.6i7pxilopt.wasm",
        "hash": "sha256-wnRBilXju2GhWZsScBp6pBZ8dNSD81FuW+DXXZxUu1I=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.Cryptography.wasm",
        "name": "System.Security.Cryptography.vt1hh8dk2e.wasm",
        "hash": "sha256-g8RvypFcTM4/AQLbPoqM0/RNEsvFFUHSSYjQHxGeh/0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.Principal.Windows.wasm",
        "name": "System.Security.Principal.Windows.agb651b2d9.wasm",
        "hash": "sha256-hof9SLChyEGIGZ6nOMPI6ffp5eAHh+uzpB5bOPAwXUs=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.Principal.wasm",
        "name": "System.Security.Principal.i20kfklf3g.wasm",
        "hash": "sha256-Wow4n7EbYXc1HfQqHQu1Jhl7f8vCrcVNkFAXLZvyvTg=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.SecureString.wasm",
        "name": "System.Security.SecureString.x2y8tzci3c.wasm",
        "hash": "sha256-d7gVbpst3NnK88ZEcpaJoH5w3zfmsRXDJQvvqbL+RVY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Security.wasm",
        "name": "System.Security.e83vvh6sl2.wasm",
        "hash": "sha256-HuX7LBO46UViQb2u/0vvs+XLxgVQE+KVlOs6UH+Gw0g=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.ServiceModel.Web.wasm",
        "name": "System.ServiceModel.Web.poglliv2no.wasm",
        "hash": "sha256-R4tw5kXVUZ+Qsq6/4Xkq7Qedv5pzouTdXVacoeG0V/0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.ServiceProcess.wasm",
        "name": "System.ServiceProcess.yro5uj2opo.wasm",
        "hash": "sha256-Usmz3M5o5WSM1Sc2dU3njqXU1MeSMvgc8oaxTK8gBGo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Text.Encoding.CodePages.wasm",
        "name": "System.Text.Encoding.CodePages.iphla3udk9.wasm",
        "hash": "sha256-Gl37R8XasvjVseAhL1rUvJXLxdSJWNCVJlfjxacgZAc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Text.Encoding.Extensions.wasm",
        "name": "System.Text.Encoding.Extensions.bftrh8zudg.wasm",
        "hash": "sha256-SbFr5Td62iqPIWcUPSSaWM5LU/sX9XtGSXsumYezIdY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Text.Encoding.wasm",
        "name": "System.Text.Encoding.cxdyfepnpj.wasm",
        "hash": "sha256-AM6c0tx+lLrDZ6OZN3oLhe6nC21LZ6j1sEKHYC0gX9Q=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Text.Encodings.Web.wasm",
        "name": "System.Text.Encodings.Web.6gyj9zl41y.wasm",
        "hash": "sha256-Jpqn/byYBj4JUl9A7vtDodkbR61BDIsFNJBokCkV9GA=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Text.Json.wasm",
        "name": "System.Text.Json.a4zwct0nqf.wasm",
        "hash": "sha256-NqbC5FVLDLqwRQeu5Id8ErgGCkIhRaNv86pxc31lU4Y=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Text.RegularExpressions.wasm",
        "name": "System.Text.RegularExpressions.eg0pn2h6ug.wasm",
        "hash": "sha256-cuKXfMEa4RfPWvj02OhtquUNOeeosMisQnmv5OKfAS4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Threading.wasm",
        "name": "System.Threading.q8d32tqjk9.wasm",
        "hash": "sha256-ypvos7n1Po1WENvMzCz8U+GEzzQ4EvybwuFqpyzvEro=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Threading.AccessControl.wasm",
        "name": "System.Threading.AccessControl.lfm777axt4.wasm",
        "hash": "sha256-UTBdP67SKPIb5sn3jz9c8VS4ljfrcI6YCFzUXRCjE4s=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Threading.Channels.wasm",
        "name": "System.Threading.Channels.uj3ad1yqk8.wasm",
        "hash": "sha256-hl7KrvxyJGvf+pOZAAtKuW+5mLCtfpHuTEw/RWmwMFw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Threading.Overlapped.wasm",
        "name": "System.Threading.Overlapped.nlxbqfyeco.wasm",
        "hash": "sha256-2xQWXFAnjrUyrOeSzWa3QMLiDZT1bfhg+D1H+72/1hs=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Threading.Tasks.Dataflow.wasm",
        "name": "System.Threading.Tasks.Dataflow.nojvkcxx80.wasm",
        "hash": "sha256-ZwnWuIJevl0Oc/5dweKNDHjo/VFClWyTfsKNiZw+FfY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Threading.Tasks.Extensions.wasm",
        "name": "System.Threading.Tasks.Extensions.0deavcb00v.wasm",
        "hash": "sha256-NEYDYaYBpgF3So553VgamGq3KZUL32UDvps2Y/dLdis=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Threading.Tasks.Parallel.wasm",
        "name": "System.Threading.Tasks.Parallel.6ei5yfm4af.wasm",
        "hash": "sha256-XkrFJv+ocNoLa283fNzX9jJ+ado+o4AhsXR1DPSEDFc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Threading.Tasks.wasm",
        "name": "System.Threading.Tasks.fu4qd5h3qy.wasm",
        "hash": "sha256-+TOeSAsKIGT1UJBmjHRX61gRkGIQ+0vEtBQr8k+7HlI=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Threading.Thread.wasm",
        "name": "System.Threading.Thread.k79i9g78ju.wasm",
        "hash": "sha256-IFi0N9XLqs8k3g9gKLqdj2vTIAwUJ4w2DAzy9v3G1hE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Threading.ThreadPool.wasm",
        "name": "System.Threading.ThreadPool.axhb4irdtd.wasm",
        "hash": "sha256-gtTA6e8kpe6sHwyoYc6iBBgckLRWVB/XcAulVaFk2L0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Threading.Timer.wasm",
        "name": "System.Threading.Timer.yp49llu5h2.wasm",
        "hash": "sha256-2rbLSkDUh/CdKMUXN12xK590P5PdtQ6+D/HUF1Y2zNY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Transactions.Local.wasm",
        "name": "System.Transactions.Local.b2c4bte587.wasm",
        "hash": "sha256-E7UvgnBP7hJ+8nFV91Re7ga7JbmiM87mjd3OfmEHNgE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Transactions.wasm",
        "name": "System.Transactions.ipwm3rsy66.wasm",
        "hash": "sha256-6kE7mivQoxfhMTVAkmYi5VlsQhqXLYcImAuc9D7Skjo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.ValueTuple.wasm",
        "name": "System.ValueTuple.7ol6ljuhx8.wasm",
        "hash": "sha256-yctvPmRbtoHiPpM5pKnajABrjRQR9a3b+HPWHyga2kY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Web.HttpUtility.wasm",
        "name": "System.Web.HttpUtility.g7vbwfxmpc.wasm",
        "hash": "sha256-vL5P8BPesMV5fwKxX9dISzBLhSkRSdPbb78xS5pL/74=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Web.wasm",
        "name": "System.Web.np8uzzakvl.wasm",
        "hash": "sha256-m5aBz++zzF8tNzlN4+R5pPqGhS882Pxw4KwoakadVrI=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Windows.wasm",
        "name": "System.Windows.18nzio44t3.wasm",
        "hash": "sha256-r62brvRKMGvdcIg3SIbWWi7k8/NqCfpn+LPqnwitvKE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Xml.wasm",
        "name": "System.Xml.45jprtg1pa.wasm",
        "hash": "sha256-KPyqHJl+ZMo3c6PCl2vPaQGBdD8P4KUBxsUkvR90/hk=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Xml.Linq.wasm",
        "name": "System.Xml.Linq.v9v8udncm1.wasm",
        "hash": "sha256-rQ0vSy0Z16GnVFmS/wCs02+prtLem1HSrbHdfWIzNK4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Xml.ReaderWriter.wasm",
        "name": "System.Xml.ReaderWriter.a9mr08uzci.wasm",
        "hash": "sha256-bmkzRCDnwMgFnyZvQKnjJh5rdfZJtZ4nirjaJufIrqk=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Xml.Serialization.wasm",
        "name": "System.Xml.Serialization.03juoguwgc.wasm",
        "hash": "sha256-HPQyo7cnsrAul9FfHP0JLVYXonc/DYwM87t6IXA4jPc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Xml.XDocument.wasm",
        "name": "System.Xml.XDocument.c9dhjnzqjb.wasm",
        "hash": "sha256-YLwIjMK8F1xq/FIgzG6+jiJStkbL+5sLQLdzD2sgpa8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Xml.XPath.XDocument.wasm",
        "name": "System.Xml.XPath.XDocument.5tzrlgcnuv.wasm",
        "hash": "sha256-9xzBiSsKPxrCG5HkT9FDP5pQ6HdzCxNis33M2QKkkMw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Xml.XPath.wasm",
        "name": "System.Xml.XPath.pvxm9341ce.wasm",
        "hash": "sha256-+5VqXw8HmAjDvyi2+y7K95eMarW7XY4wPW0bh7x8L/I=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Xml.XmlDocument.wasm",
        "name": "System.Xml.XmlDocument.450wsyxvl0.wasm",
        "hash": "sha256-uPwda+H2hEsj0Jbt2bXGnSVbjkdbRsFU3TjifwMLQi4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "System.Xml.XmlSerializer.wasm",
        "name": "System.Xml.XmlSerializer.y3t2n0tce7.wasm",
        "hash": "sha256-IrnG91lN1tfKsabToUYpusckhRr9wXb3Jxm6CqsOTJE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "TagLibSharp.wasm",
        "name": "TagLibSharp.ml76rjiutb.wasm",
        "hash": "sha256-+jJWkad4NfIZNVcfa+bg85/Sm/XlR9HhZO4c0BeDZ+w=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Vortice.D3DCompiler.wasm",
        "name": "Vortice.D3DCompiler.86nrrtyugx.wasm",
        "hash": "sha256-EN2LmqJdf24Vn+hcberYXS1zL89pBS+Db1B/RANQ2QI=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Vortice.DXGI.wasm",
        "name": "Vortice.DXGI.dufpripwnu.wasm",
        "hash": "sha256-i9CaSgeqe8GrkZ5MpX0kbbmxD3QP7pqUd0RpEMM5Ch0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Vortice.Direct3D11.wasm",
        "name": "Vortice.Direct3D11.8c4iyeta48.wasm",
        "hash": "sha256-iG+/mNqBNPCExh3xvv/Dkwq8YQ/F5nWY/h+G6OlrznA=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Vortice.DirectX.wasm",
        "name": "Vortice.DirectX.61xnad2otb.wasm",
        "hash": "sha256-+sRY/Ankkfx6nrjbvL6m9hkRxPFIFuAycPYrt03E1NY=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "Vortice.Mathematics.wasm",
        "name": "Vortice.Mathematics.uaoyqh196q.wasm",
        "hash": "sha256-esKqgaFh5jmk5ZPathfLizAz21EZcAkiqmS6DkEUXu8=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "WindowsBase.wasm",
        "name": "WindowsBase.8zsce9qxfb.wasm",
        "hash": "sha256-tI94+TOjFqR3Z880lf+2Ye9R7uo6OxX3t73SZC3Wodc=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "alsa-sharp.wasm",
        "name": "alsa-sharp.k7p380uroc.wasm",
        "hash": "sha256-YEqcxIo1RsMC8jER3+PdV/ztDbz/bxI3uYaDoIhPHV0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "mscorlib.wasm",
        "name": "mscorlib.vszpkgbum2.wasm",
        "hash": "sha256-f4XsncieSqcA0HSl8IUZexWNld24LrmrEyC2/T65iss=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "netstandard.wasm",
        "name": "netstandard.xrlqgbjfee.wasm",
        "hash": "sha256-vfw7eRg7UBVTqHO6xGr10iAWy883IXQ07JMxcb5osyw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "nunit.framework.wasm",
        "name": "nunit.framework.bcmdvulvsm.wasm",
        "hash": "sha256-W3kdsphn4R8vpzUd/tuY7Yr9fWO6tbB3BJucTe4Yg7M=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "nunit.framework.legacy.wasm",
        "name": "nunit.framework.legacy.xpbukumrvn.wasm",
        "hash": "sha256-1YIcGGk6eUtihzzGF0XUMfvNoQOznZEa0aaMogE+ue4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "osu.Framework.wasm",
        "name": "osu.Framework.oonglfucdm.wasm",
        "hash": "sha256-GHMGGap8sfqOz50KD6UlnZJIrhieJ8iOP0BfUamrXyA=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "osu.Game.Resources.wasm",
        "name": "osu.Game.Resources.dlrsx27q9r.wasm",
        "hash": "sha256-T4y3i9ER6EeFEjZDLx8swEORJrbfBg5AGvFmGeoe9UM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "osu.Game.Rulesets.Catch.wasm",
        "name": "osu.Game.Rulesets.Catch.sl67ow465s.wasm",
        "hash": "sha256-0Ip4Zi9pg8Kb1h00XM4CynHHXKStZbm799LZ7kjUJoo=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "osu.Game.Rulesets.Mania.wasm",
        "name": "osu.Game.Rulesets.Mania.n0f3201npj.wasm",
        "hash": "sha256-x4Ah7dp9oOtZUgnhmtGH5Q86WIfXMRCICFxotH9dQQQ=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "osu.Game.Rulesets.Osu.wasm",
        "name": "osu.Game.Rulesets.Osu.fkqbv917f7.wasm",
        "hash": "sha256-P26AbI2nLukb/kQ8g815iWItAD0KFJR1lt098hzX/Kw=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "osu.Game.Rulesets.Taiko.wasm",
        "name": "osu.Game.Rulesets.Taiko.qcbufjn6ds.wasm",
        "hash": "sha256-BuASHhP+h0rizLiaP9vmT68iEWauY8Suao0KiqGxX+Y=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "osu.Game.wasm",
        "name": "osu.Game.mqp4g4y7ow.wasm",
        "hash": "sha256-siRsy/C56XyIvePjO8F0zPf5SCbP2E15sGSzGbWSMLU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "osu.Web.wasm",
        "name": "osu.Web.ns3ad7fhcr.wasm",
        "hash": "sha256-twqLp/1XnjAExUyVMxu5BwzMWncxEi7I7cdy3Uey6TE=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "osuTK.wasm",
        "name": "osuTK.l5rja23j59.wasm",
        "hash": "sha256-x213L6mhA2HMYb/IOsRzMZ1zInmGAmVc5praXbPbyaQ=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "ppy.ManagedBass.Fx.wasm",
        "name": "ppy.ManagedBass.Fx.29y4praew6.wasm",
        "hash": "sha256-mlRGtiAjAj71K+R1F5qho3i2H97hdwT5W7JXaGmVRuU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "ppy.ManagedBass.Mix.wasm",
        "name": "ppy.ManagedBass.Mix.pdbvx08h73.wasm",
        "hash": "sha256-ozOOLv/YkLOmhbpLVEY5B5LXoNS9VKBDBkjYspi/t1w=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "ppy.ManagedBass.Wasapi.wasm",
        "name": "ppy.ManagedBass.Wasapi.eoym00g3ik.wasm",
        "hash": "sha256-DhluWuoZNboeOyslI0s9YYTqfSq+H8pz/7n+WR107P0=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "ppy.ManagedBass.wasm",
        "name": "ppy.ManagedBass.i2rc5kw60o.wasm",
        "hash": "sha256-ComFp4XOhL9D0CSxFo28pDmSOTKDOViEhHkiBPATuNU=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "ppy.Veldrid.wasm",
        "name": "ppy.Veldrid.j3oeh5drs8.wasm",
        "hash": "sha256-gRls9/GO0vqL4C0UK0+VuetlD6Lc7RgIP0gCT7iVkg4=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "ppy.Veldrid.MetalBindings.wasm",
        "name": "ppy.Veldrid.MetalBindings.4wwqwjvoud.wasm",
        "hash": "sha256-BGVMbgiQauErB7ZIcCrdPYgpHeUHPO42Zm8jyTaGRaM=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "ppy.Veldrid.OpenGLBindings.wasm",
        "name": "ppy.Veldrid.OpenGLBindings.ie1fxot0df.wasm",
        "hash": "sha256-JloaJEzlM2GHi0Va1oF7t/10gq4GSocc8Lyz62MINLg=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "ppy.Veldrid.SPIRV.wasm",
        "name": "ppy.Veldrid.SPIRV.vraunh0wmk.wasm",
        "hash": "sha256-9RJKe+1S1lKwvAP7+PHuvMje3XATMECE9pp600/RYsA=",
        "cache": "force-cache"
      },
      {
        "virtualPath": "vk.wasm",
        "name": "vk.8xz5uhz1ye.wasm",
        "hash": "sha256-5IgOMYf0YuWoHNkBY+meiWPrPldsIKtYqiBygbjMI5Q=",
        "cache": "force-cache"
      }
    ],
    "assembly": [],
    "satelliteResources": {
      "af": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.jdn6yrzxh5.wasm",
          "hash": "sha256-19nFhBPfHHZ8q2TJTT+DOEYzEfxw+vKE3lBCYENIIqU=",
          "cache": "force-cache"
        }
      ],
      "ar": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.m2q15mljuk.wasm",
          "hash": "sha256-wnjLOLXKD0GkkaVb5r2rkOGUbzpv8rYkS8T6+KjZmuA=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.sawbgwd5du.wasm",
          "hash": "sha256-RBg3mECV4W4tbbZK0wGsAwCwzzoVw/GhUnKNIiDSCN8=",
          "cache": "force-cache"
        }
      ],
      "az": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.lib4nykf0w.wasm",
          "hash": "sha256-s63SdYtKHd+HfezcXE2sJfq2EQA+GtGxzip1MQhKKDg=",
          "cache": "force-cache"
        }
      ],
      "be": [
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.he13sbx9tj.wasm",
          "hash": "sha256-J94wUfFEd9emDIYK8QZfvK9VFXUuRE7QcAqXBJJc9n4=",
          "cache": "force-cache"
        }
      ],
      "bg": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.mrgi6ndaz0.wasm",
          "hash": "sha256-YvfQv6vVtEk8zaw2okfMjbKDanbEFaoG6FIB2HAad/M=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.ecalkkhcv5.wasm",
          "hash": "sha256-nptSP34hJP0IpSgm17IM4tMfiraQDAlzy2QS3iGXdOI=",
          "cache": "force-cache"
        }
      ],
      "bn": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.2y30d6xbja.wasm",
          "hash": "sha256-+ug1yCy38UUUGqGAe8uagIJ+9bqg/kGHoSOCkJheRa8=",
          "cache": "force-cache"
        }
      ],
      "ca": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.1klb6banz5.wasm",
          "hash": "sha256-H4zjEOnmJjfmJNYJdXNf8ZU/Du6ozo2h7DEh72MgIKw=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.nbyv78jwz6.wasm",
          "hash": "sha256-g3YwM+taOzVak5O7DSAd+4B+PaJlzyFW3woTO1BDsM4=",
          "cache": "force-cache"
        }
      ],
      "cs": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.c6tpks8an8.wasm",
          "hash": "sha256-9ONKpZP4Czl7TcykTkroNkDqe/6+E0/iBXSjw/iSAWw=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.qz9o7c4x3m.wasm",
          "hash": "sha256-lt+BpOmRlz9qNKk1bCFsKpsL5hRHmMd3rwmNaQBN4KE=",
          "cache": "force-cache"
        }
      ],
      "da": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.0mc54hsf3q.wasm",
          "hash": "sha256-GLeFLupweXQVOAZR9pputiS069y84oCIYobPgdJBnUU=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.rixqe3agnl.wasm",
          "hash": "sha256-zXnAfiNNjyb8v1anOU8fp+XMjzQvo4j8PitH8Epbclc=",
          "cache": "force-cache"
        }
      ],
      "de": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.604odd4mwd.wasm",
          "hash": "sha256-upStYK6VuEy3Ss1plOexw48vLkczGFgFmrLzcnQOG3U=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.tqbuhov906.wasm",
          "hash": "sha256-CygcTn03Bje0h69j2ammeovd7vAGcusUjrEPl0JmlmI=",
          "cache": "force-cache"
        }
      ],
      "el": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.ufcydoiley.wasm",
          "hash": "sha256-hp/qv7cfaGXTXgvAsFReeVkK6DmUgu5ZkC78OA1Rw1g=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.cv35st9vgn.wasm",
          "hash": "sha256-2CKTEBBdVU0bBsfwU/RDHfBwqrRZw4z56r5844VuwPE=",
          "cache": "force-cache"
        }
      ],
      "es-419": [
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.hvfoype7ha.wasm",
          "hash": "sha256-o5O9lCPMqImblpqu7ekpVD+fgQV72EvcJM2vHzfD6Pg=",
          "cache": "force-cache"
        }
      ],
      "es": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.k59f81z5ni.wasm",
          "hash": "sha256-GPiXTe4uBJEOBI35Q+y5+Z9rYEfkG4iM+1R7ppa4AgE=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.69dik5pdu1.wasm",
          "hash": "sha256-ZlSZFLl3mXaTzJv4oXbKqJPlu7BbROkDKtvzHJKAH0M=",
          "cache": "force-cache"
        }
      ],
      "fa-IR": [
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.vqz44t1kk1.wasm",
          "hash": "sha256-97UCXuyewOBEM+W1oge/2i0dBS9v2V90KaWEBMtQYjc=",
          "cache": "force-cache"
        }
      ],
      "fa": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.5e6c4i16bo.wasm",
          "hash": "sha256-o7jxjqEef1DU+bNIGFOnLl6aSyZOCZOSGk5UvzAYoxE=",
          "cache": "force-cache"
        }
      ],
      "fi": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.mepg9tcpvo.wasm",
          "hash": "sha256-niHPMJgPwRUFS78saQe2hi9JSErgWMJuR5C0d11T9N4=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.4zt7rk50aj.wasm",
          "hash": "sha256-gK6/RiZtkAUzUrQo8g98L1GXHuQGFhBuxXEFOFN995s=",
          "cache": "force-cache"
        }
      ],
      "fil": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.7e19hggyb7.wasm",
          "hash": "sha256-sR//gDKaZNnQJjz6OSeWOs/RWlKxlBjo4GhLCi4ReUQ=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.kxzoj53sv4.wasm",
          "hash": "sha256-6CJZurPnk/BrtwdTdgGLberguTTBhOeOGLOYynDdxQM=",
          "cache": "force-cache"
        }
      ],
      "fr": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.xkld73c32p.wasm",
          "hash": "sha256-gYGi3mhqtbwbW1hCOazFBj0sLKMGzSWEvSX4FJRRESI=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.5c5n2uhz5q.wasm",
          "hash": "sha256-xcQSwogta7Nw7HVE8gbo9HmxJ3H37gbYHMvDjmw/0JU=",
          "cache": "force-cache"
        }
      ],
      "he": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.ifsqwknkt6.wasm",
          "hash": "sha256-ko2nMyNvibCT5o/i6nXt82GMnUpixpl6d3cvy426x9g=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.ns10rlpqrd.wasm",
          "hash": "sha256-F4ht0sj9gtZHKqmGq48jlaLSN3ZVd+XfRUTnsUMi2zk=",
          "cache": "force-cache"
        }
      ],
      "hr-HR": [
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.wawyy9gfi2.wasm",
          "hash": "sha256-+EGv7CHNFPHJkbcZshrEN6jOhd6wE6qZ41pcVzzndBA=",
          "cache": "force-cache"
        }
      ],
      "hr": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.79hbyyyap5.wasm",
          "hash": "sha256-G/akfl1X/GB9Mb8i2BZnfD08kij59xQCmXLumknmByg=",
          "cache": "force-cache"
        }
      ],
      "hu": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.7xaixct9el.wasm",
          "hash": "sha256-NXfueIkeEPC7fzoRK6R6ExQRdreyKCLtXT5PsZctFPA=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.2svls3t951.wasm",
          "hash": "sha256-3tOU9dWtAh+M5spwwcuBtYA+YHGp7avbSfNA7GAH6Gg=",
          "cache": "force-cache"
        }
      ],
      "hy": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.7a9l838cmp.wasm",
          "hash": "sha256-P5Zpggf/xI57TXFVFjkXYUob5m0CDKfR9NzdqJB+Mpc=",
          "cache": "force-cache"
        }
      ],
      "id": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.0u1xmyvx8i.wasm",
          "hash": "sha256-iFXOuoV6Gjp306xvZErmvV7Nvs7sHlibubQ5Aq25Acs=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.tpsjcx7w0a.wasm",
          "hash": "sha256-ITg6weOiDe51LcTIztV+IC7t9d6EuYuZgHmz9W3bW88=",
          "cache": "force-cache"
        }
      ],
      "is": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.qd8nyryyy8.wasm",
          "hash": "sha256-Lti9XwVicL80hDSn7vS68If3WSyDXxLpzuCGUPaTNDY=",
          "cache": "force-cache"
        }
      ],
      "it": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.ao88to7rf0.wasm",
          "hash": "sha256-6qoFkb+Lagk3dDD5fdo16j8czanZIt1xysPJNAEcy10=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.awkkn4dj8w.wasm",
          "hash": "sha256-yj1hXaArq2tX4Ab73cmWt3u7uxsYrq6lfb+CxWnnezE=",
          "cache": "force-cache"
        }
      ],
      "ja": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.ljilqzpin6.wasm",
          "hash": "sha256-ISfmPOPRgmhy5g9SqCIOb/R6jWSDRArDGOHSlekxXq8=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.1finjrl39b.wasm",
          "hash": "sha256-/QvTDF8PWG0dyQCrjqRYZLb7LyBjlUS8LSie8fGcjJw=",
          "cache": "force-cache"
        }
      ],
      "kk-KZ": [
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.pb4ili3s3l.wasm",
          "hash": "sha256-ZdPZbof9Xksa6VpUmckfUhPDHL1zKjmPXeyEEoXwOSE=",
          "cache": "force-cache"
        }
      ],
      "ko": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.xi8qttippi.wasm",
          "hash": "sha256-VyHdsZ/qvSbz7oPodZOqnt0AafVfKrL+ZfoJ4v7vIC4=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.kwd3u6e08t.wasm",
          "hash": "sha256-3AD+qi9UL+Szjwq/OhYopGMqo933REI0KefK8X8cHcs=",
          "cache": "force-cache"
        }
      ],
      "ku": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.rlhy18aq1d.wasm",
          "hash": "sha256-n25FzL3DiK9KQeh3QdxjBjVCcyy8B0w8xoPNokSK88o=",
          "cache": "force-cache"
        }
      ],
      "lb": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.l93eyypep6.wasm",
          "hash": "sha256-CUJcgzDb3vNcG8okWiiD0vMo0Jjld3Ze8HoisItQEk0=",
          "cache": "force-cache"
        }
      ],
      "lt": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.pixmtgky9p.wasm",
          "hash": "sha256-MZAAQavd7L0/NMfzo9H4KMc0Ox+98QiBUOyqm8pHTHg=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.rppnb9dyhm.wasm",
          "hash": "sha256-7+Dbq5sjL+YkcRT54W7L5i1wkCQvngb80uKQRum/O18=",
          "cache": "force-cache"
        }
      ],
      "lv-LV": [
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.06pef9wviz.wasm",
          "hash": "sha256-GJYr8en81reM6ewvFVKfqMNcEF91M3w636CIzMlOElQ=",
          "cache": "force-cache"
        }
      ],
      "lv": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.4cf66el357.wasm",
          "hash": "sha256-JGG7xk53lYochMhP9aFpzO86q3KGhRD6mPSYdO3UWpA=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.m87ybenp0g.wasm",
          "hash": "sha256-2hPK20wr6pOiFaDrU+TjKPfHFQQepf2lu3IFNi6AFEY=",
          "cache": "force-cache"
        }
      ],
      "ms-MY": [
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.o6xjwosd0s.wasm",
          "hash": "sha256-QFFfI1rZaffAgEmUmslMX+A5Kx+Udt5YbUaAdzpHPYQ=",
          "cache": "force-cache"
        }
      ],
      "ms": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.1vyxw0l4i9.wasm",
          "hash": "sha256-Q2H47JdHdAmLY7xA12/2ovKmvflDTZZS+lCQ/Lkv9GI=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.rws2j2sk82.wasm",
          "hash": "sha256-2/nAoXq80Fl7Mrtqde2OzSuncoIfyxghKdU8mlP9Eaw=",
          "cache": "force-cache"
        }
      ],
      "mt": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.c3914s2kux.wasm",
          "hash": "sha256-SHguSReE76sGRlDosgWydmNxR+gcCH7/EDfHeKYuNkY=",
          "cache": "force-cache"
        }
      ],
      "nb": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.tnv7qd54or.wasm",
          "hash": "sha256-CZoSy5rQiTYKR3lnTdkEHFEwAr7eTm364PuJYrdhNUo=",
          "cache": "force-cache"
        }
      ],
      "nl": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.1m0adf1oi2.wasm",
          "hash": "sha256-ZwUdyyalTFXZDMmIfTLWzcXTREzwwnQTxfk29CSLB44=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.97b588d2i0.wasm",
          "hash": "sha256-C8BXL98wv+j4y3h8nSv0lBX3kVzITaYIstA/kZhl9WA=",
          "cache": "force-cache"
        }
      ],
      "no": [
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.11yrgmqdw5.wasm",
          "hash": "sha256-+xLjwzLowBvUmtWvqob2AJVzuCB2zKYoR+NkOmPkgx8=",
          "cache": "force-cache"
        }
      ],
      "pl": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.g594rjfh9o.wasm",
          "hash": "sha256-VF7epIe87z9jPgXCoZmgqHN3CTPwptvqCC/MfbwEltM=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.e7dwum3eqk.wasm",
          "hash": "sha256-Jk/PL9P2jnPzj0BJgE/4v/gIF1tu9fn2dYLGZ4wuY/o=",
          "cache": "force-cache"
        }
      ],
      "pt-BR": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.uyfu5odncn.wasm",
          "hash": "sha256-qj5X6h5kbS+JExp6KXZcRWCoGIb8eEZP2tswYbiSL6M=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.fiseo64z29.wasm",
          "hash": "sha256-13fGRoDXKA0KqqXRpRYKau5gn1vPKAj8k+/bPOqVvRk=",
          "cache": "force-cache"
        }
      ],
      "pt": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.dw4kbd51rr.wasm",
          "hash": "sha256-M9sccPq3ilfPy7yvr8pELdEYty3NaEAwRkWuiZumA9E=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.5meh3rm8fn.wasm",
          "hash": "sha256-PfMQFfuXOp0K7uZoiYW3X37eWpDHId6malOZSo3p6Jw=",
          "cache": "force-cache"
        }
      ],
      "ro": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.xa07t5n9o5.wasm",
          "hash": "sha256-SR44di54E348X+nZ3RpNNXZKfg4+OMRryZntj62GF+E=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.7wub8pj6lh.wasm",
          "hash": "sha256-Jy0saFeriNsUyH+Rlyl+PsENZq5L2mBadp+GNmNcnxg=",
          "cache": "force-cache"
        }
      ],
      "ru": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.wdj6gugi5f.wasm",
          "hash": "sha256-pG/wv+hFOk5HjdU1DpP7OwqitNnEabYpdXaeMjN/zIo=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.y8hym84lex.wasm",
          "hash": "sha256-0gGbsDnvpbgCsOKnlPQMAII+nCCrQAAPPmni/5Hdulc=",
          "cache": "force-cache"
        }
      ],
      "si-LK": [
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.83gj5sna9s.wasm",
          "hash": "sha256-zCLmT3MiixS5++FTWIrfuAT3lrxNDZgR5LcfunTewV4=",
          "cache": "force-cache"
        }
      ],
      "sk": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.9x28gy37kc.wasm",
          "hash": "sha256-M3cRUYxxjBuoQdvAKiRy960HrHYlLTr3S4xXC+wJwpU=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.ja0c7uuv61.wasm",
          "hash": "sha256-hTSNTxX/kcDRoGnizPc3JvQ+2vHLuY4Rk9ooJkIkp+A=",
          "cache": "force-cache"
        }
      ],
      "sl": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.e7md3wiry0.wasm",
          "hash": "sha256-VgvTtYI1xHO03SRKw15y/KcjbfYiALd2CeJ30j5u5DE=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.0aw2mkcnco.wasm",
          "hash": "sha256-GMrM1xSig+HwjMULqzp9gAwTZEVUbd6rP/HoZegdhKE=",
          "cache": "force-cache"
        }
      ],
      "sr-Latn": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.isqpt7qr6i.wasm",
          "hash": "sha256-4myaT3WO6nE82daRVAX+/Ax6EhCKba4xfcWjTguEnCA=",
          "cache": "force-cache"
        }
      ],
      "sr": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.cjpkl1pv6g.wasm",
          "hash": "sha256-SOfLAfV7TRk9njdTUM85wg9Ea5AgfYsyXwR0P90bZH0=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.qzwjkl9u3f.wasm",
          "hash": "sha256-xkUwiG5jOvh0VdD17b2MMhqF17B8VfsuEnOht7xVA5A=",
          "cache": "force-cache"
        }
      ],
      "sv": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.f1krlsurya.wasm",
          "hash": "sha256-M2OWg3Aqhl0f1wXwfnh6R1zTEqbWT1hjlH05VeK5puM=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.gqxnutdlvi.wasm",
          "hash": "sha256-eHOTIg/USqP+1ORd0eYqlkuk0u5mYnTm5laal6DAla4=",
          "cache": "force-cache"
        }
      ],
      "tg-TJ": [
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.uelh52vtyq.wasm",
          "hash": "sha256-piOshfVSZHBHAb16ntqi4WQ+GztwKn42A7zmKuatsEs=",
          "cache": "force-cache"
        }
      ],
      "th": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.zvqrnu3tc9.wasm",
          "hash": "sha256-39/a7nP0xsVlxovvLN7X62PA/TkWqQPaHHBOfJL/F60=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.rmjma04ie0.wasm",
          "hash": "sha256-HelENwZ3XSbmoB4VCN6r31hp0EpD+8j3GKOckYqvSaY=",
          "cache": "force-cache"
        }
      ],
      "tr": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.5d7au0kulq.wasm",
          "hash": "sha256-yeFtvpZsNRdBbQOxTG2ka3TSBG6dMZB5fpXhGIj53CU=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.pe7r1f9up3.wasm",
          "hash": "sha256-QasEXu+LZkky+eGzJeGimKYjW98+fRAWz1gpC/MbDgM=",
          "cache": "force-cache"
        }
      ],
      "uk": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.tkorifj7mt.wasm",
          "hash": "sha256-02xTIJd0VS31a2sr9a8wrrop83z9NMNY/zSuGVxJx1E=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.sbb9083dm0.wasm",
          "hash": "sha256-mDE4i2DAS9U0l+VMITZijK6lFz5/aFwcUYRCc6bGTSk=",
          "cache": "force-cache"
        }
      ],
      "uz-Cyrl-UZ": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.a4bspw263u.wasm",
          "hash": "sha256-tv+3utRUf4mDuKv8cchUzw3gNs3u31KLMDKVjsJAcAk=",
          "cache": "force-cache"
        }
      ],
      "uz-Latn-UZ": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.lij0v80ewo.wasm",
          "hash": "sha256-zYE3H5yNbsggkUemc8JhF7+T8jPCwTmJeJkq2jEskWA=",
          "cache": "force-cache"
        }
      ],
      "vi": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.6y6hi0l8mu.wasm",
          "hash": "sha256-kiBK+xb0SkCc9ZQXtFbnqPus6n7auLhxdeT51vbtu5U=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.3s9xgoxjml.wasm",
          "hash": "sha256-w+/qfCZc5bdGSw16WYefq/a/k8fBEBMrvymkWvaQN/s=",
          "cache": "force-cache"
        }
      ],
      "zh-CN": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.qs9uwihv5z.wasm",
          "hash": "sha256-5vp7CFKZAFSGQFNtLp5G6jW7GwJRswR66RNZgdz/E7Q=",
          "cache": "force-cache"
        }
      ],
      "zh-Hans": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.gljyib8evy.wasm",
          "hash": "sha256-TAped9//SkL37GmFTKmBUZK/hiLfeBkq0HgXFiSHTfk=",
          "cache": "force-cache"
        }
      ],
      "zh-Hant": [
        {
          "virtualPath": "Humanizer.resources.wasm",
          "name": "Humanizer.resources.99c9jzyifr.wasm",
          "hash": "sha256-s1rynTDQArjoswop0z179XN8VtZaMHYEUlGVMCBfatU=",
          "cache": "force-cache"
        },
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.wbcq78639i.wasm",
          "hash": "sha256-FJi+YtqkWS+DxGvP0ZBO9CIdGQm3UAiq7CnT9ALVXcQ=",
          "cache": "force-cache"
        }
      ],
      "zh": [
        {
          "virtualPath": "osu.Game.Resources.resources.wasm",
          "name": "osu.Game.Resources.resources.uyocg5ddj6.wasm",
          "hash": "sha256-Zl0AT+nvr/pEu3A5qWGQmJ4HkUqbp6JQSdA4mJvtcVA=",
          "cache": "force-cache"
        }
      ]
    }
  },
  "debugLevel": 0,
  "globalizationMode": "sharded",
  "runtimeConfig": {
    "runtimeOptions": {
      "configProperties": {
        "System.Diagnostics.Debugger.IsSupported": false,
        "System.Diagnostics.Metrics.Meter.IsSupported": false,
        "System.Diagnostics.Tracing.EventSource.IsSupported": false,
        "System.Globalization.Invariant": false,
        "System.TimeZoneInfo.Invariant": false,
        "System.Linq.Enumerable.IsSizeOptimized": true,
        "System.Net.Http.EnableActivityPropagation": false,
        "System.Net.Http.WasmEnableStreamingResponse": true,
        "System.Net.SocketsHttpHandler.Http3Support": false,
        "System.Reflection.Metadata.MetadataUpdater.IsSupported": false,
        "System.Resources.UseSystemResourceKeys": true,
        "System.Runtime.Serialization.EnableUnsafeBinaryFormatterSerialization": false,
        "System.Text.Encoding.EnableUnsafeUTF7Encoding": false
      }
    }
  }
}/*json-end*/);export{ht as default,gt as dotnet,pt as exit};
