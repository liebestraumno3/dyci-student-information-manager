# Student Information Manager

**University Finals Project Documentation**

- **Framework:** Angular 22 (Standalone Architecture, Modern Control Flow, Signals, Zoneless Change Detection)
- **Reactive Layer:** RxJS 7.8 Observables & `HttpClient`
- **Navigation Exploration Feature:** Angular Router (`@angular/router`)
- **Mock Backend:** `json-server` (`http://localhost:3000/students`)
- **Test Runner:** Vitest 4 + Live Browser End-to-End Verification

---

## 1. Project Overview

### 1.1 Problem Statement
Academic departments and university registrars routinely manage student enrollment records across multiple degree programs and year levels. In small-scale or instructional settings, tracking student numbers, degree programs, academic standing (Active, Probation, On Leave, Graduated), GPA, and assigned faculty advisors using spreadsheets leads to formatting errors, inconsistent data entry, poor searchability, and broken cross-references between summary counts and individual profiles.

The **Student Information Manager (SIM)** solves this problem by providing a structured, single-page web application with strict input validation, live CRUD persistence over a REST API, instant multi-criteria filtering, and URL-driven routing between overview metrics, directory records, and detailed student dossiers.

### 1.2 Intended Users
- **University Registrar Clerks:** Register new students, update academic standing or GPA after each term, and maintain accurate contact and advisor details.
- **Faculty Advisors:** Search advisees quickly by name, student number, or advisor name, and inspect individual student records during advising sessions.
- **Department Coordinators:** Review enrollment distribution by degree program (`BSCS`, `BSIT`, `BSIS`, `BSCE`, `BSECE`) and year level (1st through 4th Year), then click directly into filtered student rosters.

### 1.3 Objectives
1. Implement a modular Angular single-page application composed of at least four standalone components (`NavbarComponent`, `DashboardComponent`, `StudentListComponent`, and `StudentDetailComponent`) backed by a single injectable `StudentService`.
2. Demonstrate modern Angular template syntax (`@if`, `@for` with `track`, and `@switch`), all four Angular data bindings (interpolation, property binding, event binding, and two-way binding), and RxJS Observable streams.
3. Implement full CRUD operations (Create, Read, Update, Delete) alongside real-time search and filters for `course` and `yearLevel` against a local `json-server` mock REST API.
4. Explore and apply **Angular Router** thoroughly, including default redirects, parameterized routes, static route precedence, URL-synchronized query parameters, programmatic navigation, route metadata titles, and wildcard fallbacks.
5. Deliver a high-contrast, utilitarian dark-mode interface (inspired by Linear and Raycast) that satisfies WCAG AA contrast requirements, keyboard accessibility, responsive mobile reflow, and complete UI state handling (loading, empty, success, error, and validation).

### 1.4 Scope
- **In Scope:**
  - Live Academic Overview dashboard computed directly from persisted API data.
  - Searchable, filterable Student Directory synchronized with browser URL query parameters (`?q=`, `?course=`, `?yearLevel=`).
  - Unified Student Record view supporting Profile Inspection (`/students/:id`), Student Registration (`/students/new`), and Inline Editing (`/students/:id?edit=true`).
  - Safe record deletion with explicit keyboard-accessible confirmation (`Escape` to cancel).
  - Full client-side form validation with contextual inline error messages.
  - Complete unit test coverage (`StudentService` HTTP operations and route matching) and 10 end-to-end verification test cases.

### 1.5 Limitations
- **Local Mock Persistence:** Data is stored in a local `db.json` file served by `json-server` rather than a multi-user relational database (PostgreSQL/MySQL). Concurrent writes from multiple clients are not locked or transactional.
- **No Authentication or Role-Based Access Control (RBAC):** All users with access to the local development server can create, edit, and delete student records.
- **Client-Side Search Projection:** Because `json-server` v1 removed legacy `?q=` full-text query parameters, multi-field search filtering is executed in the RxJS pipeline inside `StudentService.searchStudents()` after retrieving `/students`, which suits small-to-medium cohorts (hundreds of students) rather than tens of thousands of records without server-side pagination.
- **Single-Term GPA Snapshot:** The model stores current cumulative GPA rather than per-semester transcript history.

---

## 2. Application Structure

### 2.1 Directory Layout

```text
StudentInformationManagement/
├── db.json                                  # Local json-server database (5 seed students)
├── package.json                             # Dependencies and npm scripts (start, api, build, test)
├── src/
│   ├── index.html                           # Application shell and IBM Plex fonts
│   ├── main.ts                              # Standalone bootstrap entry point
│   ├── styles.css                           # Global WCAG AA dark-zinc tokens & shared table/button CSS
│   └── app/
│       ├── app.config.ts                    # ApplicationConfig: provideRouter + provideHttpClient
│       ├── app.routes.ts                    # Centralized Angular Router table
│       ├── app.component.{ts,html,css}      # Root layout: skip-link, NavbarComponent, <router-outlet>
│       ├── app.component.spec.ts            # Root shell & routing unit tests
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

### 2.2 Component and Service Responsibilities

| Artifact | File Path | Core Responsibilities |
| --- | --- | --- |
| **Student Model** | `src/app/models/student.model.ts` | Defines strict TypeScript types (`Student`, `StudentPayload`, `StudentStatus`, `YearLevel`, `StudentFilterCriteria`) and shared constants (`COURSE_OPTIONS`, `YEAR_LEVEL_OPTIONS`, `STATUS_OPTIONS`). |
| **StudentService** | `src/app/services/student.service.ts` | Root-injected singleton (`providedIn: 'root'`) encapsulating all HTTP communication with `http://localhost:3000/students` (`getStudents`, `getStudentById`, `searchStudents`, `addStudent`, `updateStudent`, `deleteStudent`) and centralized `HttpErrorResponse` normalization. |
| **App Routing** | `src/app/app.routes.ts` | Declares all application routes, static-before-dynamic route precedence (`/students/new` before `/students/:id`), route `data` flags, browser `<title>` metadata, default empty-path redirect, and wildcard fallback. |
| **NavbarComponent** | `src/app/components/navbar/navbar.component.ts` | Persistent top navigation bar with `routerLink` destinations (`Dashboard`, `Students`, `Register Student`), active route underlines via `routerLinkActive`, live active path readout subscribed to `Router.events` (`NavigationEnd`), and an accessible mobile `Menu` drawer closable via `Escape`. |
| **DashboardComponent** | `src/app/components/dashboard/dashboard.component.ts` | Fetches live student records on initialization, derives summary figures (`totalStudents`, `activeCount`, `attentionCount`, `averageGpa`), renders clickable Course and Year Level breakdowns that programmatically navigate to pre-filtered `/students` URLs, and lists recent registrations with direct profile links. |
| **StudentListComponent** | `src/app/components/student-list/student-list.component.ts` | Full student directory supporting debounced RxJS search (`Subject` + `debounceTime` + `switchMap`), `course` and `yearLevel` dropdown filters synchronized bidirectionally with URL query parameters, loading/empty/error states, inline `View`/`Edit` routing, and guarded `Delete` confirmation (`Escape` to cancel). |
| **StudentDetailComponent** | `src/app/components/student-detail/student-detail.component.ts` | Multi-mode detail component driven by `ActivatedRoute` (`data`, `paramMap`, and `queryParamMap`). Renders the validated registration form (`/students/new`), read-only Academic Dossier (`/students/:id`), pre-filled edit form (`/students/:id?edit=true`), record deletion, and 404/network recovery states. |

---

## 3. Topic Mapping

The table below maps every required Angular and RxJS curriculum topic to its exact location and implementation inside the codebase.

| Angular / RxJS Concept | Where Used in Code | Implementation Details |
| --- | --- | --- |
| **Interpolation (`{{ ... }}`)** | `navbar.component.html`, `dashboard.component.html`, `student-list.component.html`, `student-detail.component.html` | Renders live values such as `{{ currentPath() }}`, `{{ totalStudents() }}`, `{{ averageGpa() \| number: '1.2-2' }}`, `{{ student.fullName }}`, `{{ student.studentNumber }}`, `{{ feedbackMessage() }}`, `{{ errorMessage() }}`, and `{{ breadcrumbLabel() }}`. |
| **Property Binding (`[...]`)** | `navbar.component.html`, `dashboard.component.html`, `student-list.component.html`, `student-detail.component.html` | Binds DOM and directive properties dynamically: `[routerLink]="['/students', student.id]"`, `[queryParams]="{ edit: 'true' }"`, `[routerLinkActiveOptions]="{ exact: true }"`, `[style.width.%]="item.percentage"`, `[disabled]="isLoading()"`, `[disabled]="isSubmitting()"`, `[attr.aria-expanded]="mobileMenuOpen()"`, `[attr.aria-invalid]="..."`, `[ngValue]="year.value"`, and `[href]="'mailto:' + record.email"`. |
| **Event Binding (`(...)`)** | All 4 component templates + component `host` metadata | Handles user interactions: `(click)="openCourseFilter(item.course)"`, `(click)="loadStudents()"`, `(click)="clearFilters()"`, `(click)="requestDelete(student)"`, `(click)="confirmDelete()"`, `(click)="enterEditMode()"`, `(ngSubmit)="submitForm(studentForm)"`, `(ngModelChange)="onFiltersChanged()"`, and host keyboard listeners `'(document:keydown.escape)': 'cancelDelete()'` / `'closeMobileMenu()'`. |
| **Two-Way Binding (`[(ngModel)]`)** | `student-list.component.html` and `student-detail.component.html` | Synchronizes search and filter controls directly with writable signals (`[(ngModel)]="searchTerm"`, `[(ngModel)]="selectedCourse"`, `[(ngModel)]="selectedYearLevel"`) in `StudentListComponent`, and binds all 9 student form inputs (`[(ngModel)]="formModel.studentNumber"`, `fullName`, `email`, `course`, `yearLevel`, `gpa`, `status`, `enrolledDate`, `advisor`) in `StudentDetailComponent`. |
| **Control Flow: `@if` / `@else`** | `navbar.component.html`, `student-list.component.html`, `student-detail.component.html` | Conditionally renders the mobile navigation drawer (`@if (mobileMenuOpen())`), success and error banners (`@if (feedbackMessage())`), active filter clear button (`@if (hasActiveFilters())`), delete confirmation alert dialog (`@if (pendingDelete(); as target)`), and field-level validation messages (`@if (studentNumberCtrl.errors?.['required']) { ... } @else { ... }`). |
| **Control Flow: `@for` with `track`** | `dashboard.component.html`, `student-list.component.html`, `student-detail.component.html` | Iterates efficiently over collections with explicit identity tracking: `@for (student of students(); track student.id)`, `@for (item of courseBreakdown(); track item.course)`, `@for (year of yearBreakdown(); track year.yearLevel)`, `@for (course of courseOptions; track course)`, and loading skeleton rows `@for (row of [1, 2, 3, 4, 5]; track row)`. |
| **Control Flow: `@switch` / `@case` / `@default`** | `dashboard.component.html`, `student-list.component.html`, `student-detail.component.html` | Controls both view-state rendering (`@switch (viewState())` across `'loading'`, `'error'`, `'empty'`, `'empty-db'`, `'empty-filter'`, `'ready'`, and `@switch (pageState())` across `'loading'`, `'error'`, `'view'`, `'create'`, `'edit'`) and semantic academic standing display (`@switch (student.status)` for `'Active'`, `'Probation'`, `'On Leave'`, `@default`). |
| **RxJS Observables & Operators** | `student.service.ts`, `navbar.component.ts`, `dashboard.component.ts`, `student-list.component.ts`, `student-detail.component.ts` | `StudentService` returns typed `Observable<Student[]>`, `Observable<Student>`, and `Observable<void>` streams using `pipe(map(...), catchError(...))` and `throwError(...)`. `StudentListComponent` uses `Subject<StudentFilterCriteria>` with `debounceTime(120)`, `tap(...)`, `switchMap(...)`, and `catchError(() => of(null))`. `StudentDetailComponent` combines route streams using `combineLatest([route.data, route.paramMap, route.queryParamMap])` with `switchMap(...)`. `NavbarComponent` filters `router.events` for `NavigationEnd`. Every subscription uses `takeUntilDestroyed(this.destroyRef)` to prevent memory leaks. |
| **Injected Angular Services** | `student.service.ts`, `app.config.ts`, `dashboard.component.ts`, `student-list.component.ts`, `student-detail.component.ts` | `StudentService` is decorated with `@Injectable({ providedIn: 'root' })`, registers `HttpClient` via `provideHttpClient(withFetch())` in `app.config.ts`, and is consumed via Angular's functional `inject(StudentService)` API across components. |
| **Angular Router** | `app.routes.ts`, `app.config.ts`, `app.component.html`, and all 4 components | Configured via `provideRouter(routes, withComponentInputBinding())`, rendering active views inside `<router-outlet />`, declarative links (`routerLink`, `routerLinkActive`), programmatic navigation (`router.navigate`), dynamic route parameters (`:id`), URL query parameters (`queryParamMap`), route `data`, navigation `state`, and browser document titles. |

---

## 4. API Documentation

### 4.1 Server Configuration
- **Base URL:** `http://localhost:3000`
- **Resource Collection:** `/students`
- **Start Command:** `npm run api` (executes `json-server db.json --port 3000`)
- **Content Type:** `application/json`

### 4.2 Student Resource Schema

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

### 4.3 Endpoints Reference

| Operation | HTTP Method | Endpoint | Success Status | Description |
| --- | --- | --- | --- | --- |
| List all students | `GET` | `/students` | `200 OK` | Returns the full array of student objects from `db.json`. |
| View single student | `GET` | `/students/:id` | `200 OK` | Returns a single student matching `id`, or `404 Not Found`. |
| Register student | `POST` | `/students` | `201 Created` | Persists a new student record and returns the saved object with its generated `id`. |
| Update student | `PUT` | `/students/:id` | `200 OK` | Replaces the full student record matching `id` and returns the updated object. |
| Delete student | `DELETE` | `/students/:id` | `200 OK` | Permanently removes the student record matching `id` from `db.json`. |

### 4.4 Sample JSON Requests and Responses

#### `GET /students` (200 OK)
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

#### `GET /students/1` (200 OK)
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
Returns the updated JSON object with `"gpa": 3.91` and `"status": "Probation"`.

#### `DELETE /students/Kub7wECDAIQ`
**Response (`200 OK`):**
Returns the removed JSON record and deletes the entry from `db.json`.

#### Error Handling Responses
- **`404 Not Found`** (e.g., `GET /students/999`): `StudentService.handleError()` intercepts the `HttpErrorResponse` and emits `"The requested student record was not found."`
- **Network Error (`status: 0`)** (when `json-server` is offline): `StudentService.handleError()` emits `"Cannot reach the local API server at http://localhost:3000. Start json-server and retry."`

---

## 5. Exploration Report: Angular Router

### 5.1 Why Angular Router Is Useful
In a multi-view administrative tool such as a Student Information Manager, rendering every screen conditionally with boolean flags inside a single root component breaks core browser expectations: users cannot bookmark a student's profile, cannot share a pre-filtered roster link (such as all 2nd Year BSCS students), and cannot press the browser Back or Forward buttons to return to a previous screen.

**Angular Router** solves these issues by mapping browser URL paths, dynamic segments, and query parameters directly to standalone Angular components inside a `<router-outlet>` without performing full-page document reloads. It also synchronizes browser `<title>` tags per route, tracks active links declaratively via `routerLinkActive`, passes ephemeral cross-route messages via `history.state`, and provides wildcard fallbacks for unrecognized URLs.

### 5.2 Sources Consulted
1. **Angular Official Routing Guide** (`https://angular.dev/guide/routing`): Standalone `provideRouter(routes)` setup, route order precedence, parameterized routes, and wildcard redirects.
2. **Angular API Reference: `ActivatedRoute` & `Router`** (`https://angular.dev/api/router/ActivatedRoute`, `https://angular.dev/api/router/Router`): Reactive `paramMap`, `queryParamMap`, `data` Observables, and `Router.events` filtering with `NavigationEnd`.
3. **Angular API Reference: `RouterLinkActive`** (`https://angular.dev/api/router/RouterLinkActive`): Applying exact-match active styling (`[routerLinkActiveOptions]="{ exact: true }"`) to top-level navigation items.
4. **Angular Zoneless & Signals Interop Guide** (`https://angular.dev/guide/zoneless`): Ensuring Router event subscriptions and HTTP callbacks trigger deterministic UI updates through Angular Signals in zoneless Angular 22 applications.
5. **RxJS `switchMap` & `combineLatest` Documentation** (`https://rxjs.dev/api/operators/switchMap`): Canceling in-flight HTTP requests when route parameters change rapidly.

### 5.3 Experiment Performed
To evaluate Angular Router behavior in standalone Angular 22, a structured four-part routing experiment was carried out:

1. **Route Precedence Test:** Verified how Angular's first-match-wins algorithm behaves when both a static route (`students/new`) and a dynamic parameter route (`students/:id`) share the `/students/` prefix.
2. **Same-Component Reuse Test:** Navigated directly between `/students/new`, `/students/:id`, and `/students/:id?edit=true` while all three URLs resolved to `StudentDetailComponent`, verifying whether `ngOnInit()` re-executed or whether reactive Observable subscriptions were required.
3. **Query Parameter Synchronization Test:** Wired Dashboard program/year cards to navigate via `router.navigate(['/students'], { queryParams: { course } })`, then modified search and dropdown filters in `StudentListComponent` to confirm bidirectional URL synchronization and reload persistence.
4. **Navigation State & Fallback Test:** Verified transient banner messaging via `router.navigate(['/students', created.id], { state: { feedback } })`, tested invalid IDs (`/students/999`), and verified arbitrary invalid routes (`/does-not-exist`) redirected cleanly to `/dashboard`.

### 5.4 Problems Encountered and How They Were Resolved

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

### 5.5 How the Final Implementation Works
- **`src/app/app.config.ts`** registers routing globally through `provideRouter(routes, withComponentInputBinding())` alongside `provideHttpClient(withFetch())`.
- **`src/app/app.routes.ts`** defines 6 routes: `''` -> `/dashboard`, `/dashboard`, `/students`, `/students/new`, `/students/:id`, and wildcard `**` -> `/dashboard`. Each primary route declares a unique document `title`.
- **`NavbarComponent`** uses declarative `routerLink` and `routerLinkActive` with `[routerLinkActiveOptions]="{ exact: true }"` to highlight the active tab with a crisp 2px bottom indicator, while subscribing to `Router.events` (`NavigationEnd`) to render the live active route path in monospace.
- **`DashboardComponent`** uses programmatic navigation (`openCourseFilter()` and `openYearFilter()`) to pass `?course=` or `?yearLevel=` query parameters directly into `StudentListComponent`, turning overview statistics into actionable filters.
- **`StudentListComponent`** subscribes to `ActivatedRoute.queryParamMap` to hydrate its search and dropdown signals from URL parameters, executes filtered lookups through `StudentService.searchStudents()`, and writes updated filter states back to the URL.
- **`StudentDetailComponent`** serves three distinct workflows (`/students/new`, `/students/:id`, and `/students/:id?edit=true`) from a single reusable component switched cleanly via `@switch (pageState())`, passing confirmation banners across navigations via router navigation `state`.

---

## 6. Testing Results

### 6.1 Automated Unit Tests (Vitest)
Executed via `npx ng test --watch=false` following final code edits:
- `src/app/services/student.service.spec.ts`: **6 passed / 6 total** (GET list, multi-criteria search/filter, POST create, PUT update, DELETE remove, HTTP status 0 error mapping).
- `src/app/app.component.spec.ts`: **2 passed / 2 total** (root shell rendering with `<app-navbar>` + `<router-outlet>`, route redirects `/` -> `/dashboard`, `/students/new` precedence, wildcard fallback `/**` -> `/dashboard`).
- **Build & Typecheck:** `npx tsc --noEmit` exited `0`; `npm run build` produced `dist/student-information-manager` (`387.61 kB` initial bundle, `97.16 kB` transfer) with **0 errors and 0 warnings**.

### 6.2 End-to-End Functional Test Cases (10 Cases)
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
