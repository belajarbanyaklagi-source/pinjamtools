-- =========================================================================
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
('1', 'Kunci Inggris 6"', 'Tekiro', 'KI-006', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-inggris-6&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_inggris', 'TOOL-KI-006', 4, 3, true, 'Kunci inggris 6 inch untuk baut kecil. Rahang adjustable dengan skala milimeter. Cocok untuk pekerjaan presisi di area sempit.', 'Panjang: 150mm, Bukaan Max: 20mm, Material: Chrome Vanadium Steel', '6" (150mm)', '180g', 'baik', 'Rak A1', 4.5, 23),
('2', 'Kunci Inggris 8"', 'Tekiro', 'KI-008', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-inggris-8&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_inggris', 'TOOL-KI-008', 5, 2, true, 'Kunci inggris 8 inch serbaguna. Ideal untuk pekerjaan instalasi pipa dan perawatan mesin ringan.', 'Panjang: 200mm, Bukaan Max: 25mm, Material: Chrome Vanadium Steel', '8" (200mm)', '260g', 'baik', 'Rak A1', 4.7, 45),
('3', 'Kunci Inggris 10"', 'Krisbow', 'KI-010', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-inggris-10&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_inggris', 'TOOL-KI-010', 3, 1, true, 'Kunci inggris 10 inch heavy duty. Handle ergonomis anti-slip untuk grip yang kuat pada pekerjaan berat.', 'Panjang: 250mm, Bukaan Max: 30mm, Material: Carbon Steel', '10" (250mm)', '380g', 'baik', 'Rak A1', 4.3, 38),
('4', 'Kunci Inggris 12"', 'Stanley', 'KI-012', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-inggris-12&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_inggris', 'TOOL-KI-012', 3, 0, true, 'Kunci inggris 12 inch profesional. Rahang presisi tinggi dengan finishing chrome untuk ketahanan karat.', 'Panjang: 300mm, Bukaan Max: 36mm, Material: Chrome Vanadium Steel', '12" (300mm)', '520g', 'baik', 'Rak A2', 4.8, 67),
('5', 'Kunci Inggris 15"', 'Stanley', 'KI-015', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-inggris-15&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_inggris', 'TOOL-KI-015', 2, 2, true, 'Kunci inggris 15 inch untuk pekerjaan plumbing dan konstruksi berat. Leverage tinggi untuk baut besar.', 'Panjang: 375mm, Bukaan Max: 44mm, Material: Carbon Steel', '15" (375mm)', '750g', 'cukup_baik', 'Rak A2', 4.2, 19),
('6', 'Kunci Inggris 18"', 'Krisbow', 'KI-018', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-inggris-18&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_inggris', 'TOOL-KI-018', 2, 1, true, 'Kunci inggris 18 inch extra-large. Untuk fitting pipa besar dan baut industrial.', 'Panjang: 450mm, Bukaan Max: 55mm, Material: Carbon Steel', '18" (450mm)', '1100g', 'baik', 'Rak A2', 4, 12),
('7', 'Kunci Pas 6-7', 'Tekiro', 'KP-0607', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pas-6-7&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas', 'TOOL-KP-0607', 6, 5, true, 'Kunci pas double open-end 6mm x 7mm. Untuk baut dan mur kecil pada perangkat elektronik dan mesin ringan.', 'Ukuran: 6x7mm, Material: Chrome Vanadium Steel, Finishing: Mirror Polish', '6-7mm', '35g', 'baik', 'Rak B1', 4.4, 15),
('8', 'Kunci Pas 8-9', 'Tekiro', 'KP-0809', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pas-8-9&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas', 'TOOL-KP-0809', 6, 4, true, 'Kunci pas double open-end 8mm x 9mm. Standar untuk perawatan mesin umum.', 'Ukuran: 8x9mm, Material: Chrome Vanadium Steel', '8-9mm', '45g', 'baik', 'Rak B1', 4.5, 22),
('9', 'Kunci Pas 10-11', 'Tekiro', 'KP-1011', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pas-10-11&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas', 'TOOL-KP-1011', 5, 3, true, 'Kunci pas 10mm x 11mm. Ukuran paling umum digunakan untuk berbagai jenis pekerjaan.', 'Ukuran: 10x11mm, Material: Chrome Vanadium Steel', '10-11mm', '60g', 'baik', 'Rak B1', 4.6, 55),
('10', 'Kunci Pas 12-13', 'Stanley', 'KP-1213', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pas-12-13&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas', 'TOOL-KP-1213', 5, 2, true, 'Kunci pas 12mm x 13mm. Untuk baut dan mur berukuran medium pada kendaraan dan mesin.', 'Ukuran: 12x13mm, Material: Chrome Vanadium Steel', '12-13mm', '80g', 'baik', 'Rak B1', 4.7, 48),
('11', 'Kunci Pas 14-15', 'Stanley', 'KP-1415', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pas-14-15&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas', 'TOOL-KP-1415', 4, 3, true, 'Kunci pas 14mm x 15mm. Standar untuk pekerjaan automotif dan industrial ringan.', 'Ukuran: 14x15mm, Material: Chrome Vanadium Steel', '14-15mm', '100g', 'baik', 'Rak B2', 4.4, 31),
('12', 'Kunci Pas 17-19', 'Krisbow', 'KP-1719', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pas-17-19&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas', 'TOOL-KP-1719', 4, 1, true, 'Kunci pas 17mm x 19mm. Untuk baut roda kendaraan dan fitting pipa medium.', 'Ukuran: 17x19mm, Material: Chrome Vanadium Steel', '17-19mm', '150g', 'baik', 'Rak B2', 4.6, 42),
('13', 'Kunci Pas 19-21', 'Krisbow', 'KP-1921', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pas-19-21&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas', 'TOOL-KP-1921', 3, 2, true, 'Kunci pas 19mm x 21mm. Heavy duty untuk pekerjaan konstruksi dan mesin berat.', 'Ukuran: 19x21mm, Material: Chrome Vanadium Steel', '19-21mm', '200g', 'baik', 'Rak B2', 4.3, 28),
('14', 'Kunci Pas 22-24', 'Tekiro', 'KP-2224', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pas-22-24&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas', 'TOOL-KP-2224', 3, 3, true, 'Kunci pas 22mm x 24mm. Untuk baut besar pada mesin produksi dan peralatan berat.', 'Ukuran: 22x24mm, Material: Chrome Vanadium Steel', '22-24mm', '280g', 'baik', 'Rak B2', 4.1, 15),
('15', 'Kunci Pas 27-30', 'Tekiro', 'KP-2730', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pas-27-30&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas', 'TOOL-KP-2730', 2, 2, true, 'Kunci pas 27mm x 30mm. Extra large untuk baut industrial dan fitting berat.', 'Ukuran: 27x30mm, Material: Carbon Steel', '27-30mm', '400g', 'cukup_baik', 'Rak B3', 4, 8),
('16', 'Kunci Pas 32-36', 'Krisbow', 'KP-3236', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pas-32-36&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas', 'TOOL-KP-3236', 2, 1, true, 'Kunci pas 32mm x 36mm. Untuk flange besar dan coupling pipa industrial.', 'Ukuran: 32x36mm, Material: Carbon Steel', '32-36mm', '550g', 'baik', 'Rak B3', 4, 5),
('17', 'Kunci Ring 8-9', 'Tekiro', 'KR-0809', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-ring-8-9&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_ring', 'TOOL-KR-0809', 5, 4, true, 'Kunci ring 8x9mm. Grip 12-point untuk torsi lebih kuat tanpa merusak kepala baut.', 'Ukuran: 8x9mm, 12-Point, Material: Chrome Vanadium Steel', '8-9mm', '50g', 'baik', 'Rak C1', 4.5, 20),
('18', 'Kunci Ring 10-11', 'Tekiro', 'KR-1011', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-ring-10-11&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_ring', 'TOOL-KR-1011', 5, 3, true, 'Kunci ring 10x11mm. Offset 15° untuk akses mudah di area terbatas.', 'Ukuran: 10x11mm, 12-Point, Offset 15°, Material: Chrome Vanadium', '10-11mm', '65g', 'baik', 'Rak C1', 4.6, 32),
('19', 'Kunci Ring 12-13', 'Stanley', 'KR-1213', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-ring-12-13&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_ring', 'TOOL-KR-1213', 4, 2, true, 'Kunci ring 12x13mm. Desain slim untuk ruang sempit, finishing anti-karat.', 'Ukuran: 12x13mm, 12-Point, Material: Chrome Vanadium Steel', '12-13mm', '90g', 'baik', 'Rak C1', 4.7, 40),
('20', 'Kunci Ring 14-15', 'Stanley', 'KR-1415', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-ring-14-15&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_ring', 'TOOL-KR-1415', 4, 4, true, 'Kunci ring 14x15mm. Standar industri untuk maintenance peralatan.', 'Ukuran: 14x15mm, 12-Point, Material: Chrome Vanadium Steel', '14-15mm', '120g', 'baik', 'Rak C1', 4.4, 25),
('21', 'Kunci Ring 17-19', 'Krisbow', 'KR-1719', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-ring-17-19&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_ring', 'TOOL-KR-1719', 3, 1, true, 'Kunci ring 17x19mm. Heavy duty untuk baut kendaraan dan mesin produksi.', 'Ukuran: 17x19mm, 12-Point, Material: Chrome Vanadium Steel', '17-19mm', '170g', 'baik', 'Rak C2', 4.5, 36),
('22', 'Kunci Ring 19-21', 'Krisbow', 'KR-1921', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-ring-19-21&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_ring', 'TOOL-KR-1921', 3, 2, true, 'Kunci ring 19x21mm untuk pekerjaan berat. Torsi tinggi dengan grip anti-slip.', 'Ukuran: 19x21mm, 12-Point, Material: Chrome Vanadium', '19-21mm', '230g', 'baik', 'Rak C2', 4.3, 18),
('23', 'Kunci Ring 22-24', 'Tekiro', 'KR-2224', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-ring-22-24&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_ring', 'TOOL-KR-2224', 2, 1, true, 'Kunci ring 22x24mm. Untuk baut dan mur besar pada mesin industri.', 'Ukuran: 22x24mm, 12-Point, Material: Chrome Vanadium', '22-24mm', '310g', 'cukup_baik', 'Rak C2', 4.1, 10),
('24', 'Kunci Ring 27-30', 'Tekiro', 'KR-2730', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-ring-27-30&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_ring', 'TOOL-KR-2730', 2, 2, true, 'Kunci ring 27x30mm extra large. Untuk flange dan coupling industrial.', 'Ukuran: 27x30mm, 12-Point, Material: Carbon Steel', '27-30mm', '450g', 'baik', 'Rak C3', 4, 6),
('25', 'Kunci Pas Ring No. 8', 'Tekiro', 'KPR-08', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pasring-8&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas_ring', 'TOOL-KPR-08', 5, 4, true, 'Kunci kombinasi 8mm — satu sisi pas, sisi lain ring. Serbaguna untuk segala kebutuhan.', 'Ukuran: 8mm, Pas + Ring 12-Point, Material: Chrome Vanadium', '8mm', '40g', 'baik', 'Rak D1', 4.6, 28),
('26', 'Kunci Pas Ring No. 10', 'Tekiro', 'KPR-10', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pasring-10&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas_ring', 'TOOL-KPR-10', 6, 3, true, 'Kunci kombinasi 10mm. Paling populer untuk maintenance harian.', 'Ukuran: 10mm, Pas + Ring 12-Point, Material: Chrome Vanadium', '10mm', '55g', 'baik', 'Rak D1', 4.8, 72),
('27', 'Kunci Pas Ring No. 12', 'Stanley', 'KPR-12', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pasring-12&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas_ring', 'TOOL-KPR-12', 5, 2, true, 'Kunci kombinasi 12mm. Handle panjang untuk leverage yang lebih baik.', 'Ukuran: 12mm, Pas + Ring 12-Point, Material: Chrome Vanadium', '12mm', '75g', 'baik', 'Rak D1', 4.7, 56),
('28', 'Kunci Pas Ring No. 13', 'Stanley', 'KPR-13', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pasring-13&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas_ring', 'TOOL-KPR-13', 5, 1, true, 'Kunci kombinasi 13mm. Standar automotif — cocok untuk baut M8.', 'Ukuran: 13mm, Pas + Ring 12-Point, Material: Chrome Vanadium', '13mm', '85g', 'baik', 'Rak D1', 4.8, 65),
('29', 'Kunci Pas Ring No. 14', 'Tekiro', 'KPR-14', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pasring-14&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas_ring', 'TOOL-KPR-14', 4, 3, true, 'Kunci kombinasi 14mm. Untuk baut M10 dan pekerjaan mekanik umum.', 'Ukuran: 14mm, Pas + Ring, Material: Chrome Vanadium', '14mm', '100g', 'baik', 'Rak D2', 4.5, 35),
('30', 'Kunci Pas Ring No. 17', 'Krisbow', 'KPR-17', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pasring-17&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas_ring', 'TOOL-KPR-17', 4, 2, true, 'Kunci kombinasi 17mm. Ukuran standar untuk baut roda kendaraan ringan.', 'Ukuran: 17mm, Pas + Ring, Material: Chrome Vanadium', '17mm', '140g', 'baik', 'Rak D2', 4.6, 44),
('31', 'Kunci Pas Ring No. 19', 'Krisbow', 'KPR-19', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pasring-19&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas_ring', 'TOOL-KPR-19', 3, 2, true, 'Kunci kombinasi 19mm. Heavy duty untuk suspension dan steering system.', 'Ukuran: 19mm, Pas + Ring, Material: Chrome Vanadium', '19mm', '180g', 'baik', 'Rak D2', 4.4, 33),
('32', 'Kunci Pas Ring No. 21', 'Stanley', 'KPR-21', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pasring-21&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas_ring', 'TOOL-KPR-21', 3, 3, true, 'Kunci kombinasi 21mm. Untuk baut besar pada truk dan alat berat.', 'Ukuran: 21mm, Pas + Ring, Material: Chrome Vanadium', '21mm', '220g', 'baik', 'Rak D2', 4.3, 17),
('33', 'Kunci Pas Ring No. 22', 'Tekiro', 'KPR-22', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pasring-22&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas_ring', 'TOOL-KPR-22', 2, 1, true, 'Kunci kombinasi 22mm. Untuk fitting hidrolik dan pneumatik.', 'Ukuran: 22mm, Pas + Ring, Material: Chrome Vanadium', '22mm', '260g', 'baik', 'Rak D3', 4.2, 12),
('34', 'Kunci Pas Ring No. 24', 'Tekiro', 'KPR-24', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pasring-24&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pas_ring', 'TOOL-KPR-24', 2, 2, true, 'Kunci kombinasi 24mm. Extra panjang untuk torsi besar pada mesin industrial.', 'Ukuran: 24mm, Pas + Ring, Material: Chrome Vanadium', '24mm', '320g', 'baik', 'Rak D3', 4.1, 9),
('35', 'Kunci Sok 8mm', 'Tekiro', 'KS-08', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-sok-8&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_sok', 'TOOL-KS-08', 6, 5, true, 'Socket 8mm drive 1/2". 6-point untuk grip maksimal pada baut.', 'Ukuran: 8mm, Drive: 1/2", 6-Point, Material: Chrome Vanadium', '8mm (1/2" drive)', '45g', 'baik', 'Rak E1', 4.5, 30),
('36', 'Kunci Sok 10mm', 'Tekiro', 'KS-10', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-sok-10&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_sok', 'TOOL-KS-10', 6, 3, true, 'Socket 10mm drive 1/2". Paling sering digunakan di workshop.', 'Ukuran: 10mm, Drive: 1/2", 6-Point, Material: Chrome Vanadium', '10mm (1/2" drive)', '50g', 'baik', 'Rak E1', 4.8, 68),
('37', 'Kunci Sok 12mm', 'Stanley', 'KS-12', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-sok-12&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_sok', 'TOOL-KS-12', 5, 4, true, 'Socket 12mm drive 1/2". Standar untuk baut M8 pada mesin.', 'Ukuran: 12mm, Drive: 1/2", 6-Point, Material: Chrome Vanadium', '12mm (1/2" drive)', '55g', 'baik', 'Rak E1', 4.6, 42),
('38', 'Kunci Sok 13mm', 'Stanley', 'KS-13', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-sok-13&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_sok', 'TOOL-KS-13', 5, 2, true, 'Socket 13mm drive 1/2". Cocok untuk baut body kendaraan.', 'Ukuran: 13mm, Drive: 1/2", 6-Point, Material: Chrome Vanadium', '13mm (1/2" drive)', '60g', 'baik', 'Rak E1', 4.7, 50),
('39', 'Kunci Sok 14mm', 'Krisbow', 'KS-14', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-sok-14&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_sok', 'TOOL-KS-14', 4, 3, true, 'Socket 14mm drive 1/2". Untuk baut M10 dan komponen engine.', 'Ukuran: 14mm, Drive: 1/2", 6-Point, Material: Chrome Vanadium', '14mm (1/2" drive)', '65g', 'baik', 'Rak E2', 4.5, 35),
('40', 'Kunci Sok 17mm', 'Krisbow', 'KS-17', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-sok-17&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_sok', 'TOOL-KS-17', 4, 1, true, 'Socket 17mm drive 1/2". Untuk drain plug oli dan baut suspensi.', 'Ukuran: 17mm, Drive: 1/2", 6-Point, Material: Chrome Vanadium', '17mm (1/2" drive)', '75g', 'baik', 'Rak E2', 4.6, 55),
('41', 'Kunci Sok 19mm', 'Tekiro', 'KS-19', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-sok-19&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_sok', 'TOOL-KS-19', 4, 2, true, 'Socket 19mm drive 1/2". Ukuran baut roda mobil standar.', 'Ukuran: 19mm, Drive: 1/2", 6-Point, Material: Chrome Vanadium', '19mm (1/2" drive)', '85g', 'baik', 'Rak E2', 4.7, 60),
('42', 'Kunci Sok 21mm', 'Tekiro', 'KS-21', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-sok-21&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_sok', 'TOOL-KS-21', 3, 3, true, 'Socket 21mm drive 1/2". Untuk baut roda truk dan baut besar lainnya.', 'Ukuran: 21mm, Drive: 1/2", 6-Point, Material: Chrome Vanadium', '21mm (1/2" drive)', '100g', 'baik', 'Rak E2', 4.4, 22),
('43', 'Kunci Sok 22mm', 'Stanley', 'KS-22', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-sok-22&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_sok', 'TOOL-KS-22', 3, 2, true, 'Socket 22mm drive 1/2". Impact grade untuk baut suspensi berat.', 'Ukuran: 22mm, Drive: 1/2", 6-Point, Material: Chrome Molybdenum', '22mm (1/2" drive)', '110g', 'baik', 'Rak E3', 4.3, 16),
('44', 'Kunci Sok 24mm', 'Stanley', 'KS-24', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-sok-24&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_sok', 'TOOL-KS-24', 2, 1, true, 'Socket 24mm drive 1/2". Untuk baut axle dan komponen drivetrain.', 'Ukuran: 24mm, Drive: 1/2", 6-Point, Material: Chrome Molybdenum', '24mm (1/2" drive)', '125g', 'baik', 'Rak E3', 4.2, 11),
('45', 'Kunci L 1.5mm', 'Tekiro', 'KL-015', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-l-1.5&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_l', 'TOOL-KL-015', 8, 7, true, 'Kunci L hex 1.5mm. Untuk sekrup set screw pada precision equipment.', 'Ukuran: 1.5mm, Panjang: 90mm, Material: S2 Tool Steel', '1.5mm', '5g', 'baik', 'Rak F1', 4.3, 12),
('46', 'Kunci L 2mm', 'Tekiro', 'KL-020', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-l-2&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_l', 'TOOL-KL-020', 8, 6, true, 'Kunci L hex 2mm. Standar untuk baut furniture dan perangkat elektronik.', 'Ukuran: 2mm, Panjang: 100mm, Material: S2 Tool Steel', '2mm', '8g', 'baik', 'Rak F1', 4.4, 18),
('47', 'Kunci L 3mm', 'Stanley', 'KL-030', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-l-3&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_l', 'TOOL-KL-030', 6, 5, true, 'Kunci L hex 3mm. Untuk socket head cap screw M4.', 'Ukuran: 3mm, Panjang: 120mm, Ball-end, Material: S2 Tool Steel', '3mm', '15g', 'baik', 'Rak F1', 4.6, 25),
('48', 'Kunci L 4mm', 'Stanley', 'KL-040', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-l-4&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_l', 'TOOL-KL-040', 6, 3, true, 'Kunci L hex 4mm ball-end. Bisa masuk pada sudut hingga 25°.', 'Ukuran: 4mm, Panjang: 140mm, Ball-end, Material: S2 Tool Steel', '4mm', '22g', 'baik', 'Rak F1', 4.7, 38),
('49', 'Kunci L 5mm', 'Krisbow', 'KL-050', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-l-5&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_l', 'TOOL-KL-050', 5, 4, true, 'Kunci L hex 5mm. Untuk socket head cap screw M6, paling umum di industri.', 'Ukuran: 5mm, Panjang: 160mm, Ball-end, Material: S2 Tool Steel', '5mm', '32g', 'baik', 'Rak F1', 4.8, 52),
('50', 'Kunci L 6mm', 'Krisbow', 'KL-060', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-l-6&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_l', 'TOOL-KL-060', 5, 2, true, 'Kunci L hex 6mm. Untuk socket head cap screw M8.', 'Ukuran: 6mm, Panjang: 180mm, Ball-end, Material: S2 Tool Steel', '6mm', '50g', 'baik', 'Rak F2', 4.6, 40),
('51', 'Kunci L 8mm', 'Tekiro', 'KL-080', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-l-8&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_l', 'TOOL-KL-080', 4, 3, true, 'Kunci L hex 8mm. Untuk socket head cap screw M10 dan M12.', 'Ukuran: 8mm, Panjang: 200mm, Material: S2 Tool Steel', '8mm', '80g', 'baik', 'Rak F2', 4.5, 28),
('52', 'Kunci L 10mm', 'Tekiro', 'KL-100', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-l-10&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_l', 'TOOL-KL-100', 3, 3, true, 'Kunci L hex 10mm. Untuk cap screw besar pada mesin industrial.', 'Ukuran: 10mm, Panjang: 230mm, Material: S2 Tool Steel', '10mm', '120g', 'baik', 'Rak F2', 4.3, 14),
('53', 'Set Kunci L 9pcs (1.5-10mm)', 'Stanley', 'KL-SET9', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-l-set-9&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_l', 'TOOL-KL-SET9', 3, 1, true, 'Set kunci L lengkap 9 pcs (1.5, 2, 2.5, 3, 4, 5, 6, 8, 10mm) dalam holder plastik.', '9 pcs: 1.5-10mm, Ball-end, Material: S2 Tool Steel, Dengan Holder', '1.5-10mm (set)', '350g', 'baik', 'Rak F2', 4.9, 78),
('54', 'Kunci Torx T10', 'Tekiro', 'KT-T10', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-torx-t10&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_torx', 'TOOL-KT-T10', 5, 4, true, 'Kunci Torx T10. Untuk sekrup bintang pada perangkat elektronik dan laptop.', 'Ukuran: T10, Panjang: 100mm, Material: S2 Tool Steel', 'T10', '12g', 'baik', 'Rak G1', 4.4, 20),
('55', 'Kunci Torx T15', 'Tekiro', 'KT-T15', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-torx-t15&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_torx', 'TOOL-KT-T15', 5, 3, true, 'Kunci Torx T15. Standar untuk hard drive dan SSD mounting.', 'Ukuran: T15, Panjang: 110mm, Material: S2 Tool Steel', 'T15', '15g', 'baik', 'Rak G1', 4.5, 24),
('56', 'Kunci Torx T20', 'Stanley', 'KT-T20', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-torx-t20&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_torx', 'TOOL-KT-T20', 4, 3, true, 'Kunci Torx T20. Untuk baut interior kendaraan dan appliance.', 'Ukuran: T20, Panjang: 120mm, Material: S2 Tool Steel', 'T20', '20g', 'baik', 'Rak G1', 4.5, 22),
('57', 'Kunci Torx T25', 'Stanley', 'KT-T25', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-torx-t25&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_torx', 'TOOL-KT-T25', 4, 2, true, 'Kunci Torx T25. Untuk brake caliper dan komponen automotif.', 'Ukuran: T25, Panjang: 130mm, Material: S2 Tool Steel', 'T25', '25g', 'baik', 'Rak G1', 4.6, 30),
('58', 'Kunci Torx T30', 'Krisbow', 'KT-T30', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-torx-t30&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_torx', 'TOOL-KT-T30', 3, 2, true, 'Kunci Torx T30. Untuk baut mesin dan komponen drivetrain.', 'Ukuran: T30, Panjang: 140mm, Material: S2 Tool Steel', 'T30', '30g', 'baik', 'Rak G1', 4.4, 18),
('59', 'Set Kunci Torx 8pcs (T10-T50)', 'Krisbow', 'KT-SET8', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-torx-set-8&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_torx', 'TOOL-KT-SET8', 3, 1, true, 'Set kunci Torx lengkap 8 pcs (T10, T15, T20, T25, T27, T30, T40, T50) dengan holder.', '8 pcs: T10-T50, Ball-end, Material: S2 Tool Steel, Dengan Holder', 'T10-T50 (set)', '280g', 'baik', 'Rak G2', 4.8, 55),
('60', 'Kunci Pipa 10"', 'Tekiro', 'KPIP-10', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pipa-10&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pipa', 'TOOL-KPIP-10', 3, 2, true, 'Kunci pipa 10 inch. Self-tightening jaw untuk grip kuat pada pipa bulat.', 'Panjang: 250mm, Kapasitas: 25mm, Material: Cast Iron + Steel Jaw', '10" (250mm)', '700g', 'baik', 'Rak H1', 4.4, 25),
('61', 'Kunci Pipa 14"', 'Stanley', 'KPIP-14', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pipa-14&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pipa', 'TOOL-KPIP-14', 3, 1, true, 'Kunci pipa 14 inch. Standar plumbing untuk pipa 1" - 1.5".', 'Panjang: 350mm, Kapasitas: 38mm, Material: Cast Iron + Steel Jaw', '14" (350mm)', '1200g', 'baik', 'Rak H1', 4.6, 35),
('62', 'Kunci Pipa 18"', 'Krisbow', 'KPIP-18', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pipa-18&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pipa', 'TOOL-KPIP-18', 2, 2, true, 'Kunci pipa 18 inch heavy duty. Untuk pipa 2" dan fitting besar.', 'Panjang: 450mm, Kapasitas: 50mm, Material: Cast Iron + Steel Jaw', '18" (450mm)', '1800g', 'baik', 'Rak H1', 4.3, 15),
('63', 'Kunci Pipa 24"', 'Krisbow', 'KPIP-24', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-pipa-24&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_pipa', 'TOOL-KPIP-24', 1, 1, true, 'Kunci pipa 24 inch extra large. Untuk instalasi pipa besar dan industrial.', 'Panjang: 600mm, Kapasitas: 75mm, Material: Cast Iron + Steel Jaw', '24" (600mm)', '3200g', 'cukup_baik', 'Rak H2', 4, 7),
('64', 'Kunci Momen 1/4" (5-25 Nm)', 'Tekiro', 'KM-014', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-momen-1-4&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_momen', 'TOOL-KM-014', 2, 1, true, 'Kunci momen presisi 1/4" drive. Untuk pekerjaan yang membutuhkan torsi akurat pada baut kecil.', 'Drive: 1/4", Range: 5-25 Nm, Akurasi: ±4%, Material: Chrome Vanadium', '1/4" (5-25 Nm)', '350g', 'baik', 'Rak I1', 4.7, 22),
('65', 'Kunci Momen 3/8" (10-60 Nm)', 'Stanley', 'KM-038', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-momen-3-8&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_momen', 'TOOL-KM-038', 2, 1, true, 'Kunci momen 3/8" drive. Serbaguna untuk baut cylinder head dan intake manifold.', 'Drive: 3/8", Range: 10-60 Nm, Akurasi: ±4%, Material: Chrome Vanadium', '3/8" (10-60 Nm)', '550g', 'baik', 'Rak I1', 4.8, 38),
('66', 'Kunci Momen 1/2" (28-210 Nm)', 'Krisbow', 'KM-012', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-momen-1-2&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_momen', 'TOOL-KM-012', 2, 0, true, 'Kunci momen 1/2" drive. Heavy duty untuk baut roda, suspension, dan flywheel.', 'Drive: 1/2", Range: 28-210 Nm, Akurasi: ±4%, Dengan Klik Audible', '1/2" (28-210 Nm)', '850g', 'baik', 'Rak I1', 4.9, 75),
('67', 'Kunci Momen Digital 1/2" (10-200 Nm)', 'Stanley', 'KM-DIG', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-momen-digital&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_momen', 'TOOL-KM-DIG', 1, 1, true, 'Kunci momen digital premium. Layar LCD menampilkan torsi real-time, buzzer, dan LED alert.', 'Drive: 1/2", Range: 10-200 Nm, Akurasi: ±2%, LCD Display, Memory 50 Data', '1/2" (10-200 Nm)', '750g', 'baik', 'Rak I1', 5, 30),
('68', 'Kunci Kotrek / Ratchet 1/2"', 'Tekiro', 'KSP-RAT12', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-kotrek-1-2&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_spesial', 'TOOL-KSP-RAT12', 4, 2, true, 'Kunci kotrek/ratchet 1/2" drive, 72-tooth gear untuk aksi 5° swing angle. Quick release.', 'Drive: 1/2", 72 Teeth, Swing Angle: 5°, Quick Release, Material: Chrome Vanadium', '1/2" drive', '350g', 'baik', 'Rak J1', 4.8, 62),
('69', 'Kunci Kotrek / Ratchet 3/8"', 'Stanley', 'KSP-RAT38', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-kotrek-3-8&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_spesial', 'TOOL-KSP-RAT38', 3, 1, true, 'Kunci kotrek/ratchet 3/8" drive. Compact untuk akses di area terbatas.', 'Drive: 3/8", 72 Teeth, Quick Release, Material: Chrome Vanadium', '3/8" drive', '250g', 'baik', 'Rak J1', 4.7, 48),
('70', 'Kunci Filter Oli', 'Tekiro', 'KSP-FO', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-filter-oli&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_spesial', 'TOOL-KSP-FO', 3, 2, true, 'Kunci filter oli tipe strap/rantai. Universal untuk berbagai ukuran filter oli kendaraan.', 'Kapasitas: 60-120mm diameter, Tipe: Strap, Material: Steel + Nylon Strap', 'Universal (60-120mm)', '280g', 'baik', 'Rak J1', 4.5, 33),
('71', 'Kunci Busi 16mm', 'Krisbow', 'KSP-BUS16', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-busi-16&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_spesial', 'TOOL-KSP-BUS16', 4, 3, true, 'Kunci busi 16mm dengan rubber insert untuk melindungi keramik busi. Drive 3/8".', 'Ukuran: 16mm, Drive: 3/8", Rubber Insert, Material: Chrome Vanadium', '16mm (3/8" drive)', '80g', 'baik', 'Rak J1', 4.6, 28),
('72', 'Kunci Busi 21mm', 'Krisbow', 'KSP-BUS21', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-busi-21&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_spesial', 'TOOL-KSP-BUS21', 3, 2, true, 'Kunci busi 21mm deep socket. Untuk busi kendaraan diesel dan heavy equipment.', 'Ukuran: 21mm, Drive: 1/2", Deep Socket, Rubber Insert', '21mm (1/2" drive)', '120g', 'baik', 'Rak J2', 4.4, 19),
('73', 'Kunci Y 8-10-12', 'Tekiro', 'KSP-Y81012', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-y-8-10-12&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_spesial', 'TOOL-KSP-Y81012', 4, 3, true, 'Kunci Y tiga cabang 8mm, 10mm, 12mm. Praktis, 3 ukuran dalam 1 alat.', 'Ukuran: 8/10/12mm, Tipe: Y Socket, Material: Chrome Vanadium', '8-10-12mm', '180g', 'baik', 'Rak J2', 4.5, 35),
('74', 'Kunci Y 10-12-14', 'Tekiro', 'KSP-Y101214', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-y-10-12-14&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_spesial', 'TOOL-KSP-Y101214', 3, 2, true, 'Kunci Y tiga cabang 10mm, 12mm, 14mm. Untuk pekerjaan cepat tanpa ganti kunci.', 'Ukuran: 10/12/14mm, Tipe: Y Socket, Material: Chrome Vanadium', '10-12-14mm', '220g', 'baik', 'Rak J2', 4.4, 28),
('75', 'Kunci Roda Cross 17-19-21-23', 'Krisbow', 'KSP-RODA', 'https://api.dicebear.com/9.x/shapes/svg?seed=kunci-roda-cross&backgroundColor=0d9488,0f766e,14b8a6&shape1Color=ffffff&shape2Color=ccfbf1&shape3Color=99f6e4', 'kunci_spesial', 'TOOL-KSP-RODA', 3, 1, true, 'Kunci roda palang/cross 4 ukuran. Untuk bongkar pasang roda kendaraan.', 'Ukuran: 17/19/21/23mm, Tipe: Cross Wrench, Material: Carbon Steel', '17-19-21-23mm', '1500g', 'baik', 'Rak J2', 4.7, 45)
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
