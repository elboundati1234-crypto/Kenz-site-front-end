import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// 1. Interface correspondant à ton API + Champs UI
export interface User {
  id: string; // ou 'id' selon ton backend
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  profileCompletion?: number;
  
  // Champs calculés pour l'affichage (Frontend)
  fullName?: string;
  initials?: string;
  photoUrl?: string; 
  token?: string; // Pour stocker le JWT
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  // URL de ton API Node.js
  private apiUrl = 'http://localhost:5001/api/auth';
  
  private http = inject(HttpClient);
  private router = inject(Router);

  // State Management (Source de vérité)
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Au rechargement, on récupère l'utilisateur du localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // ==========================================================
  // REGISTER (Inscription)
  // POST http://localhost:3000/api/auth/register
  // ==========================================================
  register(userData: any): Observable<any> {
    // userData doit contenir: firstName, lastName, email, password, confirmPassword, educationLevel, studyDomain
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // ==========================================================
  // LOGIN (Connexion)
  // POST http://localhost:3000/api/auth/login
  // ==========================================================
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // L'API retourne : { token, user: { id, email, role, firstName, lastName... }, redirect }
        
        // 1. On prépare l'objet utilisateur pour le frontend
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          role: response.user.role,
          profileCompletion: response.user.profileCompletion,
          token: response.token,
          
          // On génère les champs d'affichage
          fullName: `${response.user.firstName} ${response.user.lastName}`,
          initials: this.getInitials(response.user.firstName, response.user.lastName)
        };

        // 2. On sauvegarde dans le LocalStorage et le Subject
        this.saveUserToStorage(user);
      })
    );
  }

  // ==========================================================
  // GET PROFILE (Récupérer infos)
  // GET http://localhost:3000/api/auth/user/:id
  // ==========================================================
  getUserProfile(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
  }

  // ==========================================================
  // UPDATE PROFILE (Mise à jour)
  // PUT http://localhost:3000/api/auth/profile/:userId
  // ==========================================================
  updateProfile(userId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile/${userId}`, data).pipe(
      tap(response => {
        // Optionnel : Mettre à jour l'utilisateur local si les infos changent
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...data }; // Fusion simple
          this.saveUserToStorage(updatedUser);
        }
      })
    );
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================
  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // --- HELPERS PRIVÉS ---

  private saveUserToStorage(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getInitials(first: string = '', last: string = ''): string {
    const f = first ? first.charAt(0).toUpperCase() : '';
    const l = last ? last.charAt(0).toUpperCase() : '';
    return f + l;
  }
  
  // Helper pour récupérer le token (utile pour les Interceptors plus tard)
  getToken(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.token || null : null;
  }
}