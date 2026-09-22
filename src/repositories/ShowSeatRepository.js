'use strict';

const BaseRepository = require('./BaseRepository');
const ShowSeat = require('../models/ShowSeat');

class ShowSeatRepository extends BaseRepository {
  _hydrate(row) { return row ? new ShowSeat(row) : null; }

  async findByShow(showId) {
    const rows = await this.query(
      `SELECT ss.*, s.row_label, s.seat_number, s.seat_type
       FROM show_seat ss
       JOIN seat s ON ss.seat_id = s.seat_id
       WHERE ss.show_id = ?
       ORDER BY s.row_label, s.seat_number`,
      [showId]
    );
    return rows.map(r => this._hydrate(r));
  }

  /**
   * Lock rows FOR UPDATE inside a transaction — critical for preventing double booking.
   * Must be called with a transaction connection, not the pool directly.
   * @param {Array<number>} showSeatIds
   * @param {Connection}    conn  — active transaction connection
   */
  async lockForUpdate(showSeatIds, conn) {
    if (!showSeatIds.length) return [];
    const placeholders = showSeatIds.map(() => '?').join(',');
    const [rows] = await conn.execute(
      `SELECT ss.*, s.row_label, s.seat_number, s.seat_type
       FROM show_seat ss
       JOIN seat s ON ss.seat_id = s.seat_id
       WHERE ss.show_seat_id IN (${placeholders}) FOR UPDATE`,
      showSeatIds
    );
    return rows.map(r => this._hydrate(r));
  }

  async updateStatus(showSeatIds, status, conn) {
    if (!showSeatIds.length) return;
    const placeholders = showSeatIds.map(() => '?').join(',');
    const execute = conn ? (sql, p) => conn.execute(sql, p) : (sql, p) => this.pool.execute(sql, p);
    await execute(
      `UPDATE show_seat SET status = ? WHERE show_seat_id IN (${placeholders})`,
      [status, ...showSeatIds]
    );
  }

  async createBulk(showId, seats) {
    // seats: [{ seatId, price }]
    for (const s of seats) {
      await this.query(
        'INSERT IGNORE INTO show_seat (show_id, seat_id, price) VALUES (?,?,?)',
        [showId, s.seatId, s.price]
      );
    }
  }
}

module.exports = ShowSeatRepository;
