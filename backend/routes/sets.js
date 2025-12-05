const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");
const mysql = require("mysql");

router.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "training_tracker",
});

router.post("/", auth, (req, res) => {
  const { workout_exercise_id, weight, reps, rir } = req.body;

  if (!workout_exercise_id || weight == null || reps == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.query(
    "SELECT MAX(set_number) AS max_set FROM sets WHERE workout_exercise_id = ?",
    [workout_exercise_id],
    (err, rows) => {
      if (err) throw err;

      const nextSetNumber = (rows[0].max_set || 0) + 1;

      db.query(
        `INSERT INTO sets (workout_exercise_id, set_number, weight, reps, rir)
         VALUES (?, ?, ?, ?, ?)`,
        [workout_exercise_id, nextSetNumber, weight, reps, rir],
        (err, result) => {
          if (err) throw err;

          res.status(201).json({
            message: "Set added successfully",
            set: {
              workout_exercise_id,
              set_number: nextSetNumber,
              weight,
              reps,
              rir,
            },
          });
        }
      );
    }
  );
});

router.get("/:workout_exercise_id", auth, (req, res) => {
  const { workout_exercise_id } = req.params;

  db.query(
    "SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY set_number ASC",
    [workout_exercise_id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.put("/:set_id", auth, (req, res) => {
  const { set_id } = req.params;
  const { weight, reps, rir } = req.body;

  db.query(
    "UPDATE sets SET weight = ?, reps = ?, rir = ? WHERE id = ?",
    [weight, reps, rir, set_id],
    (err) => {
      if (err) throw err;
      res.json({ message: "Set updated" });
    }
  );
});

router.delete("/:set_id", auth, (req, res) => {
  const { set_id } = req.params;

  db.query("DELETE FROM sets WHERE id = ?", [set_id], (err) => {
    if (err) throw err;
    res.json({ message: "Set deleted" });
  });
});

module.exports = router;
