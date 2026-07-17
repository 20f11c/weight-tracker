import { create } from 'zustand';
import type { UserProfile } from './types';
import { initDatabase } from './db-connection';
import { getUserProfile, createUserProfile, updateUserProfile } from './db-userProfile';
import { getSmartTargetWeight, calculateAge } from './utils-bmi';

interface UserStoreState {
  user: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initializeDB: () => Promise<void>;
  loadUser: () => Promise<void>;
  setupUser: (data: {
    height_cm: number;
    initial_weight_kg: number;
    gender: 'male' | 'female';
    birth_date: string;
  }) => Promise<void>;
  updateHeight: (height: number) => Promise<void>;
  updateTargetWeight: (weight: number) => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  initializeDB: async () => {
    set({ isLoading: true });
    try {
      await initDatabase();
      await get().loadUser();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Still mark as initialized so the app doesn't hang forever
      // The app will show setup page and user can retry
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getUserProfile();
      set({ user });
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setupUser: async (data) => {
    set({ isLoading: true });
    try {
      const age = calculateAge(data.birth_date);
      const targetWeight = getSmartTargetWeight(data.height_cm, age, data.gender);

      const user = await createUserProfile({
        height_cm: data.height_cm,
        initial_weight_kg: data.initial_weight_kg,
        target_weight_kg: targetWeight.recommended,
        gender: data.gender,
        birth_date: data.birth_date,
      });

      set({ user });
    } catch (error) {
      console.error('Failed to setup user:', error);
      throw error; // re-throw so Setup page's catch block fires
    } finally {
      set({ isLoading: false });
    }
  },

  updateHeight: async (height: number) => {
    set({ isLoading: true });
    try {
      await updateUserProfile({ height_cm: height });
      await get().loadUser();
    } catch (error) {
      console.error('Failed to update height:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateTargetWeight: async (weight: number) => {
    set({ isLoading: true });
    try {
      await updateUserProfile({ target_weight_kg: weight });
      await get().loadUser();
    } catch (error) {
      console.error('Failed to update target weight:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));