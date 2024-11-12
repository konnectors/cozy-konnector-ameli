/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(2);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "ContentScript", ({
  enumerable: true,
  get: function get() {
    return _ContentScript.default;
  }
}));
Object.defineProperty(exports, "RequestInterceptor", ({
  enumerable: true,
  get: function get() {
    return _RequestInterceptor.default;
  }
}));
var _ContentScript = _interopRequireDefault(__webpack_require__(3));
var _RequestInterceptor = _interopRequireDefault(__webpack_require__(49));

/***/ }),
/* 2 */
/***/ ((module) => {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(2);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.WORKER_TYPE = exports.PILOT_TYPE = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(4));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(6));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(12));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(13));
var _createClass2 = _interopRequireDefault(__webpack_require__(14));
var _minilog = _interopRequireDefault(__webpack_require__(15));
var _umd = _interopRequireDefault(__webpack_require__(27));
var _pTimeout = _interopRequireDefault(__webpack_require__(28));
var _pWaitFor = _interopRequireWildcard(__webpack_require__(29));
var _utils = __webpack_require__(30);
var _package = _interopRequireDefault(__webpack_require__(31));
var _LauncherBridge = _interopRequireDefault(__webpack_require__(32));
var _utils2 = __webpack_require__(42);
var _wrapTimer = __webpack_require__(47);
var _window; // @ts-check
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var _log = (0, _minilog.default)('ContentScript class');
var s = 1000;
var m = 60 * s;
var DEFAULT_LOGIN_TIMEOUT = 5 * m;
var DEFAULT_WAIT_FOR_ELEMENT_TIMEOUT = 30 * s;
var DEFAULT_WAIT_FOR_ELEMENT_ACCROSS_PAGES_TIMEOUT = 60 * s;
var PILOT_TYPE = exports.PILOT_TYPE = 'pilot';
var WORKER_TYPE = exports.WORKER_TYPE = 'worker';
if ((_window = window) !== null && _window !== void 0 && _window.addEventListener) {
  // allows cozy-clisk to be embedded in other envs (react-native, jest)
  window.addEventListener('load', function () {
    sendPageMessage('load');
  });
  window.addEventListener('DOMContentLoaded', function () {
    sendPageMessage('DOMContentLoaded');
  });
}
var ContentScript = exports["default"] = /*#__PURE__*/function () {
  function ContentScript() {
    var _this = this;
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2.default)(this, ContentScript);
    sendPageMessage('NEW_WORKER_INITIALIZING');
    var logDebug = function logDebug(message) {
      return _this.log('debug', message);
    };
    var wrapTimerDebug = (0, _wrapTimer.wrapTimerFactory)({
      logFn: logDebug
    });
    var logInfo = function logInfo(message) {
      return _this.log('info', message);
    };
    var wrapTimerInfo = (0, _wrapTimer.wrapTimerFactory)({
      logFn: logInfo
    });
    this.ensureAuthenticated = wrapTimerInfo(this, 'ensureAuthenticated');
    this.ensureNotAuthenticated = wrapTimerInfo(this, 'ensureNotAuthenticated');
    this.getUserDataFromWebsite = wrapTimerInfo(this, 'getUserDataFromWebsite');
    this.fetch = wrapTimerInfo(this, 'fetch');
    this.waitForAuthenticated = wrapTimerDebug(this, 'waitForAuthenticated');
    this.waitForNotAuthenticated = wrapTimerDebug(this, 'waitForNotAuthenticated');
    this.runInWorker = wrapTimerDebug(this, 'runInWorker', {
      suffixFn: function suffixFn(args) {
        return args === null || args === void 0 ? void 0 : args[0];
      }
    });
    this.runInWorkerUntilTrue = wrapTimerDebug(this, 'runInWorkerUntilTrue', {
      suffixFn: function suffixFn(args) {
        var _args$;
        return (_args$ = args[0]) === null || _args$ === void 0 ? void 0 : _args$.method;
      }
    });
    this.waitForElementInWorker = wrapTimerDebug(this, 'waitForElementInWorker', {
      suffixFn: function suffixFn(args) {
        return args === null || args === void 0 ? void 0 : args[0];
      }
    });
    this.clickAndWait = wrapTimerDebug(this, 'clickAndWait', {
      suffixFn: function suffixFn(args) {
        return "".concat(args === null || args === void 0 ? void 0 : args[0], " ").concat(args === null || args === void 0 ? void 0 : args[1]);
      }
    });
    this.saveFiles = wrapTimerDebug(this, 'saveFiles', {
      suffixFn: function suffixFn(args) {
        return "".concat(args === null || args === void 0 ? void 0 : args[0].length, " files");
      }
    });
    this.saveBills = wrapTimerDebug(this, 'saveBills');
    this.getCredentials = wrapTimerDebug(this, 'getCredentials');
    this.saveCredentials = wrapTimerDebug(this, 'saveCredentials');
    this.saveIdentity = wrapTimerDebug(this, 'saveIdentity');
    this.getCookiesByDomain = wrapTimerDebug(this, 'getCookiesByDomain', {
      suffixFn: function suffixFn(args) {
        return args === null || args === void 0 ? void 0 : args[0];
      }
    });
    this.getCookieFromKeychainByName = wrapTimerDebug(this, 'getCookieFromKeychainByName', {
      suffixFn: function suffixFn(args) {
        return args === null || args === void 0 ? void 0 : args[0];
      }
    });
    this.saveCookieToKeychain = wrapTimerDebug(this, 'saveCookieToKeychain', {
      suffixFn: function suffixFn(args) {
        return args === null || args === void 0 ? void 0 : args[0];
      }
    });
    this.getCookieByDomainAndName = wrapTimerDebug(this, 'getCookieByDomainAndName', {
      suffixFn: function suffixFn(args) {
        return "".concat(args === null || args === void 0 ? void 0 : args[0], " ").concat(args === null || args === void 0 ? void 0 : args[1]);
      }
    });
    this.goto = wrapTimerDebug(this, 'goto', {
      suffixFn: function suffixFn(args) {
        return args === null || args === void 0 ? void 0 : args[0];
      }
    });
    this.downloadFileInWorker = wrapTimerDebug(this, 'downloadFileInWorker', {
      suffixFn: function suffixFn(args) {
        var _args$2;
        return args === null || args === void 0 || (_args$2 = args[0]) === null || _args$2 === void 0 ? void 0 : _args$2.fileurl;
      }
    });
    this.waitForRequestInterception = wrapTimerDebug(this, 'waitForRequestInterception', {
      suffixFn: function suffixFn(args) {
        return args === null || args === void 0 ? void 0 : args[0];
      }
    });
    if (options.requestInterceptor) {
      this.requestInterceptor = options.requestInterceptor;
      this.requestInterceptor.setLogger(this.log.bind(this));
    }
  }
  /**
   * Init the bridge communication with the launcher.
   * It also exposes the methods which will be callable by the launcher
   *
   * @param {object} options : options object
   * @param {Array<string>} [options.additionalExposedMethodsNames] : list of additional method of the
   * content script to expose. To make it callable via the worker.
   */
  (0, _createClass2.default)(ContentScript, [{
    key: "init",
    value: (function () {
      var _init = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var _this2 = this;
        var options,
          exposedMethodsNames,
          exposedMethods,
          _i,
          _exposedMethodsNames,
          method,
          _args = arguments;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              options = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
              this.bridge = new _LauncherBridge.default({
                localWindow: window
              });
              exposedMethodsNames = ['setContentScriptType', 'ensureAuthenticated', 'ensureNotAuthenticated', 'checkAuthenticated', 'waitForAuthenticated', 'waitForNotAuthenticated', 'waitForElementNoReload', 'getUserDataFromWebsite', 'fetch', 'click', 'fillText', 'storeFromWorker', 'clickAndWait', 'getCookiesByDomain', 'getCookieByDomainAndName', 'downloadFileInWorker', 'getDebugData', 'getCliskVersion', 'checkForElement', 'evaluate'];
              if (options.additionalExposedMethodsNames) {
                exposedMethodsNames.push.apply(exposedMethodsNames, options.additionalExposedMethodsNames);
              }
              exposedMethods = {}; // TODO error handling
              // should catch and call onError on the launcher to let it handle the job update
              for (_i = 0, _exposedMethodsNames = exposedMethodsNames; _i < _exposedMethodsNames.length; _i++) {
                method = _exposedMethodsNames[_i];
                exposedMethods[method] = this[method].bind(this);
              }
              this.store = {};
              _context.next = 9;
              return this.bridge.init({
                exposedMethods: exposedMethods
              });
            case 9:
              window.onbeforeunload = function () {
                return _this2.log('debug', "window.beforeunload detected with previous url : ".concat(document.location));
              };
            case 10:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function init() {
        return _init.apply(this, arguments);
      }
      return init;
    }()
    /**
     * This method is called when the worker is ready on the current page. This is a good place to
     * subscribe to dom events for examples. These subscriptions will be replayed on each worker page
     * reload
     */
    )
  }, {
    key: "onWorkerReady",
    value: function onWorkerReady() {}

    /**
     * This method is called fon the pilot when the worker sends workerEvent events to the bridge
     */
  }, {
    key: "onWorkerEvent",
    value: function onWorkerEvent() {}

    /**
     * Set the ContentScript type. This is usefull to know which webview is the pilot or the worker
     *
     * @param {string} contentScriptType - ("pilot" | "worker")
     */
  }, {
    key: "setContentScriptType",
    value: (function () {
      var _setContentScriptType = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(contentScriptType) {
        var _this3 = this;
        var _this$requestIntercep;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              this.contentScriptType = contentScriptType;
              _log.info("I am the ".concat(contentScriptType));
              if (this.bridge) {
                _context2.next = 4;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 4:
              if (contentScriptType === WORKER_TYPE) {
                this.onWorkerReady();
                (_this$requestIntercep = this.requestInterceptor) === null || _this$requestIntercep === void 0 || _this$requestIntercep.on('response', function (response) {
                  var _this3$bridge;
                  (_this3$bridge = _this3.bridge) === null || _this3$bridge === void 0 || _this3$bridge.emit('workerEvent', {
                    event: 'requestResponse',
                    payload: response
                  });
                });
              } else if (contentScriptType === PILOT_TYPE) {
                this.bridge.addEventListener('workerEvent', this.onWorkerEvent.bind(this));
              }
            case 5:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function setContentScriptType(_x) {
        return _setContentScriptType.apply(this, arguments);
      }
      return setContentScriptType;
    }()
    /**
     * Check if the user is authenticated or not. This method is made to be overloaded by the child class
     *
     * @returns {Promise.<boolean>} : true if authenticated or false in other case
     */
    )
  }, {
    key: "checkAuthenticated",
    value: (function () {
      var _checkAuthenticated = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", false);
            case 1:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }));
      function checkAuthenticated() {
        return _checkAuthenticated.apply(this, arguments);
      }
      return checkAuthenticated;
    }()
    /**
     * This method is made to run in the worker and will resolve as true when
     * the user is authenticated
     *
     * @param {object} options        - options object
     * @param {number} [options.timeout] - number of miliseconds before the function sends a timeout error. Default 5m
     * @param {number} [options.interval] - interval in ms between checkAuthenticated calls. Default 1s
     * @returns {Promise.<true>} : if authenticated
     * @throws {TimeoutError}: TimeoutError from p-wait-for package if timeout expired
     */
    )
  }, {
    key: "waitForAuthenticated",
    value: (function () {
      var _waitForAuthenticated = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var options,
          timeout,
          interval,
          _args4 = arguments;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              options = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : {};
              this.onlyIn(WORKER_TYPE, 'waitForAuthenticated');
              timeout = options.timeout || DEFAULT_LOGIN_TIMEOUT;
              interval = options.interval || 1000;
              _context4.next = 6;
              return (0, _pWaitFor.default)(this.checkAuthenticated.bind(this), {
                interval: interval,
                timeout: {
                  milliseconds: timeout,
                  message: new _pWaitFor.TimeoutError("waitForAuthenticated timed out after ".concat(timeout, "ms"))
                }
              });
            case 6:
              return _context4.abrupt("return", true);
            case 7:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function waitForAuthenticated() {
        return _waitForAuthenticated.apply(this, arguments);
      }
      return waitForAuthenticated;
    }()
    /**
     * Resolves when the dom is ready (DOMContentLoaded event)
     *
     * @returns {Promise<void>}
     */
    )
  }, {
    key: "waitForDomReady",
    value: (function () {
      var _waitForDomReady = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        var self, domReadyPromise;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              self = this;
              domReadyPromise = new Promise(function (resolve) {
                var _document, _document2, _document3;
                // first check if the DOMContentLoad has already been called
                if (((_document = document) === null || _document === void 0 ? void 0 : _document.readyState) === 'complete' || ((_document2 = document) === null || _document2 === void 0 ? void 0 : _document2.readyState) === 'loaded' || ((_document3 = document) === null || _document3 === void 0 ? void 0 : _document3.readyState) === 'interactive') {
                  resolve();
                } else {
                  window.addEventListener('DOMContentLoaded', function () {
                    resolve();
                  });
                }
              });
              return _context5.abrupt("return", (0, _pTimeout.default)(domReadyPromise, {
                milliseconds: 10000,
                fallback: function fallback() {
                  return self.log('warn', 'waitForDomReady timed out after 10s, we may have missed the DOMContentLoad event');
                }
              }));
            case 3:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
      function waitForDomReady() {
        return _waitForDomReady.apply(this, arguments);
      }
      return waitForDomReady;
    }()
    /**
     * This method is made to run in the worker and will resolve as true when
     * the user is not authenticated
     *
     * @param {object} options        - options object
     * @param {number} [options.timeout] - number of miliseconds before the function sends a timeout error. Default 30s
     * @param {number} [options.interval] - interval in ms between checkAuthenticated calls. Default 1s
     * @returns {Promise.<true>} : if not authenticated
     * @throws {TimeoutError}: TimeoutError from p-wait-for package if timeout expired
     */
    )
  }, {
    key: "waitForNotAuthenticated",
    value: (function () {
      var _waitForNotAuthenticated = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
        var _this4 = this;
        var options,
          timeout,
          interval,
          _args7 = arguments;
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              options = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : {};
              this.onlyIn(WORKER_TYPE, 'waitForNotAuthenticated');
              timeout = options.timeout || DEFAULT_WAIT_FOR_ELEMENT_TIMEOUT;
              interval = options.interval || 1000;
              _context7.next = 6;
              return (0, _pWaitFor.default)( /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6() {
                var authenticated;
                return _regenerator.default.wrap(function _callee6$(_context6) {
                  while (1) switch (_context6.prev = _context6.next) {
                    case 0:
                      _context6.next = 2;
                      return _this4.checkAuthenticated.bind(_this4)();
                    case 2:
                      authenticated = _context6.sent;
                      return _context6.abrupt("return", !authenticated);
                    case 4:
                    case "end":
                      return _context6.stop();
                  }
                }, _callee6);
              })), {
                interval: interval,
                timeout: {
                  milliseconds: timeout,
                  message: new _pWaitFor.TimeoutError("waitForNotAuthenticated timed out after ".concat(timeout, "ms"))
                }
              });
            case 6:
              return _context7.abrupt("return", true);
            case 7:
            case "end":
              return _context7.stop();
          }
        }, _callee7, this);
      }));
      function waitForNotAuthenticated() {
        return _waitForNotAuthenticated.apply(this, arguments);
      }
      return waitForNotAuthenticated;
    }()
    /**
     * Wait for the given identified request to be intercepted. The identified request must be defined and
     * sent to the ContentScript constructor
     *
     * @param {string} identifier - any identifier string defined in the RequestInterceptor
     * @param {object} [options] - options object
     * @param {number} [options.timeout] - number of miliseconds before the function sends a timeout error. Default 60000ms
     */
    )
  }, {
    key: "waitForRequestInterception",
    value: function waitForRequestInterception(identifier) {
      var _options$timeout,
        _this5 = this;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this.onlyIn(PILOT_TYPE, 'waitForRequestInterception');
      var timeout = (_options$timeout = options === null || options === void 0 ? void 0 : options.timeout) !== null && _options$timeout !== void 0 ? _options$timeout : 60000;
      var interceptionPromise = new Promise(function (resolve) {
        var listener = function listener(_ref2) {
          var event = _ref2.event,
            payload = _ref2.payload;
          if (event === 'requestResponse' && payload.identifier === identifier) {
            if (!_this5.bridge) {
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            }
            _this5.bridge.removeEventListener('workerEvent', listener);
            resolve(payload);
          }
        };
        if (!_this5.bridge) {
          throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
        }
        _this5.bridge.addEventListener('workerEvent', listener);
      });
      return (0, _pTimeout.default)(interceptionPromise, {
        milliseconds: timeout,
        message: "Timed out after waiting ".concat(timeout, "ms for interception of ").concat(identifier)
      });
    }

    /**
     * Run a specified method in the worker webview
     *
     * @param {string} method : name of the method to run
     */
  }, {
    key: "runInWorker",
    value: (function () {
      var _runInWorker = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8(method) {
        var _this$bridge;
        var _len,
          args,
          _key,
          _args8 = arguments;
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'runInWorker');
              if (this.bridge) {
                _context8.next = 3;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 3:
              for (_len = _args8.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = _args8[_key];
              }
              _context8.next = 6;
              return (_this$bridge = this.bridge).call.apply(_this$bridge, ['runInWorker', method].concat(args));
            case 6:
              return _context8.abrupt("return", _context8.sent);
            case 7:
            case "end":
              return _context8.stop();
          }
        }, _callee8, this);
      }));
      function runInWorker(_x2) {
        return _runInWorker.apply(this, arguments);
      }
      return runInWorker;
    }()
    /**
     * Wait for a method to resolve as true on worker
     *
     * @param {object} options        - options object
     * @param {string} options.method - name of the method to run
     * @param {number} [options.timeout] - number of miliseconds before the function sends a timeout error. Default Infinity
     * @param {string} [options.suffix] - suffix used in timeout error message, to better identify error source
     * @param {Array} [options.args] - array of args to pass to the method
     * @returns {Promise<boolean>} - true
     * @throws {TimeoutError} - if timeout expired
     */
    )
  }, {
    key: "runInWorkerUntilTrue",
    value: (function () {
      var _runInWorkerUntilTrue = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee9(_ref3) {
        var method, _ref3$timeout, timeout, _ref3$suffix, suffix, _ref3$args, args, result, start, isTimeout;
        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              method = _ref3.method, _ref3$timeout = _ref3.timeout, timeout = _ref3$timeout === void 0 ? Infinity : _ref3$timeout, _ref3$suffix = _ref3.suffix, suffix = _ref3$suffix === void 0 ? '' : _ref3$suffix, _ref3$args = _ref3.args, args = _ref3$args === void 0 ? [] : _ref3$args;
              this.onlyIn(PILOT_TYPE, 'runInWorkerUntilTrue');
              _log.debug('runInWorkerUntilTrue', method);
              result = false;
              start = Date.now();
              isTimeout = function isTimeout() {
                return Date.now() - start >= timeout;
              };
            case 6:
              if (result) {
                _context9.next = 16;
                break;
              }
              if (!isTimeout()) {
                _context9.next = 9;
                break;
              }
              throw new _pWaitFor.TimeoutError("runInWorkerUntilTrue ".concat(method).concat(suffix, " Timeout error after ").concat(timeout));
            case 9:
              _log.debug('runInWorker call', method);
              _context9.next = 12;
              return this.runInWorker.apply(this, [method].concat((0, _toConsumableArray2.default)(args)));
            case 12:
              result = _context9.sent;
              _log.debug('runInWorker result', result);
              _context9.next = 6;
              break;
            case 16:
              return _context9.abrupt("return", result);
            case 17:
            case "end":
              return _context9.stop();
          }
        }, _callee9, this);
      }));
      function runInWorkerUntilTrue(_x3) {
        return _runInWorkerUntilTrue.apply(this, arguments);
      }
      return runInWorkerUntilTrue;
    }()
    /**
     * Wait for a dom element to be present on the page, even if there are page redirects or page
     * reloads
     *
     * @param {string} selector - css selector we are waiting for
     * @param {object} options - options object
     * @param {number} [options.timeout] - timeout in ms. Will default to 30s
     * @param {string} [options.includesText] - only select elements with the given text as innerText
     */
    )
  }, {
    key: "waitForElementInWorker",
    value: (function () {
      var _waitForElementInWorker = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee10(selector) {
        var _options$timeout2;
        var options,
          _args10 = arguments;
        return _regenerator.default.wrap(function _callee10$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              options = _args10.length > 1 && _args10[1] !== undefined ? _args10[1] : {};
              this.onlyIn(PILOT_TYPE, 'waitForElementInWorker');
              _context10.next = 4;
              return this.runInWorkerUntilTrue({
                method: 'waitForElementNoReload',
                suffix: selector,
                timeout: (_options$timeout2 = options === null || options === void 0 ? void 0 : options.timeout) !== null && _options$timeout2 !== void 0 ? _options$timeout2 : DEFAULT_WAIT_FOR_ELEMENT_ACCROSS_PAGES_TIMEOUT,
                args: [selector, {
                  includesText: options.includesText
                }]
              });
            case 4:
            case "end":
              return _context10.stop();
          }
        }, _callee10, this);
      }));
      function waitForElementInWorker(_x4) {
        return _waitForElementInWorker.apply(this, arguments);
      }
      return waitForElementInWorker;
    }()
    /**
     * Check if dom element is present on the page.
     *
     * @param {string} selector - css selector we are checking for
     * @returns {Promise<boolean>}  - Returns true or false
     */
    )
  }, {
    key: "isElementInWorker",
    value: (function () {
      var _isElementInWorker = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee11(selector) {
        var options,
          _args11 = arguments;
        return _regenerator.default.wrap(function _callee11$(_context11) {
          while (1) switch (_context11.prev = _context11.next) {
            case 0:
              options = _args11.length > 1 && _args11[1] !== undefined ? _args11[1] : {};
              this.onlyIn(PILOT_TYPE, 'isElementInWorker');
              _context11.next = 4;
              return this.runInWorker('checkForElement', selector, options);
            case 4:
              return _context11.abrupt("return", _context11.sent);
            case 5:
            case "end":
              return _context11.stop();
          }
        }, _callee11, this);
      }));
      function isElementInWorker(_x5) {
        return _isElementInWorker.apply(this, arguments);
      }
      return isElementInWorker;
    }()
    /**
     * Wait for a dom element to be present on the page. This won't resolve if the page reloads
     *
     * @param {string} selector - css selector we are waiting for
     * @param {object} [options] - options object
     * @param {string} [options.includesText] - only select elements wich include the given text as innerText
     * @returns {Promise.<true>} - Returns true when ready
     */
    )
  }, {
    key: "waitForElementNoReload",
    value: (function () {
      var _waitForElementNoReload = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee12(selector) {
        var _this6 = this;
        var options,
          _args12 = arguments;
        return _regenerator.default.wrap(function _callee12$(_context12) {
          while (1) switch (_context12.prev = _context12.next) {
            case 0:
              options = _args12.length > 1 && _args12[1] !== undefined ? _args12[1] : {};
              this.onlyIn(WORKER_TYPE, 'waitForElementNoReload');
              _log.debug('waitForElementNoReload', selector);
              _context12.next = 5;
              return (0, _pWaitFor.default)(function () {
                return _this6.checkForElement(selector, options);
              }, {
                timeout: {
                  milliseconds: DEFAULT_WAIT_FOR_ELEMENT_TIMEOUT,
                  message: new _pWaitFor.TimeoutError("waitForElementNoReload ".concat(selector).concat(options !== null && options !== void 0 && options.includesText ? ' "' + options.includesText + '"' : '', " timed out after ").concat(DEFAULT_WAIT_FOR_ELEMENT_TIMEOUT, "ms"))
                }
              });
            case 5:
              return _context12.abrupt("return", true);
            case 6:
            case "end":
              return _context12.stop();
          }
        }, _callee12, this);
      }));
      function waitForElementNoReload(_x6) {
        return _waitForElementNoReload.apply(this, arguments);
      }
      return waitForElementNoReload;
    }()
    /**
     * Check if a dom element is present on the page.
     *
     * @param {string} selector - css selector we are checking for
     * @param {object} [options] - options object
     * @param {string} [options.includesText] - only select elements with the given text as innerText
     * @returns {Promise<boolean>} - Returns true or false
     */
    )
  }, {
    key: "checkForElement",
    value: (function () {
      var _checkForElement = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee13(selector) {
        var options,
          _args13 = arguments;
        return _regenerator.default.wrap(function _callee13$(_context13) {
          while (1) switch (_context13.prev = _context13.next) {
            case 0:
              options = _args13.length > 1 && _args13[1] !== undefined ? _args13[1] : {};
              this.onlyIn(WORKER_TYPE, 'checkForElement');
              return _context13.abrupt("return", Boolean(this.selectElement(selector, options)));
            case 3:
            case "end":
              return _context13.stop();
          }
        }, _callee13, this);
      }));
      function checkForElement(_x7) {
        return _checkForElement.apply(this, arguments);
      }
      return checkForElement;
    }()
    /**
     * Select a dom element with given selector and options
     *
     * @param {string} selector - css selector of the element
     * @param {object} [options] - options object
     * @param {string} [options.includesText] - only select element with the given text as innerText
     * @returns {object|null} - Returns the selected dom element or null
     */
    )
  }, {
    key: "selectElement",
    value: function selectElement(selector) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this.onlyIn(WORKER_TYPE, 'selectElement');
      if (options !== null && options !== void 0 && options.includesText && typeof options.includesText === 'string' && options.includesText !== undefined) {
        return Array.from(document.querySelectorAll(selector)).find(function (element) {
          var _element$innerHTML;
          return (// @ts-ignore Argument of type 'string | undefined' is not assignable to parameter of type 'string'.  Type 'undefined' is not assignable to type 'string'.ts(2345)
            (_element$innerHTML = element.innerHTML) === null || _element$innerHTML === void 0 ? void 0 : _element$innerHTML.includes(options.includesText)
          );
        });
      } else {
        return document.querySelector(selector);
      }
    }

    /**
     * Click on a given element
     *
     * @param {string} selector - css selector of the element
     * @param {object} [options] - options object
     * @param {string} [options.includesText] - only select element with the given text as innerText
     * @returns {Promise<void>}
     */
  }, {
    key: "click",
    value: (function () {
      var _click = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee14(selector) {
        var options,
          elem,
          _args14 = arguments;
        return _regenerator.default.wrap(function _callee14$(_context14) {
          while (1) switch (_context14.prev = _context14.next) {
            case 0:
              options = _args14.length > 1 && _args14[1] !== undefined ? _args14[1] : {};
              this.onlyIn(WORKER_TYPE, 'click');
              elem = this.selectElement(selector, options);
              if (elem) {
                _context14.next = 5;
                break;
              }
              throw new Error("click: No DOM element is matched with the ".concat(selector, " selector"));
            case 5:
              elem.click();
            case 6:
            case "end":
              return _context14.stop();
          }
        }, _callee14, this);
      }));
      function click(_x8) {
        return _click.apply(this, arguments);
      }
      return click;
    }()
    /**
     * Click on a given element and wait for another given element to be displayed on screen
     *
     * @param {string} elementToClick - css selector of the dom element to click in worker
     * @param {string} elementToWait - css selector of the dom element to wait in worker
     * @returns {Promise<void>}
     */
    )
  }, {
    key: "clickAndWait",
    value: (function () {
      var _clickAndWait = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee15(elementToClick, elementToWait) {
        return _regenerator.default.wrap(function _callee15$(_context15) {
          while (1) switch (_context15.prev = _context15.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'clickAndWait');
              _log.debug('clicking ' + elementToClick);
              _context15.next = 4;
              return this.runInWorker('click', elementToClick);
            case 4:
              _log.debug('waiting for ' + elementToWait);
              _context15.next = 7;
              return this.waitForElementInWorker(elementToWait);
            case 7:
              _log.debug('done waiting ' + elementToWait);
            case 8:
            case "end":
              return _context15.stop();
          }
        }, _callee15, this);
      }));
      function clickAndWait(_x9, _x10) {
        return _clickAndWait.apply(this, arguments);
      }
      return clickAndWait;
    }())
  }, {
    key: "fillText",
    value: function () {
      var _fillText = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee16(selector, text) {
        var elem;
        return _regenerator.default.wrap(function _callee16$(_context16) {
          while (1) switch (_context16.prev = _context16.next) {
            case 0:
              this.onlyIn(WORKER_TYPE, 'fillText');
              elem = this.selectElement(selector);
              if (elem) {
                _context16.next = 4;
                break;
              }
              throw new Error("fillText: No DOM element is matched with the ".concat(selector, " selector"));
            case 4:
              elem.focus();
              elem.value = text;
              elem.dispatchEvent(new Event('input', {
                bubbles: true
              }));
              elem.dispatchEvent(new Event('change', {
                bubbles: true
              }));
            case 8:
            case "end":
              return _context16.stop();
          }
        }, _callee16, this);
      }));
      function fillText(_x11, _x12) {
        return _fillText.apply(this, arguments);
      }
      return fillText;
    }()
    /**
     * Download the file send by the launcher in the worker context
     *
     * @param {object} entry The entry to download with fileurl attribute
     */
  }, {
    key: "downloadFileInWorker",
    value: (function () {
      var _downloadFileInWorker = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee17(entry) {
        var errorMessage, errorToLog;
        return _regenerator.default.wrap(function _callee17$(_context17) {
          while (1) switch (_context17.prev = _context17.next) {
            case 0:
              this.onlyIn(WORKER_TYPE, 'downloadFileInWorker');
              this.log('debug', 'downloading file in worker');
              if (!entry.fileurl) {
                _context17.next = 24;
                break;
              }
              _context17.prev = 3;
              _context17.next = 6;
              return _umd.default.get(entry.fileurl, entry.requestOptions).blob();
            case 6:
              entry.blob = _context17.sent;
              _context17.next = 9;
              return (0, _utils.blobToBase64)(entry.blob);
            case 9:
              entry.dataUri = _context17.sent;
              _context17.next = 24;
              break;
            case 12:
              _context17.prev = 12;
              _context17.t0 = _context17["catch"](3);
              this.log('debug', "Full error : ".concat(JSON.stringify(_context17.t0)));
              errorMessage = _context17.t0.message;
              errorToLog = '';
              if (!errorMessage.includes(/404|403|500|502|503/g)) {
                _context17.next = 23;
                break;
              }
              if (errorMessage.includes('404')) errorToLog = 'Website cannot find the wanted url';else if (errorMessage.includes('403')) errorToLog = 'User is not allowed to access the wanted URL';else errorToLog = 'Website server error accessing the wanted URL';
              this.log('error', errorToLog);
              throw new Error('VENDOR_DOWN');
            case 23:
              throw new Error('UNKNOWN_ERROR');
            case 24:
              return _context17.abrupt("return", entry.dataUri);
            case 25:
            case "end":
              return _context17.stop();
          }
        }, _callee17, this, [[3, 12]]);
      }));
      function downloadFileInWorker(_x13) {
        return _downloadFileInWorker.apply(this, arguments);
      }
      return downloadFileInWorker;
    }())
  }, {
    key: "getDebugData",
    value: function () {
      var _getDebugData = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee18() {
        return _regenerator.default.wrap(function _callee18$(_context18) {
          while (1) switch (_context18.prev = _context18.next) {
            case 0:
              return _context18.abrupt("return", {
                url: window.location.href,
                html: window.document.documentElement.outerHTML
              });
            case 1:
            case "end":
              return _context18.stop();
          }
        }, _callee18);
      }));
      function getDebugData() {
        return _getDebugData.apply(this, arguments);
      }
      return getDebugData;
    }()
    /**
     * Bridge to the saveFiles method from the launcher.
     * - it prefilters files according to the context comming from the launcher
     * - download files when not filtered out
     * - converts blob files to base64 uri to be serializable
     *
     * @param {Array<import('../launcher/saveFiles').saveFilesEntry & {shouldReplaceFile: Function}>} entries : list of file entries to save
     * @param {import('../launcher/saveFiles').saveFileOptions & {context: object, shouldReplaceFile: Function}} options : saveFiles options
     */
  }, {
    key: "saveFiles",
    value: (function () {
      var _saveFiles = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee19(entries, options) {
        var context, updatedEntries;
        return _regenerator.default.wrap(function _callee19$(_context19) {
          while (1) switch (_context19.prev = _context19.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'saveFiles');
              this.log('debug', "saveFiles ".concat(entries.length, " input entries"));
              context = options.context;
              _log.debug(context, 'saveFiles input context');
              if (this.bridge) {
                _context19.next = 6;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 6:
              updatedEntries = this.prepareSaveFileEntries(entries, options);
              _context19.next = 9;
              return this.bridge.call('saveFiles', updatedEntries, options);
            case 9:
              return _context19.abrupt("return", _context19.sent);
            case 10:
            case "end":
              return _context19.stop();
          }
        }, _callee19, this);
      }));
      function saveFiles(_x14, _x15) {
        return _saveFiles.apply(this, arguments);
      }
      return saveFiles;
    }()
    /**
     * Prepare entries to be given to launcher saveFiles. Especially function attributes which will not be serialized to the launcher
     *
     * @param {Array<import('../launcher/saveFiles').saveFilesEntry & {shouldReplaceFile?: Function}>} entries
     * @param {import('../launcher/saveFiles').saveFileOptions & {context: object, shouldReplaceFile?: Function}} options
     */
    )
  }, {
    key: "prepareSaveFileEntries",
    value: function prepareSaveFileEntries(entries, options) {
      var _options$context;
      var existingFilesIndex = (options === null || options === void 0 || (_options$context = options.context) === null || _options$context === void 0 ? void 0 : _options$context.existingFilesIndex) || {};
      var updatedEntries = (0, _toConsumableArray2.default)(entries);
      var _iterator = _createForOfIteratorHelper(updatedEntries),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entry = _step.value;
          if (entry.forceReplaceFile === true || entry.forceReplaceFile === false) {
            // entry.forceReplaceFile has priority over shouldReplaceFile function
            continue;
          }
          var shouldReplaceFileFn = entry.shouldReplaceFile || options.shouldReplaceFile;
          if (shouldReplaceFileFn) {
            var existingFile = existingFilesIndex[(0, _utils2.calculateFileKey)(entry, options.fileIdAttributes)];
            entry.forceReplaceFile = shouldReplaceFileFn(existingFile, entry, options);
            entry === null || entry === void 0 || delete entry.shouldReplaceFile;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      options === null || options === void 0 || delete options.shouldReplaceFile;
      return updatedEntries;
    }

    /**
     * Query all the documents corresponding to the given query object. The client with permissions corresponding
     * to the current konnector manifest will be used.
     *
     * @param {import("cozy-client").QueryDefinition} queryDefinition - CozyClient query definition object
     * @param {import('cozy-client/types/types').QueryOptions} options - CozyClient query options
     * @returns {Promise<import('cozy-client/types/types').QueryResult>} Returns the list of documents
     */
  }, {
    key: "queryAll",
    value: (function () {
      var _queryAll = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee20(queryDefinition, options) {
        return _regenerator.default.wrap(function _callee20$(_context20) {
          while (1) switch (_context20.prev = _context20.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'queryAll');
              if (this.bridge) {
                _context20.next = 3;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 3:
              _context20.next = 5;
              return this.bridge.call('queryAll', queryDefinition.toDefinition(), options);
            case 5:
              return _context20.abrupt("return", _context20.sent);
            case 6:
            case "end":
              return _context20.stop();
          }
        }, _callee20, this);
      }));
      function queryAll(_x16, _x17) {
        return _queryAll.apply(this, arguments);
      }
      return queryAll;
    }()
    /**
     * Bridge to the saveBills method from the launcher.
     * - it first saves the files
     * - then saves bills linked to corresponding files
     *
     * @param {Array} entries : list of file entries to save
     * @param {object} options : saveFiles options
     */
    )
  }, {
    key: "saveBills",
    value: (function () {
      var _saveBills = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee21(entries, options) {
        var files;
        return _regenerator.default.wrap(function _callee21$(_context21) {
          while (1) switch (_context21.prev = _context21.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'saveBills');
              _context21.next = 3;
              return this.saveFiles(entries, options);
            case 3:
              files = _context21.sent;
              if (this.bridge) {
                _context21.next = 6;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 6:
              _context21.next = 8;
              return this.bridge.call('saveBills', files, options);
            case 8:
              return _context21.abrupt("return", _context21.sent);
            case 9:
            case "end":
              return _context21.stop();
          }
        }, _callee21, this);
      }));
      function saveBills(_x18, _x19) {
        return _saveBills.apply(this, arguments);
      }
      return saveBills;
    }()
    /**
     * Bridge to the getCredentials method from the launcher.
     */
    )
  }, {
    key: "getCredentials",
    value: (function () {
      var _getCredentials = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee22() {
        return _regenerator.default.wrap(function _callee22$(_context22) {
          while (1) switch (_context22.prev = _context22.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'getCredentials');
              if (this.bridge) {
                _context22.next = 3;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 3:
              _context22.next = 5;
              return this.bridge.call('getCredentials');
            case 5:
              return _context22.abrupt("return", _context22.sent);
            case 6:
            case "end":
              return _context22.stop();
          }
        }, _callee22, this);
      }));
      function getCredentials() {
        return _getCredentials.apply(this, arguments);
      }
      return getCredentials;
    }()
    /**
     * Bridge to the saveCredentials method from the launcher.
     *
     * @param {object} credentials : object with credentials specific to the current connector
     */
    )
  }, {
    key: "saveCredentials",
    value: (function () {
      var _saveCredentials = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee23(credentials) {
        return _regenerator.default.wrap(function _callee23$(_context23) {
          while (1) switch (_context23.prev = _context23.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'saveCredentials');
              if (this.bridge) {
                _context23.next = 3;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 3:
              _context23.next = 5;
              return this.bridge.call('saveCredentials', credentials);
            case 5:
              return _context23.abrupt("return", _context23.sent);
            case 6:
            case "end":
              return _context23.stop();
          }
        }, _callee23, this);
      }));
      function saveCredentials(_x20) {
        return _saveCredentials.apply(this, arguments);
      }
      return saveCredentials;
    }()
    /**
     * Bridge to the saveIdentity method from the launcher.
     *
     * @param {object} identity : io.cozy.contacts object
     */
    )
  }, {
    key: "saveIdentity",
    value: (function () {
      var _saveIdentity = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee24(identity) {
        return _regenerator.default.wrap(function _callee24$(_context24) {
          while (1) switch (_context24.prev = _context24.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'saveIdentity');
              if (this.bridge) {
                _context24.next = 3;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 3:
              _context24.next = 5;
              return this.bridge.call('saveIdentity', identity);
            case 5:
              return _context24.abrupt("return", _context24.sent);
            case 6:
            case "end":
              return _context24.stop();
          }
        }, _callee24, this);
      }));
      function saveIdentity(_x21) {
        return _saveIdentity.apply(this, arguments);
      }
      return saveIdentity;
    }()
    /**
     * Bridge to the getCookiesByDomain method from the RNlauncher.
     *
     * @param {string} domain : domain name
     */
    )
  }, {
    key: "getCookiesByDomain",
    value: (function () {
      var _getCookiesByDomain = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee25(domain) {
        return _regenerator.default.wrap(function _callee25$(_context25) {
          while (1) switch (_context25.prev = _context25.next) {
            case 0:
              if (this.bridge) {
                _context25.next = 2;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 2:
              _context25.next = 4;
              return this.bridge.call('getCookiesByDomain', domain);
            case 4:
              return _context25.abrupt("return", _context25.sent);
            case 5:
            case "end":
              return _context25.stop();
          }
        }, _callee25, this);
      }));
      function getCookiesByDomain(_x22) {
        return _getCookiesByDomain.apply(this, arguments);
      }
      return getCookiesByDomain;
    }()
    /**
     * Bridge to the getCookieFromKeychainByName method from the RNlauncher.
     *
     * @param {string} cookieName : cookie name
     */
    )
  }, {
    key: "getCookieFromKeychainByName",
    value: (function () {
      var _getCookieFromKeychainByName = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee26(cookieName) {
        return _regenerator.default.wrap(function _callee26$(_context26) {
          while (1) switch (_context26.prev = _context26.next) {
            case 0:
              if (this.bridge) {
                _context26.next = 2;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 2:
              _context26.next = 4;
              return this.bridge.call('getCookieFromKeychainByName', cookieName);
            case 4:
              return _context26.abrupt("return", _context26.sent);
            case 5:
            case "end":
              return _context26.stop();
          }
        }, _callee26, this);
      }));
      function getCookieFromKeychainByName(_x23) {
        return _getCookieFromKeychainByName.apply(this, arguments);
      }
      return getCookieFromKeychainByName;
    }()
    /**
     * Bridge to the saveCookieToKeychain method from the RNlauncher.
     *
     * @param {string} cookieValue : cookie value
     */
    )
  }, {
    key: "saveCookieToKeychain",
    value: (function () {
      var _saveCookieToKeychain = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee27(cookieValue) {
        return _regenerator.default.wrap(function _callee27$(_context27) {
          while (1) switch (_context27.prev = _context27.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'saveCookieToKeychain');
              if (this.bridge) {
                _context27.next = 3;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 3:
              _context27.next = 5;
              return this.bridge.call('saveCookieToKeychain', cookieValue);
            case 5:
              return _context27.abrupt("return", _context27.sent);
            case 6:
            case "end":
              return _context27.stop();
          }
        }, _callee27, this);
      }));
      function saveCookieToKeychain(_x24) {
        return _saveCookieToKeychain.apply(this, arguments);
      }
      return saveCookieToKeychain;
    }())
  }, {
    key: "getCookieByDomainAndName",
    value: function () {
      var _getCookieByDomainAndName = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee28(cookieDomain, cookieName) {
        var expectedCookie;
        return _regenerator.default.wrap(function _callee28$(_context28) {
          while (1) switch (_context28.prev = _context28.next) {
            case 0:
              this.onlyIn(WORKER_TYPE, 'getCookieByDomainAndName');
              if (this.bridge) {
                _context28.next = 3;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 3:
              _context28.next = 5;
              return this.bridge.call('getCookieByDomainAndName', cookieDomain, cookieName);
            case 5:
              expectedCookie = _context28.sent;
              return _context28.abrupt("return", expectedCookie);
            case 7:
            case "end":
              return _context28.stop();
          }
        }, _callee28, this);
      }));
      function getCookieByDomainAndName(_x25, _x26) {
        return _getCookieByDomainAndName.apply(this, arguments);
      }
      return getCookieByDomainAndName;
    }()
    /**
     * Send log message to the launcher
     *
     * @param {"debug"|"info"|"warn"|"error"} level : the log level
     * @param {string} message : the log message
     */
  }, {
    key: "log",
    value: function log(level, message) {
      var _this$bridge2;
      if (!message) {
        _log.warn("you are calling log without message, use log(level,message) instead");
        return;
      }
      var now = new Date().toISOString();
      (_this$bridge2 = this.bridge) === null || _this$bridge2 === void 0 || _this$bridge2.emit('log', {
        timestamp: now,
        level: level,
        msg: message
      });
    }

    /**
     * @typedef SetWorkerStateOptions
     * @property {string} [url]      : url displayed by the worker webview for the login
     * @property {boolean} [visible] : will the worker be visible or not
     */

    /**
     * This is a proxy to the "setWorkerState" command in the launcher
     *
     * @param {SetWorkerStateOptions} options : worker state options
     */
  }, {
    key: "setWorkerState",
    value: (function () {
      var _setWorkerState = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee29() {
        var options,
          _args29 = arguments;
        return _regenerator.default.wrap(function _callee29$(_context29) {
          while (1) switch (_context29.prev = _context29.next) {
            case 0:
              options = _args29.length > 0 && _args29[0] !== undefined ? _args29[0] : {};
              this.onlyIn(PILOT_TYPE, 'setWorkerState');
              if (this.bridge) {
                _context29.next = 4;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 4:
              _context29.next = 6;
              return this.bridge.call('setWorkerState', options);
            case 6:
            case "end":
              return _context29.stop();
          }
        }, _callee29, this);
      }));
      function setWorkerState() {
        return _setWorkerState.apply(this, arguments);
      }
      return setWorkerState;
    }()
    /**
     * Set the current url of the worker
     *
     * @param {string} url : the url
     */
    )
  }, {
    key: "goto",
    value: (function () {
      var _goto = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee30(url) {
        return _regenerator.default.wrap(function _callee30$(_context30) {
          while (1) switch (_context30.prev = _context30.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'goto');
              _context30.next = 3;
              return this.setWorkerState({
                url: url
              });
            case 3:
            case "end":
              return _context30.stop();
          }
        }, _callee30, this);
      }));
      function goto(_x27) {
        return _goto.apply(this, arguments);
      }
      return goto;
    }())
  }, {
    key: "blockWorkerInteractions",
    value: function () {
      var _blockWorkerInteractions = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee31() {
        return _regenerator.default.wrap(function _callee31$(_context31) {
          while (1) switch (_context31.prev = _context31.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'blockWorkerInteractions');
              if (this.bridge) {
                _context31.next = 3;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 3:
              _context31.next = 5;
              return this.bridge.call('blockWorkerInteractions');
            case 5:
            case "end":
              return _context31.stop();
          }
        }, _callee31, this);
      }));
      function blockWorkerInteractions() {
        return _blockWorkerInteractions.apply(this, arguments);
      }
      return blockWorkerInteractions;
    }()
  }, {
    key: "unblockWorkerInteractions",
    value: function () {
      var _unblockWorkerInteractions = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee32() {
        return _regenerator.default.wrap(function _callee32$(_context32) {
          while (1) switch (_context32.prev = _context32.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'unblockWorkerInteractions');
              if (this.bridge) {
                _context32.next = 3;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 3:
              _context32.next = 5;
              return this.bridge.call('unblockWorkerInteractions');
            case 5:
            case "end":
              return _context32.stop();
          }
        }, _callee32, this);
      }));
      function unblockWorkerInteractions() {
        return _unblockWorkerInteractions.apply(this, arguments);
      }
      return unblockWorkerInteractions;
    }()
    /**
     * Evaluates a given function in worker context
     *
     * @param {Function} fn - the function to evaluate
     * @returns {Promise<any>} - function evaluation result
     */
  }, {
    key: "evaluateInWorker",
    value: (function () {
      var _evaluateInWorker = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee33(fn) {
        var _len2,
          args,
          _key2,
          _args33 = arguments;
        return _regenerator.default.wrap(function _callee33$(_context33) {
          while (1) switch (_context33.prev = _context33.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'evaluateInWorker');
              for (_len2 = _args33.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = _args33[_key2];
              }
              _context33.next = 4;
              return this.runInWorker.apply(this, ['evaluate', fn.toString()].concat(args));
            case 4:
              return _context33.abrupt("return", _context33.sent);
            case 5:
            case "end":
              return _context33.stop();
          }
        }, _callee33, this);
      }));
      function evaluateInWorker(_x28) {
        return _evaluateInWorker.apply(this, arguments);
      }
      return evaluateInWorker;
    }()
    /**
     * Evaluates a given function string
     *
     * @param {string} fnString - the function string to evaluate
     * @returns {Promise<any>} - function evaluation result
     */
    )
  }, {
    key: "evaluate",
    value: (function () {
      var _evaluate = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee34(fnString) {
        var _len3,
          args,
          _key3,
          _args34 = arguments;
        return _regenerator.default.wrap(function _callee34$(_context34) {
          while (1) switch (_context34.prev = _context34.next) {
            case 0:
              this.onlyIn(WORKER_TYPE, 'evaluate');
              for (_len3 = _args34.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                args[_key3 - 1] = _args34[_key3];
              }
              _context34.next = 4;
              return _utils.callStringFunction.apply(void 0, [fnString].concat(args));
            case 4:
              return _context34.abrupt("return", _context34.sent);
            case 5:
            case "end":
              return _context34.stop();
          }
        }, _callee34, this);
      }));
      function evaluate(_x29) {
        return _evaluate.apply(this, arguments);
      }
      return evaluate;
    }()
    /**
     * Make sure that the connector is authenticated to the website.
     * If not, show the login webview to the user to let her/him authenticated.
     * Resolve the promise when authenticated
     *
     * @throws LOGIN_FAILED
     * @returns {Promise.<boolean>} : true if the user is authenticated
     */
    )
  }, {
    key: "ensureAuthenticated",
    value: (function () {
      var _ensureAuthenticated = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee35() {
        return _regenerator.default.wrap(function _callee35$(_context35) {
          while (1) switch (_context35.prev = _context35.next) {
            case 0:
              return _context35.abrupt("return", true);
            case 1:
            case "end":
              return _context35.stop();
          }
        }, _callee35);
      }));
      function ensureAuthenticated() {
        return _ensureAuthenticated.apply(this, arguments);
      }
      return ensureAuthenticated;
    }()
    /**
     * Make sure that the connector is not authenticated anymore to the website.
     *
     * @returns {Promise.<boolean>} : true if the user is not authenticated
     */
    )
  }, {
    key: "ensureNotAuthenticated",
    value: (function () {
      var _ensureNotAuthenticated = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee36() {
        return _regenerator.default.wrap(function _callee36$(_context36) {
          while (1) switch (_context36.prev = _context36.next) {
            case 0:
              return _context36.abrupt("return", true);
            case 1:
            case "end":
              return _context36.stop();
          }
        }, _callee36);
      }));
      function ensureNotAuthenticated() {
        return _ensureNotAuthenticated.apply(this, arguments);
      }
      return ensureNotAuthenticated;
    }()
    /**
     * Returns whatever unique information on the authenticated user which will be usefull
     * to identify fetched data : destination folder name, fetched data metadata
     *
     * @returns {Promise.<object>}  : user data object
     */
    )
  }, {
    key: "getUserDataFromWebsite",
    value: (function () {
      var _getUserDataFromWebsite = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee37() {
        return _regenerator.default.wrap(function _callee37$(_context37) {
          while (1) switch (_context37.prev = _context37.next) {
            case 0:
            case "end":
              return _context37.stop();
          }
        }, _callee37);
      }));
      function getUserDataFromWebsite() {
        return _getUserDataFromWebsite.apply(this, arguments);
      }
      return getUserDataFromWebsite;
    }()
    /**
     * In worker context, send the given data to the pilot to be stored in its own store
     *
     * @param {object} obj : any object with data to store
     */
    )
  }, {
    key: "sendToPilot",
    value: (function () {
      var _sendToPilot = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee38(obj) {
        return _regenerator.default.wrap(function _callee38$(_context38) {
          while (1) switch (_context38.prev = _context38.next) {
            case 0:
              this.onlyIn(WORKER_TYPE, 'sendToPilot');
              if (this.bridge) {
                _context38.next = 3;
                break;
              }
              throw new Error('No bridge is defined, you should call ContentScript.init before using this method');
            case 3:
              return _context38.abrupt("return", this.bridge.call('sendToPilot', obj));
            case 4:
            case "end":
              return _context38.stop();
          }
        }, _callee38, this);
      }));
      function sendToPilot(_x30) {
        return _sendToPilot.apply(this, arguments);
      }
      return sendToPilot;
    }()
    /**
     * Store data sent from worker with sendToPilot method
     *
     * @param {object} obj : any object with data to store
     */
    )
  }, {
    key: "storeFromWorker",
    value: (function () {
      var _storeFromWorker = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee39(obj) {
        return _regenerator.default.wrap(function _callee39$(_context39) {
          while (1) switch (_context39.prev = _context39.next) {
            case 0:
              // @ts-ignore Aucune surcharge ne correspond à cet appel.
              Object.assign(this.store, obj);
            case 1:
            case "end":
              return _context39.stop();
          }
        }, _callee39, this);
      }));
      function storeFromWorker(_x31) {
        return _storeFromWorker.apply(this, arguments);
      }
      return storeFromWorker;
    }())
  }, {
    key: "onlyIn",
    value: function onlyIn(csType, method) {
      if (this.contentScriptType !== csType) {
        throw new Error("Use ".concat(method, " only from the ").concat(csType));
      }
    }

    /**
     * Determine if the konnector must fetch all or parts of the data.
     *
     * @param {object} options - All the data already fetched by the connector in a previous execution.
     *                                   Useful to optimize connector execution by not fetching data we already have.
     * @returns {Promise<object>} - Promise that resolves to an object with the following properties:
     * @property {boolean} shouldFullSync - Indicates if a full synchronization is needed.
     * @property {number|NaN} distanceInDays - The number of days since the last sync, or NaN if not applicable.
     */
  }, {
    key: "shouldFullSync",
    value: (function () {
      var _shouldFullSync = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee40(options) {
        var _trigger$current_stat, _trigger$current_stat2, _trigger$current_stat3, _trigger$current_stat4, _trigger$current_stat5;
        var trigger, flags, forceFullSync, flagFullSync, isFirstJob, isLastJobError, hasLastExecution, distanceInDays, _trigger$current_stat6;
        return _regenerator.default.wrap(function _callee40$(_context40) {
          while (1) switch (_context40.prev = _context40.next) {
            case 0:
              this.onlyIn(PILOT_TYPE, 'shouldFullSync');
              trigger = options.trigger, flags = options.flags;
              forceFullSync = false;
              flagFullSync = false;
              if (flags['clisk.force-full-sync'] === true) {
                this.log('info', 'User forces full sync');
                flagFullSync = true;
              }
              isFirstJob = !((_trigger$current_stat = trigger.current_state) !== null && _trigger$current_stat !== void 0 && _trigger$current_stat.last_failure) && !((_trigger$current_stat2 = trigger.current_state) !== null && _trigger$current_stat2 !== void 0 && _trigger$current_stat2.last_success);
              isLastJobError = !isFirstJob && ((_trigger$current_stat3 = trigger.current_state) === null || _trigger$current_stat3 === void 0 ? void 0 : _trigger$current_stat3.last_failure) > ((_trigger$current_stat4 = trigger.current_state) === null || _trigger$current_stat4 === void 0 ? void 0 : _trigger$current_stat4.last_success);
              hasLastExecution = Boolean((_trigger$current_stat5 = trigger.current_state) === null || _trigger$current_stat5 === void 0 ? void 0 : _trigger$current_stat5.last_execution);
              distanceInDays = 0;
              if (hasLastExecution) {
                distanceInDays = getDateDistanceInDays((_trigger$current_stat6 = trigger.current_state) === null || _trigger$current_stat6 === void 0 ? void 0 : _trigger$current_stat6.last_execution);
              }
              this.log('debug', "distanceInDays: ".concat(distanceInDays));
              if (flagFullSync || !hasLastExecution || isLastJobError || distanceInDays >= 30) {
                this.log('info', '🐢️ Long execution');
                this.log('debug', "isLastJobError: ".concat(isLastJobError, " | hasLastExecution: ").concat(hasLastExecution));
                forceFullSync = true;
              } else {
                this.log('info', '🐇️ Quick execution');
              }
              return _context40.abrupt("return", {
                forceFullSync: forceFullSync,
                distanceInDays: distanceInDays
              });
            case 13:
            case "end":
              return _context40.stop();
          }
        }, _callee40, this);
      }));
      function shouldFullSync(_x32) {
        return _shouldFullSync.apply(this, arguments);
      }
      return shouldFullSync;
    }()
    /**
     * Main function, fetches all connector data and save it to the cozy
     *
     * @param {object} options : options object
     * @param {object} options.context : all the data already fetched by the connector in a previous execution. Will be usefull to optimize
     * connector execution by not fetching data we already have.
     * @returns {Promise.<object>} : Connector execution result. TBD
     */
    // eslint-disable-next-line no-unused-vars
    )
  }, {
    key: "fetch",
    value: (function () {
      var _fetch = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee41(options) {
        return _regenerator.default.wrap(function _callee41$(_context41) {
          while (1) switch (_context41.prev = _context41.next) {
            case 0:
            case "end":
              return _context41.stop();
          }
        }, _callee41);
      }));
      function fetch(_x33) {
        return _fetch.apply(this, arguments);
      }
      return fetch;
    }()
    /**
     * Returns the current clisk version number in package.json file
     */
    )
  }, {
    key: "getCliskVersion",
    value: (function () {
      var _getCliskVersion = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee42() {
        return _regenerator.default.wrap(function _callee42$(_context42) {
          while (1) switch (_context42.prev = _context42.next) {
            case 0:
              return _context42.abrupt("return", _package.default.version);
            case 1:
            case "end":
              return _context42.stop();
          }
        }, _callee42);
      }));
      function getCliskVersion() {
        return _getCliskVersion.apply(this, arguments);
      }
      return getCliskVersion;
    }())
  }]);
  return ContentScript;
}();
function sendPageMessage(message) {
  var _window$ReactNativeWe;
  // @ts-ignore La propriété 'ReactNativeWebView' n'existe pas sur le type 'Window & typeof globalThis'.
  if ((_window$ReactNativeWe = window.ReactNativeWebView) !== null && _window$ReactNativeWe !== void 0 && _window$ReactNativeWe.postMessage) {
    var _window$ReactNativeWe2;
    // @ts-ignore La propriété 'ReactNativeWebView' n'existe pas sur le type 'Window & typeof globalThis'.
    (_window$ReactNativeWe2 = window.ReactNativeWebView) === null || _window$ReactNativeWe2 === void 0 || _window$ReactNativeWe2.postMessage(JSON.stringify({
      message: message
    }));
  } else {
    _log.error('No window.ReactNativeWebView.postMessage available');
  }
}
function getDateDistanceInDays(dateString) {
  var distanceMs = Date.now() - new Date(dateString).getTime();
  var days = 1000 * 60 * 60 * 24;
  return Math.floor(distanceMs / days);
}

/***/ }),
/* 4 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(5);


/***/ }),
/* 5 */
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}


/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayWithoutHoles = __webpack_require__(7);

var iterableToArray = __webpack_require__(9);

var unsupportedIterableToArray = __webpack_require__(10);

var nonIterableSpread = __webpack_require__(11);

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 7 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeToArray = __webpack_require__(8);

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
}

module.exports = _arrayWithoutHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 8 */
/***/ ((module) => {

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 9 */
/***/ ((module) => {

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

module.exports = _iterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 10 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeToArray = __webpack_require__(8);

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 11 */
/***/ ((module) => {

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableSpread, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 12 */
/***/ ((module) => {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 13 */
/***/ ((module) => {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 14 */
/***/ ((module) => {

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 15 */
/***/ ((module, exports, __webpack_require__) => {

var Minilog = __webpack_require__(16);

var oldEnable = Minilog.enable,
    oldDisable = Minilog.disable,
    isChrome = (typeof navigator != 'undefined' && /chrome/i.test(navigator.userAgent)),
    console = __webpack_require__(20);

// Use a more capable logging backend if on Chrome
Minilog.defaultBackend = (isChrome ? console.minilog : console);

// apply enable inputs from localStorage and from the URL
if(typeof window != 'undefined') {
  try {
    Minilog.enable(JSON.parse(window.localStorage['minilogSettings']));
  } catch(e) {}
  if(window.location && window.location.search) {
    var match = RegExp('[?&]minilog=([^&]*)').exec(window.location.search);
    match && Minilog.enable(decodeURIComponent(match[1]));
  }
}

// Make enable also add to localStorage
Minilog.enable = function() {
  oldEnable.call(Minilog, true);
  try { window.localStorage['minilogSettings'] = JSON.stringify(true); } catch(e) {}
  return this;
};

Minilog.disable = function() {
  oldDisable.call(Minilog);
  try { delete window.localStorage.minilogSettings; } catch(e) {}
  return this;
};

exports = module.exports = Minilog;

exports.backends = {
  array: __webpack_require__(24),
  browser: Minilog.defaultBackend,
  localStorage: __webpack_require__(25),
  jQuery: __webpack_require__(26)
};


/***/ }),
/* 16 */
/***/ ((module, exports, __webpack_require__) => {

var Transform = __webpack_require__(17),
    Filter = __webpack_require__(19);

var log = new Transform(),
    slice = Array.prototype.slice;

exports = module.exports = function create(name) {
  var o   = function() { log.write(name, undefined, slice.call(arguments)); return o; };
  o.debug = function() { log.write(name, 'debug', slice.call(arguments)); return o; };
  o.info  = function() { log.write(name, 'info',  slice.call(arguments)); return o; };
  o.warn  = function() { log.write(name, 'warn',  slice.call(arguments)); return o; };
  o.error = function() { log.write(name, 'error', slice.call(arguments)); return o; };
  o.group = function() { log.write(name, 'group', slice.call(arguments)); return o; };
  o.groupEnd = function() { log.write(name, 'groupEnd', slice.call(arguments)); return o; };
  o.log   = o.debug; // for interface compliance with Node and browser consoles
  o.suggest = exports.suggest;
  o.format = log.format;
  return o;
};

// filled in separately
exports.defaultBackend = exports.defaultFormatter = null;

exports.pipe = function(dest) {
  return log.pipe(dest);
};

exports.end = exports.unpipe = exports.disable = function(from) {
  return log.unpipe(from);
};

exports.Transform = Transform;
exports.Filter = Filter;
// this is the default filter that's applied when .enable() is called normally
// you can bypass it completely and set up your own pipes
exports.suggest = new Filter();

exports.enable = function() {
  if(exports.defaultFormatter) {
    return log.pipe(exports.suggest) // filter
              .pipe(exports.defaultFormatter) // formatter
              .pipe(exports.defaultBackend); // backend
  }
  return log.pipe(exports.suggest) // filter
            .pipe(exports.defaultBackend); // formatter
};



/***/ }),
/* 17 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var microee = __webpack_require__(18);

// Implements a subset of Node's stream.Transform - in a cross-platform manner.
function Transform() {}

microee.mixin(Transform);

// The write() signature is different from Node's
// --> makes it much easier to work with objects in logs.
// One of the lessons from v1 was that it's better to target
// a good browser rather than the lowest common denominator
// internally.
// If you want to use external streams, pipe() to ./stringify.js first.
Transform.prototype.write = function(name, level, args) {
  this.emit('item', name, level, args);
};

Transform.prototype.end = function() {
  this.emit('end');
  this.removeAllListeners();
};

Transform.prototype.pipe = function(dest) {
  var s = this;
  // prevent double piping
  s.emit('unpipe', dest);
  // tell the dest that it's being piped to
  dest.emit('pipe', s);

  function onItem() {
    dest.write.apply(dest, Array.prototype.slice.call(arguments));
  }
  function onEnd() { !dest._isStdio && dest.end(); }

  s.on('item', onItem);
  s.on('end', onEnd);

  s.when('unpipe', function(from) {
    var match = (from === dest) || typeof from == 'undefined';
    if(match) {
      s.removeListener('item', onItem);
      s.removeListener('end', onEnd);
      dest.emit('unpipe');
    }
    return match;
  });

  return dest;
};

Transform.prototype.unpipe = function(from) {
  this.emit('unpipe', from);
  return this;
};

Transform.prototype.format = function(dest) {
  throw new Error([
    'Warning: .format() is deprecated in Minilog v2! Use .pipe() instead. For example:',
    'var Minilog = require(\'minilog\');',
    'Minilog',
    '  .pipe(Minilog.backends.console.formatClean)',
    '  .pipe(Minilog.backends.console);'].join('\n'));
};

Transform.mixin = function(dest) {
  var o = Transform.prototype, k;
  for (k in o) {
    o.hasOwnProperty(k) && (dest.prototype[k] = o[k]);
  }
};

module.exports = Transform;


/***/ }),
/* 18 */
/***/ ((module) => {

function M() { this._events = {}; }
M.prototype = {
  on: function(ev, cb) {
    this._events || (this._events = {});
    var e = this._events;
    (e[ev] || (e[ev] = [])).push(cb);
    return this;
  },
  removeListener: function(ev, cb) {
    var e = this._events[ev] || [], i;
    for(i = e.length-1; i >= 0 && e[i]; i--){
      if(e[i] === cb || e[i].cb === cb) { e.splice(i, 1); }
    }
  },
  removeAllListeners: function(ev) {
    if(!ev) { this._events = {}; }
    else { this._events[ev] && (this._events[ev] = []); }
  },
  listeners: function(ev) {
    return (this._events ? this._events[ev] || [] : []);
  },
  emit: function(ev) {
    this._events || (this._events = {});
    var args = Array.prototype.slice.call(arguments, 1), i, e = this._events[ev] || [];
    for(i = e.length-1; i >= 0 && e[i]; i--){
      e[i].apply(this, args);
    }
    return this;
  },
  when: function(ev, cb) {
    return this.once(ev, cb, true);
  },
  once: function(ev, cb, when) {
    if(!cb) return this;
    function c() {
      if(!when) this.removeListener(ev, c);
      if(cb.apply(this, arguments) && when) this.removeListener(ev, c);
    }
    c.cb = cb;
    this.on(ev, c);
    return this;
  }
};
M.mixin = function(dest) {
  var o = M.prototype, k;
  for (k in o) {
    o.hasOwnProperty(k) && (dest.prototype[k] = o[k]);
  }
};
module.exports = M;


/***/ }),
/* 19 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// default filter
var Transform = __webpack_require__(17);

var levelMap = { debug: 1, info: 2, warn: 3, error: 4 };

function Filter() {
  this.enabled = true;
  this.defaultResult = true;
  this.clear();
}

Transform.mixin(Filter);

// allow all matching, with level >= given level
Filter.prototype.allow = function(name, level) {
  this._white.push({ n: name, l: levelMap[level] });
  return this;
};

// deny all matching, with level <= given level
Filter.prototype.deny = function(name, level) {
  this._black.push({ n: name, l: levelMap[level] });
  return this;
};

Filter.prototype.clear = function() {
  this._white = [];
  this._black = [];
  return this;
};

function test(rule, name) {
  // use .test for RegExps
  return (rule.n.test ? rule.n.test(name) : rule.n == name);
};

Filter.prototype.test = function(name, level) {
  var i, len = Math.max(this._white.length, this._black.length);
  for(i = 0; i < len; i++) {
    if(this._white[i] && test(this._white[i], name) && levelMap[level] >= this._white[i].l) {
      return true;
    }
    if(this._black[i] && test(this._black[i], name) && levelMap[level] <= this._black[i].l) {
      return false;
    }
  }
  return this.defaultResult;
};

Filter.prototype.write = function(name, level, args) {
  if(!this.enabled || this.test(name, level)) {
    return this.emit('item', name, level, args);
  }
};

module.exports = Filter;


/***/ }),
/* 20 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Transform = __webpack_require__(17);

var newlines = /\n+$/,
    logger = new Transform();

logger.write = function(name, level, args) {
  var i = args.length-1;
  if (typeof console === 'undefined' || !console.log) {
    return;
  }
  if(console.log.apply) {
    return console.log.apply(console, [name, level].concat(args));
  } else if(JSON && JSON.stringify) {
    // console.log.apply is undefined in IE8 and IE9
    // for IE8/9: make console.log at least a bit less awful
    if(args[i] && typeof args[i] == 'string') {
      args[i] = args[i].replace(newlines, '');
    }
    try {
      for(i = 0; i < args.length; i++) {
        args[i] = JSON.stringify(args[i]);
      }
    } catch(e) {}
    console.log(args.join(' '));
  }
};

logger.formatters = ['color', 'minilog'];
logger.color = __webpack_require__(21);
logger.minilog = __webpack_require__(23);

module.exports = logger;


/***/ }),
/* 21 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Transform = __webpack_require__(17),
    color = __webpack_require__(22);

var colors = { debug: ['cyan'], info: ['purple' ], warn: [ 'yellow', true ], error: [ 'red', true ] },
    logger = new Transform();

logger.write = function(name, level, args) {
  var fn = console.log;
  if(console[level] && console[level].apply) {
    fn = console[level];
    fn.apply(console, [ '%c'+name+' %c'+level, color('gray'), color.apply(color, colors[level])].concat(args));
  }
};

// NOP, because piping the formatted logs can only cause trouble.
logger.pipe = function() { };

module.exports = logger;


/***/ }),
/* 22 */
/***/ ((module) => {

var hex = {
  black: '#000',
  red: '#c23621',
  green: '#25bc26',
  yellow: '#bbbb00',
  blue:  '#492ee1',
  magenta: '#d338d3',
  cyan: '#33bbc8',
  gray: '#808080',
  purple: '#708'
};
function color(fg, isInverse) {
  if(isInverse) {
    return 'color: #fff; background: '+hex[fg]+';';
  } else {
    return 'color: '+hex[fg]+';';
  }
}

module.exports = color;


/***/ }),
/* 23 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Transform = __webpack_require__(17),
    color = __webpack_require__(22),
    colors = { debug: ['gray'], info: ['purple' ], warn: [ 'yellow', true ], error: [ 'red', true ] },
    logger = new Transform();

logger.write = function(name, level, args) {
  var fn = console.log;
  if(level != 'debug' && console[level]) {
    fn = console[level];
  }

  var subset = [], i = 0;
  if(level != 'info') {
    for(; i < args.length; i++) {
      if(typeof args[i] != 'string') break;
    }
    fn.apply(console, [ '%c'+name +' '+ args.slice(0, i).join(' '), color.apply(color, colors[level]) ].concat(args.slice(i)));
  } else {
    fn.apply(console, [ '%c'+name, color.apply(color, colors[level]) ].concat(args));
  }
};

// NOP, because piping the formatted logs can only cause trouble.
logger.pipe = function() { };

module.exports = logger;


/***/ }),
/* 24 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Transform = __webpack_require__(17),
    cache = [ ];

var logger = new Transform();

logger.write = function(name, level, args) {
  cache.push([ name, level, args ]);
};

// utility functions
logger.get = function() { return cache; };
logger.empty = function() { cache = []; };

module.exports = logger;


/***/ }),
/* 25 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Transform = __webpack_require__(17),
    cache = false;

var logger = new Transform();

logger.write = function(name, level, args) {
  if(typeof window == 'undefined' || typeof JSON == 'undefined' || !JSON.stringify || !JSON.parse) return;
  try {
    if(!cache) { cache = (window.localStorage.minilog ? JSON.parse(window.localStorage.minilog) : []); }
    cache.push([ new Date().toString(), name, level, args ]);
    window.localStorage.minilog = JSON.stringify(cache);
  } catch(e) {}
};

module.exports = logger;

/***/ }),
/* 26 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Transform = __webpack_require__(17);

var cid = new Date().valueOf().toString(36);

function AjaxLogger(options) {
  this.url = options.url || '';
  this.cache = [];
  this.timer = null;
  this.interval = options.interval || 30*1000;
  this.enabled = true;
  this.jQuery = window.jQuery;
  this.extras = {};
}

Transform.mixin(AjaxLogger);

AjaxLogger.prototype.write = function(name, level, args) {
  if(!this.timer) { this.init(); }
  this.cache.push([name, level].concat(args));
};

AjaxLogger.prototype.init = function() {
  if(!this.enabled || !this.jQuery) return;
  var self = this;
  this.timer = setTimeout(function() {
    var i, logs = [], ajaxData, url = self.url;
    if(self.cache.length == 0) return self.init();
    // Test each log line and only log the ones that are valid (e.g. don't have circular references).
    // Slight performance hit but benefit is we log all valid lines.
    for(i = 0; i < self.cache.length; i++) {
      try {
        JSON.stringify(self.cache[i]);
        logs.push(self.cache[i]);
      } catch(e) { }
    }
    if(self.jQuery.isEmptyObject(self.extras)) {
        ajaxData = JSON.stringify({ logs: logs });
        url = self.url + '?client_id=' + cid;
    } else {
        ajaxData = JSON.stringify(self.jQuery.extend({logs: logs}, self.extras));
    }

    self.jQuery.ajax(url, {
      type: 'POST',
      cache: false,
      processData: false,
      data: ajaxData,
      contentType: 'application/json',
      timeout: 10000
    }).success(function(data, status, jqxhr) {
      if(data.interval) {
        self.interval = Math.max(1000, data.interval);
      }
    }).error(function() {
      self.interval = 30000;
    }).always(function() {
      self.init();
    });
    self.cache = [];
  }, this.interval);
};

AjaxLogger.prototype.end = function() {};

// wait until jQuery is defined. Useful if you don't control the load order.
AjaxLogger.jQueryWait = function(onDone) {
  if(typeof window !== 'undefined' && (window.jQuery || window.$)) {
    return onDone(window.jQuery || window.$);
  } else if (typeof window !== 'undefined') {
    setTimeout(function() { AjaxLogger.jQueryWait(onDone); }, 200);
  }
};

module.exports = AjaxLogger;


/***/ }),
/* 27 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

(function (global, factory) {
	 true ? module.exports = factory() :
	0;
}(this, (function () { 'use strict';

	/*! MIT License © Sindre Sorhus */

	const globals = {};

	const getGlobal = property => {
		/* istanbul ignore next */
		if (typeof self !== 'undefined' && self && property in self) {
			return self;
		}

		/* istanbul ignore next */
		if (typeof window !== 'undefined' && window && property in window) {
			return window;
		}

		if (typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g && property in __webpack_require__.g) {
			return __webpack_require__.g;
		}

		/* istanbul ignore next */
		if (typeof globalThis !== 'undefined' && globalThis) {
			return globalThis;
		}
	};

	const globalProperties = [
		'Headers',
		'Request',
		'Response',
		'ReadableStream',
		'fetch',
		'AbortController',
		'FormData'
	];

	for (const property of globalProperties) {
		Object.defineProperty(globals, property, {
			get() {
				const globalObject = getGlobal(property);
				const value = globalObject && globalObject[property];
				return typeof value === 'function' ? value.bind(globalObject) : value;
			}
		});
	}

	const isObject = value => value !== null && typeof value === 'object';
	const supportsAbortController = typeof globals.AbortController === 'function';
	const supportsStreams = typeof globals.ReadableStream === 'function';
	const supportsFormData = typeof globals.FormData === 'function';

	const mergeHeaders = (source1, source2) => {
		const result = new globals.Headers(source1 || {});
		const isHeadersInstance = source2 instanceof globals.Headers;
		const source = new globals.Headers(source2 || {});

		for (const [key, value] of source) {
			if ((isHeadersInstance && value === 'undefined') || value === undefined) {
				result.delete(key);
			} else {
				result.set(key, value);
			}
		}

		return result;
	};

	const deepMerge = (...sources) => {
		let returnValue = {};
		let headers = {};

		for (const source of sources) {
			if (Array.isArray(source)) {
				if (!(Array.isArray(returnValue))) {
					returnValue = [];
				}

				returnValue = [...returnValue, ...source];
			} else if (isObject(source)) {
				for (let [key, value] of Object.entries(source)) {
					if (isObject(value) && (key in returnValue)) {
						value = deepMerge(returnValue[key], value);
					}

					returnValue = {...returnValue, [key]: value};
				}

				if (isObject(source.headers)) {
					headers = mergeHeaders(headers, source.headers);
				}
			}

			returnValue.headers = headers;
		}

		return returnValue;
	};

	const requestMethods = [
		'get',
		'post',
		'put',
		'patch',
		'head',
		'delete'
	];

	const responseTypes = {
		json: 'application/json',
		text: 'text/*',
		formData: 'multipart/form-data',
		arrayBuffer: '*/*',
		blob: '*/*'
	};

	const retryMethods = [
		'get',
		'put',
		'head',
		'delete',
		'options',
		'trace'
	];

	const retryStatusCodes = [
		408,
		413,
		429,
		500,
		502,
		503,
		504
	];

	const retryAfterStatusCodes = [
		413,
		429,
		503
	];

	const stop = Symbol('stop');

	class HTTPError extends Error {
		constructor(response) {
			// Set the message to the status text, such as Unauthorized,
			// with some fallbacks. This message should never be undefined.
			super(
				response.statusText ||
				String(
					(response.status === 0 || response.status) ?
						response.status : 'Unknown response error'
				)
			);
			this.name = 'HTTPError';
			this.response = response;
		}
	}

	class TimeoutError extends Error {
		constructor(request) {
			super('Request timed out');
			this.name = 'TimeoutError';
			this.request = request;
		}
	}

	const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

	// `Promise.race()` workaround (#91)
	const timeout = (request, abortController, options) =>
		new Promise((resolve, reject) => {
			const timeoutID = setTimeout(() => {
				if (abortController) {
					abortController.abort();
				}

				reject(new TimeoutError(request));
			}, options.timeout);

			/* eslint-disable promise/prefer-await-to-then */
			options.fetch(request)
				.then(resolve)
				.catch(reject)
				.then(() => {
					clearTimeout(timeoutID);
				});
			/* eslint-enable promise/prefer-await-to-then */
		});

	const normalizeRequestMethod = input => requestMethods.includes(input) ? input.toUpperCase() : input;

	const defaultRetryOptions = {
		limit: 2,
		methods: retryMethods,
		statusCodes: retryStatusCodes,
		afterStatusCodes: retryAfterStatusCodes
	};

	const normalizeRetryOptions = (retry = {}) => {
		if (typeof retry === 'number') {
			return {
				...defaultRetryOptions,
				limit: retry
			};
		}

		if (retry.methods && !Array.isArray(retry.methods)) {
			throw new Error('retry.methods must be an array');
		}

		if (retry.statusCodes && !Array.isArray(retry.statusCodes)) {
			throw new Error('retry.statusCodes must be an array');
		}

		return {
			...defaultRetryOptions,
			...retry,
			afterStatusCodes: retryAfterStatusCodes
		};
	};

	// The maximum value of a 32bit int (see issue #117)
	const maxSafeTimeout = 2147483647;

	class Ky {
		constructor(input, options = {}) {
			this._retryCount = 0;
			this._input = input;
			this._options = {
				// TODO: credentials can be removed when the spec change is implemented in all browsers. Context: https://www.chromestatus.com/feature/4539473312350208
				credentials: this._input.credentials || 'same-origin',
				...options,
				headers: mergeHeaders(this._input.headers, options.headers),
				hooks: deepMerge({
					beforeRequest: [],
					beforeRetry: [],
					afterResponse: []
				}, options.hooks),
				method: normalizeRequestMethod(options.method || this._input.method),
				prefixUrl: String(options.prefixUrl || ''),
				retry: normalizeRetryOptions(options.retry),
				throwHttpErrors: options.throwHttpErrors !== false,
				timeout: typeof options.timeout === 'undefined' ? 10000 : options.timeout,
				fetch: options.fetch || globals.fetch
			};

			if (typeof this._input !== 'string' && !(this._input instanceof URL || this._input instanceof globals.Request)) {
				throw new TypeError('`input` must be a string, URL, or Request');
			}

			if (this._options.prefixUrl && typeof this._input === 'string') {
				if (this._input.startsWith('/')) {
					throw new Error('`input` must not begin with a slash when using `prefixUrl`');
				}

				if (!this._options.prefixUrl.endsWith('/')) {
					this._options.prefixUrl += '/';
				}

				this._input = this._options.prefixUrl + this._input;
			}

			if (supportsAbortController) {
				this.abortController = new globals.AbortController();
				if (this._options.signal) {
					this._options.signal.addEventListener('abort', () => {
						this.abortController.abort();
					});
				}

				this._options.signal = this.abortController.signal;
			}

			this.request = new globals.Request(this._input, this._options);

			if (this._options.searchParams) {
				const searchParams = '?' + new URLSearchParams(this._options.searchParams).toString();
				const url = this.request.url.replace(/(?:\?.*?)?(?=#|$)/, searchParams);

				// To provide correct form boundary, Content-Type header should be deleted each time when new Request instantiated from another one
				if (((supportsFormData && this._options.body instanceof globals.FormData) || this._options.body instanceof URLSearchParams) && !(this._options.headers && this._options.headers['content-type'])) {
					this.request.headers.delete('content-type');
				}

				this.request = new globals.Request(new globals.Request(url, this.request), this._options);
			}

			if (this._options.json !== undefined) {
				this._options.body = JSON.stringify(this._options.json);
				this.request.headers.set('content-type', 'application/json');
				this.request = new globals.Request(this.request, {body: this._options.body});
			}

			const fn = async () => {
				if (this._options.timeout > maxSafeTimeout) {
					throw new RangeError(`The \`timeout\` option cannot be greater than ${maxSafeTimeout}`);
				}

				await delay(1);
				let response = await this._fetch();

				for (const hook of this._options.hooks.afterResponse) {
					// eslint-disable-next-line no-await-in-loop
					const modifiedResponse = await hook(
						this.request,
						this._options,
						this._decorateResponse(response.clone())
					);

					if (modifiedResponse instanceof globals.Response) {
						response = modifiedResponse;
					}
				}

				this._decorateResponse(response);

				if (!response.ok && this._options.throwHttpErrors) {
					throw new HTTPError(response);
				}

				// If `onDownloadProgress` is passed, it uses the stream API internally
				/* istanbul ignore next */
				if (this._options.onDownloadProgress) {
					if (typeof this._options.onDownloadProgress !== 'function') {
						throw new TypeError('The `onDownloadProgress` option must be a function');
					}

					if (!supportsStreams) {
						throw new Error('Streams are not supported in your environment. `ReadableStream` is missing.');
					}

					return this._stream(response.clone(), this._options.onDownloadProgress);
				}

				return response;
			};

			const isRetriableMethod = this._options.retry.methods.includes(this.request.method.toLowerCase());
			const result = isRetriableMethod ? this._retry(fn) : fn();

			for (const [type, mimeType] of Object.entries(responseTypes)) {
				result[type] = async () => {
					this.request.headers.set('accept', this.request.headers.get('accept') || mimeType);

					const response = (await result).clone();

					if (type === 'json') {
						if (response.status === 204) {
							return '';
						}

						if (options.parseJson) {
							return options.parseJson(await response.text());
						}
					}

					return response[type]();
				};
			}

			return result;
		}

		_calculateRetryDelay(error) {
			this._retryCount++;

			if (this._retryCount < this._options.retry.limit && !(error instanceof TimeoutError)) {
				if (error instanceof HTTPError) {
					if (!this._options.retry.statusCodes.includes(error.response.status)) {
						return 0;
					}

					const retryAfter = error.response.headers.get('Retry-After');
					if (retryAfter && this._options.retry.afterStatusCodes.includes(error.response.status)) {
						let after = Number(retryAfter);
						if (Number.isNaN(after)) {
							after = Date.parse(retryAfter) - Date.now();
						} else {
							after *= 1000;
						}

						if (typeof this._options.retry.maxRetryAfter !== 'undefined' && after > this._options.retry.maxRetryAfter) {
							return 0;
						}

						return after;
					}

					if (error.response.status === 413) {
						return 0;
					}
				}

				const BACKOFF_FACTOR = 0.3;
				return BACKOFF_FACTOR * (2 ** (this._retryCount - 1)) * 1000;
			}

			return 0;
		}

		_decorateResponse(response) {
			if (this._options.parseJson) {
				response.json = async () => {
					return this._options.parseJson(await response.text());
				};
			}

			return response;
		}

		async _retry(fn) {
			try {
				return await fn();
			} catch (error) {
				const ms = Math.min(this._calculateRetryDelay(error), maxSafeTimeout);
				if (ms !== 0 && this._retryCount > 0) {
					await delay(ms);

					for (const hook of this._options.hooks.beforeRetry) {
						// eslint-disable-next-line no-await-in-loop
						const hookResult = await hook({
							request: this.request,
							options: this._options,
							error,
							retryCount: this._retryCount
						});

						// If `stop` is returned from the hook, the retry process is stopped
						if (hookResult === stop) {
							return;
						}
					}

					return this._retry(fn);
				}

				if (this._options.throwHttpErrors) {
					throw error;
				}
			}
		}

		async _fetch() {
			for (const hook of this._options.hooks.beforeRequest) {
				// eslint-disable-next-line no-await-in-loop
				const result = await hook(this.request, this._options);

				if (result instanceof Request) {
					this.request = result;
					break;
				}

				if (result instanceof Response) {
					return result;
				}
			}

			if (this._options.timeout === false) {
				return this._options.fetch(this.request.clone());
			}

			return timeout(this.request.clone(), this.abortController, this._options);
		}

		/* istanbul ignore next */
		_stream(response, onDownloadProgress) {
			const totalBytes = Number(response.headers.get('content-length')) || 0;
			let transferredBytes = 0;

			return new globals.Response(
				new globals.ReadableStream({
					start(controller) {
						const reader = response.body.getReader();

						if (onDownloadProgress) {
							onDownloadProgress({percent: 0, transferredBytes: 0, totalBytes}, new Uint8Array());
						}

						async function read() {
							const {done, value} = await reader.read();
							if (done) {
								controller.close();
								return;
							}

							if (onDownloadProgress) {
								transferredBytes += value.byteLength;
								const percent = totalBytes === 0 ? 0 : transferredBytes / totalBytes;
								onDownloadProgress({percent, transferredBytes, totalBytes}, value);
							}

							controller.enqueue(value);
							read();
						}

						read();
					}
				})
			);
		}
	}

	const validateAndMerge = (...sources) => {
		for (const source of sources) {
			if ((!isObject(source) || Array.isArray(source)) && typeof source !== 'undefined') {
				throw new TypeError('The `options` argument must be an object');
			}
		}

		return deepMerge({}, ...sources);
	};

	const createInstance = defaults => {
		const ky = (input, options) => new Ky(input, validateAndMerge(defaults, options));

		for (const method of requestMethods) {
			ky[method] = (input, options) => new Ky(input, validateAndMerge(defaults, options, {method}));
		}

		ky.HTTPError = HTTPError;
		ky.TimeoutError = TimeoutError;
		ky.create = newDefaults => createInstance(validateAndMerge(newDefaults));
		ky.extend = newDefaults => createInstance(validateAndMerge(defaults, newDefaults));
		ky.stop = stop;

		return ky;
	};

	var index = createInstance();

	return index;

})));


/***/ }),
/* 28 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbortError": () => (/* binding */ AbortError),
/* harmony export */   "TimeoutError": () => (/* binding */ TimeoutError),
/* harmony export */   "default": () => (/* binding */ pTimeout)
/* harmony export */ });
class TimeoutError extends Error {
	constructor(message) {
		super(message);
		this.name = 'TimeoutError';
	}
}

/**
An error to be thrown when the request is aborted by AbortController.
DOMException is thrown instead of this Error when DOMException is available.
*/
class AbortError extends Error {
	constructor(message) {
		super();
		this.name = 'AbortError';
		this.message = message;
	}
}

/**
TODO: Remove AbortError and just throw DOMException when targeting Node 18.
*/
const getDOMException = errorMessage => globalThis.DOMException === undefined
	? new AbortError(errorMessage)
	: new DOMException(errorMessage);

/**
TODO: Remove below function and just 'reject(signal.reason)' when targeting Node 18.
*/
const getAbortedReason = signal => {
	const reason = signal.reason === undefined
		? getDOMException('This operation was aborted.')
		: signal.reason;

	return reason instanceof Error ? reason : getDOMException(reason);
};

function pTimeout(promise, options) {
	const {
		milliseconds,
		fallback,
		message,
		customTimers = {setTimeout, clearTimeout},
	} = options;

	let timer;

	const wrappedPromise = new Promise((resolve, reject) => {
		if (typeof milliseconds !== 'number' || Math.sign(milliseconds) !== 1) {
			throw new TypeError(`Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``);
		}

		if (options.signal) {
			const {signal} = options;
			if (signal.aborted) {
				reject(getAbortedReason(signal));
			}

			signal.addEventListener('abort', () => {
				reject(getAbortedReason(signal));
			});
		}

		if (milliseconds === Number.POSITIVE_INFINITY) {
			promise.then(resolve, reject);
			return;
		}

		// We create the error outside of `setTimeout` to preserve the stack trace.
		const timeoutError = new TimeoutError();

		timer = customTimers.setTimeout.call(undefined, () => {
			if (fallback) {
				try {
					resolve(fallback());
				} catch (error) {
					reject(error);
				}

				return;
			}

			if (typeof promise.cancel === 'function') {
				promise.cancel();
			}

			if (message === false) {
				resolve();
			} else if (message instanceof Error) {
				reject(message);
			} else {
				timeoutError.message = message ?? `Promise timed out after ${milliseconds} milliseconds`;
				reject(timeoutError);
			}
		}, milliseconds);

		(async () => {
			try {
				resolve(await promise);
			} catch (error) {
				reject(error);
			}
		})();
	});

	const cancelablePromise = wrappedPromise.finally(() => {
		cancelablePromise.clear();
	});

	cancelablePromise.clear = () => {
		customTimers.clearTimeout.call(undefined, timer);
		timer = undefined;
	};

	return cancelablePromise;
}


/***/ }),
/* 29 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TimeoutError": () => (/* reexport safe */ p_timeout__WEBPACK_IMPORTED_MODULE_0__.TimeoutError),
/* harmony export */   "default": () => (/* binding */ pWaitFor)
/* harmony export */ });
/* harmony import */ var p_timeout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(28);


const resolveValue = Symbol('resolveValue');

async function pWaitFor(condition, options = {}) {
	const {
		interval = 20,
		timeout = Number.POSITIVE_INFINITY,
		before = true,
	} = options;

	let retryTimeout;
	let abort = false;

	const promise = new Promise((resolve, reject) => {
		const check = async () => {
			try {
				const value = await condition();

				if (typeof value === 'object' && value[resolveValue]) {
					resolve(value[resolveValue]);
				} else if (typeof value !== 'boolean') {
					throw new TypeError('Expected condition to return a boolean');
				} else if (value === true) {
					resolve();
				} else if (!abort) {
					retryTimeout = setTimeout(check, interval);
				}
			} catch (error) {
				reject(error);
			}
		};

		if (before) {
			check();
		} else {
			retryTimeout = setTimeout(check, interval);
		}
	});

	if (timeout === Number.POSITIVE_INFINITY) {
		return promise;
	}

	try {
		return await (0,p_timeout__WEBPACK_IMPORTED_MODULE_0__["default"])(promise, typeof timeout === 'number' ? {milliseconds: timeout} : timeout);
	} finally {
		abort = true;
		clearTimeout(retryTimeout);
	}
}

pWaitFor.resolveWith = value => ({[resolveValue]: value});




/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(2);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.blobToBase64 = blobToBase64;
exports.callStringFunction = callStringFunction;
exports.deserializeStringFunction = deserializeStringFunction;
var _regenerator = _interopRequireDefault(__webpack_require__(4));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(12));
/**
 * Convert a blob object to a base64 uri
 *
 * @param {Blob} blob : blob object
 * @returns {Promise.<string>} : base64 form of the blob
 */
function blobToBase64(_x) {
  return _blobToBase.apply(this, arguments);
}
/**
 * Convert a string function to the corresponding function.
 *
 * @param {string} fnString - function string to convert
 * @returns {Function} - the resulting function
 */
function _blobToBase() {
  _blobToBase = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(blob) {
    var reader;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          reader = new window.FileReader();
          _context.next = 3;
          return new Promise(function (resolve, reject) {
            reader.onload = resolve;
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        case 3:
          return _context.abrupt("return", reader.result);
        case 4:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _blobToBase.apply(this, arguments);
}
function deserializeStringFunction(fnString) {
  return eval('(' + fnString.trim() + ')');
}

/**
 * Calls and awaits the given string function with given arguments
 *
 * @param {string} fnString - function string to convert
 * @returns {Promise<any>} - the result of the execution of the string function
 */
function callStringFunction(_x2) {
  return _callStringFunction.apply(this, arguments);
}
function _callStringFunction() {
  _callStringFunction = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(fnString) {
    var fn,
      _len,
      args,
      _key,
      _args2 = arguments;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          fn = deserializeStringFunction(fnString);
          for (_len = _args2.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = _args2[_key];
          }
          _context2.next = 4;
          return fn.apply(void 0, args);
        case 4:
          return _context2.abrupt("return", _context2.sent);
        case 5:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _callStringFunction.apply(this, arguments);
}

/***/ }),
/* 31 */
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"cozy-clisk","version":"0.38.1","description":"All the libs needed to run a cozy client connector","repository":{"type":"git","url":"git+https://github.com/konnectors/libs.git"},"files":["dist"],"keywords":["konnector"],"main":"dist/index.js","author":"doubleface <christophe@cozycloud.cc>","license":"MIT","bugs":{"url":"https://github.com/konnectors/libs/issues"},"homepage":"https://github.com/konnectors/libs#readme","scripts":{"lint":"eslint \'src/**/*.js\'","prepublishOnly":"yarn run build","build":"babel --root-mode upward src/ -d dist/ --copy-files --verbose --ignore \'**/*.spec.js\',\'**/*.spec.jsx\'","test":"jest src"},"devDependencies":{"@babel/core":"7.24.0","babel-jest":"29.7.0","babel-preset-cozy-app":"2.1.0","eslint-plugin-import":"^2.29.1","eslint-plugin-jest":"^27.9.0","eslint-plugin-prettier":"^5.1.3","jest":"29.7.0","jest-environment-jsdom":"29.7.0","prettier":"^3.2.5","typescript":"4.9.5"},"dependencies":{"@cozy/minilog":"^1.0.0","bluebird-retry":"^0.11.0","ky":"^0.25.1","lodash":"^4.17.21","microee":"^0.0.6","p-timeout":"^6.0.0","p-wait-for":"^5.0.2","post-me":"^0.4.5"},"peerDependencies":{"cozy-client":">=41.2.0"},"gitHead":"894b685103900216a2023135a3efcc89f89cff78"}');

/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(2);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(4));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(12));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(13));
var _createClass2 = _interopRequireDefault(__webpack_require__(14));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(33));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(36));
var _inherits2 = _interopRequireDefault(__webpack_require__(37));
var _postMe = __webpack_require__(39);
var _ContentScriptMessenger = _interopRequireDefault(__webpack_require__(40));
var _bridgeInterfaces = __webpack_require__(41);
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
/**
 * Bridge to the Launcher object via post-me
 */
var LauncherBridge = exports["default"] = /*#__PURE__*/function (_Bridge) {
  (0, _inherits2.default)(LauncherBridge, _Bridge);
  /**
   * Init the window which will be used to communicate with the launcher
   *
   * @param {object} options             : option object
   * @param {object} options.localWindow : The window used to communicate with the launcher
   */
  function LauncherBridge(_ref) {
    var _this;
    var localWindow = _ref.localWindow;
    (0, _classCallCheck2.default)(this, LauncherBridge);
    _this = _callSuper(this, LauncherBridge);
    _this.localWindow = localWindow;
    return _this;
  }
  (0, _createClass2.default)(LauncherBridge, [{
    key: "init",
    value: function () {
      var _init = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var _ref2,
          _ref2$exposedMethods,
          exposedMethods,
          messenger,
          _args = arguments;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _ref2 = _args.length > 0 && _args[0] !== undefined ? _args[0] : {}, _ref2$exposedMethods = _ref2.exposedMethods, exposedMethods = _ref2$exposedMethods === void 0 ? {} : _ref2$exposedMethods;
              messenger = new _ContentScriptMessenger.default({
                localWindow: this.localWindow
              });
              _context.next = 4;
              return (0, _postMe.ChildHandshake)(messenger, exposedMethods);
            case 4:
              this.connection = _context.sent;
              this.localHandle = this.connection.localHandle();
              this.remoteHandle = this.connection.remoteHandle();
            case 7:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function init() {
        return _init.apply(this, arguments);
      }
      return init;
    }()
  }]);
  return LauncherBridge;
}(_bridgeInterfaces.Bridge);

/***/ }),
/* 33 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(34)["default"]);

var assertThisInitialized = __webpack_require__(35);

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 34 */
/***/ ((module) => {

function _typeof(obj) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(obj);
}

module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 35 */
/***/ ((module) => {

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 36 */
/***/ ((module) => {

function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 37 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var setPrototypeOf = __webpack_require__(38);

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 38 */
/***/ ((module) => {

function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 39 */
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var mod; }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.ChildHandshake = ChildHandshake;
  _exports.DebugMessenger = DebugMessenger;
  _exports.ParentHandshake = ParentHandshake;
  _exports.debug = debug;
  _exports.WorkerMessenger = _exports.WindowMessenger = _exports.PortMessenger = _exports.ConcreteEmitter = _exports.BareMessenger = void 0;

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var MARKER = '@post-me';

  function createUniqueIdFn() {
    var __id = 0;
    return function () {
      var id = __id;
      __id += 1;
      return id;
    };
  }
  /**
   * A concrete implementation of the {@link Emitter} interface
   *
   * @public
   */


  var ConcreteEmitter = /*#__PURE__*/function () {
    function ConcreteEmitter() {
      _classCallCheck(this, ConcreteEmitter);

      this._listeners = {};
    }
    /** {@inheritDoc Emitter.addEventListener} */


    _createClass(ConcreteEmitter, [{
      key: "addEventListener",
      value: function addEventListener(eventName, listener) {
        var listeners = this._listeners[eventName];

        if (!listeners) {
          listeners = new Set();
          this._listeners[eventName] = listeners;
        }

        listeners.add(listener);
      }
      /** {@inheritDoc Emitter.removeEventListener} */

    }, {
      key: "removeEventListener",
      value: function removeEventListener(eventName, listener) {
        var listeners = this._listeners[eventName];

        if (!listeners) {
          return;
        }

        listeners["delete"](listener);
      }
      /** {@inheritDoc Emitter.once} */

    }, {
      key: "once",
      value: function once(eventName) {
        var _this = this;

        return new Promise(function (resolve) {
          var listener = function listener(data) {
            _this.removeEventListener(eventName, listener);

            resolve(data);
          };

          _this.addEventListener(eventName, listener);
        });
      }
      /** @internal */

    }, {
      key: "emit",
      value: function emit(eventName, data) {
        var listeners = this._listeners[eventName];

        if (!listeners) {
          return;
        }

        listeners.forEach(function (listener) {
          listener(data);
        });
      }
      /** @internal */

    }, {
      key: "removeAllListeners",
      value: function removeAllListeners() {
        Object.values(this._listeners).forEach(function (listeners) {
          if (listeners) {
            listeners.clear();
          }
        });
      }
    }]);

    return ConcreteEmitter;
  }();

  _exports.ConcreteEmitter = ConcreteEmitter;
  var MessageType;

  (function (MessageType) {
    MessageType["HandshakeRequest"] = "handshake-request";
    MessageType["HandshakeResponse"] = "handshake-response";
    MessageType["Call"] = "call";
    MessageType["Response"] = "response";
    MessageType["Error"] = "error";
    MessageType["Event"] = "event";
    MessageType["Callback"] = "callback";
  })(MessageType || (MessageType = {})); // Message Creators


  function createHandshakeRequestMessage(sessionId) {
    return {
      type: MARKER,
      action: MessageType.HandshakeRequest,
      sessionId: sessionId
    };
  }

  function createHandshakeResponseMessage(sessionId) {
    return {
      type: MARKER,
      action: MessageType.HandshakeResponse,
      sessionId: sessionId
    };
  }

  function createCallMessage(sessionId, requestId, methodName, args) {
    return {
      type: MARKER,
      action: MessageType.Call,
      sessionId: sessionId,
      requestId: requestId,
      methodName: methodName,
      args: args
    };
  }

  function createResponsMessage(sessionId, requestId, result, error) {
    var message = {
      type: MARKER,
      action: MessageType.Response,
      sessionId: sessionId,
      requestId: requestId
    };

    if (result !== undefined) {
      message.result = result;
    }

    if (error !== undefined) {
      message.error = error;
    }

    return message;
  }

  function createCallbackMessage(sessionId, requestId, callbackId, args) {
    return {
      type: MARKER,
      action: MessageType.Callback,
      sessionId: sessionId,
      requestId: requestId,
      callbackId: callbackId,
      args: args
    };
  }

  function createEventMessage(sessionId, eventName, payload) {
    return {
      type: MARKER,
      action: MessageType.Event,
      sessionId: sessionId,
      eventName: eventName,
      payload: payload
    };
  } // Type Guards


  function isMessage(m) {
    return m && m.type === MARKER;
  }

  function isHandshakeRequestMessage(m) {
    return isMessage(m) && m.action === MessageType.HandshakeRequest;
  }

  function isHandshakeResponseMessage(m) {
    return isMessage(m) && m.action === MessageType.HandshakeResponse;
  }

  function isCallMessage(m) {
    return isMessage(m) && m.action === MessageType.Call;
  }

  function isResponseMessage(m) {
    return isMessage(m) && m.action === MessageType.Response;
  }

  function isCallbackMessage(m) {
    return isMessage(m) && m.action === MessageType.Callback;
  }

  function isEventMessage(m) {
    return isMessage(m) && m.action === MessageType.Event;
  }

  function makeCallbackEvent(requestId) {
    return "callback_".concat(requestId);
  }

  function makeResponseEvent(requestId) {
    return "response_".concat(requestId);
  }

  var Dispatcher = /*#__PURE__*/function (_ConcreteEmitter) {
    _inherits(Dispatcher, _ConcreteEmitter);

    var _super = _createSuper(Dispatcher);

    function Dispatcher(messenger, sessionId) {
      var _this2;

      _classCallCheck(this, Dispatcher);

      _this2 = _super.call(this);
      _this2.uniqueId = createUniqueIdFn();
      _this2.messenger = messenger;
      _this2.sessionId = sessionId;
      _this2.removeMessengerListener = _this2.messenger.addMessageListener(_this2.messengerListener.bind(_assertThisInitialized(_this2)));
      return _this2;
    }

    _createClass(Dispatcher, [{
      key: "messengerListener",
      value: function messengerListener(event) {
        var data = event.data;

        if (!isMessage(data)) {
          return;
        }

        if (this.sessionId !== data.sessionId) {
          return;
        }

        if (isCallMessage(data)) {
          this.emit(MessageType.Call, data);
        } else if (isResponseMessage(data)) {
          this.emit(makeResponseEvent(data.requestId), data);
        } else if (isEventMessage(data)) {
          this.emit(MessageType.Event, data);
        } else if (isCallbackMessage(data)) {
          this.emit(makeCallbackEvent(data.requestId), data);
        }
      }
    }, {
      key: "callOnRemote",
      value: function callOnRemote(methodName, args, transfer) {
        var requestId = this.uniqueId();
        var callbackEvent = makeCallbackEvent(requestId);
        var responseEvent = makeResponseEvent(requestId);
        var message = createCallMessage(this.sessionId, requestId, methodName, args);
        this.messenger.postMessage(message, transfer);
        return {
          callbackEvent: callbackEvent,
          responseEvent: responseEvent
        };
      }
    }, {
      key: "respondToRemote",
      value: function respondToRemote(requestId, value, error, transfer) {
        if (error instanceof Error) {
          error = {
            name: error.name,
            message: error.message
          };
        }

        var message = createResponsMessage(this.sessionId, requestId, value, error);
        this.messenger.postMessage(message, transfer);
      }
    }, {
      key: "callbackToRemote",
      value: function callbackToRemote(requestId, callbackId, args) {
        var message = createCallbackMessage(this.sessionId, requestId, callbackId, args);
        this.messenger.postMessage(message);
      }
    }, {
      key: "emitToRemote",
      value: function emitToRemote(eventName, payload, transfer) {
        var message = createEventMessage(this.sessionId, eventName, payload);
        this.messenger.postMessage(message, transfer);
      }
    }, {
      key: "close",
      value: function close() {
        this.removeMessengerListener();
        this.removeAllListeners();
      }
    }]);

    return Dispatcher;
  }(ConcreteEmitter);

  var ParentHandshakeDispatcher = /*#__PURE__*/function (_ConcreteEmitter2) {
    _inherits(ParentHandshakeDispatcher, _ConcreteEmitter2);

    var _super2 = _createSuper(ParentHandshakeDispatcher);

    function ParentHandshakeDispatcher(messenger, sessionId) {
      var _this3;

      _classCallCheck(this, ParentHandshakeDispatcher);

      _this3 = _super2.call(this);
      _this3.messenger = messenger;
      _this3.sessionId = sessionId;
      _this3.removeMessengerListener = _this3.messenger.addMessageListener(_this3.messengerListener.bind(_assertThisInitialized(_this3)));
      return _this3;
    }

    _createClass(ParentHandshakeDispatcher, [{
      key: "messengerListener",
      value: function messengerListener(event) {
        var data = event.data;

        if (!isMessage(data)) {
          return;
        }

        if (this.sessionId !== data.sessionId) {
          return;
        }

        if (isHandshakeResponseMessage(data)) {
          this.emit(data.sessionId, data);
        }
      }
    }, {
      key: "initiateHandshake",
      value: function initiateHandshake() {
        var message = createHandshakeRequestMessage(this.sessionId);
        this.messenger.postMessage(message);
        return this.sessionId;
      }
    }, {
      key: "close",
      value: function close() {
        this.removeMessengerListener();
        this.removeAllListeners();
      }
    }]);

    return ParentHandshakeDispatcher;
  }(ConcreteEmitter);

  var ChildHandshakeDispatcher = /*#__PURE__*/function (_ConcreteEmitter3) {
    _inherits(ChildHandshakeDispatcher, _ConcreteEmitter3);

    var _super3 = _createSuper(ChildHandshakeDispatcher);

    function ChildHandshakeDispatcher(messenger) {
      var _this4;

      _classCallCheck(this, ChildHandshakeDispatcher);

      _this4 = _super3.call(this);
      _this4.messenger = messenger;
      _this4.removeMessengerListener = _this4.messenger.addMessageListener(_this4.messengerListener.bind(_assertThisInitialized(_this4)));
      return _this4;
    }

    _createClass(ChildHandshakeDispatcher, [{
      key: "messengerListener",
      value: function messengerListener(event) {
        var data = event.data;

        if (isHandshakeRequestMessage(data)) {
          this.emit(MessageType.HandshakeRequest, data);
        }
      }
    }, {
      key: "acceptHandshake",
      value: function acceptHandshake(sessionId) {
        var message = createHandshakeResponseMessage(sessionId);
        this.messenger.postMessage(message);
      }
    }, {
      key: "close",
      value: function close() {
        this.removeMessengerListener();
        this.removeAllListeners();
      }
    }]);

    return ChildHandshakeDispatcher;
  }(ConcreteEmitter);

  var ProxyType;

  (function (ProxyType) {
    ProxyType["Callback"] = "callback";
  })(ProxyType || (ProxyType = {}));

  function createCallbackProxy(callbackId) {
    return {
      type: MARKER,
      proxy: ProxyType.Callback,
      callbackId: callbackId
    };
  }

  function isCallbackProxy(p) {
    return p && p.type === MARKER && p.proxy === ProxyType.Callback;
  }

  var ConcreteRemoteHandle = /*#__PURE__*/function (_ConcreteEmitter4) {
    _inherits(ConcreteRemoteHandle, _ConcreteEmitter4);

    var _super4 = _createSuper(ConcreteRemoteHandle);

    function ConcreteRemoteHandle(dispatcher) {
      var _this5;

      _classCallCheck(this, ConcreteRemoteHandle);

      _this5 = _super4.call(this);
      _this5._dispatcher = dispatcher;
      _this5._callTransfer = {};

      _this5._dispatcher.addEventListener(MessageType.Event, _this5._handleEvent.bind(_assertThisInitialized(_this5)));

      return _this5;
    }

    _createClass(ConcreteRemoteHandle, [{
      key: "close",
      value: function close() {
        this.removeAllListeners();
      }
    }, {
      key: "setCallTransfer",
      value: function setCallTransfer(methodName, transfer) {
        this._callTransfer[methodName] = transfer;
      }
    }, {
      key: "call",
      value: function call(methodName) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return this.customCall(methodName, args);
      }
    }, {
      key: "customCall",
      value: function customCall(methodName, args) {
        var _this6 = this;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return new Promise(function (resolve, reject) {
          var sanitizedArgs = [];
          var callbacks = [];
          var callbackId = 0;
          args.forEach(function (arg) {
            if (typeof arg === 'function') {
              callbacks.push(arg);
              sanitizedArgs.push(createCallbackProxy(callbackId));
              callbackId += 1;
            } else {
              sanitizedArgs.push(arg);
            }
          });
          var hasCallbacks = callbacks.length > 0;
          var callbackListener = undefined;

          if (hasCallbacks) {
            callbackListener = function callbackListener(data) {
              var callbackId = data.callbackId,
                  args = data.args;
              callbacks[callbackId].apply(callbacks, _toConsumableArray(args));
            };
          }

          var transfer = options.transfer;

          if (transfer === undefined && _this6._callTransfer[methodName]) {
            var _this6$_callTransfer;

            transfer = (_this6$_callTransfer = _this6._callTransfer)[methodName].apply(_this6$_callTransfer, sanitizedArgs);
          }

          var _this6$_dispatcher$ca = _this6._dispatcher.callOnRemote(methodName, sanitizedArgs, transfer),
              callbackEvent = _this6$_dispatcher$ca.callbackEvent,
              responseEvent = _this6$_dispatcher$ca.responseEvent;

          if (hasCallbacks) {
            _this6._dispatcher.addEventListener(callbackEvent, callbackListener);
          }

          _this6._dispatcher.once(responseEvent).then(function (response) {
            if (callbackListener) {
              _this6._dispatcher.removeEventListener(callbackEvent, callbackListener);
            }

            var result = response.result,
                error = response.error;

            if (error !== undefined) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      }
    }, {
      key: "_handleEvent",
      value: function _handleEvent(data) {
        var eventName = data.eventName,
            payload = data.payload;
        this.emit(eventName, payload);
      }
    }]);

    return ConcreteRemoteHandle;
  }(ConcreteEmitter);

  var ConcreteLocalHandle = /*#__PURE__*/function () {
    function ConcreteLocalHandle(dispatcher, localMethods) {
      _classCallCheck(this, ConcreteLocalHandle);

      this._dispatcher = dispatcher;
      this._methods = localMethods;
      this._returnTransfer = {};
      this._emitTransfer = {};

      this._dispatcher.addEventListener(MessageType.Call, this._handleCall.bind(this));
    }

    _createClass(ConcreteLocalHandle, [{
      key: "emit",
      value: function emit(eventName, payload) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var transfer = options.transfer;

        if (transfer === undefined && this._emitTransfer[eventName]) {
          transfer = this._emitTransfer[eventName](payload);
        }

        this._dispatcher.emitToRemote(eventName, payload, transfer);
      }
    }, {
      key: "setMethods",
      value: function setMethods(methods) {
        this._methods = methods;
      }
    }, {
      key: "setMethod",
      value: function setMethod(methodName, method) {
        this._methods[methodName] = method;
      }
    }, {
      key: "setReturnTransfer",
      value: function setReturnTransfer(methodName, transfer) {
        this._returnTransfer[methodName] = transfer;
      }
    }, {
      key: "setEmitTransfer",
      value: function setEmitTransfer(eventName, transfer) {
        this._emitTransfer[eventName] = transfer;
      }
    }, {
      key: "_handleCall",
      value: function _handleCall(data) {
        var _this7 = this;

        var requestId = data.requestId,
            methodName = data.methodName,
            args = data.args;
        var callMethod = new Promise(function (resolve, reject) {
          var _this7$_methods;

          var method = _this7._methods[methodName];

          if (typeof method !== 'function') {
            reject(new Error("The method \"".concat(methodName, "\" has not been implemented.")));
            return;
          }

          var desanitizedArgs = args.map(function (arg) {
            if (isCallbackProxy(arg)) {
              var callbackId = arg.callbackId;
              return function () {
                for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  args[_key2] = arguments[_key2];
                }

                _this7._dispatcher.callbackToRemote(requestId, callbackId, args);
              };
            } else {
              return arg;
            }
          });
          Promise.resolve((_this7$_methods = _this7._methods)[methodName].apply(_this7$_methods, _toConsumableArray(desanitizedArgs))).then(resolve)["catch"](reject);
        });
        callMethod.then(function (result) {
          var transfer;

          if (_this7._returnTransfer[methodName]) {
            transfer = _this7._returnTransfer[methodName](result);
          }

          _this7._dispatcher.respondToRemote(requestId, result, undefined, transfer);
        })["catch"](function (error) {
          _this7._dispatcher.respondToRemote(requestId, undefined, error);
        });
      }
    }]);

    return ConcreteLocalHandle;
  }();

  var ConcreteConnection = /*#__PURE__*/function () {
    function ConcreteConnection(dispatcher, localMethods) {
      _classCallCheck(this, ConcreteConnection);

      this._dispatcher = dispatcher;
      this._localHandle = new ConcreteLocalHandle(dispatcher, localMethods);
      this._remoteHandle = new ConcreteRemoteHandle(dispatcher);
    }

    _createClass(ConcreteConnection, [{
      key: "close",
      value: function close() {
        this._dispatcher.close();

        this.remoteHandle().close();
      }
    }, {
      key: "localHandle",
      value: function localHandle() {
        return this._localHandle;
      }
    }, {
      key: "remoteHandle",
      value: function remoteHandle() {
        return this._remoteHandle;
      }
    }]);

    return ConcreteConnection;
  }();

  var uniqueSessionId = createUniqueIdFn();

  var runUntil = function runUntil(worker, condition, unfulfilled, maxAttempts, attemptInterval) {
    var attempt = 0;

    var fn = function fn() {
      if (!condition() && (attempt < maxAttempts || maxAttempts < 1)) {
        worker();
        attempt += 1;
        setTimeout(fn, attemptInterval);
      } else if (!condition() && attempt >= maxAttempts && maxAttempts >= 1) {
        unfulfilled();
      }
    };

    fn();
  };
  /**
   * Initiate the handshake from the Parent side
   *
   * @param messenger - The Messenger used to send and receive messages from the other end
   * @param localMethods - The methods that will be exposed to the other end
   * @param maxAttempts - The maximum number of handshake attempts
   * @param attemptsInterval - The interval between handshake attempts
   * @returns A Promise to an active {@link Connection} to the other end
   *
   * @public
   */


  function ParentHandshake(messenger) {
    var localMethods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var maxAttempts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
    var attemptsInterval = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100;
    var thisSessionId = uniqueSessionId();
    var connected = false;
    return new Promise(function (resolve, reject) {
      var handshakeDispatcher = new ParentHandshakeDispatcher(messenger, thisSessionId);
      handshakeDispatcher.once(thisSessionId).then(function (response) {
        connected = true;
        handshakeDispatcher.close();
        var sessionId = response.sessionId;
        var dispatcher = new Dispatcher(messenger, sessionId);
        var connection = new ConcreteConnection(dispatcher, localMethods);
        resolve(connection);
      });
      runUntil(function () {
        return handshakeDispatcher.initiateHandshake();
      }, function () {
        return connected;
      }, function () {
        return reject(new Error("Handshake failed, reached maximum number of attempts"));
      }, maxAttempts, attemptsInterval);
    });
  }
  /**
   * Initiate the handshake from the Child side
   *
   * @param messenger - The Messenger used to send and receive messages from the other end
   * @param localMethods - The methods that will be exposed to the other end
   * @returns A Promise to an active {@link Connection} to the other end
   *
   * @public
   */


  function ChildHandshake(messenger) {
    var localMethods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return new Promise(function (resolve, reject) {
      var handshakeDispatcher = new ChildHandshakeDispatcher(messenger);
      handshakeDispatcher.once(MessageType.HandshakeRequest).then(function (response) {
        var sessionId = response.sessionId;
        handshakeDispatcher.acceptHandshake(sessionId);
        handshakeDispatcher.close();
        var dispatcher = new Dispatcher(messenger, sessionId);
        var connection = new ConcreteConnection(dispatcher, localMethods);
        resolve(connection);
      });
    });
  }

  var acceptableMessageEvent = function acceptableMessageEvent(event, remoteWindow, acceptedOrigin) {
    var source = event.source,
        origin = event.origin;

    if (source !== remoteWindow) {
      return false;
    }

    if (origin !== acceptedOrigin && acceptedOrigin !== '*') {
      return false;
    }

    return true;
  };
  /**
   * A concrete implementation of {@link Messenger} used to communicate with another Window.
   *
   * @public
   *
   */


  var WindowMessenger = function WindowMessenger(_ref) {
    var localWindow = _ref.localWindow,
        remoteWindow = _ref.remoteWindow,
        remoteOrigin = _ref.remoteOrigin;

    _classCallCheck(this, WindowMessenger);

    localWindow = localWindow || window;

    this.postMessage = function (message, transfer) {
      remoteWindow.postMessage(message, remoteOrigin, transfer);
    };

    this.addMessageListener = function (listener) {
      var outerListener = function outerListener(event) {
        if (acceptableMessageEvent(event, remoteWindow, remoteOrigin)) {
          listener(event);
        }
      };

      localWindow.addEventListener('message', outerListener);

      var removeListener = function removeListener() {
        localWindow.removeEventListener('message', outerListener);
      };

      return removeListener;
    };
  };
  /** @public */


  _exports.WindowMessenger = WindowMessenger;

  var BareMessenger = function BareMessenger(postable) {
    _classCallCheck(this, BareMessenger);

    this.postMessage = function (message) {
      var transfer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      postable.postMessage(message, transfer);
    };

    this.addMessageListener = function (listener) {
      var outerListener = function outerListener(event) {
        listener(event);
      };

      postable.addEventListener('message', outerListener);

      var removeListener = function removeListener() {
        postable.removeEventListener('message', outerListener);
      };

      return removeListener;
    };
  };
  /**
   * A concrete implementation of {@link Messenger} used to communicate with a Worker.
   *
   * Takes a {@link Postable} representing the `Worker` (when calling from
   * the parent context) or the `self` `DedicatedWorkerGlobalScope` object
   * (when calling from the child context).
   *
   * @public
   *
   */


  _exports.BareMessenger = BareMessenger;

  var WorkerMessenger = /*#__PURE__*/function (_BareMessenger) {
    _inherits(WorkerMessenger, _BareMessenger);

    var _super5 = _createSuper(WorkerMessenger);

    function WorkerMessenger(_ref2) {
      var worker = _ref2.worker;

      _classCallCheck(this, WorkerMessenger);

      return _super5.call(this, worker);
    }

    return WorkerMessenger;
  }(BareMessenger);
  /**
   * A concrete implementation of {@link Messenger} used to communicate with a MessagePort.
   *
   * @public
   *
   */


  _exports.WorkerMessenger = WorkerMessenger;

  var PortMessenger = /*#__PURE__*/function (_BareMessenger2) {
    _inherits(PortMessenger, _BareMessenger2);

    var _super6 = _createSuper(PortMessenger);

    function PortMessenger(_ref3) {
      var port = _ref3.port;

      _classCallCheck(this, PortMessenger);

      port.start();
      return _super6.call(this, port);
    }

    return PortMessenger;
  }(BareMessenger);
  /**
   * Create a logger function with a specific namespace
   *
   * @param namespace - The namespace will be prepended to all the arguments passed to the logger function
   * @param log - The underlying logger (`console.log` by default)
   *
   * @public
   *
   */


  _exports.PortMessenger = PortMessenger;

  function debug(namespace, log) {
    log = log || console.debug || console.log || function () {};

    return function () {
      for (var _len3 = arguments.length, data = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        data[_key3] = arguments[_key3];
      }

      log.apply(void 0, [namespace].concat(data));
    };
  }
  /**
   * Decorate a {@link Messenger} so that it will log any message exchanged
   * @param messenger - The Messenger that will be decorated
   * @param log - The logger function that will receive each message
   * @returns A decorated Messenger
   *
   * @public
   *
   */


  function DebugMessenger(messenger, log) {
    log = log || debug('post-me');

    var debugListener = function debugListener(event) {
      var data = event.data;
      log('⬅️ received message', data);
    };

    messenger.addMessageListener(debugListener);
    return {
      postMessage: function postMessage(message, transfer) {
        log('➡️ sending message', message);
        messenger.postMessage(message, transfer);
      },
      addMessageListener: function addMessageListener(listener) {
        return messenger.addMessageListener(listener);
      }
    };
  }
});


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(2);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(13));
var _createClass2 = _interopRequireDefault(__webpack_require__(14));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(33));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(36));
var _inherits2 = _interopRequireDefault(__webpack_require__(37));
var _bridgeInterfaces = __webpack_require__(41);
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); } // @ts-check
/**
 * post-me messenger implementation for a content script implanted in a react native webview
 */
var ReactNativeWebviewMessenger = exports["default"] = /*#__PURE__*/function (_MessengerInterface) {
  (0, _inherits2.default)(ReactNativeWebviewMessenger, _MessengerInterface);
  /**
   * Init the window which will be used to post messages and listen to messages
   *
   * @param  {object} options             : options object
   * @param  {object} options.localWindow : The window object
   */
  function ReactNativeWebviewMessenger(_ref) {
    var _this;
    var localWindow = _ref.localWindow;
    (0, _classCallCheck2.default)(this, ReactNativeWebviewMessenger);
    _this = _callSuper(this, ReactNativeWebviewMessenger);
    _this.localWindow = localWindow;
    return _this;
  }
  (0, _createClass2.default)(ReactNativeWebviewMessenger, [{
    key: "postMessage",
    value: function postMessage(message) {
      this.localWindow.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  }, {
    key: "addMessageListener",
    value: function addMessageListener(listener) {
      var _this2 = this;
      var outerListener = function outerListener(event) {
        listener(event);
      };
      this.localWindow.addEventListener('message', outerListener);
      var removeMessageListener = function removeMessageListener() {
        _this2.localWindow.removeEventListener('message', outerListener);
      };
      return removeMessageListener;
    }
  }]);
  return ReactNativeWebviewMessenger;
}(_bridgeInterfaces.MessengerInterface);

/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(2);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.MessengerInterface = exports.Bridge = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(4));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(12));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(13));
var _createClass2 = _interopRequireDefault(__webpack_require__(14));
/* eslint-disable no-unused-vars */
/**
 * @typedef PostMeConnection
 * @property {Function} localHandle  : get handle to the local end of the connection
 * @property {Function} remoteHandle : get handle to the remote end of the connection
 * @property {Function} close        : stop listening to incoming message from the other side
 */
/**
 * All bridges are supposed to implement this interface
 */
var Bridge = exports.Bridge = /*#__PURE__*/function () {
  function Bridge() {
    (0, _classCallCheck2.default)(this, Bridge);
  }
  (0, _createClass2.default)(Bridge, [{
    key: "init",
    value: (
    /**
     * Initialize the communication between the parent and the child via post-me protocol
     * https://github.com/alesgenova/post-me
     *
     * @param  {object} options                             : Options object
     * @param  {object} options.root                        : The object which will contain the exposed method names
     * @param  {Array.<string>} options.exposedMethodNames  : The list of method names of the root object, which will be exposed via the post-me interface to the content script
     * @param  {Array.<string>} options.listenedEventsNames : The list of method names of the root object, which will be call on given event name via the post-me interface to the content script
     * @param  {object} options.webViewRef                  : Reference to the webview obect containing the content script
     * @returns {Promise.<PostMeConnection>} : the resulting post-me connection
     */
    function () {
      var _init = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(options) {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function init(_x) {
        return _init.apply(this, arguments);
      }
      return init;
    }()
    /**
     * Shortcut to remoteHandle.call method
     *
     * @param  {string} method : The remote method name
     * @param  {Array} args    : Any number of parameters which will be given to the remote method.
     * It is also possible to pass callback functions (which must support serialization). post-me
     * will wait the the remote method end before resolving the promise
     * @returns {Promise.<any>} remote method return value
     */
    )
  }, {
    key: "call",
    value: (function () {
      var _call = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(method) {
        var _this$remoteHandle;
        var _len,
          args,
          _key,
          _args2 = arguments;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              for (_len = _args2.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = _args2[_key];
              }
              return _context2.abrupt("return", (_this$remoteHandle = this.remoteHandle).call.apply(_this$remoteHandle, [method].concat(args)));
            case 2:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function call(_x2) {
        return _call.apply(this, arguments);
      }
      return call;
    }()
    /**
     * Shortcut to localHandle.emit method. Will emit an event which could be listened by the remote
     * object
     *
     * @param  {string} eventName : Name of the event
     * @param  {Array} args       : Any number of parameters.
     */
    )
  }, {
    key: "emit",
    value: function emit(eventName) {
      var _this$localHandle;
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }
      (_this$localHandle = this.localHandle).emit.apply(_this$localHandle, [eventName].concat(args));
    }

    /**
     * Shortcut to remoteHandle.addEventListener method. Will listen to the given event on the remote
     * object and call the listener function
     *
     * @param  {string} remoteEventName : Name of the remove event
     * @param  {Function} listener      : Listener function
     */
  }, {
    key: "addEventListener",
    value: function addEventListener(remoteEventName, listener) {
      this.remoteHandle.addEventListener(remoteEventName, listener);
    }

    /**
     * Shortcut to remoteHandle.removeEventListener method. Will stop listening to the given event
     * on the remote object.
     *
     * @param  {string} remoteEventName : Name of the remote event
     * @param  {Function} listener      : Previously defined listener function
     */
  }, {
    key: "removeEventListener",
    value: function removeEventListener(remoteEventName, listener) {
      this.remoteHandle.removeEventListener(remoteEventName, listener);
    }
  }]);
  return Bridge;
}();
/**
 * All messengers are supposed to implement this interface
 *
 * @interface
 */
var MessengerInterface = exports.MessengerInterface = /*#__PURE__*/function () {
  function MessengerInterface() {
    (0, _classCallCheck2.default)(this, MessengerInterface);
  }
  (0, _createClass2.default)(MessengerInterface, [{
    key: "postMessage",
    value:
    /**
     * Send a message to the other context
     *
     * @param {string} message : The payload of the message
     */
    function postMessage(message) {}

    /**
     * Add a listener to messages received by the other context
     *
     * @param {Function} listener : A listener that will receive the MessageEvent
     * @returns {Function} A function that can be invoked to remove the listener
     */
  }, {
    key: "addMessageListener",
    value: function addMessageListener(listener) {}
  }]);
  return MessengerInterface;
}();

/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(2);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.dataUriToArrayBuffer = exports.calculateFileKey = void 0;
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(43));
/**
 * @typedef ArrayBufferWithContentType
 * @property {string} contentType - dataUri included content type
 * @property {ArrayBuffer} arrayBuffer - resulting decoded data
 */

/**
 * Converts a data URI string to an Array Buffer with its content Type
 *
 * @param {string} dataURI - data URI string containing content type and base64 encoded data
 * @returns {ArrayBufferWithContentType} : array buffer with content type
 */
var dataUriToArrayBuffer = exports.dataUriToArrayBuffer = function dataUriToArrayBuffer(dataURI) {
  var parsed = dataURI.match(/^data:(.*);base64,(.*)$/);
  if (parsed === null) {
    throw new Error('dataUriToArrayBuffer: dataURI is malformed. Should be in the form data:...;base64,...');
  }
  var _parsed$slice = parsed.slice(1),
    _parsed$slice2 = (0, _slicedToArray2.default)(_parsed$slice, 2),
    contentType = _parsed$slice2[0],
    base64String = _parsed$slice2[1];
  var byteString = __webpack_require__.g.atob(base64String);
  var arrayBuffer = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(arrayBuffer);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return {
    contentType: contentType,
    arrayBuffer: arrayBuffer
  };
};

/**
 * Calculate the file key from an entry given to saveFiles
 *
 * @param {import('../launcher/saveFiles').saveFilesEntry} entry - a savefiles entry
 * @param {Array<string>} fileIdAttributes - list of entry attributes which will be used to identify the entry in a unique way
 * @returns {string} - The resulting file key
 */
var calculateFileKey = exports.calculateFileKey = function calculateFileKey(entry, fileIdAttributes) {
  return fileIdAttributes.sort().map(function (key) {
    return entry === null || entry === void 0 ? void 0 : entry[key];
  }).join('####');
};

/***/ }),
/* 43 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayWithHoles = __webpack_require__(44);

var iterableToArrayLimit = __webpack_require__(45);

var unsupportedIterableToArray = __webpack_require__(10);

var nonIterableRest = __webpack_require__(46);

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 44 */
/***/ ((module) => {

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 45 */
/***/ ((module) => {

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 46 */
/***/ ((module) => {

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(2);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.wrapTimerFactory = exports.wrapTimer = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(4));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(12));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(48));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2.default)(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * Create a wrapTimer function with given defaults as options
 *
 * @param {WrapTimerOptions} defaults
 * @returns {Function} - wrapTimer function
 */
var wrapTimerFactory = exports.wrapTimerFactory = function wrapTimerFactory(defaults) {
  return function (obj, name) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return wrapTimer(obj, name, _objectSpread(_objectSpread({}, defaults), options));
  };
};

/**
 * Wrap any async method of an object to display it's time of execution
 *
 * @param {object} obj - The object which will be considered as `this`
 * @param {string} name - The name of the method to wrap
 * @param {WrapTimerOptions} [options] - Options object
 * @returns {Function} - Wrapped async function
 */
var wrapTimer = exports.wrapTimer = function wrapTimer(obj, name) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$displayName = options.displayName,
    displayName = _options$displayName === void 0 ? name : _options$displayName,
    _options$logFn = options.logFn,
    logFn = _options$logFn === void 0 ? console.log.bind(console) : _options$logFn,
    _options$suffixFn = options.suffixFn,
    suffixFn = _options$suffixFn === void 0 ? null : _options$suffixFn;
  var fn = obj[name];
  if (!fn) {
    throw new Error("".concat(name, " cannot be found on ").concat(obj.name || obj.constructor.name));
  }
  return /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
    var start,
      res,
      end,
      suffix,
      _args = arguments;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          start = Date.now();
          _context.next = 3;
          return fn.apply(this, _args);
        case 3:
          res = _context.sent;
          end = Date.now();
          suffix = suffixFn ? ' ' + suffixFn(_args) : '';
          logFn("\u231B ".concat(displayName).concat(suffix, " took ").concat(Math.round((end - start) / 10) / 100, "s"));
          return _context.abrupt("return", res);
        case 8:
        case "end":
          return _context.stop();
      }
    }, _callee, this);
  }));
};

/**
 * @typedef WrapTimerOptions
 * @property {string} [options.displayName] - Name which will be displayed in the final log
 * @property {Function} [options.logFn] - logging function. Defaults to console.log
 * @property {Function} [options.suffixFn] - function which will be called with method arguments which return a suffix to the name of the method
 */

/***/ }),
/* 48 */
/***/ ((module) => {

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(2);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(4));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(12));
var _slicedToArray2 = _interopRequireDefault(__webpack_require__(43));
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(13));
var _createClass2 = _interopRequireDefault(__webpack_require__(14));
var _microee = _interopRequireDefault(__webpack_require__(18));
var _utils = __webpack_require__(30);
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; } /* eslint no-console: off */
/**
 * Intercept any xhr or fetch request corresponding to the given interception list
 */
var RequestInterceptor = /*#__PURE__*/function () {
  /**
   * @function Object() { [native code] }
   * @param {Array<InterceptionDocument>} interceptions - the list of url to intercept
   */
  function RequestInterceptor(interceptions) {
    (0, _classCallCheck2.default)(this, RequestInterceptor);
    this.interceptions = interceptions;
    this.savedSetRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader;
    this.savedOpen = window.XMLHttpRequest.prototype.open;
    this.savedFetch = window.fetch;
  }

  /**
   * Restore original request function to default values
   */
  (0, _createClass2.default)(RequestInterceptor, [{
    key: "restore",
    value: function restore() {
      window.XMLHttpRequest.prototype.setRequestHeader = this.savedSetRequestHeader;
      window.XMLHttpRequest.prototype.open = this.savedOpen;
      window.fetch = this.savedFetch;
    }

    /**
     * Init the replacemenet of xhr and fetch function to be able to intercept requests
     */
  }, {
    key: "init",
    value: function init() {
      try {
        var self = this;
        window.XMLHttpRequest.prototype.setRequestHeader = function (key, value) {
          try {
            var newValue = this._requestHeaders[key] ? this._requestHeaders[key] += ', ' + value : value;
            this._requestHeaders[key] = newValue;
            return self.savedSetRequestHeader.apply(this, [].slice.call(arguments));
          } catch (err) {
            this.log('error', '❌❌❌ xhr setRequestHeader interception error ' + err.message);
          }
        };
        window.XMLHttpRequest.prototype.open = function (method, url) {
          try {
            var response = this;
            response._requestHeaders = {};
            response.addEventListener('readystatechange', function () {
              if (response.readyState === 4) {
                var responseHeaders = {};
                var allResponseHeaders = response.getAllResponseHeaders() ? response.getAllResponseHeaders().split('\r\n') : [];
                var _iterator = _createForOfIteratorHelper(allResponseHeaders),
                  _step;
                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    var header = _step.value;
                    var _header$split = header.split(': '),
                      _header$split2 = (0, _slicedToArray2.default)(_header$split, 2),
                      key = _header$split2[0],
                      value = _header$split2[1];
                    responseHeaders[key] = value;
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }
                self.serializeAndEmitResponse({
                  method: method,
                  url: url,
                  response: response,
                  responseHeaders: responseHeaders,
                  requestHeaders: response._requestHeaders
                });
              }
              return response;
            });
            return self.savedOpen.apply(response, [].slice.call(arguments));
          } catch (err) {
            this.log('error', '❌❌❌ xhr interception error ' + err.message);
          }
        };
        window.fetch = /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
          var _len,
            args,
            _key,
            response,
            input,
            options,
            url,
            method,
            responseHeaders,
            _iterator2,
            _step2,
            _step2$value,
            key,
            value,
            _args = arguments;
          return _regenerator.default.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                for (_len = _args.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = _args[_key];
                }
                _context.next = 3;
                return self.savedFetch.apply(window, args);
              case 3:
                response = _context.sent;
                _context.prev = 4;
                input = args[0], options = args[1];
                url = typeof input === 'string' ? input : (input === null || input === void 0 ? void 0 : input.url) || (input === null || input === void 0 ? void 0 : input.toString());
                method = (options === null || options === void 0 ? void 0 : options.method) || (input === null || input === void 0 ? void 0 : input.method) || 'GET';
                responseHeaders = {};
                _iterator2 = _createForOfIteratorHelper(response.headers.entries());
                try {
                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                    _step2$value = (0, _slicedToArray2.default)(_step2.value, 2), key = _step2$value[0], value = _step2$value[1];
                    responseHeaders[key] = value;
                  }
                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }
                self.serializeAndEmitResponse({
                  method: method,
                  url: url,
                  response: response,
                  responseHeaders: responseHeaders,
                  requestHeaders: options === null || options === void 0 ? void 0 : options.headers
                });
                return _context.abrupt("return", response);
              case 15:
                _context.prev = 15;
                _context.t0 = _context["catch"](4);
                this.log('error', '❌❌❌ fetch interception error ' + _context.t0.message);
              case 18:
              case "end":
                return _context.stop();
            }
          }, _callee, this, [[4, 15]]);
        }));
      } catch (err) {
        this.log('error', '❌❌❌ interceptor init error ' + err.message);
      }
    }
    /**
     * Serialize the intercepted response according to the "serialize" attribute given in the
     * interception list and emit it as a "response" event
     *
     * @param {Response} resp - HTTP response
     */
  }, {
    key: "serializeAndEmitResponse",
    value: (function () {
      var _serializeAndEmitResponse = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(resp) {
        var interception;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              interception = this.interceptions.find(function (doc) {
                return resp.method === doc.method && doc.exact ? resp.url === doc.url : resp.url.includes(doc.url);
              });
              if (interception) {
                _context2.next = 3;
                break;
              }
              return _context2.abrupt("return");
            case 3:
              if (interception.label) {
                this.log('warn', "RequestInterceptor: interception.label is deprecated, you should use interception.identifier");
              }
              resp.identifier = interception.identifier || interception.label;

              // response serialization, to be able to transfer to the pilot
              if (!(interception.serialization === 'json')) {
                _context2.next = 15;
                break;
              }
              if (!(resp.response instanceof Response)) {
                _context2.next = 12;
                break;
              }
              _context2.next = 9;
              return resp.response.clone().json();
            case 9:
              resp.response = _context2.sent;
              _context2.next = 13;
              break;
            case 12:
              resp.response = JSON.parse(resp.response.responseText);
            case 13:
              _context2.next = 38;
              break;
            case 15:
              if (!(interception.serialization === 'text')) {
                _context2.next = 25;
                break;
              }
              if (!(resp.response instanceof Response)) {
                _context2.next = 22;
                break;
              }
              _context2.next = 19;
              return resp.response.clone().text();
            case 19:
              resp.response = _context2.sent;
              _context2.next = 23;
              break;
            case 22:
              resp.response = resp.response.responseText;
            case 23:
              _context2.next = 38;
              break;
            case 25:
              if (!(interception.serialization === 'dataUri')) {
                _context2.next = 37;
                break;
              }
              if (!(resp.response instanceof Response)) {
                _context2.next = 34;
                break;
              }
              _context2.t0 = _utils.blobToBase64;
              _context2.next = 30;
              return resp.response.clone().blob();
            case 30:
              _context2.t1 = _context2.sent;
              resp.response = (0, _context2.t0)(_context2.t1);
              _context2.next = 35;
              break;
            case 34:
              resp.response = (0, _utils.blobToBase64)(resp.response.response);
            case 35:
              _context2.next = 38;
              break;
            case 37:
              this.log('error', '❌❌❌ wrong serialization method : ' + interception.serialization);
            case 38:
              this.emit('response', resp);
              this.log('debug', "RequestInterceptor: intercepted ".concat(resp.method, " ").concat(resp.url, " response"));
            case 40:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function serializeAndEmitResponse(_x) {
        return _serializeAndEmitResponse.apply(this, arguments);
      }
      return serializeAndEmitResponse;
    }())
  }, {
    key: "setLogger",
    value: function setLogger(logger) {
      this.log = logger;
    }
  }]);
  return RequestInterceptor;
}();
_microee.default.mixin(RequestInterceptor);
var _default = exports["default"] = RequestInterceptor;
/**
 * @typedef EmittedResponse
 * @property {string} [label] - a name given to the interception (deprecated in favor of identifier)
 * @property {string} identifier - an identifier given to the interception
 * @property {'GET'|'POST'|'PUT'|'DELETE'} method - the method of the intercepted request
 * @property {string} url - the url intercepted request url
 * @property {Response} response - raw response of the intercepted request
 * @property {object} responseHeaders - response headers
 * @property {object} requestHeaders - request headers
 */
/**
 * @typedef InterceptionDocument
 * @property {string} [label] - a name given to the interception, will be found in the response later (deprecated in favor of identifier)
 * @property {string} identifier - an identifier given to the interception
 * @property {string} url - the url to intercept
 * @property {'GET'|'POST'|'PUT'|'DELETE'} method - the method of the url to intercept
 * @property {boolean} exact - true if the intercepted url must exactly correspond to the given url
 */

/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SuperContentScript)
/* harmony export */ });
/* harmony import */ var cozy_clisk_dist_contentscript__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var p_wait_for__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(29);
/* harmony import */ var cozy_clisk_dist_contentscript_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(30);




class SuperContentScript extends cozy_clisk_dist_contentscript__WEBPACK_IMPORTED_MODULE_0__.ContentScript {
  constructor(options = {}) {
    super(options)

    this.page = new CliskWorker(this)
    this.launcher = new CliskLauncher(this)
  }

  async runLocator(locatorJson, method, ...args) {
    const locator = CssLocator.fromJSON(this, locatorJson, ...args)
    return locator[method](...args)
  }

  async downloadFileInWorker(entry) {
    const { form, ...requestOptions } = entry.requestOptions || {}
    if (form) {
      const body = new FormData()
      for (const [key, value] of Object.entries(form)) {
        body.set(key, value)
      }
      requestOptions.body = body
    }
    const response = await fetch(entry.fileurl, requestOptions)
    if (!response.ok || response.url.includes('error')) {
      this.launcher.log('warn', 'Failed to download ' + entry.fileurl)
      return false
    }
    entry.blob = await response.blob()
    entry.dataUri = await (0,cozy_clisk_dist_contentscript_utils__WEBPACK_IMPORTED_MODULE_2__.blobToBase64)(entry.blob)
    return entry.dataUri
  }

  async workerWaitFor(fnName, fnString, options = {}, ...args) {
    const timeout = options.timeout ?? 30000
    const interval = options.interval ?? 1000
    await (0,p_wait_for__WEBPACK_IMPORTED_MODULE_1__["default"])(() => this.evaluate(fnString, ...args), {
      interval,
      timeout: {
        milliseconds: timeout,
        message: new p_wait_for__WEBPACK_IMPORTED_MODULE_1__.TimeoutError(
          options.errorMsg || fnName + ' timed out after ' + timeout + ' ms'
        )
      }
    })
    return true
  }
}

class CliskWorker {
  constructor(contentScript) {
    this.contentScript = contentScript
  }

  goto(url) {
    return this.contentScript.goto(url)
  }

  waitForElement(selector, options) {
    return this.contentScript.waitForElementInWorker(selector, options)
  }

  waitFor(fn, options = {}, ...args) {
    return this.contentScript.runInWorkerUntilTrue({
      method: 'workerWaitFor',
      args: [fn.name, fn.toString(), options, ...args]
    })
  }

  getByCss(selector, options) {
    const locator = new CssLocator(this.contentScript, selector, options)
    return locator
  }

  show() {
    return this.contentScript.setWorkerState({ visible: true })
  }

  hide() {
    return this.contentScript.setWorkerState({ visible: false })
  }

  async runLocator(locatorJson, method, ...args) {
    return this.contentScript.runInWorker(
      'runLocator',
      locatorJson,
      method,
      ...args
    )
  }

  evaluate(...args) {
    return this.contentScript.evaluateInWorker(...args)
  }

  fetch(url, options) {
    return this.contentScript.evaluateInWorker(
      async function workerFetch(url, options) {
        const { serialization, ...fetchOptions } = options
        const response = await fetch(url, fetchOptions)
        return response[serialization]()
      },
      url,
      options
    )
  }
}

class CliskLauncher {
  constructor(contentScript) {
    this.contentScript = contentScript
  }

  log(level, message) {
    this.contentScript.log(level, message)
  }
}

class CssLocator {
  constructor(contentScript, selector, options) {
    this.contentScript = contentScript
    this.selector = selector
    this.options = options
  }

  static fromJSON(contentScript, json) {
    return new this(contentScript, json.selector, json.options)
  }

  toJSON() {
    return { type: 'css', selector: this.selector, options: this.options }
  }

  _getElements() {
    return Array.from(document.querySelectorAll(this.selector))
  }

  async _isPresent() {
    const elements = this._getElements()
    return Boolean(elements.length)
  }

  async isPresent() {
    return this.contentScript.page.runLocator(this, '_isPresent')
  }

  async waitFor() {
    await this.contentScript.waitForElementInWorker(this.selector, {
      timeout: 10000
    })
  }

  async _innerHTML() {
    const elements = this._getElements()
    if (elements.length > 1) {
      throw new Error(
        'Cannot get _innerHTML of multiple elements. Found ',
        elements.length
      )
    }

    return elements.pop().innerHTML
  }

  async innerHTML() {
    await this.waitFor()
    return this.contentScript.page.runLocator(this, '_innerHTML')
  }

  async _innerText() {
    const elements = this._getElements()
    if (elements.length > 1) {
      throw new Error(
        'Cannot get _innerText of multiple elements. Found ',
        elements.length
      )
    }

    return elements.pop().innerText.trim()
  }

  async innerText() {
    await this.waitFor()
    return this.contentScript.page.runLocator(this, '_innerText')
  }

  async click() {
    await this.waitFor()
    return this.contentScript.runInWorker('click', this.selector, this.options)
  }

  async fillText(text) {
    await this.waitFor()
    return this.contentScript.runInWorker('fillText', this.selector, text)
  }

  async _evaluate(fnString, ...args) {
    const elements = this._getElements()
    if (elements.length > 1) {
      throw new Error(
        'Cannot evaluate on multiple elements. Found ',
        elements.length
      )
    }
    return this.contentScript.evaluate(fnString, elements[0], ...args)
  }

  async evaluate(fn, ...args) {
    await this.waitFor()
    return this.contentScript.page.runLocator(
      this,
      '_evaluate',
      fn.toString(),
      ...args
    )
  }

  getAttribute(attr) {
    return this.evaluate(function getAttribute($el) {
      return $el.getAttribute(attr)
    })
  }
}


/***/ }),
/* 51 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "longFormatters": () => (/* reexport safe */ _lib_format_longFormatters_js__WEBPACK_IMPORTED_MODULE_0__.longFormatters),
/* harmony export */   "parse": () => (/* binding */ parse),
/* harmony export */   "parsers": () => (/* reexport safe */ _parse_lib_parsers_js__WEBPACK_IMPORTED_MODULE_1__.parsers)
/* harmony export */ });
/* harmony import */ var _lib_defaultLocale_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(110);
/* harmony import */ var _lib_format_longFormatters_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(52);
/* harmony import */ var _lib_protectedTokens_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(120);
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(57);
/* harmony import */ var _getDefaultOptions_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(109);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(65);
/* harmony import */ var _parse_lib_Setter_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(56);
/* harmony import */ var _parse_lib_parsers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(53);










// Rexports of internal for libraries to use.
// See: https://github.com/date-fns/date-fns/issues/3638#issuecomment-1877082874


/**
 * The {@link parse} function options.
 */

// This RegExp consists of three parts separated by `|`:
// - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
//   (one of the certain letters followed by `o`)
// - (\w)\1* matches any sequences of the same letter
// - '' matches two quote characters in a row
// - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
//   except a single quote symbol, which ends the sequence.
//   Two quote characters do not end the sequence.
//   If there is no matching single quote
//   then the sequence will continue until the end of the string.
// - . matches any single character unmatched by previous parts of the RegExps
const formattingTokensRegExp =
  /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;

// This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
const longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

const escapedStringRegExp = /^'([^]*?)'?$/;
const doubleQuoteRegExp = /''/g;

const notWhitespaceRegExp = /\S/;
const unescapedLatinCharacterRegExp = /[a-zA-Z]/;

/**
 * @name parse
 * @category Common Helpers
 * @summary Parse the date.
 *
 * @description
 * Return the date parsed from string using the given format string.
 *
 * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
 * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * The characters in the format string wrapped between two single quotes characters (') are escaped.
 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
 *
 * Format of the format string is based on Unicode Technical Standard #35:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * with a few additions (see note 5 below the table).
 *
 * Not all tokens are compatible. Combinations that don't make sense or could lead to bugs are prohibited
 * and will throw `RangeError`. For example usage of 24-hour format token with AM/PM token will throw an exception:
 *
 * ```javascript
 * parse('23 AM', 'HH a', new Date())
 * //=> RangeError: The format string mustn't contain `HH` and `a` at the same time
 * ```
 *
 * See the compatibility table: https://docs.google.com/spreadsheets/d/e/2PACX-1vQOPU3xUhplll6dyoMmVUXHKl_8CRDs6_ueLmex3SoqwhuolkuN3O05l4rqx5h1dKX8eb46Ul-CCSrq/pubhtml?gid=0&single=true
 *
 * Accepted format string patterns:
 * | Unit                            |Prior| Pattern | Result examples                   | Notes |
 * |---------------------------------|-----|---------|-----------------------------------|-------|
 * | Era                             | 140 | G..GGG  | AD, BC                            |       |
 * |                                 |     | GGGG    | Anno Domini, Before Christ        | 2     |
 * |                                 |     | GGGGG   | A, B                              |       |
 * | Calendar year                   | 130 | y       | 44, 1, 1900, 2017, 9999           | 4     |
 * |                                 |     | yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
 * |                                 |     | yy      | 44, 01, 00, 17                    | 4     |
 * |                                 |     | yyy     | 044, 001, 123, 999                | 4     |
 * |                                 |     | yyyy    | 0044, 0001, 1900, 2017            | 4     |
 * |                                 |     | yyyyy   | ...                               | 2,4   |
 * | Local week-numbering year       | 130 | Y       | 44, 1, 1900, 2017, 9000           | 4     |
 * |                                 |     | Yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
 * |                                 |     | YY      | 44, 01, 00, 17                    | 4,6   |
 * |                                 |     | YYY     | 044, 001, 123, 999                | 4     |
 * |                                 |     | YYYY    | 0044, 0001, 1900, 2017            | 4,6   |
 * |                                 |     | YYYYY   | ...                               | 2,4   |
 * | ISO week-numbering year         | 130 | R       | -43, 1, 1900, 2017, 9999, -9999   | 4,5   |
 * |                                 |     | RR      | -43, 01, 00, 17                   | 4,5   |
 * |                                 |     | RRR     | -043, 001, 123, 999, -999         | 4,5   |
 * |                                 |     | RRRR    | -0043, 0001, 2017, 9999, -9999    | 4,5   |
 * |                                 |     | RRRRR   | ...                               | 2,4,5 |
 * | Extended year                   | 130 | u       | -43, 1, 1900, 2017, 9999, -999    | 4     |
 * |                                 |     | uu      | -43, 01, 99, -99                  | 4     |
 * |                                 |     | uuu     | -043, 001, 123, 999, -999         | 4     |
 * |                                 |     | uuuu    | -0043, 0001, 2017, 9999, -9999    | 4     |
 * |                                 |     | uuuuu   | ...                               | 2,4   |
 * | Quarter (formatting)            | 120 | Q       | 1, 2, 3, 4                        |       |
 * |                                 |     | Qo      | 1st, 2nd, 3rd, 4th                | 5     |
 * |                                 |     | QQ      | 01, 02, 03, 04                    |       |
 * |                                 |     | QQQ     | Q1, Q2, Q3, Q4                    |       |
 * |                                 |     | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 |     | QQQQQ   | 1, 2, 3, 4                        | 4     |
 * | Quarter (stand-alone)           | 120 | q       | 1, 2, 3, 4                        |       |
 * |                                 |     | qo      | 1st, 2nd, 3rd, 4th                | 5     |
 * |                                 |     | qq      | 01, 02, 03, 04                    |       |
 * |                                 |     | qqq     | Q1, Q2, Q3, Q4                    |       |
 * |                                 |     | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 |     | qqqqq   | 1, 2, 3, 4                        | 3     |
 * | Month (formatting)              | 110 | M       | 1, 2, ..., 12                     |       |
 * |                                 |     | Mo      | 1st, 2nd, ..., 12th               | 5     |
 * |                                 |     | MM      | 01, 02, ..., 12                   |       |
 * |                                 |     | MMM     | Jan, Feb, ..., Dec                |       |
 * |                                 |     | MMMM    | January, February, ..., December  | 2     |
 * |                                 |     | MMMMM   | J, F, ..., D                      |       |
 * | Month (stand-alone)             | 110 | L       | 1, 2, ..., 12                     |       |
 * |                                 |     | Lo      | 1st, 2nd, ..., 12th               | 5     |
 * |                                 |     | LL      | 01, 02, ..., 12                   |       |
 * |                                 |     | LLL     | Jan, Feb, ..., Dec                |       |
 * |                                 |     | LLLL    | January, February, ..., December  | 2     |
 * |                                 |     | LLLLL   | J, F, ..., D                      |       |
 * | Local week of year              | 100 | w       | 1, 2, ..., 53                     |       |
 * |                                 |     | wo      | 1st, 2nd, ..., 53th               | 5     |
 * |                                 |     | ww      | 01, 02, ..., 53                   |       |
 * | ISO week of year                | 100 | I       | 1, 2, ..., 53                     | 5     |
 * |                                 |     | Io      | 1st, 2nd, ..., 53th               | 5     |
 * |                                 |     | II      | 01, 02, ..., 53                   | 5     |
 * | Day of month                    |  90 | d       | 1, 2, ..., 31                     |       |
 * |                                 |     | do      | 1st, 2nd, ..., 31st               | 5     |
 * |                                 |     | dd      | 01, 02, ..., 31                   |       |
 * | Day of year                     |  90 | D       | 1, 2, ..., 365, 366               | 7     |
 * |                                 |     | Do      | 1st, 2nd, ..., 365th, 366th       | 5     |
 * |                                 |     | DD      | 01, 02, ..., 365, 366             | 7     |
 * |                                 |     | DDD     | 001, 002, ..., 365, 366           |       |
 * |                                 |     | DDDD    | ...                               | 2     |
 * | Day of week (formatting)        |  90 | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 |     | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 |     | EEEEE   | M, T, W, T, F, S, S               |       |
 * |                                 |     | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | ISO day of week (formatting)    |  90 | i       | 1, 2, 3, ..., 7                   | 5     |
 * |                                 |     | io      | 1st, 2nd, ..., 7th                | 5     |
 * |                                 |     | ii      | 01, 02, ..., 07                   | 5     |
 * |                                 |     | iii     | Mon, Tue, Wed, ..., Sun           | 5     |
 * |                                 |     | iiii    | Monday, Tuesday, ..., Sunday      | 2,5   |
 * |                                 |     | iiiii   | M, T, W, T, F, S, S               | 5     |
 * |                                 |     | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 5     |
 * | Local day of week (formatting)  |  90 | e       | 2, 3, 4, ..., 1                   |       |
 * |                                 |     | eo      | 2nd, 3rd, ..., 1st                | 5     |
 * |                                 |     | ee      | 02, 03, ..., 01                   |       |
 * |                                 |     | eee     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 |     | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 |     | eeeee   | M, T, W, T, F, S, S               |       |
 * |                                 |     | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | Local day of week (stand-alone) |  90 | c       | 2, 3, 4, ..., 1                   |       |
 * |                                 |     | co      | 2nd, 3rd, ..., 1st                | 5     |
 * |                                 |     | cc      | 02, 03, ..., 01                   |       |
 * |                                 |     | ccc     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 |     | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 |     | ccccc   | M, T, W, T, F, S, S               |       |
 * |                                 |     | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | AM, PM                          |  80 | a..aaa  | AM, PM                            |       |
 * |                                 |     | aaaa    | a.m., p.m.                        | 2     |
 * |                                 |     | aaaaa   | a, p                              |       |
 * | AM, PM, noon, midnight          |  80 | b..bbb  | AM, PM, noon, midnight            |       |
 * |                                 |     | bbbb    | a.m., p.m., noon, midnight        | 2     |
 * |                                 |     | bbbbb   | a, p, n, mi                       |       |
 * | Flexible day period             |  80 | B..BBB  | at night, in the morning, ...     |       |
 * |                                 |     | BBBB    | at night, in the morning, ...     | 2     |
 * |                                 |     | BBBBB   | at night, in the morning, ...     |       |
 * | Hour [1-12]                     |  70 | h       | 1, 2, ..., 11, 12                 |       |
 * |                                 |     | ho      | 1st, 2nd, ..., 11th, 12th         | 5     |
 * |                                 |     | hh      | 01, 02, ..., 11, 12               |       |
 * | Hour [0-23]                     |  70 | H       | 0, 1, 2, ..., 23                  |       |
 * |                                 |     | Ho      | 0th, 1st, 2nd, ..., 23rd          | 5     |
 * |                                 |     | HH      | 00, 01, 02, ..., 23               |       |
 * | Hour [0-11]                     |  70 | K       | 1, 2, ..., 11, 0                  |       |
 * |                                 |     | Ko      | 1st, 2nd, ..., 11th, 0th          | 5     |
 * |                                 |     | KK      | 01, 02, ..., 11, 00               |       |
 * | Hour [1-24]                     |  70 | k       | 24, 1, 2, ..., 23                 |       |
 * |                                 |     | ko      | 24th, 1st, 2nd, ..., 23rd         | 5     |
 * |                                 |     | kk      | 24, 01, 02, ..., 23               |       |
 * | Minute                          |  60 | m       | 0, 1, ..., 59                     |       |
 * |                                 |     | mo      | 0th, 1st, ..., 59th               | 5     |
 * |                                 |     | mm      | 00, 01, ..., 59                   |       |
 * | Second                          |  50 | s       | 0, 1, ..., 59                     |       |
 * |                                 |     | so      | 0th, 1st, ..., 59th               | 5     |
 * |                                 |     | ss      | 00, 01, ..., 59                   |       |
 * | Seconds timestamp               |  40 | t       | 512969520                         |       |
 * |                                 |     | tt      | ...                               | 2     |
 * | Fraction of second              |  30 | S       | 0, 1, ..., 9                      |       |
 * |                                 |     | SS      | 00, 01, ..., 99                   |       |
 * |                                 |     | SSS     | 000, 001, ..., 999                |       |
 * |                                 |     | SSSS    | ...                               | 2     |
 * | Milliseconds timestamp          |  20 | T       | 512969520900                      |       |
 * |                                 |     | TT      | ...                               | 2     |
 * | Timezone (ISO-8601 w/ Z)        |  10 | X       | -08, +0530, Z                     |       |
 * |                                 |     | XX      | -0800, +0530, Z                   |       |
 * |                                 |     | XXX     | -08:00, +05:30, Z                 |       |
 * |                                 |     | XXXX    | -0800, +0530, Z, +123456          | 2     |
 * |                                 |     | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
 * | Timezone (ISO-8601 w/o Z)       |  10 | x       | -08, +0530, +00                   |       |
 * |                                 |     | xx      | -0800, +0530, +0000               |       |
 * |                                 |     | xxx     | -08:00, +05:30, +00:00            | 2     |
 * |                                 |     | xxxx    | -0800, +0530, +0000, +123456      |       |
 * |                                 |     | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
 * | Long localized date             |  NA | P       | 05/29/1453                        | 5,8   |
 * |                                 |     | PP      | May 29, 1453                      |       |
 * |                                 |     | PPP     | May 29th, 1453                    |       |
 * |                                 |     | PPPP    | Sunday, May 29th, 1453            | 2,5,8 |
 * | Long localized time             |  NA | p       | 12:00 AM                          | 5,8   |
 * |                                 |     | pp      | 12:00:00 AM                       |       |
 * | Combination of date and time    |  NA | Pp      | 05/29/1453, 12:00 AM              |       |
 * |                                 |     | PPpp    | May 29, 1453, 12:00:00 AM         |       |
 * |                                 |     | PPPpp   | May 29th, 1453 at ...             |       |
 * |                                 |     | PPPPpp  | Sunday, May 29th, 1453 at ...     | 2,5,8 |
 * Notes:
 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
 *    are the same as "stand-alone" units, but are different in some languages.
 *    "Formatting" units are declined according to the rules of the language
 *    in the context of a date. "Stand-alone" units are always nominative singular.
 *    In `format` function, they will produce different result:
 *
 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
 *
 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
 *
 *    `parse` will try to match both formatting and stand-alone units interchangeably.
 *
 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
 *    the single quote characters (see below).
 *    If the sequence is longer than listed in table:
 *    - for numerical units (`yyyyyyyy`) `parse` will try to match a number
 *      as wide as the sequence
 *    - for text units (`MMMMMMMM`) `parse` will try to match the widest variation of the unit.
 *      These variations are marked with "2" in the last column of the table.
 *
 * 3. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
 *    These tokens represent the shortest form of the quarter.
 *
 * 4. The main difference between `y` and `u` patterns are B.C. years:
 *
 *    | Year | `y` | `u` |
 *    |------|-----|-----|
 *    | AC 1 |   1 |   1 |
 *    | BC 1 |   1 |   0 |
 *    | BC 2 |   2 |  -1 |
 *
 *    Also `yy` will try to guess the century of two digit year by proximity with `referenceDate`:
 *
 *    `parse('50', 'yy', new Date(2018, 0, 1)) //=> Sat Jan 01 2050 00:00:00`
 *
 *    `parse('75', 'yy', new Date(2018, 0, 1)) //=> Wed Jan 01 1975 00:00:00`
 *
 *    while `uu` will just assign the year as is:
 *
 *    `parse('50', 'uu', new Date(2018, 0, 1)) //=> Sat Jan 01 0050 00:00:00`
 *
 *    `parse('75', 'uu', new Date(2018, 0, 1)) //=> Tue Jan 01 0075 00:00:00`
 *
 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
 *    except local week-numbering years are dependent on `options.weekStartsOn`
 *    and `options.firstWeekContainsDate` (compare [setISOWeekYear](https://date-fns.org/docs/setISOWeekYear)
 *    and [setWeekYear](https://date-fns.org/docs/setWeekYear)).
 *
 * 5. These patterns are not in the Unicode Technical Standard #35:
 *    - `i`: ISO day of week
 *    - `I`: ISO week of year
 *    - `R`: ISO week-numbering year
 *    - `o`: ordinal number modifier
 *    - `P`: long localized date
 *    - `p`: long localized time
 *
 * 6. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
 *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * 7. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
 *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * 8. `P+` tokens do not have a defined priority since they are merely aliases to other tokens based
 *    on the given locale.
 *
 *    using `en-US` locale: `P` => `MM/dd/yyyy`
 *    using `en-US` locale: `p` => `hh:mm a`
 *    using `pt-BR` locale: `P` => `dd/MM/yyyy`
 *    using `pt-BR` locale: `p` => `HH:mm`
 *
 * Values will be assigned to the date in the descending order of its unit's priority.
 * Units of an equal priority overwrite each other in the order of appearance.
 *
 * If no values of higher priority are parsed (e.g. when parsing string 'January 1st' without a year),
 * the values will be taken from 3rd argument `referenceDate` which works as a context of parsing.
 *
 * `referenceDate` must be passed for correct work of the function.
 * If you're not sure which `referenceDate` to supply, create a new instance of Date:
 * `parse('02/11/2014', 'MM/dd/yyyy', new Date())`
 * In this case parsing will be done in the context of the current date.
 * If `referenceDate` is `Invalid Date` or a value not convertible to valid `Date`,
 * then `Invalid Date` will be returned.
 *
 * The result may vary by locale.
 *
 * If `formatString` matches with `dateString` but does not provides tokens, `referenceDate` will be returned.
 *
 * If parsing failed, `Invalid Date` will be returned.
 * Invalid Date is a Date, whose time value is NaN.
 * Time value of Date: http://es5.github.io/#x15.9.1.1
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param dateStr - The string to parse
 * @param formatStr - The string of tokens
 * @param referenceDate - defines values missing from the parsed dateString
 * @param options - An object with options.
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * @returns The parsed date
 *
 * @throws `options.locale` must contain `match` property
 * @throws use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws format string contains an unescaped latin alphabet character
 *
 * @example
 * // Parse 11 February 2014 from middle-endian format:
 * var result = parse('02/11/2014', 'MM/dd/yyyy', new Date())
 * //=> Tue Feb 11 2014 00:00:00
 *
 * @example
 * // Parse 28th of February in Esperanto locale in the context of 2010 year:
 * import eo from 'date-fns/locale/eo'
 * var result = parse('28-a de februaro', "do 'de' MMMM", new Date(2010, 0, 1), {
 *   locale: eo
 * })
 * //=> Sun Feb 28 2010 00:00:00
 */
function parse(dateStr, formatStr, referenceDate, options) {
  const invalidDate = () => (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_2__.constructFrom)(options?.in || referenceDate, NaN);
  const defaultOptions = (0,_getDefaultOptions_js__WEBPACK_IMPORTED_MODULE_3__.getDefaultOptions)();
  const locale = options?.locale ?? defaultOptions.locale ?? _lib_defaultLocale_js__WEBPACK_IMPORTED_MODULE_4__.enUS;

  const firstWeekContainsDate =
    options?.firstWeekContainsDate ??
    options?.locale?.options?.firstWeekContainsDate ??
    defaultOptions.firstWeekContainsDate ??
    defaultOptions.locale?.options?.firstWeekContainsDate ??
    1;

  const weekStartsOn =
    options?.weekStartsOn ??
    options?.locale?.options?.weekStartsOn ??
    defaultOptions.weekStartsOn ??
    defaultOptions.locale?.options?.weekStartsOn ??
    0;

  if (!formatStr)
    return dateStr ? invalidDate() : (0,_toDate_js__WEBPACK_IMPORTED_MODULE_5__.toDate)(referenceDate, options?.in);

  const subFnOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale,
  };

  // If timezone isn't specified, it will try to use the context or
  // the reference date and fallback to the system time zone.
  const setters = [new _parse_lib_Setter_js__WEBPACK_IMPORTED_MODULE_6__.DateTimezoneSetter(options?.in, referenceDate)];

  const tokens = formatStr
    .match(longFormattingTokensRegExp)
    .map((substring) => {
      const firstCharacter = substring[0];
      if (firstCharacter in _lib_format_longFormatters_js__WEBPACK_IMPORTED_MODULE_0__.longFormatters) {
        const longFormatter = _lib_format_longFormatters_js__WEBPACK_IMPORTED_MODULE_0__.longFormatters[firstCharacter];
        return longFormatter(substring, locale.formatLong);
      }
      return substring;
    })
    .join("")
    .match(formattingTokensRegExp);

  const usedTokens = [];

  for (let token of tokens) {
    if (
      !options?.useAdditionalWeekYearTokens &&
      (0,_lib_protectedTokens_js__WEBPACK_IMPORTED_MODULE_7__.isProtectedWeekYearToken)(token)
    ) {
      (0,_lib_protectedTokens_js__WEBPACK_IMPORTED_MODULE_7__.warnOrThrowProtectedError)(token, formatStr, dateStr);
    }
    if (
      !options?.useAdditionalDayOfYearTokens &&
      (0,_lib_protectedTokens_js__WEBPACK_IMPORTED_MODULE_7__.isProtectedDayOfYearToken)(token)
    ) {
      (0,_lib_protectedTokens_js__WEBPACK_IMPORTED_MODULE_7__.warnOrThrowProtectedError)(token, formatStr, dateStr);
    }

    const firstCharacter = token[0];
    const parser = _parse_lib_parsers_js__WEBPACK_IMPORTED_MODULE_1__.parsers[firstCharacter];
    if (parser) {
      const { incompatibleTokens } = parser;
      if (Array.isArray(incompatibleTokens)) {
        const incompatibleToken = usedTokens.find(
          (usedToken) =>
            incompatibleTokens.includes(usedToken.token) ||
            usedToken.token === firstCharacter,
        );
        if (incompatibleToken) {
          throw new RangeError(
            `The format string mustn't contain \`${incompatibleToken.fullToken}\` and \`${token}\` at the same time`,
          );
        }
      } else if (parser.incompatibleTokens === "*" && usedTokens.length > 0) {
        throw new RangeError(
          `The format string mustn't contain \`${token}\` and any other token at the same time`,
        );
      }

      usedTokens.push({ token: firstCharacter, fullToken: token });

      const parseResult = parser.run(
        dateStr,
        token,
        locale.match,
        subFnOptions,
      );

      if (!parseResult) {
        return invalidDate();
      }

      setters.push(parseResult.setter);

      dateStr = parseResult.rest;
    } else {
      if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" +
            firstCharacter +
            "`",
        );
      }

      // Replace two single quote characters with one single quote character
      if (token === "''") {
        token = "'";
      } else if (firstCharacter === "'") {
        token = cleanEscapedString(token);
      }

      // Cut token from string, or, if string doesn't match the token, return Invalid Date
      if (dateStr.indexOf(token) === 0) {
        dateStr = dateStr.slice(token.length);
      } else {
        return invalidDate();
      }
    }
  }

  // Check if the remaining input contains something other than whitespace
  if (dateStr.length > 0 && notWhitespaceRegExp.test(dateStr)) {
    return invalidDate();
  }

  const uniquePrioritySetters = setters
    .map((setter) => setter.priority)
    .sort((a, b) => b - a)
    .filter((priority, index, array) => array.indexOf(priority) === index)
    .map((priority) =>
      setters
        .filter((setter) => setter.priority === priority)
        .sort((a, b) => b.subPriority - a.subPriority),
    )
    .map((setterArray) => setterArray[0]);

  let date = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_5__.toDate)(referenceDate, options?.in);

  if (isNaN(+date)) return invalidDate();

  const flags = {};
  for (const setter of uniquePrioritySetters) {
    if (!setter.validate(date, subFnOptions)) {
      return invalidDate();
    }

    const result = setter.set(date, flags, subFnOptions);
    // Result is tuple (date, flags)
    if (Array.isArray(result)) {
      date = result[0];
      Object.assign(flags, result[1]);
      // Result is date
    } else {
      date = result;
    }
  }

  return date;
}

function cleanEscapedString(input) {
  return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (parse);


/***/ }),
/* 52 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "longFormatters": () => (/* binding */ longFormatters)
/* harmony export */ });
const dateLongFormatter = (pattern, formatLong) => {
  switch (pattern) {
    case "P":
      return formatLong.date({ width: "short" });
    case "PP":
      return formatLong.date({ width: "medium" });
    case "PPP":
      return formatLong.date({ width: "long" });
    case "PPPP":
    default:
      return formatLong.date({ width: "full" });
  }
};

const timeLongFormatter = (pattern, formatLong) => {
  switch (pattern) {
    case "p":
      return formatLong.time({ width: "short" });
    case "pp":
      return formatLong.time({ width: "medium" });
    case "ppp":
      return formatLong.time({ width: "long" });
    case "pppp":
    default:
      return formatLong.time({ width: "full" });
  }
};

const dateTimeLongFormatter = (pattern, formatLong) => {
  const matchResult = pattern.match(/(P+)(p+)?/) || [];
  const datePattern = matchResult[1];
  const timePattern = matchResult[2];

  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong);
  }

  let dateTimeFormat;

  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong.dateTime({ width: "short" });
      break;
    case "PP":
      dateTimeFormat = formatLong.dateTime({ width: "medium" });
      break;
    case "PPP":
      dateTimeFormat = formatLong.dateTime({ width: "long" });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong.dateTime({ width: "full" });
      break;
  }

  return dateTimeFormat
    .replace("{{date}}", dateLongFormatter(datePattern, formatLong))
    .replace("{{time}}", timeLongFormatter(timePattern, formatLong));
};

const longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter,
};


/***/ }),
/* 53 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "parsers": () => (/* binding */ parsers)
/* harmony export */ });
/* harmony import */ var _parsers_EraParser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(54);
/* harmony import */ var _parsers_YearParser_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(60);
/* harmony import */ var _parsers_LocalWeekYearParser_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(63);
/* harmony import */ var _parsers_ISOWeekYearParser_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(68);
/* harmony import */ var _parsers_ExtendedYearParser_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(70);
/* harmony import */ var _parsers_QuarterParser_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(71);
/* harmony import */ var _parsers_StandAloneQuarterParser_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(72);
/* harmony import */ var _parsers_MonthParser_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(73);
/* harmony import */ var _parsers_StandAloneMonthParser_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(74);
/* harmony import */ var _parsers_LocalWeekParser_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(75);
/* harmony import */ var _parsers_ISOWeekParser_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(79);
/* harmony import */ var _parsers_DateParser_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(84);
/* harmony import */ var _parsers_DayOfYearParser_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(85);
/* harmony import */ var _parsers_DayParser_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(86);
/* harmony import */ var _parsers_LocalDayParser_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(89);
/* harmony import */ var _parsers_StandAloneLocalDayParser_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(90);
/* harmony import */ var _parsers_ISODayParser_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(91);
/* harmony import */ var _parsers_AMPMParser_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(94);
/* harmony import */ var _parsers_AMPMMidnightParser_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(95);
/* harmony import */ var _parsers_DayPeriodParser_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(96);
/* harmony import */ var _parsers_Hour1to12Parser_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(97);
/* harmony import */ var _parsers_Hour0to23Parser_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(98);
/* harmony import */ var _parsers_Hour0To11Parser_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(99);
/* harmony import */ var _parsers_Hour1To24Parser_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(100);
/* harmony import */ var _parsers_MinuteParser_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(101);
/* harmony import */ var _parsers_SecondParser_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(102);
/* harmony import */ var _parsers_FractionOfSecondParser_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(103);
/* harmony import */ var _parsers_ISOTimezoneWithZParser_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(104);
/* harmony import */ var _parsers_ISOTimezoneParser_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(106);
/* harmony import */ var _parsers_TimestampSecondsParser_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(107);
/* harmony import */ var _parsers_TimestampMillisecondsParser_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(108);
































/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* | Milliseconds in day            |
 * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
 * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
 * |  d  | Day of month                   |  D  | Day of year                    |
 * |  e  | Local day of week              |  E  | Day of week                    |
 * |  f  |                                |  F* | Day of week in month           |
 * |  g* | Modified Julian day            |  G  | Era                            |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  i! | ISO day of week                |  I! | ISO week of year               |
 * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
 * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
 * |  l* | (deprecated)                   |  L  | Stand-alone month              |
 * |  m  | Minute                         |  M  | Month                          |
 * |  n  |                                |  N  |                                |
 * |  o! | Ordinal number modifier        |  O* | Timezone (GMT)                 |
 * |  p  |                                |  P  |                                |
 * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
 * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
 * |  u  | Extended year                  |  U* | Cyclic year                    |
 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
 * |  w  | Local week of year             |  W* | Week of month                  |
 * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
 * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
 * |  z* | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 *
 * Letters marked by ! are non-standard, but implemented by date-fns:
 * - `o` modifies the previous token to turn it into an ordinal (see `parse` docs)
 * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
 *   i.e. 7 for Sunday, 1 for Monday, etc.
 * - `I` is ISO week of year, as opposed to `w` which is local week of year.
 * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
 *   `R` is supposed to be used in conjunction with `I` and `i`
 *   for universal ISO week-numbering date, whereas
 *   `Y` is supposed to be used in conjunction with `w` and `e`
 *   for week-numbering date specific to the locale.
 */
const parsers = {
  G: new _parsers_EraParser_js__WEBPACK_IMPORTED_MODULE_0__.EraParser(),
  y: new _parsers_YearParser_js__WEBPACK_IMPORTED_MODULE_1__.YearParser(),
  Y: new _parsers_LocalWeekYearParser_js__WEBPACK_IMPORTED_MODULE_2__.LocalWeekYearParser(),
  R: new _parsers_ISOWeekYearParser_js__WEBPACK_IMPORTED_MODULE_3__.ISOWeekYearParser(),
  u: new _parsers_ExtendedYearParser_js__WEBPACK_IMPORTED_MODULE_4__.ExtendedYearParser(),
  Q: new _parsers_QuarterParser_js__WEBPACK_IMPORTED_MODULE_5__.QuarterParser(),
  q: new _parsers_StandAloneQuarterParser_js__WEBPACK_IMPORTED_MODULE_6__.StandAloneQuarterParser(),
  M: new _parsers_MonthParser_js__WEBPACK_IMPORTED_MODULE_7__.MonthParser(),
  L: new _parsers_StandAloneMonthParser_js__WEBPACK_IMPORTED_MODULE_8__.StandAloneMonthParser(),
  w: new _parsers_LocalWeekParser_js__WEBPACK_IMPORTED_MODULE_9__.LocalWeekParser(),
  I: new _parsers_ISOWeekParser_js__WEBPACK_IMPORTED_MODULE_10__.ISOWeekParser(),
  d: new _parsers_DateParser_js__WEBPACK_IMPORTED_MODULE_11__.DateParser(),
  D: new _parsers_DayOfYearParser_js__WEBPACK_IMPORTED_MODULE_12__.DayOfYearParser(),
  E: new _parsers_DayParser_js__WEBPACK_IMPORTED_MODULE_13__.DayParser(),
  e: new _parsers_LocalDayParser_js__WEBPACK_IMPORTED_MODULE_14__.LocalDayParser(),
  c: new _parsers_StandAloneLocalDayParser_js__WEBPACK_IMPORTED_MODULE_15__.StandAloneLocalDayParser(),
  i: new _parsers_ISODayParser_js__WEBPACK_IMPORTED_MODULE_16__.ISODayParser(),
  a: new _parsers_AMPMParser_js__WEBPACK_IMPORTED_MODULE_17__.AMPMParser(),
  b: new _parsers_AMPMMidnightParser_js__WEBPACK_IMPORTED_MODULE_18__.AMPMMidnightParser(),
  B: new _parsers_DayPeriodParser_js__WEBPACK_IMPORTED_MODULE_19__.DayPeriodParser(),
  h: new _parsers_Hour1to12Parser_js__WEBPACK_IMPORTED_MODULE_20__.Hour1to12Parser(),
  H: new _parsers_Hour0to23Parser_js__WEBPACK_IMPORTED_MODULE_21__.Hour0to23Parser(),
  K: new _parsers_Hour0To11Parser_js__WEBPACK_IMPORTED_MODULE_22__.Hour0To11Parser(),
  k: new _parsers_Hour1To24Parser_js__WEBPACK_IMPORTED_MODULE_23__.Hour1To24Parser(),
  m: new _parsers_MinuteParser_js__WEBPACK_IMPORTED_MODULE_24__.MinuteParser(),
  s: new _parsers_SecondParser_js__WEBPACK_IMPORTED_MODULE_25__.SecondParser(),
  S: new _parsers_FractionOfSecondParser_js__WEBPACK_IMPORTED_MODULE_26__.FractionOfSecondParser(),
  X: new _parsers_ISOTimezoneWithZParser_js__WEBPACK_IMPORTED_MODULE_27__.ISOTimezoneWithZParser(),
  x: new _parsers_ISOTimezoneParser_js__WEBPACK_IMPORTED_MODULE_28__.ISOTimezoneParser(),
  t: new _parsers_TimestampSecondsParser_js__WEBPACK_IMPORTED_MODULE_29__.TimestampSecondsParser(),
  T: new _parsers_TimestampMillisecondsParser_js__WEBPACK_IMPORTED_MODULE_30__.TimestampMillisecondsParser(),
};


/***/ }),
/* 54 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EraParser": () => (/* binding */ EraParser)
/* harmony export */ });
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);


class EraParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 140;

  parse(dateString, token, match) {
    switch (token) {
      // AD, BC
      case "G":
      case "GG":
      case "GGG":
        return (
          match.era(dateString, { width: "abbreviated" }) ||
          match.era(dateString, { width: "narrow" })
        );

      // A, B
      case "GGGGG":
        return match.era(dateString, { width: "narrow" });
      // Anno Domini, Before Christ
      case "GGGG":
      default:
        return (
          match.era(dateString, { width: "wide" }) ||
          match.era(dateString, { width: "abbreviated" }) ||
          match.era(dateString, { width: "narrow" })
        );
    }
  }

  set(date, flags, value) {
    flags.era = value;
    date.setFullYear(value, 0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  incompatibleTokens = ["R", "u", "t", "T"];
}


/***/ }),
/* 55 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Parser": () => (/* binding */ Parser)
/* harmony export */ });
/* harmony import */ var _Setter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(56);


class Parser {
  run(dateString, token, match, options) {
    const result = this.parse(dateString, token, match, options);
    if (!result) {
      return null;
    }

    return {
      setter: new _Setter_js__WEBPACK_IMPORTED_MODULE_0__.ValueSetter(
        result.value,
        this.validate,
        this.set,
        this.priority,
        this.subPriority,
      ),
      rest: result.rest,
    };
  }

  validate(_utcDate, _value, _options) {
    return true;
  }
}


/***/ }),
/* 56 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DateTimezoneSetter": () => (/* binding */ DateTimezoneSetter),
/* harmony export */   "Setter": () => (/* binding */ Setter),
/* harmony export */   "ValueSetter": () => (/* binding */ ValueSetter)
/* harmony export */ });
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(57);
/* harmony import */ var _transpose_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(59);



const TIMEZONE_UNIT_PRIORITY = 10;

class Setter {
  subPriority = 0;

  validate(_utcDate, _options) {
    return true;
  }
}

class ValueSetter extends Setter {
  constructor(
    value,

    validateValue,

    setValue,

    priority,
    subPriority,
  ) {
    super();
    this.value = value;
    this.validateValue = validateValue;
    this.setValue = setValue;
    this.priority = priority;
    if (subPriority) {
      this.subPriority = subPriority;
    }
  }

  validate(date, options) {
    return this.validateValue(date, this.value, options);
  }

  set(date, flags, options) {
    return this.setValue(date, flags, this.value, options);
  }
}

class DateTimezoneSetter extends Setter {
  priority = TIMEZONE_UNIT_PRIORITY;
  subPriority = -1;

  constructor(context, reference) {
    super();
    this.context = context || ((date) => (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_0__.constructFrom)(reference, date));
  }

  set(date, flags) {
    if (flags.timestampIsSet) return date;
    return (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_0__.constructFrom)(date, (0,_transpose_js__WEBPACK_IMPORTED_MODULE_1__.transpose)(date, this.context));
  }
}


/***/ }),
/* 57 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "constructFrom": () => (/* binding */ constructFrom),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(58);


/**
 * @name constructFrom
 * @category Generic Helpers
 * @summary Constructs a date using the reference date and the value
 *
 * @description
 * The function constructs a new date using the constructor from the reference
 * date and the given value. It helps to build generic functions that accept
 * date extensions.
 *
 * It defaults to `Date` if the passed reference date is a number or a string.
 *
 * Starting from v3.7.0, it allows to construct a date using `[Symbol.for("constructDateFrom")]`
 * enabling to transfer extra properties from the reference date to the new date.
 * It's useful for extensions like [`TZDate`](https://github.com/date-fns/tz)
 * that accept a time zone as a constructor argument.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The reference date to take constructor from
 * @param value - The value to create the date
 *
 * @returns Date initialized using the given date and value
 *
 * @example
 * import { constructFrom } from "./constructFrom/date-fns";
 *
 * // A function that clones a date preserving the original type
 * function cloneDate<DateType extends Date>(date: DateType): DateType {
 *   return constructFrom(
 *     date, // Use constructor from the given date
 *     date.getTime() // Use the date value to create a new date
 *   );
 * }
 */
function constructFrom(date, value) {
  if (typeof date === "function") return date(value);

  if (date && typeof date === "object" && _constants_js__WEBPACK_IMPORTED_MODULE_0__.constructFromSymbol in date)
    return date[_constants_js__WEBPACK_IMPORTED_MODULE_0__.constructFromSymbol](value);

  if (date instanceof Date) return new date.constructor(value);

  return new Date(value);
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (constructFrom);


/***/ }),
/* 58 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "constructFromSymbol": () => (/* binding */ constructFromSymbol),
/* harmony export */   "daysInWeek": () => (/* binding */ daysInWeek),
/* harmony export */   "daysInYear": () => (/* binding */ daysInYear),
/* harmony export */   "maxTime": () => (/* binding */ maxTime),
/* harmony export */   "millisecondsInDay": () => (/* binding */ millisecondsInDay),
/* harmony export */   "millisecondsInHour": () => (/* binding */ millisecondsInHour),
/* harmony export */   "millisecondsInMinute": () => (/* binding */ millisecondsInMinute),
/* harmony export */   "millisecondsInSecond": () => (/* binding */ millisecondsInSecond),
/* harmony export */   "millisecondsInWeek": () => (/* binding */ millisecondsInWeek),
/* harmony export */   "minTime": () => (/* binding */ minTime),
/* harmony export */   "minutesInDay": () => (/* binding */ minutesInDay),
/* harmony export */   "minutesInHour": () => (/* binding */ minutesInHour),
/* harmony export */   "minutesInMonth": () => (/* binding */ minutesInMonth),
/* harmony export */   "minutesInYear": () => (/* binding */ minutesInYear),
/* harmony export */   "monthsInQuarter": () => (/* binding */ monthsInQuarter),
/* harmony export */   "monthsInYear": () => (/* binding */ monthsInYear),
/* harmony export */   "quartersInYear": () => (/* binding */ quartersInYear),
/* harmony export */   "secondsInDay": () => (/* binding */ secondsInDay),
/* harmony export */   "secondsInHour": () => (/* binding */ secondsInHour),
/* harmony export */   "secondsInMinute": () => (/* binding */ secondsInMinute),
/* harmony export */   "secondsInMonth": () => (/* binding */ secondsInMonth),
/* harmony export */   "secondsInQuarter": () => (/* binding */ secondsInQuarter),
/* harmony export */   "secondsInWeek": () => (/* binding */ secondsInWeek),
/* harmony export */   "secondsInYear": () => (/* binding */ secondsInYear)
/* harmony export */ });
/**
 * @module constants
 * @summary Useful constants
 * @description
 * Collection of useful date constants.
 *
 * The constants could be imported from `date-fns/constants`:
 *
 * ```ts
 * import { maxTime, minTime } from "./constants/date-fns/constants";
 *
 * function isAllowedTime(time) {
 *   return time <= maxTime && time >= minTime;
 * }
 * ```
 */

/**
 * @constant
 * @name daysInWeek
 * @summary Days in 1 week.
 */
const daysInWeek = 7;

/**
 * @constant
 * @name daysInYear
 * @summary Days in 1 year.
 *
 * @description
 * How many days in a year.
 *
 * One years equals 365.2425 days according to the formula:
 *
 * > Leap year occurs every 4 years, except for years that are divisible by 100 and not divisible by 400.
 * > 1 mean year = (365+1/4-1/100+1/400) days = 365.2425 days
 */
const daysInYear = 365.2425;

/**
 * @constant
 * @name maxTime
 * @summary Maximum allowed time.
 *
 * @example
 * import { maxTime } from "./constants/date-fns/constants";
 *
 * const isValid = 8640000000000001 <= maxTime;
 * //=> false
 *
 * new Date(8640000000000001);
 * //=> Invalid Date
 */
const maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1000;

/**
 * @constant
 * @name minTime
 * @summary Minimum allowed time.
 *
 * @example
 * import { minTime } from "./constants/date-fns/constants";
 *
 * const isValid = -8640000000000001 >= minTime;
 * //=> false
 *
 * new Date(-8640000000000001)
 * //=> Invalid Date
 */
const minTime = -maxTime;

/**
 * @constant
 * @name millisecondsInWeek
 * @summary Milliseconds in 1 week.
 */
const millisecondsInWeek = 604800000;

/**
 * @constant
 * @name millisecondsInDay
 * @summary Milliseconds in 1 day.
 */
const millisecondsInDay = 86400000;

/**
 * @constant
 * @name millisecondsInMinute
 * @summary Milliseconds in 1 minute
 */
const millisecondsInMinute = 60000;

/**
 * @constant
 * @name millisecondsInHour
 * @summary Milliseconds in 1 hour
 */
const millisecondsInHour = 3600000;

/**
 * @constant
 * @name millisecondsInSecond
 * @summary Milliseconds in 1 second
 */
const millisecondsInSecond = 1000;

/**
 * @constant
 * @name minutesInYear
 * @summary Minutes in 1 year.
 */
const minutesInYear = 525600;

/**
 * @constant
 * @name minutesInMonth
 * @summary Minutes in 1 month.
 */
const minutesInMonth = 43200;

/**
 * @constant
 * @name minutesInDay
 * @summary Minutes in 1 day.
 */
const minutesInDay = 1440;

/**
 * @constant
 * @name minutesInHour
 * @summary Minutes in 1 hour.
 */
const minutesInHour = 60;

/**
 * @constant
 * @name monthsInQuarter
 * @summary Months in 1 quarter.
 */
const monthsInQuarter = 3;

/**
 * @constant
 * @name monthsInYear
 * @summary Months in 1 year.
 */
const monthsInYear = 12;

/**
 * @constant
 * @name quartersInYear
 * @summary Quarters in 1 year
 */
const quartersInYear = 4;

/**
 * @constant
 * @name secondsInHour
 * @summary Seconds in 1 hour.
 */
const secondsInHour = 3600;

/**
 * @constant
 * @name secondsInMinute
 * @summary Seconds in 1 minute.
 */
const secondsInMinute = 60;

/**
 * @constant
 * @name secondsInDay
 * @summary Seconds in 1 day.
 */
const secondsInDay = secondsInHour * 24;

/**
 * @constant
 * @name secondsInWeek
 * @summary Seconds in 1 week.
 */
const secondsInWeek = secondsInDay * 7;

/**
 * @constant
 * @name secondsInYear
 * @summary Seconds in 1 year.
 */
const secondsInYear = secondsInDay * daysInYear;

/**
 * @constant
 * @name secondsInMonth
 * @summary Seconds in 1 month
 */
const secondsInMonth = secondsInYear / 12;

/**
 * @constant
 * @name secondsInQuarter
 * @summary Seconds in 1 quarter.
 */
const secondsInQuarter = secondsInMonth * 3;

/**
 * @constant
 * @name constructFromSymbol
 * @summary Symbol enabling Date extensions to inherit properties from the reference date.
 *
 * The symbol is used to enable the `constructFrom` function to construct a date
 * using a reference date and a value. It allows to transfer extra properties
 * from the reference date to the new date. It's useful for extensions like
 * [`TZDate`](https://github.com/date-fns/tz) that accept a time zone as
 * a constructor argument.
 */
const constructFromSymbol = Symbol.for("constructDateFrom");


/***/ }),
/* 59 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "transpose": () => (/* binding */ transpose)
/* harmony export */ });
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(57);


/**
 * @name transpose
 * @category Generic Helpers
 * @summary Transpose the date to the given constructor.
 *
 * @description
 * The function transposes the date to the given constructor. It helps you
 * to transpose the date in the system time zone to say `UTCDate` or any other
 * date extension.
 *
 * @typeParam InputDate - The input `Date` type derived from the passed argument.
 * @typeParam ResultDate - The result `Date` type derived from the passed constructor.
 *
 * @param date - The date to use values from
 * @param constructor - The date constructor to use
 *
 * @returns Date transposed to the given constructor
 *
 * @example
 * // Create July 10, 2022 00:00 in locale time zone
 * const date = new Date(2022, 6, 10)
 * //=> 'Sun Jul 10 2022 00:00:00 GMT+0800 (Singapore Standard Time)'
 *
 * @example
 * // Transpose the date to July 10, 2022 00:00 in UTC
 * transpose(date, UTCDate)
 * //=> 'Sun Jul 10 2022 00:00:00 GMT+0000 (Coordinated Universal Time)'
 */
function transpose(date, constructor) {
  const date_ = isConstructor(constructor)
    ? new constructor(0)
    : (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_0__.constructFrom)(constructor, 0);
  date_.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  date_.setHours(
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
  return date_;
}

function isConstructor(constructor) {
  return (
    typeof constructor === "function" &&
    constructor.prototype?.constructor === constructor
  );
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (transpose);


/***/ }),
/* 60 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "YearParser": () => (/* binding */ YearParser)
/* harmony export */ });
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);




// From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_Patterns
// | Year     |     y | yy |   yyy |  yyyy | yyyyy |
// |----------|-------|----|-------|-------|-------|
// | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
// | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
// | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
// | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
// | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
class YearParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 130;
  incompatibleTokens = ["Y", "R", "u", "w", "I", "i", "e", "c", "t", "T"];

  parse(dateString, token, match) {
    const valueCallback = (year) => ({
      year,
      isTwoDigitYear: token === "yy",
    });

    switch (token) {
      case "y":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(4, dateString), valueCallback);
      case "yo":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          match.ordinalNumber(dateString, {
            unit: "year",
          }),
          valueCallback,
        );
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString), valueCallback);
    }
  }

  validate(_date, value) {
    return value.isTwoDigitYear || value.year > 0;
  }

  set(date, flags, value) {
    const currentYear = date.getFullYear();

    if (value.isTwoDigitYear) {
      const normalizedTwoDigitYear = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.normalizeTwoDigitYear)(
        value.year,
        currentYear,
      );
      date.setFullYear(normalizedTwoDigitYear, 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    const year =
      !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
    date.setFullYear(year, 0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}


/***/ }),
/* 61 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "dayPeriodEnumToHours": () => (/* binding */ dayPeriodEnumToHours),
/* harmony export */   "isLeapYearIndex": () => (/* binding */ isLeapYearIndex),
/* harmony export */   "mapValue": () => (/* binding */ mapValue),
/* harmony export */   "normalizeTwoDigitYear": () => (/* binding */ normalizeTwoDigitYear),
/* harmony export */   "parseAnyDigitsSigned": () => (/* binding */ parseAnyDigitsSigned),
/* harmony export */   "parseNDigits": () => (/* binding */ parseNDigits),
/* harmony export */   "parseNDigitsSigned": () => (/* binding */ parseNDigitsSigned),
/* harmony export */   "parseNumericPattern": () => (/* binding */ parseNumericPattern),
/* harmony export */   "parseTimezonePattern": () => (/* binding */ parseTimezonePattern)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(58);
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(62);




function mapValue(parseFnResult, mapFn) {
  if (!parseFnResult) {
    return parseFnResult;
  }

  return {
    value: mapFn(parseFnResult.value),
    rest: parseFnResult.rest,
  };
}

function parseNumericPattern(pattern, dateString) {
  const matchResult = dateString.match(pattern);

  if (!matchResult) {
    return null;
  }

  return {
    value: parseInt(matchResult[0], 10),
    rest: dateString.slice(matchResult[0].length),
  };
}

function parseTimezonePattern(pattern, dateString) {
  const matchResult = dateString.match(pattern);

  if (!matchResult) {
    return null;
  }

  // Input is 'Z'
  if (matchResult[0] === "Z") {
    return {
      value: 0,
      rest: dateString.slice(1),
    };
  }

  const sign = matchResult[1] === "+" ? 1 : -1;
  const hours = matchResult[2] ? parseInt(matchResult[2], 10) : 0;
  const minutes = matchResult[3] ? parseInt(matchResult[3], 10) : 0;
  const seconds = matchResult[5] ? parseInt(matchResult[5], 10) : 0;

  return {
    value:
      sign *
      (hours * _constants_js__WEBPACK_IMPORTED_MODULE_0__.millisecondsInHour +
        minutes * _constants_js__WEBPACK_IMPORTED_MODULE_0__.millisecondsInMinute +
        seconds * _constants_js__WEBPACK_IMPORTED_MODULE_0__.millisecondsInSecond),
    rest: dateString.slice(matchResult[0].length),
  };
}

function parseAnyDigitsSigned(dateString) {
  return parseNumericPattern(_constants_js__WEBPACK_IMPORTED_MODULE_1__.numericPatterns.anyDigitsSigned, dateString);
}

function parseNDigits(n, dateString) {
  switch (n) {
    case 1:
      return parseNumericPattern(_constants_js__WEBPACK_IMPORTED_MODULE_1__.numericPatterns.singleDigit, dateString);
    case 2:
      return parseNumericPattern(_constants_js__WEBPACK_IMPORTED_MODULE_1__.numericPatterns.twoDigits, dateString);
    case 3:
      return parseNumericPattern(_constants_js__WEBPACK_IMPORTED_MODULE_1__.numericPatterns.threeDigits, dateString);
    case 4:
      return parseNumericPattern(_constants_js__WEBPACK_IMPORTED_MODULE_1__.numericPatterns.fourDigits, dateString);
    default:
      return parseNumericPattern(new RegExp("^\\d{1," + n + "}"), dateString);
  }
}

function parseNDigitsSigned(n, dateString) {
  switch (n) {
    case 1:
      return parseNumericPattern(_constants_js__WEBPACK_IMPORTED_MODULE_1__.numericPatterns.singleDigitSigned, dateString);
    case 2:
      return parseNumericPattern(_constants_js__WEBPACK_IMPORTED_MODULE_1__.numericPatterns.twoDigitsSigned, dateString);
    case 3:
      return parseNumericPattern(_constants_js__WEBPACK_IMPORTED_MODULE_1__.numericPatterns.threeDigitsSigned, dateString);
    case 4:
      return parseNumericPattern(_constants_js__WEBPACK_IMPORTED_MODULE_1__.numericPatterns.fourDigitsSigned, dateString);
    default:
      return parseNumericPattern(new RegExp("^-?\\d{1," + n + "}"), dateString);
  }
}

function dayPeriodEnumToHours(dayPeriod) {
  switch (dayPeriod) {
    case "morning":
      return 4;
    case "evening":
      return 17;
    case "pm":
    case "noon":
    case "afternoon":
      return 12;
    case "am":
    case "midnight":
    case "night":
    default:
      return 0;
  }
}

function normalizeTwoDigitYear(twoDigitYear, currentYear) {
  const isCommonEra = currentYear > 0;
  // Absolute number of the current year:
  // 1 -> 1 AC
  // 0 -> 1 BC
  // -1 -> 2 BC
  const absCurrentYear = isCommonEra ? currentYear : 1 - currentYear;

  let result;
  if (absCurrentYear <= 50) {
    result = twoDigitYear || 100;
  } else {
    const rangeEnd = absCurrentYear + 50;
    const rangeEndCentury = Math.trunc(rangeEnd / 100) * 100;
    const isPreviousCentury = twoDigitYear >= rangeEnd % 100;
    result = twoDigitYear + rangeEndCentury - (isPreviousCentury ? 100 : 0);
  }

  return isCommonEra ? result : 1 - result;
}

function isLeapYearIndex(year) {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}


/***/ }),
/* 62 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "numericPatterns": () => (/* binding */ numericPatterns),
/* harmony export */   "timezonePatterns": () => (/* binding */ timezonePatterns)
/* harmony export */ });
const numericPatterns = {
  month: /^(1[0-2]|0?\d)/, // 0 to 12
  date: /^(3[0-1]|[0-2]?\d)/, // 0 to 31
  dayOfYear: /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/, // 0 to 366
  week: /^(5[0-3]|[0-4]?\d)/, // 0 to 53
  hour23h: /^(2[0-3]|[0-1]?\d)/, // 0 to 23
  hour24h: /^(2[0-4]|[0-1]?\d)/, // 0 to 24
  hour11h: /^(1[0-1]|0?\d)/, // 0 to 11
  hour12h: /^(1[0-2]|0?\d)/, // 0 to 12
  minute: /^[0-5]?\d/, // 0 to 59
  second: /^[0-5]?\d/, // 0 to 59

  singleDigit: /^\d/, // 0 to 9
  twoDigits: /^\d{1,2}/, // 0 to 99
  threeDigits: /^\d{1,3}/, // 0 to 999
  fourDigits: /^\d{1,4}/, // 0 to 9999

  anyDigitsSigned: /^-?\d+/,
  singleDigitSigned: /^-?\d/, // 0 to 9, -0 to -9
  twoDigitsSigned: /^-?\d{1,2}/, // 0 to 99, -0 to -99
  threeDigitsSigned: /^-?\d{1,3}/, // 0 to 999, -0 to -999
  fourDigitsSigned: /^-?\d{1,4}/, // 0 to 9999, -0 to -9999
};

const timezonePatterns = {
  basicOptionalMinutes: /^([+-])(\d{2})(\d{2})?|Z/,
  basic: /^([+-])(\d{2})(\d{2})|Z/,
  basicOptionalSeconds: /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
  extended: /^([+-])(\d{2}):(\d{2})|Z/,
  extendedOptionalSeconds: /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/,
};


/***/ }),
/* 63 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LocalWeekYearParser": () => (/* binding */ LocalWeekYearParser)
/* harmony export */ });
/* harmony import */ var _getWeekYear_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(64);
/* harmony import */ var _startOfWeek_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(67);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);







// Local week-numbering year
class LocalWeekYearParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 130;

  parse(dateString, token, match) {
    const valueCallback = (year) => ({
      year,
      isTwoDigitYear: token === "YY",
    });

    switch (token) {
      case "Y":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(4, dateString), valueCallback);
      case "Yo":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          match.ordinalNumber(dateString, {
            unit: "year",
          }),
          valueCallback,
        );
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString), valueCallback);
    }
  }

  validate(_date, value) {
    return value.isTwoDigitYear || value.year > 0;
  }

  set(date, flags, value, options) {
    const currentYear = (0,_getWeekYear_js__WEBPACK_IMPORTED_MODULE_2__.getWeekYear)(date, options);

    if (value.isTwoDigitYear) {
      const normalizedTwoDigitYear = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.normalizeTwoDigitYear)(
        value.year,
        currentYear,
      );
      date.setFullYear(
        normalizedTwoDigitYear,
        0,
        options.firstWeekContainsDate,
      );
      date.setHours(0, 0, 0, 0);
      return (0,_startOfWeek_js__WEBPACK_IMPORTED_MODULE_3__.startOfWeek)(date, options);
    }

    const year =
      !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
    date.setFullYear(year, 0, options.firstWeekContainsDate);
    date.setHours(0, 0, 0, 0);
    return (0,_startOfWeek_js__WEBPACK_IMPORTED_MODULE_3__.startOfWeek)(date, options);
  }

  incompatibleTokens = [
    "y",
    "R",
    "u",
    "Q",
    "q",
    "M",
    "L",
    "I",
    "d",
    "D",
    "i",
    "t",
    "T",
  ];
}


/***/ }),
/* 64 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "getWeekYear": () => (/* binding */ getWeekYear)
/* harmony export */ });
/* harmony import */ var _lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(66);
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(57);
/* harmony import */ var _startOfWeek_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(67);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);





/**
 * The {@link getWeekYear} function options.
 */

/**
 * @name getWeekYear
 * @category Week-Numbering Year Helpers
 * @summary Get the local week-numbering year of the given date.
 *
 * @description
 * Get the local week-numbering year of the given date.
 * The exact calculation depends on the values of
 * `options.weekStartsOn` (which is the index of the first day of the week)
 * and `options.firstWeekContainsDate` (which is the day of January, which is always in
 * the first week of the week-numbering year)
 *
 * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
 *
 * @param date - The given date
 * @param options - An object with options.
 *
 * @returns The local week-numbering year
 *
 * @example
 * // Which week numbering year is 26 December 2004 with the default settings?
 * const result = getWeekYear(new Date(2004, 11, 26))
 * //=> 2005
 *
 * @example
 * // Which week numbering year is 26 December 2004 if week starts on Saturday?
 * const result = getWeekYear(new Date(2004, 11, 26), { weekStartsOn: 6 })
 * //=> 2004
 *
 * @example
 * // Which week numbering year is 26 December 2004 if the first week contains 4 January?
 * const result = getWeekYear(new Date(2004, 11, 26), { firstWeekContainsDate: 4 })
 * //=> 2004
 */
function getWeekYear(date, options) {
  const _date = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in);
  const year = _date.getFullYear();

  const defaultOptions = (0,_lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_1__.getDefaultOptions)();
  const firstWeekContainsDate =
    options?.firstWeekContainsDate ??
    options?.locale?.options?.firstWeekContainsDate ??
    defaultOptions.firstWeekContainsDate ??
    defaultOptions.locale?.options?.firstWeekContainsDate ??
    1;

  const firstWeekOfNextYear = (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_2__.constructFrom)(options?.in || date, 0);
  firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = (0,_startOfWeek_js__WEBPACK_IMPORTED_MODULE_3__.startOfWeek)(firstWeekOfNextYear, options);

  const firstWeekOfThisYear = (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_2__.constructFrom)(options?.in || date, 0);
  firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = (0,_startOfWeek_js__WEBPACK_IMPORTED_MODULE_3__.startOfWeek)(firstWeekOfThisYear, options);

  if (+_date >= +startOfNextYear) {
    return year + 1;
  } else if (+_date >= +startOfThisYear) {
    return year;
  } else {
    return year - 1;
  }
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getWeekYear);


/***/ }),
/* 65 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "toDate": () => (/* binding */ toDate)
/* harmony export */ });
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(57);


/**
 * @name toDate
 * @category Common Helpers
 * @summary Convert the given argument to an instance of Date.
 *
 * @description
 * Convert the given argument to an instance of Date.
 *
 * If the argument is an instance of Date, the function returns its clone.
 *
 * If the argument is a number, it is treated as a timestamp.
 *
 * If the argument is none of the above, the function returns Invalid Date.
 *
 * Starting from v3.7.0, it clones a date using `[Symbol.for("constructDateFrom")]`
 * enabling to transfer extra properties from the reference date to the new date.
 * It's useful for extensions like [`TZDate`](https://github.com/date-fns/tz)
 * that accept a time zone as a constructor argument.
 *
 * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param argument - The value to convert
 *
 * @returns The parsed date in the local time zone
 *
 * @example
 * // Clone the date:
 * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Convert the timestamp to date:
 * const result = toDate(1392098430000)
 * //=> Tue Feb 11 2014 11:30:30
 */
function toDate(argument, context) {
  // [TODO] Get rid of `toDate` or `constructFrom`?
  return (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_0__.constructFrom)(context || argument, argument);
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (toDate);


/***/ }),
/* 66 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDefaultOptions": () => (/* binding */ getDefaultOptions),
/* harmony export */   "setDefaultOptions": () => (/* binding */ setDefaultOptions)
/* harmony export */ });
let defaultOptions = {};

function getDefaultOptions() {
  return defaultOptions;
}

function setDefaultOptions(newOptions) {
  defaultOptions = newOptions;
}


/***/ }),
/* 67 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "startOfWeek": () => (/* binding */ startOfWeek)
/* harmony export */ });
/* harmony import */ var _lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(66);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(65);



/**
 * The {@link startOfWeek} function options.
 */

/**
 * @name startOfWeek
 * @category Week Helpers
 * @summary Return the start of a week for the given date.
 *
 * @description
 * Return the start of a week for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The start of a week
 *
 * @example
 * // The start of a week for 2 September 2014 11:55:00:
 * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Sun Aug 31 2014 00:00:00
 *
 * @example
 * // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
 * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
 * //=> Mon Sep 01 2014 00:00:00
 */
function startOfWeek(date, options) {
  const defaultOptions = (0,_lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_0__.getDefaultOptions)();
  const weekStartsOn =
    options?.weekStartsOn ??
    options?.locale?.options?.weekStartsOn ??
    defaultOptions.weekStartsOn ??
    defaultOptions.locale?.options?.weekStartsOn ??
    0;

  const _date = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_1__.toDate)(date, options?.in);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

  _date.setDate(_date.getDate() - diff);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (startOfWeek);


/***/ }),
/* 68 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ISOWeekYearParser": () => (/* binding */ ISOWeekYearParser)
/* harmony export */ });
/* harmony import */ var _startOfISOWeek_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(69);
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(57);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);






// ISO week-numbering year
class ISOWeekYearParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 130;

  parse(dateString, token) {
    if (token === "R") {
      return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigitsSigned)(4, dateString);
    }

    return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigitsSigned)(token.length, dateString);
  }

  set(date, _flags, value) {
    const firstWeekOfYear = (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_2__.constructFrom)(date, 0);
    firstWeekOfYear.setFullYear(value, 0, 4);
    firstWeekOfYear.setHours(0, 0, 0, 0);
    return (0,_startOfISOWeek_js__WEBPACK_IMPORTED_MODULE_3__.startOfISOWeek)(firstWeekOfYear);
  }

  incompatibleTokens = [
    "G",
    "y",
    "Y",
    "u",
    "Q",
    "q",
    "M",
    "L",
    "w",
    "d",
    "D",
    "e",
    "c",
    "t",
    "T",
  ];
}


/***/ }),
/* 69 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "startOfISOWeek": () => (/* binding */ startOfISOWeek)
/* harmony export */ });
/* harmony import */ var _startOfWeek_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(67);


/**
 * The {@link startOfISOWeek} function options.
 */

/**
 * @name startOfISOWeek
 * @category ISO Week Helpers
 * @summary Return the start of an ISO week for the given date.
 *
 * @description
 * Return the start of an ISO week for the given date.
 * The result will be in the local timezone.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The start of an ISO week
 *
 * @example
 * // The start of an ISO week for 2 September 2014 11:55:00:
 * const result = startOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Mon Sep 01 2014 00:00:00
 */
function startOfISOWeek(date, options) {
  return (0,_startOfWeek_js__WEBPACK_IMPORTED_MODULE_0__.startOfWeek)(date, { ...options, weekStartsOn: 1 });
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (startOfISOWeek);


/***/ }),
/* 70 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ExtendedYearParser": () => (/* binding */ ExtendedYearParser)
/* harmony export */ });
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);




class ExtendedYearParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 130;

  parse(dateString, token) {
    if (token === "u") {
      return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigitsSigned)(4, dateString);
    }

    return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigitsSigned)(token.length, dateString);
  }

  set(date, _flags, value) {
    date.setFullYear(value, 0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  incompatibleTokens = ["G", "y", "Y", "R", "w", "I", "i", "e", "c", "t", "T"];
}


/***/ }),
/* 71 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "QuarterParser": () => (/* binding */ QuarterParser)
/* harmony export */ });
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);




class QuarterParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 120;

  parse(dateString, token, match) {
    switch (token) {
      // 1, 2, 3, 4
      case "Q":
      case "QQ": // 01, 02, 03, 04
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
      // 1st, 2nd, 3rd, 4th
      case "Qo":
        return match.ordinalNumber(dateString, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "QQQ":
        return (
          match.quarter(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.quarter(dateString, {
            width: "narrow",
            context: "formatting",
          })
        );

      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "QQQQQ":
        return match.quarter(dateString, {
          width: "narrow",
          context: "formatting",
        });
      // 1st quarter, 2nd quarter, ...
      case "QQQQ":
      default:
        return (
          match.quarter(dateString, {
            width: "wide",
            context: "formatting",
          }) ||
          match.quarter(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.quarter(dateString, {
            width: "narrow",
            context: "formatting",
          })
        );
    }
  }

  validate(_date, value) {
    return value >= 1 && value <= 4;
  }

  set(date, _flags, value) {
    date.setMonth((value - 1) * 3, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  incompatibleTokens = [
    "Y",
    "R",
    "q",
    "M",
    "L",
    "w",
    "I",
    "d",
    "D",
    "i",
    "e",
    "c",
    "t",
    "T",
  ];
}


/***/ }),
/* 72 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StandAloneQuarterParser": () => (/* binding */ StandAloneQuarterParser)
/* harmony export */ });
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);




class StandAloneQuarterParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 120;

  parse(dateString, token, match) {
    switch (token) {
      // 1, 2, 3, 4
      case "q":
      case "qq": // 01, 02, 03, 04
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
      // 1st, 2nd, 3rd, 4th
      case "qo":
        return match.ordinalNumber(dateString, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "qqq":
        return (
          match.quarter(dateString, {
            width: "abbreviated",
            context: "standalone",
          }) ||
          match.quarter(dateString, {
            width: "narrow",
            context: "standalone",
          })
        );

      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "qqqqq":
        return match.quarter(dateString, {
          width: "narrow",
          context: "standalone",
        });
      // 1st quarter, 2nd quarter, ...
      case "qqqq":
      default:
        return (
          match.quarter(dateString, {
            width: "wide",
            context: "standalone",
          }) ||
          match.quarter(dateString, {
            width: "abbreviated",
            context: "standalone",
          }) ||
          match.quarter(dateString, {
            width: "narrow",
            context: "standalone",
          })
        );
    }
  }

  validate(_date, value) {
    return value >= 1 && value <= 4;
  }

  set(date, _flags, value) {
    date.setMonth((value - 1) * 3, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  incompatibleTokens = [
    "Y",
    "R",
    "Q",
    "M",
    "L",
    "w",
    "I",
    "d",
    "D",
    "i",
    "e",
    "c",
    "t",
    "T",
  ];
}


/***/ }),
/* 73 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MonthParser": () => (/* binding */ MonthParser)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





class MonthParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  incompatibleTokens = [
    "Y",
    "R",
    "q",
    "Q",
    "L",
    "w",
    "I",
    "D",
    "i",
    "e",
    "c",
    "t",
    "T",
  ];

  priority = 110;

  parse(dateString, token, match) {
    const valueCallback = (value) => value - 1;

    switch (token) {
      // 1, 2, ..., 12
      case "M":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.month, dateString),
          valueCallback,
        );
      // 01, 02, ..., 12
      case "MM":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(2, dateString), valueCallback);
      // 1st, 2nd, ..., 12th
      case "Mo":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          match.ordinalNumber(dateString, {
            unit: "month",
          }),
          valueCallback,
        );
      // Jan, Feb, ..., Dec
      case "MMM":
        return (
          match.month(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.month(dateString, { width: "narrow", context: "formatting" })
        );

      // J, F, ..., D
      case "MMMMM":
        return match.month(dateString, {
          width: "narrow",
          context: "formatting",
        });
      // January, February, ..., December
      case "MMMM":
      default:
        return (
          match.month(dateString, { width: "wide", context: "formatting" }) ||
          match.month(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.month(dateString, { width: "narrow", context: "formatting" })
        );
    }
  }

  validate(_date, value) {
    return value >= 0 && value <= 11;
  }

  set(date, _flags, value) {
    date.setMonth(value, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}


/***/ }),
/* 74 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StandAloneMonthParser": () => (/* binding */ StandAloneMonthParser)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





class StandAloneMonthParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 110;

  parse(dateString, token, match) {
    const valueCallback = (value) => value - 1;

    switch (token) {
      // 1, 2, ..., 12
      case "L":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.month, dateString),
          valueCallback,
        );
      // 01, 02, ..., 12
      case "LL":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(2, dateString), valueCallback);
      // 1st, 2nd, ..., 12th
      case "Lo":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          match.ordinalNumber(dateString, {
            unit: "month",
          }),
          valueCallback,
        );
      // Jan, Feb, ..., Dec
      case "LLL":
        return (
          match.month(dateString, {
            width: "abbreviated",
            context: "standalone",
          }) ||
          match.month(dateString, { width: "narrow", context: "standalone" })
        );

      // J, F, ..., D
      case "LLLLL":
        return match.month(dateString, {
          width: "narrow",
          context: "standalone",
        });
      // January, February, ..., December
      case "LLLL":
      default:
        return (
          match.month(dateString, { width: "wide", context: "standalone" }) ||
          match.month(dateString, {
            width: "abbreviated",
            context: "standalone",
          }) ||
          match.month(dateString, { width: "narrow", context: "standalone" })
        );
    }
  }

  validate(_date, value) {
    return value >= 0 && value <= 11;
  }

  set(date, _flags, value) {
    date.setMonth(value, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  incompatibleTokens = [
    "Y",
    "R",
    "q",
    "Q",
    "M",
    "w",
    "I",
    "D",
    "i",
    "e",
    "c",
    "t",
    "T",
  ];
}


/***/ }),
/* 75 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LocalWeekParser": () => (/* binding */ LocalWeekParser)
/* harmony export */ });
/* harmony import */ var _setWeek_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(76);
/* harmony import */ var _startOfWeek_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(67);
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);







// Local week of year
class LocalWeekParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 100;

  parse(dateString, token, match) {
    switch (token) {
      case "w":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.week, dateString);
      case "wo":
        return match.ordinalNumber(dateString, { unit: "week" });
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
    }
  }

  validate(_date, value) {
    return value >= 1 && value <= 53;
  }

  set(date, _flags, value, options) {
    return (0,_startOfWeek_js__WEBPACK_IMPORTED_MODULE_3__.startOfWeek)((0,_setWeek_js__WEBPACK_IMPORTED_MODULE_4__.setWeek)(date, value, options), options);
  }

  incompatibleTokens = [
    "y",
    "R",
    "u",
    "q",
    "Q",
    "M",
    "L",
    "I",
    "d",
    "D",
    "i",
    "t",
    "T",
  ];
}


/***/ }),
/* 76 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "setWeek": () => (/* binding */ setWeek)
/* harmony export */ });
/* harmony import */ var _getWeek_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(77);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);



/**
 * The {@link setWeek} function options.
 */

/**
 * @name setWeek
 * @category Week Helpers
 * @summary Set the local week to the given date.
 *
 * @description
 * Set the local week to the given date, saving the weekday number.
 * The exact calculation depends on the values of
 * `options.weekStartsOn` (which is the index of the first day of the week)
 * and `options.firstWeekContainsDate` (which is the day of January, which is always in
 * the first week of the week-numbering year)
 *
 * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The date to be changed
 * @param week - The week of the new date
 * @param options - An object with options
 *
 * @returns The new date with the local week set
 *
 * @example
 * // Set the 1st week to 2 January 2005 with default options:
 * const result = setWeek(new Date(2005, 0, 2), 1)
 * //=> Sun Dec 26 2004 00:00:00
 *
 * @example
 * // Set the 1st week to 2 January 2005,
 * // if Monday is the first day of the week,
 * // and the first week of the year always contains 4 January:
 * const result = setWeek(new Date(2005, 0, 2), 1, {
 *   weekStartsOn: 1,
 *   firstWeekContainsDate: 4
 * })
 * //=> Sun Jan 4 2004 00:00:00
 */
function setWeek(date, week, options) {
  const date_ = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in);
  const diff = (0,_getWeek_js__WEBPACK_IMPORTED_MODULE_1__.getWeek)(date_, options) - week;
  date_.setDate(date_.getDate() - diff * 7);
  return (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date_, options?.in);
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (setWeek);


/***/ }),
/* 77 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "getWeek": () => (/* binding */ getWeek)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(58);
/* harmony import */ var _startOfWeek_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(67);
/* harmony import */ var _startOfWeekYear_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(78);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);





/**
 * The {@link getWeek} function options.
 */

/**
 * @name getWeek
 * @category Week Helpers
 * @summary Get the local week index of the given date.
 *
 * @description
 * Get the local week index of the given date.
 * The exact calculation depends on the values of
 * `options.weekStartsOn` (which is the index of the first day of the week)
 * and `options.firstWeekContainsDate` (which is the day of January, which is always in
 * the first week of the week-numbering year)
 *
 * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
 *
 * @param date - The given date
 * @param options - An object with options
 *
 * @returns The week
 *
 * @example
 * // Which week of the local week numbering year is 2 January 2005 with default options?
 * const result = getWeek(new Date(2005, 0, 2))
 * //=> 2
 *
 * @example
 * // Which week of the local week numbering year is 2 January 2005,
 * // if Monday is the first day of the week,
 * // and the first week of the year always contains 4 January?
 * const result = getWeek(new Date(2005, 0, 2), {
 *   weekStartsOn: 1,
 *   firstWeekContainsDate: 4
 * })
 * //=> 53
 */
function getWeek(date, options) {
  const _date = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in);
  const diff = +(0,_startOfWeek_js__WEBPACK_IMPORTED_MODULE_1__.startOfWeek)(_date, options) - +(0,_startOfWeekYear_js__WEBPACK_IMPORTED_MODULE_2__.startOfWeekYear)(_date, options);

  // Round the number of weeks to the nearest integer because the number of
  // milliseconds in a week is not constant (e.g. it's different in the week of
  // the daylight saving time clock shift).
  return Math.round(diff / _constants_js__WEBPACK_IMPORTED_MODULE_3__.millisecondsInWeek) + 1;
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getWeek);


/***/ }),
/* 78 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "startOfWeekYear": () => (/* binding */ startOfWeekYear)
/* harmony export */ });
/* harmony import */ var _lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(66);
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(57);
/* harmony import */ var _getWeekYear_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(64);
/* harmony import */ var _startOfWeek_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(67);





/**
 * The {@link startOfWeekYear} function options.
 */

/**
 * @name startOfWeekYear
 * @category Week-Numbering Year Helpers
 * @summary Return the start of a local week-numbering year for the given date.
 *
 * @description
 * Return the start of a local week-numbering year.
 * The exact calculation depends on the values of
 * `options.weekStartsOn` (which is the index of the first day of the week)
 * and `options.firstWeekContainsDate` (which is the day of January, which is always in
 * the first week of the week-numbering year)
 *
 * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type.
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The start of a week-numbering year
 *
 * @example
 * // The start of an a week-numbering year for 2 July 2005 with default settings:
 * const result = startOfWeekYear(new Date(2005, 6, 2))
 * //=> Sun Dec 26 2004 00:00:00
 *
 * @example
 * // The start of a week-numbering year for 2 July 2005
 * // if Monday is the first day of week
 * // and 4 January is always in the first week of the year:
 * const result = startOfWeekYear(new Date(2005, 6, 2), {
 *   weekStartsOn: 1,
 *   firstWeekContainsDate: 4
 * })
 * //=> Mon Jan 03 2005 00:00:00
 */
function startOfWeekYear(date, options) {
  const defaultOptions = (0,_lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_0__.getDefaultOptions)();
  const firstWeekContainsDate =
    options?.firstWeekContainsDate ??
    options?.locale?.options?.firstWeekContainsDate ??
    defaultOptions.firstWeekContainsDate ??
    defaultOptions.locale?.options?.firstWeekContainsDate ??
    1;

  const year = (0,_getWeekYear_js__WEBPACK_IMPORTED_MODULE_1__.getWeekYear)(date, options);
  const firstWeek = (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_2__.constructFrom)(options?.in || date, 0);
  firstWeek.setFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setHours(0, 0, 0, 0);
  const _date = (0,_startOfWeek_js__WEBPACK_IMPORTED_MODULE_3__.startOfWeek)(firstWeek, options);
  return _date;
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (startOfWeekYear);


/***/ }),
/* 79 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ISOWeekParser": () => (/* binding */ ISOWeekParser)
/* harmony export */ });
/* harmony import */ var _setISOWeek_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(80);
/* harmony import */ var _startOfISOWeek_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(69);
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);







// ISO week of year
class ISOWeekParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 100;

  parse(dateString, token, match) {
    switch (token) {
      case "I":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.week, dateString);
      case "Io":
        return match.ordinalNumber(dateString, { unit: "week" });
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
    }
  }

  validate(_date, value) {
    return value >= 1 && value <= 53;
  }

  set(date, _flags, value) {
    return (0,_startOfISOWeek_js__WEBPACK_IMPORTED_MODULE_3__.startOfISOWeek)((0,_setISOWeek_js__WEBPACK_IMPORTED_MODULE_4__.setISOWeek)(date, value));
  }

  incompatibleTokens = [
    "y",
    "Y",
    "u",
    "q",
    "Q",
    "M",
    "L",
    "w",
    "d",
    "D",
    "e",
    "c",
    "t",
    "T",
  ];
}


/***/ }),
/* 80 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "setISOWeek": () => (/* binding */ setISOWeek)
/* harmony export */ });
/* harmony import */ var _getISOWeek_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(81);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);



/**
 * The {@link setISOWeek} function options.
 */

/**
 * @name setISOWeek
 * @category ISO Week Helpers
 * @summary Set the ISO week to the given date.
 *
 * @description
 * Set the ISO week to the given date, saving the weekday number.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The `Date` type of the context function.
 *
 * @param date - The date to be changed
 * @param week - The ISO week of the new date
 * @param options - An object with options
 *
 * @returns The new date with the ISO week set
 *
 * @example
 * // Set the 53rd ISO week to 7 August 2004:
 * const result = setISOWeek(new Date(2004, 7, 7), 53)
 * //=> Sat Jan 01 2005 00:00:00
 */
function setISOWeek(date, week, options) {
  const _date = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in);
  const diff = (0,_getISOWeek_js__WEBPACK_IMPORTED_MODULE_1__.getISOWeek)(_date, options) - week;
  _date.setDate(_date.getDate() - diff * 7);
  return _date;
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (setISOWeek);


/***/ }),
/* 81 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "getISOWeek": () => (/* binding */ getISOWeek)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(58);
/* harmony import */ var _startOfISOWeek_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(69);
/* harmony import */ var _startOfISOWeekYear_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(82);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);





/**
 * The {@link getISOWeek} function options.
 */

/**
 * @name getISOWeek
 * @category ISO Week Helpers
 * @summary Get the ISO week of the given date.
 *
 * @description
 * Get the ISO week of the given date.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param date - The given date
 * @param options - The options
 *
 * @returns The ISO week
 *
 * @example
 * // Which week of the ISO-week numbering year is 2 January 2005?
 * const result = getISOWeek(new Date(2005, 0, 2))
 * //=> 53
 */
function getISOWeek(date, options) {
  const _date = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in);
  const diff = +(0,_startOfISOWeek_js__WEBPACK_IMPORTED_MODULE_1__.startOfISOWeek)(_date) - +(0,_startOfISOWeekYear_js__WEBPACK_IMPORTED_MODULE_2__.startOfISOWeekYear)(_date);

  // Round the number of weeks to the nearest integer because the number of
  // milliseconds in a week is not constant (e.g. it's different in the week of
  // the daylight saving time clock shift).
  return Math.round(diff / _constants_js__WEBPACK_IMPORTED_MODULE_3__.millisecondsInWeek) + 1;
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getISOWeek);


/***/ }),
/* 82 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "startOfISOWeekYear": () => (/* binding */ startOfISOWeekYear)
/* harmony export */ });
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(57);
/* harmony import */ var _getISOWeekYear_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(83);
/* harmony import */ var _startOfISOWeek_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(69);




/**
 * The {@link startOfISOWeekYear} function options.
 */

/**
 * @name startOfISOWeekYear
 * @category ISO Week-Numbering Year Helpers
 * @summary Return the start of an ISO week-numbering year for the given date.
 *
 * @description
 * Return the start of an ISO week-numbering year,
 * which always starts 3 days before the year's first Thursday.
 * The result will be in the local timezone.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The start of an ISO week-numbering year
 *
 * @example
 * // The start of an ISO week-numbering year for 2 July 2005:
 * const result = startOfISOWeekYear(new Date(2005, 6, 2))
 * //=> Mon Jan 03 2005 00:00:00
 */
function startOfISOWeekYear(date, options) {
  const year = (0,_getISOWeekYear_js__WEBPACK_IMPORTED_MODULE_0__.getISOWeekYear)(date, options);
  const fourthOfJanuary = (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_1__.constructFrom)(options?.in || date, 0);
  fourthOfJanuary.setFullYear(year, 0, 4);
  fourthOfJanuary.setHours(0, 0, 0, 0);
  return (0,_startOfISOWeek_js__WEBPACK_IMPORTED_MODULE_2__.startOfISOWeek)(fourthOfJanuary);
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (startOfISOWeekYear);


/***/ }),
/* 83 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "getISOWeekYear": () => (/* binding */ getISOWeekYear)
/* harmony export */ });
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(57);
/* harmony import */ var _startOfISOWeek_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(69);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);




/**
 * The {@link getISOWeekYear} function options.
 */

/**
 * @name getISOWeekYear
 * @category ISO Week-Numbering Year Helpers
 * @summary Get the ISO week-numbering year of the given date.
 *
 * @description
 * Get the ISO week-numbering year of the given date,
 * which always starts 3 days before the year's first Thursday.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param date - The given date
 *
 * @returns The ISO week-numbering year
 *
 * @example
 * // Which ISO-week numbering year is 2 January 2005?
 * const result = getISOWeekYear(new Date(2005, 0, 2))
 * //=> 2004
 */
function getISOWeekYear(date, options) {
  const _date = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in);
  const year = _date.getFullYear();

  const fourthOfJanuaryOfNextYear = (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_1__.constructFrom)(_date, 0);
  fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = (0,_startOfISOWeek_js__WEBPACK_IMPORTED_MODULE_2__.startOfISOWeek)(fourthOfJanuaryOfNextYear);

  const fourthOfJanuaryOfThisYear = (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_1__.constructFrom)(_date, 0);
  fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = (0,_startOfISOWeek_js__WEBPACK_IMPORTED_MODULE_2__.startOfISOWeek)(fourthOfJanuaryOfThisYear);

  if (_date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (_date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getISOWeekYear);


/***/ }),
/* 84 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DateParser": () => (/* binding */ DateParser)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DAYS_IN_MONTH_LEAP_YEAR = [
  31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
];

// Day of the month
class DateParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 90;
  subPriority = 1;

  parse(dateString, token, match) {
    switch (token) {
      case "d":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.date, dateString);
      case "do":
        return match.ordinalNumber(dateString, { unit: "date" });
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
    }
  }

  validate(date, value) {
    const year = date.getFullYear();
    const isLeapYear = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.isLeapYearIndex)(year);
    const month = date.getMonth();
    if (isLeapYear) {
      return value >= 1 && value <= DAYS_IN_MONTH_LEAP_YEAR[month];
    } else {
      return value >= 1 && value <= DAYS_IN_MONTH[month];
    }
  }

  set(date, _flags, value) {
    date.setDate(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  incompatibleTokens = [
    "Y",
    "R",
    "q",
    "Q",
    "w",
    "I",
    "D",
    "i",
    "e",
    "c",
    "t",
    "T",
  ];
}


/***/ }),
/* 85 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DayOfYearParser": () => (/* binding */ DayOfYearParser)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





class DayOfYearParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 90;

  subpriority = 1;

  parse(dateString, token, match) {
    switch (token) {
      case "D":
      case "DD":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.dayOfYear, dateString);
      case "Do":
        return match.ordinalNumber(dateString, { unit: "date" });
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
    }
  }

  validate(date, value) {
    const year = date.getFullYear();
    const isLeapYear = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.isLeapYearIndex)(year);
    if (isLeapYear) {
      return value >= 1 && value <= 366;
    } else {
      return value >= 1 && value <= 365;
    }
  }

  set(date, _flags, value) {
    date.setMonth(0, value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  incompatibleTokens = [
    "Y",
    "R",
    "q",
    "Q",
    "M",
    "L",
    "w",
    "I",
    "d",
    "E",
    "i",
    "e",
    "c",
    "t",
    "T",
  ];
}


/***/ }),
/* 86 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DayParser": () => (/* binding */ DayParser)
/* harmony export */ });
/* harmony import */ var _setDay_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(87);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);



// Day of week
class DayParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 90;

  parse(dateString, token, match) {
    switch (token) {
      // Tue
      case "E":
      case "EE":
      case "EEE":
        return (
          match.day(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.day(dateString, { width: "short", context: "formatting" }) ||
          match.day(dateString, { width: "narrow", context: "formatting" })
        );

      // T
      case "EEEEE":
        return match.day(dateString, {
          width: "narrow",
          context: "formatting",
        });
      // Tu
      case "EEEEEE":
        return (
          match.day(dateString, { width: "short", context: "formatting" }) ||
          match.day(dateString, { width: "narrow", context: "formatting" })
        );

      // Tuesday
      case "EEEE":
      default:
        return (
          match.day(dateString, { width: "wide", context: "formatting" }) ||
          match.day(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.day(dateString, { width: "short", context: "formatting" }) ||
          match.day(dateString, { width: "narrow", context: "formatting" })
        );
    }
  }

  validate(_date, value) {
    return value >= 0 && value <= 6;
  }

  set(date, _flags, value, options) {
    date = (0,_setDay_js__WEBPACK_IMPORTED_MODULE_1__.setDay)(date, value, options);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  incompatibleTokens = ["D", "i", "e", "c", "t", "T"];
}


/***/ }),
/* 87 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "setDay": () => (/* binding */ setDay)
/* harmony export */ });
/* harmony import */ var _lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(66);
/* harmony import */ var _addDays_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(88);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(65);




/**
 * The {@link setDay} function options.
 */

/**
 * @name setDay
 * @category Weekday Helpers
 * @summary Set the day of the week to the given date.
 *
 * @description
 * Set the day of the week to the given date.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The date to be changed
 * @param day - The day of the week of the new date
 * @param options - An object with options.
 *
 * @returns The new date with the day of the week set
 *
 * @example
 * // Set week day to Sunday, with the default weekStartsOn of Sunday:
 * const result = setDay(new Date(2014, 8, 1), 0)
 * //=> Sun Aug 31 2014 00:00:00
 *
 * @example
 * // Set week day to Sunday, with a weekStartsOn of Monday:
 * const result = setDay(new Date(2014, 8, 1), 0, { weekStartsOn: 1 })
 * //=> Sun Sep 07 2014 00:00:00
 */
function setDay(date, day, options) {
  const defaultOptions = (0,_lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_0__.getDefaultOptions)();
  const weekStartsOn =
    options?.weekStartsOn ??
    options?.locale?.options?.weekStartsOn ??
    defaultOptions.weekStartsOn ??
    defaultOptions.locale?.options?.weekStartsOn ??
    0;

  const date_ = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_1__.toDate)(date, options?.in);
  const currentDay = date_.getDay();

  const remainder = day % 7;
  const dayIndex = (remainder + 7) % 7;

  const delta = 7 - weekStartsOn;
  const diff =
    day < 0 || day > 6
      ? day - ((currentDay + delta) % 7)
      : ((dayIndex + delta) % 7) - ((currentDay + delta) % 7);
  return (0,_addDays_js__WEBPACK_IMPORTED_MODULE_2__.addDays)(date_, diff, options);
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (setDay);


/***/ }),
/* 88 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addDays": () => (/* binding */ addDays),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(57);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);



/**
 * The {@link addDays} function options.
 */

/**
 * @name addDays
 * @category Day Helpers
 * @summary Add the specified number of days to the given date.
 *
 * @description
 * Add the specified number of days to the given date.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The date to be changed
 * @param amount - The amount of days to be added.
 * @param options - An object with options
 *
 * @returns The new date with the days added
 *
 * @example
 * // Add 10 days to 1 September 2014:
 * const result = addDays(new Date(2014, 8, 1), 10)
 * //=> Thu Sep 11 2014 00:00:00
 */
function addDays(date, amount, options) {
  const _date = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in);
  if (isNaN(amount)) return (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_1__.constructFrom)(options?.in || date, NaN);

  // If 0 days, no-op to avoid changing times in the hour before end of DST
  if (!amount) return _date;

  _date.setDate(_date.getDate() + amount);
  return _date;
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (addDays);


/***/ }),
/* 89 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LocalDayParser": () => (/* binding */ LocalDayParser)
/* harmony export */ });
/* harmony import */ var _setDay_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(87);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





// Local day of week
class LocalDayParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 90;
  parse(dateString, token, match, options) {
    const valueCallback = (value) => {
      // We want here floor instead of trunc, so we get -7 for value 0 instead of 0
      const wholeWeekDays = Math.floor((value - 1) / 7) * 7;
      return ((value + options.weekStartsOn + 6) % 7) + wholeWeekDays;
    };

    switch (token) {
      // 3
      case "e":
      case "ee": // 03
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString), valueCallback);
      // 3rd
      case "eo":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          match.ordinalNumber(dateString, {
            unit: "day",
          }),
          valueCallback,
        );
      // Tue
      case "eee":
        return (
          match.day(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.day(dateString, { width: "short", context: "formatting" }) ||
          match.day(dateString, { width: "narrow", context: "formatting" })
        );

      // T
      case "eeeee":
        return match.day(dateString, {
          width: "narrow",
          context: "formatting",
        });
      // Tu
      case "eeeeee":
        return (
          match.day(dateString, { width: "short", context: "formatting" }) ||
          match.day(dateString, { width: "narrow", context: "formatting" })
        );

      // Tuesday
      case "eeee":
      default:
        return (
          match.day(dateString, { width: "wide", context: "formatting" }) ||
          match.day(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.day(dateString, { width: "short", context: "formatting" }) ||
          match.day(dateString, { width: "narrow", context: "formatting" })
        );
    }
  }

  validate(_date, value) {
    return value >= 0 && value <= 6;
  }

  set(date, _flags, value, options) {
    date = (0,_setDay_js__WEBPACK_IMPORTED_MODULE_2__.setDay)(date, value, options);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  incompatibleTokens = [
    "y",
    "R",
    "u",
    "q",
    "Q",
    "M",
    "L",
    "I",
    "d",
    "D",
    "E",
    "i",
    "c",
    "t",
    "T",
  ];
}


/***/ }),
/* 90 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StandAloneLocalDayParser": () => (/* binding */ StandAloneLocalDayParser)
/* harmony export */ });
/* harmony import */ var _setDay_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(87);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





// Stand-alone local day of week
class StandAloneLocalDayParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 90;

  parse(dateString, token, match, options) {
    const valueCallback = (value) => {
      // We want here floor instead of trunc, so we get -7 for value 0 instead of 0
      const wholeWeekDays = Math.floor((value - 1) / 7) * 7;
      return ((value + options.weekStartsOn + 6) % 7) + wholeWeekDays;
    };

    switch (token) {
      // 3
      case "c":
      case "cc": // 03
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString), valueCallback);
      // 3rd
      case "co":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          match.ordinalNumber(dateString, {
            unit: "day",
          }),
          valueCallback,
        );
      // Tue
      case "ccc":
        return (
          match.day(dateString, {
            width: "abbreviated",
            context: "standalone",
          }) ||
          match.day(dateString, { width: "short", context: "standalone" }) ||
          match.day(dateString, { width: "narrow", context: "standalone" })
        );

      // T
      case "ccccc":
        return match.day(dateString, {
          width: "narrow",
          context: "standalone",
        });
      // Tu
      case "cccccc":
        return (
          match.day(dateString, { width: "short", context: "standalone" }) ||
          match.day(dateString, { width: "narrow", context: "standalone" })
        );

      // Tuesday
      case "cccc":
      default:
        return (
          match.day(dateString, { width: "wide", context: "standalone" }) ||
          match.day(dateString, {
            width: "abbreviated",
            context: "standalone",
          }) ||
          match.day(dateString, { width: "short", context: "standalone" }) ||
          match.day(dateString, { width: "narrow", context: "standalone" })
        );
    }
  }

  validate(_date, value) {
    return value >= 0 && value <= 6;
  }

  set(date, _flags, value, options) {
    date = (0,_setDay_js__WEBPACK_IMPORTED_MODULE_2__.setDay)(date, value, options);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  incompatibleTokens = [
    "y",
    "R",
    "u",
    "q",
    "Q",
    "M",
    "L",
    "I",
    "d",
    "D",
    "E",
    "i",
    "e",
    "t",
    "T",
  ];
}


/***/ }),
/* 91 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ISODayParser": () => (/* binding */ ISODayParser)
/* harmony export */ });
/* harmony import */ var _setISODay_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(92);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





// ISO day of week
class ISODayParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 90;

  parse(dateString, token, match) {
    const valueCallback = (value) => {
      if (value === 0) {
        return 7;
      }
      return value;
    };

    switch (token) {
      // 2
      case "i":
      case "ii": // 02
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
      // 2nd
      case "io":
        return match.ordinalNumber(dateString, { unit: "day" });
      // Tue
      case "iii":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          match.day(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
            match.day(dateString, {
              width: "short",
              context: "formatting",
            }) ||
            match.day(dateString, {
              width: "narrow",
              context: "formatting",
            }),
          valueCallback,
        );
      // T
      case "iiiii":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          match.day(dateString, {
            width: "narrow",
            context: "formatting",
          }),
          valueCallback,
        );
      // Tu
      case "iiiiii":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          match.day(dateString, {
            width: "short",
            context: "formatting",
          }) ||
            match.day(dateString, {
              width: "narrow",
              context: "formatting",
            }),
          valueCallback,
        );
      // Tuesday
      case "iiii":
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)(
          match.day(dateString, {
            width: "wide",
            context: "formatting",
          }) ||
            match.day(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.day(dateString, {
              width: "short",
              context: "formatting",
            }) ||
            match.day(dateString, {
              width: "narrow",
              context: "formatting",
            }),
          valueCallback,
        );
    }
  }

  validate(_date, value) {
    return value >= 1 && value <= 7;
  }

  set(date, _flags, value) {
    date = (0,_setISODay_js__WEBPACK_IMPORTED_MODULE_2__.setISODay)(date, value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  incompatibleTokens = [
    "y",
    "Y",
    "u",
    "q",
    "Q",
    "M",
    "L",
    "w",
    "d",
    "D",
    "E",
    "e",
    "c",
    "t",
    "T",
  ];
}


/***/ }),
/* 92 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "setISODay": () => (/* binding */ setISODay)
/* harmony export */ });
/* harmony import */ var _addDays_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(88);
/* harmony import */ var _getISODay_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(93);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);




/**
 * The {@link setISODay} function options.
 */

/**
 * @name setISODay
 * @category Weekday Helpers
 * @summary Set the day of the ISO week to the given date.
 *
 * @description
 * Set the day of the ISO week to the given date.
 * ISO week starts with Monday.
 * 7 is the index of Sunday, 1 is the index of Monday, etc.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The date to be changed
 * @param day - The day of the ISO week of the new date
 * @param options - An object with options
 *
 * @returns The new date with the day of the ISO week set
 *
 * @example
 * // Set Sunday to 1 September 2014:
 * const result = setISODay(new Date(2014, 8, 1), 7)
 * //=> Sun Sep 07 2014 00:00:00
 */
function setISODay(date, day, options) {
  const date_ = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in);
  const currentDay = (0,_getISODay_js__WEBPACK_IMPORTED_MODULE_1__.getISODay)(date_, options);
  const diff = day - currentDay;
  return (0,_addDays_js__WEBPACK_IMPORTED_MODULE_2__.addDays)(date_, diff, options);
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (setISODay);


/***/ }),
/* 93 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "getISODay": () => (/* binding */ getISODay)
/* harmony export */ });
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);


/**
 * The {@link getISODay} function options.
 */

/**
 * @name getISODay
 * @category Weekday Helpers
 * @summary Get the day of the ISO week of the given date.
 *
 * @description
 * Get the day of the ISO week of the given date,
 * which is 7 for Sunday, 1 for Monday etc.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param date - The given date
 * @param options - An object with options
 *
 * @returns The day of ISO week
 *
 * @example
 * // Which day of the ISO week is 26 February 2012?
 * const result = getISODay(new Date(2012, 1, 26))
 * //=> 7
 */
function getISODay(date, options) {
  const day = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in).getDay();
  return day === 0 ? 7 : day;
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getISODay);


/***/ }),
/* 94 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AMPMParser": () => (/* binding */ AMPMParser)
/* harmony export */ });
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);




class AMPMParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 80;

  parse(dateString, token, match) {
    switch (token) {
      case "a":
      case "aa":
      case "aaa":
        return (
          match.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting",
          })
        );

      case "aaaaa":
        return match.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting",
        });
      case "aaaa":
      default:
        return (
          match.dayPeriod(dateString, {
            width: "wide",
            context: "formatting",
          }) ||
          match.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting",
          })
        );
    }
  }

  set(date, _flags, value) {
    date.setHours((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.dayPeriodEnumToHours)(value), 0, 0, 0);
    return date;
  }

  incompatibleTokens = ["b", "B", "H", "k", "t", "T"];
}


/***/ }),
/* 95 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AMPMMidnightParser": () => (/* binding */ AMPMMidnightParser)
/* harmony export */ });
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);




class AMPMMidnightParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 80;

  parse(dateString, token, match) {
    switch (token) {
      case "b":
      case "bb":
      case "bbb":
        return (
          match.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting",
          })
        );

      case "bbbbb":
        return match.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting",
        });
      case "bbbb":
      default:
        return (
          match.dayPeriod(dateString, {
            width: "wide",
            context: "formatting",
          }) ||
          match.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting",
          })
        );
    }
  }

  set(date, _flags, value) {
    date.setHours((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.dayPeriodEnumToHours)(value), 0, 0, 0);
    return date;
  }

  incompatibleTokens = ["a", "B", "H", "k", "t", "T"];
}


/***/ }),
/* 96 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DayPeriodParser": () => (/* binding */ DayPeriodParser)
/* harmony export */ });
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);




// in the morning, in the afternoon, in the evening, at night
class DayPeriodParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 80;

  parse(dateString, token, match) {
    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return (
          match.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting",
          })
        );

      case "BBBBB":
        return match.dayPeriod(dateString, {
          width: "narrow",
          context: "formatting",
        });
      case "BBBB":
      default:
        return (
          match.dayPeriod(dateString, {
            width: "wide",
            context: "formatting",
          }) ||
          match.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting",
          }) ||
          match.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting",
          })
        );
    }
  }

  set(date, _flags, value) {
    date.setHours((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.dayPeriodEnumToHours)(value), 0, 0, 0);
    return date;
  }

  incompatibleTokens = ["a", "b", "t", "T"];
}


/***/ }),
/* 97 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Hour1to12Parser": () => (/* binding */ Hour1to12Parser)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





class Hour1to12Parser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 70;

  parse(dateString, token, match) {
    switch (token) {
      case "h":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.hour12h, dateString);
      case "ho":
        return match.ordinalNumber(dateString, { unit: "hour" });
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
    }
  }

  validate(_date, value) {
    return value >= 1 && value <= 12;
  }

  set(date, _flags, value) {
    const isPM = date.getHours() >= 12;
    if (isPM && value < 12) {
      date.setHours(value + 12, 0, 0, 0);
    } else if (!isPM && value === 12) {
      date.setHours(0, 0, 0, 0);
    } else {
      date.setHours(value, 0, 0, 0);
    }
    return date;
  }

  incompatibleTokens = ["H", "K", "k", "t", "T"];
}


/***/ }),
/* 98 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Hour0to23Parser": () => (/* binding */ Hour0to23Parser)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





class Hour0to23Parser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 70;

  parse(dateString, token, match) {
    switch (token) {
      case "H":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.hour23h, dateString);
      case "Ho":
        return match.ordinalNumber(dateString, { unit: "hour" });
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
    }
  }

  validate(_date, value) {
    return value >= 0 && value <= 23;
  }

  set(date, _flags, value) {
    date.setHours(value, 0, 0, 0);
    return date;
  }

  incompatibleTokens = ["a", "b", "h", "K", "k", "t", "T"];
}


/***/ }),
/* 99 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Hour0To11Parser": () => (/* binding */ Hour0To11Parser)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





class Hour0To11Parser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 70;

  parse(dateString, token, match) {
    switch (token) {
      case "K":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.hour11h, dateString);
      case "Ko":
        return match.ordinalNumber(dateString, { unit: "hour" });
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
    }
  }

  validate(_date, value) {
    return value >= 0 && value <= 11;
  }

  set(date, _flags, value) {
    const isPM = date.getHours() >= 12;
    if (isPM && value < 12) {
      date.setHours(value + 12, 0, 0, 0);
    } else {
      date.setHours(value, 0, 0, 0);
    }
    return date;
  }

  incompatibleTokens = ["h", "H", "k", "t", "T"];
}


/***/ }),
/* 100 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Hour1To24Parser": () => (/* binding */ Hour1To24Parser)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





class Hour1To24Parser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 70;

  parse(dateString, token, match) {
    switch (token) {
      case "k":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.hour24h, dateString);
      case "ko":
        return match.ordinalNumber(dateString, { unit: "hour" });
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
    }
  }

  validate(_date, value) {
    return value >= 1 && value <= 24;
  }

  set(date, _flags, value) {
    const hours = value <= 24 ? value % 24 : value;
    date.setHours(hours, 0, 0, 0);
    return date;
  }

  incompatibleTokens = ["a", "b", "h", "H", "K", "t", "T"];
}


/***/ }),
/* 101 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MinuteParser": () => (/* binding */ MinuteParser)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





class MinuteParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 60;

  parse(dateString, token, match) {
    switch (token) {
      case "m":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.minute, dateString);
      case "mo":
        return match.ordinalNumber(dateString, { unit: "minute" });
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
    }
  }

  validate(_date, value) {
    return value >= 0 && value <= 59;
  }

  set(date, _flags, value) {
    date.setMinutes(value, 0, 0);
    return date;
  }

  incompatibleTokens = ["t", "T"];
}


/***/ }),
/* 102 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SecondParser": () => (/* binding */ SecondParser)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





class SecondParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 50;

  parse(dateString, token, match) {
    switch (token) {
      case "s":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNumericPattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.numericPatterns.second, dateString);
      case "so":
        return match.ordinalNumber(dateString, { unit: "second" });
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString);
    }
  }

  validate(_date, value) {
    return value >= 0 && value <= 59;
  }

  set(date, _flags, value) {
    date.setSeconds(value, 0);
    return date;
  }

  incompatibleTokens = ["t", "T"];
}


/***/ }),
/* 103 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FractionOfSecondParser": () => (/* binding */ FractionOfSecondParser)
/* harmony export */ });
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);




class FractionOfSecondParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 30;

  parse(dateString, token) {
    const valueCallback = (value) =>
      Math.trunc(value * Math.pow(10, -token.length + 3));
    return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.mapValue)((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseNDigits)(token.length, dateString), valueCallback);
  }

  set(date, _flags, value) {
    date.setMilliseconds(value);
    return date;
  }

  incompatibleTokens = ["t", "T"];
}


/***/ }),
/* 104 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ISOTimezoneWithZParser": () => (/* binding */ ISOTimezoneWithZParser)
/* harmony export */ });
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(57);
/* harmony import */ var _lib_getTimezoneOffsetInMilliseconds_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(105);
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);







// Timezone (ISO-8601. +00:00 is `'Z'`)
class ISOTimezoneWithZParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 10;

  parse(dateString, token) {
    switch (token) {
      case "X":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseTimezonePattern)(
          _constants_js__WEBPACK_IMPORTED_MODULE_2__.timezonePatterns.basicOptionalMinutes,
          dateString,
        );
      case "XX":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseTimezonePattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.timezonePatterns.basic, dateString);
      case "XXXX":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseTimezonePattern)(
          _constants_js__WEBPACK_IMPORTED_MODULE_2__.timezonePatterns.basicOptionalSeconds,
          dateString,
        );
      case "XXXXX":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseTimezonePattern)(
          _constants_js__WEBPACK_IMPORTED_MODULE_2__.timezonePatterns.extendedOptionalSeconds,
          dateString,
        );
      case "XXX":
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseTimezonePattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.timezonePatterns.extended, dateString);
    }
  }

  set(date, flags, value) {
    if (flags.timestampIsSet) return date;
    return (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_3__.constructFrom)(
      date,
      date.getTime() - (0,_lib_getTimezoneOffsetInMilliseconds_js__WEBPACK_IMPORTED_MODULE_4__.getTimezoneOffsetInMilliseconds)(date) - value,
    );
  }

  incompatibleTokens = ["t", "T", "x"];
}


/***/ }),
/* 105 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getTimezoneOffsetInMilliseconds": () => (/* binding */ getTimezoneOffsetInMilliseconds)
/* harmony export */ });
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);


/**
 * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
 * They usually appear for dates that denote time before the timezones were introduced
 * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
 * and GMT+01:00:00 after that date)
 *
 * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
 * which would lead to incorrect calculations.
 *
 * This function returns the timezone offset in milliseconds that takes seconds in account.
 */
function getTimezoneOffsetInMilliseconds(date) {
  const _date = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date);
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds(),
    ),
  );
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date - +utcDate;
}


/***/ }),
/* 106 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ISOTimezoneParser": () => (/* binding */ ISOTimezoneParser)
/* harmony export */ });
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(57);
/* harmony import */ var _lib_getTimezoneOffsetInMilliseconds_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(105);
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(62);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);







// Timezone (ISO-8601)
class ISOTimezoneParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 10;

  parse(dateString, token) {
    switch (token) {
      case "x":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseTimezonePattern)(
          _constants_js__WEBPACK_IMPORTED_MODULE_2__.timezonePatterns.basicOptionalMinutes,
          dateString,
        );
      case "xx":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseTimezonePattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.timezonePatterns.basic, dateString);
      case "xxxx":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseTimezonePattern)(
          _constants_js__WEBPACK_IMPORTED_MODULE_2__.timezonePatterns.basicOptionalSeconds,
          dateString,
        );
      case "xxxxx":
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseTimezonePattern)(
          _constants_js__WEBPACK_IMPORTED_MODULE_2__.timezonePatterns.extendedOptionalSeconds,
          dateString,
        );
      case "xxx":
      default:
        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseTimezonePattern)(_constants_js__WEBPACK_IMPORTED_MODULE_2__.timezonePatterns.extended, dateString);
    }
  }

  set(date, flags, value) {
    if (flags.timestampIsSet) return date;
    return (0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_3__.constructFrom)(
      date,
      date.getTime() - (0,_lib_getTimezoneOffsetInMilliseconds_js__WEBPACK_IMPORTED_MODULE_4__.getTimezoneOffsetInMilliseconds)(date) - value,
    );
  }

  incompatibleTokens = ["t", "T", "X"];
}


/***/ }),
/* 107 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TimestampSecondsParser": () => (/* binding */ TimestampSecondsParser)
/* harmony export */ });
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(57);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





class TimestampSecondsParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 40;

  parse(dateString) {
    return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseAnyDigitsSigned)(dateString);
  }

  set(date, _flags, value) {
    return [(0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_2__.constructFrom)(date, value * 1000), { timestampIsSet: true }];
  }

  incompatibleTokens = "*";
}


/***/ }),
/* 108 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TimestampMillisecondsParser": () => (/* binding */ TimestampMillisecondsParser)
/* harmony export */ });
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(57);
/* harmony import */ var _Parser_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(61);





class TimestampMillisecondsParser extends _Parser_js__WEBPACK_IMPORTED_MODULE_0__.Parser {
  priority = 20;

  parse(dateString) {
    return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.parseAnyDigitsSigned)(dateString);
  }

  set(date, _flags, value) {
    return [(0,_constructFrom_js__WEBPACK_IMPORTED_MODULE_2__.constructFrom)(date, value), { timestampIsSet: true }];
  }

  incompatibleTokens = "*";
}


/***/ }),
/* 109 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "getDefaultOptions": () => (/* binding */ getDefaultOptions)
/* harmony export */ });
/* harmony import */ var _lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(66);


/**
 * @name getDefaultOptions
 * @category Common Helpers
 * @summary Get default options.
 * @pure false
 *
 * @description
 * Returns an object that contains defaults for
 * `options.locale`, `options.weekStartsOn` and `options.firstWeekContainsDate`
 * arguments for all functions.
 *
 * You can change these with [setDefaultOptions](https://date-fns.org/docs/setDefaultOptions).
 *
 * @returns The default options
 *
 * @example
 * const result = getDefaultOptions()
 * //=> {}
 *
 * @example
 * setDefaultOptions({ weekStarsOn: 1, firstWeekContainsDate: 4 })
 * const result = getDefaultOptions()
 * //=> { weekStarsOn: 1, firstWeekContainsDate: 4 }
 */
function getDefaultOptions() {
  return Object.assign({}, (0,_lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_0__.getDefaultOptions)());
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getDefaultOptions);


/***/ }),
/* 110 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "enUS": () => (/* binding */ enUS)
/* harmony export */ });
/* harmony import */ var _en_US_lib_formatDistance_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(111);
/* harmony import */ var _en_US_lib_formatLong_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(112);
/* harmony import */ var _en_US_lib_formatRelative_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(114);
/* harmony import */ var _en_US_lib_localize_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(115);
/* harmony import */ var _en_US_lib_match_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(117);






/**
 * @category Locales
 * @summary English locale (United States).
 * @language English
 * @iso-639-2 eng
 * @author Sasha Koss [@kossnocorp](https://github.com/kossnocorp)
 * @author Lesha Koss [@leshakoss](https://github.com/leshakoss)
 */
const enUS = {
  code: "en-US",
  formatDistance: _en_US_lib_formatDistance_js__WEBPACK_IMPORTED_MODULE_0__.formatDistance,
  formatLong: _en_US_lib_formatLong_js__WEBPACK_IMPORTED_MODULE_1__.formatLong,
  formatRelative: _en_US_lib_formatRelative_js__WEBPACK_IMPORTED_MODULE_2__.formatRelative,
  localize: _en_US_lib_localize_js__WEBPACK_IMPORTED_MODULE_3__.localize,
  match: _en_US_lib_match_js__WEBPACK_IMPORTED_MODULE_4__.match,
  options: {
    weekStartsOn: 0 /* Sunday */,
    firstWeekContainsDate: 1,
  },
};

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (enUS);


/***/ }),
/* 111 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatDistance": () => (/* binding */ formatDistance)
/* harmony export */ });
const formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds",
  },

  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds",
  },

  halfAMinute: "half a minute",

  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes",
  },

  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes",
  },

  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours",
  },

  xHours: {
    one: "1 hour",
    other: "{{count}} hours",
  },

  xDays: {
    one: "1 day",
    other: "{{count}} days",
  },

  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks",
  },

  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks",
  },

  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months",
  },

  xMonths: {
    one: "1 month",
    other: "{{count}} months",
  },

  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years",
  },

  xYears: {
    one: "1 year",
    other: "{{count}} years",
  },

  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years",
  },

  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years",
  },
};

const formatDistance = (token, count, options) => {
  let result;

  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }

  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }

  return result;
};


/***/ }),
/* 112 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatLong": () => (/* binding */ formatLong)
/* harmony export */ });
/* harmony import */ var _lib_buildFormatLongFn_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(113);


const dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy",
};

const timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a",
};

const dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}",
};

const formatLong = {
  date: (0,_lib_buildFormatLongFn_js__WEBPACK_IMPORTED_MODULE_0__.buildFormatLongFn)({
    formats: dateFormats,
    defaultWidth: "full",
  }),

  time: (0,_lib_buildFormatLongFn_js__WEBPACK_IMPORTED_MODULE_0__.buildFormatLongFn)({
    formats: timeFormats,
    defaultWidth: "full",
  }),

  dateTime: (0,_lib_buildFormatLongFn_js__WEBPACK_IMPORTED_MODULE_0__.buildFormatLongFn)({
    formats: dateTimeFormats,
    defaultWidth: "full",
  }),
};


/***/ }),
/* 113 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "buildFormatLongFn": () => (/* binding */ buildFormatLongFn)
/* harmony export */ });
function buildFormatLongFn(args) {
  return (options = {}) => {
    // TODO: Remove String()
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format = args.formats[width] || args.formats[args.defaultWidth];
    return format;
  };
}


/***/ }),
/* 114 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatRelative": () => (/* binding */ formatRelative)
/* harmony export */ });
const formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P",
};

const formatRelative = (token, _date, _baseDate, _options) =>
  formatRelativeLocale[token];


/***/ }),
/* 115 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "localize": () => (/* binding */ localize)
/* harmony export */ });
/* harmony import */ var _lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(116);


const eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"],
};

const quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"],
};

// Note: in English, the names of days of the week and months are capitalized.
// If you are making a new locale based on this one, check if the same is true for the language you're working on.
// Generally, formatted dates should look like they are in the middle of a sentence,
// e.g. in Spanish language the weekdays and months should be in the lowercase.
const monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],

  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

const dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};

const dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
  },
};

const formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night",
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night",
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night",
  },
};

const ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);

  // If ordinal numbers depend on context, for example,
  // if they are different for different grammatical genders,
  // use `options.unit`.
  //
  // `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
  // 'day', 'hour', 'minute', 'second'.

  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};

const localize = {
  ordinalNumber,

  era: (0,_lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__.buildLocalizeFn)({
    values: eraValues,
    defaultWidth: "wide",
  }),

  quarter: (0,_lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__.buildLocalizeFn)({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1,
  }),

  month: (0,_lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__.buildLocalizeFn)({
    values: monthValues,
    defaultWidth: "wide",
  }),

  day: (0,_lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__.buildLocalizeFn)({
    values: dayValues,
    defaultWidth: "wide",
  }),

  dayPeriod: (0,_lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__.buildLocalizeFn)({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide",
  }),
};


/***/ }),
/* 116 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "buildLocalizeFn": () => (/* binding */ buildLocalizeFn)
/* harmony export */ });
/**
 * The localize function argument callback which allows to convert raw value to
 * the actual type.
 *
 * @param value - The value to convert
 *
 * @returns The converted value
 */

/**
 * The map of localized values for each width.
 */

/**
 * The index type of the locale unit value. It types conversion of units of
 * values that don't start at 0 (i.e. quarters).
 */

/**
 * Converts the unit value to the tuple of values.
 */

/**
 * The tuple of localized era values. The first element represents BC,
 * the second element represents AD.
 */

/**
 * The tuple of localized quarter values. The first element represents Q1.
 */

/**
 * The tuple of localized day values. The first element represents Sunday.
 */

/**
 * The tuple of localized month values. The first element represents January.
 */

function buildLocalizeFn(args) {
  return (value, options) => {
    const context = options?.context ? String(options.context) : "standalone";

    let valuesArray;
    if (context === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = options?.width ? String(options.width) : defaultWidth;

      valuesArray =
        args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = options?.width ? String(options.width) : args.defaultWidth;

      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index = args.argumentCallback ? args.argumentCallback(value) : value;

    // @ts-expect-error - For some reason TypeScript just don't want to match it, no matter how hard we try. I challenge you to try to remove it!
    return valuesArray[index];
  };
}


/***/ }),
/* 117 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "match": () => (/* binding */ match)
/* harmony export */ });
/* harmony import */ var _lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(119);
/* harmony import */ var _lib_buildMatchPatternFn_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(118);



const matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
const parseOrdinalNumberPattern = /\d+/i;

const matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i,
};
const parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i],
};

const matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i,
};
const parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i],
};

const matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i,
};
const parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i,
  ],

  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i,
  ],
};

const matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i,
};
const parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i],
};

const matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i,
};
const parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i,
  },
};

const match = {
  ordinalNumber: (0,_lib_buildMatchPatternFn_js__WEBPACK_IMPORTED_MODULE_0__.buildMatchPatternFn)({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10),
  }),

  era: (0,_lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__.buildMatchFn)({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any",
  }),

  quarter: (0,_lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__.buildMatchFn)({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1,
  }),

  month: (0,_lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__.buildMatchFn)({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any",
  }),

  day: (0,_lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__.buildMatchFn)({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any",
  }),

  dayPeriod: (0,_lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__.buildMatchFn)({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any",
  }),
};


/***/ }),
/* 118 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "buildMatchPatternFn": () => (/* binding */ buildMatchPatternFn)
/* harmony export */ });
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    const matchedString = matchResult[0];

    const parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    let value = args.valueCallback
      ? args.valueCallback(parseResult[0])
      : parseResult[0];

    // [TODO] I challenge you to fix the type
    value = options.valueCallback ? options.valueCallback(value) : value;

    const rest = string.slice(matchedString.length);

    return { value, rest };
  };
}


/***/ }),
/* 119 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "buildMatchFn": () => (/* binding */ buildMatchFn)
/* harmony export */ });
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;

    const matchPattern =
      (width && args.matchPatterns[width]) ||
      args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);

    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];

    const parsePatterns =
      (width && args.parsePatterns[width]) ||
      args.parsePatterns[args.defaultParseWidth];

    const key = Array.isArray(parsePatterns)
      ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString))
      : // [TODO] -- I challenge you to fix the type
        findKey(parsePatterns, (pattern) => pattern.test(matchedString));

    let value;

    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback
      ? // [TODO] -- I challenge you to fix the type
        options.valueCallback(value)
      : value;

    const rest = string.slice(matchedString.length);

    return { value, rest };
  };
}

function findKey(object, predicate) {
  for (const key in object) {
    if (
      Object.prototype.hasOwnProperty.call(object, key) &&
      predicate(object[key])
    ) {
      return key;
    }
  }
  return undefined;
}

function findIndex(array, predicate) {
  for (let key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return undefined;
}


/***/ }),
/* 120 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isProtectedDayOfYearToken": () => (/* binding */ isProtectedDayOfYearToken),
/* harmony export */   "isProtectedWeekYearToken": () => (/* binding */ isProtectedWeekYearToken),
/* harmony export */   "warnOrThrowProtectedError": () => (/* binding */ warnOrThrowProtectedError)
/* harmony export */ });
const dayOfYearTokenRE = /^D+$/;
const weekYearTokenRE = /^Y+$/;

const throwTokens = ["D", "DD", "YY", "YYYY"];

function isProtectedDayOfYearToken(token) {
  return dayOfYearTokenRE.test(token);
}

function isProtectedWeekYearToken(token) {
  return weekYearTokenRE.test(token);
}

function warnOrThrowProtectedError(token, format, input) {
  const _message = message(token, format, input);
  console.warn(_message);
  if (throwTokens.includes(token)) throw new RangeError(_message);
}

function message(token, format, input) {
  const subject = token[0] === "Y" ? "years" : "days of the month";
  return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}


/***/ }),
/* 121 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "format": () => (/* binding */ format),
/* harmony export */   "formatDate": () => (/* binding */ format),
/* harmony export */   "formatters": () => (/* reexport safe */ _lib_format_formatters_js__WEBPACK_IMPORTED_MODULE_0__.formatters),
/* harmony export */   "longFormatters": () => (/* reexport safe */ _lib_format_longFormatters_js__WEBPACK_IMPORTED_MODULE_1__.longFormatters)
/* harmony export */ });
/* harmony import */ var _lib_defaultLocale_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(110);
/* harmony import */ var _lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(66);
/* harmony import */ var _lib_format_formatters_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(122);
/* harmony import */ var _lib_format_longFormatters_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(52);
/* harmony import */ var _lib_protectedTokens_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(120);
/* harmony import */ var _isValid_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(130);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(65);








// Rexports of internal for libraries to use.
// See: https://github.com/date-fns/date-fns/issues/3638#issuecomment-1877082874


// This RegExp consists of three parts separated by `|`:
// - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
//   (one of the certain letters followed by `o`)
// - (\w)\1* matches any sequences of the same letter
// - '' matches two quote characters in a row
// - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
//   except a single quote symbol, which ends the sequence.
//   Two quote characters do not end the sequence.
//   If there is no matching single quote
//   then the sequence will continue until the end of the string.
// - . matches any single character unmatched by previous parts of the RegExps
const formattingTokensRegExp =
  /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;

// This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
const longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

const escapedStringRegExp = /^'([^]*?)'?$/;
const doubleQuoteRegExp = /''/g;
const unescapedLatinCharacterRegExp = /[a-zA-Z]/;



/**
 * The {@link format} function options.
 */

/**
 * @name format
 * @alias formatDate
 * @category Common Helpers
 * @summary Format the date.
 *
 * @description
 * Return the formatted date string in the given format. The result may vary by locale.
 *
 * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
 * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * The characters wrapped between two single quotes characters (') are escaped.
 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
 * (see the last example)
 *
 * Format of the string is based on Unicode Technical Standard #35:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * with a few additions (see note 7 below the table).
 *
 * Accepted patterns:
 * | Unit                            | Pattern | Result examples                   | Notes |
 * |---------------------------------|---------|-----------------------------------|-------|
 * | Era                             | G..GGG  | AD, BC                            |       |
 * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
 * |                                 | GGGGG   | A, B                              |       |
 * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
 * |                                 | yy      | 44, 01, 00, 17                    | 5     |
 * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
 * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
 * |                                 | yyyyy   | ...                               | 3,5   |
 * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
 * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
 * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
 * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
 * |                                 | YYYYY   | ...                               | 3,5   |
 * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
 * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
 * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
 * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
 * |                                 | RRRRR   | ...                               | 3,5,7 |
 * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
 * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
 * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
 * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
 * |                                 | uuuuu   | ...                               | 3,5   |
 * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
 * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | QQ      | 01, 02, 03, 04                    |       |
 * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
 * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
 * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | qq      | 01, 02, 03, 04                    |       |
 * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
 * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
 * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | MM      | 01, 02, ..., 12                   |       |
 * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
 * |                                 | MMMM    | January, February, ..., December  | 2     |
 * |                                 | MMMMM   | J, F, ..., D                      |       |
 * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
 * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | LL      | 01, 02, ..., 12                   |       |
 * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
 * |                                 | LLLL    | January, February, ..., December  | 2     |
 * |                                 | LLLLL   | J, F, ..., D                      |       |
 * | Local week of year              | w       | 1, 2, ..., 53                     |       |
 * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | ww      | 01, 02, ..., 53                   |       |
 * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
 * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | II      | 01, 02, ..., 53                   | 7     |
 * | Day of month                    | d       | 1, 2, ..., 31                     |       |
 * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
 * |                                 | dd      | 01, 02, ..., 31                   |       |
 * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
 * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
 * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
 * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
 * |                                 | DDDD    | ...                               | 3     |
 * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
 * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
 * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
 * |                                 | ii      | 01, 02, ..., 07                   | 7     |
 * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
 * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
 * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
 * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
 * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
 * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | ee      | 02, 03, ..., 01                   |       |
 * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
 * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
 * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | cc      | 02, 03, ..., 01                   |       |
 * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
 * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | AM, PM                          | a..aa   | AM, PM                            |       |
 * |                                 | aaa     | am, pm                            |       |
 * |                                 | aaaa    | a.m., p.m.                        | 2     |
 * |                                 | aaaaa   | a, p                              |       |
 * | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
 * |                                 | bbb     | am, pm, noon, midnight            |       |
 * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
 * |                                 | bbbbb   | a, p, n, mi                       |       |
 * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
 * |                                 | BBBB    | at night, in the morning, ...     | 2     |
 * |                                 | BBBBB   | at night, in the morning, ...     |       |
 * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
 * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
 * |                                 | hh      | 01, 02, ..., 11, 12               |       |
 * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
 * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
 * |                                 | HH      | 00, 01, 02, ..., 23               |       |
 * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
 * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
 * |                                 | KK      | 01, 02, ..., 11, 00               |       |
 * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
 * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
 * |                                 | kk      | 24, 01, 02, ..., 23               |       |
 * | Minute                          | m       | 0, 1, ..., 59                     |       |
 * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | mm      | 00, 01, ..., 59                   |       |
 * | Second                          | s       | 0, 1, ..., 59                     |       |
 * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | ss      | 00, 01, ..., 59                   |       |
 * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
 * |                                 | SS      | 00, 01, ..., 99                   |       |
 * |                                 | SSS     | 000, 001, ..., 999                |       |
 * |                                 | SSSS    | ...                               | 3     |
 * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
 * |                                 | XX      | -0800, +0530, Z                   |       |
 * |                                 | XXX     | -08:00, +05:30, Z                 |       |
 * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
 * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
 * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
 * |                                 | xx      | -0800, +0530, +0000               |       |
 * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
 * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
 * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
 * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
 * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
 * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
 * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
 * | Seconds timestamp               | t       | 512969520                         | 7     |
 * |                                 | tt      | ...                               | 3,7   |
 * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
 * |                                 | TT      | ...                               | 3,7   |
 * | Long localized date             | P       | 04/29/1453                        | 7     |
 * |                                 | PP      | Apr 29, 1453                      | 7     |
 * |                                 | PPP     | April 29th, 1453                  | 7     |
 * |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
 * | Long localized time             | p       | 12:00 AM                          | 7     |
 * |                                 | pp      | 12:00:00 AM                       | 7     |
 * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
 * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
 * | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
 * |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
 * |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
 * |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
 * Notes:
 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
 *    are the same as "stand-alone" units, but are different in some languages.
 *    "Formatting" units are declined according to the rules of the language
 *    in the context of a date. "Stand-alone" units are always nominative singular:
 *
 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
 *
 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
 *
 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
 *    the single quote characters (see below).
 *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
 *    the output will be the same as default pattern for this unit, usually
 *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
 *    are marked with "2" in the last column of the table.
 *
 *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
 *
 * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
 *    The output will be padded with zeros to match the length of the pattern.
 *
 *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
 *
 * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
 *    These tokens represent the shortest form of the quarter.
 *
 * 5. The main difference between `y` and `u` patterns are B.C. years:
 *
 *    | Year | `y` | `u` |
 *    |------|-----|-----|
 *    | AC 1 |   1 |   1 |
 *    | BC 1 |   1 |   0 |
 *    | BC 2 |   2 |  -1 |
 *
 *    Also `yy` always returns the last two digits of a year,
 *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
 *
 *    | Year | `yy` | `uu` |
 *    |------|------|------|
 *    | 1    |   01 |   01 |
 *    | 14   |   14 |   14 |
 *    | 376  |   76 |  376 |
 *    | 1453 |   53 | 1453 |
 *
 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
 *    except local week-numbering years are dependent on `options.weekStartsOn`
 *    and `options.firstWeekContainsDate` (compare [getISOWeekYear](https://date-fns.org/docs/getISOWeekYear)
 *    and [getWeekYear](https://date-fns.org/docs/getWeekYear)).
 *
 * 6. Specific non-location timezones are currently unavailable in `date-fns`,
 *    so right now these tokens fall back to GMT timezones.
 *
 * 7. These patterns are not in the Unicode Technical Standard #35:
 *    - `i`: ISO day of week
 *    - `I`: ISO week of year
 *    - `R`: ISO week-numbering year
 *    - `t`: seconds timestamp
 *    - `T`: milliseconds timestamp
 *    - `o`: ordinal number modifier
 *    - `P`: long localized date
 *    - `p`: long localized time
 *
 * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
 *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * 9. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
 *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * @param date - The original date
 * @param format - The string of tokens
 * @param options - An object with options
 *
 * @returns The formatted date string
 *
 * @throws `date` must not be Invalid Date
 * @throws `options.locale` must contain `localize` property
 * @throws `options.locale` must contain `formatLong` property
 * @throws use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws format string contains an unescaped latin alphabet character
 *
 * @example
 * // Represent 11 February 2014 in middle-endian format:
 * const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
 * //=> '02/11/2014'
 *
 * @example
 * // Represent 2 July 2014 in Esperanto:
 * import { eoLocale } from 'date-fns/locale/eo'
 * const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
 *   locale: eoLocale
 * })
 * //=> '2-a de julio 2014'
 *
 * @example
 * // Escape string by single quote characters:
 * const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
 * //=> "3 o'clock"
 */
function format(date, formatStr, options) {
  const defaultOptions = (0,_lib_defaultOptions_js__WEBPACK_IMPORTED_MODULE_2__.getDefaultOptions)();
  const locale = options?.locale ?? defaultOptions.locale ?? _lib_defaultLocale_js__WEBPACK_IMPORTED_MODULE_3__.enUS;

  const firstWeekContainsDate =
    options?.firstWeekContainsDate ??
    options?.locale?.options?.firstWeekContainsDate ??
    defaultOptions.firstWeekContainsDate ??
    defaultOptions.locale?.options?.firstWeekContainsDate ??
    1;

  const weekStartsOn =
    options?.weekStartsOn ??
    options?.locale?.options?.weekStartsOn ??
    defaultOptions.weekStartsOn ??
    defaultOptions.locale?.options?.weekStartsOn ??
    0;

  const originalDate = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_4__.toDate)(date, options?.in);

  if (!(0,_isValid_js__WEBPACK_IMPORTED_MODULE_5__.isValid)(originalDate)) {
    throw new RangeError("Invalid time value");
  }

  let parts = formatStr
    .match(longFormattingTokensRegExp)
    .map((substring) => {
      const firstCharacter = substring[0];
      if (firstCharacter === "p" || firstCharacter === "P") {
        const longFormatter = _lib_format_longFormatters_js__WEBPACK_IMPORTED_MODULE_1__.longFormatters[firstCharacter];
        return longFormatter(substring, locale.formatLong);
      }
      return substring;
    })
    .join("")
    .match(formattingTokensRegExp)
    .map((substring) => {
      // Replace two single quote characters with one single quote character
      if (substring === "''") {
        return { isToken: false, value: "'" };
      }

      const firstCharacter = substring[0];
      if (firstCharacter === "'") {
        return { isToken: false, value: cleanEscapedString(substring) };
      }

      if (_lib_format_formatters_js__WEBPACK_IMPORTED_MODULE_0__.formatters[firstCharacter]) {
        return { isToken: true, value: substring };
      }

      if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" +
            firstCharacter +
            "`",
        );
      }

      return { isToken: false, value: substring };
    });

  // invoke localize preprocessor (only for french locales at the moment)
  if (locale.localize.preprocessor) {
    parts = locale.localize.preprocessor(originalDate, parts);
  }

  const formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale,
  };

  return parts
    .map((part) => {
      if (!part.isToken) return part.value;

      const token = part.value;

      if (
        (!options?.useAdditionalWeekYearTokens &&
          (0,_lib_protectedTokens_js__WEBPACK_IMPORTED_MODULE_6__.isProtectedWeekYearToken)(token)) ||
        (!options?.useAdditionalDayOfYearTokens &&
          (0,_lib_protectedTokens_js__WEBPACK_IMPORTED_MODULE_6__.isProtectedDayOfYearToken)(token))
      ) {
        (0,_lib_protectedTokens_js__WEBPACK_IMPORTED_MODULE_6__.warnOrThrowProtectedError)(token, formatStr, String(date));
      }

      const formatter = _lib_format_formatters_js__WEBPACK_IMPORTED_MODULE_0__.formatters[token[0]];
      return formatter(originalDate, token, locale.localize, formatterOptions);
    })
    .join("");
}

function cleanEscapedString(input) {
  const matched = input.match(escapedStringRegExp);

  if (!matched) {
    return input;
  }

  return matched[1].replace(doubleQuoteRegExp, "'");
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (format);


/***/ }),
/* 122 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatters": () => (/* binding */ formatters)
/* harmony export */ });
/* harmony import */ var _getDayOfYear_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(125);
/* harmony import */ var _getISOWeek_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(81);
/* harmony import */ var _getISOWeekYear_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(83);
/* harmony import */ var _getWeek_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(77);
/* harmony import */ var _getWeekYear_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(64);
/* harmony import */ var _addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(124);
/* harmony import */ var _lightFormatters_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(123);









const dayPeriodEnum = {
  am: "am",
  pm: "pm",
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night",
};

/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* | Milliseconds in day            |
 * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
 * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
 * |  d  | Day of month                   |  D  | Day of year                    |
 * |  e  | Local day of week              |  E  | Day of week                    |
 * |  f  |                                |  F* | Day of week in month           |
 * |  g* | Modified Julian day            |  G  | Era                            |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  i! | ISO day of week                |  I! | ISO week of year               |
 * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
 * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
 * |  l* | (deprecated)                   |  L  | Stand-alone month              |
 * |  m  | Minute                         |  M  | Month                          |
 * |  n  |                                |  N  |                                |
 * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
 * |  p! | Long localized time            |  P! | Long localized date            |
 * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
 * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
 * |  u  | Extended year                  |  U* | Cyclic year                    |
 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
 * |  w  | Local week of year             |  W* | Week of month                  |
 * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
 * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
 * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 *
 * Letters marked by ! are non-standard, but implemented by date-fns:
 * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
 * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
 *   i.e. 7 for Sunday, 1 for Monday, etc.
 * - `I` is ISO week of year, as opposed to `w` which is local week of year.
 * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
 *   `R` is supposed to be used in conjunction with `I` and `i`
 *   for universal ISO week-numbering date, whereas
 *   `Y` is supposed to be used in conjunction with `w` and `e`
 *   for week-numbering date specific to the locale.
 * - `P` is long localized date format
 * - `p` is long localized time format
 */

const formatters = {
  // Era
  G: function (date, token, localize) {
    const era = date.getFullYear() > 0 ? 1 : 0;
    switch (token) {
      // AD, BC
      case "G":
      case "GG":
      case "GGG":
        return localize.era(era, { width: "abbreviated" });
      // A, B
      case "GGGGG":
        return localize.era(era, { width: "narrow" });
      // Anno Domini, Before Christ
      case "GGGG":
      default:
        return localize.era(era, { width: "wide" });
    }
  },

  // Year
  y: function (date, token, localize) {
    // Ordinal number
    if (token === "yo") {
      const signedYear = date.getFullYear();
      // Returns 1 for 1 BC (which is year 0 in JavaScript)
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize.ordinalNumber(year, { unit: "year" });
    }

    return _lightFormatters_js__WEBPACK_IMPORTED_MODULE_0__.lightFormatters.y(date, token);
  },

  // Local week-numbering year
  Y: function (date, token, localize, options) {
    const signedWeekYear = (0,_getWeekYear_js__WEBPACK_IMPORTED_MODULE_1__.getWeekYear)(date, options);
    // Returns 1 for 1 BC (which is year 0 in JavaScript)
    const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;

    // Two digit year
    if (token === "YY") {
      const twoDigitYear = weekYear % 100;
      return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(twoDigitYear, 2);
    }

    // Ordinal number
    if (token === "Yo") {
      return localize.ordinalNumber(weekYear, { unit: "year" });
    }

    // Padding
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(weekYear, token.length);
  },

  // ISO week-numbering year
  R: function (date, token) {
    const isoWeekYear = (0,_getISOWeekYear_js__WEBPACK_IMPORTED_MODULE_3__.getISOWeekYear)(date);

    // Padding
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(isoWeekYear, token.length);
  },

  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function (date, token) {
    const year = date.getFullYear();
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(year, token.length);
  },

  // Quarter
  Q: function (date, token, localize) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "Q":
        return String(quarter);
      // 01, 02, 03, 04
      case "QQ":
        return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "Qo":
        return localize.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "QQQ":
        return localize.quarter(quarter, {
          width: "abbreviated",
          context: "formatting",
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "QQQQQ":
        return localize.quarter(quarter, {
          width: "narrow",
          context: "formatting",
        });
      // 1st quarter, 2nd quarter, ...
      case "QQQQ":
      default:
        return localize.quarter(quarter, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // Stand-alone quarter
  q: function (date, token, localize) {
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "q":
        return String(quarter);
      // 01, 02, 03, 04
      case "qq":
        return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "qo":
        return localize.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "qqq":
        return localize.quarter(quarter, {
          width: "abbreviated",
          context: "standalone",
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "qqqqq":
        return localize.quarter(quarter, {
          width: "narrow",
          context: "standalone",
        });
      // 1st quarter, 2nd quarter, ...
      case "qqqq":
      default:
        return localize.quarter(quarter, {
          width: "wide",
          context: "standalone",
        });
    }
  },

  // Month
  M: function (date, token, localize) {
    const month = date.getMonth();
    switch (token) {
      case "M":
      case "MM":
        return _lightFormatters_js__WEBPACK_IMPORTED_MODULE_0__.lightFormatters.M(date, token);
      // 1st, 2nd, ..., 12th
      case "Mo":
        return localize.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "MMM":
        return localize.month(month, {
          width: "abbreviated",
          context: "formatting",
        });
      // J, F, ..., D
      case "MMMMM":
        return localize.month(month, {
          width: "narrow",
          context: "formatting",
        });
      // January, February, ..., December
      case "MMMM":
      default:
        return localize.month(month, { width: "wide", context: "formatting" });
    }
  },

  // Stand-alone month
  L: function (date, token, localize) {
    const month = date.getMonth();
    switch (token) {
      // 1, 2, ..., 12
      case "L":
        return String(month + 1);
      // 01, 02, ..., 12
      case "LL":
        return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(month + 1, 2);
      // 1st, 2nd, ..., 12th
      case "Lo":
        return localize.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "LLL":
        return localize.month(month, {
          width: "abbreviated",
          context: "standalone",
        });
      // J, F, ..., D
      case "LLLLL":
        return localize.month(month, {
          width: "narrow",
          context: "standalone",
        });
      // January, February, ..., December
      case "LLLL":
      default:
        return localize.month(month, { width: "wide", context: "standalone" });
    }
  },

  // Local week of year
  w: function (date, token, localize, options) {
    const week = (0,_getWeek_js__WEBPACK_IMPORTED_MODULE_4__.getWeek)(date, options);

    if (token === "wo") {
      return localize.ordinalNumber(week, { unit: "week" });
    }

    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(week, token.length);
  },

  // ISO week of year
  I: function (date, token, localize) {
    const isoWeek = (0,_getISOWeek_js__WEBPACK_IMPORTED_MODULE_5__.getISOWeek)(date);

    if (token === "Io") {
      return localize.ordinalNumber(isoWeek, { unit: "week" });
    }

    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(isoWeek, token.length);
  },

  // Day of the month
  d: function (date, token, localize) {
    if (token === "do") {
      return localize.ordinalNumber(date.getDate(), { unit: "date" });
    }

    return _lightFormatters_js__WEBPACK_IMPORTED_MODULE_0__.lightFormatters.d(date, token);
  },

  // Day of year
  D: function (date, token, localize) {
    const dayOfYear = (0,_getDayOfYear_js__WEBPACK_IMPORTED_MODULE_6__.getDayOfYear)(date);

    if (token === "Do") {
      return localize.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
    }

    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(dayOfYear, token.length);
  },

  // Day of week
  E: function (date, token, localize) {
    const dayOfWeek = date.getDay();
    switch (token) {
      // Tue
      case "E":
      case "EE":
      case "EEE":
        return localize.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting",
        });
      // T
      case "EEEEE":
        return localize.day(dayOfWeek, {
          width: "narrow",
          context: "formatting",
        });
      // Tu
      case "EEEEEE":
        return localize.day(dayOfWeek, {
          width: "short",
          context: "formatting",
        });
      // Tuesday
      case "EEEE":
      default:
        return localize.day(dayOfWeek, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // Local day of week
  e: function (date, token, localize, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case "e":
        return String(localDayOfWeek);
      // Padded numerical value
      case "ee":
        return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(localDayOfWeek, 2);
      // 1st, 2nd, ..., 7th
      case "eo":
        return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "eee":
        return localize.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting",
        });
      // T
      case "eeeee":
        return localize.day(dayOfWeek, {
          width: "narrow",
          context: "formatting",
        });
      // Tu
      case "eeeeee":
        return localize.day(dayOfWeek, {
          width: "short",
          context: "formatting",
        });
      // Tuesday
      case "eeee":
      default:
        return localize.day(dayOfWeek, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // Stand-alone local day of week
  c: function (date, token, localize, options) {
    const dayOfWeek = date.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (same as in `e`)
      case "c":
        return String(localDayOfWeek);
      // Padded numerical value
      case "cc":
        return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(localDayOfWeek, token.length);
      // 1st, 2nd, ..., 7th
      case "co":
        return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "ccc":
        return localize.day(dayOfWeek, {
          width: "abbreviated",
          context: "standalone",
        });
      // T
      case "ccccc":
        return localize.day(dayOfWeek, {
          width: "narrow",
          context: "standalone",
        });
      // Tu
      case "cccccc":
        return localize.day(dayOfWeek, {
          width: "short",
          context: "standalone",
        });
      // Tuesday
      case "cccc":
      default:
        return localize.day(dayOfWeek, {
          width: "wide",
          context: "standalone",
        });
    }
  },

  // ISO day of week
  i: function (date, token, localize) {
    const dayOfWeek = date.getDay();
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      // 2
      case "i":
        return String(isoDayOfWeek);
      // 02
      case "ii":
        return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(isoDayOfWeek, token.length);
      // 2nd
      case "io":
        return localize.ordinalNumber(isoDayOfWeek, { unit: "day" });
      // Tue
      case "iii":
        return localize.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting",
        });
      // T
      case "iiiii":
        return localize.day(dayOfWeek, {
          width: "narrow",
          context: "formatting",
        });
      // Tu
      case "iiiiii":
        return localize.day(dayOfWeek, {
          width: "short",
          context: "formatting",
        });
      // Tuesday
      case "iiii":
      default:
        return localize.day(dayOfWeek, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // AM or PM
  a: function (date, token, localize) {
    const hours = date.getHours();
    const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";

    switch (token) {
      case "a":
      case "aa":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting",
        });
      case "aaa":
        return localize
          .dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting",
          })
          .toLowerCase();
      case "aaaaa":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting",
        });
      case "aaaa":
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // AM, PM, midnight, noon
  b: function (date, token, localize) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    }

    switch (token) {
      case "b":
      case "bb":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting",
        });
      case "bbb":
        return localize
          .dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting",
          })
          .toLowerCase();
      case "bbbbb":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting",
        });
      case "bbbb":
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // in the morning, in the afternoon, in the evening, at night
  B: function (date, token, localize) {
    const hours = date.getHours();
    let dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }

    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting",
        });
      case "BBBBB":
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting",
        });
      case "BBBB":
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting",
        });
    }
  },

  // Hour [1-12]
  h: function (date, token, localize) {
    if (token === "ho") {
      let hours = date.getHours() % 12;
      if (hours === 0) hours = 12;
      return localize.ordinalNumber(hours, { unit: "hour" });
    }

    return _lightFormatters_js__WEBPACK_IMPORTED_MODULE_0__.lightFormatters.h(date, token);
  },

  // Hour [0-23]
  H: function (date, token, localize) {
    if (token === "Ho") {
      return localize.ordinalNumber(date.getHours(), { unit: "hour" });
    }

    return _lightFormatters_js__WEBPACK_IMPORTED_MODULE_0__.lightFormatters.H(date, token);
  },

  // Hour [0-11]
  K: function (date, token, localize) {
    const hours = date.getHours() % 12;

    if (token === "Ko") {
      return localize.ordinalNumber(hours, { unit: "hour" });
    }

    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(hours, token.length);
  },

  // Hour [1-24]
  k: function (date, token, localize) {
    let hours = date.getHours();
    if (hours === 0) hours = 24;

    if (token === "ko") {
      return localize.ordinalNumber(hours, { unit: "hour" });
    }

    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(hours, token.length);
  },

  // Minute
  m: function (date, token, localize) {
    if (token === "mo") {
      return localize.ordinalNumber(date.getMinutes(), { unit: "minute" });
    }

    return _lightFormatters_js__WEBPACK_IMPORTED_MODULE_0__.lightFormatters.m(date, token);
  },

  // Second
  s: function (date, token, localize) {
    if (token === "so") {
      return localize.ordinalNumber(date.getSeconds(), { unit: "second" });
    }

    return _lightFormatters_js__WEBPACK_IMPORTED_MODULE_0__.lightFormatters.s(date, token);
  },

  // Fraction of second
  S: function (date, token) {
    return _lightFormatters_js__WEBPACK_IMPORTED_MODULE_0__.lightFormatters.S(date, token);
  },

  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function (date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();

    if (timezoneOffset === 0) {
      return "Z";
    }

    switch (token) {
      // Hours and optional minutes
      case "X":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);

      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case "XXXX":
      case "XX": // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);

      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case "XXXXX":
      case "XXX": // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },

  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function (date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();

    switch (token) {
      // Hours and optional minutes
      case "x":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);

      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case "xxxx":
      case "xx": // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);

      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case "xxxxx":
      case "xxx": // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },

  // Timezone (GMT)
  O: function (date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();

    switch (token) {
      // Short
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "OOOO":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },

  // Timezone (specific non-location)
  z: function (date, token, _localize) {
    const timezoneOffset = date.getTimezoneOffset();

    switch (token) {
      // Short
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "zzzz":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },

  // Seconds timestamp
  t: function (date, token, _localize) {
    const timestamp = Math.trunc(+date / 1000);
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(timestamp, token.length);
  },

  // Milliseconds timestamp
  T: function (date, token, _localize) {
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(+date, token.length);
  },
};

function formatTimezoneShort(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = Math.trunc(absOffset / 60);
  const minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  return sign + String(hours) + delimiter + (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(minutes, 2);
}

function formatTimezoneWithOptionalMinutes(offset, delimiter) {
  if (offset % 60 === 0) {
    const sign = offset > 0 ? "-" : "+";
    return sign + (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, delimiter);
}

function formatTimezone(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(Math.trunc(absOffset / 60), 2);
  const minutes = (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_2__.addLeadingZeros)(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}


/***/ }),
/* 123 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "lightFormatters": () => (/* binding */ lightFormatters)
/* harmony export */ });
/* harmony import */ var _addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(124);


/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* |                                |
 * |  d  | Day of month                   |  D  |                                |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  m  | Minute                         |  M  | Month                          |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  y  | Year (abs)                     |  Y  |                                |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 */

const lightFormatters = {
  // Year
  y(date, token) {
    // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
    // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
    // |----------|-------|----|-------|-------|-------|
    // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
    // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
    // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
    // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
    // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |

    const signedYear = date.getFullYear();
    // Returns 1 for 1 BC (which is year 0 in JavaScript)
    const year = signedYear > 0 ? signedYear : 1 - signedYear;
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_0__.addLeadingZeros)(token === "yy" ? year % 100 : year, token.length);
  },

  // Month
  M(date, token) {
    const month = date.getMonth();
    return token === "M" ? String(month + 1) : (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_0__.addLeadingZeros)(month + 1, 2);
  },

  // Day of the month
  d(date, token) {
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_0__.addLeadingZeros)(date.getDate(), token.length);
  },

  // AM or PM
  a(date, token) {
    const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";

    switch (token) {
      case "a":
      case "aa":
        return dayPeriodEnumValue.toUpperCase();
      case "aaa":
        return dayPeriodEnumValue;
      case "aaaaa":
        return dayPeriodEnumValue[0];
      case "aaaa":
      default:
        return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
    }
  },

  // Hour [1-12]
  h(date, token) {
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_0__.addLeadingZeros)(date.getHours() % 12 || 12, token.length);
  },

  // Hour [0-23]
  H(date, token) {
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_0__.addLeadingZeros)(date.getHours(), token.length);
  },

  // Minute
  m(date, token) {
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_0__.addLeadingZeros)(date.getMinutes(), token.length);
  },

  // Second
  s(date, token) {
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_0__.addLeadingZeros)(date.getSeconds(), token.length);
  },

  // Fraction of second
  S(date, token) {
    const numberOfDigits = token.length;
    const milliseconds = date.getMilliseconds();
    const fractionalSeconds = Math.trunc(
      milliseconds * Math.pow(10, numberOfDigits - 3),
    );
    return (0,_addLeadingZeros_js__WEBPACK_IMPORTED_MODULE_0__.addLeadingZeros)(fractionalSeconds, token.length);
  },
};


/***/ }),
/* 124 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addLeadingZeros": () => (/* binding */ addLeadingZeros)
/* harmony export */ });
function addLeadingZeros(number, targetLength) {
  const sign = number < 0 ? "-" : "";
  const output = Math.abs(number).toString().padStart(targetLength, "0");
  return sign + output;
}


/***/ }),
/* 125 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "getDayOfYear": () => (/* binding */ getDayOfYear)
/* harmony export */ });
/* harmony import */ var _differenceInCalendarDays_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(126);
/* harmony import */ var _startOfYear_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(129);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);




/**
 * The {@link getDayOfYear} function options.
 */

/**
 * @name getDayOfYear
 * @category Day Helpers
 * @summary Get the day of the year of the given date.
 *
 * @description
 * Get the day of the year of the given date.
 *
 * @param date - The given date
 * @param options - The options
 *
 * @returns The day of year
 *
 * @example
 * // Which day of the year is 2 July 2014?
 * const result = getDayOfYear(new Date(2014, 6, 2))
 * //=> 183
 */
function getDayOfYear(date, options) {
  const _date = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in);
  const diff = (0,_differenceInCalendarDays_js__WEBPACK_IMPORTED_MODULE_1__.differenceInCalendarDays)(_date, (0,_startOfYear_js__WEBPACK_IMPORTED_MODULE_2__.startOfYear)(_date));
  const dayOfYear = diff + 1;
  return dayOfYear;
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getDayOfYear);


/***/ }),
/* 126 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "differenceInCalendarDays": () => (/* binding */ differenceInCalendarDays)
/* harmony export */ });
/* harmony import */ var _lib_getTimezoneOffsetInMilliseconds_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(105);
/* harmony import */ var _lib_normalizeDates_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(127);
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(58);
/* harmony import */ var _startOfDay_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(128);





/**
 * The {@link differenceInCalendarDays} function options.
 */

/**
 * @name differenceInCalendarDays
 * @category Day Helpers
 * @summary Get the number of calendar days between the given dates.
 *
 * @description
 * Get the number of calendar days between the given dates. This means that the times are removed
 * from the dates and then the difference in days is calculated.
 *
 * @param laterDate - The later date
 * @param earlierDate - The earlier date
 * @param options - The options object
 *
 * @returns The number of calendar days
 *
 * @example
 * // How many calendar days are between
 * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
 * const result = differenceInCalendarDays(
 *   new Date(2012, 6, 2, 0, 0),
 *   new Date(2011, 6, 2, 23, 0)
 * )
 * //=> 366
 * // How many calendar days are between
 * // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
 * const result = differenceInCalendarDays(
 *   new Date(2011, 6, 3, 0, 1),
 *   new Date(2011, 6, 2, 23, 59)
 * )
 * //=> 1
 */
function differenceInCalendarDays(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = (0,_lib_normalizeDates_js__WEBPACK_IMPORTED_MODULE_0__.normalizeDates)(
    options?.in,
    laterDate,
    earlierDate,
  );

  const laterStartOfDay = (0,_startOfDay_js__WEBPACK_IMPORTED_MODULE_1__.startOfDay)(laterDate_);
  const earlierStartOfDay = (0,_startOfDay_js__WEBPACK_IMPORTED_MODULE_1__.startOfDay)(earlierDate_);

  const laterTimestamp =
    +laterStartOfDay - (0,_lib_getTimezoneOffsetInMilliseconds_js__WEBPACK_IMPORTED_MODULE_2__.getTimezoneOffsetInMilliseconds)(laterStartOfDay);
  const earlierTimestamp =
    +earlierStartOfDay - (0,_lib_getTimezoneOffsetInMilliseconds_js__WEBPACK_IMPORTED_MODULE_2__.getTimezoneOffsetInMilliseconds)(earlierStartOfDay);

  // Round the number of days to the nearest integer because the number of
  // milliseconds in a day is not constant (e.g. it's different in the week of
  // the daylight saving time clock shift).
  return Math.round((laterTimestamp - earlierTimestamp) / _constants_js__WEBPACK_IMPORTED_MODULE_3__.millisecondsInDay);
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (differenceInCalendarDays);


/***/ }),
/* 127 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "normalizeDates": () => (/* binding */ normalizeDates)
/* harmony export */ });
/* harmony import */ var _constructFrom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(57);


function normalizeDates(context, ...dates) {
  const normalize = _constructFrom_js__WEBPACK_IMPORTED_MODULE_0__.constructFrom.bind(
    null,
    context || dates.find((date) => typeof date === "object"),
  );
  return dates.map(normalize);
}


/***/ }),
/* 128 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "startOfDay": () => (/* binding */ startOfDay)
/* harmony export */ });
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);


/**
 * The {@link startOfDay} function options.
 */

/**
 * @name startOfDay
 * @category Day Helpers
 * @summary Return the start of a day for the given date.
 *
 * @description
 * Return the start of a day for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 * @param options - The options
 *
 * @returns The start of a day
 *
 * @example
 * // The start of a day for 2 September 2014 11:55:00:
 * const result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Tue Sep 02 2014 00:00:00
 */
function startOfDay(date, options) {
  const _date = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (startOfDay);


/***/ }),
/* 129 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "startOfYear": () => (/* binding */ startOfYear)
/* harmony export */ });
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(65);


/**
 * The {@link startOfYear} function options.
 */

/**
 * @name startOfYear
 * @category Year Helpers
 * @summary Return the start of a year for the given date.
 *
 * @description
 * Return the start of a year for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
 *
 * @param date - The original date
 * @param options - The options
 *
 * @returns The start of a year
 *
 * @example
 * // The start of a year for 2 September 2014 11:55:00:
 * const result = startOfYear(new Date(2014, 8, 2, 11, 55, 00))
 * //=> Wed Jan 01 2014 00:00:00
 */
function startOfYear(date, options) {
  const date_ = (0,_toDate_js__WEBPACK_IMPORTED_MODULE_0__.toDate)(date, options?.in);
  date_.setFullYear(date_.getFullYear(), 0, 1);
  date_.setHours(0, 0, 0, 0);
  return date_;
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (startOfYear);


/***/ }),
/* 130 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "isValid": () => (/* binding */ isValid)
/* harmony export */ });
/* harmony import */ var _isDate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(131);
/* harmony import */ var _toDate_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(65);



/**
 * @name isValid
 * @category Common Helpers
 * @summary Is the given date valid?
 *
 * @description
 * Returns false if argument is Invalid Date and true otherwise.
 * Argument is converted to Date using `toDate`. See [toDate](https://date-fns.org/docs/toDate)
 * Invalid Date is a Date, whose time value is NaN.
 *
 * Time value of Date: http://es5.github.io/#x15.9.1.1
 *
 * @param date - The date to check
 *
 * @returns The date is valid
 *
 * @example
 * // For the valid date:
 * const result = isValid(new Date(2014, 1, 31))
 * //=> true
 *
 * @example
 * // For the value, convertible into a date:
 * const result = isValid(1393804800000)
 * //=> true
 *
 * @example
 * // For the invalid date:
 * const result = isValid(new Date(''))
 * //=> false
 */
function isValid(date) {
  return !((!(0,_isDate_js__WEBPACK_IMPORTED_MODULE_0__.isDate)(date) && typeof date !== "number") || isNaN(+(0,_toDate_js__WEBPACK_IMPORTED_MODULE_1__.toDate)(date)));
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (isValid);


/***/ }),
/* 131 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "isDate": () => (/* binding */ isDate)
/* harmony export */ });
/**
 * @name isDate
 * @category Common Helpers
 * @summary Is the given value a date?
 *
 * @description
 * Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
 *
 * @param value - The value to check
 *
 * @returns True if the given value is a date
 *
 * @example
 * // For a valid date:
 * const result = isDate(new Date())
 * //=> true
 *
 * @example
 * // For an invalid date:
 * const result = isDate(new Date(NaN))
 * //=> true
 *
 * @example
 * // For some value:
 * const result = isDate('2014-02-31')
 * //=> false
 *
 * @example
 * // For an object:
 * const result = isDate({})
 * //=> false
 */
function isDate(value) {
  return (
    value instanceof Date ||
    (typeof value === "object" &&
      Object.prototype.toString.call(value) === "[object Date]")
  );
}

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (isDate);


/***/ }),
/* 132 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "fr": () => (/* binding */ fr)
/* harmony export */ });
/* harmony import */ var _fr_lib_formatDistance_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(133);
/* harmony import */ var _fr_lib_formatLong_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(134);
/* harmony import */ var _fr_lib_formatRelative_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(135);
/* harmony import */ var _fr_lib_localize_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(136);
/* harmony import */ var _fr_lib_match_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(137);






/**
 * @category Locales
 * @summary French locale.
 * @language French
 * @iso-639-2 fra
 * @author Jean Dupouy [@izeau](https://github.com/izeau)
 * @author François B [@fbonzon](https://github.com/fbonzon)
 */
const fr = {
  code: "fr",
  formatDistance: _fr_lib_formatDistance_js__WEBPACK_IMPORTED_MODULE_0__.formatDistance,
  formatLong: _fr_lib_formatLong_js__WEBPACK_IMPORTED_MODULE_1__.formatLong,
  formatRelative: _fr_lib_formatRelative_js__WEBPACK_IMPORTED_MODULE_2__.formatRelative,
  localize: _fr_lib_localize_js__WEBPACK_IMPORTED_MODULE_3__.localize,
  match: _fr_lib_match_js__WEBPACK_IMPORTED_MODULE_4__.match,
  options: {
    weekStartsOn: 1 /* Monday */,
    firstWeekContainsDate: 4,
  },
};

// Fallback for modularized imports:
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (fr);


/***/ }),
/* 133 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatDistance": () => (/* binding */ formatDistance)
/* harmony export */ });
const formatDistanceLocale = {
  lessThanXSeconds: {
    one: "moins d’une seconde",
    other: "moins de {{count}} secondes",
  },

  xSeconds: {
    one: "1 seconde",
    other: "{{count}} secondes",
  },

  halfAMinute: "30 secondes",

  lessThanXMinutes: {
    one: "moins d’une minute",
    other: "moins de {{count}} minutes",
  },

  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes",
  },

  aboutXHours: {
    one: "environ 1 heure",
    other: "environ {{count}} heures",
  },

  xHours: {
    one: "1 heure",
    other: "{{count}} heures",
  },

  xDays: {
    one: "1 jour",
    other: "{{count}} jours",
  },

  aboutXWeeks: {
    one: "environ 1 semaine",
    other: "environ {{count}} semaines",
  },

  xWeeks: {
    one: "1 semaine",
    other: "{{count}} semaines",
  },

  aboutXMonths: {
    one: "environ 1 mois",
    other: "environ {{count}} mois",
  },

  xMonths: {
    one: "1 mois",
    other: "{{count}} mois",
  },

  aboutXYears: {
    one: "environ 1 an",
    other: "environ {{count}} ans",
  },

  xYears: {
    one: "1 an",
    other: "{{count}} ans",
  },

  overXYears: {
    one: "plus d’un an",
    other: "plus de {{count}} ans",
  },

  almostXYears: {
    one: "presqu’un an",
    other: "presque {{count}} ans",
  },
};

const formatDistance = (token, count, options) => {
  let result;
  const form = formatDistanceLocale[token];
  if (typeof form === "string") {
    result = form;
  } else if (count === 1) {
    result = form.one;
  } else {
    result = form.other.replace("{{count}}", String(count));
  }

  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "dans " + result;
    } else {
      return "il y a " + result;
    }
  }

  return result;
};


/***/ }),
/* 134 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatLong": () => (/* binding */ formatLong)
/* harmony export */ });
/* harmony import */ var _lib_buildFormatLongFn_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(113);


const dateFormats = {
  full: "EEEE d MMMM y",
  long: "d MMMM y",
  medium: "d MMM y",
  short: "dd/MM/y",
};

const timeFormats = {
  full: "HH:mm:ss zzzz",
  long: "HH:mm:ss z",
  medium: "HH:mm:ss",
  short: "HH:mm",
};

const dateTimeFormats = {
  full: "{{date}} 'à' {{time}}",
  long: "{{date}} 'à' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}",
};

const formatLong = {
  date: (0,_lib_buildFormatLongFn_js__WEBPACK_IMPORTED_MODULE_0__.buildFormatLongFn)({
    formats: dateFormats,
    defaultWidth: "full",
  }),

  time: (0,_lib_buildFormatLongFn_js__WEBPACK_IMPORTED_MODULE_0__.buildFormatLongFn)({
    formats: timeFormats,
    defaultWidth: "full",
  }),

  dateTime: (0,_lib_buildFormatLongFn_js__WEBPACK_IMPORTED_MODULE_0__.buildFormatLongFn)({
    formats: dateTimeFormats,
    defaultWidth: "full",
  }),
};


/***/ }),
/* 135 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatRelative": () => (/* binding */ formatRelative)
/* harmony export */ });
const formatRelativeLocale = {
  lastWeek: "eeee 'dernier à' p",
  yesterday: "'hier à' p",
  today: "'aujourd’hui à' p",
  tomorrow: "'demain à' p'",
  nextWeek: "eeee 'prochain à' p",
  other: "P",
};

const formatRelative = (token, _date, _baseDate, _options) =>
  formatRelativeLocale[token];


/***/ }),
/* 136 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "localize": () => (/* binding */ localize)
/* harmony export */ });
/* harmony import */ var _lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(116);


const eraValues = {
  narrow: ["av. J.-C", "ap. J.-C"],
  abbreviated: ["av. J.-C", "ap. J.-C"],
  wide: ["avant Jésus-Christ", "après Jésus-Christ"],
};

const quarterValues = {
  narrow: ["T1", "T2", "T3", "T4"],
  abbreviated: ["1er trim.", "2ème trim.", "3ème trim.", "4ème trim."],
  wide: ["1er trimestre", "2ème trimestre", "3ème trimestre", "4ème trimestre"],
};

const monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "janv.",
    "févr.",
    "mars",
    "avr.",
    "mai",
    "juin",
    "juil.",
    "août",
    "sept.",
    "oct.",
    "nov.",
    "déc.",
  ],

  wide: [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ],
};

const dayValues = {
  narrow: ["D", "L", "M", "M", "J", "V", "S"],
  short: ["di", "lu", "ma", "me", "je", "ve", "sa"],
  abbreviated: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],

  wide: [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ],
};

const dayPeriodValues = {
  narrow: {
    am: "AM",
    pm: "PM",
    midnight: "minuit",
    noon: "midi",
    morning: "mat.",
    afternoon: "ap.m.",
    evening: "soir",
    night: "mat.",
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "minuit",
    noon: "midi",
    morning: "matin",
    afternoon: "après-midi",
    evening: "soir",
    night: "matin",
  },
  wide: {
    am: "AM",
    pm: "PM",
    midnight: "minuit",
    noon: "midi",
    morning: "du matin",
    afternoon: "de l’après-midi",
    evening: "du soir",
    night: "du matin",
  },
};

const ordinalNumber = (dirtyNumber, options) => {
  const number = Number(dirtyNumber);
  const unit = options?.unit;

  if (number === 0) return "0";

  const feminineUnits = ["year", "week", "hour", "minute", "second"];
  let suffix;

  if (number === 1) {
    suffix = unit && feminineUnits.includes(unit) ? "ère" : "er";
  } else {
    suffix = "ème";
  }

  return number + suffix;
};

const LONG_MONTHS_TOKENS = ["MMM", "MMMM"];

const localize = {
  preprocessor: (date, parts) => {
    // Replaces the `do` tokens with `d` when used with long month tokens and the day of the month is greater than one.
    // Use case "do MMMM" => 1er août, 29 août
    // see https://github.com/date-fns/date-fns/issues/1391

    if (date.getDate() === 1) return parts;

    const hasLongMonthToken = parts.some(
      (part) => part.isToken && LONG_MONTHS_TOKENS.includes(part.value),
    );

    if (!hasLongMonthToken) return parts;

    return parts.map((part) =>
      part.isToken && part.value === "do"
        ? { isToken: true, value: "d" }
        : part,
    );
  },

  ordinalNumber,

  era: (0,_lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__.buildLocalizeFn)({
    values: eraValues,
    defaultWidth: "wide",
  }),

  quarter: (0,_lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__.buildLocalizeFn)({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1,
  }),

  month: (0,_lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__.buildLocalizeFn)({
    values: monthValues,
    defaultWidth: "wide",
  }),

  day: (0,_lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__.buildLocalizeFn)({
    values: dayValues,
    defaultWidth: "wide",
  }),

  dayPeriod: (0,_lib_buildLocalizeFn_js__WEBPACK_IMPORTED_MODULE_0__.buildLocalizeFn)({
    values: dayPeriodValues,
    defaultWidth: "wide",
  }),
};


/***/ }),
/* 137 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "match": () => (/* binding */ match)
/* harmony export */ });
/* harmony import */ var _lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(119);
/* harmony import */ var _lib_buildMatchPatternFn_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(118);



const matchOrdinalNumberPattern = /^(\d+)(ième|ère|ème|er|e)?/i;
const parseOrdinalNumberPattern = /\d+/i;

const matchEraPatterns = {
  narrow: /^(av\.J\.C|ap\.J\.C|ap\.J\.-C)/i,
  abbreviated: /^(av\.J\.-C|av\.J-C|apr\.J\.-C|apr\.J-C|ap\.J-C)/i,
  wide: /^(avant Jésus-Christ|après Jésus-Christ)/i,
};
const parseEraPatterns = {
  any: [/^av/i, /^ap/i],
};

const matchQuarterPatterns = {
  narrow: /^T?[1234]/i,
  abbreviated: /^[1234](er|ème|e)? trim\.?/i,
  wide: /^[1234](er|ème|e)? trimestre/i,
};
const parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i],
};

const matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated:
    /^(janv|févr|mars|avr|mai|juin|juill|juil|août|sept|oct|nov|déc)\.?/i,
  wide: /^(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i,
};
const parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i,
  ],

  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^av/i,
    /^ma/i,
    /^juin/i,
    /^juil/i,
    /^ao/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i,
  ],
};

const matchDayPatterns = {
  narrow: /^[lmjvsd]/i,
  short: /^(di|lu|ma|me|je|ve|sa)/i,
  abbreviated: /^(dim|lun|mar|mer|jeu|ven|sam)\.?/i,
  wide: /^(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)/i,
};
const parseDayPatterns = {
  narrow: [/^d/i, /^l/i, /^m/i, /^m/i, /^j/i, /^v/i, /^s/i],
  any: [/^di/i, /^lu/i, /^ma/i, /^me/i, /^je/i, /^ve/i, /^sa/i],
};

const matchDayPeriodPatterns = {
  narrow: /^(a|p|minuit|midi|mat\.?|ap\.?m\.?|soir|nuit)/i,
  any: /^([ap]\.?\s?m\.?|du matin|de l'après[-\s]midi|du soir|de la nuit)/i,
};
const parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^min/i,
    noon: /^mid/i,
    morning: /mat/i,
    afternoon: /ap/i,
    evening: /soir/i,
    night: /nuit/i,
  },
};

const match = {
  ordinalNumber: (0,_lib_buildMatchPatternFn_js__WEBPACK_IMPORTED_MODULE_0__.buildMatchPatternFn)({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value),
  }),

  era: (0,_lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__.buildMatchFn)({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any",
  }),

  quarter: (0,_lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__.buildMatchFn)({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1,
  }),

  month: (0,_lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__.buildMatchFn)({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any",
  }),

  day: (0,_lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__.buildMatchFn)({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any",
  }),

  dayPeriod: (0,_lib_buildMatchFn_js__WEBPACK_IMPORTED_MODULE_1__.buildMatchFn)({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any",
  }),
};


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var cozy_clisk_dist_contentscript__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _SuperContentScript__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(50);
/* harmony import */ var date_fns_locale_fr__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(132);
/* harmony import */ var date_fns__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(51);
/* harmony import */ var date_fns__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(121);
/* eslint no-console: off */






const baseUrl = 'https://assure.ameli.fr'
const infoUrl =
  baseUrl +
  '/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_info_perso_book'
const paiementsUrl =
  baseUrl +
  '/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_paiements_page'

const paiementsRequestUrl =
  baseUrl + '/PortailAS/paiements.do?actionEvt=afficherPaiementsComplementaires'

const messagesUrl =
  baseUrl +
  '/PortailAS/appmanager/PortailAS/assure?_nfpb=true&_pageLabel=as_messages_recus_page'

const requestInterceptor = new cozy_clisk_dist_contentscript__WEBPACK_IMPORTED_MODULE_0__.RequestInterceptor([
  {
    identifier: 'javascriptservlet',
    method: 'POST',
    url: '/PortailAS/JavaScriptServlet',
    serialization: 'text'
  }
])
requestInterceptor.init()

class AmeliContentScript extends _SuperContentScript__WEBPACK_IMPORTED_MODULE_1__["default"] {
  async gotoLoginForm() {
    this.launcher.log('info', '🤖 gotoLoginForm starts')
    await this.page.goto(baseUrl)
    await this.page
      .getByCss(
        '.deconnexionButton, #connexioncompte_2nir_as, a#id_r_cnx_btn_code.r_btlien.connexion'
      )
      .waitFor()
    const firstConnectLocator = this.page.getByCss(
      'a#id_r_cnx_btn_code.r_btlien.connexion'
    )
    const isPresent = await firstConnectLocator.isPresent()
    if (isPresent) {
      this.launcher.log('info', 'Found firstConnectLocator')
      await firstConnectLocator.click()
    }
    await this.page
      .getByCss('.deconnexionButton, #connexioncompte_2nir_as')
      .waitFor()
  }
  async ensureAuthenticated({ account }) {
    this.launcher.log('info', '🤖 ensureAuthenticated starts')
    this.bridge.addEventListener('workerEvent', this.onWorkerEvent.bind(this))

    const credentials = await this.getCredentials()
    if (!account || !credentials) {
      await this.ensureNotAuthenticated()
      await this.waitForUserAuthentication()
    } else {
      await this.gotoLoginForm()
      const authenticated = await this.page.evaluate(checkAuthenticated)
      if (!authenticated) {
        await this.authWithCredentials(credentials)
      }
    }
    return true
  }

  onWorkerReady() {
    if (document.readyState !== 'loading') {
      this.launcher.log('info', 'readyState')
      this.watchLoginForm.bind(this)()
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        this.launcher.log('info', 'DOMLoaded')
        this.watchLoginForm.bind(this)()
      })
    }
  }
  watchLoginForm() {
    this.launcher.log('info', '📍️ watchLoginForm starts')
    const loginField = document.querySelector('#connexioncompte_2nir_as')
    const passwordField = document.querySelector(
      '#connexioncompte_2connexion_code'
    )
    if (loginField && passwordField) {
      this.launcher.log(
        'info',
        'Found credentials fields, adding form listener'
      )
      const loginForm = document.querySelector(
        '#connexioncompte_2connexionCompteForm'
      )
      loginForm.addEventListener('submit', () => {
        const login = loginField.value
        const password = passwordField.value
        const event = 'loginSubmit'
        const payload = { login, password }
        this.bridge.emit('workerEvent', {
          event,
          payload
        })
      })
    }
  }
  onWorkerEvent({ event, payload }) {
    this.launcher.log('info', 'onWorkerEvent starts')
    if (event === 'loginSubmit') {
      this.launcher.log('info', `User's credential intercepted`)
      const { login, password } = payload
      this.store.userCredentials = { login, password }
    } else if (
      event === 'requestResponse' &&
      payload?.identifier === 'javascriptservlet'
    ) {
      this.store.csrfToken = payload.response?.split(':')?.pop()
    }
  }

  async authWithCredentials(credentials) {
    this.launcher.log('info', 'authWithCredentials')
    const acceptCookiesLocator = this.page.getByCss('#accepteCookie')
    if (acceptCookiesLocator.isPresent()) {
      acceptCookiesLocator.click()
    }

    await this.page
      .getByCss('#connexioncompte_2nir_as')
      .fillText(credentials.login)
    await this.page
      .getByCss('#connexioncompte_2connexion_code')
      .fillText(credentials.password)
    await this.page.getByCss('#id_r_cnx_btn_submit').click()
    await this.page.getByCss('#blocEnvoyerOTP, .deconnexionButton').waitFor()

    if (await this.page.getByCss('#blocEnvoyerOTP').isPresent()) {
      await this.waitForUserAuthentication()
    }
  }

  async ensureNotAuthenticated() {
    this.launcher.log('info', '🤖 ensureNotAuthenticated starts beta-2')
    await this.gotoLoginForm()
    const authenticated = await this.page.evaluate(checkAuthenticated)
    if (!authenticated) {
      return true
    }

    this.launcher.log('info', 'User authenticated. Logging out')
    await this.page.getByCss('.deconnexionButton').click()
    await this.page.getByCss('#as_deconnexion_page').waitFor()
    return true
  }

  async getUserDataFromWebsite() {
    this.launcher.log('info', '🤖 getUserDataFromWebsite starts')
    await this.page.goto(infoUrl)

    await this.page
      .getByCss(`.blocNumSecu, .boutonComplementaireBlanc[value='Plus tard']`)
      .waitFor()

    const numsecuLocator = this.page.getByCss('.blocNumSecu')
    const plusTardLocator = this.page.getByCss(
      `.boutonComplementaireBlanc[value='Plus tard']`
    )
    if (await plusTardLocator.isPresent()) {
      await this.page.goto(infoUrl)
      await numsecuLocator.waitFor()
    }

    const sourceAccountIdentifier = (await numsecuLocator.innerHTML())
      .trim()
      .split(' ')
      .join('')

    if (sourceAccountIdentifier) {
      return {
        sourceAccountIdentifier
      }
    } else {
      throw new Error(
        'No sourceAccountIdentifier, the konnector should be fixed'
      )
    }
  }

  async waitForUserAuthentication() {
    this.launcher.log('info', 'waitForUserAuthentication starts')
    await this.page.show()
    await this.page.waitFor(checkAuthenticated)
    await this.page.hide()
  }

  async fetch(context) {
    if (this.store.userCredentials) {
      await this.saveCredentials(this.store.userCredentials)
    }
    const reimbursements = await this.fetchBills()
    const entries = await getHealthCareBills(reimbursements)

    // first save files, then update existingFilesIndex
    // to avoid multiple files downloads for the same file
    const fileEntries = Object.values(
      entries.reduce((memo, entry) => {
        if (!memo[entry.vendorRef]) {
          memo[entry.vendorRef] = entry
        }
        return memo
      }, {})
    )
    await this.saveFiles(fileEntries, {
      context,
      fileIdAttributes: ['vendorRef'],
      contentType: 'application/pdf'
    })
    await this.saveBills(entries, {
      context,
      fileIdAttributes: ['vendorRef'],
      contentType: 'application/pdf',
      keys: ['vendorRef', 'date', 'amount', 'beneficiary', 'subtype', 'index']
    })

    const messages = await this.fetchMessages()
    if (messages) {
      await this.saveFiles(messages, {
        context,
        fileIdAttributes: ['vendorRef'],
        contentType: 'application/pdf'
      })
    }

    const identity = await this.fetchIdentity()
    if (identity) {
      await this.saveIdentity(identity)
    }
  }

  async fetchIdentity() {
    await this.page.goto(infoUrl)

    try {
      const givenName = await this.page
        .getByCss('#idAssure .blocNomPrenom .nom')
        .innerText()
      const rawFullName = await this.page
        .getByCss('#pageAssure .NomEtPrenomLabel')
        .innerText()

      const familyName = rawFullName.replace(givenName, '').trim()
      const birthday = (0,date_fns__WEBPACK_IMPORTED_MODULE_2__.parse)(
        await this.page
          .getByCss('#idAssure .blocNomPrenom .dateNaissance')
          .innerText(),
        'dd/mm/yyyy',
        new Date()
      )

      const socialSecurityNumber = (
        await this.page.getByCss('.blocNumSecu').innerText()
      ).replace(/\s/g, '')

      const rawAddress = await this.page
        .getByCss(
          '[onclick*=as_adresse_postale] > .infoDroite > span:nth-child(1)'
        )
        .innerText()

      let ident = {
        name: {
          givenName,
          familyName
        },
        birthday,
        socialSecurityNumber
      }
      if (rawAddress) {
        const postcode = rawAddress.match(/ \d{5}/)[0].trim()
        const [street, city] = rawAddress.split(postcode).map(e => e.trim())
        ident.address = [
          {
            formattedAddress: rawAddress,
            street,
            postcode,
            city
          }
        ]
      }
      // Identity now format as a contact
      return { contact: ident }
    } catch (err) {
      this.launcher.log('warn', 'Failed to fetch identity: ' + err.message)
      return false
    }
  }

  async fetchMessages() {
    await this.page.goto(messagesUrl)
    await this.page
      .getByCss('#tableauMessagesRecus tbody tr, .r_msg_aucun_message')
      .waitFor()

    if (await this.page.getByCss('.r_msg_aucun_message').isPresent()) {
      this.launcher.log('info', 'No message to fetch')
      return false
    }

    const docs = await this.page.evaluate(function parseMessages() {
      const docs = []
      const trs = document.querySelectorAll('#tableauMessagesRecus tbody tr')
      for (const tr of trs) {
        docs.push({
          vendorRef: tr.querySelector('td:nth-child(1) input')?.value,
          from: tr.querySelector('td:nth-child(3)')?.innerText.trim(),
          title: tr.querySelector('td:nth-child(4)')?.innerText.trim(),
          date: tr.querySelector('td:nth-child(5)')?.innerText.trim(),
          detailsLink: tr
            .querySelector('td:nth-child(5) a')
            ?.getAttribute('href')
        })
      }
      return docs
    })

    const piecesJointes = []
    for (const doc of docs) {
      const html = await this.page.fetch(doc.detailsLink, {
        serialization: 'text'
      })
      document.body.innerHTML = html
      if (
        document.body.innerHTML.includes('Service momentanément indisponible.')
      ) {
        continue
      }
      const form = document.querySelector('#pdfSimple')
      doc.date = (0,date_fns__WEBPACK_IMPORTED_MODULE_2__.parse)(doc.date, 'dd/MM/yy', new Date())
      const hash = await this.page.evaluate(hexDigest, doc.vendorRef)
      const fileprefix = `${(0,date_fns__WEBPACK_IMPORTED_MODULE_3__.format)(
        doc.date,
        'yyyMMdd',
        new Date()
      )}_ameli_message_${doc.title}_${hash.substr(0, 5)}`

      const fileurl = baseUrl + form.getAttribute('action')

      Object.assign(doc, {
        fileurl: fileurl + `?_ct=${this.store.csrfToken}`,
        requestOptions: {
          method: 'POST',
          form: {
            idMessage: form.querySelector(`[name='idMessage']`).value,
            telechargementPDF: form.querySelector(`[name='telechargementPDF']`)
              .value,
            nomPDF: form.querySelector(`[name='nomPDF']`).value
          }
        },
        filename: `${fileprefix}.pdf`,
        fileAttributes: {
          metadata: {
            carbonCopy: true
          }
        }
      })

      const pj = document.querySelector('.telechargement_PJ')
      if (pj) {
        piecesJointes.push({
          fileurl:
            baseUrl + pj.getAttribute('href') + `?_ct=${this.store.csrfToken}`,
          filename: fileprefix + '_PJ.pdf',
          vendorRef: doc.vendorRef + '_PJ',
          fileAttributes: {
            metadata: {
              carbonCopy: true
            }
          }
        })
      }
    }
    return [...docs, ...piecesJointes]
  }

  async fetchBills() {
    await this.page.goto(paiementsUrl)

    await this.page.getByCss('.boutonLigne').waitFor()
    const dates = await this.page.evaluate(function fetchDates() {
      const debut = document
        .querySelector('#paiements_1dateDebut')
        .getAttribute('data-mindate')
      const fin = document
        .querySelector('#paiements_1dateFin')
        .getAttribute('data-maxdate')
      return { debut, fin }
    })
    const paiementsResponse = await this.page.fetch(
      paiementsRequestUrl +
        `&idNoCache=${Date.now()}&DateDebut=${dates.debut}&DateFin=${
          dates.fin
        }&Beneficiaire=tout_selectionner&afficherIJ=true&afficherPT=false&afficherInva=false&afficherRentes=false&afficherRS=false&indexPaiement=&idNotif=`,
      {
        headers: {
          _ct: this.store.csrfToken
        },
        serialization: 'json'
      }
    )
    document.body.innerHTML = paiementsResponse.tableauPaiement
    const reimbursements = Array.from(
      document.querySelectorAll('.blocParMois')
    ).reduce(parseBloc, [])
    reimbursements.sort((a, b) => (+a.date > +b.date ? -1 : 1)) // newest first

    for (const reimbursement of reimbursements) {
      const detailsHtml = await this.page.fetch(reimbursement.detailsUrl, {
        headers: {
          _ct: this.store.csrfToken
        },
        serialization: 'text'
      })
      parseDetails(detailsHtml, reimbursement)
    }
    return reimbursements
  }
}

const connector = new AmeliContentScript({ requestInterceptor })
connector
  .init({
    additionalExposedMethodsNames: ['runLocator', 'workerWaitFor']
  })
  .catch(err => {
    console.warn(err)
  })

function checkAuthenticated() {
  return Boolean(document.querySelector('.deconnexionButton'))
}

function parseAmount(amount) {
  let result = parseFloat(amount.replace(' €', '').replace(',', '.'))
  if (isNaN(result)) result = 0
  return result
}

function parseBloc(memo, bloc) {
  const year = bloc.querySelector('.rowdate .mois')?.innerText.split(' ').pop()
  const reimbursements = Array.from(
    bloc.querySelectorAll('[id*=lignePaiement]')
  ).map(ligne => {
    const month = ligne.querySelector('.col-date .mois')?.innerText.trim()
    const day = ligne.querySelector('.col-date .jour')?.innerText.trim()
    const groupAmount = parseAmount(
      ligne.querySelector('.col-montant span')?.innerText.trim()
    )
    const dateString = `${day} ${month} ${year}`
    const date = (0,date_fns__WEBPACK_IMPORTED_MODULE_2__.parse)(dateString, 'dd MMM yyyy', new Date(), { locale: date_fns_locale_fr__WEBPACK_IMPORTED_MODULE_4__["default"] })

    const tokens = ligne.getAttribute('onclick').split("'")
    const idPaiement = tokens[1]
    const naturePaiement = tokens[3]
    const indexGroupe = tokens[5]
    const indexPaiement = tokens[7]

    const detailsUrl = `${baseUrl}/PortailAS/paiements.do?actionEvt=chargerDetailPaiements\
&idPaiement=${idPaiement}\
&naturePaiement=${naturePaiement}\
&indexGroupe=${indexGroupe}\
&indexPaiement=${indexPaiement}\
&idNoCache=${Date.now()}`

    let link = ligne.querySelector('.downdetail').getAttribute('href')
    if (!link) {
      link = ligne.querySelector('[id*=liendowndecompte]').getAttribute('href')
    }
    const lineId = indexGroupe + indexPaiement
    return {
      date,
      lineId,
      detailsUrl,
      link,
      idPaiement,
      naturePaiement,
      groupAmount,
      isThirdPartyPayer: naturePaiement === 'PAIEMENT_A_UN_TIERS',
      beneficiaries: {}
    }
  })
  return [...memo, ...reimbursements]
}

function parseDetails(html, reimbursement) {
  if (
    reimbursement.naturePaiement === 'PAIEMENT_A_UN_TIERS' ||
    reimbursement.naturePaiement === 'REMBOURSEMENT_SOINS'
  ) {
    return parseSoinDetails(html, reimbursement)
  } else if (reimbursement.naturePaiement === 'INDEMNITE_JOURNALIERE_ASSURE') {
    return parseIndemniteJournaliere(html, reimbursement)
  }
}

function parseSoinDetails(html, reimbursement) {
  document.body.innerHTML = html
  let currentBeneficiary = null

  if (reimbursement.link == null) {
    reimbursement.link = document
      .querySelector('.entete [id^=liendowndecompte]')
      .getAttribute('href')
  }
  const containers = Array.from(
    document.querySelectorAll('.container:not(.entete)')
  )
  for (const container of containers) {
    const beneficiary = container.querySelector('[id^=nomBeneficiaire]')
    if (beneficiary) {
      currentBeneficiary = beneficiary?.innerText.trim()
      continue
    }

    if (currentBeneficiary) {
      const trs = container.querySelectorAll('tr')
      let index = 0
      for (const tr of trs) {
        index++
        if (tr.querySelector('th')) continue

        let date = tr
          .querySelector('[id^=Nature]')
          ?.innerHTML.split('<br>')
          ?.pop()
          ?.trim()

        date = date ? (0,date_fns__WEBPACK_IMPORTED_MODULE_2__.parse)(date, 'dd/MM/yyyy', new Date()) : undefined

        const prestation = tr
          .querySelector('.naturePrestation')
          ?.innerText.trim()
        const montantPayé = parseAmount(
          tr.querySelector('[id^=montantPaye]')?.innerText.trim()
        )
        const baseRemboursement = parseAmount(
          tr.querySelector('[id^=baseRemboursement]')?.innerText.trim()
        )
        const taux = tr.querySelector('[id^=taux]')?.innerText.trim()
        const montantVersé = parseAmount(
          tr.querySelector('[id^=montantVerse]')?.innerText.trim()
        )
        const healthCare = {
          index,
          prestation,
          date,
          montantPayé,
          baseRemboursement,
          taux,
          montantVersé
        }
        reimbursement.beneficiaries[currentBeneficiary] =
          reimbursement.beneficiaries[currentBeneficiary] || []
        reimbursement.beneficiaries[currentBeneficiary].push(healthCare)
      }
      currentBeneficiary = null
    } else {
      const trs = container.querySelectorAll('tr')
      for (const tr of trs) {
        if (tr.querySelector('th')) {
          continue
        }

        let date = tr.querySelector('[id^=dateActePFF]')?.innerText.trim()
        date = date ? (0,date_fns__WEBPACK_IMPORTED_MODULE_2__.parse)(date, 'dd/MM/yyyy', new Date()) : undefined
        reimbursement.participation = {
          prestation: tr.querySelector('[id^=naturePFF]')?.innerText.trim(),
          date,
          montantVersé: parseAmount(
            tr.querySelector('[id^=montantVerse]')?.innerText.trim()
          )
        }
      }
    }
  }
}

function parseIndemniteJournaliere(html, reimbursement) {
  document.body.innerHTML = html
  const parsed = document
    .querySelector('detailpaiement > div > h2')
    ?.innerText?.match(/Paiement effectué le (.*) pour un montant de (.*) €/)

  if (parsed) {
    const [date, amount] = parsed.slice(1, 3)
    Object.assign(reimbursement, {
      date: (0,date_fns__WEBPACK_IMPORTED_MODULE_2__.parse)(date, 'dd/MM/YYYY', new Date()),
      amount: parseAmount(amount)
    })
  }
  return reimbursement
}

function getHealthCareBills(reimbursements) {
  const bills = []
  reimbursements
    .filter(r =>
      ['PAIEMENT_A_UN_TIERS', 'REMBOURSEMENT_SOINS'].includes(r.naturePaiement)
    )
    .forEach(reimbursement => {
      for (const beneficiary in reimbursement.beneficiaries) {
        reimbursement.beneficiaries[beneficiary].forEach(healthCare => {
          const newbill = {
            type: 'health_costs',
            subtype: healthCare.prestation,
            beneficiary,
            isThirdPartyPayer: reimbursement.isThirdPartyPayer,
            date: reimbursement.date,
            vendor: 'Ameli',
            isRefund: true,
            amount: healthCare.montantVersé,
            originalAmount: healthCare.montantPayé,
            fileurl: baseUrl + reimbursement.link,
            vendorRef: reimbursement.idPaiement,
            filename: getFileName(reimbursement),
            fileAttributes: {
              metadata: {
                carbonCopy: true,
                qualificationLabel: 'health_invoice',
                datetime: reimbursement.date,
                datetimeLabel: 'issueDate',
                issueDate: reimbursement.date
              }
            },
            groupAmount: reimbursement.groupAmount
          }
          if (healthCare.date) {
            newbill.originalDate = healthCare.date
          }
          bills.push(newbill)
        })
      }

      if (reimbursement.participation) {
        const newbill = {
          type: 'health',
          subtype: reimbursement.participation.prestation,
          isThirdPartyPayer: reimbursement.isThirdPartyPayer,
          date: reimbursement.date,
          vendor: 'Ameli',
          isRefund: true,
          amount: reimbursement.participation.montantVersé,
          fileurl: baseUrl + reimbursement.link,
          vendorRef: reimbursement.idPaiement,
          filename: getFileName(reimbursement),
          fileAttributes: {
            metadata: {
              qualificationLabel: 'health_invoice',
              datetime: reimbursement.date,
              datetimeLabel: 'issueDate',
              issueDate: reimbursement.date
            }
          },
          groupAmount: reimbursement.groupAmount
        }
        if (reimbursement.participation.date) {
          newbill.originalDate = reimbursement.participation.date
        }
        bills.push(newbill)
      }
    })
  return bills.filter(bill => !isNaN(bill.amount))
}

function getFileName(reimbursement) {
  const natureMap = {
    PAIEMENT_A_UN_TIERS: 'tiers_payant',
    REMBOURSEMENT_SOINS: 'remboursement_soins',
    INDEMNITE_JOURNALIERE_ASSURE: 'indemnites_journalieres'
  }

  const nature = natureMap[reimbursement.naturePaiement]
  const amount = reimbursement.groupAmount || reimbursement.amount
  return `${(0,date_fns__WEBPACK_IMPORTED_MODULE_3__.format)(reimbursement.date, 'yyyyMMdd')}_ameli${
    nature ? '_' + nature : ''
  }${amount ? '_' + amount.toFixed(2) + 'EUR' : ''}.pdf`
}

async function hexDigest(message) {
  const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest('SHA-1', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}

})();

/******/ })()
;