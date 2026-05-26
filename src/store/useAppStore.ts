import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockSellersBuyers, mockProducts, mockCropTimeline, SellerBuyer, Product, CropTimelineEvent } from '../constants/mockData';
import { authService, databaseService, Profile } from '../services/supabase';
import { sendLocalNotification } from '../utils/notifications';

interface AppState {
  // Auth & Profile
  user: any | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardingCompleted: boolean;
  hasStarted: boolean;

  // Localization & Setup
  language: string;
  locationPermissionGranted: boolean;
  locationName: string;
  latitude: number | null;
  longitude: number | null;

  // Farmora Data
  sellersBuyers: SellerBuyer[];
  products: Product[];
  selectedCrop: string; // 'Rice' or 'Wheat'
  calendarTasks: CropTimelineEvent[];
  allCalendarTasks: (CropTimelineEvent & { crop?: string })[];
  diagnosesHistory: any[];
  
  // Chatbot State
  chatVisible: boolean;
  setChatVisible: (visible: boolean) => void;

  // Actions
  setUser: (user: any) => void;
  setProfile: (profile: Profile | null) => void;
  setLanguage: (lang: string) => void;
  setLocationPermission: (granted: boolean) => void;
  setLocation: (name: string, lat: number | null, lng: number | null) => void;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  setHasStarted: (started: boolean) => void;
  setSelectedCrop: (crop: string) => void;
  
  // Calendar Actions
  addCalendarTask: (task: Omit<CropTimelineEvent, 'id' | 'completed'>) => void;
  toggleCalendarTask: (id: string) => void;
  resetCalendarForCrop: (crop: string) => void;

  // Market Actions
  addSellerBuyer: (sb: SellerBuyer) => void;
  
  // Diagnosis Actions
  addDiagnosis: (diagnosis: any) => void;

  // Notifications State & Actions
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: (count: number) => void;
  loadNotificationsCount: () => Promise<void>;
  createNotification: (title: string, body: string, type: 'alerts' | 'schemes' | 'system') => Promise<void>;

  // Session handler
  initSession: () => Promise<void>;
  logout: () => Promise<void>;
  loadUserData: (userId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  isOnboardingCompleted: false,
  hasStarted: false,

  language: 'English',
  locationPermissionGranted: false,
  locationName: 'Detecting Location...',
  latitude: null,
  longitude: null,

  sellersBuyers: mockSellersBuyers,
  products: mockProducts,
  selectedCrop: 'Rice',
  calendarTasks: mockCropTimeline['Rice'],
  allCalendarTasks: [
    ...mockCropTimeline['Rice'].map((t) => ({ ...t, crop: 'Rice' })),
    ...mockCropTimeline['Wheat'].map((t) => ({ ...t, crop: 'Wheat' })),
  ],
  diagnosesHistory: [],
  chatVisible: false,
  setChatVisible: (visible) => set({ chatVisible: visible }),

  // Notifications State
  unreadNotificationsCount: 0,
  setUnreadNotificationsCount: (unreadNotificationsCount) => set({ unreadNotificationsCount }),
  loadNotificationsCount: async () => {
    const { user } = get();
    const userId = user?.id || 'guest';
    try {
      let unread = 0;
      if (user && !user.id?.startsWith('mock_')) {
        const dbData = await databaseService.getNotifications(user.id);
        if (dbData && dbData.length > 0) {
          unread = dbData.filter((item: any) => !item.is_read).length;
        } else {
          const cachedString = await AsyncStorage.getItem(`notifications_list_${userId}`);
          if (cachedString) {
            const list = JSON.parse(cachedString);
            unread = list.filter((n: any) => n.unread).length;
          } else {
            unread = 3;
          }
        }
      } else {
        const cachedString = await AsyncStorage.getItem(`notifications_list_${userId}`);
        if (cachedString) {
          const list = JSON.parse(cachedString);
          unread = list.filter((n: any) => n.unread).length;
        } else {
          unread = 3;
        }
      }
      set({ unreadNotificationsCount: unread });
    } catch (err) {
      console.warn('Failed to load notifications count:', err);
    }
  },
  createNotification: async (title, body, type) => {
    const { user } = get();
    const userId = user?.id || 'guest';
    const notifId = `notif_${Date.now()}`;
    
    // 1. Send instant local mobile notification
    try {
      await sendLocalNotification(title, body, { screen: '/notifications' });
    } catch (err) {
      console.warn('Failed to trigger local device alert:', err);
    }

    // 2. Sync to Supabase if logged in
    if (user && !user.id?.startsWith('mock_')) {
      try {
        await databaseService.addNotification(user.id, { title, body, type });
      } catch (err) {
        console.warn('Failed to save notification to Supabase:', err);
      }
    }

    // 3. Save to local AsyncStorage cache
    try {
      const cachedString = await AsyncStorage.getItem(`notifications_list_${userId}`);
      let list = [];
      if (cachedString) {
        list = JSON.parse(cachedString);
      }
      const newNotif = {
        id: notifId,
        title,
        body,
        time: 'now',
        category: type,
        unread: true,
        iconName: (type === 'alerts' ? 'rain' : type === 'schemes' ? 'warning' : 'ai') as any,
        routePath: type === 'alerts' ? '/weather-report' : type === 'schemes' ? '/updates-schemes' : '/(tabs)/calendar'
      };
      const updatedList = [newNotif, ...list];
      await AsyncStorage.setItem(`notifications_list_${userId}`, JSON.stringify(updatedList));
      
      // Update unread count
      set((state) => ({
        unreadNotificationsCount: state.unreadNotificationsCount + 1
      }));
    } catch (err) {
      console.warn('Failed to update local notifications cache:', err);
    }
  },

  // Setters
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user && !user.id.startsWith('mock_')) {
      get().loadUserData(user.id);
    }
    get().loadNotificationsCount();
  },
  setProfile: (profile) => set({ profile }),
  setLanguage: (language) => set({ language }),
  setLocationPermission: (granted) => set({ locationPermissionGranted: granted }),
  setLocation: (locationName, latitude, longitude) => set({ locationName, latitude, longitude }),
  setOnboardingCompleted: async (isOnboardingCompleted) => {
    set({ isOnboardingCompleted });
    const { user } = get();
    if (user?.id) {
      try {
        await AsyncStorage.setItem(`onboarding_completed_${user.id}`, isOnboardingCompleted ? 'true' : 'false');
      } catch (error) {
        console.error('Error saving onboarding completed status to AsyncStorage:', error);
      }
    }
  },
  setHasStarted: (hasStarted) => set({ hasStarted }),
  
  setSelectedCrop: (crop) => {
    const all = get().allCalendarTasks;
    const tasks = all.filter((t) => t.crop === crop);
    set({ selectedCrop: crop, calendarTasks: tasks });
  },

  // Calendar
  addCalendarTask: async (task) => {
    const { user, selectedCrop } = get();
    const newTask: CropTimelineEvent & { crop: string } = {
      ...task,
      id: `task_${Date.now()}`,
      completed: false,
      crop: selectedCrop,
    };
    
    set((state) => {
      const updatedAll = [...state.allCalendarTasks, newTask];
      return {
        allCalendarTasks: updatedAll,
        calendarTasks: updatedAll.filter((t) => t.crop === state.selectedCrop),
      };
    });

    if (user?.id && !user.id.startsWith('mock_')) {
      try {
        await databaseService.addCalendarTask(user.id, { ...task, crop: selectedCrop });
      } catch (error) {
        console.error('Error adding task to Supabase:', error);
      }
    }
  },

  toggleCalendarTask: async (id) => {
    let targetCompleted = false;
    set((state) => {
      const updatedAll = state.allCalendarTasks.map((t) => {
        if (t.id === id) {
          targetCompleted = !t.completed;
          return { ...t, completed: targetCompleted };
        }
        return t;
      });
      return {
        allCalendarTasks: updatedAll,
        calendarTasks: updatedAll.filter((t) => t.crop === state.selectedCrop),
      };
    });

    const { user } = get();
    if (user?.id && !user.id.startsWith('mock_')) {
      try {
        await databaseService.toggleCalendarTask(id, targetCompleted);
      } catch (error) {
        console.error('Error toggling task in Supabase:', error);
      }
    }
  },

  resetCalendarForCrop: (crop) => {
    const defaultTasks = mockCropTimeline[crop] || [];
    set((state) => {
      const otherTasks = state.allCalendarTasks.filter((t) => t.crop !== crop);
      const resetTasks = defaultTasks.map((t) => ({ ...t, crop }));
      const updatedAll = [...otherTasks, ...resetTasks];
      return {
        allCalendarTasks: updatedAll,
        calendarTasks: updatedAll.filter((t) => t.crop === state.selectedCrop),
      };
    });
  },

  // Market
  addSellerBuyer: async (sb) => {
    set((state) => ({
      sellersBuyers: [sb, ...state.sellersBuyers],
    }));

    const { user } = get();
    if (user?.id && !user.id.startsWith('mock_')) {
      try {
        await databaseService.addBuyerSeller({
          id: sb.id,
          name: sb.name,
          role: sb.role,
          crop: sb.crop,
          price: sb.price,
          quantity: sb.quantity,
          location: sb.location,
          distance: sb.distance,
          phone: sb.phone,
          state: sb.state || null,
          district: sb.district || null,
          mandal: sb.mandal || null,
          verified: false,
        });
      } catch (error) {
        console.error('Error adding buyer/seller listing to Supabase:', error);
      }
    }
  },

  // Diagnosis
  addDiagnosis: async (diagnosis) => {
    const { user } = get();
    set((state) => ({
      diagnosesHistory: [diagnosis, ...state.diagnosesHistory],
    }));

    if (user?.id && !user.id.startsWith('mock_')) {
      try {
        await databaseService.addScanLog(user.id, diagnosis);
      } catch (error) {
        console.error('Error saving diagnosis to Supabase:', error);
      }
    }
  },

  // Initialize Auth Session
  initSession: async () => {
    try {
      set({ isLoading: true });
      const session = await authService.getSession();
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        
        let onboardingDone = false;
        try {
          const storedVal = await AsyncStorage.getItem(`onboarding_completed_${session.user.id}`);
          if (storedVal === 'true') {
            onboardingDone = true;
          } else {
            onboardingDone = !!profile?.location_name;
          }
        } catch (err) {
          onboardingDone = !!profile?.location_name;
        }

        set({
          user: session.user,
          profile,
          isAuthenticated: true,
          isOnboardingCompleted: onboardingDone,
          language: profile?.language || 'English',
          locationName: profile?.location_name || 'Detecting Location...',
          latitude: profile?.location_lat || null,
          longitude: profile?.location_lng || null,
        });

        // Load tasks and diagnosis logs
        await get().loadUserData(session.user.id);
        await get().loadNotificationsCount();
      } else {
        set({ user: null, profile: null, isAuthenticated: false, isOnboardingCompleted: false });
        await get().loadNotificationsCount();
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Log Out
  logout: async () => {
    try {
      set({ isLoading: true });

      const { user } = get();
      if (user && !user.id.startsWith('mock_')) {
        try {
          const cachedToken = await AsyncStorage.getItem(`last_saved_push_token_${user.id}`);
          if (cachedToken) {
            await databaseService.deletePushToken(user.id, cachedToken);
            await AsyncStorage.removeItem(`last_saved_push_token_${user.id}`);
          }
        } catch (err) {
          console.warn('Failed to clean up push token during logout:', err);
        }
      }

      await authService.signOut();
      
      // Reset calendar tasks to defaults upon logout
      const defaultAll = [
        ...mockCropTimeline['Rice'].map((t) => ({ ...t, crop: 'Rice' })),
        ...mockCropTimeline['Wheat'].map((t) => ({ ...t, crop: 'Wheat' })),
      ];

      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isOnboardingCompleted: false,
        hasStarted: true,
        allCalendarTasks: defaultAll,
        calendarTasks: mockCropTimeline['Rice'],
        diagnosesHistory: [],
        unreadNotificationsCount: 0,
      });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch User specific data from database
  loadUserData: async (userId: string) => {
    if (!userId || userId.startsWith('mock_')) return;
    try {
      const dbTasks = await databaseService.getCalendarTasks(userId);
      const dbScans = await databaseService.getScanLogs(userId);
      const dbListings = await databaseService.getBuyersAndSellers();
      
      const { selectedCrop } = get();
      
      set((state) => {
        // Map db entries to ensure state/district/mandal are set or keep mock listings as default
        const mergedListings = dbListings && dbListings.length > 0 
          ? dbListings.map((listing: any) => ({
              id: listing.id,
              name: listing.name,
              role: listing.role,
              crop: listing.crop,
              price: listing.price,
              quantity: listing.quantity,
              location: listing.location,
              distance: listing.distance || 'Local',
              phone: listing.phone,
              state: listing.state || undefined,
              district: listing.district || undefined,
              mandal: listing.mandal || undefined,
              rating: listing.rating || 5.0,
              avatar: listing.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
            }))
          : mockSellersBuyers;

        return {
          allCalendarTasks: dbTasks,
          calendarTasks: dbTasks.filter((t) => t.crop === selectedCrop),
          diagnosesHistory: dbScans,
          sellersBuyers: mergedListings,
        };
      });
      await get().loadNotificationsCount();
    } catch (error) {
      console.error('Error loading user data from Supabase:', error);
    }
  },
}));
