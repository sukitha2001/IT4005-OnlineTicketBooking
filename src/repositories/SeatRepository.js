'use strict';
const BaseRepository = require('./BaseRepository');
const Seat = require('../models/Seat');

class SeatRepository extends BaseRepository {
  async findByVenue(venueId) {
    const rows = await this.query(
      'SELECT * FROM seat WHERE venue_id = ? ORDER BY row_label, seat_number', [venueId]
    );
    return rows.map(r => new Seat(r));
  }
  async create({ venueId, rowLabel, seatNumber, seatType = 'STANDARD' }) {
    const result = await this.query(
      'INSERT INTO seat (venue_id, row_label, seat_number, seat_type) VALUES (?,?,?,?)',
      [venueId, rowLabel, seatNumber, seatType]
    );
    const rows = await this.query('SELECT * FROM seat WHERE seat_id = ?', [result.insertId]);
    return new Seat(rows[0]);
  }
}
module.exports = SeatRepository;
