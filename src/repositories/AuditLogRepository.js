'use strict';
const BaseRepository = require('./BaseRepository');
const AuditLog = require('../models/AuditLog');

class AuditLogRepository extends BaseRepository {
  async create({ actorId, action, entityType, entityId, details }) {
    // details must never contain passwords, secrets, or card data
    await this.query(
      'INSERT INTO audit_log (actor_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?)',
      [actorId || null, action, entityType || null, entityId || null, details ? JSON.stringify(details) : null]
    );
  }
  async findAll({ action, limit = 50, offset = 0 } = {}) {
    let sql = `SELECT al.*, u.name AS actor_name, u.email AS actor_email
               FROM audit_log al
               LEFT JOIN \`user\` u ON al.actor_id = u.user_id
               WHERE 1=1`;
    const params = [];
    if (action) { sql += ' AND al.action = ?'; params.push(action); }
    sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const rows = await this.query(sql, params);
    return rows.map(r => new AuditLog(r));
  }
}
module.exports = AuditLogRepository;
