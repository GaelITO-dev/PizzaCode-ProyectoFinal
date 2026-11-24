package mx.pizzacode.service;

import java.io.UnsupportedEncodingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class CorreoService {

    private static final Logger log = LoggerFactory.getLogger(CorreoService.class);

    // Spring solo crea el JavaMailSender si existe spring.mail.host; en desarrollo queda en null
    private final JavaMailSender mailSender;
    private final String remitenteCorreo;
    private final String remitenteNombre;
    private final String urlFrontend;

    public CorreoService(ObjectProvider<JavaMailSender> mailSender,
                         @Value("${app.correo.remitente:no-responder@pizzacode.tech}") String remitenteCorreo,
                         @Value("${app.correo.nombre:Pizza Code}") String remitenteNombre,
                         @Value("${app.url-frontend:http://localhost:5173}") String urlFrontend) {
        this.mailSender = mailSender.getIfAvailable();
        this.remitenteCorreo = remitenteCorreo;
        this.remitenteNombre = remitenteNombre;
        this.urlFrontend = urlFrontend;
        if (this.mailSender == null) {
            log.warn("Correo sin configurar (falta spring.mail.host): los correos solo se escribirán en el log");
        }
    }

    public boolean estaConfigurado() {
        return mailSender != null;
    }

    // Para armar enlaces que apunten al frontend (ej. el de recuperación en #43)
    public String getUrlFrontend() {
        return urlFrontend;
    }

    // Devuelve true si el servidor de correo lo aceptó.
    // Nunca lanza excepción: un correo que falla no debe tumbar la operación que lo pidió.
    public boolean enviar(String para, String asunto, String texto, String html) {
        if (mailSender == null) {
            log.info("Correo NO enviado (modo desarrollo). Para: {} | Asunto: {}\n{}", para, asunto, texto);
            return false;
        }
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            // multipart = true: se manda versión de texto y versión HTML; el cliente de correo elige
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(remitenteCorreo, remitenteNombre);
            helper.setTo(para);
            helper.setSubject(asunto);
            helper.setText(texto, html);
            mailSender.send(mensaje);
            log.info("Correo enviado a {} ({})", para, asunto);
            return true;
        } catch (MessagingException | MailException | UnsupportedEncodingException e) {
            log.error("No se pudo enviar el correo a {}: {}", para, e.getMessage());
            return false;
        }
    }

    public boolean enviarPrueba(String para) {
        String texto = "Si recibiste este correo, el envío desde Pizza Code funciona.";
        String html = plantilla("Correo de prueba", "<p>" + texto + "</p>");
        return enviar(para, "Prueba de correo de Pizza Code", texto, html);
    }

    public boolean enviarRecuperacion(String para, String nombre, String enlace, int minutosValidez) {
        String asunto = "Recupera tu contraseña de Pizza Code";
        String texto = """
                Hola %s:

                Recibimos una solicitud para cambiar la contraseña de tu cuenta de Pizza Code.
                Abre este enlace para elegir una nueva (vence en %d minutos):

                %s

                Si tú no lo pediste, ignora este correo: tu contraseña no cambia.
                """.formatted(nombre, minutosValidez, enlace);
        String html = plantilla("Recupera tu contraseña", """
                <p>Hola %s:</p>
                <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta de Pizza Code.</p>
                %s
                <p style="font-size:13px;color:#6b6358">El enlace vence en %d minutos. Si tú no lo pediste, ignora este correo: tu contraseña no cambia.</p>
                """.formatted(HtmlUtils.htmlEscape(nombre), boton("Elegir nueva contraseña", enlace), minutosValidez));
        return enviar(para, asunto, texto, html);
    }

    private String boton(String texto, String enlace) {
        return """
                <p style="margin:24px 0"><a href="%s" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#7cb83e;color:#ffffff;font-weight:700;text-decoration:none">%s</a></p>
                """.formatted(HtmlUtils.htmlEscape(enlace), texto);
    }

    // Marco común de los correos. Estilos en línea porque Gmail ignora <style> y el CSS externo.
    private String plantilla(String titulo, String contenido) {
        return """
                <!DOCTYPE html>
                <html lang="es">
                <body style="margin:0;padding:24px;background:#fdf8ef;font-family:Arial,Helvetica,sans-serif;color:#1f1b14">
                  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eee4d3">
                    <div style="background:#f9a83b;padding:20px 24px;font-size:20px;font-weight:800">Pizza Code</div>
                    <div style="padding:24px;font-size:15px;line-height:1.5">
                      <h1 style="margin:0 0 16px;font-size:20px">%s</h1>
                      %s
                    </div>
                  </div>
                  <p style="text-align:center;font-size:12px;color:#8a8170;margin-top:16px">Este correo se envía automáticamente; no lo respondas.</p>
                </body>
                </html>
                """.formatted(HtmlUtils.htmlEscape(titulo), contenido);
    }
}
