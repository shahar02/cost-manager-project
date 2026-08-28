# Cost Manager - RESTful Web Services

Final project for the Asynchronous Server-Side Development course.
Implemented as **4 separate Express.js microservices**, each connecting
to the same MongoDB Atlas database.

## Services

| Service | Default Port | Endpoints |
|---|---|---|
| `logs-service` | 3001 | `GET /api/logs` |
| `users-service` | 3002 | `POST /api/add`, `GET /api/users`, `GET /api/users/:id` |
| `costs-service` | 3003 | `POST /api/add`, `GET /api/report` |
| `about-service` | 3004 | `GET /api/about` |

## Setup (per service)

1. `cd <service-folder>`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your real `MONGO_URI`
   (all 4 services should point to the **same** Atlas database/cluster).
   For `about-service`, also fill in `TEAM_MEMBER_n_FIRST_NAME` /
   `TEAM_MEMBER_n_LAST_NAME` for every team member.
4. `npm start` (or `npm run dev` to auto-restart on changes)
5. `npm test` runs that service's Jest + Supertest unit tests against
   an in-memory MongoDB instance (no need for a real DB connection to
   run the tests).

## Shared design notes

- **`models/`** in each service holds the Mongoose schemas
  (`User.model.js`, `Cost.model.js`, `Log.model.js`, `Report.model.js`).
  `Report.model.js` exists only to support the Computed Design Pattern
  used by the monthly report endpoint (see `costs-service`).
- **`middleware/requestLogger.js`** writes a log entry to the `logs`
  collection for every HTTP request received by any of the 4 services.
- **`middleware/errorHandler.js`** guarantees every error response is a
  JSON document with (at least) `id` and `message`.
- **Computed Design Pattern**: implemented in
  `costs-service/controllers/report.controller.js`. Reports requested
  for a month that has already fully passed are computed once and then
  cached in the `reports` collection; later requests for the same
  (userid, year, month) are served from that cache instead of being
  recomputed. Current/future months are always computed fresh.

## Before submission

- Empty the database except for a single dummy user:
  `{ id: 123123, first_name: "mosh", last_name: "israeli" }`.
- Deploy all 4 services and fill in their URLs in the submission form.
- Run the provided Python test script against the 4 deployed URLs.
