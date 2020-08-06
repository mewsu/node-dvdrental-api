const db = require("../db");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

let strategy = new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  async function(email, password, done) {
    console.log("login attempt: ", { email, password });
    try {
      const rows = await db.query(
        "SELECT * FROM customer WHERE email = $1 AND password = $2",
        [email, password]
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
  }
);

passport.use(strategy);

//Could be async if we wanted it to
passport.serializeUser((user, done) => {
  done(null, user.customer_id);
});

passport.deserializeUser(async (customer_id, done) => {
  try {
    const rows = await db.query(
      "SELECT * FROM customer WHERE customer_id = $1",
      [customer_id]
    );
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

module.exports = passport;
