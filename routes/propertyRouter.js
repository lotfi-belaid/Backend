const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const auth = require("../middlewares/authMiddleware");

// Base path matched in indexRouter: /properties
router.post("/", auth, propertyController.addProperty);
router.get("/", auth, propertyController.getAllPorperties);
router.get("/owner", auth, propertyController.getAllPropertyByOwner);
router.put("/:id", auth, propertyController.updateProperty);
router.delete("/:id", auth, propertyController.deleteProperty);

module.exports = router;
