const { Pool } = require("pg");
const pool = new Pool({
  // TODO: move this to env
  user: "postgres",
  host: "localhost",
  database: "dvdrental",
  password: "coolgres",
  port: 5432
});

module.exports = {
  query: async (text, params) => {
    const start = Date.now();

    try {
      const { rows, rowCount } = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log("executed query", {
        text,
        duration,
        params,
        rows: rowCount
      });
      return rows;
    } catch (err) {
      console.log("query error: ", err);
      throw err;
    }
  }
};
