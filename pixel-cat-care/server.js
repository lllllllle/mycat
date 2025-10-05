const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const response = await fetch("https://spark-api-open.xf-yun.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer wOXvhtYLiFuxezWqdRlR:bUGDDsaBJqsVYhFOSibD",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.text();
    res.send(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send({ error: "Proxy request failed" });
  }
});

app.listen(3000, () => console.log("✅ Proxy running on http://localhost:3000"));
