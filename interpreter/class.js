const Value = require('./value.js')
const Procedure = require('./procedure.js')
const KarolineObject = require('./karoline-object.js')

const Class = module.exports = class extends KarolineObject {

  constructor (ctor, superClass) {
    super()
    this.ctor = ctor
    this.members = new KarolineObject()
    if (superClass instanceof Class) {
      this.members.properties[Value.SUPER_CLASS_KEY] = superClass.members.properties
    } else {
      this.members.properties[Value.SUPER_CLASS_KEY] = KarolineObject
    }
  }

  async createInstance (args) {
    const instance = new KarolineObject(args)
    instance.class = this
    Object.setPrototypeOf(instance, this.members.properties)
    const result = await this.ctor.execute(args, instance)
    // if the constructor has a return statement, return that instead of the new instance
    return result || instance
  }

  static fromNativeClass (cls) {
    return new Class(new Procedure({
      cb: async (args) => {
        const instance = new cls(args)
        if (cls.prototype.constructorProcedure) {
          return await cls.prototype.constructorProcedure.execute(args, instance)
        }
        return instance
      }
    }))
  }

}

Class.prototype[Value.SUPER_CLASS_KEY] = KarolineObject
