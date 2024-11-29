const pool = require("../database/");

/* *****************************
 * Helper function to handle database queries and errors
 * *************************** */
async function queryDatabase(query, params) {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Database error: ", error.message);
    return { error: error.message };
  }
}

/* *****************************
 * Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
  const data = await queryDatabase(sql, [account_firstname, account_lastname, account_email, account_password]);
  return data.length ? data[0] : null;
}

/* *****************************
 * Update account details
 * *************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  const sql = "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
  const data = await queryDatabase(sql, [account_firstname, account_lastname, account_email, account_id]);
  return data.length ? data[0] : null;
}

/* *****************************
 * Update account password
 * *************************** */
async function updatePassword(account_password, account_id) {
  const sql = "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *";
  const data = await queryDatabase(sql, [account_password, account_id]);
  return data.length ? data[0] : null;
}

/* *****************************
 * Check if new email exists for the current account
 * *************************** */
async function checkNewEmail(account_email, account_id) {
  const sql = "SELECT * FROM account WHERE account_email = $1 AND account_id != $2";
  const data = await queryDatabase(sql, [account_email, account_id]);
  return data.length > 0;
}

/* *****************************
 * Check if email already exists
 * *************************** */
async function checkExistingEmail(account_email) {
  const sql = "SELECT * FROM account WHERE account_email = $1";
  const data = await queryDatabase(sql, [account_email]);
  return data.length > 0;
}

/* *****************************
 * Check if existing password matches the account email
 * *************************** */
async function checkExistingPassword(account_password, account_email) {
  const sql = "SELECT * FROM account WHERE account_password = $1 AND account_email = $2";
  const data = await queryDatabase(sql, [account_password, account_email]);
  return data.length > 0;
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  const sql = 'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1';
  const data = await queryDatabase(sql, [account_email]);
  return data.length ? data[0] : null;
}

/* *****************************
 * Get account data by account ID
 * ***************************** */
async function getAccountById(account_id) {
  const sql = "SELECT * FROM public.account WHERE account_id = $1";
  const data = await queryDatabase(sql, [account_id]);
  return data.length ? data[0] : null;
}

/* *****************************
 * Get the number of unread messages
 * ***************************** */
async function getNumUnread(account_id) {
  const sql = "SELECT * FROM public.messages WHERE message_to = $1 AND message_read = false";
  const data = await queryDatabase(sql, [account_id]);
  return data.length;
}

module.exports = {
  registerAccount,
  checkNewEmail,
  checkExistingEmail,
  checkExistingPassword,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
  getNumUnread,
};
