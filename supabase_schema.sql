-- Supabase Database Schema for Farmora Application
-- Copy and execute these queries inside the Supabase SQL Editor (SQL Editor tab).

-- =======================================================================
-- 1. PROFILES TABLE
-- Stores user information, language settings, and location coordinate caches
-- =======================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    language TEXT DEFAULT 'English',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    city TEXT,
    location_enabled BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow public read-access to profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to automatically create a profile for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Agri Farmer'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =======================================================================
-- 2. BUYERS & SELLERS TABLE
-- Stores peer-to-peer crop listing offerings (from farmers or buyers)
-- =======================================================================
CREATE TABLE IF NOT EXISTS public.buyers_sellers (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT,
    crop TEXT,
    price TEXT,
    quantity TEXT,
    location TEXT,
    distance TEXT,
    phone TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for Buyers & Sellers
ALTER TABLE public.buyers_sellers ENABLE ROW LEVEL SECURITY;

-- Buyers & Sellers Policies
CREATE POLICY "Allow public read-access to buyers_sellers" ON public.buyers_sellers
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert listings" ON public.buyers_sellers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- =======================================================================
-- 3. PRODUCTS TABLE
-- Stores commercial listings or catalogue items for the Agricultural Store
-- =======================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    price TEXT,
    "originalPrice" TEXT,
    rating DOUBLE PRECISION,
    reviews INTEGER,
    seller TEXT,
    description TEXT,
    image TEXT,
    "inStock" BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Allow public read-access to products" ON public.products
    FOR SELECT USING (true);


-- =======================================================================
-- 4. CALENDAR TASKS TABLE
-- Stores personalized agricultural steps (e.g. Rice, Wheat timelines) for each user
-- =======================================================================
CREATE TABLE IF NOT EXISTS public.calendar_tasks (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date TEXT NOT NULL, -- Format: CropName|PhaseName (e.g. Rice|Sowing)
    day TEXT,
    title TEXT NOT NULL,
    description TEXT,
    time TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for Calendar Tasks
ALTER TABLE public.calendar_tasks ENABLE ROW LEVEL SECURITY;

-- Calendar Tasks Policies
CREATE POLICY "Allow users to read their own calendar_tasks" ON public.calendar_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own calendar_tasks" ON public.calendar_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own calendar_tasks" ON public.calendar_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own calendar_tasks" ON public.calendar_tasks
    FOR DELETE USING (auth.uid() = user_id);


-- =======================================================================
-- 5. SCAN LOGS TABLE
-- Stores crop disease detection scan logs for each user
-- =======================================================================
CREATE TABLE IF NOT EXISTS public.scan_logs (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_type TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    date TEXT NOT NULL,
    severity TEXT, -- Used to store the image URL locally/remotely
    confidence TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for Scan Logs
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- Scan Logs Policies
CREATE POLICY "Allow users to read their own scan_logs" ON public.scan_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own scan_logs" ON public.scan_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- =======================================================================
-- 6. SEED MOCK DATA
-- Pre-populates the database with initial marketplace sellers and products
-- =======================================================================

-- Seed default marketplace sellers
INSERT INTO public.buyers_sellers (id, name, role, crop, price, quantity, location, distance, phone, verified)
VALUES
('sb1', 'Rajesh Kumar', 'seller', 'Organic Wheat', '₹25/kg', '500kg', 'Karnal Mandi', '2.4 km away', '+919876543210', true),
('sb2', 'Sunita Devi', 'seller', 'Premium Basmati Rice', '₹68/kg', '1200kg', 'Nellore Market Yard', '5.8 km away', '+919876543211', true),
('sb3', 'Amit Singh', 'seller', 'Desi Maize', '₹18/kg', '800kg', 'Anand Cooperative', '3.1 km away', '+919876543212', false),
('sb4', 'Sukhwinder Singh', 'seller', 'Sugarcane', '₹35/kg', '5000kg', 'Jalandhar Sugar Mill Yard', '7.3 km away', '+919876543213', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    crop = EXCLUDED.crop,
    price = EXCLUDED.price,
    quantity = EXCLUDED.quantity,
    location = EXCLUDED.location,
    distance = EXCLUDED.distance,
    phone = EXCLUDED.phone,
    verified = EXCLUDED.verified;

-- Seed default agricultural shop products
INSERT INTO public.products (id, name, category, price, "originalPrice", rating, reviews, seller, description, image, "inStock")
VALUES
('p1', 'Hybrid Paddy Seeds (Sardar 29)', 'seeds', '₹550', '₹650', 4.6, 120, 'Mahalaxmi Agro Center', 'High-yielding hybrid paddy seeds, drought-resistant, matures in 115 days. Yield potential of 28-30 quintals/acre.', 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=300&auto=format&fit=crop', true),
('p2', 'Organic Neem Fertilizer Cake', 'fertilizers', '₹350', '₹400', 4.8, 84, 'EcoGrow Organic Solutions', '100% organic neem oil cake meal. Acts as both a natural nitrogen-rich fertilizer and pest repellent protecting roots from nematodes.', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=300&auto=format&fit=crop', true),
('p3', 'Power Sprayer (16L Battery Operated)', 'tools', '₹2,200', '₹2,800', 4.4, 215, 'Krishi Tools Ltd.', 'Dual-mode battery-operated and manual back sprayer. Includes a 12V 8AH battery, high-pressure pump, and 4 nozzles.', 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=300&auto=format&fit=crop', true),
('p4', 'Broad-Spectrum Bio-Pesticide (Neem Shield)', 'pesticides', '₹480', '₹520', 4.7, 62, 'Green Earth Bio Tech', 'Concentrated cold-pressed neem oil bio-pesticide with 1500 PPM Azadirachtin. Controls sucking and chewing insects naturally.', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=300&auto=format&fit=crop', true),
('p5', 'Drip Irrigation Kit (1 Acre Setup)', 'tools', '₹8,500', '₹9,999', 4.9, 38, 'Krishi Tools Ltd.', 'Complete drip irrigation starter kit including main supply pipe, lateral tubes, emitters, filters, and connectors for up to 1 acre of vegetable farm.', 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=300&auto=format&fit=crop', false)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    "originalPrice" = EXCLUDED."originalPrice",
    rating = EXCLUDED.rating,
    reviews = EXCLUDED.reviews,
    seller = EXCLUDED.seller,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    "inStock" = EXCLUDED."inStock";
