import db from './db';

db.run(db.createTableSql, (err) => {
  if (err) {
    console.error('Could not create cakes table', err);
    process.exitCode = 1;
    return;
  }

  console.log('Cakes table is ready');
  db.close();
});
