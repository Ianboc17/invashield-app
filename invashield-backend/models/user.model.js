const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const UserModel = {
  async createUser({ nombre, email, password, rol }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (nombre, email, password, rol, verificado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, email, hashedPassword, rol, false]
    );
    return result.rows[0];
  },

  async getUserByEmail(email) {
    const result = await pool.query(
      'SELECT id, nombre, email, password, rol, verificado FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }
};

module.exports = UserModel;
