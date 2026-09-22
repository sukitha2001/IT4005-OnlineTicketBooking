'use strict';

const User = require('./User');

/**
 * Organizer — specializes User.
 * OOP: Inheritance — extends User with organizer-specific behaviour.
 */
class Organizer extends User {
  constructor(data) {
    super(data);
  }

  /** Organizer can manage their own events. */
  canManageEvents() { return this.isActive; }
}

module.exports = Organizer;
