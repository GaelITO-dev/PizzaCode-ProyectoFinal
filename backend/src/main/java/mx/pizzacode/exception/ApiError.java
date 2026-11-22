package mx.pizzacode.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class ApiError {

    private final int status;

    private final String message;

    private final Map<String, String> errors;
}
