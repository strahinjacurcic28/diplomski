const express = require("express");
const router = express.Router();
const cors = require("cors");
const exercisesController = require("../controllers/exercises.controller");

router.use(cors());
router.use(express.json());

router.get("/", exercisesController.getAllExercises);
router.post("/", exercisesController.createExercise);
router.put("/:id", exercisesController.updateExercise);
router.delete("/:id", exercisesController.deleteExercise);

module.exports = router;
