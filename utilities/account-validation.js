const utilities = require("../utilities/");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");

const validate = {};

// Common validation for name fields
const nameValidation = (field, minLength = 1) => {
  return body(field)
    .trim()
    .isLength({ min: minLength })
    .withMessage(`Please provide a ${field.replace('account_', '')}.`);
};

// Common email validation (also checks if email exists)
const emailValidation = (allowExistingEmail = false) => {
  return body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required.")
    .custom(async (email) => {
      if (!allowExistingEmail) {
        const emailExists = await accountModel.checkExistingEmail(email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }
    });
};

// Common password validation
const passwordValidation = () => {
  return body("account_password")
    .trim()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password does not meet requirements.");
};

/* **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    nameValidation("account_firstname"),
    nameValidation("account_lastname", 2),
    emailValidation(false),
    passwordValidation(),
  ];
};

/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    emailValidation(true),
  ];
};

/* **********************************
 *  Edit Account Data Validation Rules
 * ********************************* */
validate.editAccountRules = () => {
  return [
    body("account_id")
      .trim()
      .isInt()
      .withMessage("Account id is not an integer."),
    nameValidation("account_firstname"),
    nameValidation("account_lastname", 2),
    emailValidation(utilities.checkEmailChange()),
  ];
};

/* **********************************
 *  Edit Password Data Validation Rules
 * ********************************* */
validate.editPasswordRules = () => {
  return [
    passwordValidation(),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
validate.checkLogData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

/* ******************************
 * Check edit account data and return errors or continue to edit
 * ***************************** */
validate.checkEditData = async (req, res, next) => {
  const { account_id } = req.body;
  const accountData = await accountModel.getAccountById(account_id);
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/edit-account", {
      errors,
      title: "Edit Account",
      nav,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id,
    });
    return;
  }
  next();
};

module.exports = validate;
