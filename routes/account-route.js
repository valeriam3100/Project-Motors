// Necessary Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/account-controller")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')
const baseController = require("../controllers/base-controller")

// Default route for accounts
router.get(
  "/",
  utilities.handleErrors(accountController.buildAccount))
// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
// Route to build register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Process the registration attempt
router.post(
    '/register',
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))
// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLogData,
    utilities.handleErrors(accountController.accountLogin)
  )
// Route to build edit-account view
router.get(
    "/edit-account",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildEditAccount)
  )
// Process update attempt
router.post(
  "/update",
  regValidate.editAccountRules(),
  regValidate.checkEditData,
  utilities.handleErrors(accountController.updateAccount)
)
// Process update password attempt
router.post(
  "/update/password",
  regValidate.editPasswordRules(),
  regValidate.checkEditData,
  utilities.handleErrors(accountController.updatePassword)
)
// Route to logout of account
router.get("/logout", utilities.handleErrors(accountController.logoutOfAccount))

module.exports = router;