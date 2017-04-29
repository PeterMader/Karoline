(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (factory) {
  if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object') {
    window.Karoline = factory();
  } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object' && typeof require === 'function') {
    module.exports = factory();
  }
})(function () {
  return {
    Interpreter: require('./interpreter/interpreter.js'),
    Value: require('./interpreter/value.js'),
    Procedure: require('./interpreter/procedure.js'),
    EventEmitter: require('./util/event-emitter.js')
  };
});

},{"./interpreter/interpreter.js":3,"./interpreter/procedure.js":4,"./interpreter/value.js":5,"./util/event-emitter.js":14}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Context = module.exports = function () {
  function _class(main) {
    _classCallCheck(this, _class);

    this.scope = {};
    this.scopes = [this.scope];
    this.callStack = [main];
  }

  _createClass(_class, [{
    key: 'overrideScope',
    value: function overrideScope(scope) {
      this.scopes.push(scope);
      this.scope = scope;
    }
  }, {
    key: 'restoreScope',
    value: function restoreScope() {
      if (this.scopes.length > 1) {
        this.scope = this.scopes.pop();
      }
    }
  }, {
    key: 'pushScope',
    value: function pushScope() {
      this.scope = _defineProperty({}, Context.PARENT_SCOPE, this.scope);
    }
  }, {
    key: 'popScope',
    value: function popScope() {
      this.scope = this.scope[Context.PARENT_SCOPE];
    }
  }, {
    key: 'clearCallStack',
    value: function clearCallStack() {
      while (this.callStack.length > 1) {
        this.callStack.pop();
      }
    }
  }, {
    key: 'get',
    value: function get(name) {
      var scope = this.scope;
      do {
        if (scope.hasOwnProperty(name)) {
          return scope[name];
        }
      } while (scope = scope[Context.PARENT_SCOPE]);
      return null;
    }
  }, {
    key: 'set',
    value: function set(name, value) {
      var old = this.get(name);
      if (old) {
        value.copyInto(old);
      } else {
        this.scope[name] = value;
      }
    }
  }]);

  return _class;
}();

Context.PARENT_SCOPE = Symbol('Parent scope');

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Context = require('./context.js');
var Token = require('../parser/token.js');
var KarolineParser = require('../parser/karoline-parser.js');

var Interpreter = function (_KarolineParser) {
  _inherits(Interpreter, _KarolineParser);

  function Interpreter() {
    _classCallCheck(this, Interpreter);

    var _this = _possibleConstructorReturn(this, (Interpreter.__proto__ || Object.getPrototypeOf(Interpreter)).call(this));

    _this.nativeScope = {};
    _this.context = new Context(new Token({
      value: '<main>',
      position: {
        line: 0,
        column: 0
      }
    }));

    _this.speed = 500;
    _this.running = false;
    _this.stopped = true;
    return _this;
  }

  _createClass(Interpreter, [{
    key: 'setExecutionContext',
    value: function setExecutionContext(context) {
      this.context = context;
    }
  }, {
    key: 'processBlock',
    value: function processBlock(endToken) {
      var parser = this.parser;

      var block = [];
      while (parser.token.value !== endToken && parser.token.value !== '#end') {
        block.push(parser.expression(0));
      }
      if (parser.token.value === '#end') {
        throw new SyntaxError('syntax error: unexpected end of script, expected ' + endToken);
      }
      parser.nextToken(endToken);
      return block;
    }
  }, {
    key: 'addNativeProcedure',
    value: function addNativeProcedure(procedure) {
      this.nativeScope[procedure.name] = Value.createProcedure(procedure);
    }
  }, {
    key: 'addNativeValue',
    value: function addNativeValue(name, value) {
      this.nativeScope[name] = value;
    }
  }, {
    key: 'createProcedure',
    value: function createProcedure(name, block) {
      var length = block.length;

      var procedure = new Procedure({
        cb: this.evaluateBlock.bind(this, block),
        name: name,
        userDefined: true,
        scope: this.context.scope
      });
      var value = Value.createProcedure(procedure);
      this.context.set(name, value);
      return value;
    }
  }, {
    key: 'cleanUp',
    value: function cleanUp() {
      var procedures = this.procedures;

      var index = void 0;
      for (index in procedures) {
        if (procedures[index].userDefined) {
          delete procedures[index];
        }
      }

      this.context.clearCallStack();
      this.running = false;
      this.stopped = true;
    }
  }, {
    key: 'throwTypeError',
    value: function throwTypeError(message, position) {
      throw new TypeError(message, position, this.context.callStack);
    }
  }, {
    key: 'wait',
    value: function wait(ms) {
      return new Promise(function (resolve) {
        setTimeout(resolve, ms);
      });
    }
  }, {
    key: 'run',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(source) {
        var result, trees;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.stopped = false;
                this.running = true;
                this.emit('run');
                result = void 0;
                _context.prev = 4;
                trees = this.parser.parse(source);

                this.emit('parse');
                _context.next = 9;
                return this.evaluateBlock(trees);

              case 9:
                result = _context.sent;
                _context.next = 15;
                break;

              case 12:
                _context.prev = 12;
                _context.t0 = _context['catch'](4);

                if (_context.t0 !== Interpreter.EXECUTION_STOPPED) {
                  this.emit('error', _context.t0);
                  result = _context.t0;
                } else {
                  result = Value.createNull();
                }

              case 15:
                this.cleanUp();
                this.emit('finish');
                return _context.abrupt('return', result);

              case 18:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 12]]);
      }));

      function run(_x) {
        return _ref.apply(this, arguments);
      }

      return run;
    }()
  }, {
    key: 'pause',
    value: function pause() {
      if (this.running) {
        this.running = false;
        this.emit('pause');
      }
    }
  }, {
    key: 'unpause',
    value: function unpause() {
      if (!this.running && !this.stopped) {
        this.running = true;
        this.emit('unpause');
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (!this.stopped) {
        if (!this.running) {
          this.emit('unpause');
        }
        this.stopped = true;
        this.emit('stop');
      }
    }
  }, {
    key: 'executeProcedure',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(procedure, args, caller) {
        var result;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.context.callStack.push(caller);
                if (procedure.scope) {
                  this.context.overrideScope(procedure.scope);
                }
                _context2.next = 4;
                return procedure.execute(args);

              case 4:
                _context2.t0 = _context2.sent;

                if (_context2.t0) {
                  _context2.next = 7;
                  break;
                }

                _context2.t0 = Value.createNull();

              case 7:
                result = _context2.t0;

                if (procedure.scope) {
                  this.context.restoreScope();
                }
                this.context.callStack.pop();
                return _context2.abrupt('return', result);

              case 11:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function executeProcedure(_x2, _x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return executeProcedure;
    }()
  }, {
    key: 'evaluateBlock',
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(block) {
        var length, value, i, index;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                length = block.length;
                value = Value.createNull();
                i = void 0;

                this.context.pushScope();
                i = 0;

              case 5:
                if (!(i < length)) {
                  _context3.next = 21;
                  break;
                }

                index = i;
                _context3.next = 9;
                return this.wait(this.speed);

              case 9:
                if (!(!this.running && !this.stopped)) {
                  _context3.next = 12;
                  break;
                }

                _context3.next = 12;
                return this.awaitEvent('unpause');

              case 12:
                if (!this.stopped) {
                  _context3.next = 14;
                  break;
                }

                throw Interpreter.EXECUTION_STOPPED;

              case 14:
                _context3.next = 16;
                return this.evaluate(block[index], true);

              case 16:
                value = _context3.sent;

                this.emit('statement');

              case 18:
                i += 1;
                _context3.next = 5;
                break;

              case 21:
                this.context.popScope();
                return _context3.abrupt('return', value);

              case 23:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function evaluateBlock(_x5) {
        return _ref3.apply(this, arguments);
      }

      return evaluateBlock;
    }()
  }, {
    key: 'evaluate',
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(tree, isStatement) {
        var result, value, first, second, _first, _second, _first2, procedure, args, i, block, times, _i, _first3, _block, name;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(tree.type === Token.TOKEN_TYPE_NUMBER)) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt('return', new Number(tree.value));

              case 2:
                if (!(tree.type === Token.TOKEN_TYPE_STRING)) {
                  _context4.next = 4;
                  break;
                }

                return _context4.abrupt('return', Value.createString(tree.value));

              case 4:
                if (!tree.isAssignment) {
                  _context4.next = 10;
                  break;
                }

                _context4.next = 7;
                return this.evaluate(tree.second);

              case 7:
                result = _context4.sent;

                this.context.set(tree.first.value, result);
                return _context4.abrupt('return', result);

              case 10:
                if (!(tree.type === Token.TOKEN_TYPE_IDENTIFIER)) {
                  _context4.next = 18;
                  break;
                }

                value = void 0;

                if (value = this.context.get(tree.value)) {} else if (this.nativeScope.hasOwnProperty(tree.value)) {
                  value = this.nativeScope[tree.value];
                } else {
                  this.throwTypeError('undefined identifier ' + tree.value);
                }

                if (!(isStatement && value.type === Value.PROCEDURE)) {
                  _context4.next = 17;
                  break;
                }

                return _context4.abrupt('return', this.executeProcedure(value.value, [], tree));

              case 17:
                return _context4.abrupt('return', value);

              case 18:
                if (!(tree.value === '==')) {
                  _context4.next = 26;
                  break;
                }

                _context4.next = 21;
                return this.evaluate(tree.first);

              case 21:
                first = _context4.sent;
                _context4.next = 24;
                return this.evaluate(tree.second);

              case 24:
                second = _context4.sent;
                return _context4.abrupt('return', Value.createBoolean(first.type === second.type && first.value === second.value));

              case 26:
                if (!(tree.value === '+')) {
                  _context4.next = 41;
                  break;
                }

                if (!(tree.operatorType === ParserSymbol.OPERATOR_TYPE_BINARY)) {
                  _context4.next = 37;
                  break;
                }

                _context4.next = 30;
                return this.evaluate(tree.first);

              case 30:
                _first = _context4.sent;
                _context4.next = 33;
                return this.evaluate(tree.second);

              case 33:
                _second = _context4.sent;
                return _context4.abrupt('return', _first[Value.OPERATOR_PLUS_BINARY].execute(_first, _second));

              case 37:
                _context4.next = 39;
                return this.evaluate(tree.first);

              case 39:
                _first2 = _context4.sent;
                return _context4.abrupt('return', _first2[Value.OPERATOR_PLUS_UNARY].execute(_first2));

              case 41:
                if (!(tree.value === '(' && tree.operatorType === ParserSymbol.OPERATOR_TYPE_BINARY)) {
                  _context4.next = 64;
                  break;
                }

                procedure = void 0;

                if (!(tree.first.type === Token.TOKEN_TYPE_IDENTIFIER)) {
                  _context4.next = 47;
                  break;
                }

                if (procedure = this.context.get(tree.first.value)) {} else if (this.nativeScope.hasOwnProperty(tree.first.value)) {
                  procedure = this.nativeScope[tree.first.value];
                } else {
                  this.throwTypeError('undefined identifier ' + tree.first.value);
                }
                _context4.next = 50;
                break;

              case 47:
                _context4.next = 49;
                return this.evaluate(tree.first);

              case 49:
                procedure = _context4.sent;

              case 50:
                if (procedure.type === Value.PROCEDURE) {
                  procedure = procedure.value;
                } else {
                  this.throwTypeError('tried to call a value of type ' + procedure.type + ', expected a procedure', tree.first.position);
                }
                args = [];
                i = void 0;
                i = 0;

              case 54:
                if (!(i < tree.args.length)) {
                  _context4.next = 63;
                  break;
                }

                _context4.t0 = args;
                _context4.next = 58;
                return this.evaluate(tree.args[i]);

              case 58:
                _context4.t1 = _context4.sent;

                _context4.t0.push.call(_context4.t0, _context4.t1);

              case 60:
                i += 1;
                _context4.next = 54;
                break;

              case 63:
                return _context4.abrupt('return', this.executeProcedure(procedure, args, tree));

              case 64:
                if (!(tree.value === 'repeat')) {
                  _context4.next = 90;
                  break;
                }

                block = tree.block;

                if (!(typeof tree.times !== 'undefined')) {
                  _context4.next = 82;
                  break;
                }

                _context4.next = 69;
                return this.evaluate(tree.times);

              case 69:
                times = _context4.sent;

                if (!(times.type !== Value.NUMBER)) {
                  _context4.next = 72;
                  break;
                }

                throw new TypeError('repeat structure: expected ' + Value.NUMBER + ', got ' + times.type);

              case 72:
                _i = void 0;
                _i = 0;

              case 74:
                if (!(_i < times.value)) {
                  _context4.next = 80;
                  break;
                }

                _context4.next = 77;
                return this.evaluateBlock(block);

              case 77:
                _i += 1;
                _context4.next = 74;
                break;

              case 80:
                _context4.next = 89;
                break;

              case 82:
                _context4.next = 84;
                return this.evaluate(tree.condition);

              case 84:
                if (!_context4.sent.castToBoolean().value) {
                  _context4.next = 89;
                  break;
                }

                _context4.next = 87;
                return this.evaluateBlock(block);

              case 87:
                _context4.next = 82;
                break;

              case 89:
                return _context4.abrupt('return', Value.createNull());

              case 90:
                if (!(tree.value === 'procedure')) {
                  _context4.next = 94;
                  break;
                }

                _first3 = tree.first, _block = tree.block;
                name = _first3.value; // first is an identifier and does not have to be evalated

                return _context4.abrupt('return', this.createProcedure(name, _block));

              case 94:
                this.throwTypeError('unexpected symbol ' + tree.value, tree.position);

              case 95:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function evaluate(_x6, _x7) {
        return _ref4.apply(this, arguments);
      }

      return evaluate;
    }()
  }]);

  return Interpreter;
}(KarolineParser);

Interpreter.EXECUTION_STOPPED = Symbol('execution stopped');

},{"../parser/karoline-parser.js":7,"../parser/token.js":11,"./context.js":2}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TypeError = require('../util/type-error.js');

var Procedure = module.exports = function () {
  function _class(options) {
    _classCallCheck(this, _class);

    this.cb = options.cb;
    this.expectedArguments = Array.isArray(options.expectedArguments) ? options.expectedArguments : [];
    this.userDefined = !!options.userDefined;
    this.name = options.name || '<unnamed procedure>';
    this.scope = options.scope || null;
  }

  _createClass(_class, [{
    key: 'execute',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(args) {
        var cb, expectedArguments, index, expected, real, types;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                cb = this.cb, expectedArguments = this.expectedArguments;
                index = void 0;
                _context.t0 = regeneratorRuntime.keys(expectedArguments);

              case 3:
                if ((_context.t1 = _context.t0()).done) {
                  _context.next = 19;
                  break;
                }

                index = _context.t1.value;
                expected = expectedArguments[index];
                real = args[index];

                if (!expected.optional) {
                  _context.next = 9;
                  break;
                }

                return _context.abrupt('continue', 3);

              case 9:
                if (real) {
                  _context.next = 11;
                  break;
                }

                throw new TypeError('procedure ' + this.name + ': missing argument ' + index);

              case 11:
                if (!Array.isArray(expected.types)) {
                  _context.next = 15;
                  break;
                }

                if (!(expected.types.indexOf(real.type) < 0)) {
                  _context.next = 15;
                  break;
                }

                types = expected.types.reduce(function (a, b) {
                  return a + ', ' + b;
                }, '');
                throw new TypeError('procedure ' + this.name + ': expected argument ' + index + ' to be of types ' + types + 'got type ' + args[index].type);

              case 15:
                if (!(expected.type !== real.type && expected.type !== Value.ANY)) {
                  _context.next = 17;
                  break;
                }

                throw new TypeError('procedure ' + this.name + ': expected argument ' + index + ' to be of type ' + expected.type + ', got type ' + args[index].type);

              case 17:
                _context.next = 3;
                break;

              case 19:
                _context.next = 21;
                return cb(args);

              case 21:
                return _context.abrupt('return', _context.sent);

              case 22:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function execute(_x) {
        return _ref.apply(this, arguments);
      }

      return execute;
    }()
  }]);

  return _class;
}();

Procedure.FAIL = new Procedure({
  cb: function cb() {
    throw new TypeError('undefined action');
  }
});

},{"../util/type-error.js":16}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Value = module.exports = function () {
  function _class(type, value) {
    _classCallCheck(this, _class);

    this.type = type;
    this.value = value;
  }

  _createClass(_class, [{
    key: 'copyInto',
    value: function copyInto(other) {
      other.type = this.type;
      other.value = this.value;
    }
  }, {
    key: 'toString',
    value: function toString() {
      if (this.type === Value.NULL) {
        return 'null';
      }
      if (this.type === Value.NUMBER) {
        return this.value.toString();
      }
      if (this.type === Value.STRING) {
        return this.value.toString();
      }
      if (this.type === Value.BOOLEAN) {
        return this.value ? 'true' : 'false';
      }
      if (this.type === Value.PROCEDURE) {
        return 'procedure ' + this.value.name;
      }
    }
  }, {
    key: 'castToBoolean',
    value: function castToBoolean() {
      if (this.value === false || this.value === '' || this.value === 0 || this.value === null) {
        return Value.createFalse();
      }
      return Value.createTrue();
    }
  }], [{
    key: 'createNull',
    value: function createNull() {
      return new Value(Value.NULL, null);
    }
  }, {
    key: 'createNumber',
    value: function createNumber(number) {
      return new Value(Value.NUMBER, Number(number));
    }
  }, {
    key: 'createString',
    value: function createString(string) {
      return new Value(Value.STRING, String(string));
    }
  }, {
    key: 'createBoolean',
    value: function createBoolean(value) {
      return new Value(Value.BOOLEAN, !!value);
    }
  }, {
    key: 'createTrue',
    value: function createTrue() {
      return new Value(Value.BOOLEAN, true);
    }
  }, {
    key: 'createFalse',
    value: function createFalse() {
      return new Value(Value.BOOLEAN, false);
    }
  }, {
    key: 'createProcedure',
    value: function createProcedure(procedure) {
      return new Value(Value.PROCEDURE, procedure);
    }
  }]);

  return _class;
}();

Value.NUMBER = 'Number';
Value.STRING = 'String';
Value.BOOLEAN = 'Boolean';
Value.PROCEDURE = 'Procedure';
Value.NULL = 'Null';
Value.ANY = 'Any';

Value.OPERATOR_PLUS_UNARY = Symbol('Operator plus unary');
Value.prototype[Value.OPERATOR_PLUS_UNARY] = Procedure.FAIL;

Value.OPERATOR_PLUS_BINARY = Symbol('Operator plus binary');
Value.prototype[Value.OPERATOR_PLUS_BINARY] = Procedure.FAIL;

},{}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ParserSymbol = require('./parser-symbol.js');

var InfixOperator = module.exports = function (_ParserSymbol) {
  _inherits(_class, _ParserSymbol);

  function _class(options) {
    _classCallCheck(this, _class);

    return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, options));
  }

  _createClass(_class, [{
    key: 'defaultLeftDenotation',
    value: function defaultLeftDenotation(self, first, parser) {
      var item = this.clone();
      item.first = first;
      item.second = parser.expression(this.bindingPower);
      item.operatorType = ParserSymbol.OPERATOR_TYPE_BINARY;
      return item;
    }
  }]);

  return _class;
}(ParserSymbol);

},{"./parser-symbol.js":8}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('../util/event-emitter.js');
var ParserSymbol = require('./parser-symbol.js');
var PrefixOperator = require('./prefix-operator.js');
var InfixOperator = require('./infix-operator.js');
var Token = require('./token.js');
var Parser = require('./parser.js');

var KarolineParser = module.exports = function (_EventEmitter) {
  _inherits(_class, _EventEmitter);

  function _class() {
    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

    _this.parser = new Parser();
    _this.prepareParser();
    return _this;
  }

  _createClass(_class, [{
    key: 'prepareParser',
    value: function prepareParser() {
      var _this2 = this;

      var parser = this.parser;

      parser.tokenizer.addKeyWord('repeat');
      parser.tokenizer.addKeyWord('times');
      parser.tokenizer.addKeyWord('while');
      parser.tokenizer.addKeyWord('*repeat');
      parser.registerSymbol(new PrefixOperator({
        value: 'repeat',
        bindingPower: 0,
        nullDenotation: function nullDenotation(self) {
          var item = self.clone();
          var next = parser.expression(0);
          if (next.value === 'while') {
            item.condition = parser.expression(0);
          } else {
            item.times = next;
            parser.nextToken('times');
          }
          item.block = _this2.processBlock('*repeat');
          return item;
        }
      }));
      parser.registerSymbol(new ParserSymbol({
        value: '*repeat'
      }));
      parser.registerSymbol(new ParserSymbol({
        value: 'times'
      }));
      parser.registerSymbol(new ParserSymbol({
        value: 'while'
      }));

      parser.tokenizer.addKeyWord('procedure');
      parser.tokenizer.addKeyWord('*procedure');
      parser.registerSymbol(new PrefixOperator({
        value: 'procedure',
        nullDenotation: function nullDenotation(self) {
          var item = self.clone();
          if (parser.token.type !== Token.TOKEN_TYPE_IDENTIFIER) {
            throw new SyntaxError('expected identifier as name for procedure, got ' + parser.token.type + ' token');
          }
          item.first = parser.token;
          parser.nextToken();
          item.block = _this2.processBlock('*procedure');
          return item;
        }
      }));
      parser.registerSymbol(new ParserSymbol({
        value: '*procedure'
      }));

      parser.tokenizer.addKeyWord('(');
      parser.tokenizer.addKeyWord(')');
      parser.tokenizer.addKeyWord(',');
      parser.registerSymbol(new InfixOperator({
        value: '(',
        bindingPower: 80,
        nullDenotation: function nullDenotation(self) {
          var item = parser.expression(0);
          parser.nextToken(')');
          return item;
        },
        leftDenotation: function leftDenotation(self, left) {
          var item = self.clone();
          item.operatorType = ParserSymbol.OPERATOR_TYPE_BINARY;
          item.first = left;
          item.args = [];
          if (parser.token.value === ')') {
            parser.nextToken();
            return item;
          }
          while (true) {
            // parse the new argument
            item.args.push(parser.expression(0));
            if (parser.token.value === ')') {
              break;
            }
            if (parser.token.value !== ',') {
              throw new SyntaxError('expected \',\' token, got ' + parser.token.value);
            }
            parser.nextToken();
          }
          parser.nextToken();
          return item;
        }
      }));
      parser.registerSymbol(new ParserSymbol({
        value: ')'
      }));
      parser.registerSymbol(new ParserSymbol({
        value: ','
      }));

      parser.tokenizer.addKeyWord('*');
      parser.registerSymbol(new InfixOperator({
        value: '*',
        bindingPower: 60
      }));

      parser.tokenizer.addKeyWord('/');
      parser.registerSymbol(new InfixOperator({
        value: '/',
        bindingPower: 60
      }));

      parser.tokenizer.addKeyWord('+');
      parser.registerSymbol(new InfixOperator({
        value: '+',
        bindingPower: 50,
        nullDenotation: PrefixOperator.prototype.defaultNullDenotation
      }));

      parser.tokenizer.addKeyWord('-');
      parser.registerSymbol(new InfixOperator({
        value: '-',
        bindingPower: 50,
        nullDenotation: PrefixOperator.prototype.defaultNullDenotation
      }));

      parser.tokenizer.addKeyWord('==');
      parser.registerSymbol(new InfixOperator({
        value: '==',
        bindingPower: 40
      }));

      parser.tokenizer.addKeyWord('=');
      parser.registerSymbol(new AssignmentOperator({
        value: '='
      }));

      parser.tokenizer.addKeyWord(';');
      parser.registerSymbol(new ParserSymbol({
        value: ';',
        bindingPower: -1
      }));
    }
  }]);

  return _class;
}(EventEmitter);

},{"../util/event-emitter.js":14,"./infix-operator.js":6,"./parser-symbol.js":8,"./parser.js":9,"./prefix-operator.js":10,"./token.js":11}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Token = require('./token.js');

var ParserSymbol = module.exports = function (_Token) {
  _inherits(_class, _Token);

  function _class(options) {
    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, options));

    _this.bindingPower = options.bindingPower || 0;
    _this.operatorType = ParserSymbol.OPERATOR_TYPE_UNARY;

    _this._nullDenotation = typeof options.nullDenotation === 'function' ? options.nullDenotation : _this.defaultNullDenotation;
    _this._leftDenotation = typeof options.leftDenotation === 'function' ? options.leftDenotation : _this.defaultLeftDenotation;
    return _this;
  }

  _createClass(_class, [{
    key: 'clone',
    value: function clone() {
      return new ParserSymbol(this);
    }
  }, {
    key: 'nullDenotation',
    value: function nullDenotation(self, parser) {
      var item = this._nullDenotation(self, parser);
      item.position = self.position;
      return item;
    }
  }, {
    key: 'leftDenotation',
    value: function leftDenotation(self, left, parser) {
      var item = this._leftDenotation(self, left, parser);
      item.position = self.position;
      return item;
    }
  }, {
    key: 'defaultNullDenotation',
    value: function defaultNullDenotation(self, parser) {
      return this;
    }
  }, {
    key: 'defaultLeftDenotation',
    value: function defaultLeftDenotation(self, left, parser) {
      return this;
    }
  }]);

  return _class;
}(Token);

ParserSymbol.OPERATOR_TYPE_UNARY = 'OPERATOR_TYPE_UNARY';
ParserSymbol.OPERATOR_TYPE_BINARY = 'OPERATOR_TYPE_BINARY';

},{"./token.js":11}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tokenizer = require('./tokenizer.js');
var ParserSymbol = require('./parser-symbol.js');
var SyntaxError = require('../util/syntax-error.js');
var Token = require('./token.js');

var Parser = module.exports = function () {
  function _class() {
    _classCallCheck(this, _class);

    this.tokenizer = new Tokenizer([]);
    this.symbols = {};
    this.token = null;

    this.tokens = [];
    this.currentIndex = 0;

    this.registerSymbol(new ParserSymbol({
      value: '#end',
      bindingPower: 0
    }));
  }

  _createClass(_class, [{
    key: 'nextToken',
    value: function nextToken(expected) {
      var token = this.tokens[this.currentIndex];
      if (typeof token === 'undefined') {
        this.token = this.symbols['#end'];
        return;
      }
      if (expected && this.token.value !== expected) {
        throw new SyntaxError('Expected token "' + expected + '", got "' + this.token.value + '"');
        this.token = this.symbols['#end'];
        return;
      }
      if (token.type === Token.TOKEN_TYPE_KEY_WORD) {
        this.token = this.symbols[token.value];
        if (typeof this.token === 'undefined') {
          throw new SyntaxError('Undefined key word "' + token.value + '"');
          this.token = this.symbols['#end'];
          return;
        }
      } else {
        this.token = new ParserSymbol(token);
      }
      this.currentIndex += 1;
    }
  }, {
    key: 'registerSymbol',
    value: function registerSymbol(symbol) {
      this.symbols[symbol.value] = symbol;
    }
  }, {
    key: 'parse',
    value: function parse(string) {
      this.currentIndex = 0;
      this.tokens = this.tokenizer.tokenize(string);
      this.nextToken();
      var expressions = [];
      while (this.token.value !== '#end') {
        expressions.push(this.expression(0));
      }
      return expressions;
    }
  }, {
    key: 'expression',
    value: function expression(rightBindingPower) {
      // skip all semicolons
      while (this.token.value === ';') {
        this.nextToken();
      }

      if (this.token.value === '#end') {
        throw new SyntaxError('Unexpected end of line, expected an expression.');
        return null;
      }

      var oldToken = this.token;
      this.nextToken();
      var left = oldToken.nullDenotation(oldToken, this);
      while (rightBindingPower < this.token.bindingPower) {
        oldToken = this.token;
        this.nextToken();
        left = oldToken.leftDenotation(oldToken, left, this);
      }
      return left;
    }
  }]);

  return _class;
}();

},{"../util/syntax-error.js":15,"./parser-symbol.js":8,"./token.js":11,"./tokenizer.js":12}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ParserSymbol = require('./parser-symbol.js');

var PrefixOperator = module.exports = function (_ParserSymbol) {
  _inherits(_class, _ParserSymbol);

  function _class(options) {
    _classCallCheck(this, _class);

    return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, options));
  }

  _createClass(_class, [{
    key: 'defaultNullDenotation',
    value: function defaultNullDenotation(self, parser) {
      var item = this.clone();
      item.first = parser.expression(this.bindingPower);
      item.operatorType = ParserSymbol.OPERATOR_TYPE_UNARY;
      return item;
    }
  }]);

  return _class;
}(ParserSymbol);

},{"./parser-symbol.js":8}],11:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Token = module.exports = function () {
  function _class(options) {
    _classCallCheck(this, _class);

    this.type = options.type || '';
    this.value = options.value || '';
    this.position = options.position || {
      line: 0,
      column: 0
    };
  }

  return _class;
}();

Token.TOKEN_TYPE_IDENTIFIER = 'TOKEN_TYPE_IDENTIFIER';
Token.TOKEN_TYPE_KEY_WORD = 'TOKEN_TYPE_KEY_WORD';
Token.TOKEN_TYPE_STRING = 'TOKEN_TYPE_STRING';
Token.TOKEN_TYPE_NUMBER = 'TOKEN_TYPE_NUMBER';

},{}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Token = require('./token.js');
var SyntaxError = require('../util/syntax-error.js');

var Tokenizer = module.exports = function () {
  function _class(keyWords) {
    _classCallCheck(this, _class);

    this.iter = null;
    this.keyWords = Array.isArray(keyWords) ? keyWords : [];
  }

  _createClass(_class, [{
    key: 'addKeyWord',
    value: function addKeyWord(keyWord) {
      if (keyWord) {
        this.keyWords.push(keyWord.toString());
      }
    }
  }, {
    key: 'keyWordStartsWith',
    value: function keyWordStartsWith(str) {
      var length = str.length;
      return this.keyWords.some(function (item) {
        return item.slice(0, length) === str;
      });
    }
  }, {
    key: 'isAlpha',
    value: function isAlpha(char) {
      return (/^[a-zA-ZäöüÄÖÜß]+$/i.test(char)
      );
    }
  }, {
    key: 'isNumeric',
    value: function isNumeric(char) {
      return (/^[0-9]+$/i.test(char)
      );
    }
  }, {
    key: 'isAlphaNumeric',
    value: function isAlphaNumeric(char) {
      return (/^[a-zA-Z0-9äöüÄÖÜß]+$/i.test(char)
      );
    }
  }, {
    key: 'stringToken',
    value: function stringToken(quote) {
      var iter = this.iter;

      var str = '';
      var ch = '';
      var escape = false;
      while (ch = iter.next()) {
        if (!ch) {
          throw new SyntaxError('Unterminated string literal', iter.getCurrentPosition());
        }
        if (escape) {
          escape = false;
          if (ch === 'b') {
            ch = '\b';
          }
          if (ch === 'f') {
            ch = '\f';
          }
          if (ch === 'n') {
            ch = '\n';
          }
          if (ch === 'r') {
            ch = '\r';
          }
          if (ch === 't') {
            ch = '\t';
          }
          str += ch;
          continue;
        }
        if (ch === '\\') {
          escape = true;
          continue;
        }
        if (ch === quote) {
          break;
        }
        str += ch;
      }
      return this.createToken(Token.TOKEN_TYPE_STRING, str, iter.getCurrentPosition());
    }
  }, {
    key: 'identifierToken',
    value: function identifierToken(start) {
      var iter = this.iter;

      var name = start;
      var ch = '';
      while (ch = iter.next()) {
        if (this.isAlphaNumeric(ch)) {
          name += ch;
        } else {
          break;
        }
      }
      return this.createToken(Token.TOKEN_TYPE_IDENTIFIER, name, iter.getCurrentPosition());
    }
  }, {
    key: 'numberToken',
    value: function numberToken(start) {
      var iter = this.iter;

      var number = start;
      var ch = '';
      while (ch = iter.next()) {
        if (this.isNumeric(ch)) {
          number += ch;
        } else {
          break;
        }
      }
      return this.createToken(Token.TOKEN_TYPE_NUMBER, Number(number), iter.getCurrentPosition());
    }
  }, {
    key: 'keyWordToken',
    value: function keyWordToken(start) {
      var iter = this.iter;

      var name = start;
      var ch = '';
      while (ch = iter.next()) {
        if (this.keyWordStartsWith(name + ch)) {
          name += ch;
        } else {
          if (this.keyWords.indexOf(name) > -1) {
            break;
          } else if (this.isAlpha(name[0]) && this.isAlphaNumeric(name + ch)) {
            return this.identifierToken(name + ch);
          } else {
            throw new SyntaxError('unknown token ' + (name + ch));
          }
        }
      }
      return this.createToken(Token.TOKEN_TYPE_KEY_WORD, name, iter.getCurrentPosition());
    }
  }, {
    key: 'createToken',
    value: function createToken(type, value, position) {
      position.column -= value.length; // TODO: doesn't work properly
      return new Token({
        type: type,
        value: value,
        position: position
      });
    }
  }, {
    key: 'tokenize',
    value: function tokenize(string) {
      var iter = this.iter = new StringIterator(string);
      var tokens = [];
      var ch = '';

      while (ch = iter.next()) {
        if (!ch.trim()) {
          continue;
        }
        if (this.keyWordStartsWith(ch)) {
          // key word
          tokens.push(this.keyWordToken(ch));
          iter.back();
        } else if (ch === '\'' || ch === '"') {
          // string literal
          tokens.push(this.stringToken(ch));
        } else if (this.isNumeric(ch)) {
          // number literal
          tokens.push(this.numberToken(ch));
          iter.back();
        } else if (this.isAlphaNumeric(ch)) {
          // identifier
          tokens.push(this.identifierToken(ch));
          iter.back();
        } else {
          throw new SyntaxError('illegal character "' + ch + '"', iter.getCurrentPosition());
        }
      }

      return tokens;
    }
  }]);

  return _class;
}();

},{"../util/syntax-error.js":15,"./token.js":11}],13:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Error = module.exports = function () {
  function _class(message, position, stack) {
    _classCallCheck(this, _class);

    this.message = message;
    this.position = position || {
      line: 0,
      column: 0
    };
    this.stack = stack || [];
  }

  _createClass(_class, [{
    key: 'toString',
    value: function toString() {
      return 'Error: ' + this.message;
    }
  }]);

  return _class;
}();

},{}],14:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = module.exports = function () {
  function _class() {
    _classCallCheck(this, _class);

    this._events = {};
  }

  _createClass(_class, [{
    key: 'on',
    value: function on(channel) {
      for (var _len = arguments.length, listeners = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        listeners[_key - 1] = arguments[_key];
      }

      var filtered = listeners.filter(function (cb) {
        return typeof cb === 'function';
      });
      if (Array.isArray(this._events[channel])) {
        this._events[channel] = this._events[channel].concat(filtered);
      } else {
        this._events[channel] = filtered;
      }
      return this;
    }
  }, {
    key: 'listen',
    value: function listen(channels) {
      if (Array.isArray(channels)) {
        var index = void 0;

        for (var _len2 = arguments.length, listeners = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          listeners[_key2 - 1] = arguments[_key2];
        }

        for (index in channels) {
          this.on.apply(this, [channels[index]].concat(listeners));
        }
      }
      return this;
    }
  }, {
    key: 'listenOnce',
    value: function listenOnce(channels) {
      if (Array.isArray(channels)) {
        var index = void 0;

        for (var _len3 = arguments.length, listeners = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          listeners[_key3 - 1] = arguments[_key3];
        }

        for (index in channels) {
          this.once.apply(this, [channels[index]].concat(listeners));
        }
      }
      return this;
    }
  }, {
    key: 'awaitEvent',
    value: function awaitEvent(channel) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.once(channel, resolve);
      });
    }
  }, {
    key: 'once',
    value: function once(channel) {
      var _this2 = this;

      for (var _len4 = arguments.length, listeners = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        listeners[_key4 - 1] = arguments[_key4];
      }

      var filtered = listeners.filter(function (cb) {
        return typeof cb === 'function';
      }).map(function (cb) {
        var listener = function listener() {
          for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
          }

          _this2.remove(channel, listener);
          cb.apply(null, args);
        };
        return listener;
      });
      if (Array.isArray(this._events[channel])) {
        this._events[channel] = this._events[channel].concat(filtered);
      } else {
        this._events[channel] = filtered;
      }
      return this;
    }
  }, {
    key: 'emit',
    value: function emit(channel) {
      if (Array.isArray(this._events[channel])) {
        var _listeners = this._events[channel];
        var index = void 0;

        for (var _len6 = arguments.length, args = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
          args[_key6 - 1] = arguments[_key6];
        }

        for (index in _listeners) {
          _listeners[index].apply(null, args);
        }
      }
      return this;
    }
  }, {
    key: 'remove',
    value: function remove(channel) {
      for (var _len7 = arguments.length, listeners = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
        listeners[_key7 - 1] = arguments[_key7];
      }

      var listenersToRemove = Array.slice(arguments, 1).filter(function (cb) {
        return typeof cb === 'function';
      });
      if (Array.isArray(this._events[channel])) {
        var _listeners2 = this._events[channel];
        var index = void 0;
        for (index in listenersToRemove) {
          var listener = listenersToRemove[index];
          var removeIndex = _listeners2.indexOf(listener);
          if (removeIndex > -1) {
            this._events[channel].splice(removeIndex, 1);
          }
        }
      }
      return this;
    }
  }, {
    key: 'removeAll',
    value: function removeAll(channel) {
      if (Array.isArray(this._events[channel])) {
        delete this._events[channel];
      }
      return this;
    }
  }]);

  return _class;
}();

},{}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Error = require('./error.js');

var SyntaxError = module.exports = function (_Error) {
  _inherits(_class, _Error);

  function _class() {
    _classCallCheck(this, _class);

    return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
  }

  _createClass(_class, [{
    key: 'toString',
    value: function toString() {
      return 'Syntax error: ' + this.message;
    }
  }]);

  return _class;
}(Error);

},{"./error.js":13}],16:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TypeError = module.exports = function (_Error) {
  _inherits(_class, _Error);

  function _class() {
    _classCallCheck(this, _class);

    return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
  }

  _createClass(_class, [{
    key: 'toString',
    value: function toString() {
      return 'Type error: ' + this.message;
    }
  }]);

  return _class;
}(Error);

},{}]},{},[1]);
