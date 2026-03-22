# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

### One-Command Deploy

```bash
npm run build
npx vercel --prod
```

That's it! Vercel automatically reads `vercel.json` for the required headers.

---

## Manual Deployment Steps

### 1. Build the Project

```bash
npm run build
```

This creates a `dist/` folder with:
- `index.html`
- `/assets/` - JS, CSS, and WASM files
- `manifest.json` - PWA manifest

### 2. Upload to Hosting

Upload the entire `dist/` folder contents to your hosting provider.

---

## Hosting Provider Setup

### Vercel

The `vercel.json` is already configured:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "credentialless" }
      ]
    }
  ]
}
```

Deploy:
```bash
npx vercel --prod
```

### Netlify

Create `netlify.toml` in project root:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "credentialless"
```

Deploy via Netlify CLI:
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Cloudflare Pages

Create `_headers` file in project root:

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless
```

Deploy via Cloudflare dashboard or CLI:
```bash
npm run build
wrangler pages publish dist
```

### GitHub Pages

⚠️ **Not Recommended** - GitHub Pages doesn't support custom headers.

Alternative: Use Cloudflare in front of GitHub Pages.

### AWS S3 + CloudFront

1. Upload `dist/` to S3 bucket
2. Configure CloudFront distribution
3. Add Lambda@Edge function for headers:

```javascript
exports.handler = async (event) => {
  const response = event.Records[0].cf.response;
  response.headers['cross-origin-opener-policy'] = [{ value: 'same-origin' }];
  response.headers['cross-origin-embedder-policy'] = [{ value: 'credentialless' }];
  return response;
};
```

### Firebase Hosting

Add to `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cross-Origin-Opener-Policy",
            "value": "same-origin"
          },
          {
            "key": "Cross-Origin-Embedder-Policy",
            "value": "credentialless"
          }
        ]
      }
    ]
  }
}
```

Deploy:
```bash
npm run build
firebase deploy
```

---

## Critical Headers Explained

### Why These Headers?

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

These headers enable **SharedArrayBuffer**, which allows:
- ✅ Multi-threaded WASM (10x faster AI inference)
- ✅ Better performance for large models
- ✅ Parallel processing

Without these headers:
- ⚠️ App still works in single-threaded mode
- ⚠️ Performance is slower (~5-10x)
- ⚠️ Larger models may be unusable

### Testing Headers

After deployment, verify headers are set:

```bash
curl -I https://your-domain.com

# Should see:
# cross-origin-opener-policy: same-origin
# cross-origin-embedder-policy: credentialless
```

Or use browser DevTools:
1. Open your deployed site
2. DevTools → Network tab
3. Refresh page
4. Click first request
5. Check "Response Headers"

---

## Environment-Specific Configuration

### Development
```bash
npm run dev
# Vite dev server sets headers automatically
```

### Preview Build Locally
```bash
npm run build
npm run preview
# Or use: npx serve dist -c serve.json
```

Create `serve.json` for testing:
```json
{
  "headers": [
    {
      "source": "**",
      "headers": [
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "credentialless"
        }
      ]
    }
  ]
}
```

---

## Custom Domain Setup

### Vercel
1. Go to project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL automatically provisioned

### Netlify
1. Site settings → Domain management
2. Add custom domain
3. Update DNS
4. SSL via Let's Encrypt (automatic)

### Cloudflare Pages
1. Add custom domain in dashboard
2. DNS automatically configured (if using Cloudflare DNS)
3. SSL enabled by default

---

## Performance Optimization

### Enable Caching

Add to headers:

```
Cache-Control: public, max-age=31536000, immutable
```

For static assets (`.js`, `.css`, `.wasm`):

#### Vercel

Already configured in `vercel.json`:
```json
{
  "source": "/assets/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

#### Netlify

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Compression

Most hosting providers (Vercel, Netlify, Cloudflare) enable gzip/brotli automatically.

Verify compression:
```bash
curl -H "Accept-Encoding: gzip" -I https://your-domain.com
# Should see: content-encoding: gzip
```

---

## PWA Installation

### Make App Installable

Ensure these files exist:
- ✅ `/manifest.json` (already included)
- ✅ Service worker (optional for offline caching)

Users can install via:
- Chrome: Address bar → Install icon
- Edge: Address bar → Install icon
- Mobile: "Add to Home Screen"

### Service Worker (Optional)

For advanced offline caching, create `public/sw.js`:

```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('novamind-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        // Add other static assets
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

Register in `index.html`:
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

---

## Troubleshooting Deployment

### App Works Locally But Not in Production

**Symptom**: Models don't load or WASM errors

**Causes**:
1. Missing COOP/COEP headers
2. WASM files not copied
3. Incorrect MIME types

**Solutions**:
1. Verify headers (see "Testing Headers" above)
2. Check `dist/assets/` contains `.wasm` files
3. Ensure server serves `.wasm` with `application/wasm` MIME type

### Models Download But Don't Load

**Symptom**: Download completes but inference fails

**Cause**: Missing SharedArrayBuffer support

**Solution**: Set COOP/COEP headers correctly

### Slow Performance in Production

**Symptom**: Generation much slower than local

**Causes**:
1. Single-threaded mode (no SharedArrayBuffer)
2. CPU-only mode (no WebGPU)

**Check**:
1. Open Privacy Dashboard → should show "WebGPU" or "CPU" badge
2. DevTools Console → look for SharedArrayBuffer warnings

---

## Monitoring & Analytics

### Basic Monitoring

Check browser console for errors:
```javascript
window.addEventListener('error', (e) => {
  console.error('Global error:', e);
});
```

### Custom Error Tracking (Optional)

Since NovaMind is privacy-first, **avoid** services like Sentry that send data externally.

Instead, log locally:
```javascript
localStorage.setItem('error-log', JSON.stringify(errors));
```

---

## Deployment Checklist

### Pre-Deploy
- [ ] Run `npm run build` successfully
- [ ] Test build locally with `npm run preview`
- [ ] Verify WASM files in `dist/assets/`
- [ ] Check `manifest.json` is in `dist/`

### Post-Deploy
- [ ] Visit deployed URL
- [ ] Verify COOP/COEP headers
- [ ] Test model download
- [ ] Test at least one generation
- [ ] Check Privacy Dashboard shows correct status
- [ ] Test offline mode (disable network)
- [ ] Test PWA installation (if desired)

### Performance Checks
- [ ] Check WebGPU badge appears
- [ ] Measure time to first token (<1s)
- [ ] Verify tokens/second (10-30 on WebGPU)
- [ ] Test with large document upload

---

## Support & Issues

If deployment fails:

1. **Check headers first** - 90% of issues are missing COOP/COEP
2. **Verify WASM files** - Ensure they're served correctly
3. **Test in Chrome/Edge 120+** - Best browser support
4. **Check browser console** - Look for specific errors

Common error messages:
- "SharedArrayBuffer is not defined" → Missing headers
- "WebAssembly instantiation failed" → WASM not served correctly
- "No model loaded" → Model download/load failed

---

## Success!

After deployment, your app should:

✅ Load instantly  
✅ Download models (~250MB, one-time)  
✅ Generate text in <1 second  
✅ Work 100% offline  
✅ Show "WebGPU" badge (on supported browsers)  

**Your NovaMind deployment is complete! 🎉**

---

For more help, see:
- [README.md](README.md) - Full documentation
- [QUICKSTART.md](QUICKSTART.md) - Getting started
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Implementation details
