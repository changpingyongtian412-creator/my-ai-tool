export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is not set in environment variables' });
    }

    const { companyName, business, location, strengths, tone, formatType } = req.body;

    const prompt = `
以下の情報をもとに、指定された構成とトーンで魅力的な会社概要の文章を作成してください。

【基本情報】
- 会社名: ${companyName}
- 事業内容: ${business}
- 所在地: ${location}
- 特徴・強み: ${strengths}

【出力条件】
- 文章のトーン: ${tone}
- 構成タイプ: ${formatType}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'API Error' });
    }

    // 生成されたテキストを取り出す
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return res.status(500).json({ error: 'AIからの回答テキストを取得できませんでした。' });
    }

    // index.html が求める { text: "..." } の形で返却
    return res.status(200).json({ text: generatedText });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
