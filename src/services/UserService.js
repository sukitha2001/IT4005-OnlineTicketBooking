'use strict';

class UserService {
  constructor({ userRepository, auditService }) {
    this.userRepo = userRepository;
    this.auditSvc = auditService;
  }

  async getAllUsers(filters = {}) {
    return this.userRepo.findAll(filters);
  }

  async toggleStatus(targetUserId, adminId) {
    const user = await this.userRepo.findById(targetUserId);
    if (!user) throw Object.assign(new Error('User not found'), { code: 'NOT_FOUND' });
    if (user.isActive) {
      user.disable();
      await this.userRepo.updateStatus(targetUserId, 'DISABLED');
      await this.auditSvc.log({ actorId: adminId, action: 'ACCOUNT_DISABLED', entityType: 'USER', entityId: targetUserId });
    } else {
      user.enable();
      await this.userRepo.updateStatus(targetUserId, 'ACTIVE');
      await this.auditSvc.log({ actorId: adminId, action: 'ACCOUNT_ENABLED', entityType: 'USER', entityId: targetUserId });
    }
    return user;
  }
}

module.exports = UserService;
