-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Profile" (
    "userId",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    NEW.id,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create a profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS (Row Level Security) on Profile table
ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view their own profile"
ON public."Profile"
FOR SELECT
USING (auth.uid() = "userId");

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public."Profile"
FOR UPDATE
USING (auth.uid() = "userId");
