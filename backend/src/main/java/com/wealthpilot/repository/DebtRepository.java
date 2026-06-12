package com.wealthpilot.repository;

import com.wealthpilot.entity.Debt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface DebtRepository extends JpaRepository<Debt, Long> {
    List<Debt> findByUserIdAndStatus(Long userId, Debt.DebtStatus status);
    List<Debt> findByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(d.outstanding), 0) FROM Debt d WHERE d.user.id = :userId AND d.status = 'ACTIVE'")
    BigDecimal totalOutstanding(@Param("userId") Long userId);
}
