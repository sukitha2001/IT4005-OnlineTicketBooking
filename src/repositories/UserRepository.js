'use strict';

const BaseRepository = require('./BaseRepository');
const User           = require('../models/User');
const Customer       = require('../models/Customer');
const Organizer      = require('../models/Organizer');
const SystemAdministrator = require('../models/SystemAdministrator');

/** Maps a DB row to the correct User subclass based on role. */
function hydrate(row) {
  if (!row) return null;
  switch (row.role) {
    case 'CUSTOMER':     return new Customer(row);
    case 'ORGANIZER':    return new Organizer(row);
    case 'SYSTEM_ADMIN': return new SystemAdministrator(row);
    default:             return new User(row);
  }
}

class UserRepository extends BaseRepository {
  async findById(id) {
    const rows = await this.query('SELECT * FROM `user` WHERE user_id = ?', [id]);
    return hydrate(rows[0]);
  }

  async findByEmail(email) {
    const rows = await this.query('SELECT * FROM `user` WHERE email = ?', [email]);
    return hydrate(rows[0]);
  }

  async create({ name, email, passwordHash, role = 'CUSTOMER' }) {
    const result = await this.query(
      'INSERT INTO `user` (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );
    return this.findById(result.insertId);
  }

  async update({ id, name, email }) {
    await this.query(
      'UPDATE `user` SET name = ?, email = ?, updated_at = NOW() WHERE user_id = ?',
      [name, email, id]
    );
    return this.findById(id);
  }

  async updateStatus(id, status) {
    await this.query(
      'UPDATE `user` SET status = ?, updated_at = NOW() WHERE user_id = ?',
      [status, id]
    );
  }

  async findAll({ search = '', role = '' } = {}) {
    let sql = 'SELECT * FROM `user` WHERE 1=1';
    const params = [];
    if (search) { sql += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (role)   { sql += ' AND role = ?'; params.push(role); }
    sql += ' ORDER BY created_at DESC';
    const rows = await this.query(sql, params);
    return rows.map(hydrate);
  }
}

module.exports = UserRepository;
