const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const validate = {}

/* ***************************************
 * Common validation rule for string fields
 *************************************** */
const stringFieldRule = (field, minLength, maxLength, message) => {
  return body(field)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(message)
}

/* ***************************************
 * Add Classification Validation Rules
 *************************************** */
validate.addClassificationRules = () => [
  body("classification_name")
    .trim()
    .isAlpha()
    .withMessage("Please provide a valid class name.")
    .isLength({ min: 1 })
    .withMessage("Please provide a class name.")
]

/* ***************************************
 * Add Inventory Validation Rules
 *************************************** */
validate.addInventoryRules = () => [
  body("classification_id")
    .trim()
    .isInt()
    .withMessage("Please select a class."),
  
  stringFieldRule("inv_make", 3, 100, "Please provide the make."),
  stringFieldRule("inv_model", 3, 100, "Please provide the model."),
  stringFieldRule("inv_description", 1, 100, "Please provide a description."),
  stringFieldRule("inv_image", 1, 100, "Please provide a valid image path."),
  stringFieldRule("inv_thumbnail", 1, 100, "Please provide a valid thumbnail."),
  
  body("inv_price")
    .trim()
    .isFloat({ min: 0.01, max: 10000000 })
    .withMessage("Please provide the price."),
  
  body("inv_year")
    .trim()
    .isInt({ min: 1000, max: 5000 })
    .withMessage("Please provide vehicle year."),
  
  body("inv_miles")
    .trim()
    .isNumeric({ min: 0, max: 10000000 })
    .withMessage("Please provide total miles."),
  
  stringFieldRule("inv_color", 1, 100, "Please provide the color.")
]

/* ***************************************
 * Check and Render Errors for Classification
 *************************************** */
validate.checkClassData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name: req.body.classification_name
    })
    return
  }
  next()
}

/* ***************************************
 * Check and Render Errors for Inventory Add
 *************************************** */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
  
  const options = await utilities.buildInventoryOptions(classification_id)

  if (errors.isEmpty()) {
    next()
  } else {
    const nav = await utilities.getNav()
    res.render("./inventory/add-inventory", {
      errors,
      title: "Add Vehicle",
      nav,
      inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id, options
    })
  }
}

/* ***************************************
 * Check and Render Errors for Inventory Update
 *************************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id } = req.body
  
  const options = await utilities.buildInventoryOptions(classification_id)

  if (errors.isEmpty()) {
    next()
  } else {
    const nav = await utilities.getNav()
    const name = `${inv_make} ${inv_model}`
    res.render("./inventory/edit-inventory", {
      errors,
      title: `Edit ${name}`,
      nav,
      options,
      classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id
    })
  }
}

module.exports = validate
