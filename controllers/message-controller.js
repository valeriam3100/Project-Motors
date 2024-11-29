const utilities = require("../utilities/");
const messageModel = require("../models/message-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Build Inbox View
 * *************************************** */
async function buildInbox(req, res, next) {
  const data = res.locals.accountData;
  let nav = await utilities.getNav();
  let messageData = await messageModel.getMessagesByAccountId(data.account_id);
  let unread = await messageModel.getNumArchived(data.account_id)
  let table = await utilities.buildMessageTable(messageData);
  res.render("./message/inbox", {
    title: `${data.account_firstname}  ${data.account_lastname} Inbox`,
    nav,
    unread,
    table,
    errors: null,
  });
}

/* ****************************************
 *  Build Archive View
 * *************************************** */
async function buildArchive(req, res, next) {
  const data = res.locals.accountData;
  let nav = await utilities.getNav();
  let messageData = await messageModel.getArchivedMessages(data.account_id);
  let table = await utilities.buildMessageTable(messageData);
  res.render("./message/archive", {
    title: `${data.account_firstname}  ${data.account_lastname} Archive`,
    nav,
    table,
    errors: null,
  });
}

async function buildCreateMessage(req, res, next) {
  const data = res.locals.accountData
  let nav = await utilities.getNav();
  let options = await utilities.buildMessageOptions("#");
  res.render("./message/create-message", {
    title: "New Message",
    nav,
    options,
    account_id: data.account_id,
    errors: null,
  });
}

/* ****************************************
*  Process send message
* *************************************** */
async function createMessage(req, res) {
    const { message_to, message_subject, message_body, account_id } = req.body
    const messageResult = await messageModel.createMessage(message_to, message_subject, message_body, account_id)
    // Rebuilds the nav bar
    let nav = await utilities.getNav()
    if (messageResult) {
      req.flash(
        "notice",
        `Message sent.`
      )
      res.redirect("/message/")
    } else {
      const options = await utilities.buildMessageOptions(message_to)
      req.flash("notice", "Sorry, the message was not successfully sent.")
      res.status(501).render("./message/create-message", {
        title: "New Message",
        nav,
        options,
        errors: null,
      })
    }
  }

/* ***************************
 *  Build messages by message id
 * ************************** */
async function buildByMessageId(req, res, next) {
  const message_id = req.params.messageId
  const data = await messageModel.getMessageById(message_id);
  const message = await utilities.buildMessage(data);
  let nav = await utilities.getNav()
  const messageName = data[0].message_subject
  res.render("./message/message", {
    title: messageName,
    nav,
    message,
    message_id: data[0].message_id,
    message_read: data[0].message_read,
    errors: null,
  })
}

/* ****************************************
*  Delete Message Data
* *************************************** */
async function deleteMessage(req, res) {
  const { message_id } = req.body
  const deleteResult = await messageModel.deleteMessage(message_id)

  // Rebuilds the nav bar
  let nav = await utilities.getNav()
  if (deleteResult) {
    req.flash(
      "notice",
      `Message successfully deleted.`
    )
    res.redirect("/message/")
  } else {
    const data = await messageModel.getMessageById(message_id);
    const message = await utilities.buildMessage(data);
    const name = `${data[0].message_subject}`
    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).render("./message/message", {
      title: name,
      nav,
      message,
      message_id: message_id,
      message_read: data[0].message_read,
      errors: null,
    })
  }
}

/* ****************************************
*  Archive Message
* *************************************** */
async function archiveMessage(req, res) {
  const { message_id } = req.body
  const archiveResult = await messageModel.archiveMessage(message_id)

  // Rebuilds the nav bar
  let nav = await utilities.getNav()
  if (archiveResult) {
    req.flash(
      "notice",
      `Message successfully archived.`
    )
    res.redirect("/message/")
  } else {
    const data = await messageModel.getMessageById(message_id);
    const message = await utilities.buildMessage(data);
    const name = `${data[0].message_subject}`
    req.flash("notice", "Sorry, message could not be archived.")
    res.status(501).render("./message/message", {
      title: name,
      nav,
      message,
      message_id: message_id,
      message_read: data[0].message_read,
      errors: null,
    })
  }
}

/* ****************************************
*  Mark Message as Read
* *************************************** */
async function markAsRead(req, res) {
  const { message_id } = req.body
  const result = await messageModel.markAsRead(message_id)

  // Rebuilds the nav bar
  let nav = await utilities.getNav()
  const data = await messageModel.getMessageById(message_id);
  const message = await utilities.buildMessage(data);
  const name = `${data[0].message_subject}`
  if (result) {
    res.status(501).render("./message/message", {
      title: name,
      nav,
      message,
      message_id: message_id,
      message_read: data[0].message_read,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, message could not be archived.")
    res.status(501).render("./message/message", {
      title: name,
      nav,
      message,
      message_id: message_id,
      message_read: data[0].message_read,
      errors: null,
    })
  }
}

/* ****************************************
*  Mark Message as Unread
* *************************************** */
async function markAsUnread(req, res) {
  const { message_id } = req.body
  const result = await messageModel.markAsUnread(message_id)

  // Rebuilds the nav bar
  let nav = await utilities.getNav()
  const data = await messageModel.getMessageById(message_id);
  const message = await utilities.buildMessage(data);
  const name = `${data[0].message_subject}`
  if (result) {
    res.status(501).render("./message/message", {
      title: name,
      nav,
      message,
      message_id: message_id,
      message_read: data[0].message_read,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, message could not be archived.")
    res.status(501).render("./message/message", {
      title: name,
      nav,
      message,
      message_id: message_id,
      message_read: data[0].message_read,
      errors: null,
    })
  }
}

/* ****************************************
*  Build reply to message view
* *************************************** */
async function buildReplyToMessage(req, res, next) {
  const data = res.locals.accountData
  const { message_id } = req.body
  let messageData = await messageModel.getMessageById(message_id)
  let nav = await utilities.getNav();
  let options = await utilities.getRecipient(messageData[0].message_from);
  res.render("./message/reply-to-message", {
    title: "Reply Message",
    nav,
    options,
    message_subject: messageData[0].message_subject,
    message_body: "//////// " + messageData[0].message_body + " ////////",
    account_id: data.account_id,
    errors: null,
  });
}

/* ****************************************
*  Process reply to message
* *************************************** */
async function replyToMessage(req, res) {
  const { message_to, message_subject, message_body, account_id } = req.body
  const messageResult = await messageModel.createMessage(message_to, message_subject, message_body, account_id)
  // Rebuilds the nav bar
  let nav = await utilities.getNav()
  if (messageResult) {
    req.flash(
      "notice",
      `Reply sent.`
    )
    res.redirect("/message/")
  } else {
    const options = await utilities.buildMessageOptions(message_to)
    req.flash("notice", "Sorry, the message was not successfully sent.")
    res.status(501).render("./message/reply-to-message", {
      title: "Reply Message",
      nav,
      options,
      message_subject: message_subject,
      message_body: message_body,
      account_id: account_id,
      errors: null,
    })
  }
}

module.exports = { buildInbox, buildArchive, buildCreateMessage, createMessage, buildByMessageId, deleteMessage, archiveMessage, markAsRead, markAsUnread, buildReplyToMessage, replyToMessage };
