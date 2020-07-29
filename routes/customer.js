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

// Get customer by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await db.query(
      "SELECT * FROM customer WHERE customer_id = $1",
      [id]
    );
    res.send(rows[0]);
  } catch (err) {
    res.sendStatus(400);
  }
});

// Create new customer
router.put("/", jsonParser, async (req, res) => {
  // create customer
  console.log(JSON.stringify(req.body));
  const { first_name, last_name, store_id, address_id } = req.body;

  const text =
    "INSERT INTO customer(first_name, last_name, store_id, address_id) VALUES($1, $2, $3, $4) RETURNING *";
  const values = [first_name, last_name, store_id, address_id];
  try {
    const rows = await db.query(text, values);
    console.log(rows[0]);
    // console.log(res.rows[0]);
    // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
    res.sendStatus(200);
  } catch (err) {
    console.log(err.stack);
    res.sendStatus(400);
  }
});

// Update customer info
router.post("/:id", jsonParser, async (req, res) => {
  const { id } = req.params;
  console.log(JSON.stringify(req.body));
  const { first_name, last_name, store_id, address_id, email } = req.body;

  const text = `UPDATE customer SET first_name = COALESCE($2, first_name), 
    last_name = COALESCE($3, last_name), 
    store_id = COALESCE($4, store_id), 
    address_id = COALESCE($5, address_id), 
    email = COALESCE($6, email) 
    WHERE customer_id = $1 RETURNING *`;

  const values = [id, first_name, last_name, store_id, address_id, email];
  try {
    const rows = await db.query(text, values);
    console.log(rows[0]);
    res.sendStatus(200);
  } catch (err) {
    console.log(err.stack);
    res.sendStatus(400);
  }
});
