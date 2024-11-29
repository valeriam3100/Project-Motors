const pool = require("../database/")

/* ***************************
 *  Get messages by account_id
 * ************************** */
async function getMessagesByAccountId(account_id) {
    try {
      const data = await pool.query(
        "SELECT * FROM public.messages WHERE message_to = $1 ANd NOT message_archived",
        [account_id]
      )
      return data.rows
    } catch (error) {
      console.error("getmessagesbyid error " + error)
    }
  }

/* ***************************
 *  Get archived messages by account_id
 * ************************** */
async function getArchivedMessages(account_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.messages WHERE message_to = $1 AND message_archived",
      [account_id]
    )
    return data.rows
  } catch (error) {
    console.error("getmessagesbyid error " + error)
  }
}

/* ***************************
 *  Get all account data
 * ************************** */
async function getAccounts(){
    return await pool.query("SELECT * FROM public.account ORDER BY account_lastname")
  }

/* *****************************
*   Add message to database
* *************************** */
async function createMessage(message_to, message_subject, message_body, account_id){
    try {
      const sql = "INSERT INTO public.messages (message_to, message_subject, message_body, message_from) VALUES ($1, $2, $3, $4) RETURNING *"
      return await pool.query(sql, [message_to, message_subject, message_body, account_id])
    } catch (error) {
      return error.message
    }
  }

/* *****************************
*   Create message view by id
* *************************** */
async function getMessageById(message_id) {
    try {
      const data = await pool.query(
        "SELECT * FROM public.messages WHERE message_id = $1",
        [message_id]
      )
      return data.rows
    } catch (error) {
      console.error("getmessagebyid" + error)
    }
  }

/* *****************************
*   Delete Message
* *************************** */
async function deleteMessage(message_id){
  try {
    const sql = "DELETE FROM public.messages WHERE message_id = $1"
    const data = await pool.query(sql, [message_id])
    return data
  } catch (error) {
    new Error("Delete Message Error")
  }
}

/* *****************************
*   Archive Message
* *************************** */
async function archiveMessage(message_id){
  try {
    const sql = "UPDATE public.messages SET message_archived = true WHERE message_id = $1"
    const data = await pool.query(sql, [message_id])
    return data
  } catch (error) {
    new Error("Archive Message Error")
  }
}

/* *****************************
*   Mark Message as Read
* *************************** */
async function markAsRead(message_id){
  try {
    const sql = "UPDATE public.messages SET message_read = true WHERE message_id = $1"
    const data = await pool.query(sql, [message_id])
    return data
  } catch (error) {
    new Error("Mark as read Error")
  }
}

/* *****************************
*   Mark Message as Unread
* *************************** */
async function markAsUnread(message_id){
  try {
    const sql = "UPDATE public.messages SET message_read = false WHERE message_id = $1"
    const data = await pool.query(sql, [message_id])
    return data
  } catch (error) {
    new Error("Mark as unread Error")
  }
}

/* *****************************
* Get number of archived messages
* *************************** */
async function getNumArchived(account_id){
  try {
    const sql = "SELECT * FROM public.messages WHERE message_to = $1 AND message_archived = true"
    const data = await pool.query(sql, [account_id])
    return data.rowCount
  } catch (error) {
    new Error("Number of archived messages Error")
  }
}

module.exports = { getMessagesByAccountId, getArchivedMessages, getAccounts, createMessage, getMessageById, deleteMessage, archiveMessage, markAsRead, markAsUnread, getNumArchived }