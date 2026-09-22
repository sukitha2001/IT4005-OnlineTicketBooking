'use strict';

const PaymentStrategy = require('./PaymentStrategy');

/**
 * SimulatedPaymentStrategy — Concrete implementation of PaymentStrategy.
 *
 * OOP: Polymorphism — BookingService calls processPayment() on this object
 *      without knowing it's a simulation.
 *
 * The 'simulatedResult' field in the request controls the outcome.
 * No real card data is ever collected or stored.
 */
class SimulatedPaymentStrategy extends PaymentStrategy {
  /**
   * @param {{ amount: number, method: string, simulatedResult: 'success'|'failure' }} paymentRequest
   */
  async processPayment({ amount, method, simulatedResult = 'success' }) {
    const ref = `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Simulate a short processing delay (realistic UX)
    await new Promise(resolve => setTimeout(resolve, 300));

    if (simulatedResult === 'success') {
      return { status: 'SUCCESS', transactionReference: ref };
    }
    return { status: 'FAILED', transactionReference: null };
  }
}

module.exports = SimulatedPaymentStrategy;
