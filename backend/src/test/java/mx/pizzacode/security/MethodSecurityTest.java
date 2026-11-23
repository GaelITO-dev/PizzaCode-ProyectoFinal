package mx.pizzacode.security;

import mx.pizzacode.controller.RolesController;
import mx.pizzacode.service.TokenInvalidadoService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas de la tarea #29: configuración de roles y @EnableMethodSecurity.
 * Se carga la configuración real de seguridad, no una de prueba.
 */
@WebMvcTest(controllers = RolesController.class)
@Import({SecurityConfig.class, MethodSecurityTest.FiltroConfig.class,
        MethodSecurityTest.ServicioConfig.class})
class MethodSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RoleHierarchy roleHierarchy;

    @Autowired
    private ServicioProtegido servicioProtegido;

    // La cadena de filtros real necesita estos beans; se simulan para no usar BD.
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @TestConfiguration
    static class FiltroConfig {
        @Bean
        JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService,
                                                       UserDetailsService userDetailsService) {
            // La lista negra se simula: un mock regresa false en estaInvalidado(...)
            return new JwtAuthenticationFilter(jwtService, userDetailsService,
                    mock(TokenInvalidadoService.class));
        }
    }

    /** Bean anotado para probar la seguridad por método fuera del controlador. */
    @TestConfiguration
    static class ServicioConfig {
        @Bean
        ServicioProtegido servicioProtegido() {
            return new ServicioProtegido();
        }
    }

    public static class ServicioProtegido {
        @PreAuthorize("hasRole('ADMIN')")
        public String soloAdmin() {
            return "acceso-admin";
        }
    }

    @Test
    void laJerarquiaHaceQueAdminHeredeCajeroYCliente() {
        var autoridades = roleHierarchy.getReachableGrantedAuthorities(
                List.<GrantedAuthority>of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        assertThat(autoridades)
                .extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_ADMIN", "ROLE_CAJERO", "ROLE_CLIENTE");
    }

    @Test
    void laJerarquiaHaceQueCajeroHeredeCliente() {
        var autoridades = roleHierarchy.getReachableGrantedAuthorities(
                List.<GrantedAuthority>of(new SimpleGrantedAuthority("ROLE_CAJERO")));

        assertThat(autoridades)
                .extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_CAJERO", "ROLE_CLIENTE");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminAccedeATodosLosEndpoints() throws Exception {
        mockMvc.perform(get("/api/roles/admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("ADMIN"));

        mockMvc.perform(get("/api/roles/cajero"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("CAJERO"));

        mockMvc.perform(get("/api/roles/cliente"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("CLIENTE"));
    }

    @Test
    @WithMockUser(roles = "CAJERO")
    void cajeroAccedeACajeroYClientePeroNoAdmin() throws Exception {
        mockMvc.perform(get("/api/roles/cajero"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/roles/cliente"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/roles/admin"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void clienteSoloAccedeACliente() throws Exception {
        mockMvc.perform(get("/api/roles/cliente"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/roles/cajero"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/roles/admin"))
                .andExpect(status().isForbidden());
    }

    @Test
    void sinAutenticacionDevuelve401() throws Exception {
        mockMvc.perform(get("/api/roles/admin"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void enableMethodSecurityAplicaElPreAuthorizeEnUnServicio() {
        assertThat(servicioProtegido.soloAdmin()).isEqualTo("acceso-admin");
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void enableMethodSecurityBloqueaElPreAuthorizeEnUnServicio() {
        assertThatThrownBy(() -> servicioProtegido.soloAdmin())
                .isInstanceOf(AccessDeniedException.class);
    }
}