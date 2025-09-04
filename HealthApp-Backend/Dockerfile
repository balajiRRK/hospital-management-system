# Build stage
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline
COPY src ./src
RUN ./mvnw -q -DskipTests package

# Run stage — uses layered Spring Boot jar for efficient rebuilds
# See Spring Boot "Efficient Container Images" for layers support.
# https://docs.spring.io/spring-boot/reference/packaging/container-images/efficient-images.html
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /workspace/target/*-SNAPSHOT.jar app.jar
EXPOSE 8080
USER 1000
ENTRYPOINT ["java","-jar","/app/app.jar"]