const Router = require("express-promise-router");
const bodyParser = require("body-parser");
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
  passport.authenticate("local", { successRedirect: "/" })
);

router.get("/logout", (req, res) => {
  req.logout();
  res.send("you are logged out");
});

module.exports = router;
