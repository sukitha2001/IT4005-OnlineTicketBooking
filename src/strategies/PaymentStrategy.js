'use strict';

/**
 * PaymentStrategy — Abstract base class.
 * Design Pattern: Strategy (GoF)
 *
 * BookingService depends on this interface, not on SimulatedPaymentStrategy.
 * Swapping to a real payment gateway only requires a new subclass — BookingService
 * does not change.
 *
 * OOP: Abstraction — hides payment implementation details behind processPayment().
 */
class PaymentStrategy {
  /**
   * Process a payment request.
   * @param {{ amount: number, method: string, simulatedResult?: string }} paymentRequest
   * @returns {Promise<{ status: 'SUCCESS'|'FAILED', transactionReference: string|null }>}
   */
  async processPayment(paymentRequest) {
    throw new Error('PaymentStrategy.processPayment() must be implemented by a subclass');
  }
}

module.exports = PaymentStrategy;
