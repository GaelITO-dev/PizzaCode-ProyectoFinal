package mx.pizzacode.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    private final String numeroOrigen;
    private final boolean configurado;

    // El ":" pone un valor vacío si la propiedad no existe, así la app arranca aunque no haya Twilio
    public SmsService(@Value("${twilio.account-sid:}") String accountSid,
                      @Value("${twilio.auth-token:}") String authToken,
                      @Value("${twilio.sms-from:}") String numeroOrigen) {
        this.numeroOrigen = numeroOrigen;
        this.configurado = !accountSid.isBlank() && !authToken.isBlank() && !numeroOrigen.isBlank();
        if (configurado) {
            Twilio.init(accountSid, authToken);
        }
    }

    public void enviar(String telefono, String texto) {
        if (!configurado || telefono == null || telefono.isBlank()) {
            log.warn("SMS no enviado: Twilio sin configurar o pedido sin teléfono");
            return;
        }
        // En la BD guardamos 10 dígitos; Twilio pide formato internacional
        String destino = telefono.length() == 10 ? "+52" + telefono : telefono;
        try {
            Message.creator(new PhoneNumber(destino), new PhoneNumber(numeroOrigen), texto).create();
            log.info("SMS enviado a {}", destino);
        } catch (Exception e) {
            // Si Twilio falla, el pedido igual cambia de estado; solo queda en el log
            log.error("No se pudo enviar el SMS a {}: {}", destino, e.getMessage());
        }
    }
}