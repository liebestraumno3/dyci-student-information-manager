import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

describe('AppComponent & Routing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create the root application shell with navbar and router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance).toBeTruthy();
    expect(compiled.querySelector('app-navbar')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should redirect empty path to /dashboard and match /students/new before /students/:id', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    expect(router.url).toBe('/dashboard');

    await router.navigateByUrl('/students/new');
    expect(router.url).toBe('/students/new');

    await router.navigateByUrl('/unknown-route');
    expect(router.url).toBe('/dashboard');
  });
});
