# Student Information Manager

## Cover Page

| Field | Details |
| --- | --- |
| **Project Title** | Student Information Manager |
| **Group Number** | Group 1 |
| **Group Members** | Joevan Delos Santos, Richmon Ecal, John Yzhekiel Millar, Jaztin Hart Alejo, Celine Licanda |
| **Subject** | Web Development / Angular |
| **Submission Date** | [Insert Date] |

**Technical Stack Summary**

- **Framework:** Angular 22 (Standalone Architecture, Modern Control Flow, Signals, Zoneless Change Detection)
- **Reactive & HTTP Layer:** RxJS 7.8 Observables (`subscribe()`) & `HttpClient`
- **Explored Angular Feature:** Angular Router (`@angular/router`)
- **Mock Backend:** `json-server` (`http://localhost:3000/students`)
- **Test Runner:** Vitest 4 + Live Browser End-to-End Verification

---

## Table of Contents

1. [1. Project Overview](#1-project-overview)
   - [1.1 Problem Statement](#11-problem-statement)
   - [1.2 Intended Users](#12-intended-users)
   - [1.3 Objectives](#13-objectives)
   - [1.4 Scope](#14-scope)
   - [1.5 Limitations](#15-limitations)
2. [2. Interface Plan](#2-interface-plan)
   - [2.1 Design Direction](#21-design-direction)
   - [2.2 Initial Sketches](#22-initial-sketches)
   - [2.3 Final Screenshots](#23-final-screenshots)
3. [3. Application Structure](#3-application-structure)
   - [3.1 Directory Layout](#31-directory-layout)
   - [3.2 Component, Routing, Model, and Service Responsibilities](#32-component-routing-model-and-service-responsibilities)
4. [4. Topic Mapping](#4-topic-mapping)
5. [5. API Documentation](#5-api-documentation)
   - [5.1 Server Configuration](#51-server-configuration)
   - [5.2 Student Resource Schema](#52-student-resource-schema)
   - [5.3 Endpoints Reference](#53-endpoints-reference)
   - [5.4 Sample JSON Requests and Responses](#54-sample-json-requests-and-responses)
6. [6. Exploration Report: Angular Router](#6-exploration-report-angular-router)
   - [6.1 What Feature Was Explored and Why It Is Useful](#61-what-feature-was-explored-and-why-it-is-useful)
   - [6.2 Sources Consulted](#62-sources-consulted)
   - [6.3 Experiment Performed](#63-experiment-performed)
   - [6.4 Problems Occurred and How They Were Resolved](#64-problems-occurred-and-how-they-were-resolved)
   - [6.5 How the Final Implementation Works](#65-how-the-final-implementation-works)
   - [6.6 AI Assistance and Adapted Code Disclosure](#66-ai-assistance-and-adapted-code-disclosure)
7. [7. Installation Guide](#7-installation-guide)
   - [7.1 Prerequisites Check](#71-prerequisites-check)
   - [7.2 Install Dependencies](#72-install-dependencies)
   - [7.3 Run the Mock API and Angular Server](#73-run-the-mock-api-and-angular-server)
   - [7.4 Optional Build and Test Commands](#74-optional-build-and-test-commands)
8. [8. Testing Results](#8-testing-results)
   - [8.1 Automated Unit Tests (Vitest)](#81-automated-unit-tests-vitest)
   - [8.2 End-to-End Functional Test Cases (10 Cases)](#82-end-to-end-functional-test-cases-10-cases)
9. [9. Member Contributions, Reflections, and References](#9-member-contributions-reflections-and-references)
   - [9.1 Member Contributions](#91-member-contributions)
   - [9.2 Group Reflection](#92-group-reflection)
   - [9.3 References](#93-references)

---

## 1. Project Overview

### 1.1 Problem Statement
Academic departments and university registrars routinely manage student enrollment records across multiple degree programs and year levels. In small-scale or instructional settings, tracking student numbers, degree programs, academic standing (`Active`, `Probation`, `On Leave`, `Graduated`), GPA, and assigned faculty advisors using disconnected spreadsheets leads to formatting errors, inconsistent data entry, weak searchability, and broken cross-references between summary metrics and individual profiles.

The **Student Information Manager (SIM)** solves this problem by providing a structured, single-page web application with strict input validation, live CRUD persistence over a REST API, instant multi-criteria search and filtering, and URL-driven navigation between overview metrics, directory records, and detailed student dossiers.

### 1.2 Intended Users
- **University Registrar Clerks:** Register new students, update academic standing or GPA after each term, and maintain accurate contact and advisor details.
- **Faculty Advisors:** Search advisees quickly by name, student number, or advisor name, and inspect individual student dossiers during advising sessions.
- **Department Coordinators:** Review enrollment distribution by degree program (`BSCS`, `BSIT`, `BSIS`, `BSCE`, `BSECE`) and year level (1st through 4th Year), then click directly into filtered student rosters.

### 1.3 Objectives
1. Implement a modular Angular single-page application composed of at least four meaningful standalone components (`NavbarComponent`, `DashboardComponent`, `StudentListComponent`, and `StudentDetailComponent`, hosted inside `AppComponent`) backed by a single injectable `StudentService`.
2. Demonstrate modern Angular template control flow (`@if`, `@for` with `track`, and `@switch`), all four Angular data bindings (interpolation, property binding, event binding, and two-way binding), HTTP CRUD operations, and RxJS Observable streams consumed via `subscribe()`.
3. Implement full CRUD operations (Create, Read, Update, Delete) alongside real-time search and filters for `course` and `yearLevel` against a writable local `json-server` mock REST API.
4. Explore and apply **Angular Router** thoroughly, including default redirects, parameterized routes, static route precedence, URL-synchronized query parameters, programmatic navigation, route metadata titles, and wildcard fallbacks.
5. Deliver a high-contrast, utilitarian dark-mode interface that satisfies WCAG AA contrast requirements, keyboard accessibility, responsive mobile reflow, and complete UI state handling (loading, empty, success, error, and validation).

### 1.4 Scope
- **In Scope:**
  - Live Academic Overview dashboard computed directly from persisted API data.
  - Searchable, filterable Student Directory synchronized with browser URL query parameters (`?q=`, `?course=`, `?yearLevel=`).
  - Unified Student Record view supporting Profile Inspection (`/students/:id`), Student Registration (`/students/new`), and Inline Editing (`/students/:id?edit=true`).
  - Safe record deletion with explicit keyboard-accessible confirmation (`Escape` to cancel).
  - Full client-side form validation with contextual inline error messages and a summary validation banner.
  - Automated unit test coverage (`StudentService` HTTP operations and route matching) and 10 live end-to-end verification test cases.

### 1.5 Limitations
- **Local Mock Persistence:** Data is stored in a local `db.json` file served by `json-server` rather than a multi-user relational database (PostgreSQL/MySQL). Concurrent writes from multiple clients are not locked or transactional.
- **No Authentication or Role-Based Access Control (RBAC):** All users with access to the local development server can create, edit, and delete student records.
- **Client-Side Search Projection:** Because `json-server` v1 removed legacy `?q=` full-text query parameters, multi-field search filtering is executed in the RxJS pipeline inside `StudentService.searchStudents()` after retrieving `/students`, which suits departmental cohorts rather than tens of thousands of records without server-side pagination.
- **Single-Term GPA Snapshot:** The model stores current cumulative GPA rather than per-semester transcript history.

---

## 2. Interface Plan

### 2.1 Design Direction
The interface uses a utilitarian, high-density dark zinc palette with crisp 1px borders, tabular monospace alignment for academic metrics, and a single cobalt accent color for primary actions—prioritizing scannability, keyboard accessibility, WCAG AA contrast, and seamless responsive reflow from desktop tables to mobile cards.

### 2.2 Initial Sketches
Wireframe sketches planning the sticky navigation shell, Academic Overview metric strip and breakdowns, Student Directory filter toolbar, and Student Detail dossier/form layout:

> `[INSERT_SKETCH_IMAGE_HERE]`

### 2.3 Final Screenshots
Captured screenshots of the running application across desktop and mobile viewports (Dashboard, Student Directory with active filters, Student Dossier, Registration/Edit validation states, and Delete confirmation):

> `[INSERT_FINAL_SCREENSHOT_HERE]`

---

## 3. Application Structure

### 3.1 Directory Layout

```text
StudentInformationManagement/
├── db.json                                  # Local json-server database (5 seed students)
├── package.json                             # Dependencies and npm scripts (start, api, build, test)
├── README.md                                # Quick-start overview and route summary
├── src/
│   ├── index.html                           # Application shell and IBM Plex fonts
│   ├── main.ts                              # Standalone bootstrap entry point
│   ├── styles.css                           # Global WCAG AA dark-zinc tokens & shared table/button CSS
│   └── app/
│       ├── app.config.ts                    # ApplicationConfig: provideRouter + provideHttpClient
│       ├── app.routes.ts                    # Centralized Angular Router table
│       ├── app.component.{ts,html,css}      # Root layout: skip-link, NavbarComponent, <router-outlet>
│       ├── app.component.spec.ts            # Root shell & routing unit tests (2 specs)
│       ├── models/
│       │   └── student.model.ts             # TypeScript interfaces & academic enum constants
│       ├── services/
│       │   ├── student.service.ts           # Injectable HTTP CRUD + RxJS search & error handling
│       │   └── student.service.spec.ts      # HttpTestingController unit tests (6 specs)
│       └── components/
│           ├── navbar/
│           │   └── navbar.component.{ts,html,css}
│           ├── dashboard/
│           │   └── dashboard.component.{ts,html,css}
│           ├── student-list/
│           │   └── student-list.component.{ts,html,css}
│           └── student-detail/
│               └── student-detail.component.{ts,html,css}
└── docs/
    ├── PROJECT_DOCUMENTATION.md             # Complete Markdown documentation
    └── PROJECT_DOCUMENTATION.html           # Print-ready HTML for browser PDF export
```

### 3.2 Component, Routing, Model, and Service Responsibilities

| Artifact | File Path | Core Responsibilities |
| --- | --- | --- |
| **Root Shell (`AppComponent`)** | `src/app/app.component.ts` | Hosts the accessibility skip link, persistent `<app-navbar />`, and primary `<router-outlet />` container for all routed views. |
| **Student Model** | `src/app/models/student.model.ts` | Defines strict TypeScript types (`Student`, `StudentPayload`, `StudentStatus`, `YearLevel`, `StudentFilterCriteria`) and shared constants (`COURSE_OPTIONS`, `YEAR_LEVEL_OPTIONS`, `STATUS_OPTIONS`). |
| **StudentService** | `src/app/services/student.service.ts` | Root-injected singleton (`providedIn: 'root'`) encapsulating all HTTP CRUD communication with `http://localhost:3000/students` (`getStudents`, `getStudentById`, `searchStudents`, `addStudent`, `updateStudent`, `deleteStudent`) and centralized `HttpErrorResponse` normalization. |
| **App Routing & Config** | `src/app/app.routes.ts`, `src/app/app.config.ts` | Declares all application routes, static-before-dynamic route precedence (`/students/new` before `/students/:id`), route `data` flags, browser `<title>` metadata, default empty-path redirect, wildcard fallback, and global providers (`provideRouter`, `provideHttpClient`). |
| **NavbarComponent** | `src/app/components/navbar/navbar.component.ts` | Persistent top navigation bar with `routerLink` destinations (`Dashboard`, `Students`, `Register Student`), active route underlines via `routerLinkActive`, live active path readout subscribed to `Router.events` (`NavigationEnd`), and an accessible mobile `Menu` drawer closable via `Escape`. |
| **DashboardComponent** | `src/app/components/dashboard/dashboard.component.ts` | Fetches live student records on initialization, derives summary figures (`totalStudents`, `activeCount`, `attentionCount`, `averageGpa`), renders clickable Course and Year Level breakdowns that programmatically navigate to pre-filtered `/students` URLs, and lists recent registrations with direct profile links. |
| **StudentListComponent** | `src/app/components/student-list/student-list.component.ts` | Full student directory supporting debounced RxJS search (`Subject` + `debounceTime` + `switchMap`), `course` and `yearLevel` dropdown filters synchronized bidirectionally with URL query parameters, loading/empty/error states, inline `View`/`Edit` routing, and guarded `Delete` confirmation (`Escape` to cancel). |
| **StudentDetailComponent** | `src/app/components/student-detail/student-detail.component.ts` | Multi-mode detail component driven by `ActivatedRoute` (`data`, `paramMap`, and `queryParamMap`). Renders the validated registration form (`/students/new`), read-only Academic Dossier (`/students/:id`), pre-filled edit form (`/students/:id?edit=true`), record deletion, and 404/network recovery states. |

---

## 4. Topic Mapping

The table below maps every required Angular and RxJS curriculum topic to its exact location and implementation inside the codebase.

| Angular / RxJS Concept | Where Used in Code | Implementation Details |
| --- | --- | --- |
| **Interpolation (`{{ ... }}`)** | `navbar.component.html`, `dashboard.component.html`, `student-list.component.html`, `student-detail.component.html` | Renders live values such as `{{ currentPath() }}`, `{{ totalStudents() }}`, `{{ averageGpa() \| number: '1.2-2' }}`, `{{ student.fullName }}`, `{{ student.studentNumber }}`, `{{ feedbackMessage() }}`, `{{ errorMessage() }}`, and `{{ breadcrumbLabel() }}`. |
| **Property Binding (`[...]`)** | `navbar.component.html`, `dashboard.component.html`, `student-list.component.html`, `student-detail.component.html` | Binds DOM and directive properties dynamically: `[routerLink]="['/students', student.id]"`, `[queryParams]="{ edit: 'true' }"`, `[routerLinkActiveOptions]="{ exact: true }"`, `[style.width.%]="item.percentage"`, `[disabled]="isLoading()"`, `[disabled]="isSubmitting()"`, `[attr.aria-expanded]="mobileMenuOpen()"`, `[attr.aria-invalid]="..."`, `[ngValue]="year.value"`, and `[href]="'mailto:' + record.email"`. |
| **Event Binding (`(...)`)** | All 4 component templates + component `host` metadata | Handles user interactions: `(click)="openCourseFilter(item.course)"`, `(click)="loadStudents()"`, `(click)="clearFilters()"`, `(click)="requestDelete(student)"`, `(click)="confirmDelete()"`, `(click)="enterEditMode()"`, `(ngSubmit)="submitForm(studentForm)"`, `(ngModelChange)="onFiltersChanged()"`, and host keyboard listeners `'(document:keydown.escape)': 'cancelDelete()'` / `'closeMobileMenu()'`. |
| **Two-Way Binding (`[(ngModel)]`)** | `student-list.component.html`, `student-detail.component.html` | Synchronizes search and filter controls directly with writable signals (`[(ngModel)]="searchTerm"`, `[(ngModel)]="selectedCourse"`, `[(ngModel)]="selectedYearLevel"`) in `StudentListComponent`, and binds all 9 student form inputs (`[(ngModel)]="formModel.studentNumber"`, `fullName`, `email`, `course`, `yearLevel`, `gpa`, `status`, `enrolledDate`, `advisor`) in `StudentDetailComponent`. |
| **Control Flow: `@if` / `@else`** | `navbar.component.html`, `student-list.component.html`, `student-detail.component.html` | Conditionally renders the mobile navigation drawer (`@if (mobileMenuOpen())`), success and error banners (`@if (feedbackMessage())`), active filter clear button (`@if (hasActiveFilters())`), delete confirmation alert dialog (`@if (pendingDelete(); as target)`), and field-level validation messages (`@if (studentNumberCtrl.errors?.['required']) { ... } @else { ... }`). |
| **Control Flow: `@for` with `track`** | `dashboard.component.html`, `student-list.component.html`, `student-detail.component.html` | Iterates efficiently over collections with explicit identity tracking: `@for (student of students(); track student.id)`, `@for (item of courseBreakdown(); track item.course)`, `@for (year of yearBreakdown(); track year.yearLevel)`, `@for (course of courseOptions; track course)`, and loading skeleton rows `@for (row of [1, 2, 3, 4, 5]; track row)`. |
| **Control Flow: `@switch` / `@case` / `@default`** | `dashboard.component.html`, `student-list.component.html`, `student-detail.component.html` | Controls both view-state rendering (`@switch (viewState())` across `'loading'`, `'error'`, `'empty'`, `'empty-db'`, `'empty-filter'`, `'ready'`, and `@switch (pageState())` across `'loading'`, `'error'`, `'view'`, `'create'`, `'edit'`) and semantic academic standing display (`@switch (student.status)` for `'Active'`, `'Probation'`, `'On Leave'`, `@default`). |
| **RxJS Observables & `subscribe()`** | `student.service.ts`, `navbar.component.ts`, `dashboard.component.ts`, `student-list.component.ts`, `student-detail.component.ts` | `StudentService` returns typed `Observable<Student[]>`, `Observable<Student>`, and `Observable<void>` streams using `pipe(map(...), catchError(...))` and `throwError(...)`. Components explicitly consume API and Router streams via `.subscribe({ next, error })` and `.subscribe(...)`—including debounced search (`Subject` + `debounceTime(120)` + `switchMap`), route loading (`combineLatest([route.data, route.paramMap, route.queryParamMap])` + `switchMap`), and `Router.events` filtering (`NavigationEnd`). Every subscription uses `takeUntilDestroyed(this.destroyRef)` to prevent memory leaks. |
| **Injected Angular Services & HTTP CRUD** | `student.service.ts`, `app.config.ts`, `dashboard.component.ts`, `student-list.component.ts`, `student-detail.component.ts` | `StudentService` is decorated with `@Injectable({ providedIn: 'root' })`, registers `HttpClient` via `provideHttpClient(withFetch())` in `app.config.ts`, and is consumed via Angular's functional `inject(StudentService)` API across components. Executes all five RESTful HTTP CRUD operations (`GET /students`, `GET /students/:id`, `POST /students`, `PUT /students/:id`, and `DELETE /students/:id`) with centralized error handling. |
| **Angular Router** | `app.routes.ts`, `app.config.ts`, `app.component.html`, and all 4 components | Configured via `provideRouter(routes, withComponentInputBinding())`, rendering active views inside `<router-outlet />`, declarative navigation (`routerLink`, `routerLinkActive`), programmatic navigation (`router.navigate`), dynamic route parameters (`:id`), URL query parameters (`queryParamMap`), route `data`, navigation `state`, browser document titles, and wildcard fallback (`**`). |

---

## 5. API Documentation

### 5.1 Server Configuration
- **Base URL:** `http://localhost:3000`
- **Resource Collection:** `/students`
- **Start Command:** `npm run api` (executes `json-server db.json --port 3000`)
- **Content Type:** `application/json`

### 5.2 Student Resource Schema

| Field | Type | Constraints / Format | Example |
| --- | --- | --- | --- |
| `id` | `string` | Unique identifier assigned by `json-server` on `POST` | `"1"` |
| `studentNumber` | `string` | Required, pattern `^\d{4}-\d{4}$` | `"2023-0101"` |
| `fullName` | `string` | Required, 3 to 80 characters | `"Elena Cruz"` |
| `email` | `string` | Required, valid email address | `"elena.cruz@univ.edu"` |
| `course` | `string` | Required (`BSCS`, `BSIT`, `BSIS`, `BSCE`, `BSECE`) | `"BSCS"` |
| `yearLevel` | `number` | Required integer (`1`, `2`, `3`, or `4`) | `4` |
| `gpa` | `number` | Required decimal between `0.00` and `4.00` | `3.88` |
| `status` | `string` | Required (`Active`, `Probation`, `On Leave`, `Graduated`) | `"Active"` |
| `enrolledDate` | `string` | Required ISO date `YYYY-MM-DD` | `"2023-08-14"` |
| `advisor` | `string` | Required, 3 to 80 characters | `"Dr. Ramon Santos"` |

### 5.3 Endpoints Reference

| Operation | HTTP Method | Endpoint | Success Status | Description |
| --- | --- | --- | --- | --- |
| List all students | `GET` | `/students` | `200 OK` | Returns the full array of student objects from `db.json`. |
| View single student | `GET` | `/students/:id` | `200 OK` | Returns a single student matching `id`, or `404 Not Found`. |
| Register student | `POST` | `/students` | `201 Created` | Persists a new student record and returns the saved object with its generated `id`. |
| Update student | `PUT` | `/students/:id` | `200 OK` | Replaces the full student record matching `id` and returns the updated object. |
| Delete student | `DELETE` | `/students/:id` | `200 OK` | Permanently removes the student record matching `id` from `db.json`. |

### 5.4 Sample JSON Requests and Responses

#### `GET /students` (`200 OK`)
```json
[
  {
    "id": "1",
    "studentNumber": "2023-0101",
    "fullName": "Elena Cruz",
    "email": "elena.cruz@univ.edu",
    "course": "BSCS",
    "yearLevel": 4,
    "gpa": 3.88,
    "status": "Active",
    "enrolledDate": "2023-08-14",
    "advisor": "Dr. Ramon Santos"
  },
  {
    "id": "2",
    "studentNumber": "2024-0214",
    "fullName": "Marco Villanueva",
    "email": "marco.villanueva@univ.edu",
    "course": "BSIT",
    "yearLevel": 3,
    "gpa": 3.42,
    "status": "Active",
    "enrolledDate": "2024-08-12",
    "advisor": "Prof. Carla Mendoza"
  }
]
```

#### `GET /students/1` (`200 OK`)
```json
{
  "id": "1",
  "studentNumber": "2023-0101",
  "fullName": "Elena Cruz",
  "email": "elena.cruz@univ.edu",
  "course": "BSCS",
  "yearLevel": 4,
  "gpa": 3.88,
  "status": "Active",
  "enrolledDate": "2023-08-14",
  "advisor": "Dr. Ramon Santos"
}
```

#### `POST /students`
**Request Body:**
```json
{
  "studentNumber": "2026-0601",
  "fullName": "Andrea Tolentino",
  "email": "andrea.tolentino@univ.edu",
  "course": "BSIT",
  "yearLevel": 2,
  "gpa": 3.74,
  "status": "Active",
  "enrolledDate": "2026-08-20",
  "advisor": "Prof. Carla Mendoza"
}
```

**Response (`201 Created`):**
```json
{
  "id": "Kub7wECDAIQ",
  "studentNumber": "2026-0601",
  "fullName": "Andrea Tolentino",
  "email": "andrea.tolentino@univ.edu",
  "course": "BSIT",
  "yearLevel": 2,
  "gpa": 3.74,
  "status": "Active",
  "enrolledDate": "2026-08-20",
  "advisor": "Prof. Carla Mendoza"
}
```

#### `PUT /students/Kub7wECDAIQ`
**Request Body:**
```json
{
  "id": "Kub7wECDAIQ",
  "studentNumber": "2026-0601",
  "fullName": "Andrea Tolentino",
  "email": "andrea.tolentino@univ.edu",
  "course": "BSIT",
  "yearLevel": 2,
  "gpa": 3.91,
  "status": "Probation",
  "enrolledDate": "2026-08-20",
  "advisor": "Prof. Carla Mendoza"
}
```

**Response (`200 OK`):**
```json
{
  "id": "Kub7wECDAIQ",
  "studentNumber": "2026-0601",
  "fullName": "Andrea Tolentino",
  "email": "andrea.tolentino@univ.edu",
  "course": "BSIT",
  "yearLevel": 2,
  "gpa": 3.91,
  "status": "Probation",
  "enrolledDate": "2026-08-20",
  "advisor": "Prof. Carla Mendoza"
}
```

#### `DELETE /students/Kub7wECDAIQ`
**Response (`200 OK`):**
```json
{
  "id": "Kub7wECDAIQ",
  "studentNumber": "2026-0601",
  "fullName": "Andrea Tolentino",
  "email": "andrea.tolentino@univ.edu",
  "course": "BSIT",
  "yearLevel": 2,
  "gpa": 3.91,
  "status": "Probation",
  "enrolledDate": "2026-08-20",
  "advisor": "Prof. Carla Mendoza"
}
```
Removes the matching student entry permanently from `db.json`.

#### Error Handling Responses
- **`404 Not Found`** (e.g., `GET /students/999`): `StudentService.handleError()` intercepts the `HttpErrorResponse` and emits `"The requested student record was not found."`
- **Network Error (`status: 0`)** (when `json-server` is offline): `StudentService.handleError()` emits `"Cannot reach the local API server at http://localhost:3000. Start json-server and retry."`
- **Client / Server Errors (`4xx` / `5xx`):** Normalized into human-readable action messages (`"Request rejected (4xx)..."` or `"The API server encountered an internal error (5xx)..."`) displayed in UI alert banners.

---

## 6. Exploration Report: Angular Router

### 6.1 What Feature Was Explored and Why It Is Useful
Our group explored **Angular Router (`@angular/router`)**. In a multi-view administrative tool such as a Student Information Manager, rendering every screen conditionally with boolean flags inside a single root component breaks core browser expectations: users cannot bookmark a student's profile, cannot share a pre-filtered roster link (such as all 2nd Year BSCS students), and cannot press the browser Back or Forward buttons to return to a previous screen.

**Angular Router** solves these issues by mapping browser URL paths, dynamic segments, and query parameters directly to standalone Angular components inside a `<router-outlet>` without performing full-page document reloads. It also synchronizes browser `<title>` tags per route, tracks active links declaratively via `routerLinkActive`, passes ephemeral cross-route confirmation messages via `history.state`, and provides wildcard fallbacks for unrecognized URLs.

### 6.2 Sources Consulted
1. **Angular Official Routing Guide** (`https://angular.dev/guide/routing`): Standalone `provideRouter(routes)` setup, route order precedence, parameterized routes, and wildcard redirects.
2. **Angular API Reference: `ActivatedRoute` & `Router`** (`https://angular.dev/api/router/ActivatedRoute`, `https://angular.dev/api/router/Router`): Reactive `paramMap`, `queryParamMap`, `data` Observables, and `Router.events` filtering with `NavigationEnd`.
3. **Angular API Reference: `RouterLinkActive`** (`https://angular.dev/api/router/RouterLinkActive`): Applying exact-match active styling (`[routerLinkActiveOptions]="{ exact: true }"`) to top-level navigation items.
4. **Angular Zoneless & Signals Interop Guide** (`https://angular.dev/guide/zoneless`): Ensuring Router event subscriptions and HTTP callbacks trigger deterministic UI updates through Angular Signals in zoneless Angular 22 applications.
5. **RxJS `switchMap` & `combineLatest` Documentation** (`https://rxjs.dev/api/operators/switchMap`, `https://rxjs.dev/api/index/function/combineLatest`): Canceling in-flight HTTP requests when route parameters change rapidly.

### 6.3 Experiment Performed
To evaluate Angular Router behavior in standalone Angular 22, a structured four-part routing experiment was carried out:

1. **Route Precedence Test:** Verified how Angular's first-match-wins algorithm behaves when both a static route (`students/new`) and a dynamic parameter route (`students/:id`) share the `/students/` prefix.
2. **Same-Component Reuse Test:** Navigated directly between `/students/new`, `/students/:id`, and `/students/:id?edit=true` while all three URLs resolved to `StudentDetailComponent`, verifying whether `ngOnInit()` re-executed or whether reactive Observable subscriptions were required.
3. **Query Parameter Synchronization Test:** Wired Dashboard program/year cards to navigate via `router.navigate(['/students'], { queryParams: { course } })`, then modified search and dropdown filters in `StudentListComponent` to confirm bidirectional URL synchronization and reload persistence.
4. **Navigation State & Fallback Test:** Verified transient banner messaging via `router.navigate(['/students', created.id], { state: { feedback } })`, tested invalid IDs (`/students/999`), and verified arbitrary invalid routes (`/does-not-exist`) redirected cleanly to `/dashboard`.

### 6.4 Problems Occurred and How They Were Resolved

1. **Problem 1: Static vs. Parameterized Route Collision (`/students/new` vs. `/students/:id`)**
   - *Symptom:* Because Angular Router uses first-match-wins evaluation, placing `{ path: 'students/:id' }` before `{ path: 'students/new' }` caused `/students/new` to match `:id = "new"`, prompting `StudentDetailComponent` to call `GET http://localhost:3000/students/new` and display a 404 error instead of the registration form.
   - *Resolution:* Declared `{ path: 'students/new', component: StudentDetailComponent, data: { mode: 'create' } }` strictly above `{ path: 'students/:id', component: StudentDetailComponent, data: { mode: 'view' } }` in `src/app/app.routes.ts`, and verified precedence in `src/app/app.component.spec.ts`.

2. **Problem 2: Component Reuse Without Re-Initializing Lifecycle Hooks**
   - *Symptom:* Reading `route.snapshot.paramMap.get('id')` inside `ngOnInit()` failed whenever a user navigated from `/students/new` to `/students/<createdId>` or switched from view mode to `?edit=true`, because Angular reused the active `StudentDetailComponent` instance without calling `ngOnInit()` a second time.
   - *Resolution:* Replaced snapshot lookups with a reactive `combineLatest([this.route.data, this.route.paramMap, this.route.queryParamMap])` pipeline chained into `switchMap(...)` and `takeUntilDestroyed(this.destroyRef)`. This updates the component on every route or query change and automatically cancels stale HTTP requests.

3. **Problem 3: Zoneless Angular 22 Change Detection with Router & Async Streams**
   - *Symptom:* Angular 22 scaffolds applications in zoneless mode (no `zone.js`). Mutating plain class properties inside asynchronous `Router.events` or `HttpClient` subscriptions does not schedule change detection reliably on its own.
   - *Resolution:* Stored all reactive UI state (`currentPath`, `students`, `pageState`, `isLoading`, `errorMessage`, `feedbackMessage`) in Angular Signals (`signal()` and `computed()`), guaranteeing immediate, glitch-free DOM updates on every route transition and HTTP emission.

4. **Problem 4: Empty Query Parameters Polluting Browser History**
   - *Symptom:* Updating filter URLs with empty strings (`?q=&course=&yearLevel=`) produced noisy URLs and polluted the browser Back stack on every keystroke.
   - *Resolution:* Mapped empty filter values to `null` inside `router.navigate([], { relativeTo: this.route, queryParams: { q: q || null, course: course || null, yearLevel: yearLevel || null }, replaceUrl: true })`, removing cleared parameters cleanly while preserving Back button ergonomics.

### 6.5 How the Final Implementation Works
- **`src/app/app.config.ts`** registers routing globally through `provideRouter(routes, withComponentInputBinding())` alongside `provideHttpClient(withFetch())`.
- **`src/app/app.routes.ts`** defines 6 routes: `''` -> `/dashboard`, `/dashboard`, `/students`, `/students/new`, `/students/:id`, and wildcard `**` -> `/dashboard`. Each primary route declares a unique document `title`.
- **`NavbarComponent`** uses declarative `routerLink` and `routerLinkActive` with `[routerLinkActiveOptions]="{ exact: true }"` to highlight the active tab with a crisp 2px bottom indicator, while subscribing to `Router.events` (`NavigationEnd`) to render the live active route path in monospace.
- **`DashboardComponent`** uses programmatic navigation (`openCourseFilter()` and `openYearFilter()`) to pass `?course=` or `?yearLevel=` query parameters directly into `StudentListComponent`, turning overview statistics into actionable filters.
- **`StudentListComponent`** subscribes to `ActivatedRoute.queryParamMap` to hydrate its search and dropdown signals from URL parameters, executes filtered lookups through `StudentService.searchStudents()`, and writes updated filter states back to the URL.
- **`StudentDetailComponent`** serves three distinct workflows (`/students/new`, `/students/:id`, and `/students/:id?edit=true`) from a single reusable component switched cleanly via `@switch (pageState())`, passing confirmation banners across navigations via router navigation `state`.

### 6.6 AI Assistance and Adapted Code Disclosure
During development, our team used AI assistance (**Antigravity / Gemini**) as a Socratic tutor to help navigate Angular 22's zoneless change detection architecture, Signals-to-RxJS interoperability, and Angular Router edge cases (such as static-before-dynamic route precedence and `combineLatest` reactive route reloading). No code was copied blindly; every component, service, route configuration, and stylesheet was reviewed, tested live against `json-server`, verified through automated Vitest specs, and is fully understood by all group members for individual defense questioning.

---

## 7. Installation Guide

Follow these exact steps to install dependencies, launch the mock REST API, and run the Angular application locally.

### 7.1 Prerequisites Check
Verify that **Node.js** (v20.19+ or v22+) and **npm** (v10+) are installed on your machine:

```bash
node -v
npm -v
```

### 7.2 Install Dependencies
Open a terminal in the project root folder (`StudentInformationManagement`) and install all required npm packages (including Angular 22, RxJS, `json-server`, and Vitest):

```bash
cd StudentInformationManagement
npm install
```

### 7.3 Run the Mock API and Angular Server
The application requires **two concurrent terminal windows** running at the same time:

**Terminal 1 — Start the local `json-server` mock REST API (Port `3000`):**
```bash
npm run api
```
Verify that the API endpoint is serving `db.json` at `http://localhost:3000/students`.

**Terminal 2 — Start the Angular development server (Port `4200`):**
```bash
npm start
```
Once compiled, open `http://localhost:4200` in your browser (it automatically redirects to `http://localhost:4200/dashboard`).

### 7.4 Optional Build and Test Commands
```bash
# Run TypeScript strict type-checking
npx tsc --noEmit

# Run the Vitest automated unit test suite
npm test

# Create a production build in dist/student-information-manager
npm run build
```

---

## 8. Testing Results

### 8.1 Automated Unit Tests (Vitest)
Executed via `npx ng test --watch=false` following final code edits:
- `src/app/services/student.service.spec.ts`: **6 passed / 6 total** (GET list, multi-criteria search/filter, POST create, PUT update, DELETE remove, HTTP status 0 error mapping).
- `src/app/app.component.spec.ts`: **2 passed / 2 total** (root shell rendering with `<app-navbar>` + `<router-outlet>`, route redirects `/` -> `/dashboard`, `/students/new` precedence, wildcard fallback `/**` -> `/dashboard`).
- **Build & Typecheck:** `npx tsc --noEmit` exited `0`; `npm run build` produced `dist/student-information-manager` (`387.61 kB` initial bundle, `97.16 kB` transfer) with **0 errors and 0 warnings**.

### 8.2 End-to-End Functional Test Cases (10 Cases)
All 10 test cases were executed live against the running Angular development server (`http://localhost:4200`) and local `json-server` mock API (`http://localhost:3000/students`).

| Test ID | Category | Test Scenario | Steps Executed | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- | --- |
| **TC-01** | Routing & Normal Load | Default redirect and Dashboard summary computation | 1. Open `http://localhost:4200/`.<br>2. Wait for `GET /students` to resolve. | Redirects to `/dashboard`; shows 5 enrolled students, 3 Active, 2 Probation/On Leave, Mean GPA `3.24`, course/year breakdowns, and 5 recent rows. | Redirected to `http://localhost:4200/dashboard`; rendered `5`, `3`, `2`, `3.24`, BSCS `2 (40%)`, all 4 year levels, and 5 recent rows. Console errors: `0`. | **PASS** |
| **TC-02** | Angular Router Drill-Down | Navigate from Dashboard program breakdown to filtered Student List | 1. On `/dashboard`, click `BSCS` in Enrollment by Program.<br>2. Click `Clear Filters`. | Navigates to `/students?course=BSCS` displaying 2 BSCS records; clearing filters returns URL to `/students` with all 5 records. | URL updated to `/students?course=BSCS` showing Elena Cruz and Hannah Reyes; `Clear Filters` restored `/students` and all 5 rows. | **PASS** |
| **TC-03** | Search, Filters & Empty State | Combine Course, Year Level, and non-matching Search term | 1. On `/students`, choose Course `BSCS` and Year Level `2nd Year`.<br>2. Type `zzzz-no-match` in Search.<br>3. Click `Reset Filters`. | Filters down to Hannah Reyes with URL `?course=BSCS&yearLevel=2`; search shows `"No matching students"` empty state; reset restores 5 rows. | URL became `/students?course=BSCS&yearLevel=2` (1 row: Hannah Reyes); non-matching query displayed `"No matching students"`; `Reset Filters` restored 5 rows. | **PASS** |
| **TC-04** | Invalid Input Validation | Submit empty and malformed data on registration form | 1. Click `Register Student` (`/students/new`).<br>2. Click submit with blank fields.<br>3. Enter Student No. `123`, Email `not-an-email`, GPA `4.9` and submit. | Blocks HTTP `POST`; shows validation summary banner and inline messages below each invalid control. | Remained on `/students/new`; displayed `"Validation Error"` banner plus inline messages `"Use format YYYY-NNNN (example: 2026-0142)."`, `"Enter a valid email address."`, and `"GPA must be between 0.00 and 4.00."`. | **PASS** |
| **TC-05** | Create CRUD & Persistence | Register valid student and reload browser | 1. On `/students/new`, enter valid details for `Andrea Tolentino` (`2026-0601`, `BSIT`, 2nd Year, GPA `3.74`).<br>2. Submit.<br>3. Reload the browser page. | Sends `POST /students` (201), navigates to `/students/:newId`, shows success banner, and retains data after reload. | Redirected to `/students/Kub7wECDAIQ` with confirmation banner mentioning `Andrea Tolentino`; full reload fetched and displayed identical persisted record. | **PASS** |
| **TC-06** | Update CRUD & Persistence | Edit existing student record and verify persistence | 1. On `Andrea Tolentino`'s detail page, click `Edit Record`.<br>2. Change GPA to `3.91` and Standing to `Probation`.<br>3. Click `Save Changes` and reload page. | URL appends `?edit=true` with prefilled inputs; `PUT /students/:id` saves changes, returns to view mode with confirmation banner, and persists after reload. | Navigated to `?edit=true`, saved via `PUT`, displayed `"Confirmed: Saved updates for Andrea Tolentino."`, `3.91 / 4.00`, and `Probation`; persisted after reload. | **PASS** |
| **TC-07** | Delete CRUD & Keyboard Cancel | Guarded deletion with `Escape` cancellation followed by confirmed delete | 1. On `/students`, click `Delete` on `Andrea Tolentino`.<br>2. Press `Escape`.<br>3. Click `Delete` again and click `Delete Record`. | Confirmation dialog opens; `Escape` closes dialog without deleting; confirming sends `DELETE /students/:id`, shows success banner, and returns count to 5. | `Escape` closed `alertdialog` with count remaining 6; confirming deleted the record, showed `"Confirmed: Deleted record for Andrea Tolentino (2026-0601)."`, and returned count to 5. | **PASS** |
| **TC-08** | Invalid Route Parameter | Request a non-existent student ID directly | 1. Navigate directly to `http://localhost:4200/students/999`.<br>2. Click `Back to Student Directory`. | Handles `404 Not Found` cleanly with error message and recovery button back to `/students`. | Rendered `"Unable to open student record"` and `"The requested student record was not found."`; button returned cleanly to `/students`. | **PASS** |
| **TC-09** | Wildcard Route & Responsive Reflow | Unmatched route redirect plus mobile/tablet overflow and mobile menu check | 1. Navigate to `http://localhost:4200/does-not-exist`.<br>2. Test `390x844` (mobile) and `768x1024` (tablet) viewports.<br>3. Toggle mobile `Menu` and close via `Escape`. | Redirects to `/dashboard`; zero horizontal overflow across all viewports; mobile drawer opens and closes via `Escape`. | Redirected to `/dashboard`; `body`/`table` widths stayed within viewport on `390x844` (`349px <= 375px`) and `768x1024` (`747px <= 768px`) with 0 overflow; mobile `Menu` opened (`aria-expanded="true"`) and closed on `Escape`. | **PASS** |
| **TC-10** | API Failure & Recovery | Stop `json-server`, observe offline error UI, restart API, and click `Retry` | 1. Stop `json-server` on port `3000`.<br>2. Reload `/dashboard` and open `/students`.<br>3. Restart `json-server` and click `Retry`. | Displays actionable offline error banner (`http://localhost:3000`) with zero uncaught crashes; clicking `Retry` clears banner and reloads all 5 students. | Both `/dashboard` and `/students` rendered red alert banners (`"Cannot reach the local API server at http://localhost:3000. Start json-server and retry."`) with 0 console errors; clicking `Retry` after restart cleared the alert and loaded all 5 records. | **PASS** |

---

## 9. Member Contributions, Reflections, and References

### 9.1 Member Contributions
All group members actively participated in exploring **Angular Router**, contributing code, reviewing pull changes, and studying the complete application for individual defense questioning.

| Member Name | Assigned Rubric Role | Specific Project Contributions |
| --- | --- | --- |
| **Joevan Delos Santos** | Project coordination, component structure, and integration | Coordinated milestones, designed the standalone component architecture, configured `app.routes.ts` and `app.config.ts`, implemented `AppComponent` and `NavbarComponent`, and integrated all routed views with Angular Router. |
| **Jaztin Hart Alejo** | Interface, forms, data binding, and styling | Built the global dark-zinc design system (`styles.css`), responsive breakpoints and mobile table reflow, template-driven student registration/edit forms (`StudentDetailComponent`), two-way `[(ngModel)]` bindings, and inline validation feedback. |
| **Richmon Ecal** | Services, API integration, and data persistence | Designed `student.model.ts`, implemented the injectable `StudentService` (`HttpClient` CRUD operations, RxJS multi-criteria search projection, and HTTP error normalization), and set up `db.json` with `json-server` persistence. |
| **John Yzhekiel Millar** | Testing, documentation coordination, and verification | Implemented directory filter/query-parameter workflows (`StudentListComponent`), authored automated Vitest unit tests (`student.service.spec.ts` and `app.component.spec.ts`), and verified API offline recovery and persistence behavior. |
| **Celine Licanda** | Testing, documentation coordination, and verification | Executed the 10 live end-to-end test cases (`TC-01`–`TC-10`), verified responsive accessibility across mobile and desktop viewports, and coordinated the final API reference, exploration report, and print-ready PDF documentation. |

### 9.2 Group Reflection
Building the Student Information Manager taught our group how Angular Router, injectable services, RxJS Observables, and Signals work together to keep URL state, live API persistence, and UI feedback cleanly synchronized without page reloads. Resolving real challenges—especially static-before-dynamic route ordering, same-component reuse via `combineLatest`, and zoneless Angular 22 change detection—gave every member much stronger confidence in designing and debugging production-style single-page applications.

### 9.3 References
1. Angular Team. *Routing in Angular — Official Guide*. Available at: https://angular.dev/guide/routing
2. Angular Team. *`ActivatedRoute` API Reference*. Available at: https://angular.dev/api/router/ActivatedRoute
3. Angular Team. *`Router` and `RouterLinkActive` API Reference*. Available at: https://angular.dev/api/router/Router
4. Angular Team. *Angular Zoneless Change Detection & Signals Guide*. Available at: https://angular.dev/guide/zoneless
5. Angular Team. *HTTP Client (`provideHttpClient`) Guide*. Available at: https://angular.dev/guide/http
6. RxJS Team. *RxJS Documentation — `Observable`, `switchMap`, `combineLatest`, `debounceTime`, and `catchError`*. Available at: https://rxjs.dev/guide/overview
7. Typicode. *`json-server` — Full Fake REST API Documentation*. Available at: https://github.com/typicode/json-server
8. Vitest Team. *Vitest Testing Framework Documentation*. Available at: https://vitest.dev/guide/
