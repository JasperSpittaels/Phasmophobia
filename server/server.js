import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Ghost server running 👻");
});

app.post("/ghost", (req, res) => {
  const { message } = req.body;

  let response = "...";

  if (message.includes("hello")) {
    response = "I'm here...";
  }

  res.json({ response });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});