package com.wealthpilot.repository;

import com.wealthpilot.entity.Insurance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface InsuranceRepository extends JpaRepository<Insurance, Long> {
    List<Insurance> findByUserId(Long userId);
    List<Insurance> findByUserIdAndRenewalDateBefore(Long userId, LocalDate date);
}
