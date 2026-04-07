-- Create the customer_records table
CREATE TABLE IF NOT EXISTS customer_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  city TEXT NOT NULL,
  device TEXT NOT NULL,
  category TEXT NOT NULL,
  amount_spent NUMERIC NOT NULL,
  purchase_frequency INTEGER NOT NULL,
  session_duration INTEGER NOT NULL,
  cart_status TEXT NOT NULL,
  abandon_reason TEXT,
  day_of_week TEXT NOT NULL,
  hour_of_day INTEGER NOT NULL,
  month TEXT NOT NULL,
  customer_segment TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE customer_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own records" 
  ON customer_records FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records" 
  ON customer_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" 
  ON customer_records FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records" 
  ON customer_records FOR DELETE 
  USING (auth.uid() = user_id);
