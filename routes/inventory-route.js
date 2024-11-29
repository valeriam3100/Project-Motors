// Necessary Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/inv-controller")
const utilities = require("../utilities/")
const invValidate = require('../utilities/inv-validation')
// Route to build inventory by classification view
router.get(
    "/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId));
// Route to build inventory by inventory id
router.get(
    "/detail/:inventoryId",
    utilities.handleErrors(invController.buildByInventoryId));

// Route to build management view
router.get(
    "/",
    utilities.handleErrors(invController.buildManagementView));
// Route to build management editting table
router.get(
    "/getInventory/:classification_id",
    utilities.handleErrors(invController.getInventoryJSON))

// Route to build edit-inventory view
router.get(
    "/edit/:inv_id",
    utilities.handleErrors(invController.buildEditInventoryView))
// Process the edit-inventory attempt
router.post(
    "/update",
    invValidate.addInventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.editInventoryVehicle))

// Route to build delete-inventory view
router.get(
    "/delete/:inv_id",
    utilities.handleErrors(invController.buildDeleteInventoryView))
// Process the delete-inventory attempt
router.post(
    "/remove",
    utilities.handleErrors(invController.deleteInventoryVehicle))

// Route to build add-classification view
router.get(
    "/addClassification",
    utilities.handleErrors(invController.buildAddClassificationView));
// Process the add-classification attempt
router.post(
    '/addClassification',
    invValidate.addClassificationRules(),
    invValidate.checkClassData,
    utilities.handleErrors(invController.addClassificationName));

// Route to build add-inventory view
router.get(
    "/addInventory",
    utilities.handleErrors(invController.buildAddInventoryView));
// Process the add-inventory attempt
router.post(
    '/addInventory',
    invValidate.addInventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventoryVehicle))

module.exports = router;