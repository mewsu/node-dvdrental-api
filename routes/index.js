// ./routes/index.js
const customer = require("./customer");
// const photos = require("./photos");
module.exports = app => {
  app.use("/customer", customer);
  // app.use("/photos", photos);
  // etc..
};
