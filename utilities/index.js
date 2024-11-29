const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const messageModel = require("../models/message-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the specified classification view HTML
* ************************************ */
Util.buildInventoryGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="details-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_image
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="vehicle">'
      grid += '<p class="bolder">' + vehicle.inv_make + ' ' + vehicle.inv_model + ' ' + 'Details </p>'
      grid += '<div class="vehicle-details">'
      grid += '<p class="vehicle-price">Price: $' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>'
      grid += '<p class="vehicle-description"><span class="bolder">Description:</span> ' + vehicle.inv_description + '</p>'
      grid += '<p class="vehicle-color"><span class="bolder">Color:</span> ' + vehicle.inv_color + '</p>'
      grid += '<p class="vehicle-miles"><span class="bolder">Miles:</span> ' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</p>'
      grid += '</div>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildInventoryOptions = async function(selectedOption){
  let data = await invModel.getClassifications()
  let options = "<select id=\"classificationList\" name=\"classification_id\">"
  options += "<option value=\"#\">Select a Classification</option>"
  data.rows.forEach(classification => { 
    options += `<option value="${classification.classification_id}"
    ${classification.classification_id === Number(selectedOption)? "selected":""}>
    ${classification.classification_name}</option>`
  })
  options += "</select>"
  return options
}

/* **************************************
* Build the list of message recipients
* ************************************ */
Util.buildMessageOptions = async function(selectedOption){
  let data = await messageModel.getAccounts()
  let options = "<select id=\"accountList\" name=\"message_to\">"
  options += "<option value=\"#\">Select a Recipient</option>"
  data.rows.forEach(account => { 
    options += `<option value="${account.account_id}"
    ${account.account_id === Number(selectedOption)? "selected":""}>
    ${account.account_firstname} ${account.account_lastname}</option>`
  })
  options += "</select>"
  return options
}

/* **************************************
* Find the recipient of the reply message
* ************************************ */
Util.getRecipient = async function(selectedOption){
  const data = await accountModel.getAccountById(selectedOption)
  let options = "<select id=\"accountList\" name=\"message_to\">"
  options += `<option value=\"${data.account_id}\">${data.account_firstname} ${data.account_lastname}</option>`
  options += "</select>"
  return options
}

/* **************************************
* Build the messages inbox
* ************************************ */
Util.buildMessageTable = async function(data){
  let table = ""
  if(data.length > 0){
    table += '<table id="inbox-table">';
    table += '<thead>';
    table += '<tr><th>Received</th><td class="bolder">Subject</td><td class="bolder">From</td><td class="bolder">Read</td></tr>';
    table += '</thead>';
    table += '<tbody>';
    //data.forEach( async (message) => { -This code does not work in cunjunction with an await command
    for (const message of data) {
      let from = await accountModel.getAccountById(message.message_from);
      table += `<tr><td>${message.message_created.toLocaleDateString()}</td>`;
      table += '<td><a href="../../message/detail/'+ message.message_id 
      + '" title="View ' + message.message_subject + '">' + message.message_subject + '</a></td>';
      table += `<td>${from.account_firstname} ${from.account_lastname}</td>`;
      table += `<td>${message.message_read}</td></tr>`;
    }
    table += '</tbody>';
    table += '</table>'
  } else { 
    table += '<p class="tableNotice">No messages were found.</p>';
  }
  return table
}

/* **************************************
* Build the message view
* ************************************ */
Util.buildMessage = async function(data){
  let from = await accountModel.getAccountById(data[0].message_from)
  let message = '<div class="message-options">';
  message += `<p><span class="bolder">Subject:</span> ${data[0].message_subject}</p>`;
  message += `<p><span class="bolder">From:</span> ${from.account_firstname} ${from.account_lastname}</p>`;
  message += `<p><span class="bolder">Message:</span> ${data[0].message_body}</p>`;
  message += '</div>';
  return message
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 function checkLogin(req, res, next) {
  console.log('Authenticated:', req.isAuthenticated && req.isAuthenticated());
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).send('Not authenticated');
  }
}

/* **************************************
* Build the specified classification view HTML
* ************************************ */
Util.buildError = async function(data){
  let grid
  grid = '<h1> Hello World <h1>'
  return grid
}

/* **************************************
* Provides user authentification
* *********************************** */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin && res.locals.accountData) {
    const accountType = res.locals.accountData.account_type;
    if (accountType == "Employee" || accountType == "Admin") {
      next()
    } else {
      res.redirect("/")
    }
  } else {
    const error = new Error("Not authenticated")
    error.status = 401
    next(error)
  }
}

Util.checkEmailChange = async (account_email, account_id) => {
  return await accountModel.checkNewEmail(account_email, account_id)
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util