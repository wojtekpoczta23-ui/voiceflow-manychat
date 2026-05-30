import axios from "axios";

const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY || "VF.DM.6a056807279e78698cdd13d0.7vc2cTUJ0V80eN64";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).send("🟢 Bridge działa!");
  }

  try {
    const userId = req.body?.userId || "default_user";
    const userMessage = req.body?.userMessage || "";

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

    let responseText = "";
    for (const trace of vfResponse.data) {
      if (trace.type === "text" && trace.payload?.message) {
        responseText += trace.payload.message.replace(/\*\*/g, "").trim() + " ";
      }
    }

    responseText = responseText.trim();
    if (!responseText) responseText = "Chwileczkę, napisz ponownie.";
    if (responseText.length > 1000) responseText = responseText.substring(0, 997) + "...";

    return res.status(200).json({ response: responseText });

  } catch (error) {
    return res.status(200).json({ response: "Wystąpił błąd techniczny. Spróbuj za chwilę." });
  }
}
