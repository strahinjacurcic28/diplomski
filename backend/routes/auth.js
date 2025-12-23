const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");

const router = express.Router();

router.use(cors());
router.use(express.json());


const SECRET = "mysecretkey";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "training_tracker",
});

router.post("/", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = rows[0];

    try {
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(400).json({ error: "Invalid password" });

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET, {
        expiresIn: "7d",
      });

      res.json({ message: "Login successful", token });
    } catch (e) {
      res.status(500).json({ error: "Login failed" });
    }
  });
});



module.exports = router;