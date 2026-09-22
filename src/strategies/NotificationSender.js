'use strict';

/** Abstract base for notification delivery. */
class NotificationSender {
  async send(recipient, message) {
    throw new Error('NotificationSender.send() must be implemented');
  }
}

module.exports = NotificationSender;
