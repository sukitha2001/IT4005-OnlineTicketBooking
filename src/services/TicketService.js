'use strict';

const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

class TicketService {
  constructor({ ticketRepository }) {
    this.ticketRepo = ticketRepository;
  }

  async generateTicket({ bookingId }, conn) {
    const qrValue = `TICKET-${uuidv4()}`;
    // Generate QR as data URL (base64 PNG) — stored separately if needed
    // qrValue is the unique string; QR image is generated on-demand in the view
    return this.ticketRepo.create({ bookingId, qrValue }, conn);
  }

  async getTicketWithQR(ticketId) {
    const ticket = await this.ticketRepo.findById(ticketId);
    if (!ticket) throw Object.assign(new Error('Ticket not found'), { code: 'NOT_FOUND' });
    const qrDataUrl = await QRCode.toDataURL(ticket.qrValue, { width: 200 });
    return { ticket, qrDataUrl };
  }
}

module.exports = TicketService;
