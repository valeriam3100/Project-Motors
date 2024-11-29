const pool = require("../database/")


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

async function updateAccount(account_firstname, account_lastname, account_email, account_id){
  try {
    const sql = "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return data.rows[0]
  } catch (error) {
    return error.message
  }
}

async function updatePassword(account_password, account_id){
  try {
    const sql = "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    const data = await pool.query(sql, [account_password, account_id])
    return data.rows[0]
  } catch (error) {
    return error.message
  }
}

async function checkNewEmail(account_email, account_id){
  try {
    console.log(account_email, account_id)
    const sql = "SELECT * FROM account WHERE account_email = $1 AND account_id = $2"
    const email = await pool.query(sql, [account_email, account_id])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

async function checkExistingEmail(account_email){
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

async function checkExistingPassword(account_password, account_email){
    try {
        const sql = "SELECT * FROM account WHERE account_password = $1 AND account_email = $2"
        const password = await pool.query(sql, [account_password], [account_email])
        return password.rowCount
    } catch (error) {
        return error.message
    }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
*   Get account data based on the id
* *************************** */
async function getAccountById(account_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.account WHERE account_id = $1",
      [account_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getAccountById" + error)
  }
}

/* *****************************
*  Get the number of unread messages
* *************************** */
async function getNumUnread(account_id) {
  try {
    const sql = "SELECT * FROM public.messages WHERE message_to = $1 AND message_read = false"
    const data = await pool.query(sql, [account_id])
    return data.rowCount
  } catch (error) {
    new Error("Number of unread messages error")
  }
}

  module.exports = { registerAccount, checkNewEmail, checkExistingEmail, checkExistingPassword, getAccountByEmail, getAccountById, updateAccount, updatePassword, getNumUnread }