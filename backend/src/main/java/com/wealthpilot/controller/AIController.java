package com.wealthpilot.controller;

import com.wealthpilot.dto.ApiResponse;
import com.wealthpilot.service.AIService;
import com.wealthpilot.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;
    private final UserService userService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, Object>>> chat(@RequestBody ChatRequest request) {
        Long userId = userService.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(aiService.chat(userId, request.getQuestion())));
    }

    @GetMapping("/forecast")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forecast() {
        return ResponseEntity.ok(ApiResponse.ok(aiService.getForecast(userService.getCurrentUserId())));
    }

    @GetMapping("/analyze")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyze() {
        return ResponseEntity.ok(ApiResponse.ok(aiService.analyzeSpending(userService.getCurrentUserId())));
    }

    @Data
    public static class ChatRequest {
        private String question;
    }
}
