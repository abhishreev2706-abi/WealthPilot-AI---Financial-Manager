package com.wealthpilot.controller;

import com.wealthpilot.dto.ApiResponse;
import com.wealthpilot.entity.Budget;
import com.wealthpilot.repository.BudgetRepository;
import com.wealthpilot.repository.UserRepository;
import com.wealthpilot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Budget>>> getCurrent() {
        LocalDate now = LocalDate.now();
        Long userId = userService.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(
                budgetRepository.findByUserIdAndMonthAndYear(userId, now.getMonthValue(), now.getYear())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Budget>> create(@RequestBody Budget budget) {
        budget.setUser(userRepository.findById(userService.getCurrentUserId()).orElseThrow());
        return ResponseEntity.ok(ApiResponse.ok("Budget set", budgetRepository.save(budget)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Budget>> update(@PathVariable Long id, @RequestBody Budget updated) {
        Budget budget = budgetRepository.findById(id).orElseThrow();
        budget.setMonthlyLimit(updated.getMonthlyLimit());
        return ResponseEntity.ok(ApiResponse.ok("Budget updated", budgetRepository.save(budget)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        budgetRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Budget deleted", null));
    }
}
