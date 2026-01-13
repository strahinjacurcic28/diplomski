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
    const [rows] = await db.query("SELECT * FROM workouts WHERE user_id = ?", [
      userId,
    ]);
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

  getFullWorkoutById: async (workoutId) => {
    const [rows] = await db.query(
      `
    SELECT 
      w.name AS workout_name,
      w.notes AS workout_notes,
      w.duration_minutes AS workout_duration,
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
              JSON_OBJECT(
                'set_id', s.id,
                'reps', s.reps,
                'weight', s.weight,
                'rir', s.rir
              )
            )
            FROM sets s
            WHERE s.workout_exercise_id = we.id
          )
        )
      ) AS exercises
    FROM workouts w
    JOIN workout_exercises we ON we.workout_id = w.id
    JOIN exercises e ON e.id = we.exercise_id
    WHERE w.id = ?
    GROUP BY w.id;
    `,
      [workoutId]
    );

    return rows[0] || null;
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

  updateFullWorkoutTransaction: async (
    workoutId,
    userId,
    name,
    duration,
    notes,
    exercises
  ) => {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      /* 1. Update workout osnovnih podataka */
      const [updateResult] = await conn.query(
        `
      UPDATE workouts
      SET name = ?, duration_minutes = ?, notes = ?
      WHERE id = ? AND user_id = ?
      `,
        [name, duration || 0, notes || "", workoutId, userId]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error("Workout not found or not owned by user");
      }

      /* 2. Obriši stare setove */
      await conn.query(
        `
      DELETE s FROM sets s
      JOIN workout_exercises we ON we.id = s.workout_exercise_id
      WHERE we.workout_id = ?
      `,
        [workoutId]
      );

      /* 3. Obriši stare workout_exercises */
      await conn.query(`DELETE FROM workout_exercises WHERE workout_id = ?`, [
        workoutId,
      ]);

      /* 4. Ubaci nove exercises + sets */
      for (const ex of exercises) {
        const [weResult] = await conn.query(
          `
        INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
        VALUES (?, ?, ?)
        `,
          [workoutId, ex.exercise_id, ex.order_index]
        );

        const workoutExerciseId = weResult.insertId;

        for (const s of ex.sets) {
          await conn.query(
            `
          INSERT INTO sets (workout_exercise_id, set_number, weight, reps, rir)
          VALUES (?, ?, ?, ?, ?)
          `,
            [workoutExerciseId, s.set_number, s.weight, s.reps, s.rir ?? null]
          );
        }
      }

      await conn.commit();
      conn.release();
      return true;
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  },
};
