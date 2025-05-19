-- Create admin_logs table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE admin_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users,
  action text NOT NULL,
  entity text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX admin_logs_user_id_idx ON admin_logs(user_id);
CREATE INDEX admin_logs_created_at_idx ON admin_logs(created_at DESC);

-- Set up RLS policies
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admin users can view all logs" ON admin_logs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Only the system can insert logs
CREATE POLICY "System can insert logs" ON admin_logs
  FOR INSERT
  WITH CHECK (true);

-- No one can update or delete logs
CREATE POLICY "No updates allowed" ON admin_logs
  FOR UPDATE
  USING (false);

CREATE POLICY "No deletes allowed" ON admin_logs
  FOR DELETE
  USING (false); 