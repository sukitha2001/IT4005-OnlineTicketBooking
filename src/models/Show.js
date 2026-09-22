'use strict';

class Show {
  #id; #eventId; #venueId; #startTime; #basePrice; #status; #createdAt;
  constructor({ show_id, event_id, venue_id, start_time, base_price, status, created_at }) {
    this.#id = show_id; this.#eventId = event_id; this.#venueId = venue_id;
    this.#startTime = start_time; this.#basePrice = parseFloat(base_price);
    this.#status = status; this.#createdAt = created_at;
  }
  get id()        { return this.#id; }
  get eventId()   { return this.#eventId; }
  get venueId()   { return this.#venueId; }
  get startTime() { return this.#startTime; }
  get basePrice() { return this.#basePrice; }
  get status()    { return this.#status; }
  get isScheduled() { return this.#status === 'SCHEDULED'; }

  cancel() {
    if (this.#status === 'CANCELLED') throw new Error('Show is already cancelled');
    this.#status = 'CANCELLED';
  }

  toJSON() {
    return { id: this.#id, eventId: this.#eventId, venueId: this.#venueId,
      startTime: this.#startTime, basePrice: this.#basePrice, status: this.#status };
  }
}

module.exports = Show;
