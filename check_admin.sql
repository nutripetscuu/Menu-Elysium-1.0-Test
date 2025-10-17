-- Check if admin user exists
SELECT 
  au.id,
  au.email,
  au.role,
  au.created_at,
  CASE 
    WHEN auth.users.id IS NOT NULL THEN 'YES - User exists in Auth'
    ELSE 'NO - User NOT in Auth'
  END as auth_status
FROM admin_users au
LEFT JOIN auth.users ON auth.users.id = au.id
ORDER BY au.created_at DESC;
