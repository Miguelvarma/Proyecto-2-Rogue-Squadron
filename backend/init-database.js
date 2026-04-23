#!/usr/bin/env node
/**
 * ============================================
 * Script para inicializar la BD de Nexus Battles
 * ============================================
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1123433815juansehr$',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
};

async function initializeDatabase() {
  let connection;
  let pool;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('  🚀 INICIALIZADOR DE BD - NEXUS BATTLES V');
    console.log('='.repeat(60));
    
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'scripts', 'init-db-complete.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`❌ No se encontró el archivo: ${sqlFilePath}`);
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('\n✅ Archivo SQL cargado correctamente');
    
    // Conectar a MySQL
    pool = mysql.createPool(config);
    connection = await pool.getConnection();
    
    console.log('✅ Conectado a MySQL en localhost:3306');
    
    // Remover comentarios y dividir solamente por ; que no estén dentro de comentarios
    let lines = sqlContent.split('\n');
    let cleaned = [];
    for (let line of lines) {
      // Remover comentarios de línea (--) y de bloque (#)
      if (line.includes('--')) {
        line = line.substring(0, line.indexOf('--'));
      }
      line = line.trim();
      if (line) cleaned.push(line);
    }
    
    let fullText = cleaned.join('\n');
    const statements = fullText
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`\n📋 Se encontraron ${statements.length} sentencias SQL`);
    console.log('\n⏳ Ejecutando sentencias...\n');
    
    let executedCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      
      if (!statement) continue;
      
      try {
        const isMainStatement = /^(DROP|CREATE|INSERT|UPDATE|SELECT|ALTER)/.test(statement);
        
        if (isMainStatement) {
          const preview = statement.substring(0, 55).replace(/\n/g, ' ').padEnd(55);
          process.stdout.write(`  [${String(executedCount + 1).padStart(3)}] ${preview}`);
        }
        
        await connection.query(statement);
        executedCount++;
        
        if (isMainStatement) {
          console.log(' ✓');
        }
      } catch (err) {
        if (isMainStatement) console.log(' ✗');
        if (err.message.includes('already exists') || err.message.includes('Duplicate')) {
          continue;
        }
        throw err;
      }
    }
    
    console.log(`\n✅ Se ejecutaron ${executedCount} sentencias correctamente\n`);
    
    // Verificar los datos
    console.log('📊 Verificando datos...\n');
    
    const [itemCount] = await connection.query('SELECT COUNT(*) as count FROM items WHERE activo = TRUE');
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [deckCount] = await connection.query('SELECT COUNT(*) as count FROM decks');
    const [ratingCount] = await connection.query('SELECT COUNT(*) as count FROM ratings');
    
    const items = itemCount[0].count;
    const users = userCount[0].count;
    const decks = deckCount[0].count;
    const ratings = ratingCount[0].count;
    
    console.log(`  📦 Items:     ${items} (esperados: 70)`);
    console.log(`  👥 Usuarios:  ${users} (esperados: 3)`);
    console.log(`  🃏 Mazos:     ${decks} (esperados: 2)`);
    console.log(`  ⭐ Ratings:   ${ratings} (esperados: 4)`);
    
    // Verificar estructura
    const [tables] = await connection.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'nexus_battles'
    `);
    
    console.log(`\n  📋 Tablas creadas: ${tables.length}`);
    tables.forEach(t => console.log(`     - ${t.TABLE_NAME}`));
    
    console.log('\n' + '='.repeat(60));
    console.log('  ✅ BD INICIALIZADA CORRECTAMENTE');
    console.log('='.repeat(60));
    console.log('\n  Próximos pasos:');
    console.log('  1. npm run dev (en carpeta backend)');
    console.log('  2. http://localhost:5173/inventory');
    console.log('\n');
    
    connection.release();
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.error('  💡 MySQL no está corriendo en localhost:3306');
    } else if (error.message.includes('Access denied')) {
      console.error('  💡 Credenciales incorrectas en backend/.env');
    }
    
    process.exit(1);
  }
}

initializeDatabase();
