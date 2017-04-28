const Token = module.exports = class {

  constructor (options) {
    this.type = options.type || ''
    this.value = options.value || ''
    this.position = options.position || {
      line: 0,
      column: 0
    }
  }

}

Token.TOKEN_TYPE_IDENTIFIER = 'TOKEN_TYPE_IDENTIFIER'
Token.TOKEN_TYPE_KEY_WORD = 'TOKEN_TYPE_KEY_WORD'
Token.TOKEN_TYPE_STRING = 'TOKEN_TYPE_STRING'
Token.TOKEN_TYPE_NUMBER = 'TOKEN_TYPE_NUMBER'
