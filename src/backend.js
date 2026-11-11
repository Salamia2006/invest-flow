import {createClient} from '@supabase/supabase-js';
import {fromDatabase} from './data.js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const db = url && key ? createClient(url, key, {
  auth: {flowType:'pkce', detectSessionInUrl:true, persistSession:true, autoRefreshToken:true}
}) : null;

export async function loadListings() {
  if (!db) return [];
  const {data, error} = await db.from('projects')
    .select('id,title,city,company,kind,stage,min_rub,term_months,description,contact_email')
    .order('created_at', {ascending:false}).limit(120);
  if (error) throw error;
  return data.map(fromDatabase);
}
export async function requestLogin(email) {
  const {error} = await db.auth.signInWithOtp({
    email, options:{emailRedirectTo:location.origin + '/account'}
  });
  if (error) throw error;
}
export async function publishListing(values, userId) {
  const {error} = await db.from('projects').insert({...values, owner_id:userId});
  if (error) throw error;
}
export async function requestPremium(userId) {
  const {error} = await db.from('premium_requests').insert({user_id:userId});
  if (error && error.code !== '23505') throw error;
}
