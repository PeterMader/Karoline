const Class = require('./class.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')
const KarolineProcedure = require('./karoline-procedure.js')
const TypeError = require('../util/type-error.js')

const KarolineObject = module.exports = new Class('KarolineObject', new Procedure({
  name: 'KarolineObject::@constructor'
}))

KarolineObject.TO_NUMBER = Symbol('To number')
KarolineObject.setMember(KarolineObject.TO_NUMBER, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineObject::@toKarolineNumber',
  cb () {
    return require('./karoline-number.js').createNativeInstance(0)
  }
})))

KarolineObject.TO_STRING = Symbol('To string')
KarolineObject.setMember(KarolineObject.TO_STRING, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineObject::@toKarolineString',
  cb () {
    return require('./karoline-string.js').createNativeInstance('<instance of KarolineObject>')
  }
})))

KarolineObject.TO_BOOLEAN = Symbol('To boolean')
KarolineObject.setMember(KarolineObject.TO_BOOLEAN, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineObject::@toKarolineBoolean',
  cb () {
    return require('./karoline-boolean.js').createNativeInstance(true)
  }
})))

KarolineObject.OPERATOR_PLUS_UNARY = Symbol('Operator plus unary')
KarolineObject.setMember(KarolineObject.OPERATOR_PLUS_UNARY, KarolineProcedure.createNativeInstance(Procedure.FAIL))

KarolineObject.OPERATOR_PLUS_BINARY = Symbol('Operator plus binary')
KarolineObject.setMember(KarolineObject.OPERATOR_PLUS_BINARY, KarolineProcedure.createNativeInstance(Procedure.FAIL))

KarolineObject.OPERATOR_MINUS_UNARY = Symbol('Operator minus unary')
KarolineObject.setMember(KarolineObject.OPERATOR_MINUS_UNARY, KarolineProcedure.createNativeInstance(Procedure.FAIL))

KarolineObject.OPERATOR_MINUS_BINARY = Symbol('Operator minus binary')
KarolineObject.setMember(KarolineObject.OPERATOR_MINUS_BINARY, KarolineProcedure.createNativeInstance(Procedure.FAIL))

KarolineObject.OPERATOR_ASTERISK = Symbol('Operator asterisk')
KarolineObject.setMember(KarolineObject.OPERATOR_ASTERISK, KarolineProcedure.createNativeInstance(Procedure.FAIL))

KarolineObject.OPERATOR_SLASH = Symbol('Operator slash')
KarolineObject.setMember(KarolineObject.OPERATOR_SLASH, KarolineProcedure.createNativeInstance(Procedure.FAIL))

KarolineObject.OPERATOR_EQUALITY = Symbol('Operator equality')
KarolineObject.setMember(KarolineObject.OPERATOR_EQUALITY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineObject::==',
  cb ([other]) {
    return require('./karoline-boolean.js').createNativeInstance(this.type === other.type && this.value === other.value)
  },
  expectedArguments: [{
    type: KarolineObject.ANY
  }]
})))

KarolineObject.OPERATOR_LESS_THAN = Symbol('Operator less than')
KarolineObject.setMember(KarolineObject.OPERATOR_LESS_THAN, KarolineProcedure.createNativeInstance(Procedure.FAIL))

KarolineObject.OPERATOR_GREATER_THAN = Symbol('Operator greater than')
KarolineObject.setMember(KarolineObject.OPERATOR_GREATER_THAN, KarolineProcedure.createNativeInstance(Procedure.FAIL))

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
KarolineObject.setMember(KarolineObject.TO_NUMBER, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineObject::@toKarolineNumber',
  cb () {
    return require('./karoline-number.js').createNativeInstance(0)
  }
})))
