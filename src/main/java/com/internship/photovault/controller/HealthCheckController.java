package com.internship.photovault.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
public class HealthCheckController {
    @GetMapping
        public String checkHealth() {
            return "Houston, we are live! API is working";
        }
   @GetMapping("/api/v1/info")
   public String getInfo() {
       return "This is the API for the Photovault application";
   } 
}


