// Necessary Resources 
const express = require("express")
const router = new express.Router() 
const errorController = require("../controllers/error-controller")
const utilities = require("../utilities/")
// Route to build error type 500 view
router.get("/buildError", utilities.handleErrors(errorController.buildError));

module.exports = router;
