# Setup & Deployment Guide

## Quick Start

### 1. Local Testing
```bash
# Open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

### 2. File Organization
- All files are self-contained
- No build process needed
- No dependencies to install
- Just HTML, CSS, and JavaScript

### 3. Directory Structure
```
greenharvestfarms/
├── index.html              # Main page (30KB)
├── css/
│   └── styles.css         # All styles (60KB)
├── js/
│   └── main.js            # All functionality (20KB)
├── assets/
│   ├── images/            # Add your images here
│   └── icons/             # Add icons here
├── README.md              # Project documentation
└── SETUP.md              # This file
```

## Configuration

### Update Brand Information

**In index.html:**
```html
<!-- Update title -->
<title>GreenHarvest Farms - Fresh From Nature To Your Table</title>

<!-- Update logo -->
<span class="logo-text">GreenHarvest</span>

<!-- Update company name in footer -->
<h3>GreenHarvest Farms</h3>
```

### Customize Colors

**In css/styles.css (Line ~10):**
```css
:root {
    --primary-green: #10b981;        /* Main green color */
    --secondary-green: #059669;      /* Darker green */
    --dark-green: #047857;           /* Very dark green */
    --accent-yellow: #fbbf24;        /* Accent color */
    --accent-brown: #92400e;         /* Brown accent */
    --light-bg: #f9fafb;             /* Light background */
    --dark-bg: #111827;              /* Dark mode background */
}
```

### Add Custom Images

1. Place images in `assets/images/` folder
2. Replace emoji placeholders in HTML with `<img>` tags
3. Update CSS if needed for image sizing

Example:
```html
<!-- Replace this -->
<div class="product-image">🥬</div>

<!-- With this -->
<img src="assets/images/leafy-greens.jpg" alt="Organic Leafy Greens" class="product-image">
```

### Update Contact Information

Find and update in `index.html`:
- **Address**: "123 Harvest Lane..."
- **Phone**: "+1 (800) HARVEST-1"
- **Email**: "info@greenharvestfarms.com"
- **Social Media Links**: Update href values

### Modify Product List

**In products section:**
```html
<div class="product-card" data-category="vegetables">
    <div class="product-image">🥬</div>
    <h3>Organic Leafy Greens</h3>
    <p>Fresh, nutrient-rich greens harvested daily</p>
    <div class="product-price">$4.99</div>
</div>
```

### Update Services

**In services section:**
```html
<div class="service-card">
    <div class="service-icon">🌱</div>
    <h3>Farm Consultation</h3>
    <p>Your service description here</p>
    <a href="#" class="service-link">Learn More →</a>
</div>
```

## Features Configuration

### Dark Mode
- Automatically saved to user's browser
- Toggle with button in bottom-right
- Affects entire website appearance

### Product Filtering
Categories can be modified in:
1. Filter buttons in products section
2. Data attributes on product cards
3. JavaScript filter function

### Animations
All animations are configurable:
- Duration: Edit duration values in CSS @keyframes
- Delay: Modify animation-delay values
- Speed: Change transition values

### Newsletter
Form currently shows success message. To connect to backend:

**In js/main.js (Line ~230):**
```javascript
// Update the setTimeout section to call your API
setTimeout(() => {
    // Call your backend API here
    fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(data => {
        // Handle success
    });
}, 1000);
```

### Contact Form
Currently shows success message. To connect to backend:

**In js/main.js (Line ~210):**
```javascript
// Update the setTimeout section
setTimeout(() => {
    // Call your backend API here
    fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData))
    })
    .then(response => response.json())
    .then(data => {
        // Handle success
    });
}, 1000);
```

## Deployment

### Option 1: Static Hosting (Recommended)
- **Netlify**: Drag & drop folder
- **Vercel**: Connect GitHub repo
- **GitHub Pages**: Push to repository
- **Firebase Hosting**: `firebase deploy`

### Option 2: Traditional Web Server
1. Upload files via FTP
2. Ensure `.htaccess` for clean URLs (if needed)
3. Point domain to hosting

### Option 3: Docker

**Create Dockerfile:**
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t greenharvestfarms .
docker run -p 80:80 greenharvestfarms
```

## Performance Optimization

### Current Metrics
- HTML: ~30KB
- CSS: ~60KB
- JavaScript: ~20KB
- **Total: ~110KB** (minimal)

### Further Optimization
1. **Image Optimization**
   - Use WebP format
   - Compress with ImageOptim
   - Lazy load with `loading="lazy"`

2. **CSS/JS Minification**
   - Minify CSS: Use cssnano
   - Minify JS: Use Terser
   - Combine files if needed

3. **Caching**
   - Set cache headers
   - Use service workers
   - Implement CloudFlare

### Performance Checklist
- [ ] Images optimized and compressed
- [ ] CSS minified
- [ ] JavaScript minified
- [ ] Unused code removed
- [ ] Service worker configured
- [ ] CDN enabled
- [ ] Gzip compression enabled

## SEO Optimization

### Meta Tags
Update in `<head>`:
```html
<meta name="description" content="Your description">
<meta name="keywords" content="organic farms, fresh produce">
```

### Structured Data
Add Schema.org markup for rich snippets:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "GreenHarvest Farms",
  "description": "Premium organic agriculture",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Harvest Lane",
    "addressLocality": "Agricultural Valley",
    "postalCode": "95000"
  }
}
</script>
```

### Sitemap
Create `sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://greenharvestfarms.com/</loc>
    <lastmod>2024-05-22</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

### robots.txt
```
User-agent: *
Allow: /
Sitemap: https://greenharvestfarms.com/sitemap.xml
```

## Analytics Setup

### Google Analytics
Add to `<head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Facebook Pixel
```html
<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  // ... pixel code ...
}(window, document,'script','//connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
</script>
```

## Security

### HTTPS
- Always use HTTPS in production
- Enable automatic redirect from HTTP

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com">
```

### CORS
If calling external APIs, ensure proper CORS headers

## Browser Testing

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Samsung Internet
- [ ] Firefox Mobile

### Device Sizes
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Large Mobile (414x896)

## Maintenance

### Regular Updates
- Update CDN libraries (GSAP)
- Check for broken links
- Monitor form submissions
- Review analytics

### Backup
- Regular code backups
- Database backups (if applicable)
- Version control with Git

### Monitoring
- Uptime monitoring
- Performance tracking
- Error logging
- User feedback

## Troubleshooting

### Animations Not Working
- Check browser console for errors
- Verify GSAP library is loaded
- Check CSS animations enabled

### Forms Not Submitting
- Check console for JavaScript errors
- Verify form endpoint is correct
- Check CORS settings

### Mobile Menu Not Working
- Verify hamburger click handler
- Check z-index values
- Test on actual devices

### Dark Mode Not Persisting
- Check localStorage is enabled
- Clear browser cache
- Verify dark-mode class toggles

## Support Resources

- GSAP Documentation: https://greensock.com/docs/
- MDN Web Docs: https://developer.mozilla.org/
- CSS Tricks: https://css-tricks.com/
- Web.dev: https://web.dev/

---

**Last Updated**: May 22, 2024
