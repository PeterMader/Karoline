const Procedure = require('./procedure.js')

const Value = module.exports = class {

  constructor (type, value) {
    this.type = type || Value.NULL
    this.value = value || null
  }

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

Value.OPERATOR_MINUS_UNARY = Symbol('Operator minus unary')
Value.prototype[Value.OPERATOR_MINUS_UNARY] = Procedure.FAIL

Value.OPERATOR_MINUS_BINARY = Symbol('Operator minus binary')
Value.prototype[Value.OPERATOR_MINUS_BINARY] = Procedure.FAIL

Value.OPERATOR_ASTERISK = Symbol('Operator asterisk')
Value.prototype[Value.OPERATOR_ASTERISK] = Procedure.FAIL

Value.OPERATOR_SLASH = Symbol('Operator slash')
Value.prototype[Value.OPERATOR_SLASH] = Procedure.FAIL

Value.OPERATOR_EQUALITY = Symbol('Operator equality')
Value.prototype[Value.OPERATOR_EQUALITY] = new Procedure({
  name: 'Value::==',
  cb: ([self, other]) => {
    return self.type === other.type && self.value === other.value
  },
  expectedArguments: [{
    type: Value.ANY
  }]
})

Value.OPERATOR_LESS_THAN = Symbol('Operator less than')
Value.prototype[Value.OPERATOR_LESS_THAN] = Procedure.FAIL

Value.OPERATOR_GREATER_THAN = Symbol('Operator greater than')
Value.prototype[Value.OPERATOR_GREATER_THAN] = Procedure.FAIL

Value.BINARY_OPERATORS = {
  '+': Value.OPERATOR_PLUS_BINARY,
  '+': Value.OPERATOR_MINUS_BINARY,
  '*': Value.OPERATOR_ASTERISK,
  '/': Value.OPERATOR_SLASH,
  '==': Value.OPERATOR_EQUALITY,
  '<': Value.OPERATOR_LESS_THAN,
  '>': Value.OPERATOR_GREATER_THAN
}
