-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('todo', 'in-progress', 'done')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  hours_spent NUMERIC,
  source TEXT,
  user_email TEXT
);

-- Create RLS policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read all tasks
CREATE POLICY "Allow all users to read all tasks" ON tasks
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own tasks
CREATE POLICY "Allow authenticated users to insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update any task
CREATE POLICY "Allow authenticated users to update any task" ON tasks
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete any task
CREATE POLICY "Allow authenticated users to delete any task" ON tasks
  FOR DELETE USING (auth.role() = 'authenticated');
