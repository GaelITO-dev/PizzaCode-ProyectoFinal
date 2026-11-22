package mx.pizzacode.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PromocionResponseDTO {
    private Integer idPromocion;
    private String nombre;
    private BigDecimal descuento;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private boolean vigente;
    private List<Integer> idsProductos;
    private List<String> nombresProductos;
}