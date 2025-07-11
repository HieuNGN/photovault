package com.internship.photovault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

//import jakarta.annotation.PostConstruct;
@EnableJpaRepositories(basePackages = "com.internship.photovault.repository")
@SpringBootApplication
public class PhotovaultApplication {

    public static void main(String[] args) {
        SpringApplication.run(PhotovaultApplication.class, args);
    }

// test environment variables, done testing
//	@PostConstruct
//	public void checkEnvVars() {
//		System.out.println("DB_URL from environment: " + System.getenv("DB_URL"));
//		System.out.println("DB_USERNAME from environment: " + System.getenv("DB_USERNAME"));
//		System.out.println("DB_PASSWORD loaded: " + (System.getenv("DB_PASSWORD") != null ? "YES" : "NO"));
//	}
}