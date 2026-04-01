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

async function seedDatabase() {
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

    // Create admin
    console.log('\n📝 Criando admin...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    try {
      await connection.execute(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        ['admin', adminPasswordHash]
      );
      console.log('✅ Admin "admin" criado (senha: admin123)');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('⚠️  Admin "admin" já existe');
      } else {
        throw error;
      }
    }

    // Create test students
    console.log('\n📝 Criando estudantes de teste...');
    const studentPasswordHash = await bcrypt.hash('123456', 10);
    
    const testStudents = [
      {
        studentId: 'TKW-2026-00001',
        username: 'alice',
        fullName: 'Alice Silva',
        email: 'alice@tokiwadai.local',
        grade: 1,
        district: 1,
      },
      {
        studentId: 'TKW-2026-00002',
        username: 'bob',
        fullName: 'Bob Santos',
        email: 'bob@tokiwadai.local',
        grade: 2,
        district: 2,
      },
      {
        studentId: 'TKW-2026-00003',
        username: 'carol',
        fullName: 'Carol Oliveira',
        email: 'carol@tokiwadai.local',
        grade: 3,
        district: 3,
      },
    ];

    for (const student of testStudents) {
      try {
        await connection.execute(
          `INSERT INTO students 
           (student_id, username, full_name, email, password_hash, grade, district, birth_date) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            student.studentId,
            student.username,
            student.fullName,
            student.email,
            studentPasswordHash,
            student.grade,
            student.district,
            '2010-01-01',
          ]
        );
        console.log(`✅ Estudante "${student.username}" criado (senha: 123456)`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Estudante "${student.username}" já existe`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Seed do banco de dados concluído!');
    console.log('\n📝 Credenciais de teste:');
    console.log('\n   ADMIN:');
    console.log('   - Usuário: admin');
    console.log('   - Senha: admin123');
    console.log('\n   ESTUDANTES:');
    console.log('   - alice / 123456');
    console.log('   - bob / 123456');
    console.log('   - carol / 123456');

    await connection.end();
  } catch (error) {
    console.error('❌ Erro ao fazer seed do banco de dados:', error.message);
    process.exit(1);
  }
}

seedDatabase();
