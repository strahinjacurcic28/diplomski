const express = require("express");
const router = express.Router();
const cors = require("cors");
const auth = require("../middleware/authentication");
const bcrypt = require("bcrypt");

router.use(cors());
router.use(express.json());
const mysql = require("mysql");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "training_tracker",
});

router.get("/", auth, (req, res) => {
  const user_id = req.user.id
  db.query("SELECT * FROM users WHERE id = ?;", [user_id], (err, result) => {
    if (err) {
      console.log(err);
    }

    res.send(result);
  });
});

router.post("/register", async (req, res) => {
  const { username, email, password, gender, date_of_birth } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email and password required" });
  }

  // Check if username/email exists
  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [username, email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) return res.status(400).json({ error: "User already exists" });

      // Hash the password
      const hashed = await bcrypt.hash(password, 10);

      // Insert into DB using password_hash
      db.query(
        "INSERT INTO users (username, email, password_hash, gender, date_of_birth, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [username, email, hashed, gender, date_of_birth],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: "User registered successfully" });
        }
      );
    }
  );
});


router.put("/", auth, async (req, res) => {
  const user_id = req.user.id;
  let { column, value } = req.body;

  // Whitelist allowed columns
  const allowedColumns = ["username", "email", "password_hash", "gender", "date_of_birth"];
  if (!allowedColumns.includes(column)) {
    return res.status(400).json({ error: "Invalid field" });
  }

  if (column === "password_hash") {
    value = await bcrypt.hash(value, 10);
  }

  db.query("SELECT * FROM users WHERE id = ?", [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    db.query(
      `UPDATE users SET ${column} = ? WHERE id = ?`,
      [value, user_id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Failed to update user" });
        }

        res.status(200).json({
          message: "User updated successfully",
          user: {
            id: user_id,
            [column]: value,
          },
        });
      }
    );
  });
});


router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete user" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      deletedId: id,
    });
  });
});

module.exports = router;
