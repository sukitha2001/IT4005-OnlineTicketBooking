'use strict';

const bcrypt = require('bcrypt');

/**
 * Base User domain model.
 * OOP: Encapsulation — private fields; public getters only.
 * OOP: Abstraction  — password hash is never exposed externally.
 */
class User {
  #id;
  #name;
  #email;
  #passwordHash;
  #role;
  #status;
  #createdAt;
  #updatedAt;

  constructor({ user_id, name, email, password_hash, role, status, created_at, updated_at }) {
    this.#id           = user_id;
    this.#name         = name;
    this.#email        = email;
    this.#passwordHash = password_hash;
    this.#role         = role;
    this.#status       = status;
    this.#createdAt    = created_at;
    this.#updatedAt    = updated_at;
  }

  // ─── Getters ────────────────────────────────────────────────
  get id()           { return this.#id; }
  get name()         { return this.#name; }
  get email()        { return this.#email; }
  get role()         { return this.#role; }
  get status()       { return this.#status; }
  get isActive()     { return this.#status === 'ACTIVE'; }
  get createdAt()    { return this.#createdAt; }
  get updatedAt()    { return this.#updatedAt; }

  // ─── Behaviour ──────────────────────────────────────────────

  /**
   * Verify a plain-text password against the stored hash.
   * @param {string} plainText
   * @returns {Promise<boolean>}
   */
  async verifyPassword(plainText) {
    return bcrypt.compare(plainText, this.#passwordHash);
  }

  /**
   * Update name/email. Validation is done by the service layer.
   */
  updateProfile(name, email) {
    if (!name || !email) throw new Error('Name and email are required');
    this.#name  = name;
    this.#email = email;
  }

  /** Disable this account. */
  disable() {
    this.#status = 'DISABLED';
  }

  /** Enable this account. */
  enable() {
    this.#status = 'ACTIVE';
  }

  /**
   * Safe serialization — NEVER includes passwordHash.
   */
  toJSON() {
    return {
      id:        this.#id,
      name:      this.#name,
      email:     this.#email,
      role:      this.#role,
      status:    this.#status,
      createdAt: this.#createdAt,
    };
  }
}

module.exports = User;
