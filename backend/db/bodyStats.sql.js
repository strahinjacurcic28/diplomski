const db = require("./pool");

module.exports = {
  getStatsByUserId: async (userId) => {
    const [rows] = await db.query(
      "SELECT * FROM body_stats WHERE user_id = ? ORDER BY date DESC",
      [userId]
    );
    return rows;
  },

  addStat: async (userId, weight, bodyFat) => {
    const [result] = await db.query(
      "INSERT INTO body_stats (user_id, date, weight, body_fat) VALUES (?, NOW(), ?, ?)",
      [userId, weight, bodyFat]
    );
    return result.insertId;
  },

  updateStat: async (statId, userId, column, value) => {
    const [result] = await db.query(
      `UPDATE body_stats SET ${column} = ?, date = NOW() WHERE id = ? AND user_id = ?`,
      [value, statId, userId]
    );
    return result;
  },
};
