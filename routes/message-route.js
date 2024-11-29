// Necessary Resources 
const express = require("express")
const router = new express.Router() 
const messageController = require("../controllers/message-controller")
const messageValidate = require('../utilities/message-validation')
const utilities = require("../utilities/")

// Inbox route
router.get(
    "/",
    utilities.checkLogin,
    utilities.handleErrors(messageController.buildInbox))

// Messages Archive route
router.get(
    "/archive",
    utilities.checkLogin,
    utilities.handleErrors(messageController.buildArchive))

// Create message route
router.get(
    "/createMessage",
    utilities.checkLogin,
    utilities.handleErrors(messageController.buildCreateMessage))

// Process send message request
router.post(
    "/createMessage",
    utilities.checkLogin,
    messageValidate.messageRules(),
    messageValidate.checkMessageData,
    utilities.handleErrors(messageController.createMessage))

// Message archive route
router.get(
    "/archive",
    utilities.checkLogin,
    utilities.handleErrors(messageController))

// Route to build message by message id
router.get(
    "/detail/:messageId",
    utilities.checkLogin,
    utilities.handleErrors(messageController.buildByMessageId));

// Route to reply to a message
router.post(
    "/reply",
    utilities.handleErrors(messageController.buildReplyToMessage)
    )

// Process reply message
router.post(
    "/replyMessage",
    messageValidate.messageRules(),
    messageValidate.checkMessageData,
    utilities.handleErrors(messageController.createMessage)
)

// Route to mark a message as read
router.post(
    "/read",
    utilities.handleErrors(messageController.markAsRead)
    )

// Route to mark a message as unread
router.post(
    "/unread",
    utilities.handleErrors(messageController.markAsUnread)
    )

// Route to archive a message
router.post(
    "/archive",
    utilities.handleErrors(messageController.archiveMessage)
    )

// Route to delete a message
router.post(
    "/delete",
    utilities.handleErrors(messageController.deleteMessage)
    )

module.exports = router