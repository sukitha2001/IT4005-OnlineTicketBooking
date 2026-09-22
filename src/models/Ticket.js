'use strict';
class Ticket {
  #id; #bookingId; #qrValue; #issuedAt;
  constructor({ ticket_id, booking_id, qr_value, issued_at }) {
    this.#id = ticket_id; this.#bookingId = booking_id;
    this.#qrValue = qr_value; this.#issuedAt = issued_at;
  }
  get id()        { return this.#id; }
  get bookingId() { return this.#bookingId; }
  get qrValue()   { return this.#qrValue; }
  get issuedAt()  { return this.#issuedAt; }
  toJSON() { return { id: this.#id, bookingId: this.#bookingId, qrValue: this.#qrValue, issuedAt: this.#issuedAt }; }
}
module.exports = Ticket;
