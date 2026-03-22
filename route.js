export async function POST(req) {
  try {
    const body = await req.json();
    const message = body.message;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant called CentraHQ."
          },
          {
            role: "user",
            content: message
          }
        ]
      }),
    });

    const data = await response.json();

    if (!data.choices) {
      return new Response(
        JSON.stringify({ reply: "AI error — check API key." }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        reply: data.choices[0].message.content
      }),
      { status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        reply: "Server error — something broke."
      }),
      { status: 500 }
    );
  }
}

