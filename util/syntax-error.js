const Error = require('./error.js')

const SyntaxError = module.exports = class extends Error {

  toString () {
    return 'Syntax error: ' + this.message
  }

}
