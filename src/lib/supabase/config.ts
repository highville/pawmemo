export function getSupabaseBrowserConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  };
}

export function hasSupabaseBrowserConfig() {
  const { url, anonKey } = getSupabaseBrowserConfig();
  return Boolean(url && anonKey);
}
