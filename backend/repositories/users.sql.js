const db = require("./pool");

module.exports = {
  getUserById: async (id) => {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  },

  getUserByUsernameOrEmail: async (username, email) => {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    return rows;
  },

  createUser: async (username, email, passwordHash, gender, date_of_birth) => {
    const [result] = await db.query(
      "INSERT INTO users (username, email, password_hash, gender, date_of_birth, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [username, email, passwordHash, gender, date_of_birth]
    );
    return result.insertId;
  },

  updateUserColumn: async (id, column, value) => {
    const [result] = await db.query(`UPDATE users SET ${column} = ? WHERE id = ?`, [
      value,
      id,
    ]);
    return result;
  },

  deleteUserById: async (id) => {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return result;
  },
};
