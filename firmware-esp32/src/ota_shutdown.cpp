#include "ota_shutdown.h"
#include "config.h"

OTAShutdown::OTAShutdown() {}

bool OTAShutdown::begin() {
  Serial.println("[OTA] Safe shutdown: apagando actuadores...");
  return true;
}

void OTAShutdown::abortRollback() {
  Serial.println("[OTA] Abortando rollback...");
}
