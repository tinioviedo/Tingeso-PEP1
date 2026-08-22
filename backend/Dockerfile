# El JAR ya viene compilado por el job "build" del pipeline (mvn package
# corre en GitHub Actions, no adentro de Docker) — este Dockerfile solo
# empaqueta el .jar ya construido en una imagen liviana con el JRE.
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/travelagency-backend.jar app.jar
EXPOSE 1427
ENTRYPOINT ["java", "-jar", "app.jar"]
