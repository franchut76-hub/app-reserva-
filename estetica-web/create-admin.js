const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createAdmin() {
  console.log('Creando cuenta de dueño en Auth...');
  const ownerEmail = 'admin@esteticaweb.com';
  const ownerPassword = 'AdminPassword2026!';
  
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listando usuarios:', listError.message);
    process.exit(1);
  }
  const existingUser = users?.users.find(u => u.email === ownerEmail);
  
  if (!existingUser) {
    const { error: createError } = await supabase.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true
    });
    if (createError) {
      console.error('Error creando usuario:', createError.message);
    } else {
      console.log('Usuario creado exitosamente.');
    }
  } else {
    console.log('El usuario dueño ya existe.');
  }

  console.log('\n--- SETUP COMPLETADO ---');
  console.log('Email Admin:', ownerEmail);
  console.log('Password Admin:', ownerPassword);
}

createAdmin();
