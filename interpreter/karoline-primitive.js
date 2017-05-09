const Class = require('./class.js')
const Value = require('./value.js')

const KarolinePrimitive = module.exports = class extends Class {

  constructor () {
    super(...arguments)
  }

  createNativeInstance (value) {
    const instance = new Value(this)
    instance.value = value
    return instance
  }

}
