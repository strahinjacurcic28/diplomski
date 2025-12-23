const express = require("express");
const router = express.Router();
const cors = require("cors");
const auth = require("../middleware/authentication");
const bodyStatsController = require("../controllers/bodyStats.controller");

router.use(cors());
router.use(express.json());

router.get("/", auth, bodyStatsController.getBodyStats);
router.post("/", auth, bodyStatsController.addBodyStat);
router.put("/:id", auth, bodyStatsController.updateBodyStat);

module.exports = router;
