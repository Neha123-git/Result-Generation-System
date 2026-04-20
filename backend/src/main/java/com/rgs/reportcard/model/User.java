package com.rgs.reportcard.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(nullable = false)
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;
    private String teacherName;
    private String assignedClass;
    private String subjectCode;

    public User() {}
    public User(String username, String password, Role role, String teacherName, String assignedClass, String subjectCode) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.teacherName = teacherName;
        this.assignedClass = assignedClass;
        this.subjectCode = subjectCode;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public Role getRole() { return role; }
    public String getTeacherName() { return teacherName; }
    public String getAssignedClass() { return assignedClass; }
    public String getSubjectCode() { return subjectCode; }
}
