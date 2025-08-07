import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAuth();
    }
  }

  private initializeAuth(): void {
    try {
      const savedAuth = localStorage.getItem('photovault_auth');
      if (savedAuth) {
        this.currentUserSubject.next(JSON.parse(savedAuth));
      }
    } catch (error) {
      console.error('Failed to initialize auth from localStorage:', error);
    }
  }

  login(username: string, password: string): Observable<any> {
    const credentials = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    });

    // Test authentication with health endpoint
    return this.http.get(`${environment.apiUrl}/health`, { headers, responseType: 'text' })
      .pipe(
        map(response => {
          // If successful, store credentials (only in browser)
          const authData = { username, credentials };

          if (isPlatformBrowser(this.platformId)) {
            try {
              localStorage.setItem('photovault_auth', JSON.stringify(authData));
            } catch (error) {
              console.error('Failed to save auth to localStorage:', error);
            }
          }

          this.currentUserSubject.next(authData);
          return authData;
        }),
        catchError(error => {
          console.error('Authentication failed:', error);
          throw error;
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('photovault_auth');
      } catch (error) {
        console.error('Failed to remove auth from localStorage:', error);
      }
    }
    this.currentUserSubject.next(null);
  }

  getAuthHeaders(): HttpHeaders {
    const currentUser = this.currentUserSubject.value;
    if (currentUser && currentUser.credentials) {
      return new HttpHeaders({
        'Authorization': `Basic ${currentUser.credentials}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}
