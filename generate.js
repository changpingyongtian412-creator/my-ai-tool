export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 🔒 サーバー側で安全にAPIキーを取得
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'サーバーにAPIキーが設定されていません。' });
    }

    const { companyName, business, location, strengths, tone, formatType } = req.body;

    const prompt = `あなたはプロのWebライターです。
以下の企業情報をもとに、最高品質の会社概要・企業紹介テキストを作成してください。

【企業情報】
- 会社名: ${companyName}
- 事業内容: ${business}
- 所在地: ${location}
- 特徴・強み・想い: ${strengths}

【条件】
- トーン: ${tone}
- フォーマット: ${formatType}

Markdown形式で見やすく整理して出力してください。`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Gemini APIエラーが発生しました。');
        }

        const generatedText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ text: generatedText });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}