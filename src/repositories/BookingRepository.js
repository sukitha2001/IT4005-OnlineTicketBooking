'use strict';
const BaseRepository = require('./BaseRepository');
const Booking = require('../models/Booking');

class BookingRepository extends BaseRepository {
  _hydrate(row) { return row ? new Booking(row) : null; }

  async findById(id) {
    const rows = await this.query('SELECT * FROM booking WHERE booking_id = ?', [id]);
    return this._hydrate(rows[0]);
  }
  async findByReference(reference) {
    const rows = await this.query('SELECT * FROM booking WHERE reference = ?', [reference]);
    return this._hydrate(rows[0]);
  }
  async findByUser(userId) {
    const rows = await this.query(
      `SELECT b.*, e.title AS event_title, e.type AS event_type,
              s.start_time, v.name AS venue_name
       FROM booking b
       JOIN \`show\` s ON b.show_id = s.show_id
       JOIN event e   ON s.event_id = e.event_id
       JOIN venue v   ON s.venue_id = v.venue_id
       WHERE b.user_id = ?
       ORDER BY b.booked_at DESC`,
      [userId]
    );
    return rows.map(r => ({ ...new Booking(r).toJSON(), eventTitle: r.event_title, eventType: r.event_type, startTime: r.start_time, venueName: r.venue_name }));
  }
  async findByShow(showId) {
    const rows = await this.query("SELECT * FROM booking WHERE show_id = ? AND status = 'CONFIRMED'", [showId]);
    return rows.map(r => this._hydrate(r));
  }
  async create({ userId, showId, reference, totalAmount }, conn) {
    const execute = conn ? (s,p) => conn.execute(s,p) : (s,p) => this.pool.execute(s,p);
    const [result] = await execute(
      'INSERT INTO booking (user_id, show_id, reference, total_amount, status) VALUES (?,?,?,?,?)',
      [userId, showId, reference, totalAmount, 'PENDING']
    );
    // Must re-read via the same connection (conn) so uncommitted rows are visible.
    const [rows] = await execute('SELECT * FROM booking WHERE booking_id = ?', [result.insertId]);
    return this._hydrate(rows[0]);
  }
  async updateStatus(id, status, conn) {
    const execute = conn ? (s,p) => conn.execute(s,p) : (s,p) => this.pool.execute(s,p);
    await execute('UPDATE booking SET status=?, updated_at=NOW() WHERE booking_id=?', [status, id]);
  }
}
module.exports = BookingRepository;
