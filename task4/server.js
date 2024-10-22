const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { minioClient, bucketName } = require('./minioClient');
const pool = require('./db');
const app = express();
const port = 3001;

// Настройка Multer для хранения файла в памяти
const upload = multer({ storage: multer.memoryStorage() });

// Функция для генерации зашифрованного имени файла
const encryptFileName = (fileName) => {
  return crypto.createHash('sha256').update(fileName + Date.now()).digest('hex');
};

// Маршрут для загрузки файла
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const originalFileName = file.originalname;  
    const fileFormat = originalFileName.split('.').pop(); 
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const encryptedFileName = encryptFileName(originalFileName);

    minioClient.putObject(bucketName, encryptedFileName, file.buffer, (err, etag) => {
      if (err) {
        return res.status(500).send('Ошибка при загрузке файла в MinIO');
      }

      pool.query(
        'INSERT INTO files (file_name, file_format, file_size, encrypted_file_name, path) VALUES ($1, $2, $3, $4, $5)',
        [originalFileName, fileFormat, fileSizeInMB, encryptedFileName, `/uploads/${encryptedFileName}`],
        (err, result) => {
          if (err) {
            return res.status(500).send('Ошибка при сохранении в базу данных');
          }
          res.send(`Файл успешно загружен: ${originalFileName}`);
        }
      );
    });
  } catch (error) {
    res.status(500).send('Ошибка при загрузке файла');
  }
});

app.get('/download/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;

    pool.query('SELECT encrypted_file_name FROM files WHERE file_name = $1', [fileName], (err, result) => {
      if (err || result.rows.length === 0) {
        return res.status(404).send('Файл не найден');
      }

      const encryptedFileName = result.rows[0].encrypted_file_name;

      minioClient.getObject(bucketName, encryptedFileName, (err, dataStream) => {
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
