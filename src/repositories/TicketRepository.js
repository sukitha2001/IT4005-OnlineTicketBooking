'use strict';
const BaseRepository = require('./BaseRepository');
const Ticket = require('../models/Ticket');

class TicketRepository extends BaseRepository {
  async create({ bookingId, qrValue }, conn) {
    const execute = conn ? (s,p) => conn.execute(s,p) : (s,p) => this.pool.execute(s,p);
    const [result] = await execute(
      'INSERT INTO ticket (booking_id, qr_value) VALUES (?,?)',
      [bookingId, qrValue]
    );
    // Must re-read via the same connection (conn) so uncommitted rows are visible.
    const [rows] = await execute('SELECT * FROM ticket WHERE ticket_id = ?', [result.insertId]);
    return rows[0] ? new Ticket(rows[0]) : null;
  }
  async findByBooking(bookingId) {
    const rows = await this.query('SELECT * FROM ticket WHERE booking_id = ?', [bookingId]);
    return rows[0] ? new Ticket(rows[0]) : null;
  }
  async findById(id) {
    const rows = await this.query('SELECT * FROM ticket WHERE ticket_id = ?', [id]);
    return rows[0] ? new Ticket(rows[0]) : null;
  }
}
module.exports = TicketRepository;
