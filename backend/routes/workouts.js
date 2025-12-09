const express = require("express");
const router = express.Router();
const cors = require("cors");
const auth = require("../middleware/authentication");
const mysql = require("mysql2/promise");

router.use(cors());
router.use(express.json());

const db = mysql.createPool({
  user: "root",
  password: "root",
  host: "localhost",
  database: "training_tracker",
});

router.post("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name, date, duration, notes } = req.body;

    const [result] = await db.query(
      "INSERT INTO workouts (user_id, name, date, duration_minutes, notes) VALUES (?, ?, ?, ?, ?)",
      [user_id, name, date, duration || 0, notes || null]
    );

    res.status(201).json({ message: "Workout created", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const [rows] = await db.query("SELECT * FROM workouts WHERE user_id = ?", [
      user_id,
    ]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/full", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const [rows] = await db.query(`
        SELECT 
	w.name as workout_name,
    w.notes as workout_notes,
    w.duration_minutes as workout_duration,
    w.id AS workout_id,
    w.date AS workout_date,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'exercise_id', e.id,
            'exercise_name', e.name,
            'exercise_muscle_group', e.muscle_group,
            'exercise_type', e.type,
			'exercise_description', e.description,
            'exercise_equipment', e.equipment,
            'sets', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT('set_id', s.id, 'reps', s.reps, 'weight', s.weight, 'rir', s.rir)
                )
                FROM sets s
                WHERE s.workout_exercise_id = we.id
            )
        )
    ) AS exercises
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.id
JOIN exercises e ON e.id = we.exercise_id
WHERE w.user_id = ?
GROUP BY w.id
ORDER BY w.date;
      `, [user_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/full", auth, async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { name, duration, notes, exercises } = req.body;
    const user_id = req.user.id;

    await conn.beginTransaction();

    const [workoutResult] = await conn.query(
      `INSERT INTO workouts (user_id, name, date, duration_minutes, notes)
       VALUES (?, ?, NOW(), ?, ?)`,
      [user_id, name, duration || 0, notes || ""]
    );

    const workoutId = workoutResult.insertId;

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];

      const [weResult] = await conn.query(
        `INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
         VALUES (?, ?, ?)`,
        [workoutId, ex.exercise_id, ex.order_index]
      );
      const workoutExerciseId = weResult.insertId;

      for (const s of ex.sets) {
        await conn.query(
          `INSERT INTO sets (workout_exercise_id, set_number, weight, reps, rir)
           VALUES (?, ?, ?, ?, ?)`,
          [workoutExerciseId, s.set_number, s.weight, s.reps, s.rir || null]
        );
      }
    }

    await conn.commit();
    conn.release();

    res.json({ success: true, workoutId });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ error: "Failed to save workout" });
  }
});

module.exports = router;
