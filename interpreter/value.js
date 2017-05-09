const TypeError = require('../util/type-error.js')

// TODO: Value is not the appropriate name
const Value = module.exports = class {

  constructor (cls) {
    this.class = cls || require('./karoline-object.js')
    this.properties = {}
  }

  getProperty (name, visibility) {
    if (this.properties.hasOwnProperty(name)) {
      return this.properties[name]
    }

    let cls = this.class
    while (cls) {
      if (cls.hasMember(name, visibility)) {
        return cls.getMember(name)
      }
      cls = cls.superClass
    }

    throw new TypeError(`does not have prop`)
  }

  setProperty (name, value) {
    this.properties[name] = value
  }

}
