const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const validate = {}

/*  **********************************
 *  Add Classification Validation Rules
 * ********************************* */
validate.addClassificationRules = () => {
    return [
      // class name is required and must be a string
      body("classification_name")
        .trim()
        .isAlpha()
        .isLength({  min: 1, })
        .withMessage("Please provide a class name."),
    ]
  }

/*  **********************************
 *  Add Classification Validation Rules
 * ********************************* */
validate.addInventoryRules = () => {
    return [
        body("classification_id")
            .trim()
            .isInt()
            .withMessage("Please select a class."),
        body("inv_make")
            .trim()
            .isLength({
                min: 3,
                max: 100,
            })
            .withMessage("Please provide the make."),
        body("inv_model")
            .trim()
            .isLength({
                min: 3,
                max: 100,
            })
            .withMessage("Please provide the model."),
        body("inv_description")
            .trim()
            .isLength({
                min: 1,
                max: 100,
            })
            .withMessage("Please provide a description."),
        body("inv_image")
            .trim()
            .isLength({
                min: 1,
                max: 100,
            })
            .withMessage("Please provide a valid image path."),
        body("inv_thumbnail")
            .trim()
            .isLength({
                min: 1,
                max: 100,
            })
            .withMessage("Please provide a valid thumbnail."),
        body("inv_price")
            .trim()
            .isFloat({
                min: 0.01,
                max: 10000000,
            })
            .withMessage("Please provide the price."),
        body("inv_year")
            .trim()
            .isInt({
                min: 1000,
                max: 5000
            })
            .withMessage("Please provide vehicle year."),
        body("inv_miles")
            .trim()
            .isNumeric({
                min: 0,
                max: 10000000
            })
            .withMessage("Please provide total miles."),
        body("inv_color")
            .trim()
            .isLength({
                min: 1,
                max: 100,})
            .withMessage("Please provide the color."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("./inventory/add-classification", {
        errors,
        title: "Add Classification",
        nav,
        classification_name,
      })
      return
    }
    next()
  }

/* ******************************
 * Check data and return errors or continue to add inventory
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
    let errors = validationResult(req)
    let errorsArray = []
    
    let options = await utilities.buildInventoryOptions(classification_id)
    if (!errors.isEmpty()) {
        errorsArray = errors.array();
    }

    if (errorsArray.length === 0) {
        next();
    } else {
        let nav = await utilities.getNav()
        res.render("./inventory/add-inventory", {
            errors,
            title: "Add Vehicle",
            nav,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id,
            options,
        })
    }
  }

/* ******************************
 * Check data and return errors or continue to edit inventory
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id } = req.body
    let errors = validationResult(req)
    let errorsArray = []
    
    let options = await utilities.buildInventoryOptions(classification_id)
    if (!errors.isEmpty()) {
        errorsArray = errors.array();
    }

    if (errorsArray.length === 0) {
        next();
    } else {
        let nav = await utilities.getNav()
        const name = `${inv_make} ${inv_model}`
        res.render("./inventory/edit-inventory", {
            errors,
            title: "Edit " + name,
            nav,
            options,
            classification_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            inv_id,
        })
    }
  }

  module.exports = validate