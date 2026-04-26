import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

export const AuthService = {
  async signup(email: string, password: string, displayName: string, phone: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const profile: UserProfile = {
      uid: user.uid,
      displayName,
      email,
      phone,
      role: 'user', // Default role
      createdAt: Date.now(),
    };
    
    await set(ref(db, `users/${user.uid}`), profile);
    return profile;
  },

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await this.getUserProfile(userCredential.user.uid);
    return profile;
  },

  async logout() {
    await signOut(auth);
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const snapshot = await get(ref(db, `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    }
    return null;
  },

  onAuthSync(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
