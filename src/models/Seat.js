'use strict';

class Seat {
  #id; #venueId; #rowLabel; #seatNumber; #seatType;
  constructor({ seat_id, venue_id, row_label, seat_number, seat_type }) {
    this.#id = seat_id; this.#venueId = venue_id;
    this.#rowLabel = row_label; this.#seatNumber = seat_number; this.#seatType = seat_type;
  }
  get id()         { return this.#id; }
  get venueId()    { return this.#venueId; }
  get rowLabel()   { return this.#rowLabel; }
  get seatNumber() { return this.#seatNumber; }
  get seatType()   { return this.#seatType; }
  get label()      { return `${this.#rowLabel}${this.#seatNumber}`; }
  toJSON() {
    return { id: this.#id, venueId: this.#venueId, rowLabel: this.#rowLabel, seatNumber: this.#seatNumber, seatType: this.#seatType, label: this.label };
  }
}

module.exports = Seat;
