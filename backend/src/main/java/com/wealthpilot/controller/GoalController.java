package com.wealthpilot.controller;

import com.wealthpilot.dto.ApiResponse;
import com.wealthpilot.entity.Goal;
import com.wealthpilot.service.GoalService;
import com.wealthpilot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Goal>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(goalService.getAll(userService.getCurrentUserId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Goal>> create(@RequestBody Goal goal) {
        return ResponseEntity.ok(ApiResponse.ok("Goal created", goalService.create(userService.getCurrentUserId(), goal)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Goal>> update(@PathVariable Long id, @RequestBody Goal goal) {
        return ResponseEntity.ok(ApiResponse.ok("Goal updated", goalService.update(userService.getCurrentUserId(), id, goal)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        goalService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Goal deleted", null));
    }
}
