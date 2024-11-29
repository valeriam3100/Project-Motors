const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("./account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }
  

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("./account/register", {
        title: "Registration",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver account view
* *************************************** */
async function buildAccount(req, res, next) {
  const data = res.locals.accountData
  let nav = await utilities.getNav()
  let unread = await accountModel.getNumUnread(data.account_id)
  res.render("./account/account", {
      title: "Account Management",
      nav,
      unread,
      errors: null,
  })
}

/* ****************************************
*  Deliver edit-account view
* *************************************** */
async function buildEditAccount(req, res, next) {
  const data = res.locals.accountData
  let nav = await utilities.getNav()
  res.render("./account/edit-account", {
      title: "Edit Account",
      nav,
      account_firstname: data.account_firstname,
      account_lastname: data.account_lastname,
      account_email: data.account_email,
      account_id: data.account_id,
      errors: null,
  })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
  
    // Hash the password before storing
    let hashedPassword
    try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.')
      res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("./account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("./account/register", {
        title: "Registration",
        nav,
      })
    }
  }

 /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
   res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

/* ****************************************
 *  Update Account Information
 * ************************************ */
async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)

  // Rebuilds the cookie data
  const accountData = await accountModel.getAccountByEmail(account_email)
  const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
  res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })

  // Rebuilds the nav bar
  let nav = await utilities.getNav()
  if (updateResult) {
    req.flash(
      "notice",
      `Successfully updated your information.`
    )
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("./account/edit-account", {
      title: "Edit Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      errors: null,
    })
  }
}

/* ****************************************
 *  Update Account Password
 * ************************************ */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  const accountData = accountModel.getAccountById(account_id)
  
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the update.')
    res.status(501).render("./account/edit-account", {
      title: "Edit Account",
      nav,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id,
      errors: null,
    })
  }

    const updateResult = await accountModel.updatePassword(hashedPassword, account_id)
  
    if (updateResult) {
      req.flash(
        "notice",
        `Congratulations, password successfuly updated.`
      )
      res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, the update failed.")
      res.status(501).render("./account/edit-account", {
        title: "Edit Account",
        nav,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id,
        errors: null,
      })
    }
  }

/* ****************************************
 * Logs the user out of there account and returns them to the home page
 **************************************** */
async function logoutOfAccount(req, res){
  res.clearCookie("jwt")
  res.redirect("/")
}

  module.exports = { logoutOfAccount, buildLogin, buildRegister, buildAccount, registerAccount, accountLogin, buildEditAccount, updateAccount, updatePassword }