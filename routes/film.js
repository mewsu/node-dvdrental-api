const Router = require("express-promise-router");
const db = require("../db");
const bodyParser = require("body-parser");
const cors = require("cors"); // need to disable this outside localhost

const router = new Router();
module.exports = router;

const rowsPerPage = 8; // TODO: move to env

// Get total pages of films
router.get("/pages", cors(), async (req, res) => {
  console.log("get pages");
  try {
    const rows = await db.query("SELECT COUNT(*) FROM film");
    res.send(String(Math.ceil(rows[0].count / rowsPerPage)));
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

// Films search by title
router.get("/search", cors(), async (req, res) => {
  console.log(req.query);
  const contains = req.query.title;
  try {
    const rows = await db.query(
      "SELECT * FROM film WHERE title ILIKE $1 LIMIT 8",
      [`%${contains}%`]
    );
    res.send(rows);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

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
router.get("/", cors(), async (req, res) => {
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
      qval = rowsPerPage * (qval - 1); // this is offset
      pc += ` ORDER BY film.film_id OFFSET $${paramIdx} LIMIT 8 `;
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
