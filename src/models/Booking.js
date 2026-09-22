'use strict';

/**
 * Booking domain model.
 * OOP: Encapsulation + State Machine
 *
 * Valid transitions:
 *  PENDING → PAYMENT_PROCESSING
 *  PAYMENT_PROCESSING → CONFIRMED
 *  PAYMENT_PROCESSING → PAYMENT_FAILED
 *  PAYMENT_FAILED → PAYMENT_PROCESSING  (retry)
 *  PENDING → EXPIRED
 */
class Booking {
  #id; #userId; #showId; #reference; #totalAmount; #status; #bookedAt;

  constructor({ booking_id, user_id, show_id, reference, total_amount, status, booked_at }) {
    this.#id          = booking_id;
    this.#userId      = user_id;
    this.#showId      = show_id;
    this.#reference   = reference;
    this.#totalAmount = parseFloat(total_amount);
    this.#status      = status;
    this.#bookedAt    = booked_at;
  }

  get id()          { return this.#id; }
  get userId()      { return this.#userId; }
  get showId()      { return this.#showId; }
  get reference()   { return this.#reference; }
  get totalAmount() { return this.#totalAmount; }
  get status()      { return this.#status; }
  get bookedAt()    { return this.#bookedAt; }
  get isConfirmed() { return this.#status === 'CONFIRMED'; }

  /** Calculate total from an array of ShowSeat instances. */
  static calculateTotal(showSeats) {
    return showSeats.reduce((sum, ss) => sum + ss.price, 0);
  }

  /** Move to PAYMENT_PROCESSING. */
  startPayment() {
    if (this.#status !== 'PENDING') {
      throw new Error(`Cannot start payment: booking is ${this.#status}`);
    }
    this.#status = 'PAYMENT_PROCESSING';
  }

  /** Confirm after successful payment. */
  confirm() {
    if (this.#status !== 'PAYMENT_PROCESSING') {
      throw new Error(`Cannot confirm: booking is ${this.#status}`);
    }
    this.#status = 'CONFIRMED';
  }

  /** Record payment failure. */
  fail() {
    if (this.#status !== 'PAYMENT_PROCESSING') {
      throw new Error(`Cannot fail: booking is ${this.#status}`);
    }
    this.#status = 'PAYMENT_FAILED';
  }

  /** Expire abandoned bookings. */
  expire() {
    if (this.#status !== 'PENDING') {
      throw new Error(`Cannot expire: booking is ${this.#status}`);
    }
    this.#status = 'EXPIRED';
  }

  /** Check ownership. */
  isOwnedBy(userId) { return this.#userId === userId; }

  toJSON() {
    return { id: this.#id, userId: this.#userId, showId: this.#showId, reference: this.#reference,
      totalAmount: this.#totalAmount, status: this.#status, bookedAt: this.#bookedAt };
  }
}

module.exports = Booking;
