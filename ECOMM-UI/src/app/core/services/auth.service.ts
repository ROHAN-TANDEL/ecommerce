import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private inMemoryAccessToken: string | null = null;
  public isAuthenticated = signal<boolean>(false);
  public user = signal<any>(null);

  private readonly API_URL = '/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  get accessToken(): string | null {
    return this.inMemoryAccessToken;
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res.status === 'success') {
          this.setSession(res.token.access, res.data);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData, { withCredentials: true });
  }

  silentRefresh(): Observable<any> {
    return this.http.post(`${this.API_URL}/refresh-token`, {}, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res.status === 'success') {
          this.setSession(res.data.accessToken, res.data.userDetail);
          setTimeout(() => this.silentRefresh().subscribe(), 14 * 60 * 1000);
        }
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private setSession(token: string, userDetail: any) {
    this.inMemoryAccessToken = token;
    this.user.set(userDetail);
    this.isAuthenticated.set(true);
  }

  logout() {
    this.inMemoryAccessToken = null;
    this.user.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }
}
