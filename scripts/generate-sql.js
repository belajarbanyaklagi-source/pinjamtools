import fs from 'fs'
import { mockTools } from '../src/lib/mock-data.ts'

function generateSql() {
  const toolsValues = mockTools.map(t => {
    const esc = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : 'NULL')
    return `(${esc(t.id)}, ${esc(t.name)}, ${esc(t.brand)}, ${esc(t.code)}, ${esc(t.imageUrl)}, ${esc(t.category)}, ${esc(t.qrCode)}, ${t.totalStock}, ${t.availableStock}, ${t.isActive ? 'true' : 'false'}, ${esc(t.description)}, ${esc(t.specification)}, ${esc(t.size)}, ${esc(t.weight)}, ${esc(t.condition)}, ${esc(t.location)}, ${t.rating || 4.5}, ${t.totalBorrowed || 0})`
  }).join(',\n')

  const sql = `-- =========================================================================
-- PinjamKu — Skrip Database Supabase Lengkap (100% Anti-Error & Siap Pakai)
-- Jalankan skrip ini di: Supabase Console -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabel PROFILES (User & Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    member_id TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    department TEXT DEFAULT 'Workshop',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Trigger Buat Profil Otomatis saat Pengguna Login Google
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, member_id, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'https://api.dicebear.com/9.x/avataaars/svg?seed=' || new.id),
        'PK-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0'),
        'member'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Tabel TOOLS (Alat Kerja)
CREATE TABLE IF NOT EXISTS public.tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    image_url TEXT,
    category TEXT NOT NULL,
    qr_code TEXT NOT NULL UNIQUE,
    total_stock INT NOT NULL DEFAULT 1,
    available_stock INT NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    specification TEXT,
    size TEXT,
    weight TEXT,
    condition TEXT DEFAULT 'baik',
    location TEXT DEFAULT 'Gudang Rak A',
    rating NUMERIC(3,1) DEFAULT 4.5,
    total_borrowed INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel BORROWS (Alur Peminjaman & Bukti Serah Terima)
CREATE TABLE IF NOT EXISTS public.borrows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT,
    tool_id TEXT NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    borrow_code TEXT NOT NULL,
    borrow_date DATE DEFAULT CURRENT_DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'returned', 'overdue', 'rejected')),
    extensions INT DEFAULT 0,
    fine_amount NUMERIC DEFAULT 0,
    notes TEXT,
    proof_photo_url TEXT,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Hak Akses (GRANT Permissions untuk anon, authenticated, service_role)
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.tools TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.borrows TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 7. Row Level Security (RLS) & Policies yang Aman & Terbuka
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
CREATE POLICY "Allow all on profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on tools" ON public.tools;
CREATE POLICY "Allow all on tools" ON public.tools FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on borrows" ON public.borrows;
CREATE POLICY "Allow all on borrows" ON public.borrows FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. Aktifkan Realtime Tanpa Error Jika Sudah Terdaftar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'borrows'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.borrows;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'tools'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tools;
    END IF;
END $$;

-- 9. Storage Bucket untuk Foto Bukti Serah Terima
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof-photos', 'proof-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Proof Photos" ON storage.objects;
CREATE POLICY "Public Read Proof Photos" ON storage.objects FOR SELECT USING (bucket_id = 'proof-photos');

DROP POLICY IF EXISTS "Allow Upload Proof Photos" ON storage.objects;
CREATE POLICY "Allow Upload Proof Photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'proof-photos');

-- 10. SEED DATA 75 ALAT KERJA (KUNCI LENGKAP A-Z)
INSERT INTO public.tools (
    id, name, brand, code, image_url, category, qr_code, total_stock, available_stock,
    is_active, description, specification, size, weight, condition, location, rating, total_borrowed
) VALUES
${toolsValues}
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    brand = EXCLUDED.brand,
    code = EXCLUDED.code,
    category = EXCLUDED.category,
    total_stock = EXCLUDED.total_stock,
    available_stock = EXCLUDED.available_stock,
    description = EXCLUDED.description,
    specification = EXCLUDED.specification,
    location = EXCLUDED.location;
`

  fs.writeFileSync('supabase_schema.sql', sql, 'utf-8')
  console.log('Successfully generated updated supabase_schema.sql!')
}

generateSql()
