const db = require("./pool");

module.exports = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM exercises;");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM exercises WHERE id = ?", [id]);
    return rows[0] || null;
  },

  create: async (name, muscle_group, type, description, equipment) => {
    const [result] = await db.query(
      "INSERT INTO exercises (name, muscle_group, type, description, equipment) VALUES (?, ?, ?, ?, ?)",
      [name, muscle_group, type, description, equipment]
    );
    return result.insertId;
  },

  update: async (id, name, muscle_group, type, description, equipment) => {
    const [result] = await db.query(
      "UPDATE exercises SET name=?, muscle_group=?, type=?, description=?, equipment=? WHERE id=?",
      [name, muscle_group, type, description, equipment, id]
    );
    return result;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM exercises WHERE id=?", [id]);
    return result;
  },
};
