package com.rgs.reportcard;

import com.rgs.reportcard.model.ReportRow;
import com.rgs.reportcard.model.Role;
import com.rgs.reportcard.model.User;
import com.rgs.reportcard.repo.ReportRowRepository;
import com.rgs.reportcard.repo.UserRepository;
import com.rgs.reportcard.service.ExcelService;
import com.rgs.reportcard.service.PdfService;
import jakarta.validation.constraints.NotBlank;
import java.io.IOException;
import java.security.Principal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@SpringBootApplication
public class ReportCardApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReportCardApplication.class, args);
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(basic -> {})
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService(UserRepository users) {
        return username -> users.findByUsername(username)
                .map(u -> org.springframework.security.core.userdetails.User
                        .withUsername(u.getUsername())
                        .password(u.getPassword())
                        .roles(u.getRole().name())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean
    CommandLineRunner seed(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            if (users.findByUsername("admin").isEmpty()) {
                users.save(new User("admin", encoder.encode("admin123"), Role.ADMIN, "HOD", null, null));
            }
            if (users.findByUsername("teacher1").isEmpty()) {
                users.save(new User("teacher1", encoder.encode("teacher123"), Role.TEACHER, "Default Teacher", "FYBCS", "CS101"));
            }
        };
    }
}

record LoginReq(@NotBlank String username, @NotBlank String password) {}
record LoginRes(String message, String username, String role, String assignedClass, String subjectCode) {}
record CreateTeacherReq(String username, String password, String teacherName, String assignedClass, String subjectCode) {}

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    AuthController(UserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }
    @PostMapping("/login")
    LoginRes login(@RequestBody LoginReq req) {
        var user = users.findByUsername(req.username()).orElseThrow();
        if (!encoder.matches(req.password(), user.getPassword())) throw new RuntimeException("Invalid credentials");
        return new LoginRes("Use Basic Auth with these credentials in frontend", user.getUsername(), user.getRole().name(), user.getAssignedClass(), user.getSubjectCode());
    }
}

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
class AdminController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    AdminController(UserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }
    @PostMapping("/teachers")
    ResponseEntity<String> create(@RequestBody CreateTeacherReq req) {
        if (users.findByUsername(req.username()).isPresent()) return ResponseEntity.badRequest().body("Username exists");
        users.save(new User(req.username(), encoder.encode(req.password()), Role.TEACHER, req.teacherName(), req.assignedClass(), req.subjectCode()));
        return ResponseEntity.ok("Teacher created");
    }
}

@RestController
@RequestMapping("/api")
@CrossOrigin
class ReportController {
    private final UserRepository users;
    private final ReportRowRepository rows;
    private final ExcelService excelService;
    private final PdfService pdfService;
    ReportController(UserRepository users, ReportRowRepository rows, ExcelService excelService, PdfService pdfService) {
        this.users = users;
        this.rows = rows;
        this.excelService = excelService;
        this.pdfService = pdfService;
    }

    @PostMapping("/upload/excel")
    ResponseEntity<String> upload(@RequestParam("file") MultipartFile file, Principal principal) throws IOException {
        User teacher = users.findByUsername(principal.getName()).orElseThrow();
        List<ReportRow> parsed = excelService.parse(file, teacher.getAssignedClass(), teacher.getTeacherName());
        rows.saveAll(parsed);
        return ResponseEntity.ok("Uploaded rows: " + parsed.size());
    }

    @GetMapping("/reports/{className}")
    Map<String, Object> report(
            @PathVariable String className,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String caste,
            @RequestParam(defaultValue = "desc") String sort
    ) {
        List<ReportRow> filtered = rows.findByClassName(className).stream()
                .filter(r -> grade == null || grade.isBlank() || r.gradeCategory().equalsIgnoreCase(grade))
                .filter(r -> gender == null || gender.isBlank() || r.getGender().equalsIgnoreCase(gender))
                .filter(r -> caste == null || caste.isBlank() || r.getCaste().equalsIgnoreCase(caste))
                .sorted("asc".equalsIgnoreCase(sort) ? Comparator.comparing(ReportRow::getMarks) : Comparator.comparing(ReportRow::getMarks).reversed())
                .toList();

        Map<String, Long> summary = filtered.stream().collect(Collectors.groupingBy(ReportRow::gradeCategory, Collectors.counting()));
        List<ReportRow> top = filtered.stream().limit(5).toList();

        Map<String, Object> res = new HashMap<>();
        res.put("summary", summary);
        res.put("topPerformers", top);
        res.put("rows", filtered);
        return res;
    }

    @GetMapping("/reports/{className}/pdf")
    ResponseEntity<byte[]> pdf(@PathVariable String className) {
        byte[] bytes = pdfService.generate(className, rows.findByClassName(className));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report-" + className + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(bytes);
    }
}
