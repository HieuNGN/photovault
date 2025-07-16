package com.internship.photovault.initilization;


import com.internship.photovault.entity.User;
import com.internship.photovault.repository.UserRepository;
import com.internship.photovault.service.UserService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("!production") // run in non prod only
public class AdminUserInitializer implements ApplicationRunner {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AdminUserInitializer(UserService userService, PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        createAdminUserIfNotExists();
    }
    public void createAdminUserIfNotExists() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@photovault.com");
            admin.setPasswordHash(passwordEncoder.encode("hm102499"));
            admin.setRole(User.Role.ADMIN);
            admin.setIsActive(true);

            userRepository.save(admin);
            System.out.println("Admin user created! Remember your credentials");
        }
    }

}
