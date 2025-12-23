const workoutsRepo = require("../db/workouts.sql");

module.exports = {
  createWorkout: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, date, duration, notes } = req.body;

      const workoutId = await workoutsRepo.createWorkout(userId, name, date, duration, notes);
      res.status(201).json({ message: "Workout created", id: workoutId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB error" });
    }
  },

  getWorkouts: async (req, res) => {
    try {
      const userId = req.user.id;
      const workouts = await workoutsRepo.getWorkoutsByUser(userId);
      res.json(workouts); // must be iterable
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB error" });
    }
  },

  getFullWorkouts: async (req, res) => {
    try {
      const userId = req.user.id;
      const workouts = await workoutsRepo.getFullWorkoutsByUser(userId);
      res.json(workouts); // must be iterable
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB error" });
    }
  },

  createFullWorkout: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, duration, notes, exercises } = req.body;

      const workoutId = await workoutsRepo.createFullWorkoutTransaction(
        userId,
        name,
        duration,
        notes,
        exercises
      );

      res.status(201).json({ success: true, workoutId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save workout" });
    }
  },
};
