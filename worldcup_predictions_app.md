# World Cup Family Predictions Web App - Functional & Technical Analysis

## 1. Project Overview & Scope

Το project αφορά μια custom web εφαρμογή προβλέψεων (predictions) για το Μουντιάλ, σχεδιασμένη αποκλειστικά για χρήση από μέλη της οικογένειας/σογιού. Στόχος είναι η αυτοματοποίηση του παιχνιδιού, η κατάργηση των χειροκίνητων excel/σημειώσεων και η ενίσχυση του competitive fun (καζούρα) μέσω άμεσης πρόσβασης στα δεδομένα και notifications.

---

## 2. Functional Requirements & Core Rules

### A. Το Σύστημα των Προβλέψεων (The Core Game)

- **Match Predictions:** Η εισαγωγή (input) από τον χρήστη είναι το **ακριβές σκορ** του αγώνα.
- **Λογική Νοκ-Άουτ (Knock-Out Stages):**
  - Για το σκορ του αγώνα μετράει αυστηρά το αποτέλεσμα στο **90λεπτο** (η ισοπαλία "Χ" είναι έγκυρο αποτέλεσμα).
  - Υπάρχει extra (ξεχωριστό) prediction για το **ποιος θα προκριθεί** (Qualified Team) στην επόμενη φάση (ισχύει για extra time / penalties).
- **Μακροχρόνιο Prediction ("Ποιος θα το πάρει"):**
  - Η πρόβλεψη για τον τελικό νικητή της διοργάνωσης υποβάλλεται αρχικά πριν τη σέντρα του εναρκτήριου αγώνα.
  - Επιτρέπεται η αλλαγή/τροποποίησή της **μέχρι τη λήξη της φάσης των ομίλων**, αλλά με μειωμένους πόντους bonus (λιγότερο reward σε σχέση με όποιον το βρήκε από την ημέρα 1).

### B. Ροή Χρηστών & Διαχείριση (User Experience & Flow)

- **Authentication:** Κανονικό σύστημα Login/Register με Email & Password.
- **Κλείδωμα Προβλέψεων (T-5 Rule):** Οι προβλέψεις για κάθε ματς κλειδώνουν αυστηρά **5 λεπτά πριν την επίσημη σέντρα**. Μετά το πέρας αυτού του ορίου, καμία αλλαγή δεν γίνεται δεκτή από το σύστημα.
- **Admin Overrides:** Οι διαχειριστές (Admins) έχουν το δικαίωμα να τροποποιήσουν ή να καταχωρήσουν προβλέψεις χρηστών οποτεδήποτε (σε περιπτώσεις "force majeure" ή τεχνικού κολλήματος μέλους της οικογένειας).
- **Αποτελέσματα Αγώνων (Live Score API):** Ενσωμάτωση δωρεάν εξωτερικού API (π.χ. *Football-Data.org* ή *API-Football*) για τον αυτόματο συγχρονισμό του προγράμματος και των τελικών σκορ (settled μετά το 90λεπτο). Αν το API αποτύχει, ο Admin μπορεί να περάσει το σκορ χειροκίνητα.

### C. Features "Καζούρας" & UI

- **Dynamic Leaderboard:** Συνολική κατάταξη των χρηστών σε πραγματικό χρόνο, βάσει των συνολικών πόντων που έχουν συγκεντρώσει.
- **Visibility (Διαφάνεια):** Οι παίκτες **δεν** μπορούν να δουν τι έχουν παίξει οι υπόλοιποι πριν το κλείδωμα. Μόλις το ματς κλειδώσει (στο T-5), οι προβλέψεις όλων γίνονται άμεσα ορατές σε ειδικό section, για να γίνεται η σωστή καζούρα κατά τη διάρκεια του αγώνα.

---

## 3. Technical Architecture & Tech Stack

Η εφαρμογή θα υλοποιηθεί με full decoupling (διαχωρισμό) Frontend και Backend.

- **Backend:** Java 21 με **Spring Boot**.
  - **Architecture Pattern:** **Hexagonal Architecture (Ports & Adapters)** για την πλήρη απομόνωση του Core Domain από εξωτερικές βιβλιοθήκες, frameworks και APIs (Postgres, Football API).
- **Database:** **PostgreSQL** (Relational Database).
- **Frontend:** **React** (Single Page Application) για σύγχρονο, γρήγορο και responsive user experience σε mobile και desktop συσκευές.

---

## 4. Architectural Structure (Hexagonal Packages)

```text
com.family.worldcup
│
├── domain/                          <-- Business Logic (Pure Java, ΧΩΡΙΣ Spring Annotations)
│   ├── model/                       <-- User, Match, Prediction, LongTermPrediction, Leaderboard
│   └── service/                     <-- PointCalculatorService, PredictionDomainService
│
├── ports/                           <-- Interfaces (Η γέφυρα του Domain με το περιβάλλον)
│   ├── inbound/                     <-- Use Cases (π.χ. SubmitPredictionUseCase, ViewLeaderboardUseCase)
│   └── outbound/                    <-- SPIs (π.χ. MatchRepositoryPort, FootballApiPort)
│
└── adapters/                        <-- Υλοποιήσεις των Ports (Framework-specific κώδικας)
    ├── inbound/
    │   └── web/                     <-- React Rest Controllers (DTOs, Mappers, Spring Security Auth)
    │
    └── outbound/
        ├── persistence/             <-- Spring Data JPA Repositories & Postgres Entities
        └── footballapi/             <-- REST Client (e.g., Feign / WebClient) για το Free Football API
```

---

## 5. Database Schema (Relational Representation)

### Table: `users`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID / Long, PK | Primary Key |
| `username` | VARCHAR, Unique | |
| `email` | VARCHAR, Unique | |
| `password_hash` | VARCHAR | |
| `role` | VARCHAR | e.g., `'ROLE_USER'`, `'ROLE_ADMIN'` |
| `total_points` | INT, Default: 0 | Χρησιμοποιείται για γρήγορο indexing στο Leaderboard |

### Table: `matches`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR / Long, PK | Ιδανικά το ID από το Football API για εύκολο mapping |
| `home_team` | VARCHAR | |
| `away_team` | VARCHAR | |
| `match_stage` | VARCHAR | e.g., `'GROUP'`, `'ROUND_OF_16'`, `'QUARTERS'`, `'SEMIS'`, `'FINAL'` |
| `kickoff_time` | TIMESTAMP WITH TIME ZONE | |
| `home_score_90` | INT, Nullable | |
| `away_score_90` | INT, Nullable | |
| `qualified_team` | VARCHAR, Nullable | Χρησιμοποιείται μόνο στα νοκ-άουτ |
| `status` | VARCHAR | e.g., `'SCHEDULED'`, `'LIVE'`, `'FINISHED'` |

### Table: `predictions`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID / Long, PK | Primary Key |
| `user_id` | FK → `users.id` | |
| `match_id` | FK → `matches.id` | |
| `predicted_home_score` | INT | |
| `predicted_away_score` | INT | |
| `predicted_qualifier` | VARCHAR, Nullable | Μόνο για νοκ-άουτ |
| `points_earned` | INT, Default: 0 | Οι πόντοι που απέδωσε η συγκεκριμένη πρόβλεψη |
| `updated_at` | TIMESTAMP | |

> **Constraint:** Unique key συνδυασμός `(user_id, match_id)` ώστε να υπάρχει μόνο μία πρόβλεψη ανά χρήστη ανά αγώνα.

### Table: `long_term_predictions`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID / Long, PK | Primary Key |
| `user_id` | FK → `users.id`, Unique | |
| `predicted_champion_team` | VARCHAR | |
| `submitted_at` | TIMESTAMP | |

---

## 6. Critical Backend Logic Rules

### Security & Privacy Gate (`PredictionDomainService`)

Για την αποτροπή "διαρροής" των προβλέψεων πριν το κλείδωμα μέσω Network Inspection στο React, το backend θα επιβάλλει τον εξής κανόνα στο endpoint επιστροφής όλων των προβλέψεων:

```java
public List<Prediction> getAllPredictionsForMatch(Match match) {
    if (LocalDateTime.now().isBefore(match.getKickoffTime().minusMinutes(5))) {
        throw new PredictionsLockedException("Οι προβλέψεις των άλλων χρηστών θα είναι ορατές 5 λεπτά πριν τη σέντρα!");
    }
    return predictionRepository.findByMatchId(match.getId());
}
```

### Point Allocation Strategy (`PointCalculatorService`)

Όταν ένα ματς αλλάζει status σε `FINISHED`, ο service θα υπολογίζει τους πόντους συγκρίνοντας το `Match` entity με τα αντίστοιχα `Prediction` entities:

| Συνθήκη | Λογική | Πόντοι |
|---|---|---|
| **Exact Score Match** | `match.home_score_90 == pred.predicted_home_score` AND `match.away_score_90 == pred.predicted_away_score` | Max Points (e.g., **5 πόντοι**) |
| **Goal Difference / Sign Match** (Σωστό Σημείο 1-X-2) | `Integer.signum(match.home_score_90 - match.away_score_90) == Integer.signum(pred.predicted_home_score - pred.predicted_away_score)` | Base Points (e.g., **2 πόντοι**) |
| **Qualifier Bonus** (Νοκ-άουτ) | `match.match_stage != 'GROUP'` AND `match.qualified_team == pred.predicted_qualifier` | Extra Bonus (e.g., **+1 πόντος**) |
