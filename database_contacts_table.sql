-- Create contacts table for contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'read', 'replied'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contacts (public form)
DROP POLICY IF EXISTS "Allow public to submit contact form" ON contacts;
CREATE POLICY "Allow public to submit contact form" ON contacts FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users (admins) to read all contacts
DROP POLICY IF EXISTS "Allow authenticated users to read contacts" ON contacts;
CREATE POLICY "Allow authenticated users to read contacts" ON contacts FOR SELECT TO authenticated USING (true);

-- Allow authenticated users (admins) to update contacts
DROP POLICY IF EXISTS "Allow authenticated users to update contacts" ON contacts;
CREATE POLICY "Allow authenticated users to update contacts" ON contacts FOR UPDATE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Create updated_at trigger
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
