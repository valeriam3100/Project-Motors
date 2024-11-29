const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

// Helper function to get navigation and render views
const renderView = async (res, view, title, data) => {
  const nav = await utilities.getNav();
  res.render(view, { title, nav, ...data });
};

/* ***************************
 *  Build vehicles by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getVehiclesByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  const className = data[0].classification_name;

  renderView(res, "./inventory/classification", `${className} vehicles`, { grid });
};

/* ***************************
 *  Build vehicles by inventory view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId;
  const data = await invModel.getVehiclesByInventoryId(inv_id);
  const grid = await utilities.buildInventoryGrid(data);
  const className = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`;

  renderView(res, "./inventory/inventory", className, { grid });
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  const classificationSelect = await utilities.buildInventoryOptions();
  renderView(res, "./inventory/management", "Vehicle Management", { classificationSelect, errors: null });
};

/* ***************************
 *  Build add-classification view
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  renderView(res, "./inventory/add-classification", "Add Classification", { errors: null });
};

/* ****************************************
*  Process Add Classification
* *************************************** */
invCont.addClassificationName = async function (req, res) {
  const { classification_name } = req.body;
  const invResult = await invModel.addClassName(classification_name);
  const nav = await utilities.getNav();

  if (invResult) {
    req.flash("notice", `Successfully added ${classification_name}.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the class creation failed.");
    renderView(res, "./inventory/add-classification", "Add Classification", { errors: null });
  }
};

/* ***************************
 *  Build add-inventory view
 * ************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
  const options = await utilities.buildInventoryOptions("#");
  renderView(res, "./inventory/add-inventory", "Add Vehicle", { options, errors: null });
};

/* ****************************************
*  Process Add Inventory Vehicle
* *************************************** */
invCont.addInventoryVehicle = async function (req, res) {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body;
  const invResult = await invModel.addInvVehicle(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color);

  const nav = await utilities.getNav();
  if (invResult) {
    req.flash("notice", `Successfully added ${inv_make} ${inv_model}.`);
    res.redirect("/inv/");
  } else {
    const options = await utilities.buildInventoryOptions(classification_id);
    req.flash("notice", "Sorry, the vehicle creation failed.");
    renderView(res, "./inventory/add-inventory", "Add Vehicle", { options, errors: null });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getVehiclesByClassificationId(classification_id);
  
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit-inventory view
 * ************************** */
invCont.buildEditInventoryView = async (req, res, next) => {
  const inventory_id = parseInt(req.params.inv_id);
  const data = await invModel.getVehiclesByInventoryId(inventory_id);
  const options = await utilities.buildInventoryOptions(data[0].classification_id);
  const name = `${data[0].inv_make} ${data[0].inv_model}`;

  renderView(res, "./inventory/edit-inventory", `Edit ${name}`, { 
    options, 
    errors: null,
    inv_id: data[0].inv_id,
    inv_make: data[0].inv_make,
    inv_model: data[0].inv_model,
    inv_year: data[0].inv_year,
    inv_description: data[0].inv_description,
    inv_image: data[0].inv_image,
    inv_thumbnail: data[0].inv_thumbnail,
    inv_price: data[0].inv_price,
    inv_miles: data[0].inv_miles,
    inv_color: data[0].inv_color,
    classification_id: data[0].classification_id,
  });
};

/* ****************************************
*  Update Inventory Data
* *************************************** */
invCont.editInventoryVehicle = async function (req, res) {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id } = req.body;
  const updateResult = await invModel.updateInventory(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id);

  const nav = await utilities.getNav();
  const name = `${inv_make} ${inv_model}`;
  
  if (updateResult) {
    req.flash("notice", `Successfully updated ${inv_make} ${inv_model}.`);
    res.redirect("/inv/");
  } else {
    const options = await utilities.buildInventoryOptions(classification_id);
    req.flash("notice", "Sorry, the update failed.");
    renderView(res, "./inventory/edit-inventory", `Edit ${name}`, { options, errors: null, inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id });
  }
};

/* ***************************
 *  Build delete-inventory view
 * ************************** */
invCont.buildDeleteInventoryView = async (req, res, next) => {
  const inventory_id = parseInt(req.params.inv_id);
  const data = await invModel.getVehiclesByInventoryId(inventory_id);
  const name = `${data[0].inv_make} ${data[0].inv_model}`;

  renderView(res, "./inventory/delete-confirm", `Delete ${name}`, {
    errors: null,
    inv_id: data[0].inv_id,
    inv_make: data[0].inv_make,
    inv_model: data[0].inv_model,
    inv_year: data[0].inv_year,
    inv_price: data[0].inv_price,
  });
};

/* ****************************************
*  Delete Inventory Data
* *************************************** */
invCont.deleteInventoryVehicle = async function (req, res) {
  const { inv_make, inv_model, inv_year, inv_price, inv_id } = req.body;
  const deleteResult = await invModel.deleteInventory(inv_id);

  const nav = await utilities.getNav();
  const name = `${inv_make} ${inv_model}`;

  if (deleteResult) {
    req.flash("notice", `Successfully deleted ${inv_make} ${inv_model}.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the deletion failed.");
    renderView(res, "./inventory/delete-confirm", `Delete ${name}`, { errors: null, inv_id, inv_make, inv_model, inv_year, inv_price });
  }
};

module.exports = invCont;
