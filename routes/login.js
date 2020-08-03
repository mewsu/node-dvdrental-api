const Router = require("express-promise-router");
const db = require("../db");
const bodyParser = require("body-parser");
const cors = require("cors");

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const router = new Router();
module.exports = router;

let strategy = new LocalStrategy(async function(username, password, done) {
  console.log("login attempt: ", { username, password });
  try {
    const rows = await db.query(
      "SELECT * FROM staff WHERE username = $1 AND password = $2",
      [username, password]
    );
    if (!rows.length) {
      console.log("no found user");
      return done(null, false, { message: "no match found" });
    }
    console.log("found user");
    return done(null, rows[0]);
  } catch (err) {
    console.log(err);
    return done(err);
  }
});

passport.use(strategy);

router.use(session({ secret: "cats" }));
router.use(bodyParser.urlencoded({ extended: false }));
router.use(passport.initialize());
router.use(passport.session());

//Could be async if we wanted it to
passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  try {
    const rows = await db.query("SELECT * FROM staff WHERE email = $1", [
      email
    ]);
    if (!rows.length) {
      console.log("no found user");
      return done(null, false, { message: "no match found" });
    }
    console.log("found user");
    return done(null, rows[0]);
  } catch (e) {
    done(e);
  }
});

router.post("/", passport.authenticate("local", { successRedirect: "/" }));
router.get("/", (req, res) => {
  res.send("ok");
});
