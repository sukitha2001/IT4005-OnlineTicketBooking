'use strict';

/**
 * BaseRepository — shared query helpers and transaction management.
 * Design Pattern: Template Method — transaction lifecycle is fixed here;
 * callers supply the specific operations via callback.
 */
class BaseRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Execute a parameterized query on the pool.
   * @param {string} sql
   * @param {Array}  params
   * @returns {Promise<Array>}
   */
  async query(sql, params = []) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }

  /**
   * Run a set of operations inside a single transaction.
   * Automatically commits on success and rolls back on error.
   * @param {function(connection): Promise<T>} callback
   * @returns {Promise<T>}
   */
  async transaction(callback) {
    const conn = await this.pool.getConnection();
    await conn.beginTransaction();
    try {
      const result = await callback(conn);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = BaseRepository;
