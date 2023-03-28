const express = require("express");
const {Worker} = require("node:worker_threads")

const app = express();
const port = process.env.PORT || 3000;
const THREAD_COUNT = 4;

/**
 * Important:
 * 1. Workers (threads) are useful for performing CPU-intensive JavaScript operations.
 * 2. Workers (threads) do not help much with I/O-intensive work.
 * 3. The Node.js built-in asynchronous I/O operations are more efficient than Workers can be.
 **/
// Create worker
function createWorker() {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./four_workers.js", {
      workerData: { thread_count: THREAD_COUNT}
    });
    worker.on("message", (data) => {
      resolve(data);
    })
    worker.on("error", (msg) => {
      reject(`An error occured: ${msg}`);
    })
  });
}

// non-blocking endpoint
app.get("/non-blocking", (req, res) => {
  res.status(200).send("The page is non-blocking");
});

// blocking endpoint
app.get("/blocking", async (req, res) => {
  // worker instance (multiple thread).
  const workerPromises = [];
  for (let i = 0; i < THREAD_COUNT; i++) {
    workerPromises.push(createWorker());
  }

  const thread_results = await Promise.all(workerPromises);
  const total = thread_results.reduce((_total, v) => _total + v, 0);
  
  res.status(200).send(`Result is ${total}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
