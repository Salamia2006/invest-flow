import {createClient} from '@supabase/supabase-js';
import {fromDatabase} from './data.js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const db = url && key ? createClient(url, key, {
  auth: {flowType:'pkce', detectSessionInUrl:true, persistSession:true, autoRefreshToken:true}
}) : null;

export async function loadListings() {
  if (!db) return [];
  const {data, error} = await db.from('invest_flow_projects')
    .select('id,title,city,company,kind,stage,min_rub,term_months,description,contact_email')
    .order('created_at', {ascending:false}).limit(120);
  if (error) throw error;
  return data.map(fromDatabase);
}
function accountUrl() {
  if (location.origin === 'https://invest-flow-one.vercel.app') {
    return 'https://www.noxarix.com/auth/confirm?next=%2Finvest-flow';
  }
  return new URL('/account', location.origin).href;
}
export async function getLoginProviders() {
  const response = await fetch(url + '/auth/v1/settings', {headers: {apikey: key}});
  if (!response.ok) throw new Error('Auth settings unavailable');
  const {external} = await response.json();
  return ['google', 'github'].filter(provider => external?.[provider] === true);
}
export async function loginWithProvider(provider) {
  if (!['google', 'github'].includes(provider)) throw new Error('Unknown provider');
  const {error} = await db.auth.signInWithOAuth({provider, options: {redirectTo: accountUrl()}});
  if (error) throw error;
}
export async function requestLogin(email) {
  const {error} = await db.auth.signInWithOtp({
    email, options:{emailRedirectTo:accountUrl()}
  });
  if (error) throw error;
}
export async function publishListing(values, userId) {
  const {error} = await db.from('invest_flow_projects').insert({...values, owner_id:userId});
  if (error) throw error;
}
export async function requestPremium(userId) {
  const {error} = await db.from('invest_flow_premium_requests').insert({user_id:userId});
  if (error && error.code !== '23505') throw error;
}
