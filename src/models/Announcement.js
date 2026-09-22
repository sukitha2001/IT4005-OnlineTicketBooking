'use strict';
class Announcement {
  #id; #authorId; #eventId; #audience; #message; #createdAt;
  constructor({ announcement_id, author_id, event_id, audience, message, created_at }) {
    this.#id = announcement_id; this.#authorId = author_id; this.#eventId = event_id;
    this.#audience = audience; this.#message = message; this.#createdAt = created_at;
  }
  get id()        { return this.#id; }
  get authorId()  { return this.#authorId; }
  get eventId()   { return this.#eventId; }
  get audience()  { return this.#audience; }
  get message()   { return this.#message; }
  get createdAt() { return this.#createdAt; }
  toJSON() { return { id: this.#id, authorId: this.#authorId, eventId: this.#eventId, audience: this.#audience, message: this.#message, createdAt: this.#createdAt }; }
}
module.exports = Announcement;
