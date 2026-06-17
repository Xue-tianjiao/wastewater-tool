js// api/chat.js — Vercel Serverless 代理：把前端请求透传到火山方舟，API Key 不落库
module.exports = async (req, res) => {
  // CORS（前端与本函数同源其实不需要，这里做防御性处理并响应预检）
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-ark-key");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: { message: "Method Not Allowed" } });

  const key = req.headers["x-ark-key"];
  if (!key) return res.status(401).json({ error: { message: "缺少 API Key（请在网页「设置」中填写）" } });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const upstream = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();           // 原样透传火山方舟的返回
    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: { message: "代理请求火山方舟失败：" + (e && e.message ? e.message : String(e)) } });
  }
};
