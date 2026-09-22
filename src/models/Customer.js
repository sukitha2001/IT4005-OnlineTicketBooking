'use strict';

const User = require('./User');

/**
 * Customer — specializes User.
 * OOP: Inheritance — extends User with customer-specific behaviour.
 */
class Customer extends User {
  constructor(data) {
    super(data);
  }

  /** Customer-specific capability marker. */
  canBook() { return this.isActive; }
}

module.exports = Customer;
