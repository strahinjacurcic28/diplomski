const express = require("express");
const router = express.Router();
const cors = require("cors");
const auth = require("../middleware/authentication");
const workoutsController = require("../controllers/workouts.controller");

router.use(cors());
router.use(express.json());

router.post("/", auth, workoutsController.createWorkout);
router.get("/", auth, workoutsController.getWorkouts);
router.delete("/:id", auth, workoutsController.deleteWorkout);
router.get("/full", auth, workoutsController.getFullWorkouts);
router.post("/full", auth, workoutsController.createFullWorkout);

module.exports = router;
