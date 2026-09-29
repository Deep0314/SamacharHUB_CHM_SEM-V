import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEO({ title, description, image, url }: SEOProps) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | SamacharHUB`;
      document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    }
    
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);
      document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    }

    if (image) {
      const absoluteImage = image.startsWith("http") ? image : `${window.location.origin}${image}`;
      document.querySelector('meta[property="og:image"]')?.setAttribute("content", absoluteImage);
      document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", absoluteImage);
    }

    if (url) {
      const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
      document.querySelector('meta[property="og:url"]')?.setAttribute("content", absoluteUrl);
      document.querySelector('link[rel="canonical"]')?.setAttribute("href", absoluteUrl);
    }
  }, [title, description, image, url]);

  return null;
}
