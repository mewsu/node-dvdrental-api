const Router = require("express-promise-router");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const cors = require("cors");
const passport = require("../passport/setup");

const router = new Router();

router.use(passport.initialize());
router.use(passport.session());

router.get("/login", (req, res) => {
  res.send("this is the login page");
});

router.post(
  "/login",
  bodyParser.urlencoded({ extended: false }),
  jsonParser, // passport reads the fields email & password
  (req, res, next) => {
    console.log("got login request");
    console.log(req.body);
    next();
  },
  passport.authenticate("local"), // strategy is defined in setup. this sends a 401 if failed
  (req, res) => {
    console.log("login successful");
    console.log(req.user);

    res.status(200).send({
      customer_id: req.user.customer_id,
      store_id: req.user.store_id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      address_id: req.user.address_id,
      role: req.user.role
    });
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.send("you are logged out");
});

module.exports = router;
