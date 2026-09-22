'use strict';

const BaseRepository = require('./BaseRepository');
const Event = require('../models/Event');

class EventRepository extends BaseRepository {
  _hydrate(row) { return row ? new Event(row) : null; }

  async findById(id) {
    const rows = await this.query('SELECT * FROM `event` WHERE event_id = ?', [id]);
    return this._hydrate(rows[0]);
  }

  async findPublished({ type, genre, search } = {}) {
    let sql = "SELECT * FROM `event` WHERE status = 'PUBLISHED'";
    const params = [];
    if (type)   { sql += ' AND type = ?';        params.push(type); }
    if (genre)  { sql += ' AND genre LIKE ?';     params.push(`%${genre}%`); }
    if (search) { sql += ' AND title LIKE ?';     params.push(`%${search}%`); }
    sql += ' ORDER BY created_at DESC';
    const rows = await this.query(sql, params);
    return rows.map(r => this._hydrate(r));
  }

  async findByOrganizer(organizerId) {
    const rows = await this.query(
      'SELECT * FROM `event` WHERE organizer_id = ? ORDER BY created_at DESC', [organizerId]
    );
    return rows.map(r => this._hydrate(r));
  }

  async create({ organizerId, title, description, type, genre, durationMinutes, imageUrl, status = 'DRAFT' }) {
    const result = await this.query(
      'INSERT INTO `event` (organizer_id, title, description, type, genre, duration_minutes, image_url, status) VALUES (?,?,?,?,?,?,?,?)',
      [organizerId, title, description, type, genre, durationMinutes, imageUrl, status]
    );
    return this.findById(result.insertId);
  }

  async update({ id, title, description, type, genre, durationMinutes, imageUrl }) {
    await this.query(
      'UPDATE `event` SET title=?, description=?, type=?, genre=?, duration_minutes=?, image_url=?, updated_at=NOW() WHERE event_id=?',
      [title, description, type, genre, durationMinutes, imageUrl, id]
    );
    return this.findById(id);
  }

  async updateStatus(id, status) {
    await this.query('UPDATE `event` SET status=?, updated_at=NOW() WHERE event_id=?', [status, id]);
  }
}

module.exports = EventRepository;
