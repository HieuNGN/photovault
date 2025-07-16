package com.internship.photovault.controller;

import com.internship.photovault.entity.User;
import com.internship.photovault.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password) {
        try {
            User user = userService.createUser(username, email, password);
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully",
                    "user", Map.of(
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "email", user.getEmail(),
                            "role", user.getRole()
                    )
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

/*    @GetMapping("/login")
    public ResponseEntity<Map<String, Object>> showLoginForm() {

        return ResponseEntity.ok(Map.of("message", "Please provide username and password to login."));
    }*/

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(
            @RequestParam("username") String username,
            @RequestParam("password") String password) {
        try {
            User user = userService.findByUsername(username);

            if (userService.validatePassword(password, user.getPasswordHash())) {
                return ResponseEntity.ok(Map.of(
                        "message", "Login successful",
                        "user", Map.of(
                                "id", user.getId(),
                                "username", user.getUsername(),
                                "email", user.getEmail(),
                                "role", user.getRole()
                        )
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile() {
        try {
            User currentUser = userService.getCurrentUser();
            return ResponseEntity.ok(currentUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllActiveUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable("id") Long id,
            @RequestParam("email") String email) {
        try {
            User updatedUser = userService.updateUser(id, email);
            return ResponseEntity.ok(Map.of(
                    "message", "User updated successfully",
                    "user", updatedUser
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Update failed: " + e.getMessage()));
        }
    }

    @PostMapping("/init-admin")
    public ResponseEntity<Map<String, Object>> initializeAdminUser() {
        try {
            User admin = userService.createDefaultAdminUser();
            return ResponseEntity.ok(Map.of(
                    "message", "Admin user initialized",
                    "admin", Map.of(
                            "id", admin.getId(),
                            "username", admin.getUsername(),
                            "email", admin.getEmail()
                    )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to initialize admin user: " + e.getMessage()));
        }
    }
}
