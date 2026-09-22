'use strict';

class AuditService {
  constructor({ auditLogRepository }) {
    this.auditRepo = auditLogRepository;
  }

  /**
   * Log an auditable action.
   * NEVER include passwords, session tokens, card data, or other secrets in details.
   */
  async log({ actorId, action, entityType, entityId, details } = {}) {
    try {
      await this.auditRepo.create({ actorId, action, entityType, entityId, details });
    } catch (err) {
      // Logging must never crash the main flow
      console.error('[AuditService] Failed to write audit log:', err.message);
    }
  }

  async getLogs(filters = {}) {
    return this.auditRepo.findAll(filters);
  }
}

module.exports = AuditService;
