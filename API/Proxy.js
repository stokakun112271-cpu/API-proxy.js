// Vercel Function: MangaDex proxy
// Routes used by index.html: search, manga, chapters, pages, image
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { type = "search", q = "", limit = "12", id, url } = req.query;
  const API = "https://api.mangadex.org";

  try {
    if (type === "image") {
      if (!url || typeof url !== "string") return res.status(400).json({ error: "Missing image URL" });
      let imageUrl;
      try { imageUrl = new URL(url); } catch { return res.status(400).json({ error: "Invalid image URL" }); }
      if (imageUrl.protocol !== "https:" || !["uploads.mangadex.org", "mangadex.org"].includes(imageUrl.hostname)) {
        return res.status(400).json({ error: "Image host not allowed" });
      }
      const upstream = await fetch(imageUrl.toString());
      if (!upstream.ok) return res.status(upstream.status).json({ error: "Image upstream failed" });
      const bytes = Buffer.from(await upstream.arrayBuffer());
      res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/jpeg");
      res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
      return res.status(200).send(bytes);
    }

    if (type === "search") {
      const params = new URLSearchParams();
      params.set("limit", String(Math.min(Math.max(parseInt(limit, 10) || 12, 1), 30)));
      params.append("includes[]", "cover_art");
      params.append("order[followedCount]", "desc");
      params.append("contentRating[]", "safe");
      params.append("contentRating[]", "suggestive");
      if (typeof q === "string" && q.trim()) {
        params.set("title", q.trim());
        params.delete("order[followedCount]");
        params.set("order[relevance]", "desc");
      }
      return await forward(`${API}/manga?${params}`, res);
    }

    if (type === "manga") {
      if (typeof id !== "string" || !id) return res.status(400).json({ error: "Missing manga id" });
      return await forward(`${API}/manga/${encodeURIComponent(id)}?includes[]=cover_art&includes[]=author&includes[]=artist`, res);
    }

    if (type === "chapters") {
      if (typeof id !== "string" || !id) return res.status(400).json({ error: "Missing manga id" });
      const params = new URLSearchParams();
      params.append("manga[]", id);
      params.set("limit", "100");
      params.append("translatedLanguage[]", "en");
      params.set("order[chapter]", "desc");
      params.append("includes[]", "scanlation_group");
      return await forward(`${API}/chapter?${params}`, res);
    }

    if (type === "pages") {
      if (typeof id !== "string" || !id) return res.status(400).json({ error: "Missing chapter id" });
      const upstream = await fetch(`${API}/at-home/server/${encodeURIComponent(id)}`);
      if (!upstream.ok) return res.status(upstream.status).json({ error: "Could not fetch chapter pages" });
      const data = await upstream.json();
      const chapter = data.chapter || {};
      const pages = (chapter.data || []).map(file => `${data.baseUrl}/data/${chapter.hash}/${file}`);
      return res.status(200).json({ pages });
    }

    return res.status(400).json({ error: "Unknown proxy type" });
  } catch (error) {
    return res.status(502).json({ error: "Proxy request failed", detail: String(error?.message || error) });
  }
}

async function forward(url, res) {
  const upstream = await fetch(url, { headers: { Accept: "application/json" } });
  const body = await upstream.text();
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(upstream.status).send(body);
    }
      
