[English](./README.md) | [Українська](./README.uk.md)

# Flappy Bird Clone 🐦

A modern, full-stack web clone of the classic Flappy Bird game. Built with Next.js, this project features a clean user interface, smooth animations, user authentication, and a global leaderboard to track high scores. The goal was to recreate the nostalgic gameplay experience using a modern tech stack.

This project is presented in both English and Ukrainian.

## Demo

👉[View the live version](https://flappy.niaros.dev/)

## Features

- **User Authentication**: Secure sign-in with Google or GitHub via Auth.js to save progress and scores.
- **Global Leaderboard**: Compete with other players and see your rank on the global high-score table.
- **Persistent High Scores**: Your personal best score is saved to your user profile.
- **Classic Gameplay**: Familiar "tap to fly" mechanics, faithfully recreated in the browser.
- **Internationalization (i18n)**: Full support for English and Ukrainian languages using `next-intl`.
- **Dark/Light Mode**: The theme automatically adapts to your system preferences and can be toggled manually in the settings.
- **Responsive Design**: A seamless gaming experience on desktop, tablet, and mobile devices.
- **Fluid Animations**: User interface transitions are powered by Framer Motion for a modern and polished feel.

## Technologies Used

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Authentication**: [Auth.js](https://auth.js/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Motion](https://www.motion.dev/)
- **Internationalization**: [next-intl](https://next-intl.dev/)
- **Icons**: [Phosphor Icons](https://phosphoricons.com/)
- **Language**: JavaScript

## Project Structure

The project follows a feature-rich structure within the `src` directory, leveraging the Next.js App Router for clear separation of concerns.

```
src/
├── 📁 app/              # Routing, server components, and API endpoints
│   ├── 📁 api/          # API routes for authentication and scores
│   ├── 📁 game/        # Main game page route
│   ├── 📁 leaders/     # Leaderboard page route
│   ├── 📁 settings/    # Settings page route
│   ├── 📄 layout.js     # Root application layout
│   └── 📄 page.js      # Home page (landing)
├── 📁 components/      # Reusable React components
│   ├── 📁 game/        # Game-specific components (Bird, Pipe)
│   ├── 📁 ui/          # Generic UI elements (Button, Modal, Switchers)
│   └── 📄 *Client.js  # Client-side wrappers for pages
├── 📁 context/         # React Context for global state (Game, Theme)
├── 📁 hooks/           # Custom React hooks for complex logic
├── 📁 i18n/            # Configuration for internationalization
├── 📁 lib/             # Core library functions (Prisma client)
└── 📄 auth.js          # NextAuth.js server-side configuration
```
