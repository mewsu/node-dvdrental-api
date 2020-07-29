const Router = require("express-promise-router");
const db = require("../db");
const bodyParser = require("body-parser");

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

// Get all films or by page
router.get("/", async (req, res) => {
  const { page } = req.query;
  const offset = 10 * (page - 1);
  try {
    let rows;
    if (!page) {
      rows = await db.query("SELECT * FROM film ORDER BY film_id");
    } else {
      rows = await db.query(
        "SELECT * FROM film ORDER BY film_id OFFSET $1 LIMIT 10",
        [offset]
      );
    }

    res.send(rows);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});
