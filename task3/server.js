const { exec } = require('child_process');
const express = require('express');
const app = express();
const port = 3000;

// Функция для запуска команды Liquibase
function runLiquibaseMigration() {
  console.log("Starting Liquibase migration...");

  exec('npx liquibase --defaultsFile=liquibase-dst.properties update', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running Liquibase: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Liquibase stderr: ${stderr}`);
      return;
    }
    console.log(`Liquibase stdout: ${stdout}`);
  });
}

// Запуск миграции перед запуском сервера
runLiquibaseMigration();

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Data migration will be triggered upon server start.');
});
