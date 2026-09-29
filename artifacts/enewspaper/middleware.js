export const config = {
  matcher: ['/edition/:path*', '/'],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 1. Bot detection
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /bot|facebookexternalhit|whatsapp|telegram|slack|twitterbot|linkpreview|og-image|metadata/i.test(userAgent) || url.searchParams.get('bot') === '1';

  // 2. We only care about root and edition links
  const isHome = path === '/' || path === '';
  const isEdition = path.includes('/edition/');

  if (!isBot || (!isHome && !isEdition)) return;

  // 3. Configuration
  const FRONTEND_URL = "https://panchnamalakshvedhi.vercel.app";
  const BACKEND_URL = "https://apipanchnamalakshvedhiserver.vercel.app";
  
  let title = "Panchnama Lakshvedhi - Leading E-Newspaper from Maharashtra";
  let description = "Read the latest news, breaking updates, and daily e-paper editions from Panchnama Lakshvedhi.";
  let image = `${FRONTEND_URL}/logo.jpg`;

  // 4. Fetch Dynamic Data for Edition
  if (isEdition) {
    const parts = path.split('/').filter(Boolean);
    const id = parts[parts.length - 1];

    if (id && id !== 'edition') {
      try {
        const response = await fetch(`${BACKEND_URL}/api/editions/${id}`);
        if (response.ok) {
          const data = await response.json();
          const cityName = data.cities?.join(', ') || data.city || 'Edition';
          const dateStr = new Date(data.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
          const hotspotId = url.searchParams.get('hotspot');
          const hotspot = hotspotId ? (data.articleHotspots || []).find(h => {
            const hId = `${h.pageIndex || 0}_${Math.round(h.x)}_${Math.round(h.y)}`;
            return hId === hotspotId || h._id === hotspotId || h.id === hotspotId;
          }) : null;

          if (hotspot) {
            const pageNum = hotspot.pageIndex !== undefined ? hotspot.pageIndex + 1 : 1;
            title = hotspot.articleTitle || hotspot.articleTitleMr || `Article from ${cityName} - ${dateStr} - Page ${pageNum}`;
            description = `Read the latest edition of Panchnama Lakshvedhi for ${cityName}. Published on ${dateStr}.`;
            
            const allPages = [data.coverUrl, ...(data.pages || [])];
            let pageImg = allPages[hotspot.pageIndex || 0] || data.coverUrl;
            
            if (pageImg) {
              if (!pageImg.startsWith('http')) {
                pageImg = `${BACKEND_URL}${pageImg.startsWith('/') ? '' : '/'}${pageImg}`;
              }
              pageImg = pageImg.replace('http://', 'https://');
              
              if (pageImg.includes("res.cloudinary.com") && pageImg.includes("/upload/")) {
                const x = Math.max(0, hotspot.x / 100).toFixed(4);
                const y = Math.max(0, hotspot.y / 100).toFixed(4);
                const w = Math.min(1, hotspot.width / 100).toFixed(4);
                const h = Math.min(1, hotspot.height / 100).toFixed(4);
                const cropParams = `c_crop,x_${x},y_${y},w_${w},h_${h}`;
                pageImg = pageImg.replace("/upload/", `/upload/${cropParams}/c_fill,w_600,ar_1.91,q_60,f_jpg/`);
              }
              image = pageImg;
            }
          } else {
            title = `${cityName} - ${dateStr} - Page 1`;
            description = `Read the latest edition of Panchnama Lakshvedhi for ${cityName}. Published on ${dateStr}.`;
            
            let rawImage = data.coverUrl;
            if (rawImage) {
              if (!rawImage.startsWith('http')) {
                rawImage = `${BACKEND_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
              }
              rawImage = rawImage.replace('http://', 'https://');
              
              // SUPER CRITICAL: Compress and crop from the top for WhatsApp previews
              if (rawImage.includes("res.cloudinary.com") && rawImage.includes("/upload/")) {
                rawImage = rawImage.replace("/upload/", "/upload/w_600,ar_1.91,c_fill,g_north,q_60,f_jpg/");
              }
              image = rawImage;
            }
          }
        }
      } catch (e) {
        console.error("Bot Fetch Error", e);
      }
    }
  }

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <meta name="description" content="${description}">

        <meta property="og:type" content="${isEdition ? 'article' : 'website'}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${image}">
        <meta property="og:image:secure_url" content="${image}">
        <meta property="og:image:width" content="${isEdition ? '600' : '1080'}">
        <meta property="og:image:height" content="${isEdition ? '900' : '810'}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${image}">
        
        <meta property="og:site_name" content="Panchnama Lakshvedhi">
      </head>
      <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8f9fa;">
        <div style="text-align: center;">
          <p>Redirecting to Panchnama Lakshvedhi...</p>
          <script>window.location.href = "${url.href}";</script>
        </div>
      </body>
    </html>`,
    { 
      headers: { 
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0'
      } 
    }
  );
}
