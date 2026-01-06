import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  async signIn(email: string, password: string) {
    console.log('Mock login:', email, password);
    return Promise.resolve(true);
  }

  async signUp(data: any) {
    console.log('Mock register:', data);
    return Promise.resolve(true);
  }
}
