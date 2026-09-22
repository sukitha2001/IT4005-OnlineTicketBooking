'use strict';
const BaseRepository = require('./BaseRepository');
const Venue = require('../models/Venue');

class VenueRepository extends BaseRepository {
  async findById(id) {
    const rows = await this.query('SELECT * FROM venue WHERE venue_id = ?', [id]);
    return rows[0] ? new Venue(rows[0]) : null;
  }
  async findAll() {
    const rows = await this.query('SELECT * FROM venue ORDER BY name');
    return rows.map(r => new Venue(r));
  }
  async create({ name, location }) {
    const result = await this.query('INSERT INTO venue (name, location) VALUES (?,?)', [name, location]);
    return this.findById(result.insertId);
  }
}
module.exports = VenueRepository;
