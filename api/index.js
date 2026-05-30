import axios from "axios";

const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY || "VF.DM.6a056807279e78698cdd13d0.7vc2cTUJ0V80eN64";

async function sendToVoiceflow(userId, action) {
  const response = await axios.post(
    `https://general-runtime.voiceflow.com/state/user/${userId}/interact`,
    { action },
    {
      headers: {
        Authorization: VOICEFLOW_API_KEY,
        "Content-Type": "application/json",
        versionID: "main"
      }
    }
  );
  return response.data;
}

function extractText(traces) {
  let text = "";
  for (const trace of traces) {
    if (trace.type === "text" && trace.payload?.message) {
      text += trace.payload.message.replace(/\*\*/g, "").trim() + " ";
    }
    if (trace.type === "speak" && trace.payload?.message) {
      text += trace.payload.message.replace(/\*\*/g, "").trim() + " ";
    }
  }
  return text.trim();
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).send("🟢 Bridge działa!");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = req.body?.userId || "default_user";
    const userMessage = req.body?.userMessage || "";

    // Pierwsza próba — wyślij wiadomość
    let traces = await sendToVoiceflow(userId, { type: "text", payload: userMessage });
    let responseText = extractText(traces);

    // Jak puste — zresetuj sesję i spróbuj od nowa
    if (!responseText) {
      await axios.delete(
        `https://general-runtime.voiceflow.com/state/user/${userId}`,
        { headers: { Authorization: VOICEFLOW_API_KEY } }
      );
      // Launch + wiadomość
      await sendToVoiceflow(userId, { type: "launch" });
      traces = await sendToVoiceflow(userId, { type: "text", payload: userMessage });
      responseText = extractText(traces);
    }

    if (!responseText) responseText = "Cześć! W czym mogę pomóc? 😊";
    if (responseText.length > 1000) responseText = responseText.substring(0, 997) + "...";

    return res.status(200).json({ response: responseText });

  } catch (error) {
    return res.status(200).json({ response: "Wystąpił błąd techniczny. Spróbuj za chwilę." });
  }
}
