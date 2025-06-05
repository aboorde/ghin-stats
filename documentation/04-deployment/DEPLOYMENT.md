# Deployment Guide for Golf Stats Dashboard

## Automatic Deployment to GitHub Pages

This project includes two GitHub Actions workflows for automatic deployment to GitHub Pages when you push to the `master` branch.

### Prerequisites

1. Your repository must be public OR you need GitHub Pro/Team/Enterprise for private repo GitHub Pages
2. You need to set up repository secrets for your environment variables

### Setup Instructions

#### 1. Initial Setup - Choose ONE method:

**Option A: Manual GitHub Pages Setup (Recommended for first time)**
1. Go to your repository on GitHub
2. Navigate to Settings → Pages
3. Under "Source", select "Deploy from a branch"
4. Select `gh-pages` branch and `/ (root)` folder
5. Click Save
6. Then use the `deploy-simple.yml` workflow

**Option B: Automatic Setup**
1. Just push to master with the `deploy.yml` workflow
2. If it fails the first time, go to Settings → Pages
3. Under "Source", select "GitHub Actions"
4. Push again or re-run the workflow

#### 2. Add Repository Secrets

1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

#### 3. Deployment Workflows

The project includes two GitHub Actions workflows:

**`deploy.yml`** - GitHub's official Pages method
- Requires GitHub Pages to be enabled with "GitHub Actions" as source
- More robust with deployment environments
- May fail on first run if Pages isn't enabled

**`deploy-simple.yml`** - Traditional gh-pages branch method  
- Works with "Deploy from a branch" source
- Creates/updates the `gh-pages` branch automatically
- More reliable for initial setup

#### 4. Trigger Deployment

After setup, deployment will happen automatically when you:
- Push to the `master` branch
- Manually trigger the workflow from the Actions tab

### Manual Deployment

If you prefer to deploy manually:

```bash
npm run deploy
```

This will build the project and push to the `gh-pages` branch.

### Troubleshooting

1. **"Get Pages site failed" error**: 
   - GitHub Pages isn't enabled yet
   - Go to Settings → Pages and enable it
   - For first deployment, use `deploy-simple.yml` workflow
   - Or manually run `npm run deploy` locally once

2. **404 errors on refresh**: The build script already handles this by copying `index.html` to `404.html`

3. **Blank page**: Check that the `base` in `vite.config.js` matches your repository name:
   ```js
   base: '/ghin-stats/'  // Replace with your repo name
   ```

4. **Build failures**: Check the Actions tab for error logs. Common issues:
   - Missing secrets
   - Node version mismatch
   - Dependency installation failures

5. **Permission errors**: Ensure the workflow has write permissions:
   - Go to Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"

### Monitoring Deployments

- Check the Actions tab to see deployment status
- View deployment history in the Environments section
- The site typically updates within 2-3 minutes after a successful deployment

### Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file to the `public` folder with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in repository settings

### Security Notes

- Never commit your `.env` file
- Use repository secrets for sensitive data
- The anonymous Supabase key is safe to expose in the built app
- For production, consider implementing Row Level Security (RLS) in Supabase