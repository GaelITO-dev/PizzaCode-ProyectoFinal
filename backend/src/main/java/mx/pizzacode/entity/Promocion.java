package mx.pizzacode.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.BatchSize;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "promociones")
@Getter
@Setter
@NoArgsConstructor
public class Promocion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_promocion")
    private Integer idPromocion;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descuento", nullable = false, precision = 5, scale = 2)
    private BigDecimal descuento;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @ManyToMany
    @JoinTable(name = "promocion_producto",
            joinColumns = @JoinColumn(name = "id_promocion"),
            inverseJoinColumns = @JoinColumn(name = "id_producto"))
    @BatchSize(size = 20)
    private Set<Producto> productos = new HashSet<>();
}
