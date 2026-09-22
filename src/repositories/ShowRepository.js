'use strict';
const BaseRepository = require('./BaseRepository');
const Show = require('../models/Show');

class ShowRepository extends BaseRepository {
  async findById(id) {
    const rows = await this.query('SELECT * FROM `show` WHERE show_id = ?', [id]);
    return rows[0] ? new Show(rows[0]) : null;
  }
  async findByEvent(eventId) {
    const rows = await this.query(
      'SELECT s.*, v.name AS venue_name, v.location AS venue_location FROM `show` s JOIN venue v ON s.venue_id = v.venue_id WHERE s.event_id = ? ORDER BY s.start_time',
      [eventId]
    );
    return rows.map(r => new Show(r));
  }
  async create({ eventId, venueId, startTime, basePrice }) {
    const result = await this.query(
      'INSERT INTO `show` (event_id, venue_id, start_time, base_price) VALUES (?,?,?,?)',
      [eventId, venueId, startTime, basePrice]
    );
    return this.findById(result.insertId);
  }
  async update({ id, startTime, basePrice, status }) {
    await this.query(
      'UPDATE `show` SET start_time=?, base_price=?, status=?, updated_at=NOW() WHERE show_id=?',
      [startTime, basePrice, status, id]
    );
    return this.findById(id);
  }
}
module.exports = ShowRepository;
