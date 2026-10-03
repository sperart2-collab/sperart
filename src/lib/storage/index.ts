import { createClient } from "@supabase/supabase-js";
export interface StorageProvider {
  upload(bucket: string, path: string, file: Blob): Promise<{ path: string }>;
  publicUrl(bucket: string, path: string): string;
}
/** Server-only (uses the service role key). Swap this object to change storage vendor. */
const admin = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export const storage: StorageProvider = {
  async upload(bucket, path, file) {
    const { error } = await admin().storage.from(bucket).upload(path, file, { upsert: false });
    if (error) throw error;
    return { path };
  },
  publicUrl: (bucket, path) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`,
};
