'use strict';
const BaseRepository = require('./BaseRepository');
const BookingSeat = require('../models/BookingSeat');

class BookingSeatRepository extends BaseRepository {
  async createBulk(bookingId, showSeats, conn) {
    const execute = conn ? (s,p) => conn.execute(s,p) : (s,p) => this.pool.execute(s,p);
    for (const ss of showSeats) {
      await execute(
        'INSERT INTO booking_seat (booking_id, show_seat_id, unit_price) VALUES (?,?,?)',
        [bookingId, ss.id, ss.price]
      );
    }
  }
  async findByBooking(bookingId) {
    const rows = await this.query(
      `SELECT bs.*, ss.price AS seat_price, s.row_label, s.seat_number, s.seat_type
       FROM booking_seat bs
       JOIN show_seat ss ON bs.show_seat_id = ss.show_seat_id
       JOIN seat s ON ss.seat_id = s.seat_id
       WHERE bs.booking_id = ?`,
      [bookingId]
    );
    return rows.map(r => new BookingSeat(r));
  }
}
module.exports = BookingSeatRepository;
