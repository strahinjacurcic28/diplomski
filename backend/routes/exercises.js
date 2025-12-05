const express = require("express");
const router = express.Router();
const cors = require("cors");

router.use(cors());
router.use(express.json());
const mysql = require("mysql");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "training_tracker",
});

router.get("/", (req, res) => {
  db.query("SELECT * FROM exercises;", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(result);
  });
});

router.post("/", (req, res) => {
  const { name, muscle_group, type, description, equipment } = req.body;

  if (!name || !muscle_group || !type) {
    return res.status(400).json({ error: "Name, muscle_group, and type are required" });
  }

  db.query(
    `INSERT INTO exercises (name, muscle_group, type, description, equipment)
     VALUES (?, ?, ?, ?, ?);`,
    [name, muscle_group, type, description, equipment],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to add exercise" });
      }

      res.status(201).json({
        message: "Exercise created successfully",
        id: result.insertId,
        exercise: { name, muscle_group, type, description, equipment },
      });
    }
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, muscle_group, type, description, equipment } = req.body;

  if (!name || !muscle_group || !type) {
    return res.status(400).json({ error: "Name, muscle_group and type required" });
  }

  db.query("SELECT * FROM exercises WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (rows.length === 0) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    db.query(
      `UPDATE exercises
       SET name=?, muscle_group=?, type=?, description=?, equipment=?
       WHERE id = ?`,
      [name, muscle_group, type, description, equipment, id],
      (err) => {
        if (err) return res.status(500).json({ error: "Update failed" });

        res.json({
          message: "Exercise updated successfully",
          exercise: { id, name, muscle_group, type, description, equipment },
        });
      }
    );
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM exercises WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete exercise" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    res.json({ message: "Exercise deleted", deletedId: id });
  });
});

module.exports = router;
