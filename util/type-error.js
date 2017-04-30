const Error = require('./error.js')

const TypeError = module.exports = class extends Error {

  toString () {
    return 'Type error: ' + this.message
  }

}
