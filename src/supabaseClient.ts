import { createClient } from '@supabase/supabase-js';

// Boas práticas do Vite: puxa das variáveis de ambiente e fornece os dados fornecidos pelo usuário como fallback seguro.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://tbcjknbrtdwqclrlbumb.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bKk4ZC_emGBWVbDU76uGKQ_VghAxGvK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
