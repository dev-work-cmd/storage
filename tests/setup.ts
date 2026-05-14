process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
process.env.BETTER_AUTH_SECRET ??= "12345678901234567890123456789012";
process.env.SUPABASE_URL ??= "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "service-role-key";
process.env.SUPABASE_ANON_KEY ??= "anon-key";
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "publishable-key";
process.env.SUPABASE_STORAGE_BUCKET_ORIGINAL ??= "original-pdfs";
process.env.SUPABASE_STORAGE_BUCKET_PROCESSED ??= "processed-pdfs";
process.env.MAX_PDF_SIZE_MB ??= "10";
