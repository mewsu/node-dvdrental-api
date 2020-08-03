// ./routes/index.js
const customer = require("./customer");
const film = require("./film");
const login = require("./login");
// const photos = require("./photos");
module.exports = app => {
  app.use("/customer", customer);
  app.use("/film", film);
  app.use("/login", login);
  // app.use("/photos", photos);
  // etc..
};
