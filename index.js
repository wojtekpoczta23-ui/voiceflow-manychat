import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.post("/voiceflow", async (req, res) => {
  console.log("📩 Request received");
  return res.json({
    response: "Bot dziala! Test nowej metody."
  });
});

app.get("/", (req, res) => {
  res.send("🟢 Bridge działa!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Port ${PORT}`));
