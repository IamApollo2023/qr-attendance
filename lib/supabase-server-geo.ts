import { createClient } from "./supabase-server";

export async function createServerClient() {
  return await createClient();
}
