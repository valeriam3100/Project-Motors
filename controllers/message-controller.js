const utilities = require("../utilities/");
const messageModel = require("../models/message-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Utility function to handle repeated tasks
async function renderMessageView(view, req, res, title, additionalData = {}) {
  const data = res.locals.accountData;
  const nav = await utilities.getNav();
  const messageData = await messageModel.getMessagesByAccountId(data.account_id);
  const table = await utilities.buildMessageTable(messageData);
  res.render(view, {
    title: title,
    nav,
    table,
    errors: null,
    ...additionalData,
  });
}

// Build Inbox View
async function buildInbox(req, res, next) {
  const data = res.locals.accountData;
  const unread = await messageModel.getNumArchived(data.account_id);
  renderMessageView('./message/inbox', req, res, `${data.account_firstname}  ${data.account_lastname} Inbox`, { unread });
}

// Build Archive View
async function buildArchive(req, res, next) {
  const data = res.locals.accountData;
  renderMessageView('./message/archive', req, res, `${data.account_firstname}  ${data.account_lastname} Archive`);
}

// Build Create Message View
async function buildCreateMessage(req, res, next) {
  const data = res.locals.accountData;
  const options = await utilities.buildMessageOptions("#");
  res.render("./message/create-message", {
    title: "New Message",
    nav: await utilities.getNav(),
    options,
    account_id: data.account_id,
    errors: null,
  });
}

// Process send message
async function createMessage(req, res) {
  const { message_to, message_subject, message_body, account_id } = req.body;
  const messageResult = await messageModel.createMessage(message_to, message_subject, message_body, account_id);

  if (messageResult) {
    req.flash("notice", "Message sent.");
    res.redirect("/message/");
  } else {
    const options = await utilities.buildMessageOptions(message_to);
    req.flash("notice", "Sorry, the message was not successfully sent.");
    res.status(501).render("./message/create-message", {
      title: "New Message",
      nav: await utilities.getNav(),
      options,
      errors: null,
    });
  }
}

// Build message by message ID
async function buildByMessageId(req, res, next) {
  const message_id = req.params.messageId;
  const data = await messageModel.getMessageById(message_id);
  const message = await utilities.buildMessage(data);
  res.render("./message/message", {
    title: data[0].message_subject,
    nav: await utilities.getNav(),
    message,
    message_id: data[0].message_id,
    message_read: data[0].message_read,
    errors: null,
  });
}

// Handle Message Actions (Delete, Archive, Mark as Read/Unread)
async function handleMessageAction(req, res, actionType) {
  const { message_id } = req.body;
  const result = await messageModel[actionType](message_id);
  const data = await messageModel.getMessageById(message_id);
  const message = await utilities.buildMessage(data);
  const name = data[0].message_subject;

  if (result) {
    req.flash("notice", `${actionType} successful.`);
    res.redirect("/message/");
  } else {
    req.flash("notice", `Sorry, the ${actionType} failed.`);
    res.status(501).render("./message/message", {
      title: name,
      nav: await utilities.getNav(),
      message,
      message_id,
      message_read: data[0].message_read,
      errors: null,
    });
  }
}

// Delete Message
async function deleteMessage(req, res) {
  handleMessageAction(req, res, 'deleteMessage');
}

// Archive Message
async function archiveMessage(req, res) {
  handleMessageAction(req, res, 'archiveMessage');
}

// Mark Message as Read
async function markAsRead(req, res) {
  handleMessageAction(req, res, 'markAsRead');
}

// Mark Message as Unread
async function markAsUnread(req, res) {
  handleMessageAction(req, res, 'markAsUnread');
}

// Build reply to message view
async function buildReplyToMessage(req, res, next) {
  const { message_id } = req.body;
  const messageData = await messageModel.getMessageById(message_id);
  const options = await utilities.getRecipient(messageData[0].message_from);
  res.render("./message/reply-to-message", {
    title: "Reply Message",
    nav: await utilities.getNav(),
    options,
    message_subject: messageData[0].message_subject,
    message_body: `//////// ${messageData[0].message_body} ////////`,
    account_id: res.locals.accountData.account_id,
    errors: null,
  });
}

// Process reply to message
async function replyToMessage(req, res) {
  const { message_to, message_subject, message_body, account_id } = req.body;
  const messageResult = await messageModel.createMessage(message_to, message_subject, message_body, account_id);

  if (messageResult) {
    req.flash("notice", "Reply sent.");
    res.redirect("/message/");
  } else {
    const options = await utilities.buildMessageOptions(message_to);
    req.flash("notice", "Sorry, the reply was not successfully sent.");
    res.status(501).render("./message/reply-to-message", {
      title: "Reply Message",
      nav: await utilities.getNav(),
      options,
      message_subject,
      message_body,
      account_id,
      errors: null,
    });
  }
}

module.exports = {
  buildInbox,
  buildArchive,
  buildCreateMessage,
  createMessage,
  buildByMessageId,
  deleteMessage,
  archiveMessage,
  markAsRead,
  markAsUnread,
  buildReplyToMessage,
  replyToMessage
};

