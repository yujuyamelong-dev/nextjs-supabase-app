import type { Profile, ProfileUpdate } from "@/types/database.types";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateProfile(client: SupabaseClient, userId: string, data: ProfileUpdate) {
  // Supabase client type inference for profiles table
  const response = await client.from("profiles").update(data).eq("id", userId);
  return response;
}

export async function getProfile(client: SupabaseClient, userId: string) {
  // Supabase client type inference for profiles table
  const response = await client.from("profiles").select("*").eq("id", userId).single();
  return response as { data: Profile | null; error: unknown };
}
