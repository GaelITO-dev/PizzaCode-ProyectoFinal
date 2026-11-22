package mx.pizzacode.security;

import tools.jackson.databind.ObjectMapper;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService,
                                                        PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(JwtAuthenticationFilter filtro) {
        FilterRegistrationBean<JwtAuthenticationFilter> registro = new FilterRegistrationBean<>(filtro);
        registro.setEnabled(false);
        return registro;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationFilter jwtFilter,
                                                   AuthenticationEntryPoint authenticationEntryPoint,
                                                   AccessDeniedHandler accessDeniedHandler) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/productos/**", "/api/categorias/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint(ObjectMapper objectMapper) {
        return (request, response, exception) -> escribirError(
                response, objectMapper, HttpServletResponse.SC_UNAUTHORIZED,
                "Se requiere un token JWT válido");
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler(ObjectMapper objectMapper) {
        return (request, response, exception) -> escribirError(
                response, objectMapper, HttpServletResponse.SC_FORBIDDEN,
                "No tienes permisos para acceder a este recurso");
    }

    private void escribirError(HttpServletResponse response,
                               ObjectMapper objectMapper,
                               int status,
                               String mensaje) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("status", status);
        cuerpo.put("message", mensaje);

        objectMapper.writeValue(response.getOutputStream(), cuerpo);
    }
}
