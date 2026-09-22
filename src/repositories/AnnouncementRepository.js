'use strict';
const BaseRepository = require('./BaseRepository');
const Announcement = require('../models/Announcement');

class AnnouncementRepository extends BaseRepository {
  async create({ authorId, eventId, audience, message }) {
    const result = await this.query(
      'INSERT INTO announcement (author_id, event_id, audience, message) VALUES (?,?,?,?)',
      [authorId, eventId || null, audience, message]
    );
    const rows = await this.query('SELECT * FROM announcement WHERE announcement_id = ?', [result.insertId]);
    return rows[0] ? new Announcement(rows[0]) : null;
  }
  async findPlatformAnnouncements() {
    const rows = await this.query(
      "SELECT * FROM announcement WHERE event_id IS NULL ORDER BY created_at DESC LIMIT 20"
    );
    return rows.map(r => new Announcement(r));
  }
  async findByEvent(eventId) {
    const rows = await this.query(
      'SELECT * FROM announcement WHERE event_id = ? ORDER BY created_at DESC', [eventId]
    );
    return rows.map(r => new Announcement(r));
  }
}
module.exports = AnnouncementRepository;
