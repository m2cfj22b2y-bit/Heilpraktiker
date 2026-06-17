exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Nur POST erlaubt." };
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY fehlt." }) };
  }
  try {
    const { system, user } = JSON.parse(event.body || "{}");
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: system,
        messages: [{ role: "user", content: user }],
      }),
    });
    const data = await r.json();
    if (!r.ok) return { statusCode: r.status, body: JSON.stringify(data) };
    const text = (data.content || []).map((b) => b.text || "").join("");
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};
