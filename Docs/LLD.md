# Low-Level Design (LLD)
## Project Name: SereneMind
### Document Version: 1.0.0
### Date: May 22, 2026

---

## 1. Document Overview

### 1.1 Purpose
This Low-Level Design (LLD) document describes the detailed software components, PostgreSQL schema definitions, REST API endpoint signatures, and algorithms implemented in **SereneMind**. It provides the concrete technical specifications required to maintain and expand the codebase.

---

## 2. Database Schema Design (PostgreSQL)

The database schema `serenemind` contains 9 tables configured in `server/migrations/001_init.sql`.

### 2.1 Table: `users`
Stores user authentication details and identifiers.
- **Fields**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `email`: `VARCHAR(255) UNIQUE NOT NULL`
  - `password_hash`: `VARCHAR(255) NOT NULL`
  - `display_name`: `VARCHAR(100) NOT NULL DEFAULT ''`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Triggers**: `update_users_updated_at` runs `update_updated_at_column()` on `UPDATE`.

### 2.2 Table: `mascots`
Stores adopted companions.
- **Fields**:
  - `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE`
  - `name`: `VARCHAR(100) NOT NULL DEFAULT 'Sparky'`
  - `egg_type`: `VARCHAR(100) NOT NULL DEFAULT 'Moss Sage Egg'`
  - `personality`: `VARCHAR(100) NOT NULL DEFAULT 'Calming & Stoic'`
  - `level`: `INTEGER NOT NULL DEFAULT 1`
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### 2.3 Table: `user_personas`
Stores clinical diagnostic profiles for personalization.
- **Fields**:
  - `id`: `UUID PRIMARY KEY`
  - `user_id`: `UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE`
  - `age`: `INTEGER`
  - `occupation`: `VARCHAR(200)`
  - `sleep_hours`: `VARCHAR(50) NOT NULL DEFAULT '7-8 hours'`
  - `stress_level`: `INTEGER CHECK (stress_level BETWEEN 1 AND 10)`
  - `self_care_scale`: `INTEGER CHECK (self_care_scale BETWEEN 1 AND 10)`
  - `mental_goal`: `VARCHAR(200) DEFAULT 'Achieve Calmer Baselines'`
  - `triggers`: `JSONB NOT NULL DEFAULT '[]'`

### 2.4 Table: `wellness_logs`
Unified logging hub for aggregation in the History page timeline.
- **Fields**:
  - `id`: `UUID PRIMARY KEY`
  - `user_id`: `UUID REFERENCES users(id) ON DELETE CASCADE`
  - `type`: `VARCHAR(20) CHECK (type IN ('chat', 'journal', 'exercise', 'mood'))`
  - `title`: `VARCHAR(300) NOT NULL`
  - `preview`: `TEXT NOT NULL DEFAULT ''`
  - `sentiment`: `VARCHAR(50) NOT NULL DEFAULT 'Neutral'`
  - `ref_id`: `UUID` (Reference to source table e.g. `journals.id`)
  - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- **Indexes**: `idx_wellness_logs_user` on `(user_id, created_at DESC)`.

### 2.5 Other Tables
- `journals`: `id` (PK), `user_id` (FK), `title`, `body`, `sentiment`, `created_at`, `updated_at`.
- `mood_logs`: `id` (PK), `user_id` (FK), `mood`, `score` (1-10), `notes`, `created_at`.
- `chat_messages`: `id` (PK), `user_id` (FK), `session_id`, `sender` ('user' or 'sparky'), `text`, `created_at`. Indexed on `session_id` and `(user_id, created_at DESC)`.
- `exercise_logs`: `id` (PK), `user_id` (FK), `exercise_id`, `exercise_title`, `category`, `duration_secs`, `created_at`.
- `mood_calendar`: `id` (PK), `user_id` (FK), `day`, `month`, `year`, `mood`, `note`, `updated_at`. Unique key constraint on `(user_id, day, month, year)`.

---

## 3. Detailed API Endpoint Specifications

All endpoints (except auth routes) require a JWT Bearer token: `Authorization: Bearer <token>`.

### 3.1 Authentication Route (`/api/auth`)
- **`POST /api/auth/register`**:
  - Request: `{ "email": "...", "password": "...", "displayName": "..." }`
  - Response (201): `{ "token": "...", "user": { "id": "...", "email": "...", "displayName": "..." } }`
- **`POST /api/auth/login`**:
  - Request: `{ "email": "...", "password": "..." }`
  - Response (200): `{ "token": "...", "user": { "id": "...", "email": "...", "displayName": "..." } }`

### 3.2 Wellness Logs Route (`/api/wellness`)
- **`GET /api/wellness`**:
  - Response (200): `{ "logs": [ { "id": "...", "type": "...", "title": "...", "preview": "...", "sentiment": "...", "date": "..." } ] }`
- **`POST /api/wellness`**:
  - Request: `{ "type": "...", "title": "...", "preview": "...", "sentiment": "...", "refId": "..." }`
  - Response (201): Saved log JSON.
- **`GET /api/wellness/streak?tz=<timezone>`**:
  - Query Param: `tz` (Defaults to `UTC`).
  - Response (200): `{ "streak": 5 }`

### 3.3 Mascot Route (`/api/mascot`)
- **`GET /api/mascot`**:
  - Response (200): `{ "id": "...", "name": "...", "eggType": "...", "personality": "...", "level": 2 }`
- **`POST /api/mascot/persona`**:
  - Request: `{ "age": 28, "occupation": "...", "sleepHours": "...", "stressLevel": 5, "selfCareScale": 6, "mentalGoal": "...", "triggers": [...] }`
  - Response (200): `{ "success": true }`

---

## 4. Algorithmic Specifications

### 4.1 Daily Streak Calculation Algorithm
Calculated on the REST server inside `server/src/routes/wellness.ts`:
1. Query distinct active dates cast to local timezone formats:
   ```sql
   SELECT DISTINCT ((created_at AT TIME ZONE $2)::date)::text as log_date
   FROM wellness_logs WHERE user_id = $1 ORDER BY log_date DESC
   ```
2. Resolve local timezone "today" format (e.g. `YYYY-MM-DD`).
3. Compute "yesterday" using Gregorian date intervals.
4. Compare the latest log date entry `latestLogStr = dates[0]`:
   - If `latestLogStr` is neither "today" nor "yesterday", return `streak = 0`.
5. Iterate backward:
   - For each active date, if a matching date string exists in the dates array, increment `streak`.
   - Decrement current check date by 1 day. Stop when no matching log date is found.

### 4.2 Mascot Level Progression Algorithm
Computed dynamically on the dashboard and profile pages based on aggregated database logs:
- **Level 1 (Egg)**: 0 wellness logs.
- **Level 2 (Hatched Hamster)**: 1 to 4 wellness logs. Title: *"Freshly Hatched Sparky"*.
- **Level 3 (Level 2 Companion)**: 5 to 14 wellness logs. Title: *"Apprentice Companion"*.
- **Level 4 (Level 3 Companion)**: 15 to 29 wellness logs. Title: *"Sensing Companion"*.
- **Level 5 (Level Max Companion)**: 30+ wellness logs. Title: *"Serene Sage Companion"*.
- **Formula**:
  ```typescript
  const logCount = logs.length;
  let level = 1;
  let title = "Moss Sage Egg";
  
  if (logCount >= 30) {
    level = 5;
    title = "Serene Sage Companion";
  } else if (logCount >= 15) {
    level = 4;
    title = "Sensing Companion";
  } else if (logCount >= 5) {
    level = 3;
    title = "Apprentice Companion";
  } else if (logCount >= 1) {
    level = 2;
    title = "Freshly Hatched Sparky";
  }
  ```
- Mascot rendering views dynamically display different states (e.g., egg shell graphics, little hamster animations) based on the computed `level` state.
