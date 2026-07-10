#include "ota_shutdown.h"
#include "config.h"
#include "ssr_controller.h"

extern SSRController ssr;

OTAShutdown::OTAShutdown() {}

bool OTAShutdown::begin() {
  Serial.println("[OTA] Safe shutdown: apagando actuadores...");
  ssr.setAll(0);
  return true;
}

void OTAShutdown::abortRollback() {
  Serial.println("[OTA] Abortando rollback...");
}
