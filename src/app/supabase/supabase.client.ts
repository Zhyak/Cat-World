import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { CustomStorageProvider } from './custom-storage';

export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseKey,
  {
    auth: {
      storage: new CustomStorageProvider(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);