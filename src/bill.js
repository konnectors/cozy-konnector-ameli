const { Document } = require('cozy-konnector-libs')

class Bill extends Document {
  validate(attrs) {
    if (!attrs) {
      throw new Error('A bill should have an amount')
    }
  }
}

Bill.version = 1

module.exports = Bill
