import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY || "VF.DM.6a056807279e78698cdd13d0.7vc2cTUJ0V80eN64";
const VOICEFLOW_PROJECT_ID = process.env.VOICEFLOW_PROJECT_ID || "6a0567b9d8e4b4562d3e5079";

app.post("/voiceflow", async (req, res) => {
  try {
    const userId = req.body.userId || req.body.user_id || "default_user";
    const userMessage = req.body.userMessage || req.body.message || req.body.last_input_text || "";
    console.log(`📩 Wiadomość od ${userId}: ${userMessage}`);

    if (!userMessage) {
      return res.json({
        version: "v2",
        content: {
          messages: [{ type: "text", text: "Nie otrzymałem wiadomości.", buttons: [] }],
          actions: [],
          quick_replies: []
        }
      });
    }

    const voiceflowResponse = await axios.post(
      `https://general-runtime.voiceflow.com/v2beta1/project/${VOICEFLOW_PROJECT_ID}/user/${userId}/interact`,
      { action: { type: "text", payload: userMessage } },
      {
        headers: {
          Authorization: VOICEFLOW_API_KEY,
          "Content-Type": "application/json",
          versionID: "production"
        }
      }
    );

    const traces = voiceflowResponse.data;
    console.log("📦 Voiceflow traces:", JSON.stringify(traces, null, 2));

    const messages = [];
    const quickReplies = [];
    let humanHandoff = false;

    for (const trace of traces) {
      if (trace.type === "text" && trace.payload?.message) {
        messages.push({ type: "text", text: trace.payload.message, buttons: [] });
      } else if (trace.type === "visual" && trace.payload?.image) {
        messages.push({ type: "image", url: trace.payload.image, buttons: [] });
      } else if (trace.type === "choice" && trace.payload?.buttons) {
        for (const btn of trace.payload.buttons) {
          quickReplies.push({ type: "quick_reply", title: btn.name });
        }
      } else if (trace.type === "end") {
        console.log("✅ Voiceflow: koniec sesji");
      } else if (trace.type === "path" && trace.payload?.path === "needsHuman") {
        humanHandoff = true;
      }
    }

    if (messages.length === 0) {
      messages.push({ type: "text", text: "Przepraszam, nie rozumiem. Możesz napisać ponownie?", buttons: [] });
    }

    const actions = humanHandoff ? [{ action: "add_tag", tag: "needsHuman" }] : [];

    res.json({
      version: "v2",
      content: { messages, actions, quick_replies: quickReplies }
    });
    console.log("✅ Odpowiedź wysłana do ManyChat");

  } catch (error) {
    console.error("❌ Błąd:", error.response?.data || error.message);
    res.status(500).json({
      version: "v2",
      content: {
        messages: [{ type: "text", text: "Wystąpił błąd techniczny. Spróbuj ponownie za chwilę." }],
        actions: [],
        quick_replies: []
      }
    });
  }
});

app.get("/", (req, res) => {
  res.send("🟢 Voiceflow → ManyChat bridge działa!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serwer uruchomiony na porcie ${PORT}`);
});
