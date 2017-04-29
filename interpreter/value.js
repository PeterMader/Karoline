const Procedure = require('./procedure.js')

const Value = module.exports = class {

  constructor (type, value) {
    this.type = type
    this.value = value
  }

  copyInto (other) {
    other.type = this.type
    other.value = this.value
  }

  toString () {
    if (this.type === Value.NULL) {
      return 'null'
    }
    if (this.type === Value.NUMBER) {
      return this.value.toString()
    }
    if (this.type === Value.STRING) {
      return this.value.toString()
    }
    if (this.type === Value.BOOLEAN) {
      return this.value ? 'true' : 'false'
    }
    if (this.type === Value.PROCEDURE) {
      return 'procedure ' + this.value.name
    }
  }

  castToBoolean () {
    if (this.value === false || this.value === '' || this.value === 0 || this.value === null) {
      return Value.createFalse()
    }
    return Value.createTrue()
  }

  static createNull () {
    return new Value(Value.NULL, null)
  }

  static createNumber (number) {
    return new Value(Value.NUMBER, Number(number))
  }

  static createString (string) {
    return new Value(Value.STRING, String(string))
  }

  static createBoolean (value) {
    return new Value(Value.BOOLEAN, !!value)
  }

  static createTrue () {
    return new Value(Value.BOOLEAN, true)
  }

  static createFalse () {
    return new Value(Value.BOOLEAN, false)
  }

  static createProcedure (procedure) {
    return new Value(Value.PROCEDURE, procedure)
  }

}

Value.NUMBER = 'Number'
Value.STRING = 'String'
Value.BOOLEAN = 'Boolean'
Value.PROCEDURE = 'Procedure'
Value.NULL = 'Null'
Value.ANY = 'Any'

Value.OPERATOR_PLUS_UNARY = Symbol('Operator plus unary')
Value.prototype[Value.OPERATOR_PLUS_UNARY] = Procedure.FAIL

Value.OPERATOR_PLUS_BINARY = Symbol('Operator plus binary')
Value.prototype[Value.OPERATOR_PLUS_BINARY] = Procedure.FAIL
