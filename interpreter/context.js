const Context = module.exports = class {

  constructor (main) {
    this.scope = {}
    this.scopes = [this.scope]
    this.callStack = [main]
  }

  overrideScope (scope) {
    this.scopes.push(scope)
    this.scope = scope
  }

  restoreScope () {
    if (this.scopes.length > 1) {
      this.scope = this.scopes.pop()
    }
  }

  pushScope () {
    this.scope = {
      [Context.PARENT_SCOPE]: this.scope
    }
  }

  popScope () {
    this.scope = this.scope[Context.PARENT_SCOPE]
  }

  clearCallStack () {
    while (this.callStack.length > 1) {
      this.callStack.pop()
    }
  }

  get (name) {
    let {scope} = this
    do {
      if (scope.hasOwnProperty(name)) {
        return scope[name]
      }
    } while (scope = scope[Context.PARENT_SCOPE])
    return null
  }

  set (name, value) {
    let {scope} = this
    do {
      if (scope.hasOwnProperty(name)) {
        return scope[name] = value
      }
    } while (scope = scope[Context.PARENT_SCOPE])
    this.scope[name] = value
  }

}

Context.PARENT_SCOPE = Symbol('Parent scope')
Context.CONSTANT = Symbol('Constant identifier')
