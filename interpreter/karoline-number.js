const KarolineObject = require('./karoline-object.js')
const KarolinePrimitive = require('./karoline-primitive.js')
const KarolineProcedure = require('./karoline-procedure.js')
const KarolineString = require('./karoline-string.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')

const KarolineNumber = module.exports = new KarolinePrimitive(new Procedure({
  name: 'KarolineNumber::@constructor',
  cb: async ([first]) => {
    this.setProperty('value', await first.getProperty(KarolineObject.TO_NUMBER).value.execute([], first))
  }
}), KarolineObject)

KarolineNumber.setMember('test', KarolineNumber.createNativeInstance(4))

KarolineNumber.setMember(KarolineObject.TO_NUMBER, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::@toKarolineNumber',
  cb: () => this
})))

KarolineNumber.setMember(KarolineObject.TO_STRING, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::@toKarolineString',
  cb: () => console.log(this) || KarolineString.createNativeInstance(this.value.toString())
})))

KarolineNumber.setMember(KarolineObject.TO_BOOLEAN, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::@toKarolineBoolean',
  cb: () => KarolineBoolean.createNativeInstance(this.value !== 0)
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_PLUS_UNARY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::unary+',
  cb: (self) => self,
  expectedArguments: [{
    type: Value.NUMBER
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_PLUS_BINARY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::binary+',
  cb: ([self, other]) => {
    if (other.type === Value.NUMBER) {
      return new KarolineNumber(self.value + other.value)
    }
  },
  expectedArguments: [{
    types: [Value.NUMBER, Value.STRING]
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_MINUS_UNARY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::unary-',
  cb: (self) => new KarolineNumber(-self.value),
  expectedArguments: [{
    type: Value.NUMBER
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_MINUS_BINARY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::binary-',
  cb: ([self, other]) => {
    return new KarolineNumber(self.value - other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_ASTERISK, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::*',
  cb: ([self, other]) => {
    return new KarolineNumber(self.value * other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_SLASH, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::/',
  cb: ([self, other]) => {
    return new KarolineNumber(self.value / other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_LESS_THAN, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::<',
  cb: ([self, other]) => {
    return new KarolineNumber(self.value < other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})))

KarolineNumber.setMember(KarolineObject.OPERATOR_GREATER_THAN, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineNumber::<',
  cb: ([self, other]) => {
    return new KarolineNumber(self.value > other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})))
