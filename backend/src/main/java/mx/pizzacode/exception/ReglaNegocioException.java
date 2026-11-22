package mx.pizzacode.exception;

//Esta excepción se ocupa cuando una peticion es valida, sin embargo viola una regla de negocio 
public class ReglaNegocioException extends RuntimeException {

    public ReglaNegocioException(String message) {
        super(message);
    }
}