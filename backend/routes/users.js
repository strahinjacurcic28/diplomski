const express = require("express");
const router = express.Router();
const cors = require("cors");
const auth = require("../middleware/authentication");
const usersController = require("../controllers/users.controller");

router.use(cors());
router.use(express.json());

router.get("/", auth, usersController.getUser);
router.post("/register", usersController.register);
router.put("/", auth, usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;
