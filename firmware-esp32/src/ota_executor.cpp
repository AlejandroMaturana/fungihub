#include "ota_executor.h"
#include "config.h"
#include <HTTPClient.h>

OTAExecutor::OTAExecutor() {}

bool OTAExecutor::begin(const String& url) {
  if (url.length() == 0) return false;

  Serial.printf("[OTA] Descargando firmware: %s\n", url.c_str());

  HTTPClient http;
  http.begin(url);
  http.setTimeout(30000);
  http.setFollowRedirects(HTTPC_FORCE_FOLLOW_REDIRECTS);

  int code = http.GET();
  if (code != 200) {
    Serial.printf("[OTA] Error HTTP %d\n", code);
    http.end();
    return false;
  }

  int totalLen = http.getSize();
  if (totalLen <= 0) {
    Serial.println("[OTA] Tamaño de firmware inválido");
    http.end();
    return false;
  }

  if (!Update.begin(totalLen, U_FLASH)) {
    Serial.printf("[OTA] Update.begin falló: %s\n", Update.errorString());
    http.end();
    return false;
  }

  WiFiClient* stream = http.getStreamPtr();
  size_t written = 0;
  uint8_t buffer[256];

  while (http.connected() && written < totalLen) {
    size_t available = stream->available();
    if (available) {
      size_t toRead = min(available, sizeof(buffer));
      size_t read = stream->readBytes(buffer, toRead);
      size_t flushed = Update.write(buffer, read);
      if (flushed != read) {
        Serial.printf("[OTA] Error escribiendo: %s\n", Update.errorString());
        http.end();
        return false;
      }
      written += flushed;
    }
    delay(1);
  }

  http.end();

  if (written != totalLen) {
    Serial.printf("[OTA] Escritos %u de %d bytes\n", written, totalLen);
    Update.abort();
    return false;
  }

  if (!Update.end()) {
    Serial.printf("[OTA] Update.end falló: %s\n", Update.errorString());
    return false;
  }

  Serial.println("[OTA] Actualización OK — reiniciando...");
  return true;
}

void OTAExecutor::setCaCert(const char* cert) {
  (void)cert;
}
