// Necessary Resources
const express = require("express");
const router = new express.Router();
const messageController = require("../controllers/message-controller");
const messageValidate = require('../utilities/message-validation');
const utilities = require("../utilities/");

// Helper function to handle routes with login check and error handling
const routeWithLoginAndErrorHandling = (method, path, validationRules, controller) => {
  if (validationRules) {
    router[method](
      path,
      utilities.checkLogin,
      validationRules.validation,
      validationRules.check,
      utilities.handleErrors(controller)
    );
  } else {
    router[method](
      path,
      utilities.checkLogin,
      utilities.handleErrors(controller)
    );
  }
};

// Inbox route
routeWithLoginAndErrorHandling("get", "/", null, messageController.buildInbox);

// Messages Archive route
routeWithLoginAndErrorHandling("get", "/archive", null, messageController.buildArchive);

// Create message route
routeWithLoginAndErrorHandling("get", "/createMessage", null, messageController.buildCreateMessage);

// Process send message request
routeWithLoginAndErrorHandling(
  "post",
  "/createMessage",
  { validation: messageValidate.messageRules(), check: messageValidate.checkMessageData },
  messageController.createMessage
);

// Route to build message by message id
routeWithLoginAndErrorHandling("get", "/detail/:messageId", null, messageController.buildByMessageId);

// Route to reply to a message
routeWithLoginAndErrorHandling("post", "/reply", null, messageController.buildReplyToMessage);

// Process reply message
routeWithLoginAndErrorHandling(
  "post",
  "/replyMessage",
  { validation: messageValidate.messageRules(), check: messageValidate.checkMessageData },
  messageController.createMessage
);

// Route to mark a message as read
routeWithLoginAndErrorHandling("post", "/read", null, messageController.markAsRead);

// Route to mark a message as unread
routeWithLoginAndErrorHandling("post", "/unread", null, messageController.markAsUnread);

// Route to archive a message
routeWithLoginAndErrorHandling("post", "/archive", null, messageController.archiveMessage);

// Route to delete a message
routeWithLoginAndErrorHandling("post", "/delete", null, messageController.deleteMessage);

module.exports = router;
