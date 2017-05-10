const KarolineObject = require('./karoline-object.js')
const KarolinePrimitive = require('./karoline-primitive.js')
const KarolineProcedure = require('./karoline-procedure.js')
const KarolineString = require('./karoline-string.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')

const KarolineNumber = module.exports = new KarolinePrimitive('KarolineNumber', new Procedure({
  name: 'KarolineNumber::@constructor',
  cb: async ([first]) => {
    this.value = (await first.getProperty(KarolineObject.TO_NUMBER).value.execute([], first)).value
  }
}), KarolineObject)

KarolineNumber.setMember('test', KarolineNumber.createNativeInstance(4))

KarolineNumber.setMember(KarolineObject.TO_NUMBER, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::@toKarolineNumber',
  cb () {
    return this
  }
})))

KarolineNumber.setMember(KarolineObject.TO_STRING, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::@toKarolineString',
  cb () {
    console.log(this)
    return KarolineString.createNativeInstance(this.value.toString())
  }
})))

KarolineNumber.setMember(KarolineObject.TO_BOOLEAN, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::@toKarolineBoolean',
  cb () {
    return KarolineBoolean.createNativeInstance(this.value !== 0)
  }
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_PLUS_UNARY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::unary+',
  cb () {
    return this
  },
  expectedArguments: [{
    type: KarolineNumber
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_PLUS_BINARY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::binary+',
  cb: async function ([other]) {
    if (other.class === KarolineNumber) {
      return KarolineNumber.createNativeInstance(this.value + other.value)
    }
    const string = await other.getProperty(KarolineObject.TO_STRING).value.execute([], other)
    return KarolineString.createNativeInstance(this.value.toString() + string.value)
  },
  expectedArguments: [{
    types: [KarolineNumber, KarolineString]
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_MINUS_UNARY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::unary-',
  cb () {
    return KarolineNumber.createNativeInstance(-this.value)
  },
  expectedArguments: [{
    type: KarolineNumber
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_MINUS_BINARY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::binary-',
  cb ([other]) {
    return KarolineNumber.createNativeInstance(this.value - other.value)
  },
  expectedArguments: [{
    type: KarolineNumber
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_ASTERISK, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::*',
  cb ([other]) {
    return KarolineNumber.createNativeInstance(this.value * other.value)
  },
  expectedArguments: [{
    type: KarolineNumber
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_SLASH, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::/',
  cb ([other]) {
    return KarolineNumber.createNativeInstance(this.value / other.value)
  },
  expectedArguments: [{
    type: KarolineNumber
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_LESS_THAN, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::<',
  cb ([other]) {
    return KarolineNumber.createNativeInstance(this.value < other.value)
  },
  expectedArguments: [{
    type: KarolineNumber
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_GREATER_THAN, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::<',
  cb ([other]) {
    return KarolineNumber.createNativeInstance(this.value > other.value)
  },
  expectedArguments: [{
    type: KarolineNumber
  }]
})))
