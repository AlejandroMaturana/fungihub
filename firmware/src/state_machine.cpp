#include "state_machine.h"
#include <ESP8266WiFi.h>
#include <EEPROM.h>

#define EEPROM_REBOOT_ADDR 0
#define WATCHDOG_HW_TIMEOUT 8000
#define WATCHDOG_SW_TIMEOUT 30000
#define MAX_REBOOTS_BEFORE_SAFE 5

StateMachine::StateMachine()
  : state(ST_BOOT), lastWatchdogFeed(0), rebootCount(0), stateEntered(0) {
  errorReason[0] = '\0';
}

void StateMachine::init() {
  EEPROM.begin(64);
  loadRebootCount();
  setState(ST_INIT);

  ESP.wdtDisable();
  ESP.wdtEnable(WATCHDOG_HW_TIMEOUT);
}

void StateMachine::setState(DeviceState newState) {
  if (newState == state) return;
  DeviceState oldState = state;
  state = newState;
  stateEntered = millis();
  Serial.printf("[STATE] %s → %s\n", getStateName(oldState), getStateName());
}

DeviceState StateMachine::getState() {
  return state;
}

const char* StateMachine::getStateName(DeviceState s) {
  switch (s) {
    case ST_BOOT: return "BOOT";
    case ST_INIT: return "INIT";
    case ST_WIFI: return "WIFI";
    case ST_NORMAL: return "NORMAL";
    case ST_DEGRADED: return "DEGRADED";
    case ST_ERROR: return "ERROR";
    case ST_RECOVERY: return "RECOVERY";
    case ST_SAFE: return "SAFE";
    default: return "UNKNOWN";
  }
}

const char* StateMachine::getStateName() {
  return getStateName(state);
}

void StateMachine::setError(const char* reason) {
  snprintf(errorReason, sizeof(errorReason), "%s", reason);
  setState(ST_ERROR);
}

const char* StateMachine::getError() {
  return errorReason;
}

void StateMachine::feedWatchdog() {
  lastWatchdogFeed = millis();
  ESP.wdtFeed();
}

void StateMachine::handleWatchdog() {
  unsigned long now = millis();
  if (now - lastWatchdogFeed > WATCHDOG_SW_TIMEOUT) {
    Serial.println("[WDT] Software watchdog timeout — reiniciando");
    saveRebootCount();
    ESP.restart();
  }
}

void StateMachine::loadRebootCount() {
  rebootCount = EEPROM.read(EEPROM_REBOOT_ADDR);
  if (rebootCount > 50) rebootCount = 0;

  uint8_t newCount = rebootCount + 1;
  EEPROM.write(EEPROM_REBOOT_ADDR, newCount);
  EEPROM.commit();

  Serial.printf("[STATE] Boot #%d\n", newCount);
}

void StateMachine::saveRebootCount() {
  uint8_t newCount = rebootCount + 1;
  EEPROM.write(EEPROM_REBOOT_ADDR, newCount);
  EEPROM.commit();
}

uint8_t StateMachine::getRebootCount() {
  return rebootCount;
}

bool StateMachine::isSafeMode() {
  if (rebootCount >= MAX_REBOOTS_BEFORE_SAFE) {
    setState(ST_SAFE);
    return true;
  }
  return false;
}
