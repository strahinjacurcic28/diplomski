const db = require("./pool");

module.exports = {
  createWorkout: async (userId, name, date, duration, notes) => {
    const [result] = await db.query(
      `INSERT INTO workouts (user_id, name, date, duration_minutes, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, name, date, duration || 0, notes || null]
    );
    return result.insertId;
  },

  getWorkoutsByUser: async (userId) => {
    const [rows] = await db.query("SELECT * FROM workouts WHERE user_id = ?", [userId]);
    return rows;
  },

  getFullWorkoutsByUser: async (userId) => {
    const [rows] = await db.query(
      `
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
      `,
      [userId]
    );
    return rows;
  },

  deleteWorkout: async (id) => {
    const [result] = await db.query("DELETE FROM workouts WHERE id=?", [id]);
    return result;
  },

  createFullWorkoutTransaction: async (
    userId,
    name,
    duration,
    notes,
    exercises
  ) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [workoutResult] = await conn.query(
        `INSERT INTO workouts (user_id, name, date, duration_minutes, notes)
         VALUES (?, ?, NOW(), ?, ?)`,
        [userId, name, duration || 0, notes || ""]
      );
      const workoutId = workoutResult.insertId;

      for (const ex of exercises) {
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
      return workoutId;
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  },
};
