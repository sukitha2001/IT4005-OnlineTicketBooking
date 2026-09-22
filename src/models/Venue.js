'use strict';

class Venue {
  #id; #name; #location; #createdAt;
  constructor({ venue_id, name, location, created_at }) {
    this.#id = venue_id; this.#name = name;
    this.#location = location; this.#createdAt = created_at;
  }
  get id()        { return this.#id; }
  get name()      { return this.#name; }
  get location()  { return this.#location; }
  get createdAt() { return this.#createdAt; }
  toJSON() { return { id: this.#id, name: this.#name, location: this.#location }; }
}

module.exports = Venue;
