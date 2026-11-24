# Student Information Manager

A utilitarian, high-density Angular 22 web application for managing university student records, built with modern Angular control flow (`@if`, `@for`, `@switch`), RxJS Observables, injected Angular Services, Angular Router, and a local `json-server` REST API.

## Quick Start

Run the mock REST API and Angular development server in two separate terminals:

```bash
# Terminal 1: Start json-server on http://localhost:3000
npm run api

# Terminal 2: Start Angular dev server on http://localhost:4200
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

## Available Scripts

- `npm run api`: Starts `json-server` serving `db.json` at `http://localhost:3000/students`
- `npm start`: Launches the Angular development server on port `4200`
- `npm run build`: Builds the production bundle into `dist/student-information-manager`
- `npm test`: Runs the Vitest unit test suite

## Application Routes

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | Redirect | Redirects to `/dashboard` |
| `/dashboard` | `DashboardComponent` | Live enrollment overview with clickable program and year-level drill-downs |
| `/students` | `StudentListComponent` | Searchable, filterable student directory synchronized with URL query params |
| `/students/new` | `StudentDetailComponent` | Validated student registration form (`POST /students`) |
| `/students/:id` | `StudentDetailComponent` | Student academic dossier view, edit mode (`?edit=true`), and deletion |
| `/**` | Redirect | Wildcard fallback to `/dashboard` |

## Documentation

Complete project documentation ready for PDF export is included in:

- `docs/PROJECT_DOCUMENTATION.md` (Markdown source)
- `docs/PROJECT_DOCUMENTATION.html` (Print-styled HTML; open in a browser and use Print -> Save as PDF)
