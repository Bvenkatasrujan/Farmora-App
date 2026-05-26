import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { mockCropTimeline, CropTimelineEvent } from '../constants/mockData';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Ensure your .env file is set up correctly.'
  );
}

// SSR/static export safe storage wrapper
const isServer = Platform.OS === 'web' && typeof window === 'undefined';
const customStorage = {
  getItem: async (key: string) => {
    if (isServer) return null;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (isServer) return;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (isServer) return;
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database Interfaces
export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  phone_number?: string;
  language?: string;
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  state?: string;
  district?: string;
  mandal?: string;
  role?: 'farmer' | 'buyer' | 'expert';
  avatar_url?: string;
  location_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Translation / Mapping Helpers
function mapDbProfileToClient(dbProfile: any): Profile {
  const locName = dbProfile.mandal 
    ? `${dbProfile.mandal}, ${dbProfile.district}, ${dbProfile.state}` 
    : (dbProfile.city || undefined);
    
  return {
    id: dbProfile.id,
    email: dbProfile.email || undefined,
    full_name: dbProfile.full_name || undefined,
    phone_number: dbProfile.phone || undefined,
    language: dbProfile.language || 'English',
    location_lat: dbProfile.latitude || undefined,
    location_lng: dbProfile.longitude || undefined,
    location_name: locName,
    state: dbProfile.state || undefined,
    district: dbProfile.district || undefined,
    mandal: dbProfile.mandal || undefined,
    location_enabled: dbProfile.location_enabled ?? false,
    avatar_url: dbProfile.avatar_url || undefined,
    created_at: dbProfile.created_at || undefined,
    updated_at: dbProfile.updated_at || undefined,
    role: 'farmer',
  };
}

function mapClientProfileToDb(profile: Partial<Profile> & { id: string }): any {
  const dbData: any = {
    id: profile.id,
    updated_at: new Date().toISOString(),
  };
  
  if (profile.email !== undefined) dbData.email = profile.email;
  if (profile.full_name !== undefined) dbData.full_name = profile.full_name;
  if (profile.phone_number !== undefined) dbData.phone = profile.phone_number;
  if (profile.language !== undefined) dbData.language = profile.language;
  if (profile.location_lat !== undefined) dbData.latitude = profile.location_lat;
  if (profile.location_lng !== undefined) dbData.longitude = profile.location_lng;
  if (profile.location_name !== undefined) dbData.city = profile.location_name;
  if (profile.state !== undefined) dbData.state = profile.state;
  if (profile.district !== undefined) dbData.district = profile.district;
  if (profile.mandal !== undefined) dbData.mandal = profile.mandal;
  if (profile.avatar_url !== undefined) dbData.avatar_url = profile.avatar_url;
  
  if (profile.location_enabled !== undefined) {
    dbData.location_enabled = profile.location_enabled;
  } else if (profile.location_name !== undefined || profile.state !== undefined || profile.location_lat !== undefined) {
    dbData.location_enabled = true;
  }

  return dbData;
}

function mapDbTaskToClient(row: any): CropTimelineEvent & { crop: string } {
  const parts = row.date.split('|');
  const crop = parts[0] || (row.id.startsWith('cw') ? 'Wheat' : 'Rice');
  const phase = parts[1] || parts[0] || '';
  return {
    id: row.id,
    title: row.title,
    phase: phase,
    dayRange: row.day,
    description: row.description || '',
    completed: row.completed,
    type: row.time as any,
    crop: crop,
  };
}

// Authentication Helpers
export const authService = {
  async signUp(email: string, password: string, fullName: string, language?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) throw error;
    if (data.user) {
      // Create initial profile record
      await this.upsertProfile({
        id: data.user.id,
        full_name: fullName,
        email,
        language: language || 'English',
      });
    }
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      throw error;
    }
    return mapDbProfileToClient(data);
  },

  async upsertProfile(profile: Partial<Profile> & { id: string }) {
    const dbPayload = mapClientProfileToDb(profile);
    const { data, error } = await supabase
      .from('profiles')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    return mapDbProfileToClient(data);
  },
};

// Database queries (fallback to mock data if tables don't exist yet)
export const databaseService = {
  async getBuyersAndSellers() {
    const { data, error } = await supabase
      .from('buyers_sellers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('Error fetching buyers_sellers from Supabase, using mock data:', error.message);
      return null;
    }
    return data;
  },

  async addBuyerSeller(payload: any) {
    const { data, error } = await supabase
      .from('buyers_sellers')
      .insert([payload])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMarketProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.log('Error fetching products from Supabase, using mock data:', error.message);
      return null;
    }
    return data;
  },

  async getCalendarTasks(userId: string): Promise<(CropTimelineEvent & { crop: string })[]> {
    const { data, error } = await supabase
      .from('calendar_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching calendar tasks from Supabase:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      // Seed default tasks for Rice & Wheat
      const seedTasks: any[] = [];
      
      const riceTasks = mockCropTimeline['Rice'] || [];
      const wheatTasks = mockCropTimeline['Wheat'] || [];
      
      riceTasks.forEach(task => {
        seedTasks.push({
          id: `${userId}_${task.id}`,
          user_id: userId,
          date: `Rice|${task.phase}`,
          day: task.dayRange,
          title: task.title,
          description: task.description,
          time: task.type,
          completed: task.completed,
        });
      });

      wheatTasks.forEach(task => {
        seedTasks.push({
          id: `${userId}_${task.id}`,
          user_id: userId,
          date: `Wheat|${task.phase}`,
          day: task.dayRange,
          title: task.title,
          description: task.description,
          time: task.type,
          completed: task.completed,
        });
      });

      if (seedTasks.length > 0) {
        // Ensure profile exists to avoid violating foreign key constraints
        const { data: profileCheck, error: profileCheckErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (profileCheckErr) {
          console.error('Error checking profile during task seeding:', profileCheckErr.message);
        }

        if (!profileCheck) {
          console.log(`Creating skeleton profile for user ${userId} to satisfy foreign key constraint.`);
          const { error: profileInsertErr } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              updated_at: new Date().toISOString(),
            });
          
          if (profileInsertErr) {
            console.error('Failed to insert skeleton profile for user:', profileInsertErr.message);
          }
        }

        const { data: insertedData, error: insertError } = await supabase
          .from('calendar_tasks')
          .upsert(seedTasks, { onConflict: 'id' })
          .select();
        
        if (insertError) {
          console.error('Error seeding tasks to database:', insertError.message);
          // Fallback to local combined mock data
          return [
            ...riceTasks.map(t => ({ ...t, crop: 'Rice' })), 
            ...wheatTasks.map(t => ({ ...t, crop: 'Wheat' }))
          ];
        }
        
        return (insertedData || []).map(row => mapDbTaskToClient(row));
      }
    }

    return (data || []).map(row => mapDbTaskToClient(row));
  },

  async addCalendarTask(userId: string, task: Omit<CropTimelineEvent, 'id' | 'completed'> & { id?: string, crop: string }) {
    const taskId = task.id || `task_${Date.now()}`;
    const payload = {
      id: taskId,
      user_id: userId,
      date: `${task.crop}|${task.phase}`,
      day: task.dayRange,
      title: task.title,
      description: task.description,
      time: task.type,
      completed: false,
    };

    const { data, error } = await supabase
      .from('calendar_tasks')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error adding calendar task to Supabase:', error.message);
      throw error;
    }

    return mapDbTaskToClient(data);
  },

  async toggleCalendarTask(taskId: string, completed: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('calendar_tasks')
      .update({ completed })
      .eq('id', taskId);

    if (error) {
      console.error('Error toggling calendar task in Supabase:', error.message);
      return false;
    }
    return true;
  },

  async deleteCalendarTask(taskId: string): Promise<boolean> {
    const { error } = await supabase
      .from('calendar_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting calendar task from Supabase:', error.message);
      return false;
    }
    return true;
  },

  async getScanLogs(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('scan_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scan logs:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      disease: row.disease_name,
      confidence: row.confidence,
      date: row.date,
      crop: row.crop_type,
      image: row.severity, // we stored the image URL in the severity field
    }));
  },

  async addScanLog(userId: string, log: any) {
    const payload = {
      id: log.id || `diag_${Date.now()}`,
      user_id: userId,
      crop_type: log.crop,
      disease_name: log.disease,
      date: log.date,
      severity: log.image || 'High', // use severity column to store image URL
      confidence: log.confidence,
    };

    const { data, error } = await supabase
      .from('scan_logs')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error inserting scan log to Supabase:', error.message);
      throw error;
    }

    return data;
  },

  async addDiseaseDiagnosis(payload: {
    user_id: string;
    crop_type: string;
    disease_name: string;
    confidence: number;
    treatment_details: string;
  }) {
    const { data, error } = await supabase
      .from('scan_logs')
      .insert([{
        id: `diag_${Date.now()}`,
        user_id: payload.user_id,
        crop_type: payload.crop_type,
        disease_name: payload.disease_name,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        severity: 'High',
        confidence: `${payload.confidence}%`,
      }])
      .select()
      .single();
    
    if (error) {
      console.log('Error inserting disease diagnosis into Supabase:', error.message);
      return null;
    }
    return data;
  },

  async getNotifications(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching notifications (table might not exist yet):', error.message);
      return [];
    }
    return data || [];
  },

  async addNotification(userId: string, notif: { title: string, body: string, type: string }): Promise<any> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title: notif.title,
        body: notif.body,
        type: notif.type,
        is_read: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding notification to Supabase:', error.message);
      throw error;
    }
    return data;
  },

  async markNotificationRead(notifId: string, isRead = true): Promise<boolean> {
    // Guard: Supabase 'id' column is UUID — skip non-UUID IDs (e.g. local seed fallbacks)
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(notifId)) {
      // Not a real DB row — nothing to update in Supabase
      return true;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: isRead })
      .eq('id', notifId);

    if (error) {
      console.error('Error marking notification read in Supabase:', error.message);
      return false;
    }
    return true;
  },

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking all notifications read in Supabase:', error.message);
      return false;
    }
    return true;
  },

  async clearAllNotifications(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing notifications from Supabase:', error.message);
      return false;
    }
    return true;
  },

  async deleteNotification(notifId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notifId);

    if (error) {
      console.error('Error deleting notification from Supabase:', error.message);
      return false;
    }
    return true;
  },

  async deletePushToken(userId: string, token: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_push_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('expo_push_token', token);

    if (error) {
      console.warn('Error deleting push token:', error.message);
      return false;
    }
    return true;
  },
};
