# ==========================================
# Stage 1: Build stage with Maven & JDK 21
# ==========================================
FROM maven:3.9.8-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy context source files
COPY . /tmp/source/

# Auto-detect whether build context is backend/ or the repository root
RUN if [ -f /tmp/source/pom.xml ]; then \
    echo "Detected build context: backend directory"; \
    cp -a /tmp/source/. /app/; \
    elif [ -f /tmp/source/backend/pom.xml ]; then \
    echo "Detected build context: repository root"; \
    cp -a /tmp/source/backend/. /app/; \
    else \
    echo "Error: pom.xml not found in build context!" && exit 1; \
    fi

# Package the Spring Boot application (skipping tests for faster cloud build)
RUN mvn clean package -DskipTests && \
    cp target/*.jar app.jar

# ==========================================
# Stage 2: Minimal runtime environment (JRE 21)
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built jar from build stage
COPY --from=build --chown=appuser:appgroup /app/app.jar app.jar

# Switch to non-root user
USER appuser

# Expose default port
EXPOSE 8080

# Run Spring Boot app with container memory awareness and dynamic port support (Render PORT env)
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT:-8080} -jar app.jar"]