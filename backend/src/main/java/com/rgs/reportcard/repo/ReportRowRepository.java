package com.rgs.reportcard.repo;

import com.rgs.reportcard.model.ReportRow;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRowRepository extends JpaRepository<ReportRow, Long> {
    List<ReportRow> findByClassName(String className);
}
