const router = require("express").Router();
const Transaction = require("../models/transaction.js");

router.post("/api/transaction", async ({ body }, response) => {
  try {
    const dbTransaction = await Transaction.create(body);
    response.json(dbTransaction);
  } catch (err) {
    console.log(err);
    response.status(500).send(err.message);
  }
});

router.post("/api/transaction/bulk", async ({ body }, response) => {
  try {
    const dbTransaction = await Transaction.insertMany(body);
    response.json(dbTransaction);
  } catch (err) {
    console.log(err);
    response.status(500).send(err.message);
  }
});

router.get("/api/transaction", async (request, response) => {
  try {
    const dbTransaction = await Transaction.find({}).sort({ date: -1 });
    response.json(dbTransaction);
  } catch (err) {
    console.log(err);
    response.status(500).send(err.message);
  }
});

module.exports = router;
