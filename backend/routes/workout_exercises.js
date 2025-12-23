const express = require("express");
const router = express.Router();
const cors = require("cors");
const auth = require("../middleware/authentication");
const workoutExercisesController = require("../controllers/workoutExercises.controller");

router.use(cors());
router.use(express.json());

router.post("/", auth, workoutExercisesController.addExercise);
router.get("/:workout_id", auth, workoutExercisesController.getExercises);
router.put("/:workout_id/:exercise_id", auth, workoutExercisesController.updateOrder);
router.delete("/:workout_id/:exercise_id", auth, workoutExercisesController.removeExercise);

module.exports = router;
