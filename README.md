# Cake API

A lightweight RESTful API for managing cakes. Built with Node.js, Express, and SQLite — provides simple JSON endpoints for CRUD operations.

## Features
- Create, read, update, and delete cakes
- SQLite persistence
- JSON request/response
- Small, easy-to-run codebase

## Quick start
1. Install dependencies:
    ```
    npm install express body-parser sqlite3
    ```
2. Create an empty SQLite file named `cakes.db` in the project root.
3. Create the `cakes` table:
    ```
    node ./table.js
    ```
4. Run the server:
    ```
    node ./app.js
    ```
5. Default API base:
    ```
    http://localhost:3000
    ```

## Endpoints (as implemented in `app.js`)
- `GET /cake` — list cakes
- `GET /cake/:id` — retrieve a cake by ID
- `POST /cake` — create a cake (JSON body example):

```json
{
  "name": "Strawberry Shortcake",
  "description": "A shortcake with strawberries on top",
  "flavor": "Strawberry",
  "price": 8.00,
  "is_available": true
}
```

- `PATCH /cake/:id` — update one or more fields of a cake (partial update)
- `DELETE /cake/:id` — delete a cake

## References

- [RESTful APIs in 100 Seconds — Build an API from Scratch with Node.js & Express (Fireship)](https://www.youtube.com/watch?v=-MTSQjw5DrM)  
    Quick overview of RESTful API concepts and a fast walkthrough building an Express API.
- [Build a Node.js + SQLite API (Byte Myke)](https://www.youtube.com/watch?v=mnH_1YGR2PM)  
    Step-by-step tutorial for creating a simple API backed by SQLite.