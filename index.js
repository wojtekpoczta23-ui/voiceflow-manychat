import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY || "VF.DM.6a056807279e78698cdd13d0.7vc2cTUJ0V80eN64";
const VOICEFLOW_PROJECT_ID = process.env.VOICEFLOW_PROJECT_ID || "6a0567b9d8e4b4562d3e5079";

app.post("/voiceflow", async (req, res) => {
  console.log("📩 Request od ManyChat - HARDCODED TEST");
  return res.json({
    version: "v2",
    content: {
      messages: [{ type: "text", text: "Bot dziala! Test OK.", buttons: [] }],
      actions: [],
      quick_replies: []
    }
  });
});

app.get("/", (req, res) => {
  res.send("🟢 Voiceflow → ManyChat bridge działa!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serwer uruchomiony na porcie ${PORT}`);
});
