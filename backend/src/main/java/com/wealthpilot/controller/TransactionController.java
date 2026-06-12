package com.wealthpilot.controller;

import com.wealthpilot.dto.ApiResponse;
import com.wealthpilot.dto.TransactionDTO;
import com.wealthpilot.service.TransactionService;
import com.wealthpilot.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionDTO>>> getAll() {
        Long userId = userService.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getAll(userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionDTO>> create(@Valid @RequestBody TransactionDTO dto) {
        Long userId = userService.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok("Transaction created", transactionService.create(userId, dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDTO>> update(@PathVariable Long id, @Valid @RequestBody TransactionDTO dto) {
        Long userId = userService.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok("Transaction updated", transactionService.update(userId, id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Long userId = userService.getCurrentUserId();
        transactionService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Transaction deleted", null));
    }
}
