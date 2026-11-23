package mx.pizzacode.entity;

// No se guarda en la BD: se calcula comparando las fechas de la promoción con hoy
public enum EstadoPromocion {
    VIGENTE,
    PROGRAMADA,
    TERMINADA
}
