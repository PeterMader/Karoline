const Value = require('./value.js')

const Class = module.exports = class extends Value {

  constructor (ctor, superClass) {
    super()
    this.ctor = ctor
    this.members = {}
    this.setProperty('members', new Value())
    this.superClass = superClass || null
  }

  hasMember (name, visibility = Class.VISIBILITY_PUBLIC) {
    return this.members.hasOwnProperty(name) && this.members[name].visibility === visibility
  }

  getMember (name) {
    return this.members[name]
  }

  setMember (name, value, visibility) {
    value.visibility = visibility || Class.VISIBILITY_PUBLIC
    this.members[name] = value
  }

  async createInstance (args) {
    const instance = new Value(this)
    const result = await this.ctor.execute(args, instance)
    // if the constructor has a return statement, return that instead of the new instance
    return result || instance
  }

}

Class.VISIBILITY_PUBLIC = Symbol('Public')
Class.VISIBILITY_PROTECTED = Symbol('Protected')
Class.VISIBILITY_PRIVATE = Symbol('Private')
