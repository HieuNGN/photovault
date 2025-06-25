package com.internship.photovault.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice // This annotation makes it a global exception handler
public class RestExceptionHandler {

    @ExceptionHandler(IllegalStateException.class) // This method handles IllegalStateException
    public ResponseEntity<Object> handleIllegalStateException(IllegalStateException ex, WebRequest request) {

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Conflict");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        // Return a 409 Conflict status code
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    // We can add more @ExceptionHandler methods here for other exceptions later
}