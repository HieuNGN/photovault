package com.internship.photovault.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class HealthCheckController {

    @GetMapping // This creates GET /health
    public String checkHealth() {
        return "Houston, we are live! API is working";
    }

    @GetMapping("/info")  // Remove the duplicate /api/v1 prefix
    public String getInfo() {
        return "This is the API for the Photovault application";
    }
}


