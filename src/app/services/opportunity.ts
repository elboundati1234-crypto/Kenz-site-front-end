import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environment/environment';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  study_level: string;
  study_domain: string;
  secondary_domain?: string;
  target_countries?: string[];
  accept_terms: boolean;
  accept_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studyLevel: string;
  studyDomain: string;
  phone?: string;
  secondaryDomain?: string;
  targetCountries?: string[];
  acceptTerms: boolean;
  acceptNotifications: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );

    this.supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        this.currentUserSubject.next(session?.user ?? null);
      })();
    });
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  async signUp(registrationData: RegistrationData) {
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: registrationData.email,
      password: registrationData.password
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const { error: profileError } = await this.supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        first_name: registrationData.firstName,
        last_name: registrationData.lastName,
        phone: registrationData.phone || null,
        study_level: registrationData.studyLevel,
        study_domain: registrationData.studyDomain,
        secondary_domain: registrationData.secondaryDomain || null,
        target_countries: registrationData.targetCountries || [],
        accept_terms: registrationData.acceptTerms,
        accept_notifications: registrationData.acceptNotifications
      });

    if (profileError) throw profileError;

    return authData;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
