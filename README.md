# University Research Opportunity Portal

This is my Assignment 1 for the CN course (BS AI 5A, Fall 2026, FAST NUCES Peshawar).
It is a web app where faculty can post and manage research opportunities. It has a
Node.js/Express backend, a MySQL database and a simple HTML/CSS/JS frontend.

**Name:** Inamullah
**Roll No:** 24p-0009
**Class:** BAI-5A

**GitHub Repository:** https://github.com/Inamullah27162/research-opportunity-portal

## What it does

- Add a new research opportunity
- Show all opportunities in a table
- View full details of one opportunity
- Edit an opportunity
- Close an opportunity (Open to Closed)
- Delete an opportunity
- Validation on the form and on the backend, with success and error messages

## Technologies used

- Backend: Node.js, Express
- Database: MySQL
- Frontend: HTML, CSS, JavaScript
- API testing: Postman

## Folder structure

- `backend/` - server code (server.js, db.js, routes)
- `frontend/` - index.html, style.css, app.js
- `database/` - schema.sql
- `postman/` - exported Postman collection

## How to run

1. Install Node.js and MySQL on your computer.

2. Clone the repo:
   ```
   git clone https://github.com/Inamullah27162/research-opportunity-portal.git
   cd research-opportunity-portal
   ```

3. Open MySQL Workbench, open `database/schema.sql` and run it. This creates the
   `research_portal` database and the `opportunities` table.

4. Go to the `backend` folder and make a `.env` file. You can copy `.env.example`
   and put your own MySQL password in it:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=research_portal
   PORT=3000
   ```

5. Install packages and start the server:
   ```
   cd backend
   npm install
   node server.js
   ```
   It should print `Server running on http://localhost:3000`.

6. Open `frontend/index.html` in the browser (or use Live Server in VS Code).
   The backend should be running or the page will not show any data.

## API endpoints

Base URL is `http://localhost:3000/api/opportunities`

- `POST /api/opportunities` - create a new opportunity (201)
- `GET /api/opportunities` - get all opportunities (200)
- `GET /api/opportunities/:id` - get one opportunity (200)
- `PUT /api/opportunities/:id` - update an opportunity (200)
- `DELETE /api/opportunities/:id` - delete an opportunity (200)

Other status codes used: 400 for invalid or missing data, 404 when the opportunity
is not found, and 500 for server errors.

Each opportunity has: id, title, description, research_area, faculty_name,
department, required_skills, positions, deadline (YYYY-MM-DD) and status
(Open or Closed).

Example body for POST:
```json
{
  "title": "AI for Crop Disease Detection",
  "description": "Build a deep learning model to detect diseases in crop leaf images.",
  "research_area": "Artificial Intelligence",
  "faculty_name": "Dr. Ahmed Khan",
  "department": "Computer Science",
  "required_skills": "Python, PyTorch, Image Processing",
  "positions": 3,
  "deadline": "2026-12-31",
  "status": "Open"
}
```

For PUT you can send only the fields you want to change, for example
`{ "status": "Closed" }` to close an opportunity.

## Testing with Postman

The collection is in `postman/collection.json`. Import it in Postman and run the
requests in order. The requests that use an ID in the URL (get one, update, close,
delete) need the ID of an opportunity that exists in your database, so change the
number in the URL if needed.

## Note

No data is hard-coded in the frontend, everything comes from the database through
the API. The `.env` file is not uploaded to GitHub.