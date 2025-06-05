# Scratch Pad - Golf Stats Dashboard

A React + Tailwind CSS application for visualizing golf performance data from Supabase.

## Features

- **Round by Round View**: Browse all rounds with filtering and sorting
- **Hole by Hole View**: Detailed scorecard for each round
- **Course Summary**: Performance statistics by course
- **Year by Year Analysis**: Trends and patterns over time
- **Pine Valley Analysis**: Deep dive into Pine Valley CC performance
- **Dark Theme**: Golf-themed dark mode design
- **Mobile Responsive**: Optimized for all device sizes

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and add your Supabase credentials
3. Install dependencies: `npm install`
4. Run locally: `npm run dev`

## Deployment

### Automatic Deployment (GitHub Actions)

This project includes GitHub Actions workflows for automatic deployment to GitHub Pages when you push to `master`.

**Quick Setup:**
1. Enable GitHub Pages in repository settings (source: GitHub Actions)
2. Add repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push to `master` branch

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Manual Deployment

```bash
npm run deploy
```

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview  # Preview production build locally
```

## Tech Stack

- React 19 + Vite
- Tailwind CSS 4
- Supabase (PostgreSQL)
- Recharts for data visualization
- GitHub Pages for hosting

## Documentation

For comprehensive documentation, see the [Documentation Index](./documentation/INDEX.md)
