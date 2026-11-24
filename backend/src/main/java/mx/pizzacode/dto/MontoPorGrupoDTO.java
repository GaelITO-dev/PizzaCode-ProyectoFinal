package mx.pizzacode.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Ventas de un grupo: un origen (SUCURSAL, EN_LINEA) o un método de pago (EFECTIVO, TARJETA)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MontoPorGrupoDTO {

    private String clave;
    private long pedidos;
    private BigDecimal total;
}
