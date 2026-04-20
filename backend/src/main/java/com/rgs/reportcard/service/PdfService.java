package com.rgs.reportcard.service;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.rgs.reportcard.model.ReportRow;
import java.io.ByteArrayOutputStream;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PdfService {
    public byte[] generate(String className, List<ReportRow> rows) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document();
        PdfWriter.getInstance(doc, out);
        doc.open();
        doc.add(new Paragraph("Class Report: " + className));
        doc.add(new Paragraph(" "));
        for (ReportRow row : rows) {
            doc.add(new Paragraph(row.getStudentName() + " | " + row.getSubjectCode() + " | " + row.getTeacherName()
                    + " | " + row.getMarks() + " | " + row.gradeCategory()));
        }
        doc.close();
        return out.toByteArray();
    }
}
