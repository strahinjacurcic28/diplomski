const setsRepo = require("../db/sets.sql");

module.exports = {
  getSets: async (req, res) => {
    try {
      const { workout_exercise_id } = req.params;
      const sets = await setsRepo.getByWorkoutExerciseId(workout_exercise_id);
      res.json(sets);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  },

  addSet: async (req, res) => {
    try {
      const { workout_exercise_id, weight, reps, rir } = req.body;

      if (!workout_exercise_id || weight == null || reps == null) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const nextSetNumber = await setsRepo.getNextSetNumber(workout_exercise_id);
      const id = await setsRepo.addSet(workout_exercise_id, nextSetNumber, weight, reps, rir);

      res.status(201).json({
        message: "Set added successfully",
        set: { id, workout_exercise_id, set_number: nextSetNumber, weight, reps, rir },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add set" });
    }
  },

  updateSet: async (req, res) => {
    try {
      const { set_id } = req.params;
      const { weight, reps, rir } = req.body;

      const result = await setsRepo.updateSet(set_id, weight, reps, rir);
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Set not found" });

      res.json({ message: "Set updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update set" });
    }
  },

  deleteSet: async (req, res) => {
    try {
      const { set_id } = req.params;

      const result = await setsRepo.deleteSet(set_id);
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Set not found" });

      res.json({ message: "Set deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete set" });
    }
  },
};
