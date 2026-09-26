'use strict';
const BaseRepository = require('./BaseRepository');
const Payment = require('../models/Payment');

class PaymentRepository extends BaseRepository {
  async create({ bookingId, method, amount, status, transactionReference, paidAt }, conn) {
    const execute = conn ? (s,p) => conn.execute(s,p) : (s,p) => this.pool.execute(s,p);
    const [result] = await execute(
      'INSERT INTO payment (booking_id, method, amount, status, transaction_reference, paid_at) VALUES (?,?,?,?,?,?)',
      [bookingId, method, amount, status, transactionReference, paidAt]
    );
    // Must re-read via the same connection (conn) so uncommitted rows are visible.
    const [rows] = await execute('SELECT * FROM payment WHERE payment_id = ?', [result.insertId]);
    return rows[0] ? new Payment(rows[0]) : null;
  }
  async findByBooking(bookingId) {
    const rows = await this.query('SELECT * FROM payment WHERE booking_id = ?', [bookingId]);
    return rows[0] ? new Payment(rows[0]) : null;
  }
}
module.exports = PaymentRepository;
