const Booking = require('../../../src/models/Booking');

describe('Booking Model State Machine', () => {
  it('should calculate total from seats statically', () => {
    const seats = [{ price: 100 }, { price: 200 }];
    expect(Booking.calculateTotal(seats)).toBe(300);
  });

  it('should transition PENDING -> PAYMENT_PROCESSING -> CONFIRMED', () => {
    const b = new Booking({ status: 'PENDING' });
    b.startPayment();
    expect(b.status).toBe('PAYMENT_PROCESSING');
    b.confirm();
    expect(b.isConfirmed).toBe(true);
  });

  it('should throw error on invalid transitions', () => {
    const b = new Booking({ status: 'PENDING' });
    expect(() => b.confirm()).toThrow(/Cannot confirm/);
    b.startPayment();
    expect(() => b.startPayment()).toThrow(/Cannot start/);
  });
});
