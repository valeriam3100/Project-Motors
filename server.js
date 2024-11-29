/* ******************************************
 * Primary server file for controlling the application.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const env = require("dotenv").config();
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const connectFlash = require("connect-flash");
const { checkJWTToken, handleErrors, getNav } = require("./utilities/");
const pool = require('./database/');
const baseController = require("./controllers/base-controller");
const app = express();

/* ***********************
 * Middleware Configuration
 *************************/
const sessionConfig = {
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
};

const bodyParserConfig = bodyParser.urlencoded({ extended: true });

/* ***********************
 * Use Middleware
 *************************/
app.use(session(sessionConfig));
app.use(bodyParser.json());
app.use(bodyParserConfig);
app.use(cookieParser());
app.use(checkJWTToken);

// Express Messages Middleware
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

/* ***********************
 * View Engine & Layouts
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes Configuration
 *************************/
app.use(require("./routes/static")); // Static routes
app.get("/", handleErrors(baseController.buildHome)); // Home route
app.use("/inv", require("./routes/inventory-route")); // Inventory routes
app.use("/account", require("./routes/account-route")); // Account routes
app.use("/message", require("./routes/message-route")); // Message routes
app.use("/error", require("./routes/error-route")); // Error route

// File Not Found Route - should be last route
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

/* ***********************
 * Error Handling Middleware
 *************************/
app.use(async (err, req, res, next) => {
  const nav = await getNav();
  const message = err.status === 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav,
  });
});

/* ***********************
 * Server Start Configuration
 *************************/
const { PORT, HOST } = process.env;

app.listen(PORT, () => {
  console.log(`App listening on ${HOST}:${PORT}`);
});
