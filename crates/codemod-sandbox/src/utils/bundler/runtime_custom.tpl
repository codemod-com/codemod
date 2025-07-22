(function() {
  var modules = {};
  var cache = {};
  var builtinModules = {};
  
  function __codemod_require(id) {
    // Check if it's a built-in module first
    if (builtinModules[id]) {
      return builtinModules[id];
    }
    
    if (cache[id]) {
      return cache[id];
    }
    
    var exports = {};
    cache[id] = exports;
    
    if (modules[id]) {
      modules[id](exports, __codemod_require);
    }
    
    return exports;
  }
  
  function __codemod_define(id, factory) {
    modules[id] = factory;
  }
  
  function __codemod_register_builtin(id, module) {
    builtinModules[id] = module;
  }
  
  globalThis.__codemod_require = __codemod_require;
  globalThis.__codemod_define = __codemod_define;
  globalThis.__codemod_register_builtin = __codemod_register_builtin;
})();