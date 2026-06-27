export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text:
                                "Summarize this document in 3-5 sentences and list 5 keywords:\n\n" + text
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!result) {
            return res.status(500).json({
                error: "Gemini returned empty response",
                debug: data
            });
        }

        return res.status(200).json({
            summary: result
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}
