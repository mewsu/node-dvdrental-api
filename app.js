// ./app.js
const express = require("express");

const mountRoutes = require("./routes");
const app = express();

mountRoutes(app);
// ... more express setup stuff can follow

app.get("/", (req, res) => res.send("Hello World!"));
app.get("/logout", function(req, res) {
  console.log("logout");
  req.logout();
  res.redirect("/");
});

let port = 3001;
app.listen(port, () =>
  console.log(`dvdrental API listening at http://localhost:${port}`)
);
