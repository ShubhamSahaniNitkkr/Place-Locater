# Place Locater

> Pin, search, and share locations on an interactive map — like WhatsApp live location.

![Screenshot](./screenshot.png)
> Add `screenshot.png` in project root for preview.

## Purpose

Find and save places on a map with address autocomplete, map tap-to-pin, current location, and shareable links.

## Features

- Address search with autocomplete (OpenStreetMap Nominatim)
- Tap the map to drop a draggable pin
- **Use my location** for GPS pinning
- **Share location** — copy or native share (WhatsApp, etc.)
- Shared links open the map centered on the pin (`?lat=&lng=&place=&address=`)

## Use Cases

- Map-based store / place finder
- Share a meeting point via link
- Geospatial store data with MongoDB

## Tech Stack

- Node.js
- Express
- MongoDB
- Leaflet + OpenStreetMap
- Nominatim geocoding (client) + node-geocoder (server)

## How to Run Locally

```bash
npm install && npm run demo
```

Open [http://localhost:5000](http://localhost:5000)

## Live Demo

[Portfolio demo](https://shubhamsahaniNitkkr.github.io/old-basic-projects/projects/Place-Locater/)

> **Note:** Static preview supports search, map pins, and shared links. Run `npm run demo` locally to persist new places.

## Performance & UI

- Mobile-responsive layout
- Optimized static assets where applicable
- Runs independently from the portfolio hub

---

Part of [Old Basic Projects](../README.md) portfolio.
