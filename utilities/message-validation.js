const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")
const messageModel = require("../models/message-model")
const validate = {}

/*  **********************************
 *  Add Classification Validation Rules
 * ********************************* */
validate.messageRules = () => {
    return [
        body("message_to")
            .trim()
            .isInt()
            .withMessage("Please select a recipient"),
        body("message_subject")
            .trim()
            .isLength({
                min: 3,
                max: 100,
            })
            .withMessage("Please provide a message subject."),
        body("message_body")
            .trim()
            .isLength({
                min: 3,
                max: 10000,
            })
            .withMessage("Please include a message."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to edit inventory
 * ***************************** */
validate.checkMessageData = async (req, res, next) => {
    const { account_id, message_to, message_subject, message_body } = req.body
    let errors = validationResult(req)
    let errorsArray = []
    
    if (!errors.isEmpty()) {
        errorsArray = errors.array();
        let nav = await utilities.getNav()
        const options = await utilities.buildMessageOptions(message_to)
        res.render("./message/create-message", {
            errors,
            title: "New Message",
            nav,
            options,
            message_subject: message_subject,
            message_body: message_body,
            account_id: account_id,
        })
        return
    }
    next()
  }

  module.exports = validate