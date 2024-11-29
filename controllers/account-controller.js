const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Utilidad para obtener la barra de navegación
async function getNav() {
  return await utilities.getNav();
}

// Función para manejar los errores
function handleError(res, view, title, nav, errors = null) {
  res.render(view, { title, nav, errors });
}

/* ****************************************
*  Deliver login view
**************************************** */
async function buildLogin(req, res) {
  const nav = await getNav();
  res.render("./account/login", { title: "Login", nav, errors: null });
}

/* ****************************************
*  Deliver registration view
**************************************** */
async function buildRegister(req, res) {
  const nav = await getNav();
  res.render("./account/register", { title: "Registration", nav, errors: null });
}

/* ****************************************
*  Deliver account view
**************************************** */
async function buildAccount(req, res) {
  const data = res.locals.accountData;
  const nav = await getNav();
  const unread = await accountModel.getNumUnread(data.account_id);
  res.render("./account/account", { title: "Account Management", nav, unread, errors: null });
}

/* ****************************************
*  Deliver edit-account view
**************************************** */
async function buildEditAccount(req, res) {
  const data = res.locals.accountData;
  const nav = await getNav();
  res.render("./account/edit-account", {
    title: "Edit Account",
    nav,
    account_firstname: data.account_firstname,
    account_lastname: data.account_lastname,
    account_email: data.account_email,
    account_id: data.account_id,
    errors: null,
  });
}

/* ****************************************
*  Process Registration
**************************************** */
async function registerAccount(req, res) {
  const nav = await getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword);
    
    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("./account/login", { title: "Login", nav, errors: null });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return handleError(res, "account/register", "Registration", nav);
    }
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    return handleError(res, "account/register", "Registration", nav);
  }
}

/* ****************************************
*  Process login request
**************************************** */
async function accountLogin(req, res) {
  const nav = await getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData || !(await bcrypt.compare(account_password, accountData.account_password))) {
    req.flash("notice", "Please check your credentials and try again.");
    return handleError(res, "account/login", "Login", nav, { account_email });
  }

  const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
  res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
  res.redirect("/account/");
}

/* ****************************************
*  Update Account Information
**************************************** */
async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id);

  // Rebuilds the cookie data
  const accountData = await accountModel.getAccountByEmail(account_email);
  const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
  res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });

  const nav = await getNav();
  if (updateResult) {
    req.flash("notice", "Successfully updated your information.");
    res.redirect("/account/");
  } else {
    req.flash("notice", "Sorry, the update failed.");
    handleError(res, "account/edit-account", "Edit Account", nav, { account_firstname, account_lastname, account_email, account_id });
  }
}

/* ****************************************
*  Update Account Password
**************************************** */
async function updatePassword(req, res) {
  const { account_password, account_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(hashedPassword, account_id);

    if (updateResult) {
      req.flash("notice", "Congratulations, password successfully updated.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the update failed.");
      const accountData = await accountModel.getAccountById(account_id);
      const nav = await getNav();
      handleError(res, "account/edit-account", "Edit Account", nav, {
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id,
      });
    }
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the update.');
    const accountData = await accountModel.getAccountById(account_id);
    const nav = await getNav();
    handleError(res, "account/edit-account", "Edit Account", nav, {
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id,
    });
  }
}

/* ****************************************
* Logs the user out of their account
**************************************** */
async function logoutOfAccount(req, res) {
  res.clearCookie("jwt");
  res.redirect("/");
}

module.exports = {
  logoutOfAccount,
  buildLogin,
  buildRegister,
  buildAccount,
  registerAccount,
  accountLogin,
  buildEditAccount,
  updateAccount,
  updatePassword,
};
