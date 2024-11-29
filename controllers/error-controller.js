const utilities = require("../utilities/");

const errorCont = {};

/* ***************************
 *  Build vehicles by classification view
 * ************************** */
errorCont.buildError = async function (req, res, next) {
  const grid = await utilities.buildError();
  //let nav = await utilities.getNav();
  const className = "Error Page";
  res.render("./inventory/error", {
    title: className,
    nav,
    grid,
  });
};

module.exports = errorCont;
