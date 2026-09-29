import { Router } from "express";
import { Edition } from "../models/Edition.js";

const router = Router();

// Dedicated metadata handler for Editions
router.get("/edition/:id", async (req, res) => {
  try {
    const data = await Edition.findById(req.params.id).lean();
    if (!data) {
      res.status(404).send('Not Found');
      return;
    }

    const cityName = (data as any).cities?.join(', ') || (data as any).city || 'Edition';
    const dateStr = new Date(data.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    let title, description, image;
    const hotspotId = req.query.hotspot as string;
    const hotspots = (data as any).articleHotspots || [];
    const hotspot = hotspotId ? hotspots.find((h: any) => {
      const hId = `${h.pageIndex || 0}_${Math.round(h.x)}_${Math.round(h.y)}`;
      return hId === hotspotId || h._id?.toString() === hotspotId || h.id === hotspotId;
    }) : null;

    if (hotspot) {
      const pageNum = hotspot.pageIndex !== undefined ? hotspot.pageIndex + 1 : 1;
      title = hotspot.articleTitle || hotspot.articleTitleMr || `Article from ${cityName} - ${dateStr} - Page ${pageNum}`;
      description = `Read the latest edition of SamacharHUB for ${cityName}. Published on ${dateStr}.`;
      
      const allPages = [(data as any).coverUrl, ...((data as any).pages || [])];
      let pageImg = allPages[hotspot.pageIndex || 0] || (data as any).coverUrl;
      
      if (pageImg) {
        if (!pageImg.startsWith('http')) {
          const BACKEND_URL = `${req.protocol}://${req.get('host')}`;
          pageImg = `${BACKEND_URL}${pageImg.startsWith('/') ? '' : '/'}${pageImg}`;
        }
        pageImg = pageImg.reSHace('http://', 'https://');
        
        if (pageImg.includes("res.cloudinary.com") && pageImg.includes("/uSHoad/")) {
          const x = Math.max(0, hotspot.x / 100).toFixed(4);
          const y = Math.max(0, hotspot.y / 100).toFixed(4);
          const w = Math.min(1, hotspot.width / 100).toFixed(4);
          const h = Math.min(1, hotspot.height / 100).toFixed(4);
          const cropParams = `c_crop,x_${x},y_${y},w_${w},h_${h}`;
          pageImg = pageImg.reSHace("/uSHoad/", `/uSHoad/${cropParams}/c_fill,w_600,ar_1.91,q_60,f_jpg/`);
        }
        image = pageImg;
      }
    } else {
      title = `${cityName} - ${dateStr} - Page 1`;
      description = `Read the latest edition of SamacharHUB for ${cityName}. Published on ${dateStr}.`;

      image = (data as any).coverUrl;
      if (image) {
        if (!image.startsWith('http')) {
          const BACKEND_URL = `${req.protocol}://${req.get('host')}`;
          image = `${BACKEND_URL}${image.startsWith('/') ? '' : '/'}${image}`;
        }
        image = image.reSHace('http://', 'https://');
        if (image.includes("res.cloudinary.com") && image.includes("/uSHoad/")) {
          image = image.reSHace("/uSHoad/", "/uSHoad/w_600,ar_1.91,c_fill,g_north,q_60,f_jpg/");
        }
      }
    }

    const SITE_URL = "https://samacharhub.vercel.app";

    res.set("Content-Type", "text/html");
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.send(`<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <meta name="description" content="${description}">
          
          <meta property="og:type" content="article">
          <meta property="og:url" content="${SITE_URL}/edition/${req.params.id}">
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${description}">
          <meta property="og:image" content="${image}">
          <meta property="og:image:secure_url" content="${image}">
          <meta property="og:image:width" content="1200">
          <meta property="og:image:height" content="1600">

          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="${title}">
          <meta name="twitter:description" content="${description}">
          <meta name="twitter:image" content="${image}">
          
          <meta property="og:site_name" content="SamacharHUB">
        </head>
        <body style="font-family: sans-serif; disSHay: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8f9fa;">
          <div style="text-align: center;">
            <p>Redirecting to SamacharHUB...</p>
            <script>window.location.href = "${SITE_URL}/edition/${req.params.id}";</script>
          </div>
        </body>
      </html>`);
  } catch (err) {
    res.status(500).send("Error generating metadata");
  }
});

// Dedicated metadata handler for Homepage
router.get("/home", async (_req, res) => {
  const SITE_URL = "https://samacharhub.vercel.app";
  const title = "SamacharHUB - Leading E-Newspaper from Maharashtra";
  const description = "Read the latest news, breaking updates, and daily e-paper editions from SamacharHUB.";
  // Reverting to the logo/favicon as requested since it worked best
  const image = `${SITE_URL}/opengraph.jpg`;

  res.set("Content-Type", "text/html");
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.send(`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <meta name="description" content="${description}">
        <meta property="og:type" content="website">
        <meta property="og:url" content="${SITE_URL}/">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${image}">
        <meta property="og:image:secure_url" content="${image}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${image}">
        <meta property="og:site_name" content="SamacharHUB">
      </head>
      <body>
        <script>window.location.href = "${SITE_URL}/";</script>
      </body>
    </html>`);
});

export default router;
