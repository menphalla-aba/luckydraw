# Lucky Draw App

A minimal React + Vite app for party lucky draws. No backend, no database—everything runs in your browser!

## Features
- Admin page: upload Excel (.xlsx) or CSV with participants, validate, preview, save/clear list, search participants
- Draw page: rolling picker with countdown animation, winners list, undo winners, export winners to CSV, confetti popup
- Data stored in browser localStorage
- Modern UI with gradients, animations, and party-style effects

## Install & Run (Development)
```sh
npm install
npm run dev
```
Open http://localhost:5173

## Docker Deployment

### Option 1: Using Docker Compose (Recommended)
```sh
# Build and run
docker-compose up -d

# Access the app at http://localhost:8080
```

### Option 2: Using Docker directly
```sh
# Build the image
docker build -t luckydraw .

# Run the container
docker run -d -p 8080:80 --name luckydraw-app luckydraw

# Access the app at http://localhost:8080
```

### Docker Management
```sh
# Stop the container
docker-compose down
# or
docker stop luckydraw-app

# View logs
docker-compose logs -f
# or
docker logs -f luckydraw-app

# Rebuild after changes
docker-compose up -d --build
```

## File Upload Format
Upload a .xlsx or .csv file with two columns (header required):

| N   | Name        |
|-----|-------------|
| 1   | Alice Smith |
| 2   | Bob Lee     |

- N: required, integer, unique
- Name: required, not empty

## How Winners Are Stored/Exported
- Winners are saved in localStorage as an array of `{ n, name, pickedAt }`
- Use the "Export winners" button to download as CSV
- Use "Undo" button to remove mistaken winners
- Use "Clear winners" to reset all winners for testing

## Routes
- `/admin` — manage participants and search
- `/draw` — run the lucky draw with countdown

## Tech Stack
- React 19 + Vite
- React Router DOM
- SheetJS (xlsx) for Excel parsing
- Plain CSS with animations

---
Enjoy your party! 🎉

# luckydraw
