const BookingService = require('../../../src/services/BookingService');

jest.mock('uuid', () => ({ v4: () => 'test-uuid-1234' }));

describe('BookingService', () => {
  let bookingSvc;
  let mockRepos;

  beforeEach(() => {
    mockRepos = {
      bookingRepository: {
        transaction: jest.fn((cb) => cb('mock-conn')),
        create: jest.fn().mockResolvedValue({ id: 1, startPayment: jest.fn(), confirm: jest.fn(), fail: jest.fn() }),
        updateStatus: jest.fn()
      },
      bookingSeatRepository: { createBulk: jest.fn() },
      showSeatRepository: {
        lockForUpdate: jest.fn(),
        updateStatus: jest.fn()
      },
      paymentRepository: { create: jest.fn().mockResolvedValue({ id: 1 }) },
      ticketRepository: { create: jest.fn() },
      paymentStrategy: { processPayment: jest.fn() },
      ticketService: { generateTicket: jest.fn().mockResolvedValue({ id: 1 }) },
      auditService: { log: jest.fn() }
    };
    bookingSvc = new BookingService(mockRepos);
  });

  it('should successfully create a booking when seats are available and payment succeeds', async () => {
    // Setup mocks
    mockRepos.showSeatRepository.lockForUpdate.mockResolvedValue([
      { id: 1, price: 100, isAvailable: true, showId: 99, label: 'A1' }
    ]);
    mockRepos.paymentStrategy.processPayment.mockResolvedValue({ status: 'SUCCESS', transactionReference: 'TX123' });

    const result = await bookingSvc.createBooking({ userId: 1, showId: 99, showSeatIds: [1] });
    
    expect(result.booking).toBeDefined();
    expect(result.ticket).toBeDefined();
    expect(mockRepos.bookingRepository.updateStatus).toHaveBeenCalledWith(1, 'CONFIRMED', 'mock-conn');
    expect(mockRepos.showSeatRepository.updateStatus).toHaveBeenCalledWith([1], 'BOOKED', 'mock-conn');
  });

  it('should fail if seats are not available', async () => {
    mockRepos.showSeatRepository.lockForUpdate.mockResolvedValue([
      { id: 1, price: 100, isAvailable: false, showId: 99, label: 'A1' }
    ]);

    await expect(bookingSvc.createBooking({ userId: 1, showId: 99, showSeatIds: [1] }))
      .rejects.toThrow('Seats no longer available: A1');
  });

  it('should record payment failure and throw if payment is rejected', async () => {
    mockRepos.showSeatRepository.lockForUpdate.mockResolvedValue([
      { id: 1, price: 100, isAvailable: true, showId: 99, label: 'A1' }
    ]);
    mockRepos.paymentStrategy.processPayment.mockResolvedValue({ status: 'FAILED' });

    await expect(bookingSvc.createBooking({ userId: 1, showId: 99, showSeatIds: [1] }))
      .rejects.toThrow('Payment was declined');
    
    expect(mockRepos.bookingRepository.updateStatus).toHaveBeenCalledWith(1, 'PAYMENT_FAILED', 'mock-conn');
    expect(mockRepos.showSeatRepository.updateStatus).not.toHaveBeenCalled(); // Seats not booked
  });
});
