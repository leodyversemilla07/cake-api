# Cake API

Minimal REST API for managing cakes with Express and SQLite.

The service exposes JSON endpoints for creating, listing, searching, updating, and deleting cakes. Data is stored in a local `cakes.db` SQLite file.

## Stack

- Node.js 22+
- Express
- SQLite via Node's built-in `node:sqlite`
- Jest + Supertest

## Requirements

- Node.js 22 or newer
- npm

Node 22+ is required because this project uses the built-in `node:sqlite` module.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. (Optional) Configure environment variables:

```bash
cp .env.example .env
```

3. Start the API:

```bash
npm start
```

4. Open the API at:

```text
http://localhost:3000
```

The database file is created automatically on startup, and the `cakes` table is ensured automatically as well.

## Configuration

The app supports the following environment variables:

- `PORT` (default: `3000`) - HTTP server port
- `DB_PATH` (default: `./cakes.db`) - SQLite database file path

Examples:

```bash
PORT=4000 npm start
DB_PATH=./data/cakes.db npm start
```

## Available Scripts

```bash
npm start
```

Runs the API server on port `3000` by default.

```bash
npm test
```

Runs the test suite.

```bash
node table.js
```

Ensures the `cakes` table exists without starting the HTTP server.

## API Overview

Base URL:

```text
http://localhost:3000
```

All responses are JSON and generally follow this shape:

Successful response:

```json
{
  "status": 200,
  "success": true,
  "data": {}
}
```

Error response:

```json
{
  "status": 400,
  "success": false,
  "error": "Message here"
}
```

## Cake Model

Each cake record has the following fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Auto-generated primary key |
| `name` | string | Required, non-empty |
| `description` | string | Required, non-empty |
| `flavor` | string | Required, non-empty |
| `price` | number | Required, must be `>= 0` |
| `is_available` | boolean | Required |

## Endpoints

### Health Check

`GET /health`

Example response:

```json
{
  "status": 200,
  "success": true,
  "data": {
    "service": "cake-api",
    "uptime": 12.345
  }
}
```

### List All Cakes

`GET /cake`

Example response:

```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Chocolate Cake",
      "description": "Rich and moist",
      "flavor": "Chocolate",
      "price": 20,
      "is_available": true
    }
  ]
}
```

Returns an empty array when no cakes exist.

### Get Cake by ID

`GET /cake/:id`

Example:

```bash
curl http://localhost:3000/cake/1
```

If the ID is invalid, the API returns `400`.

If no cake exists for that ID, the API returns `404`.

### Search Cakes

`GET /cake/search?q=<term>`

Searches across `name`, `flavor`, and `description`.

Example:

```bash
curl "http://localhost:3000/cake/search?q=chocolate"
```

If `q` is missing or blank, the API returns `400`.

If nothing matches, the API returns `200` with `data: []`.

### Create Cake

`POST /cake`

Example request:

```bash
curl -X POST http://localhost:3000/cake \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Strawberry Shortcake\",\"description\":\"A soft sponge cake with fresh strawberries\",\"flavor\":\"Strawberry\",\"price\":8,\"is_available\":true}"
```

Example body:

```json
{
  "name": "Strawberry Shortcake",
  "description": "A soft sponge cake with fresh strawberries",
  "flavor": "Strawberry",
  "price": 8,
  "is_available": true
}
```

Returns `201` with the created record.

### Update Cake

`PATCH /cake/:id`

Supports partial updates. Send one or more valid fields.

Example request:

```bash
curl -X PATCH http://localhost:3000/cake/1 \
  -H "Content-Type: application/json" \
  -d "{\"price\":9.5,\"is_available\":false}"
```

If the request body contains no valid updatable fields, the API returns `400`.

If the cake does not exist, the API returns `404`.

### Delete Cake

`DELETE /cake/:id`

Example request:

```bash
curl -X DELETE http://localhost:3000/cake/1
```

Example response:

```json
{
  "status": 200,
  "success": true,
  "data": {
    "id": 1
  }
}
```

## Validation Rules

- `id` must be a positive integer.
- `name`, `description`, and `flavor` must be non-empty strings.
- `price` must be a non-negative number.
- `is_available` must be a boolean.
- `POST /cake` requires all cake fields.
- `PATCH /cake/:id` requires at least one valid field.

## Project Structure

```text
.
|-- app.js
|-- db.js
|-- table.js
|-- controllers/
|   `-- cakes.controller.js
|-- routes/
|   `-- cakes.routes.js
`-- tests/
    `-- cakes.test.js
```

## Notes

- The SQLite database file is `cakes.db`.
- Unknown routes return a JSON `404` response.
- The API uses `express.json()` for request parsing.
