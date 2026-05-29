import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.post("/voiceflow", async (req, res) => {
  console.log("📩 TEST v2 format");
  return res.json({
    version: "v2",
    content: {
      messages: [{ type: "text", text: "Bot dziala! Test v2.", buttons: [] }],
      actions: [],
      quick_replies: []
    }
  });
});

app.get("/", (req, res) => {
  res.send("🟢 Bridge działa!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Port ${PORT}`));
