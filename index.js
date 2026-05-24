import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.post("/voiceflow", async (req, res) => {
  console.log("📩 Request od ManyChat - FORMAT TEST v1");
  return res.json({
    messages: [{ type: "text", text: "Test v1 format - działa?" }],
    actions: []
  });
});

app.get("/", (req, res) => {
  res.send("🟢 Bridge działa!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serwer uruchomiony na porcie ${PORT}`);
});
