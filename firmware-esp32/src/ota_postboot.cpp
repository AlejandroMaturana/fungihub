#include "ota_postboot.h"
#include "config.h"
#include "ota_nvs.h"
#include "state_machine.h"

extern StateMachine sm;

OTAConfirmation::OTAConfirmation() {}

bool OTAConfirmation::selfTest() {
  Serial.println("[OTA] Self-test post-boot...");
  return true;
}

void OTAConfirmation::confirm() {
  Serial.println("[OTA] Firmware confirmado — marcando como OK");
  nvsSetFwVer("0.9.0");
}

void OTAConfirmation::rollback() {
  Serial.println("[OTA] Rollback solicitado");
}
