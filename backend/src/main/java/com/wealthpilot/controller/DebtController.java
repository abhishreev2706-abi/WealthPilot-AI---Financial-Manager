package com.wealthpilot.controller;

import com.wealthpilot.dto.ApiResponse;
import com.wealthpilot.entity.Debt;
import com.wealthpilot.repository.DebtRepository;
import com.wealthpilot.repository.UserRepository;
import com.wealthpilot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debts")
@RequiredArgsConstructor
public class DebtController {

    private final DebtRepository debtRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Debt>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(debtRepository.findByUserId(userService.getCurrentUserId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Debt>> create(@RequestBody Debt debt) {
        debt.setUser(userRepository.findById(userService.getCurrentUserId()).orElseThrow());
        return ResponseEntity.ok(ApiResponse.ok("Debt added", debtRepository.save(debt)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Debt>> update(@PathVariable Long id, @RequestBody Debt updated) {
        Debt debt = debtRepository.findById(id).orElseThrow();
        debt.setOutstanding(updated.getOutstanding());
        debt.setStatus(updated.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Debt updated", debtRepository.save(debt)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        debtRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Debt deleted", null));
    }
}
