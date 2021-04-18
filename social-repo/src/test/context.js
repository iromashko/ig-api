const { randomBytes } = require('crypto');
const { format } = require('pg-format');
const { default: migrate } = require('node-pg-migrate');
const pool = require('../pool');

const DEFAULT_OPTS = {
  host: 'localhost',
  port: 5433,
  database: 'socialnetwork-test',
  user: 'postgres',
  password: '123456',
};

class Context {
  static async build() {
    const roleName = 'a' + randomBytes(4).toString('hex');

    await pool.connect(DEFAULT_OPTS);

    await pool.query(
      format('create role %I with login password %L;', roleName, roleName)
    );

    await pool.query(
      format('create schema %I authorization %L;', roleName, roleName)
    );

    await pool.close();

    await migrate({
      schema: roleName,
      direction: 'up',
      log: () => {},
      noLock: true,
      dir: 'migrations',
      databaseUrl: {
        host: 'localhost',
        port: 5433,
        database: 'socialnetwork-test',
        user: roleName,
        password: roleName,
      },
    });

    await pool.connect({
      host: 'localhost',
      port: 5433,
      database: 'socialnetwork-test',
      user: roleName,
      password: roleName,
    });

    return new Context(roleName);
  }

  constructor(roleName) {
    this.roleName = roleName;
  }

  async reset() {
    return pool.query(`delete from users;`);
  }

  static async close() {
    await pool.close();
    await pool.connect(DEFAULT_OPTS);
    await pool.query(format('drop schema %I cascade;', this.roleName));
    await pool.query(format('drop role %I;', this.roleName));
    await pool.close();
  }
}

module.exports = Context;
