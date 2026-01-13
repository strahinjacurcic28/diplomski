const db = require("./pool");

module.exports = {
  getByWorkoutExerciseId: async (workoutExerciseId) => {
    const [rows] = await db.query(
      "SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY set_number ASC",
      [workoutExerciseId]
    );
    return rows;
  },

  getNextSetNumber: async (workoutExerciseId) => {
    const [rows] = await db.query(
      "SELECT MAX(set_number) AS max_set FROM sets WHERE workout_exercise_id = ?",
      [workoutExerciseId]
    );
    return (rows[0].max_set || 0) + 1;
  },

  addSet: async (workoutExerciseId, setNumber, weight, reps, rir) => {
    const [result] = await db.query(
      "INSERT INTO sets (workout_exercise_id, set_number, weight, reps, rir) VALUES (?, ?, ?, ?, ?)",
      [workoutExerciseId, setNumber, weight, reps, rir]
    );
    return result.insertId;
  },

  updateSet: async (setId, weight, reps, rir) => {
    const [result] = await db.query(
      "UPDATE sets SET weight = ?, reps = ?, rir = ? WHERE id = ?",
      [weight, reps, rir, setId]
    );
    return result;
  },

  deleteSet: async (setId) => {
    const [result] = await db.query("DELETE FROM sets WHERE id = ?", [setId]);
    return result;
  },
};
