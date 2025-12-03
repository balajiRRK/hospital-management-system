package com.osu.HealthApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HealthAppBackendApplication {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(HealthAppBackendApplication.class, args);
	}

	private static void loadEnv() {
		try {
			java.nio.file.Path envPath = java.nio.file.Paths.get(".env");
			if (!java.nio.file.Files.exists(envPath)) {
				// Try parent directory if not found in current (e.g. running from backend
				// subdir)
				envPath = java.nio.file.Paths.get("..", ".env");
			}

			if (java.nio.file.Files.exists(envPath)) {
				java.util.List<String> lines = java.nio.file.Files.readAllLines(envPath);
				for (String line : lines) {
					line = line.trim();
					if (!line.isEmpty() && !line.startsWith("#")) {
						String[] parts = line.split("=", 2);
						if (parts.length == 2) {
							String key = parts[0].trim();
							String value = parts[1].trim();
							// Only set if not already set (system props take precedence)
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, value);
							}
						}
					}
				}
				System.out.println("Loaded environment variables from " + envPath.toAbsolutePath());
			} else {
				System.out.println("No .env file found. Skipping environment variable loading.");
			}
		} catch (java.io.IOException e) {
			System.err.println("Failed to load .env file: " + e.getMessage());
		}
	}
}
