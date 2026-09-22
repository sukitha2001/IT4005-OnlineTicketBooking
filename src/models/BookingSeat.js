'use strict';
class BookingSeat {
  #id; #bookingId; #showSeatId; #unitPrice;
  constructor({ booking_seat_id, booking_id, show_seat_id, unit_price }) {
    this.#id = booking_seat_id; this.#bookingId = booking_id;
    this.#showSeatId = show_seat_id; this.#unitPrice = parseFloat(unit_price);
  }
  get id()          { return this.#id; }
  get bookingId()   { return this.#bookingId; }
  get showSeatId()  { return this.#showSeatId; }
  get unitPrice()   { return this.#unitPrice; }
  toJSON() { return { id: this.#id, bookingId: this.#bookingId, showSeatId: this.#showSeatId, unitPrice: this.#unitPrice }; }
}
module.exports = BookingSeat;
