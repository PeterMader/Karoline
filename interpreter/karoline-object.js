const Value = require('./value.js')
const Procedure = require('./procedure.js')
const TypeError = require('../util/type-error.js')

const KarolineObject = module.exports = class {

  constructor () {
    this.class = Object.getPrototypeOf(this).constructor
    this.properties = {}
  }

  getProperty (name) {
    if (this.properties.hasOwnProperty(name)) {
      return this.properties[name]
    }

    let proto = Object.getPrototypeOf(this)
    while (true) {
      if (proto.hasOwnProperty(name)) {
        return proto[name]
      }
      if (proto[Value.SUPER_CLASS_KEY]) {
        proto = proto[Value.SUPER_CLASS_KEY].prototype
      } else {
        break
      }
    }

    throw new TypeError(`does not have prop`)
  }

  setProperty (name, value) {
    this.properties[name] = value
  }

}

KarolineObject.prototype[Value.SUPER_CLASS_KEY] = null

KarolineObject.prototype[Value.TO_NUMBER] = new Procedure({
  name: 'KarolineObject::@toKarolineNumber',
  cb: ([self]) => new (require('./karoline-number.js'))(0)
})

KarolineObject.prototype[Value.TO_STRING] = new Procedure({
  name: 'KarolineObject::@toKarolineString',
  cb: ([self]) => new (require('./karoline-string.js'))('<instance of KarolineObject>')
})

KarolineObject.prototype[Value.TO_BOOLEAN] = new Procedure({
  name: 'KarolineObject::@toKarolineBoolean',
  cb: ([self]) => new (require('./karoline-boolean.js'))(true)
})

KarolineObject.OPERATOR_PLUS_UNARY = Symbol('Operator plus unary')
KarolineObject.prototype[Value.OPERATOR_PLUS_UNARY] = Procedure.FAIL

KarolineObject.OPERATOR_PLUS_BINARY = Symbol('Operator plus binary')
KarolineObject.prototype[KarolineObject.OPERATOR_PLUS_BINARY] = Procedure.FAIL

KarolineObject.OPERATOR_MINUS_UNARY = Symbol('Operator minus unary')
KarolineObject.prototype[KarolineObject.OPERATOR_MINUS_UNARY] = Procedure.FAIL

KarolineObject.OPERATOR_MINUS_BINARY = Symbol('Operator minus binary')
KarolineObject.prototype[KarolineObject.OPERATOR_MINUS_BINARY] = Procedure.FAIL

KarolineObject.OPERATOR_ASTERISK = Symbol('Operator asterisk')
KarolineObject.prototype[KarolineObject.OPERATOR_ASTERISK] = Procedure.FAIL

KarolineObject.OPERATOR_SLASH = Symbol('Operator slash')
KarolineObject.prototype[KarolineObject.OPERATOR_SLASH] = Procedure.FAIL

KarolineObject.OPERATOR_EQUALITY = Symbol('Operator equality')
KarolineObject.prototype[KarolineObject.OPERATOR_EQUALITY] = new Procedure({
  name: 'KarolineObject::==',
  cb: ([self, other]) => {
    return new KarolineObject(self.type === other.type && self.value === other.value)
  },
  expectedArguments: [{
    type: KarolineObject.ANY
  }]
})

KarolineObject.OPERATOR_LESS_THAN = Symbol('Operator less than')
KarolineObject.prototype[KarolineObject.OPERATOR_LESS_THAN] = Procedure.FAIL

KarolineObject.OPERATOR_GREATER_THAN = Symbol('Operator greater than')
KarolineObject.prototype[KarolineObject.OPERATOR_GREATER_THAN] = Procedure.FAIL

KarolineObject.BINARY_OPERATORS = {
  '+': KarolineObject.OPERATOR_PLUS_BINARY,
  '-': KarolineObject.OPERATOR_MINUS_BINARY,
  '*': KarolineObject.OPERATOR_ASTERISK,
  '/': KarolineObject.OPERATOR_SLASH,
  '==': KarolineObject.OPERATOR_EQUALITY,
  '<': KarolineObject.OPERATOR_LESS_THAN,
  '>': KarolineObject.OPERATOR_GREATER_THAN
}

KarolineObject.TO_NUMBER = Symbol('to number')
KarolineObject.prototype[KarolineObject.TO_NUMBER] = new Procedure({
  name: 'KarolineObject::@toKarolineNumber',
  cb: (self) => new (require('./karoline-number.js'))(0)
})
