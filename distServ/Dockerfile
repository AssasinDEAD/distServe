# Используем образ с OpenJDK 21 JRE
FROM eclipse-temurin:21.0.3_9-jre-jammy

# Копируем скомпилированный JAR файл в контейнер
COPY target/*.jar app.jar

# Команда для запуска приложения
ENTRYPOINT ["java", "-jar", "/app.jar"]
