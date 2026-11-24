package mx.pizzacode.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Un punto de la gráfica: un día ("2026-11-09") o una hora ("14")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PuntoVentasDTO {

    private String clave;
    private long pedidos;
    private BigDecimal total;
}
