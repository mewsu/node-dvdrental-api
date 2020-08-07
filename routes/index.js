const session = require("express-session");

// ./routes/index.js
const customer = require("./customer");
const film = require("./film");
const auth = require("./auth");

// Shared middlewares
const ensureUserLoggedIn = (req, res, next) => {
  // console.log(
  //   "user is logged in as: ",
  //   JSON.stringify(req.session.passport.user)
  // );
  console.log("ensure user logged in");
  if (req.user) {
    console.log(JSON.stringify(req.user));
    console.log(JSON.stringify(req.session.passport.user));
    next();
  } else {
    console.log("user is not logged in");
    res.redirect("/login");
  }
};

const ensureUserIsStaff = (req, res, next) => {
  console.log(JSON.stringify(req.user));
  console.log(JSON.stringify(req.session.passport.user));
  if (req.user.role === "staff") {
    next();
  } else {
    console.log("user is not staff");
    res.redirect("/login");
  }
};

module.exports = app => {
  app.use(session({ secret: "cats" }));
  app.use(auth); // auth has passport setup, GET/POST login and GET logout
  app.use("/customer", ensureUserLoggedIn, ensureUserIsStaff, customer);
  app.use("/film", film);
  app.get("/profile", ensureUserLoggedIn, (req, res) => {
    res.send("logged in, you can view this page");
  });
  // app.use("/photos", photos);
  // etc..
};
