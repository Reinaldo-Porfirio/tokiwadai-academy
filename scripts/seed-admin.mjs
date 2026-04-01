import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não está configurado em .env.local');
  process.exit(1);
}

async function seedAdmin() {
  let connection;
  try {
    // Parse DATABASE_URL
    const url = new URL(DATABASE_URL);
    const config = {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: url.port || 3306,
    };

    connection = await mysql.createConnection(config);
    console.log('✅ Conectado ao banco de dados');

    // Check if admin already exists
    const [rows] = await connection.execute(
      'SELECT * FROM admins WHERE username = ?',
      ['admin']
    );

    if (rows.length > 0) {
      console.log('⚠️  Admin "admin" já existe no banco de dados');
      console.log('Atualizando senha para admin123...');
    }

    // Hash password
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Insert or update admin
    if (rows.length > 0) {
      await connection.execute(
        'UPDATE admins SET password_hash = ? WHERE username = ?',
        [passwordHash, 'admin']
      );
      console.log('✅ Senha do admin atualizada para: admin123');
    } else {
      await connection.execute(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        ['admin', passwordHash]
      );
      console.log('✅ Admin criado com sucesso!');
    }

    console.log('\n📝 Credenciais de acesso:');
    console.log('   Usuário: admin');
    console.log('   Senha: admin123');

    await connection.end();
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
