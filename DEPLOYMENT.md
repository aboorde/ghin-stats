# Deployment Guide for Golf Stats Dashboard

## Automatic Deployment to GitHub Pages

This project includes two GitHub Actions workflows for automatic deployment to GitHub Pages when you push to the `master` branch.

### Prerequisites

1. Your repository must be public OR you need GitHub Pro/Team/Enterprise for private repo GitHub Pages
2. GitHub Pages must be enabled in your repository settings
3. You need to set up repository secrets for your environment variables

### Setup Instructions

#### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to Settings → Pages
3. Under "Source", select "GitHub Actions" (not "Deploy from a branch")

#### 2. Add Repository Secrets

1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

#### 3. Deployment Workflow

The project includes a GitHub Actions workflow (`deploy.yml`) that:
- Uses GitHub's official Pages actions
- Builds the project with your environment variables
- Deploys to GitHub Pages automatically
- Creates deployment environments for better tracking

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

1. **404 errors on refresh**: The build script already handles this by copying `index.html` to `404.html`

2. **Blank page**: Check that the `base` in `vite.config.js` matches your repository name:
   ```js
   base: '/ghin-stats/'  // Replace with your repo name
   ```

3. **Build failures**: Check the Actions tab for error logs. Common issues:
   - Missing secrets
   - Node version mismatch
   - Dependency installation failures

4. **Permission errors**: Ensure the workflow has write permissions:
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