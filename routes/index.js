// ./routes/index.js
const customer = require("./customer");
const film = require("./film");
// const photos = require("./photos");
module.exports = app => {
  app.use("/customer", customer);
  app.use("/film", film);
  // app.use("/photos", photos);
  // etc..
};
