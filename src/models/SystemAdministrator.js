'use strict';

const User = require('./User');

/**
 * SystemAdministrator — specializes User.
 * OOP: Inheritance — extends User with admin-specific behaviour.
 */
class SystemAdministrator extends User {
  constructor(data) {
    super(data);
  }

  /** Admin can manage all user accounts. */
  canManageUsers() { return this.isActive; }
}

module.exports = SystemAdministrator;
