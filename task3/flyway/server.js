const { exec } = require('child_process');

exec('flyway migrate', (error, stdout, stderr) => {
  if (error) {
    console.error(`Ошибка при запуске миграций: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
