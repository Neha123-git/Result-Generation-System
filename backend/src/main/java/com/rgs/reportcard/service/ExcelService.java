package com.rgs.reportcard.service;

import com.rgs.reportcard.model.ReportRow;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ExcelService {
    public List<ReportRow> parse(MultipartFile file, String className, String teacherName) throws IOException {
        List<ReportRow> result = new ArrayList<>();
        try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                ReportRow rr = new ReportRow();
                rr.setStudentName(text(row, 0));
                rr.setGender(text(row, 1));
                rr.setCaste(text(row, 2));
                rr.setMarks(number(row, 3));
                rr.setSubjectCode(text(row, 4));
                rr.setClassName(className);
                rr.setTeacherName(teacherName);
                result.add(rr);
            }
        }
        return result;
    }

    private String text(Row row, int idx) {
        if (row.getCell(idx) == null) return "";
        return row.getCell(idx).getCellType() == CellType.NUMERIC
                ? String.valueOf((long) row.getCell(idx).getNumericCellValue())
                : row.getCell(idx).toString().trim();
    }

    private double number(Row row, int idx) {
        if (row.getCell(idx) == null) return 0;
        try {
            return row.getCell(idx).getNumericCellValue();
        } catch (Exception e) {
            try { return Double.parseDouble(row.getCell(idx).toString()); }
            catch (Exception ignored) { return 0; }
        }
    }
}
