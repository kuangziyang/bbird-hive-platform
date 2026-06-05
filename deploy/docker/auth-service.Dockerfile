FROM eclipse-temurin:21-jre
WORKDIR /app
COPY backend/services/auth-service/target/auth-service-*.jar /app/auth-service.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/auth-service.jar"]
