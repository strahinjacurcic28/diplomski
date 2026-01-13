const db = require("./pool");

module.exports = {
  getNextOrderIndex: async (workoutId) => {
    const [rows] = await db.query(
      "SELECT COALESCE(MAX(order_index), 0) AS maxIndex FROM workout_exercises WHERE workout_id = ?",
      [workoutId]
    );
    return rows[0].maxIndex + 1;
  },

  addExerciseToWorkout: async (workoutId, exerciseId, orderIndex) => {
    await db.query(
      "INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES (?, ?, ?)",
      [workoutId, exerciseId, orderIndex]
    );
    return orderIndex;
  },

  getExercisesByWorkout: async (workoutId) => {
    const [rows] = await db.query(
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
      [workoutId]
    );
    return rows;
  },

  updateOrderIndex: async (workoutId, exerciseId, orderIndex) => {
    const [result] = await db.query(
      "UPDATE workout_exercises SET order_index = ? WHERE workout_id = ? AND exercise_id = ?",
      [orderIndex, workoutId, exerciseId]
    );
    return result;
  },

  removeExerciseFromWorkout: async (workoutId, exerciseId) => {
    const [result] = await db.query(
      "DELETE FROM workout_exercises WHERE workout_id = ? AND exercise_id = ?",
      [workoutId, exerciseId]
    );
    return result;
  },
};
