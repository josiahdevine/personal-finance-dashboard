import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { app } from '../config/firebase';
import { UserRepository } from '../models/UserRepository';
import { User } from '../models/types';

export class AuthService {
  private static instance: AuthService;
  private auth = getAuth(app);
  private googleProvider = new GoogleAuthProvider();
  private userRepo: UserRepository;

  private constructor() {
    this.userRepo = new UserRepository();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;
      await this.syncUserWithDatabase(user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  private async syncUserWithDatabase(firebaseUser: FirebaseUser, name?: string): Promise<void> {
    try {
      // Check if user exists in our database
      let user = await this.userRepo.findByFirebaseUid(firebaseUser.uid);

      if (!user) {
        // Create new user in our database
        user = await this.userRepo.createFromFirebase(
          firebaseUser.uid,
          firebaseUser.email!,
          name || (firebaseUser.displayName ?? undefined),
          firebaseUser.photoURL ?? undefined
        );
      } else {
        // Update existing user if needed
        const updates: Partial<User> = {};
        if (user.display_name !== (name || firebaseUser.displayName)) {
          updates.display_name = name || firebaseUser.displayName || undefined;
        }
        if (user.photo_url !== firebaseUser.photoURL) {
          updates.photo_url = firebaseUser.photoURL || undefined;
        }
        if (user.email !== firebaseUser.email) {
          updates.email = firebaseUser.email || undefined;
        }

        if (Object.keys(updates).length > 0) {
          await this.userRepo.update(user.id, updates);
        }
      }
    } catch (error) {
      console.error('Error syncing user with database:', error);
      throw error;
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  async getCurrentUserFromDatabase(): Promise<User | null> {
    const firebaseUser = this.getCurrentUser();
    if (!firebaseUser) return null;

    return await this.userRepo.findByFirebaseUid(firebaseUser.uid);
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      const user = result.user;
      await this.syncUserWithDatabase(user);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  }

  async createUserWithEmail(email: string, password: string, name: string): Promise<void> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = result.user;
      
      // Update the user's display name in Firebase
      await firebaseUpdateProfile(user, { displayName: name });
      
      // Sync with our database
      await this.syncUserWithDatabase(user, name);
    } catch (error) {
      console.error('Error creating user with email:', error);
      throw error;
    }
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    try {
      const firebaseUser = this.getCurrentUser();
      if (!firebaseUser) {
        throw new Error('No user is currently signed in');
      }

      // Update Firebase profile if display name or photo URL is provided
      if (data.display_name || data.photo_url) {
        await firebaseUpdateProfile(firebaseUser, {
          displayName: data.display_name || firebaseUser.displayName,
          photoURL: data.photo_url || firebaseUser.photoURL,
        });
      }

      // Update user in our database
      const user = await this.userRepo.findByFirebaseUid(firebaseUser.uid);
      if (!user) {
        throw new Error('User not found in database');
      }

      const updatedUser = await this.userRepo.update(user.id, data);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user || !user.email) {
        throw new Error('No user is currently signed in');
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Change password
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
} 