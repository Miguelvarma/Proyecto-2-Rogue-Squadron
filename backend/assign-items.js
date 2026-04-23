const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1123433815juansehr$',
  database: 'nexus_battles',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
};

async function assignItems() {
  try {
    const pool = mysql.createPool(config);
    const connection = await pool.getConnection();

    console.log('\n🔄 REASIGNANDO ITEMS A USUARIOS...\n');

    // Asignar items pares a user-1, impares a user-2
    const [result1] = await connection.query(`
      UPDATE items 
      SET user_id = 'user-1' 
      WHERE activo = TRUE 
        AND (id LIKE 'item-1' OR id LIKE 'item-3' OR id LIKE 'item-5' OR id LIKE 'item-7' 
             OR id LIKE 'item-9' OR id LIKE 'item-11' OR id LIKE 'item-13' OR id LIKE 'item-15'
             OR id LIKE 'item-17' OR id LIKE 'item-19' OR id LIKE 'item-21' OR id LIKE 'item-23'
             OR id LIKE 'item-25' OR id LIKE 'item-27' OR id LIKE 'item-29' OR id LIKE 'item-31'
             OR id LIKE 'item-33' OR id LIKE 'item-35' OR id LIKE 'item-37' OR id LIKE 'item-39'
             OR id LIKE 'item-41' OR id LIKE 'item-43' OR id LIKE 'item-45' OR id LIKE 'item-47'
             OR id LIKE 'item-49' OR id LIKE 'item-51' OR id LIKE 'item-53' OR id LIKE 'item-55'
             OR id LIKE 'item-57' OR id LIKE 'item-59' OR id LIKE 'item-61' OR id LIKE 'item-63'
             OR id LIKE 'item-65' OR id LIKE 'item-67' OR id LIKE 'item-69')
    `);
    console.log(`✅ Asignados a user-1: ${result1.affectedRows} items`);

    const [result2] = await connection.query(`
      UPDATE items 
      SET user_id = 'user-2' 
      WHERE activo = TRUE 
        AND (id LIKE 'item-2' OR id LIKE 'item-4' OR id LIKE 'item-6' OR id LIKE 'item-8'
             OR id LIKE 'item-10' OR id LIKE 'item-12' OR id LIKE 'item-14' OR id LIKE 'item-16'
             OR id LIKE 'item-18' OR id LIKE 'item-20' OR id LIKE 'item-22' OR id LIKE 'item-24'
             OR id LIKE 'item-26' OR id LIKE 'item-28' OR id LIKE 'item-30' OR id LIKE 'item-32'
             OR id LIKE 'item-34' OR id LIKE 'item-36' OR id LIKE 'item-38' OR id LIKE 'item-40'
             OR id LIKE 'item-42' OR id LIKE 'item-44' OR id LIKE 'item-46' OR id LIKE 'item-48'
             OR id LIKE 'item-50' OR id LIKE 'item-52' OR id LIKE 'item-54' OR id LIKE 'item-56'
             OR id LIKE 'item-58' OR id LIKE 'item-60' OR id LIKE 'item-62' OR id LIKE 'item-64'
             OR id LIKE 'item-66' OR id LIKE 'item-68' OR id LIKE 'item-70')
    `);
    console.log(`✅ Asignados a user-2: ${result2.affectedRows} items`);

    // Verificar
    const [check1] = await connection.query('SELECT COUNT(*) as count FROM items WHERE user_id = "user-1"');
    const [check2] = await connection.query('SELECT COUNT(*) as count FROM items WHERE user_id = "user-2"');
    const [checkNull] = await connection.query('SELECT COUNT(*) as count FROM items WHERE user_id IS NULL');

    console.log('\n📊 RESUMEN FINAL:');
    console.log(`  user-1: ${check1[0].count} items`);
    console.log(`  user-2: ${check2[0].count} items`);
    console.log(`  Sin asignar: ${checkNull[0].count} items`);
    console.log('\n✅ ¡Reasignación completada!\n');

    connection.release();
    pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

assignItems();
