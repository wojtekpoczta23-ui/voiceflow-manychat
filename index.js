import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY || "VF.DM.6a056807279e78698cdd13d0.7vc2cTUJ0V80eN64";

app.post("/voiceflow", async (req, res) => {
  try {
    const userId = req.body.userId || "default_user";
    const userMessage = req.body.userMessage || "";

    const vfResponse = await axios.post(
      `https://general-runtime.voiceflow.com/state/user/${userId}/interact`,
      { action: { type: "text", payload: userMessage } },
      {
        headers: {
          Authorization: VOICEFLOW_API_KEY,
          "Content-Type": "application/json",
          versionID: "main"
        }
      }
    );

    const traces = vfResponse.data;
    let responseText = "";

    for (const trace of traces) {
      if (trace.type === "text" && trace.payload?.message) {
        responseText += trace.payload.message.replace(/\*\*/g, "").trim() + " ";
      }
    }

    responseText = responseText.trim();
    if (!responseText) responseText = "Przepraszam, spróbuj ponownie.";
    if (responseText.length > 1000) responseText = responseText.substring(0, 997) + "...";

    return res.json({ response: responseText });

  } catch (error) {
    console.error("❌ Błąd:", error.message);
    return res.json({ response: "Wystąpił błąd techniczny. Spróbuj za chwilę." });
  }
});

app.get("/", (req, res) => res.send("🟢 Bridge działa!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Port ${PORT}`));
