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
  const { workout_id, exercise_id } = req.body;

  if (!workout_id || !exercise_id)
    return res.status(400).json({ error: "Missing workout_id or exercise_id" });

  db.query(
    "SELECT COALESCE(MAX(order_index), 0) AS maxIndex FROM workout_exercises WHERE workout_id = ?",
    [workout_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch index" });

      const nextIndex = rows[0].maxIndex + 1;

      db.query(
        "INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES (?, ?, ?)",
        [workout_id, exercise_id, nextIndex],
        (err2) => {
          if (err2) return res.status(500).json({ error: "Insert failed" });
          res.json({
            message: "Exercise added to workout",
            order_index: nextIndex,
          });
        }
      );
    }
  );
});

router.get("/:workout_id", auth, (req, res) => {
  const { workout_id } = req.params;

  db.query(
    `
    SELECT
  w.name AS workout_name,
  e.name AS exercise_name,
  we.order_index,
  CAST(
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'set_number', s.set_number,
        'weight', s.weight,
        'reps', s.reps,
        'rir', s.rir
      )
    ) AS JSON
  ) AS sets
FROM workout_exercises we
JOIN workouts w ON w.id = we.workout_id
JOIN exercises e ON e.id = we.exercise_id
LEFT JOIN sets s ON s.workout_exercise_id = we.id
WHERE we.workout_id = ?
GROUP BY we.id;

    `,
    [workout_id],
    (err, rows) => {
      if (err) throw err;
      res.json(rows);
    }
  );
});

router.put("/:workout_id/:exercise_id", auth, (req, res) => {
  const { workout_id, exercise_id } = req.params;
  const { order_index } = req.body;

  db.query(
    "UPDATE workout_exercises SET order_index = ? WHERE workout_id = ? AND exercise_id = ?",
    [order_index, workout_id, exercise_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ message: "Workout exercise updated" });
    }
  );
});

router.delete("/:workout_id/:exercise_id", auth, (req, res) => {
  const { workout_id, exercise_id } = req.params;

  db.query(
    "DELETE FROM workout_exercises WHERE workout_id = ? AND exercise_id = ?",
    [workout_id, exercise_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Delete failed" });
      res.json({ message: "Exercise removed from workout" });
    }
  );
});

module.exports = router;
