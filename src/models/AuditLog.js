'use strict';
class AuditLog {
  #id; #actorId; #action; #entityType; #entityId; #details; #createdAt;
  constructor({ log_id, actor_id, action, entity_type, entity_id, details, created_at }) {
    this.#id = log_id; this.#actorId = actor_id; this.#action = action;
    this.#entityType = entity_type; this.#entityId = entity_id;
    this.#details = details; this.#createdAt = created_at;
  }
  get id()         { return this.#id; }
  get actorId()    { return this.#actorId; }
  get action()     { return this.#action; }
  get entityType() { return this.#entityType; }
  get entityId()   { return this.#entityId; }
  get details()    { return this.#details; }
  get createdAt()  { return this.#createdAt; }
  toJSON() { return { id: this.#id, actorId: this.#actorId, action: this.#action, entityType: this.#entityType, entityId: this.#entityId, details: this.#details, createdAt: this.#createdAt }; }
}
module.exports = AuditLog;
