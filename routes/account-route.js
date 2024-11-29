// Necessary Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/account-controller");
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation');

// Centralized validation rules for easy reuse
const validationRules = {
  register: {
    validation: regValidate.registationRules(),
    check: regValidate.checkRegData
  },
  login: {
    validation: regValidate.loginRules(),
    check: regValidate.checkLogData
  },
  editAccount: {
    validation: regValidate.editAccountRules(),
    check: regValidate.checkEditData
  },
  editPassword: {
    validation: regValidate.editPasswordRules(),
    check: regValidate.checkEditData
  }
};

// Middleware for handling errors
const handleErrors = utilities.handleErrors;

// Default route for accounts
router.get("/", handleErrors(accountController.buildAccount));

// Route to build login view
router.get("/login", handleErrors(accountController.buildLogin));

// Route to build register view
router.get("/register", handleErrors(accountController.buildRegister));

// Process the registration attempt
router.post(
  '/register',
  validationRules.register.validation,
  validationRules.register.check,
  handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  validationRules.login.validation,
  validationRules.login.check,
  handleErrors(accountController.accountLogin)
);

// Route to build edit-account view
router.get(
  "/edit-account",
  utilities.checkLogin,
  handleErrors(accountController.buildEditAccount)
);

// Process account update attempt
router.post(
  "/update",
  validationRules.editAccount.validation,
  validationRules.editAccount.check,
  handleErrors(accountController.updateAccount)
);

// Process password update attempt
router.post(
  "/update/password",
  validationRules.editPassword.validation,
  validationRules.editPassword.check,
  handleErrors(accountController.updatePassword)
);

// Route to logout of account
router.get("/logout", handleErrors(accountController.logoutOfAccount));

module.exports = router;
