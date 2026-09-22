'use strict';
class Payment {
  #id; #bookingId; #method; #amount; #status; #transactionReference; #paidAt;
  constructor({ payment_id, booking_id, method, amount, status, transaction_reference, paid_at }) {
    this.#id = payment_id; this.#bookingId = booking_id; this.#method = method;
    this.#amount = parseFloat(amount); this.#status = status;
    this.#transactionReference = transaction_reference; this.#paidAt = paid_at;
  }
  get id()                   { return this.#id; }
  get bookingId()             { return this.#bookingId; }
  get method()                { return this.#method; }
  get amount()                { return this.#amount; }
  get status()                { return this.#status; }
  get transactionReference()  { return this.#transactionReference; }
  get paidAt()                { return this.#paidAt; }
  get isSuccessful()          { return this.#status === 'SUCCESS'; }
  toJSON() {
    return { id: this.#id, bookingId: this.#bookingId, method: this.#method,
      amount: this.#amount, status: this.#status, transactionReference: this.#transactionReference, paidAt: this.#paidAt };
  }
}
module.exports = Payment;
