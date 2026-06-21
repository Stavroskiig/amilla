# Amilla - World Cup Family Predictions Web App

## 1. Purpose

Amilla is a custom web application designed for family and friends to make match predictions for the World Cup. The project aims to automate the traditional prediction games (often done via Excel or notes), remove manual tracking, and enhance the competitive fun ("καζούρα") by providing real-time data, a dynamic leaderboard, and automated match result processing.

Key features include:
- **Match Predictions**: Predict the exact score for each match.
- **Knock-out Stage Rules**: Separate predictions for the 90-minute score and the team that qualifies to the next round.
- **Long-term Predictions**: Predict the overall tournament winner before the first match kicks off.
- **Locking Mechanism (T-5 Rule)**: All predictions are locked 5 minutes before kickoff, after which everyone's predictions become visible.

## 2. Architecture Overview

The application follows a decoupled Monorepo structure, separating the frontend client from the backend API.

### Backend (Java / Spring Boot)
- **Frameworks**: Java 21, Spring Boot 3.3.0.
- **Architecture Pattern**: **Hexagonal Architecture (Ports & Adapters)**. The core domain logic is isolated from external frameworks, APIs, and databases.
  - `domain`: Core business logic, User/Match/Prediction models.
  - `ports`: Interfaces bridging the domain to the outside world.
  - `adapters`: Framework-specific implementations (e.g., Spring REST Controllers, JPA Repositories).
- **Database**: **PostgreSQL** hosted on **Supabase**.
- **Auth**: Stateless JWT-based Authentication.
- **Deployment**: Containerized via Docker and deployed on **Render**.

### Frontend (React / Vite)
- **Frameworks**: React 19, Vite.
- **State Management**: `@tanstack/react-query` for robust data fetching and server state caching.
- **Routing**: `react-router-dom` for Single Page Application navigation.
- **UI & Animations**: Custom CSS with CSS variables for dual-theme support, and `framer-motion` for premium, dynamic animations.
- **Deployment**: Deployed on **Vercel**.

## 3. Setup Instructions

### Prerequisites
- Node.js (v18+) and npm
- Java 21 JDK
- Maven
- Docker (optional, for building the backend image locally)
- A running PostgreSQL database (or Supabase account)

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by copying `.env.example` to `.env` (if applicable) and configuring the backend API URL.
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure the database connection in `src/main/resources/application.yml` or via environment variables.
3. Build the project and download dependencies:
   ```bash
   mvn clean install
   ```
4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

## 4. Configuration Options

### Environment Variables
For security and flexibility, environment variables are used for configuration. Never hardcode secrets in the repository.

**Backend (`backend/src/main/resources/application.properties` or OS Env Vars):**
- `SPRING_DATASOURCE_URL`: PostgreSQL JDBC URL.
- `SPRING_DATASOURCE_USERNAME` & `SPRING_DATASOURCE_PASSWORD`: Database credentials.
- `JWT_SECRET`: Secret key for signing JSON Web Tokens.
- `FOOTBALL_API_KEY`: API key for the external football data provider.

**Frontend (`frontend/.env`):**
- `VITE_API_BASE_URL`: The base URL pointing to the Spring Boot backend (e.g., `http://localhost:8080/api`).

## 5. Common Development Tasks

- **Running the Frontend Linter**:
  ```bash
  cd frontend
  npm run lint
  ```
- **Building the Frontend for Production**:
  ```bash
  cd frontend
  npm run build
  ```
- **Building the Backend Docker Image**:
  ```bash
  cd backend
  docker build -t amilla-backend .
  ```
- **Running Backend Tests**:
  ```bash
  cd backend
  mvn test
  ```

For more details on coding standards, architectural guidelines, and styling rules, please refer to the [RULES.md](./RULES.md) file in the root directory.
