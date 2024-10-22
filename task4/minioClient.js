const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'admin', 
  secretKey: 'Serik2004', 
});

const bucketName = 'my-bucket';

minioClient.bucketExists(bucketName, (err, exists) => {
  if (err) {
    return console.log(err);
  }
  if (!exists) {
    minioClient.makeBucket(bucketName, 'us-east-1', function (err) {
      if (err) return console.log('Ошибка при создании бакета.', err);
      console.log('Бакет успешно создан.');
    });
  }
});

module.exports = { minioClient, bucketName };
