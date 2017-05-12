const KarolineObject = require('./karoline-object.js')
const KarolineBoolean = require('./karoline-boolean.js')
const KarolinePrimitive = require('./karoline-primitive.js')
const KarolineProcedure = require('./karoline-procedure.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')

const KarolineString = module.exports = new KarolinePrimitive('KarolineString', new Procedure({
  name: 'KarolineString::@constructor',
  async cb ([first]) {
    if (first) {
      this.value = await first.getProperty(KarolineObject.TO_STRING).value.execute([], first)
    } else {
      this.value = ''
    }
  }
}), KarolineObject)

KarolineString.setMember(KarolineObject.TO_STRING, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineString::@toKarolineString',
  cb () {
    return this
  }
})))

KarolineString.setMember(KarolineObject.OPERATOR_PLUS_BINARY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineString::binary+',
  cb: async function ([other]) {
    const string = await other.getProperty(KarolineObject.TO_STRING).value.execute([], other)
    return KarolineString.createNativeInstance(this.value.toString() + string.value)
  },
  expectedArguments: [{
    types: KarolineObject.ANY
  }]
})))

KarolineString.setMember(KarolineObject.OPERATOR_PLUS_BINARY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineString::binary+',
  async cb ([other]) {
    const string = await other.getProperty(KarolineObject.TO_STRING).value.execute([], other)
    return KarolineString.createNativeInstance(this.value.toString() + string.value)
  },
  expectedArguments: [{
    type: KarolineString
  }]
})))

KarolineString.setMember(KarolineObject.OPERATOR_LESS_THAN, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineString::<',
  cb ([other]) {
    return KarolineBoolean.createNativeInstance(this.value.localeCompare(other.value) === -1) // works like C's strcmp
  },
  expectedArguments: [{
    type: KarolineString
  }]
})))

KarolineString.setMember(KarolineObject.OPERATOR_GREATER_THAN, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineString::>',
  cb ([other]) {
    return KarolineBoolean.createNativeInstance(this.value.localeCompare(other.value) === 1)
  },
  expectedArguments: [{
    type: KarolineString
  }]
})))

KarolineString.setMember(KarolineObject.OPERATOR_EQUALITY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineString::==',
  cb ([other]) {
    return KarolineBoolean.createNativeInstance(this.value === other.value)
  },
  expectedArguments: [{
    type: KarolineObject.ANY
  }]
})))
