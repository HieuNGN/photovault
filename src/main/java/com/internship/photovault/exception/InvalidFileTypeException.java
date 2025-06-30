package com.internship.photovault.exception;


import java.io.Serial;

public class InvalidFileTypeException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = 1L;

    public InvalidFileTypeException(String message) {
        super(message);
    }
}
