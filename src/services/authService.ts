import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { ref, set, get, update, push } from 'firebase/database';
import { auth, db } from '../lib/firebase';
import { UserProfile, Address } from '../types';

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
      const data = snapshot.val();
      // Ensure addresses is an array for the frontend
      if (data.addresses) {
        data.addresses = Object.entries(data.addresses).map(([id, addr]: [string, any]) => ({
          ...addr,
          id
        }));
      } else {
        data.addresses = [];
      }
      return data as UserProfile;
    }
    return null;
  },

  async updateUserProfile(uid: string, updates: Partial<UserProfile>) {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, updates);
    return this.getUserProfile(uid);
  },

  async addAddress(uid: string, address: Address) {
    const addressesRef = ref(db, `users/${uid}/addresses`);
    const newAddressRef = push(addressesRef);
    const addressWithId = { ...address, id: newAddressRef.key };
    await set(newAddressRef, addressWithId);
    
    // Set as primary if it's the first one
    const profile = await this.getUserProfile(uid);
    if (!profile?.address) {
      await this.updateUserProfile(uid, { address: addressWithId });
    }
    return addressWithId;
  },

  async updateAddress(uid: string, addressId: string, address: Address) {
    const addressRef = ref(db, `users/${uid}/addresses/${addressId}`);
    await update(addressRef, address);
    
    // Update main address if this was the one
    const profile = await this.getUserProfile(uid);
    if (profile?.address?.id === addressId) {
      await this.updateUserProfile(uid, { address });
    }
  },

  async deleteAddress(uid: string, addressId: string) {
    const addressRef = ref(db, `users/${uid}/addresses/${addressId}`);
    await set(addressRef, null);
    
    const profile = await this.getUserProfile(uid);
    if (profile?.address?.id === addressId) {
      await this.updateUserProfile(uid, { address: null });
    }
  },

  async getAddresses(uid: string): Promise<Address[]> {
    const addressesRef = ref(db, `users/${uid}/addresses`);
    const snapshot = await get(addressesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.entries(data).map(([id, addr]: [string, any]) => ({
        ...addr,
        id
      }));
    }
    return [];
  },

  onAuthSync(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
