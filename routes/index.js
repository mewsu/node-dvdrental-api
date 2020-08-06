const session = require("express-session");

// ./routes/index.js
const customer = require("./customer");
const film = require("./film");
const auth = require("./auth");

// Middlewares
const ensureUserLoggedIn = (req, res, next) => {
  req.user ? next() : res.redirect("/login");
};

module.exports = app => {
  app.use(session({ secret: "cats" }));
  app.use(auth); // auth has passport setup, GET/POST login and GET logout
  app.use("/customer", customer);
  app.use("/film", film);
  app.get("/profile", ensureUserLoggedIn, (req, res) => {
    res.send("logged in, you can view this page");
  });
  // app.use("/photos", photos);
  // etc..
};
