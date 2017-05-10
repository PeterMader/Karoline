const KarolineObject = require('./karoline-object.js')
const KarolinePrimitive = require('./karoline-primitive.js')
const KarolineProcedure = require('./karoline-procedure.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')

const KarolineBoolean = module.exports = new KarolinePrimitive('KarolineBoolean', new Procedure({
  name: 'KarolineBoolean::@constructor',
  cb: async ([first]) => {
    this.value = await first.getProperty(KarolineObject.TO_BOOLEAN).value.execute([], first)
  }
}), KarolineObject)

KarolineBoolean.setMember(KarolineObject.TO_NUMBER, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineBoolean::@toKarolineNumber',
  cb () {
    return require('./karoline-number.js').createNativeInstance(this.value ? 'true' : 'false')
  }
})))

KarolineBoolean.setMember(KarolineObject.TO_BOOLEAN, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineBoolean::@toKarolineBoolean',
  cb () {
    return this
  }
})))

KarolineBoolean.setMember(KarolineObject.TO_STRING, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineBoolean::@toKarolineString',
  cb () {
    return require('./karoline-string.js').createNativeInstance(this.value.toString())
  }
})))
