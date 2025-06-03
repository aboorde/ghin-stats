# Deployment Guide

## Overview
This application is configured for deployment on GitHub Pages using Vite's static site generation.

## Prerequisites
- Node.js 20+ installed
- Git repository initialized
- GitHub repository created
- Environment variables configured

## Environment Variables

### Required Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Important Notes
- Variables must be prefixed with `VITE_` for Vite to expose them
- Never commit `.env` file to repository
- Add `.env` to `.gitignore`

## Deployment Configuration

### 1. Vite Configuration
The `vite.config.js` is configured for GitHub Pages:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/ghin-stats/', // Must match your GitHub repo name
})
```

### 2. Package.json Scripts
```json
{
  "scripts": {
    "build": "vite build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

## Deployment Steps

### Initial Setup
1. Install gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Update `base` in `vite.config.js` to match your repository name:
   ```javascript
   base: '/your-repo-name/'
   ```

### Deploy to GitHub Pages

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

3. Configure GitHub Pages:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

4. Access your site at:
   ```
   https://[username].github.io/[repository-name]/
   ```

## Continuous Deployment

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### Setting GitHub Secrets
1. Go to repository Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Build Output

The build process creates:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── react-[hash].svg
└── vite.svg
```

## Troubleshooting

### Common Issues

1. **404 Error on Page Refresh**
   - GitHub Pages doesn't support client-side routing
   - Solution: All routes load from index.html (SPA behavior)

2. **Assets Not Loading**
   - Check `base` path in `vite.config.js`
   - Ensure it matches your repository name

3. **Environment Variables Not Working**
   - Variables must start with `VITE_`
   - Check they're properly set during build
   - For GitHub Actions, verify secrets are configured

4. **Build Failures**
   - Check Node.js version compatibility
   - Clear `node_modules` and reinstall
   - Verify all dependencies are installed

### Debug Steps

1. Test build locally:
   ```bash
   npm run build
   npm run preview
   ```

2. Check for console errors in browser DevTools

3. Verify network requests for correct asset URLs

4. Check GitHub Pages settings are correct

## Performance Optimization

### Current Optimizations
- Vite automatically:
  - Minifies JavaScript and CSS
  - Tree-shakes unused code
  - Splits vendor chunks
  - Optimizes asset loading

### Potential Improvements
1. **Code Splitting**:
   ```javascript
   const YearByYearAnalysis = lazy(() => import('./components/YearByYearAnalysis'))
   ```

2. **Image Optimization**:
   - Currently no images in project
   - If added, use optimized formats (WebP, AVIF)

3. **Caching Strategy**:
   - Vite adds hash to filenames for cache busting
   - Consider service worker for offline support

## Monitoring

### Analytics
Consider adding:
- Google Analytics
- Vercel Analytics
- Custom error tracking

### Performance Monitoring
- Use Lighthouse CI in GitHub Actions
- Monitor Core Web Vitals
- Set up alerts for deployment failures

## Security Considerations

1. **API Keys**:
   - Only use public (anon) Supabase key
   - Never expose service role key
   - Implement Row Level Security in Supabase

2. **Content Security Policy**:
   - Consider adding CSP headers
   - Restrict external resource loading

3. **HTTPS**:
   - GitHub Pages provides HTTPS by default
   - Ensure all external resources use HTTPS

## Rollback Procedure

If deployment issues occur:

1. **Immediate Rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Manual Rollback**:
   - Go to GitHub Actions
   - Find last successful deployment
   - Re-run deployment workflow

3. **Local Testing**:
   ```bash
   git checkout <previous-commit>
   npm install
   npm run build
   npm run preview
   ```

## Maintenance

### Regular Tasks
1. Update dependencies monthly
2. Check for security vulnerabilities: `npm audit`
3. Monitor build sizes
4. Review error logs
5. Update documentation

### Backup Strategy
- Code is backed up in Git
- Consider exporting Supabase data regularly
- Document environment configurations