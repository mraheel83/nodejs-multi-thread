const express = require("express");
const {Worker} = require("worker_threads")

const app = express();
const port = process.env.PORT || 3000;


// non-blocking endpoint
app.get("/non-blocking", (req, res) => {
  res.status(200).send("The page is non-blocking");
});

// blocking endpoint
app.get("/blocking", async (req, res) => {
  // worker instance.
  const worker = new Worker("./worker.js");

  // worker listen message event
  worker.on("message", (data) => {
    res.status(200).send(`result is ${data}`);
  });

  // worker listen error event
  worker.on("error", (msg) => {
    res.status(404).send(`An error occurred: ${msg}`);
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
