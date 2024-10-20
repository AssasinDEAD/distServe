const express = require('express');
const multer = require('multer');
const { minioClient, bucketName } = require('./minioClient');
const pool = require('./db');
const app = express();
const port = 3000;

const upload = multer({ storage: multer.memoryStorage() });

// Загрузка файла
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const fileName = file.originalname; // Используем оригинальное имя файла

    // Загружаем файл в MIN IO
    minioClient.putObject(bucketName, fileName, file.buffer, (err, etag) => {
      if (err) {
        return res.status(500).send('Ошибка при загрузке файла');
      }

      // Сохраняем местоположение файла в базе данных
      pool.query(
        'INSERT INTO files (file_name, path) VALUES ($1, $2)',
        [fileName, `/uploads/${fileName}`],
        (err, result) => {
          if (err) {
            return res.status(500).send('Ошибка при сохранении в базу данных');
          }
          res.send(`Файл успешно загружен: ${fileName}`);
        }
      );
    });
  } catch (error) {
    res.status(500).send('Ошибка при загрузке файла');
  }
});

// Скачивание файла
app.get('/download/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;

    // Проверяем наличие файла в базе данных
    pool.query('SELECT path FROM files WHERE file_name = $1', [fileName], (err, result) => {
      if (err || result.rows.length === 0) {
        return res.status(404).send('Файл не найден');
      }

      // Загружаем файл из MIN IO
      minioClient.getObject(bucketName, fileName, (err, dataStream) => {
        if (err) {
          return res.status(500).send('Ошибка при скачивании файла');
        }

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        dataStream.pipe(res);
      });
    });
  } catch (error) {
    res.status(500).send('Ошибка при скачивании файла');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
