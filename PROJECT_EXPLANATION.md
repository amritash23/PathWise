# PathWise Project Explanation

## 1. Project Overview

PathWise is an AI-based academic and career recommendation system. The goal of the project is to help a user understand which career paths match their current skills, interests, and goals, then guide them with skill gaps, recommended learning steps, and roadmaps.

In simple terms, the application works like this:

1. A user creates an account or logs in.
2. The user fills in a profile with skills, interests, and optional career goals.
3. The user can upload a PDF resume so the system can extract matching skills and interests.
4. The backend fetches the user's profile and the available career dataset from MongoDB.
5. The backend sends that data to a separate AI/recommendation microservice.
6. The AI engine scores each career using similarity, skill match, and interest match.
7. The frontend displays ranked career recommendations, match percentages, skill gaps, score breakdown charts, and roadmaps.
8. Users can save roadmap progress and submit feedback.
9. Admin users can manage career domains.

The project is organized as a monorepo with four main parts:

```text
PathWise/
  frontend/    Next.js user interface
  backend/     Express API and business logic
  ai-engine/   Recommendation scoring microservice
  database/    MongoDB Docker setup and seed data
```

## 2. High-Level Architecture

The system uses a three-service architecture:

```text
Browser / Next.js frontend
        |
        | HTTP requests with credentials/cookies
        v
Express backend API
        |
        | MongoDB queries
        v
MongoDB database

Express backend API
        |
        | POST /recommend
        v
AI engine microservice
```

The frontend never talks directly to MongoDB or the AI engine. It only talks to the backend. The backend is the central layer that handles authentication, validation, database operations, and calls to the AI engine.

## 3. Tech Stack

### Frontend

The frontend is built with:

- Next.js 16.1.7
- React 19.2.3
- TypeScript
- Tailwind CSS 4
- ShadCN-style custom UI components
- Recharts for charts and data visualization
- Framer Motion for animation support
- Lucide React for icons
- React Hook Form for forms
- Zod for form validation
- next-themes for theme support

Important frontend files:

- `frontend/src/app/page.tsx`: Landing page.
- `frontend/src/app/auth/auth-client.tsx`: Login, signup, and OTP authentication UI.
- `frontend/src/app/(app)/dashboard/page.tsx`: User dashboard.
- `frontend/src/app/(app)/profile/page.tsx`: Profile setup and resume upload.
- `frontend/src/app/(app)/recommendations/page.tsx`: Career recommendation results and charts.
- `frontend/src/app/(app)/roadmap/[careerId]/page.tsx`: Career roadmap and progress tracking.
- `frontend/src/app/(app)/assessment/page.tsx`: Assessment UI.
- `frontend/src/app/admin/dashboard/page.tsx`: Admin career management UI.
- `frontend/src/lib/api.ts`: Central API client used by the frontend.

### Backend

The backend is built with:

- Node.js
- Express 5.2.1
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- HTTP-only cookies
- bcrypt for password hashing
- Zod for request validation
- Helmet for security headers
- CORS for frontend/backend communication
- express-rate-limit for request rate limiting
- Morgan for HTTP request logging
- Multer for file upload handling
- pdf-parse for PDF resume parsing
- Nodemailer for optional OTP delivery through SMTP

Important backend files:

- `backend/src/index.ts`: Starts the backend server and connects to MongoDB.
- `backend/src/server.ts`: Creates the Express app and registers middleware/routes.
- `backend/src/config/env.ts`: Validates environment variables using Zod.
- `backend/src/db.ts`: Connects to MongoDB.
- `backend/src/routes/auth.routes.ts`: Signup, login, logout, OTP, and session routes.
- `backend/src/routes/profile.routes.ts`: Create/update and fetch user profile.
- `backend/src/routes/recommend.routes.ts`: Calls the AI engine to generate recommendations.
- `backend/src/routes/resume.routes.ts`: Parses uploaded PDF resumes.
- `backend/src/routes/roadmap.routes.ts`: Builds roadmap levels and saves progress.
- `backend/src/routes/feedback.routes.ts`: Stores user feedback.
- `backend/src/routes/admin.routes.ts`: Admin career management.
- `backend/src/models/*.ts`: Mongoose database models.

### AI Engine

The AI engine is a separate Express microservice written in TypeScript.

It uses:

- Node.js
- Express
- TypeScript
- Zod
- CORS
- Custom recommendation logic
- Cosine similarity
- Weighted scoring

Important AI engine files:

- `ai-engine/src/index.ts`: Starts the AI engine server and exposes `/recommend`.
- `ai-engine/src/recommendation/recommend.ts`: Main recommendation algorithm.
- `ai-engine/src/recommendation/vectorize.ts`: Converts profile and career data into vectors.
- `ai-engine/src/recommendation/cosine.ts`: Calculates cosine similarity.
- `ai-engine/src/recommendation/normalize.ts`: Normalizes skills/interests for matching.
- `ai-engine/src/recommendation/types.ts`: Shared recommendation types.

This AI engine is explainable and rule-based. It does not currently call an external LLM or train a machine learning model. The "AI" behavior comes from vectorization, cosine similarity, weighted scoring, and explainable matching logic.

### Database

The database layer uses:

- MongoDB 7
- Mongoose ODM
- Docker Compose for local MongoDB
- mongo-express for database inspection
- Seed JSON data for careers

Important database files:

- `database/docker-compose.yml`: Starts MongoDB and mongo-express.
- `database/seed/careers.json`: Initial career dataset.
- `backend/src/scripts/seed.ts`: Loads seed career data into MongoDB and optionally creates an admin user.

## 4. Main Features

### Authentication

Users can sign up, log in, log out, and check their session.

Backend routes:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/auth/me`

Passwords are hashed using bcrypt before being stored. After login/signup, the backend creates a JWT and stores it in an HTTP-only cookie. This is safer than storing tokens in localStorage because JavaScript running in the browser cannot directly read HTTP-only cookies.

The backend also supports OTP-based signup/login:

- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`

In development, the OTP can be returned as `devOtp`. In production, OTP delivery can be configured through SMTP using Nodemailer.

### User Profile

Each user can create one profile containing:

- Skills
- Interests
- Optional career goals

Backend routes:

- `GET /api/profile`
- `POST /api/profile`

The profile is important because it becomes the input for the recommendation engine.

### Resume Parsing

The profile page allows the user to upload a PDF resume. The backend parses the PDF text and tries to detect known skills and interests.

Backend route:

- `POST /api/resume/parse`

How it works:

1. The frontend uploads a PDF using `FormData`.
2. The backend uses Multer with memory storage.
3. The backend checks that the file is a PDF.
4. `pdf-parse` extracts text from the file.
5. The backend compares the resume text against skill and interest suggestions sent by the frontend.
6. Matching skills/interests are returned to the frontend.
7. The user can autofill their profile using the extracted data.

This is a practical resume analyzer, but it is based on keyword matching rather than a full NLP model.

### Career Recommendations

This is the core feature of PathWise.

Frontend call:

- `api.recommend()`

Backend route:

- `POST /api/recommend`

AI engine route:

- `POST /recommend`

Flow:

1. The user clicks refresh or opens recommendations/dashboard.
2. The frontend calls the backend `/api/recommend`.
3. The backend checks authentication.
4. The backend loads the user's profile from MongoDB.
5. The backend loads all careers from MongoDB.
6. The backend sends profile + careers to the AI engine.
7. The AI engine scores each career.
8. The backend returns the AI engine result to the frontend.
9. The frontend displays charts, skill gaps, roadmap preview, and feedback controls.

### Recommendation Algorithm

The recommendation engine uses three main signals:

1. Similarity score
2. Skills match score
3. Interest match score

The final score is calculated as:

```text
finalScore = 0.5 * similarity + 0.3 * skillsMatch + 0.2 * interestMatch
```

Then:

```text
matchPercent = round(finalScore * 100)
```

#### Similarity

The engine builds a vocabulary from:

- User skills
- User interests
- Career required skills
- Career interests
- Career academic strengths

Then it converts both the user profile and each career into vectors.

Profile vector weights:

- Skills: 1.0
- Interests: 0.8

Career vector weights:

- Required skills: 1.0
- Interests: 0.8
- Academic strengths: 0.6

The engine then uses cosine similarity to compare the user's vector with each career's vector.

#### Skills Match

Skills match checks how many required career skills are already present in the user's profile.

Example:

```text
User skills: Python, SQL
Career required skills: Python, SQL, Statistics, Pandas
Skills match = 2 / 4 = 0.5
```

#### Interest Match

Interest match works similarly, but compares user interests with career interests.

#### Skill Gap

The AI engine also calculates missing skills:

```text
requiredSkillsGap = required career skills not found in user profile skills
```

These gaps are shown to the user as focus areas.

#### Explainability

The recommendation output includes:

- Career ID
- Career name
- Final score
- Similarity score
- Skill match score
- Interest match score
- Match percentage
- Required skill gaps
- Roadmap steps
- Matched skills
- Matched interests

This makes the recommendation explainable. The user can see why a career was recommended, not just the final result.

### Roadmap Generation

The roadmap feature creates a structured learning path for a selected career.

Backend routes:

- `GET /api/roadmap/:careerId`
- `POST /api/roadmap/:careerId/progress`

How it works:

1. The backend loads the career.
2. It loads the user's profile.
3. It compares the user's skills with the career's required skills.
4. Missing skills are split into Beginner, Intermediate, and Advanced levels.
5. The route adds recommended courses, certifications, and project ideas.
6. The frontend displays the roadmap as a timeline.
7. The user can check off completed steps.
8. Progress is stored in MongoDB.

Roadmap steps can have these types:

- skill
- course
- project
- certification

### Feedback

Users can submit feedback for a recommendation.

Backend route:

- `POST /api/feedback`

Stored feedback includes:

- User ID
- Optional career ID
- Rating from 1 to 5
- Optional comments

This data could later be used to improve recommendations, although the current recommendation algorithm does not yet use feedback as an input.

### Admin Panel

Admin users can manage career data.

Backend routes:

- `GET /api/admin/careers`
- `POST /api/admin/careers`
- `PUT /api/admin/careers/:id`

The admin route is protected by:

1. `requireAuth`
2. `requireAdmin`

Only users with role `admin` can access these routes.

The admin dashboard currently supports viewing careers and adding a basic career with name, description, and required skills.

### Assessment Feature

The frontend includes an assessment page that expects:

- `POST /api/tests/start`
- `POST /api/tests/:attemptId/submit`
- `GET /api/tests/history`

The backend also has:

- `backend/src/models/TestAttempt.ts`
- `backend/src/services/mcqBank.ts`

These files define test attempt data and MCQ generation logic.

Important current implementation note: `backend/src/routes/test.routes.ts` currently only exposes a simple `GET /api/tests` route that returns a "Test route working" message. The frontend assessment page is more advanced than the current backend route implementation. To make assessments fully functional, the backend needs routes for starting a test, submitting answers, calculating score, saving attempts, and returning history.

## 5. Database Models

### User

Stores authentication and role information.

Fields:

- name
- email
- passwordHash
- role: `user` or `admin`
- timestamps

### Profile

Stores user preference data used for recommendations.

Fields:

- userId
- academics
- skills
- interests
- careerGoals
- timestamps

Note: The profile model still contains `academics`, but the current profile UI and recommendation algorithm mainly use skills and interests.

### Career

Stores career domain information.

Fields:

- name
- description
- requiredSkills
- interests
- academicStrengths
- recommendedCourses
- recommendedCertifications
- timestamps

Seed careers currently include:

- Data Science & Analytics
- Full-Stack Web Development
- Cybersecurity
- UI/UX Design
- Cloud & DevOps

### Feedback

Stores user feedback on recommendations.

Fields:

- userId
- careerId
- rating
- comments
- timestamps

### RoadmapProgress

Stores progress for a user on a specific career roadmap.

Fields:

- userId
- careerId
- completedStepIds
- timestamps

It also has a unique index on `{ userId, careerId }`, so each user has only one progress record per career.

### Otp

Stores temporary OTP data for signup/login.

Fields include:

- email
- purpose
- codeHash
- attempts
- expiresAt
- optional payload for signup

### TestAttempt

Defines assessment attempt storage.

Fields:

- userId
- type
- difficulty
- skills
- questions
- answers
- score
- passed
- improvementTopics
- timestamps

As noted above, the model exists, but full assessment routes are not currently implemented.

## 6. Frontend User Flow

### Landing Page

The landing page introduces PathWise and checks whether the user already has an active session. If authenticated, the button goes to the dashboard. Otherwise, it goes to the auth page.

### Auth Page

The auth page supports:

- Login
- Signup
- OTP login
- OTP signup

After successful authentication, the user is redirected to the requested page or dashboard.

### Auth Guard

Protected app pages are wrapped in `AuthGuard`. It calls `/api/auth/session`. If the user is not authenticated, they are redirected to `/auth`.

### Dashboard

The dashboard loads:

- User profile
- Recommendations

It displays:

- Top career match
- Similarity, skills, and interests metrics
- Profile snapshot
- Suggested next actions

### Profile Page

The profile page allows users to:

- Upload a PDF resume
- Extract skills and interests
- Select skills using a multi-select component
- Select interests using a multi-select component
- Add optional career goals
- Save the profile

### Recommendations Page

The recommendations page displays:

- Bar chart comparing career match percentages
- Radar chart for the top recommendation
- Donut chart showing score breakdown
- Skill gap visualization
- Full recommendation cards
- Matched skills
- Missing skills
- Matched interests
- Roadmap preview
- Feedback form

### Roadmap Page

The roadmap page displays a timeline with beginner, intermediate, and advanced steps. The user can check off completed steps, and progress is saved to the backend.

### Admin Dashboard

The admin dashboard allows admin users to view careers and add a basic career. Admin-only access is enforced both on the frontend and backend.

## 7. Backend Middleware and Security

The backend uses several security and reliability layers:

- `helmet()` adds security-related HTTP headers.
- `cors()` restricts frontend origin and allows credentials.
- `express.json({ limit: "1mb" })` limits JSON body size.
- `cookieParser()` reads auth cookies.
- `morgan()` logs HTTP requests.
- `express-rate-limit` limits requests to 120 per minute.
- `requireAuth` verifies JWT from the HTTP-only cookie.
- `requireAdmin` checks the authenticated user's role.
- `errorHandler` centralizes validation and API errors.
- Zod validates request bodies and environment variables.

## 8. Environment Variables

### Backend

The backend expects:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `COOKIE_NAME`
- `COOKIE_SECURE`
- `COOKIE_SAME_SITE`
- `FRONTEND_ORIGIN`
- `AI_ENGINE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `OTP_TTL_MINUTES`
- `OTP_MAX_ATTEMPTS`
- `OTP_DELIVERY`
- SMTP values if OTP delivery uses email

### AI Engine

The AI engine expects:

- `PORT`
- `NODE_ENV`
- `BACKEND_ORIGIN`

### Frontend

The frontend uses:

- `NEXT_PUBLIC_API_BASE_URL`

If not set, it defaults to:

```text
http://localhost:5000
```

## 9. Local Development

Start MongoDB:

```bash
docker compose -f database/docker-compose.yml up -d
```

Seed careers and optional admin:

```bash
npm run seed
```

Run all services:

```bash
npm run dev
```

This starts:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- AI engine: `http://localhost:7000`
- mongo-express: `http://localhost:8081`

The root `package.json` uses `concurrently` to run frontend, backend, and AI engine together.

## 10. How to Explain This Project in a Presentation

You can explain it like this:

"PathWise is a full-stack AI-based career recommendation platform. It helps users discover suitable career paths based on their skills, interests, and goals. The system has a Next.js frontend, an Express backend, MongoDB for storage, and a separate recommendation microservice. The user creates a profile or uploads a resume, and the backend sends that information along with career data to the AI engine. The AI engine uses vectorization, cosine similarity, and weighted scoring to rank careers. The user then receives explainable recommendations, skill gaps, learning roadmaps, and progress tracking."

Then explain the architecture:

"We separated the system into frontend, backend, AI engine, and database. The frontend handles the user experience. The backend handles authentication, validation, database access, and APIs. The AI engine is isolated as a microservice so recommendation logic can evolve independently. MongoDB stores users, profiles, careers, feedback, OTPs, and roadmap progress."

Then explain the algorithm:

"For recommendations, the system converts user skills/interests and career requirements into vectors. It calculates cosine similarity between the user profile and each career. It also calculates direct skill match and interest match. The final score is 50 percent similarity, 30 percent skill match, and 20 percent interest match. This produces a ranked list of careers and clear explanations such as matched skills, matched interests, and missing skills."

Then explain why the project is useful:

"The main value of PathWise is that it does not only say which career is suitable. It also explains why, shows what skills are missing, and gives a roadmap to improve. This turns career recommendation into an actionable learning plan."

## 11. Current Limitations and Future Improvements

Current limitations:

- The AI engine is explainable and useful, but it is not using a trained ML model or external LLM.
- Resume parsing is based mostly on PDF text extraction and keyword matching.
- The frontend assessment page expects full test APIs, but the backend test routes are not fully implemented yet.
- Feedback is stored but not yet used to improve the scoring algorithm.
- Academic data exists in some models/seed data, but the current recommendation flow is mainly skill and interest based.

Future improvements:

- Complete assessment backend routes.
- Use feedback to personalize future recommendations.
- Add stronger NLP for resume parsing.
- Add more career domains and richer seed data.
- Add admin editing UI for full career details, not only basic creation.
- Add analytics for recommendation performance.
- Add deployment configuration for cloud hosting.

## 12. Short Summary

PathWise is a full-stack career guidance platform built with Next.js, React, TypeScript, Tailwind CSS, Node.js, Express, MongoDB, and a separate TypeScript AI engine. It authenticates users, stores profiles, parses resumes, generates explainable career recommendations, shows skill gaps, creates learning roadmaps, tracks progress, collects feedback, and provides admin career management.

The core intelligence is an explainable recommendation algorithm based on vectorization, cosine similarity, skill matching, and interest matching.
