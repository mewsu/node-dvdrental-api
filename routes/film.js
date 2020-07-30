const Router = require("express-promise-router");
const db = require("../db");
const bodyParser = require("body-parser");
const { query } = require("express");

// create application/json parser
const jsonParser = bodyParser.json();

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();
// export our router to be mounted by the parent application
module.exports = router;

// Get film by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await db.query("SELECT * FROM film WHERE film_id = $1", [id]);

    res.send(rows[0]);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

const appendWhereClause = (cw, add) => {
  console.count("called: ");
  console.log("cw: ", cw);
  if (cw == "") {
    cw = `WHERE `;
  } else {
    cw += ` AND `;
  }

  cw += add;
  return cw;
};

// Get films
// Should be able to query by:
// actor_id, title, release_year, rental_rate max, length min, rating min, language_id
router.get("/", async (req, res) => {
  console.log(req.query);
  // create a query param -> query string object map with array idx
  let qstring = "SELECT * FROM film ";
  let wc = ""; // where clause
  let pc = ""; // page & limit clause
  let jc = ""; // join clause

  // must be query + jc + wc + pc in that order

  const params = [];
  Object.entries(req.query).forEach(([qname, qval], idx) => {
    const paramIdx = idx + 1;
    if (qname == "page") {
      // page clause
      qval = 10 * (qval - 1);
      pc += ` ORDER BY film.film_id OFFSET $${paramIdx} LIMIT 10 `;
    } else {
      // where clause
      let add;
      if (qname == "title") {
        add = `title = $${paramIdx}`;
      } else if (qname == "release_year") {
        add = `release_year = $${paramIdx}`;
      } else if (qname == "rental_rate_max") {
        add = `rental_rate <= $${paramIdx}`;
      } else if (qname == "length_min") {
        add = `length >= $${paramIdx}`;
      } else if (qname == "rating") {
        add = `rating = $${paramIdx}`;
      } else if (qname == "language_id") {
        add = `language_id = $${paramIdx}`;
      } else if (qname == "actor_id") {
        // this needs a join clause
        jc += `INNER JOIN film_actor ON film.film_id = film_actor.film_id `;
        add = `actor_id = $${paramIdx}`;
      }
      wc = appendWhereClause(wc, add); // wc is WHERE ... AND ... AND ...
    }

    // push param val
    params.push(qval);
  });

  // construct query string
  if (jc) {
    qstring += jc;
  }
  if (wc) {
    qstring += wc;
  }
  if (pc) {
    qstring += pc;
  }

  console.log("query: ", qstring);
  console.log("params: ", params);

  try {
    rows = await db.query(qstring, params);
    res.send(rows);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});
