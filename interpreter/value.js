const Procedure = require('./procedure.js')
const TypeError = require('../util/type-error.js')

const Value = module.exports = class {

  toString () {
    if (this.type === Value.NULL) {
      // TODO: maybe create a null type
      return 'null'
    }
    if (this.type === Value.NUMBER) {
      // TODO: replace this with the number type
      return this.value.toString()
    }
    if (this.type === Value.STRING) {
      // TODO: replace this with the string type
      return this.value.toString()
    }
    if (this.type === Value.BOOLEAN) {
      // TODO: replace this with the boolean type
      return this.value ? 'true' : 'false'
    }
    if (this.type === Value.PROCEDURE) {
      // TODO: replace this with the procedure type
      return 'procedure ' + this.value.name
    }
  }

  static createNull () {
    return new Value(Value.NULL, null)
  }

  static createKarolineNumber (number) {
    return new Value(Value.NUMBER, KarolineNumber(number))
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

Value.NUMBER = 'KarolineNumber'
Value.STRING = 'String'
Value.BOOLEAN = 'Boolean'
Value.PROCEDURE = 'Procedure'
Value.NULL = 'Null'
Value.ANY = 'Any'

Value.SUPER_CLASS_KEY = Symbol('Super class key')
Value.prototype[Value.SUPER_CLASS_KEY] = null

Value.TO_NUMBER = Symbol('to number')
Value.TO_STRING = Symbol('to string')
Value.TO_BOOLEAN = Symbol('to boolean')
