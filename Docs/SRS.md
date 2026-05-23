# Software Requirements Specification (SRS)
## Project Name: SereneMind
### Document Version: 1.0.2
### Date: May 22, 2026

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document details the functional and non-functional requirements, system boundaries, database schemas, and architectural workflows for the **SereneMind** mental health support ecosystem. It serves as a unified reference point for developers, system architects, and testers to build, verify, and extend the application.

### 1.2 Scope
SereneMind is an AI-driven, companion-based mental health support system. It integrates Next.js frontend clients with an Express/PostgreSQL backend API server to deliver:
- Secure JWT-based User Authentication and Registration.
- An interactive, database-synced clinical User Persona and Mascot evolution engine.
- A private Cognitive Behavioral Therapy (CBT) conversational Chatbot Companion.
- A free-form Reflection Journaling interface featuring real-time client debounced autosaves and sentiment classification.
- A unified Wellness Timeline history.
- An interactive Monthly Mood Calendar heatmap tracker.
- Personalized wellness exercise logs.
- High-priority Safety Crisis Intercept (SOS) Calm Care system.

### 1.3 Intended Audience
This document is designed for the technical development team, QA engineers, database administrators, and product management staff.

---

## 2. Product Description

### 2.1 Product Perspective
SereneMind operates as a three-tier web application. The Next.js frontend client communicates with the Express REST API backend over HTTP/HTTPS, passing a JSON Web Token (JWT) in authorization headers to access protected resources. The backend server manages connection pooling to a PostgreSQL database where data resides across 9 tables.

### 2.2 User Classes and Characteristics
- **Stressed Professionals**: Need fast self-care recommendations, streak tracking to encourage consistency, and mood calendar trends.
- **Expressive Journalers**: Need a secure journaling space with sentiment history tracking to spot cognitive biases.
- **Support-Seeking Users**: Require conversational chat logs with Sparky the Mascot to talk through emotional triggers, backed by a safety intercept mode.

### 2.3 Design and Implementation Constraints
- **HIPAA Compliance**: No unencrypted Protected Health Information (PHI) stored.
- **Database Limits**: PostgreSQL 16 connection limits managed via database pooling (`pg.Pool`).
- **Responsive Layout**: Designed using CSS variables with adaptive grids for desktop, tablet, and mobile viewports.

---

## 3. System Features & Functional Requirements

### 3.1 User Authentication and Registration
- **Functional Requirements**: 
  - Users must be able to sign up with unique emails and passwords.
  - User passwords must be hashed using `bcrypt` on the server before database insertion.
  - Upon logging in, the server returns a signed JWT token which the client stores in `localStorage`.
  - Sidebars must feature a "Log Out" button that clears auth states and redirects to `/login`.

### 3.2 Dynamic Dashboard & Mascot Evolution
- **Functional Requirements**:
  - The dashboard must load the user's customized clinical persona details and current adopted mascot statistics.
  - The mascot level and empathy titles are computed dynamically based on the total count of logs in the database.
  - Mascot levels shift from an unhatched egg to level-ups at 5, 15, and 30 active logs.

### 3.3 Empathetic AI Chatbot Companion
- **Functional Requirements**:
  - Users can initiate chat sessions with Sparky.
  - Messages are saved with a unique `session_id` and role (`user` vs `sparky`).
  - Chat logs must automatically sync to `wellness_logs` as a unified timeline feed.

### 3.4 Reflective Journaling & Sentiment Analysis
- **Functional Requirements**:
  - Journal input fields automatically trigger client-side debounced autosaves (1.5-second idle delay).
  - Sentiment classification scans text to flag positive, negative, or neutral balances.

---

## 4. System UML & Architecture Diagrams

This section outlines the logical, behavioral, and physical architecture of SereneMind through 14 comprehensive diagrams.

### 4.1 Use Case Diagram (Diagram 1)
Describes user-facing capabilities and boundary interactions with SereneMind components.

```mermaid
graph TD
    User((User))
    subgraph SereneMind ["SereneMind Application"]
        UC_Auth["Authentication and Anonymous Register"]
        UC_Dashboard["Access Dashboard and Companion"]
        UC_Chat["Empathetic Chat with AI Mascot"]
        UC_Journal["Autosaved Reflective Journaling"]
        UC_History["View Timeline and Monthly Summaries"]
        UC_Analysis["Interact with Mood Calendar Heatmap"]
        UC_Exercises["Execute Breathing and Coping Exercises"]
        UC_Crisis["Trigger Crisis SOS and Calm Care Panel"]
        UC_Profile["Manage Clinical Persona Profile"]
    end
    User --> UC_Auth
    User --> UC_Dashboard
    User --> UC_Chat
    User --> UC_Journal
    User --> UC_History
    User --> UC_Analysis
    User --> UC_Exercises
    User --> UC_Crisis
    User --> UC_Profile
```
* **Diagram Explanation**: Shows how a user actor interacts with the SereneMind application boundary, including authentication, dashboard management, journaling, mood analytics, coping exercises, crisis interventions, and persona configurations.

### 4.2 System Boundary Context Diagram — DFD Level 0 (Diagram 2)
Maps the high-level boundary of the application, external inputs, and outputs.

```mermaid
graph TD
    User([User]) -->|Input Actions| FrontEnd["SereneMind App Client and Server"]
    FrontEnd -->|Render Views| User
    FrontEnd -->|SQL Queries| PostgreSQL[(PostgreSQL Database)]
    PostgreSQL -->|Data Rows| FrontEnd
    FrontEnd -->|Triggers Crisis Helplines| Helplines["Emergency Contacts and SOS Services"]
```
* **Diagram Explanation**: Maps inputs and outputs at the application boundary (DFD Level 0), showing how user interactions process through frontend/backend layers to persist in PostgreSQL and trigger external SOS crisis resources when needed.

### 4.3 Data Flow Diagram — DFD Level 1 (Diagram 3)
Illustrates how data flows across major logical processes and tables in PostgreSQL.

```mermaid
graph TD
    User([User]) -->|Input Actions| P_Auth["1.0 Authenticate User"]
    User -->|Mood/Mascot Actions| P_Mascot["2.0 Manage Mascot and Persona"]
    User -->|Chat Text| P_Chat["3.0 Manage AI Companion Chat"]
    User -->|Journal Entries| P_Journal["4.0 Process Reflections"]
    User -->|Log Lookup/Actions| P_Wellness["5.0 Manage Wellness Logs and History"]
    User -->|Select exercises| P_Exercise["6.0 Recommended Exercises"]
    User -->|Log mood and notes| P_Calendar["7.0 Manage Mood Calendar"]

    P_Auth -->|Write User Credentials| D_Users[(users Table)]
    D_Users -->|Read User Credentials| P_Auth
    
    P_Mascot -->|Write Mascot and Persona| D_Mascots[("mascots and user_personas")]
    D_Mascots -->|Read Mascot and Persona| P_Mascot
    
    P_Chat -->|Write chat messages| D_Chats[(chat_messages Table)]
    P_Journal -->|Save Reflection details| D_Journals[(journals Table)]
    P_Wellness -->|Fetch unified log history| D_Wellness[(wellness_logs Table)]
    P_Exercise -->|Log completion data| D_Exercises[(exercise_logs Table)]
    P_Calendar -->|Write daily telemetry data| D_Calendar[(mood_calendar Table)]
    
    P_Chat -->|Create timeline entry| D_Wellness
    P_Journal -->|Create timeline entry| D_Wellness
    P_Exercise -->|Create timeline entry| D_Wellness
```
* **Diagram Explanation**: Traces data paths (DFD Level 1) showing how user credentials, journal bodies, chat messages, mood heatmaps, and exercises read/write to tables (`users`, `mascots`, `journals`, `chat_messages`, etc.) and automatically update `wellness_logs`.

### 4.4 Authentication Sequence Diagram (Diagram 4)
Walks through the user registration and login token validation mechanisms.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User Browser"
    participant FE as "Next.js Client (AuthContext)"
    participant BE as "Express API Server (routes/auth)"
    participant DB as "PostgreSQL (users table)"

    User->>FE: Enter email, password and click Register/Login
    FE->>BE: POST /api/auth/register OR /login
    BE->>DB: Query by email / Check uniqueness
    DB-->>BE: User data or null
    alt Registration Mode
        BE->>BE: Hash password using bcrypt
        BE->>DB: INSERT INTO users (email, password_hash, display_name)
        DB-->>BE: Created user row
    else Login Mode
        BE->>BE: Verify password using bcrypt.compare()
    end
    alt Auth Successful
        BE->>BE: Sign JWT token
        BE-->>FE: Return JSON token and user payload
        FE->>FE: Save JWT to localStorage
        FE-->>User: Redirect to /dashboard
    else Auth Failed
        BE-->>FE: Return Unauthorized status code
        FE-->>User: Display error message on Login form
    end
```
* **Diagram Explanation**: Shows the sequence of register/login requests. A user submits credentials, the Express backend verifies/hashes the password using bcrypt, queries database entries, signs a JWT session token, and updates local browser states.

### 4.5 Chatbot Conversation Sequence Diagram (Diagram 5)
Details how user chats with Sparky are saved and tracked.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User Browser"
    participant FE as "Next.js Client (chatbot page)"
    participant BE as "Express API Server (routes/chats)"
    participant DB as "PostgreSQL (chat_messages and wellness_logs)"

    User->>FE: Enter message and press send
    FE->>FE: Render User Bubble locally
    FE->>BE: POST /api/chats/message (JWT Token, text payload)
    BE->>BE: Validate JWT token
    BE->>DB: INSERT INTO chat_messages
    DB-->>BE: Inserted message row
    BE->>DB: INSERT INTO wellness_logs
    DB-->>BE: Inserted wellness log row
    BE->>BE: Execute Empathy and CBT Response Logic (Sparky)
    BE->>DB: INSERT INTO chat_messages
    DB-->>BE: Inserted Sparky message row
    BE-->>FE: Return JSON response reply
    FE->>FE: Render Sparky Bubble with typing complete
    FE-->>User: Display mascot companion response
```
* **Diagram Explanation**: Illustrates the RAG/chat response loop. Messages from the client are saved in `chat_messages` and synced with `wellness_logs` timeline entries before the Mascot replies with an empathetic response.

### 4.6 Journal Reflection & Sentiment Sequence Diagram (Diagram 6)
Tracks the debounced journaling flow and automated sentiment logging.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User Browser"
    participant FE as "Next.js Client (journaling page)"
    participant BE as "Express API Server (routes/journals)"
    participant DB as "PostgreSQL (journals and wellness_logs)"

    User->>FE: Type reflection text
    Note over FE: Debounce trigger runs (autosaves after 1.5s idle)
    FE->>BE: POST /api/journals (JWT Token, title and body)
    BE->>BE: Scan text using sentiment classifier (Positive/Negative/Neutral)
    BE->>DB: INSERT/UPDATE journals
    DB-->>BE: Saved journal row
    BE->>DB: INSERT INTO wellness_logs
    DB-->>BE: Saved wellness log row
    BE-->>FE: Return JSON response
    FE->>FE: Update local state and display Autosaved + Sentiment badge
    FE-->>User: Show sentiment indicator (e.g., Positive)
```
* **Diagram Explanation**: Models the debounced journaling pipeline. Typing events wait for 1.5s client-side inactivity, POST to the server to compute text sentiments, upsert records in journals and timeline logs, and return status indicators.

### 4.7 Daily Streak Calculation Sequence Diagram (Diagram 7)
Illustrates how the daily streak is computed backward from the user's current calendar date.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User Browser"
    participant FE as "Next.js Client (Header component)"
    participant BE as "Express API Server (routes/wellness/streak)"
    participant DB as "PostgreSQL (wellness_logs)"

    User->>FE: Navigates to a page (triggering Header render)
    FE->>FE: Resolve local timezone
    FE->>BE: GET /api/wellness/streak?tz=timezone (JWT Token)
    BE->>BE: Validate JWT token
    BE->>DB: Query distinct log dates in local timezone
    DB-->>BE: Return list of unique log dates
    BE->>BE: Get today in requested timezone
    BE->>BE: Calculate consecutive active days going backward
    alt Last log is today or yesterday
        BE->>BE: Loop date check and increment streak count
    else Last log older than yesterday
        BE->>BE: Set streak count to 0
    end
    BE-->>FE: Return JSON response containing streak count
    FE->>FE: Update streakCount state variable
    FE-->>User: Render streak pill showing streakCount
```
* **Diagram Explanation**: Outlines timezone-aware streak tracking. Client mounts trigger calls passing local offsets, and the server queries unique database entry dates in that offset to count consecutive daily activity backwards.

### 4.8 System Class Diagram — Domain Models (Diagram 8)
Maps the relationship models of all tables in the `serenemind` database.

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String password_hash
        +String display_name
        +DateTime created_at
        +DateTime updated_at
        +register()
        +login()
    }
    class Mascot {
        +UUID id
        +UUID user_id
        +String name
        +String egg_type
        +String personality
        +int level
        +DateTime created_at
        +DateTime updated_at
        +hatch()
        +evolve()
    }
    class UserPersona {
        +UUID id
        +UUID user_id
        +int age
        +String occupation
        +String sleep_hours
        +int stress_level
        +int self_care_scale
        +String mental_goal
        +JSON triggers
        +DateTime created_at
        +DateTime updated_at
        +updatePersona()
    }
    class MoodLog {
        +UUID id
        +UUID user_id
        +String mood
        +int score
        +String notes
        +DateTime created_at
    }
    class Journal {
        +UUID id
        +UUID user_id
        +String title
        +String body
        +String sentiment
        +DateTime created_at
        +DateTime updated_at
    }
    class ChatMessage {
        +UUID id
        +UUID user_id
        +UUID session_id
        +String sender
        +String text
        +DateTime created_at
    }
    class ExerciseLog {
        +UUID id
        +UUID user_id
        +String exercise_id
        +String exercise_title
        +String category
        +int duration_secs
        +DateTime created_at
    }
    class WellnessLog {
        +UUID id
        +UUID user_id
        +String type
        +String title
        +String preview
        +String sentiment
        +UUID ref_id
        +DateTime created_at
    }
    class MoodCalendar {
        +UUID id
        +UUID user_id
        +int day
        +int month
        +int year
        +String mood
        +String note
        +DateTime updated_at
    }

    User "1" --> "1" Mascot : adopts
    User "1" --> "1" UserPersona : defines
    User "1" --> "*" MoodLog : records
    User "1" --> "*" Journal : writes
    User "1" --> "*" ChatMessage : sends
    User "1" --> "*" ExerciseLog : completes
    User "1" --> "*" WellnessLog : tracks
    User "1" --> "*" MoodCalendar : schedules
```
* **Diagram Explanation**: Models the PostgreSQL domain schema using class models. It demonstrates the relational entities (`User`, `Mascot`, `UserPersona`, `MoodLog`, `Journal`, `ChatMessage`, `ExerciseLog`, `WellnessLog`, `MoodCalendar`) and defines user adoption, creation, logging, and completion boundaries.

### 4.9 Mascot State Machine Diagram (Diagram 9)
Tracks how Sparky's hatch lifecycle and levels evolve.

```mermaid
stateDiagram-v2
    [*] --> EggState : Mascot Initialized
    
    EggState --> HatchingState : "Log first Wellness entry"
    HatchingState --> Level1State : "Companion hatches into Sparky"
    
    state Level1State {
        [*] --> CalmMascot
        CalmMascot --> PlayfulMascot : "Active streak > 3 days"
        PlayfulMascot --> CalmMascot : Active streak resets
    }

    Level1State --> Level2State : "Logs count >= 5"
    Level2State --> Level3State : "Logs count >= 15"
    Level3State --> LevelMaxState : "Logs count >= 30"

    state LevelMaxState {
        [*] --> SereneSageHamster
    }
```
* **Diagram Explanation**: Illustrates Sparky's hatching and development states. Evolution is gated by cumulative log inputs, transitioning from the egg shell graphics, through Hatching, Apprentice, Sensing Companion, and finally Serene Sage status.

### 4.10 User Session State Machine Diagram (Diagram 10)
Identifies authorization lifecycles and transitions during normal vs emergency flows.

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated : Open App
    
    Unauthenticated --> Authenticating : "Click Login or Register"
    Authenticating --> Unauthenticated : Auth failure
    Authenticating --> Authenticated : Auth success
    
    state Authenticated {
        [*] --> ActiveSession
        ActiveSession --> SOSCrisisMode : Trigger SOS
        SOSCrisisMode --> ActiveSession : Confirm safe
    }
    
    Authenticated --> Unauthenticated : "Log Out or Session Expired"
```
* **Diagram Explanation**: Outlines active authorization states. A user moves from Unauthenticated to Authenticated, entering a secure active session that halts standard response models to display contact references if a high-risk SOS Crisis condition is triggered.

### 4.11 Mood Check-In Activity Diagram (Diagram 11)
Documents step-by-step logic for quick mood logging.

```mermaid
flowchart TD
    Start([User opens Dashboard]) --> SelectMood[Select mood emoji: Anxious, Calm, Sad, Frustrated, Okay]
    SelectMood --> OptionalNotes{Add optional notes?}
    OptionalNotes -->|Yes| TypeNotes[Type text notes in input field]
    OptionalNotes -->|No| SubmitLog[Click Submit Log button]
    TypeNotes --> SubmitLog
    SubmitLog --> API_Request[Send POST /api/mascot/mood]
    API_Request --> Database_Insert[Save to mood_logs and insert record to wellness_logs]
    Database_Insert --> UpdateUI[Update Dashboard cards and refresh wellness logs timeline]
    UpdateUI --> End([Process Completed])
```
* **Diagram Explanation**: Diagrams the step-by-step logic for quick mood logging. Users tap emoji scores, append voluntary logs, POST details to mascot endpoints, write DB entries, and instantly refresh dashboards.

### 4.12 Journal Autosave Activity Diagram (Diagram 12)
Illustrates logic for debouncing keyboard strokes to prevent database request overloading.

```mermaid
flowchart TD
    Start([User begins typing in Journal]) --> TextChanged[Detect keyboard input changes]
    TextChanged --> ResetTimer[Reset debouncing timer to 1500ms]
    ResetTimer --> TimerRunning{Has 1500ms elapsed?}
    TimerRunning -->|No| TextChanged
    TimerRunning -->|Yes| TriggerAutosave[Trigger API Autosave call]
    TriggerAutosave --> SentimentClass[Extract and evaluate text sentiment]
    SentimentClass --> SendDB[UPSERT record in journals and log in wellness_logs]
    SendDB --> ResponseReceived[Return saved entry and sentiment badge data]
    ResponseReceived --> RenderStatus[Render 'Autosaved' status at top of journal page]
    RenderStatus --> End([Process Completed])
```
* **Diagram Explanation**: Depicts the debouncing logic that minimizes database workload. Keypresses trigger 1500ms client timers that continuously reset; upon expiration, the client executes autosaves, runs sentiment queries, and sets status badges.

### 4.13 Component Diagram (Diagram 13)
Identifies architectural boundary components and standard interaction flows.

```mermaid
graph TD
    subgraph FrontendComponents ["Next.js Client Components"]
        UI[App Pages and UI Views]
        AuthCtx[Auth Context Layer]
        API[API HTTP Client]
    end

    subgraph BackendComponents ["Express Server Components"]
        Router[Express Routing Gateways]
        AuthMW[JWT Authorization Middleware]
        DBCli[pg.Pool DB Client]
    end

    subgraph DatastoreComponents ["Database Engine"]
        DB[(PostgreSQL Database Tables)]
    end

    UI --> AuthCtx
    UI --> API
    AuthCtx --> API
    API -->|HTTP REST Requests + JWT| AuthMW
    AuthMW --> Router
    Router --> DBCli
    DBCli -->|SQL Statements| DB
```
* **Diagram Explanation**: Outlines boundaries between UI views, auth contexts, client HTTP requests, API routes, security/session verification middleware, connection pool clients, and physical database engines.

### 4.14 Deployment Diagram (Diagram 14)
Details server, database containerization, and browser runtimes.

```mermaid
graph TD
    subgraph ClientDevice ["User Desktop/Mobile Browser"]
        Browser[Chrome/Safari/Firefox Client]
    end

    subgraph WebServerHost ["Docker Container: Next.js Client Host"]
        NextApp[Next.js Production Build Node Server]
    end

    subgraph APIServerHost ["Docker Container: Node Express App Server"]
        ExpressAPI[Express REST API Service]
    end

    subgraph DBServerHost ["Docker Container: PostgreSQL Database Node"]
        Postgres[PostgreSQL DB Server]
    end

    Browser -->|HTTP/HTTPS Port 3000| NextApp
    Browser -->|HTTP/HTTPS REST Port 3001| ExpressAPI
    ExpressAPI -->|TCP Port 5432| Postgres
```
* **Diagram Explanation**: Represents containerized service runtimes. User browsers run local React scripts, communicating on port 3000 to Client Host servers, on port 3001 to Node Express services, and on port 5432 to Postgres engines.

---

## 5. Non-Functional Requirements

### 5.1 Security & Cryptography
- **In-Transit Encryption**: All API interactions enforce HTTPS with TLS 1.3 protocol standards.
- **At-Rest Storage**: Fields containing logs are encrypted with AES-256 keys managed externally.
- **Session Lifecycles**: JWT tokens are signed using a secure `JWT_SECRET` key and set with a 7-day expiration.

### 5.2 Regulatory & Privacy Standards
- **HIPAA**: Audit logging is mapped to track reads/writes of sensitive clinical health profiles in `user_personas` or `wellness_logs`.
- **GDPR**: Account purging routes are configured to execute clean cascades across relational tables upon requests.
- **Anonymity**: User logins support non-personalized accounts, storing zero real-world identity metrics.

### 5.3 Reliability and Performance
- **API Response Latencies**: Target latency for 95% of standard requests is below 200 milliseconds.
- **Timezone Robustness**: Real-time streak tracking dynamically adapts to RESOLVED client location settings, preserving accuracy for global offsets.
