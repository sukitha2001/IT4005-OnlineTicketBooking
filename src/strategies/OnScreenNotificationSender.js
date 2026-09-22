'use strict';

const NotificationSender = require('./NotificationSender');

/**
 * OnScreenNotificationSender — stores announcement in DB for display.
 * Concrete implementation of NotificationSender Strategy.
 */
class OnScreenNotificationSender extends NotificationSender {
  constructor(announcementRepository) {
    super();
    this.announcementRepo = announcementRepository;
  }

  async send({ authorId, eventId, audience, message }) {
    return this.announcementRepo.create({ authorId, eventId, audience, message });
  }
}

module.exports = OnScreenNotificationSender;
