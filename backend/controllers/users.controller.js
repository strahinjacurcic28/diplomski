const bcrypt = require("bcrypt");
const usersRepo = require("../repositories/users.sql");

module.exports = {
  getUser: async (req, res) => {
    try {
      const user = await usersRepo.getUserById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  },

  register: async (req, res) => {
    try {
      const { username, email, password, gender, date_of_birth } = req.body;
      if (!username || !email || !password)
        return res.status(400).json({ error: "Username, email and password required" });

      const existing = await usersRepo.getUserByUsernameOrEmail(username, email);
      if (existing.length > 0) return res.status(400).json({ error: "User already exists" });

      const hashed = await bcrypt.hash(password, 10);
      const id = await usersRepo.createUser(username, email, hashed, gender, date_of_birth);
      res.status(201).json({ message: "User registered successfully", id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const user_id = req.user.id;
      let { column, value } = req.body;

      const allowedColumns = ["username", "email", "password_hash", "gender", "date_of_birth"];
      if (!allowedColumns.includes(column))
        return res.status(400).json({ error: "Invalid field" });

      if (column === "password_hash") {
        value = await bcrypt.hash(value, 10);
      }

      const user = await usersRepo.getUserById(user_id);
      if (!user) return res.status(404).json({ message: "User not found" });

      await usersRepo.updateUserColumn(user_id, column, value);
      res.json({ message: "User updated successfully", user: { id: user_id, [column]: value } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update user" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await usersRepo.deleteUserById(id);

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "User not found" });

      res.json({ message: "User deleted successfully", deletedId: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete user" });
    }
  },
};
