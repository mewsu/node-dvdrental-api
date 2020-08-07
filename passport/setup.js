const db = require("../db");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

let strategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  },
  async function(req, email, password, done) {
    const role = req.body.role;
    if (!role) {
      throw new Error("no role provided");
    }
    if (role !== "staff" && role !== "customer") {
      throw new Error(`Unknown role: ${role}`);
    }
    console.log("login attempt: ", { email, password, role });
    try {
      const query = `SELECT * FROM ${role} WHERE email = $1 AND password = $2`;
      const rows = await db.query(query, [email, password]);
      if (!rows.length) {
        console.log("no found user");
        return done(null, false, { message: "no match found" });
      }
      console.log("found user: ", rows[0]);
      const user = rows[0];
      user.role = role;
      return done(null, user); // user obj is passed to serializeUser
    } catch (err) {
      console.log(err);
      return done(err);
    }
  }
);

passport.use(strategy);

//Could be async if we wanted it to
passport.serializeUser((user, done) => {
  // console.log("req: ", JSON.stringify(req.body));
  console.log("serialize user: ", user);
  const role = user.role;
  let id;
  if (role === "customer") {
    id = user.customer_id;
  } else if (role === "staff") {
    id = user.staff_id;
  } else {
    throw new Error("Unknow role: ", role);
  }
  done(null, { id, role });
});

passport.deserializeUser(async (user, done) => {
  console.log("deserialize user: ", JSON.stringify(user));

  try {
    const { id, role } = user;
    if (!role) throw new Error("no role provided");
    if (role !== "staff" && role !== "customer")
      throw new Error(`Unknown role: ${role}`);

    let idColumn;
    if (role === "customer") {
      idColumn = "customer_id";
    } else if (role === "staff") {
      idColumn = "staff_id";
    }

    const query = `SELECT * FROM ${role} WHERE ${idColumn} = $1`;

    const rows = await db.query(query, [id]);
    if (!rows.length) {
      console.log("no found user");
      return done(null, false, { message: "no match found" });
    }
    console.log("found user");

    return done(null, { id, role });
  } catch (e) {
    done(e);
  }
});

module.exports = passport;
