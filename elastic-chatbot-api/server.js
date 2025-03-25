require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Client } = require("@elastic/elasticsearch");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const esClient = new Client({ node: "http://localhost:9200" });

// Chat endpoint
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  // 1. Search Elasticsearch for a predefined response
  try {
    const { hits } = await esClient.search({
      index: "chatbot",
      query: { match: { question: userMessage } },
    });

    if (hits.hits.length > 0) {
      return res.json({ response: hits.hits[0]._source.answer });
    }
  } catch (error) {
    console.error("Elasticsearch error:", error.message);
  }

  // 2. If no answer found, ask LM Studio
  try {
    const lmStudioResponse = await axios.post(
      "http://localhost:1234/v1/chat/completions",
      {
        model: "dolphin3.0-llama3.1-8b",
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.7,
        max_tokens: -1,
        stream: false,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return res.json({ response: lmStudioResponse.data.choices[0].message.content });
  } catch (error) {
    console.error("LM Studio error:", error.message);
    return res.status(500).json({ response: "Error fetching response from LM Studio" });
  }
});

// Start backend server
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
