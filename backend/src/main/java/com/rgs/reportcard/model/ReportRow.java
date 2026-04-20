package com.rgs.reportcard.model;

import jakarta.persistence.*;

@Entity
public class ReportRow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String studentName;
    private String gender;
    private String caste;
    private String className;
    private String subjectCode;
    private String teacherName;
    private Double marks;

    public Long getId() { return id; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getCaste() { return caste; }
    public void setCaste(String caste) { this.caste = caste; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
    public Double getMarks() { return marks; }
    public void setMarks(Double marks) { this.marks = marks; }

    public String gradeCategory() {
        if (marks == null) return "Fail";
        if (marks >= 75) return "Distinction";
        if (marks >= 60) return "First Class";
        if (marks >= 50) return "Second Class";
        if (marks >= 40) return "Pass";
        return "Fail";
    }
}
