const workoutExercisesRepo = require("../repositories/workoutExercises.sql");

module.exports = {
  addExercise: async (req, res) => {
    try {
      const { workout_id, exercise_id } = req.body;

      if (!workout_id || !exercise_id)
        return res.status(400).json({ error: "Missing workout_id or exercise_id" });

      const order_index = await workoutExercisesRepo.getNextOrderIndex(workout_id);
      await workoutExercisesRepo.addExerciseToWorkout(workout_id, exercise_id, order_index);

      res.json({ message: "Exercise added to workout", order_index });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add exercise" });
    }
  },

  getExercises: async (req, res) => {
    try {
      const { workout_id } = req.params;
      const exercises = await workoutExercisesRepo.getExercisesByWorkout(workout_id);
      res.json(exercises);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch exercises" });
    }
  },

  updateOrder: async (req, res) => {
    try {
      const { workout_id, exercise_id } = req.params;
      const { order_index } = req.body;

      await workoutExercisesRepo.updateOrderIndex(workout_id, exercise_id, order_index);
      res.json({ message: "Workout exercise order updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update exercise" });
    }
  },

  removeExercise: async (req, res) => {
    try {
      const { workout_id, exercise_id } = req.params;

      await workoutExercisesRepo.removeExerciseFromWorkout(workout_id, exercise_id);
      res.json({ message: "Exercise removed from workout" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to remove exercise" });
    }
  },
};
