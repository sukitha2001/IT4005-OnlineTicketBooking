'use strict';

const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'UNPUBLISHED'];

/**
 * Event domain model.
 * OOP: Encapsulation — state transitions enforced via methods.
 */
class Event {
  #id;
  #organizerId;
  #title;
  #description;
  #type;
  #genre;
  #durationMinutes;
  #imageUrl;
  #status;
  #createdAt;
  #updatedAt;

  constructor({ event_id, organizer_id, title, description, type, genre, duration_minutes, image_url, status, created_at, updated_at }) {
    this.#id              = event_id;
    this.#organizerId     = organizer_id;
    this.#title           = title;
    this.#description     = description;
    this.#type            = type;
    this.#genre           = genre;
    this.#durationMinutes = duration_minutes;
    this.#imageUrl        = image_url;
    this.#status          = status;
    this.#createdAt       = created_at;
    this.#updatedAt       = updated_at;
  }

  get id()              { return this.#id; }
  get organizerId()     { return this.#organizerId; }
  get title()           { return this.#title; }
  get description()     { return this.#description; }
  get type()            { return this.#type; }
  get genre()           { return this.#genre; }
  get durationMinutes() { return this.#durationMinutes; }
  get imageUrl()        { return this.#imageUrl; }
  get status()          { return this.#status; }
  get isPublished()     { return this.#status === 'PUBLISHED'; }

  /** Publish event — only from DRAFT or UNPUBLISHED. */
  publish() {
    if (this.#status === 'PUBLISHED') throw new Error('Event is already published');
    this.#status = 'PUBLISHED';
  }

  /** Unpublish event — only from PUBLISHED. */
  unpublish() {
    if (this.#status !== 'PUBLISHED') throw new Error('Only published events can be unpublished');
    this.#status = 'UNPUBLISHED';
  }

  /** Check if this event belongs to a given organizer. */
  isOwnedBy(organizerId) {
    return this.#organizerId === organizerId;
  }

  toJSON() {
    return {
      id: this.#id, organizerId: this.#organizerId, title: this.#title,
      description: this.#description, type: this.#type, genre: this.#genre,
      durationMinutes: this.#durationMinutes, imageUrl: this.#imageUrl,
      status: this.#status, createdAt: this.#createdAt,
    };
  }
}

module.exports = Event;
