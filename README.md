This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Features

- 🎨 **Dark Mode Support** - Complete light/dark theme with system preference detection
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔐 **Authentication** - Secure login with Supabase integration
- 📊 **Dashboard** - Comprehensive asset management dashboard
- 🗺️ **Interactive Maps** - Location-based asset tracking
- 📈 **Charts & Analytics** - Visual data representation
- 🌍 **Regional Analytics** - Performance metrics and visualizations for regional centers (Headquarters, Bhopal, Indore, etc.)
- ✅ **Comprehensive Testing** - 130+ tests with 100% coverage on critical modules

### Dark Mode

The application supports three theme modes:
- **Light Mode** - Traditional light theme
- **Dark Mode** - Eye-friendly dark theme
- **System** - Automatically follows your OS theme preference

Toggle between themes using the theme switcher in the sidebar (desktop) or header (mobile).

See [DARK_MODE.md](./DARK_MODE.md) for detailed documentation.

### Regional Analytics

The application includes comprehensive regional analytics capabilities:
- **Multi-Center Visualization** - Compare performance across Headquarters, Bhopal, Indore, and other centers
- **Interactive Charts** - Radar, pie, bar, and line charts using ECharts
- **Detailed Breakdowns** - Asset distribution, staff allocation, project status, and performance trends
- **Export Functionality** - Download regional data as CSV
- **Click-Through Navigation** - Interactive charts with deep-linking to location details

Access Regional Analytics from the sidebar or visit `/regional-analytics`.

See [REGIONAL_ANALYTICS.md](./REGIONAL_ANALYTICS.md) for detailed documentation.

## Testing

The application includes comprehensive unit and integration tests:

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage report
bun run test:coverage

# Run tests for CI/CD
bun run test:ci
```

**Test Coverage:**
- ✅ 130 tests across 11 test suites
- ✅ 100% success rate
- ✅ Critical components and utilities fully covered
- ⚡ Fast execution (~2-5 seconds)

See [TEST_SUMMARY.md](./TEST_SUMMARY.md) and [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing documentation.

## Getting Started

This project uses [Bun](https://bun.sh) as the package manager and runtime. [Install Bun](https://bun.sh/docs/installation) if needed.

Install dependencies and run the development server:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
