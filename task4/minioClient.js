const Minio = require('minio');

// Конфигурация клиента MinIO
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin', // Замените на ваши данные доступа
  secretKey: 'minioadmin', // Замените на ваши данные доступа
});

// Название бакета
const bucketName = 'my-bucket';

// Проверка, существует ли бакет
minioClient.bucketExists(bucketName, (err, exists) => {
  if (err) {
    return console.log(err);
  }
  if (!exists) {
    // Создание бакета, если он не существует
    minioClient.makeBucket(bucketName, 'us-east-1', function (err) {
      if (err) return console.log('Ошибка при создании бакета.', err);
      console.log('Бакет успешно создан.');
    });
  }
});

module.exports = { minioClient, bucketName };
