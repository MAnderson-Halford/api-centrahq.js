export default async function handler(req, res) {
  const origin = req.headers.origin || "*";

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, transcript = [], page_url = "" } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const lower = message.toLowerCase();

    const emailMatch = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

    let collectedName = null;
    let collectedEmail = emailMatch ? emailMatch[0] : null;

    for (let i = transcript.length - 1; i >= 0; i--) {
      const item = transcript[i];
      if (!item || item.role !== "user" || !item.text) continue;

      const text = item.text.trim();

      if (!collectedEmail) {
        const em = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        if (em) collectedEmail = em[0];
      }

      if (!collectedName) {
        const looksLikeName =
          text.length >= 3 &&
          text.length <= 60 &&
          !text.includes("@") &&
          /^[a-zA-Z ,.'-]+$/.test(text) &&
          text.split(" ").length <= 4;

        if (looksLikeName) {
          collectedName = text;
        }
      }

      if (collectedName && collectedEmail) break;
    }

    const systemPrompt = `
You are CentraHQ, a helpful assistant for business owners.

Rules:
- Be concise, helpful, and professional.
- If the user shows buying intent, try to collect name and email.
- If the user asks about pricing, quotes, demos, callbacks, or sales, guide them toward leaving details.
- If you do not yet have their name, ask for it.
- If you have their name but not their email, ask for their best email address.
- Once you have both, tell them: "Thanks — someone from the team will be in touch shortly."
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...transcript.map(function (item) {
        return {
          role: item.role,
          content: item.text
        };
      }),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI request failed",
        details: data
      });
    }

    const reply = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : null;

    if (!reply) {
      return res.status(500).json({
        error: "No reply from AI",
        debug: data
      });
    }

    let zapSent = false;

    if (collectedName && collectedEmail) {
      const leadPayload = {
        source: "CentraHQ Website Chat",
        name: collectedName,
        email: collectedEmail,
        interest: message,
        page_url: page_url,
        timestamp: new Date().toISOString(),
        transcript: transcript.concat([
          { role: "user", text: message },
          { role: "assistant", text: reply }
        ])
      };

      try {
        await fetch("https://hooks.zapier.com/hooks/catch/23447444/up03en3/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(leadPayload)
        });
        zapSent = true;
      } catch (zapError) {
        console.error("Zapier webhook failed:", zapError);
      }
    }

    return res.status(200).json({
      reply: reply,
      leadCaptured: Boolean(collectedName && collectedEmail),
      zapSent: zapSent
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: String(error)
    });
  }
}
