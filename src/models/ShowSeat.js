'use strict';

/**
 * ShowSeat domain model.
 * OOP: Encapsulation — markBooked() prevents invalid transitions.
 */
class ShowSeat {
  #id; #showId; #seatId; #price; #status; #holdExpiresAt;
  // Extra denormalized fields joined from seat table for display
  #rowLabel; #seatNumber; #seatType;

  constructor({ show_seat_id, show_id, seat_id, price, status, hold_expires_at, row_label, seat_number, seat_type }) {
    this.#id           = show_seat_id;
    this.#showId       = show_id;
    this.#seatId       = seat_id;
    this.#price        = parseFloat(price);
    this.#status       = status;
    this.#holdExpiresAt = hold_expires_at;
    this.#rowLabel     = row_label;
    this.#seatNumber   = seat_number;
    this.#seatType     = seat_type;
  }

  get id()           { return this.#id; }
  get showId()       { return this.#showId; }
  get seatId()       { return this.#seatId; }
  get price()        { return this.#price; }
  get status()       { return this.#status; }
  get rowLabel()     { return this.#rowLabel; }
  get seatNumber()   { return this.#seatNumber; }
  get seatType()     { return this.#seatType; }
  get isAvailable()  { return this.#status === 'AVAILABLE'; }
  get label()        { return `${this.#rowLabel || ''}${this.#seatNumber || ''}`; }

  /**
   * Mark this seat as BOOKED.
   * Throws if not AVAILABLE — prevents double booking at the model level.
   */
  markBooked() {
    if (this.#status !== 'AVAILABLE') {
      throw new Error(`Cannot book seat ${this.label}: status is ${this.#status}`);
    }
    this.#status = 'BOOKED';
  }

  /** Release a HELD seat back to AVAILABLE. */
  release() {
    if (this.#status === 'BOOKED') throw new Error('Cannot release a confirmed booking');
    this.#status = 'AVAILABLE';
    this.#holdExpiresAt = null;
  }

  toJSON() {
    return { id: this.#id, showId: this.#showId, seatId: this.#seatId, price: this.#price,
      status: this.#status, rowLabel: this.#rowLabel, seatNumber: this.#seatNumber,
      seatType: this.#seatType, label: this.label };
  }
}

module.exports = ShowSeat;
