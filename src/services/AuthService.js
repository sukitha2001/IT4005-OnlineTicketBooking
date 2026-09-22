'use strict';

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

/**
 * AuthService — registration, login, profile management.
 * No SQL, no HTTP — pure business logic.
 */
class AuthService {
  constructor({ userRepository, auditService }) {
    this.userRepo   = userRepository;
    this.auditSvc   = auditService;
  }

  async register({ name, email, password, role = 'CUSTOMER' }) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      const err = new Error('An account with this email already exists');
      err.code = 'EMAIL_TAKEN';
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.userRepo.create({ name, email, passwordHash, role });
    await this.auditSvc.log({ actorId: user.id, action: 'USER_REGISTERED', entityType: 'USER', entityId: user.id });
    return user;
  }

  async login({ email, password }) {
    const user = await this.userRepo.findByEmail(email);
    // Generic message — do not reveal whether the email exists
    const INVALID = 'Invalid email or password';
    if (!user)              { throw Object.assign(new Error(INVALID), { code: 'AUTH_FAILED' }); }
    if (!user.isActive)    { throw Object.assign(new Error(INVALID), { code: 'AUTH_FAILED' }); }
    const valid = await user.verifyPassword(password);
    if (!valid)             { throw Object.assign(new Error(INVALID), { code: 'AUTH_FAILED' }); }
    await this.auditSvc.log({ actorId: user.id, action: 'LOGIN_SUCCESS', entityType: 'USER', entityId: user.id });
    return user;
  }

  async updateProfile({ userId, name, email }) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing && existing.id !== userId) {
      throw Object.assign(new Error('Email is already in use'), { code: 'EMAIL_TAKEN' });
    }
    return this.userRepo.update({ id: userId, name, email });
  }
}

module.exports = AuthService;
