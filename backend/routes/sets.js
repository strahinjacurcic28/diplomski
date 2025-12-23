const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");
const setsController = require("../controllers/sets.controller");

router.use(express.json());

router.get("/:workout_exercise_id", auth, setsController.getSets);
router.post("/", auth, setsController.addSet);
router.put("/:set_id", auth, setsController.updateSet);
router.delete("/:set_id", auth, setsController.deleteSet);

module.exports = router;
