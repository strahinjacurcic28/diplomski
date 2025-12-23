const exercisesRepo = require("../db/exercises.sql");

module.exports = {
  getAllExercises: async (req, res) => {
    try {
      const exercises = await exercisesRepo.getAll();
      res.json(exercises);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  },

  createExercise: async (req, res) => {
    try {
      const { name, muscle_group, type, description, equipment } = req.body;

      if (!name || !muscle_group || !type)
        return res.status(400).json({ error: "Name, muscle_group, and type are required" });

      const id = await exercisesRepo.create(name, muscle_group, type, description, equipment);
      res.status(201).json({
        message: "Exercise created successfully",
        id,
        exercise: { name, muscle_group, type, description, equipment },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create exercise" });
    }
  },

  updateExercise: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, muscle_group, type, description, equipment } = req.body;

      if (!name || !muscle_group || !type)
        return res.status(400).json({ error: "Name, muscle_group and type required" });

      const exercise = await exercisesRepo.getById(id);
      if (!exercise) return res.status(404).json({ message: "Exercise not found" });

      await exercisesRepo.update(id, name, muscle_group, type, description, equipment);
      res.json({
        message: "Exercise updated successfully",
        exercise: { id, name, muscle_group, type, description, equipment },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update exercise" });
    }
  },

  deleteExercise: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await exercisesRepo.delete(id);
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Exercise not found" });

      res.json({ message: "Exercise deleted", deletedId: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete exercise" });
    }
  },
};
