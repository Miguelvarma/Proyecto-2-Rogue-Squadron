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

async function checkItems() {
  try {
    const pool = mysql.createPool(config);
    const connection = await pool.getConnection();

    console.log('\n📊 ANÁLISIS DE ITEMS:\n');

    // Total items
    const [total] = await connection.query('SELECT COUNT(*) as count FROM items WHERE activo = TRUE');
    console.log(`Total de items activos: ${total[0].count}`);

    // Items con user_id
    const [withUser] = await connection.query('SELECT COUNT(*) as count FROM items WHERE activo = TRUE AND user_id IS NOT NULL');
    console.log(`Items asignados a usuarios: ${withUser[0].count}`);

    // Items sin user_id
    const [withoutUser] = await connection.query('SELECT COUNT(*) as count FROM items WHERE activo = TRUE AND user_id IS NULL');
    console.log(`Items del sistema (sin user): ${withoutUser[0].count}`);

    // Breakdown por usuario
    const [byUser] = await connection.query(`
      SELECT user_id, COUNT(*) as count FROM items 
      WHERE activo = TRUE AND user_id IS NOT NULL
      GROUP BY user_id
    `);

    if (byUser.length > 0) {
      console.log('\nItems por usuario:');
      byUser.forEach(row => {
        console.log(`  - ${row.user_id}: ${row.count} items`);
      });
    } else {
      console.log('\n⚠️  ¡PROBLEMA ENCONTRADO!');
      console.log('Ningún item está asignado a los usuarios.');
      console.log('Todos los items tienen user_id = NULL\n');
    }

    connection.release();
    pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkItems();
