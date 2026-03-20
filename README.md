# React Calendar

A personal calendar app built with React, TypeScript and Vite. Basically a spin-off of Google Calendar, just wanted to limit test and see how hard it would be to make one, especially with the help of AI. _GPT-5.3 Codex_ helped make this happen in a very short amount of time.

## Features

- Create, edit, and delete calendar events
- Multiple timeline views: `1`, `3`, `5`, `7`, and `14` days
- Week mode (`7` days) starts on Monday
- Compact day headers in `14`-day mode (`dd/mm`)
- Event quick preview modal with event details and actions
- Drag and drop events to move them to a new day/time
- Live drop preview while dragging, with 15-minute snapping
- Current-time indicator on today
- Event data persisted in browser `localStorage`

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Start development server

```bash
npm run dev
```

Open the local URL shown in the terminal.

## Available scripts

- `npm run dev` - run the app in development mode
- `npm run build` - type-check and build production assets
- `npm run preview` - preview the production build locally
- `npm run lint` - run lint checks

## Data persistence

- Events are stored in `localStorage` under `calendar-events`.
- Date/view selections are stored in `sessionStorage`.

## Notes

- The app currently uses browser-only storage (no backend/database).
- Clearing browser storage will remove saved events and preferences.
