#include "button_handler.h"
#include "config.h"
#include "logger.h"
#include "ble_provisioning.h"
#include <Preferences.h>

void setLEDColor(uint8_t r, uint8_t g, uint8_t b);

ButtonHandler buttonHandler;

extern BLEProvisioning bleProv;
extern Adafruit_NeoPixel led;

void buttonEventCallback(const Event& event, void* context) {
  if (event.type != EVT_BUTTON) return;
  ButtonHandler* handler = static_cast<ButtonHandler*>(context);
  ButtonGesture gesture = (ButtonGesture)event.payload.button.gesture;
  uint32_t holdDuration = event.payload.button.holdDuration;
  handler->handleGesture(gesture, holdDuration);
}

ButtonHandler::ButtonHandler()
  : _sm(nullptr) {
}

void ButtonHandler::init(StateMachine* stateMachine) {
  _sm = stateMachine;
  eventBus.subscribe(EVT_BUTTON, buttonEventCallback, this);
  LOG_I("BUTTON", "Handler initialized, subscribed to EVT_BUTTON");
}

void ButtonHandler::handleGesture(ButtonGesture gesture, uint32_t holdDuration) {
  switch (gesture) {
    case BTN_CLICK:
      _actionClick();
      break;
    case BTN_DOUBLE_CLICK:
      _actionDoubleClick();
      break;
    case BTN_HOLD_3S:
      _actionHold3s();
      break;
    case BTN_HOLD_10S:
      _actionHold10s();
      break;
    case BTN_NONE:
      break;
  }
}

void ButtonHandler::_actionClick() {
  DeviceState state = _sm->getState();

  switch (state) {
    case ST_NORMAL:
    case ST_DEGRADED:
      LOG_I("BUTTON", "Click en NORMAL/DEGRADED — acknowledge");
      _ledFeedbackClick();
      break;
    case ST_ERROR:
      LOG_I("BUTTON", "Click en ERROR — mostrar estado");
      _ledFeedbackClick();
      break;
    case ST_PROVISIONING:
      LOG_I("BUTTON", "Click en PROVISIONING — cancelar");
      bleProv.stop();
      _ledFeedbackClick();
      break;
    case ST_WIFI:
      LOG_I("BUTTON", "Click en WIFI — mostrar progreso");
      _ledFeedbackClick();
      break;
    case ST_BOOT:
    case ST_INIT:
      LOG_D("BUTTON", "Click ignorado en BOOT/INIT");
      break;
    case ST_OTA_UPDATING:
      LOG_W("BUTTON", "Click ignorado durante OTA");
      break;
    case ST_RECOVERY:
    case ST_SAFE:
      LOG_D("BUTTON", "Click ignorado en RECOVERY/SAFE");
      break;
  }
}

void ButtonHandler::_actionDoubleClick() {
  DeviceState state = _sm->getState();

  if (state == ST_OTA_UPDATING) {
    LOG_W("BUTTON", "Double-click ignorado durante OTA");
    return;
  }

  if (state == ST_NORMAL || state == ST_DEGRADED) {
    LOG_I("BUTTON", "Double-click — forzar refresh sensores");
    _ledFeedbackDoubleClick();
  } else {
    LOG_D("BUTTON", "Double-click ignorado en estado %s", _sm->getStateName());
  }
}

void ButtonHandler::_actionHold3s() {
  DeviceState state = _sm->getState();

  if (state == ST_OTA_UPDATING) {
    LOG_W("BUTTON", "Hold-3s ignorado durante OTA");
    return;
  }

  if (state == ST_NORMAL || state == ST_DEGRADED) {
    LOG_I("BUTTON", "Hold-3s — entrando a provisioning");
    _ledFeedbackHoldConfirm();
    _sm->fsmTransition(ST_PROVISIONING, "button hold-3s");
  } else if (state == ST_PROVISIONING) {
    LOG_I("BUTTON", "Hold-3s en PROVISIONING — cancelando");
    bleProv.stop();
    _ledFeedbackHoldConfirm();
  } else {
    LOG_D("BUTTON", "Hold-3s ignorado en estado %s", _sm->getStateName());
  }
}

void ButtonHandler::_actionHold10s() {
  DeviceState state = _sm->getState();

  if (state == ST_OTA_UPDATING) {
    LOG_W("BUTTON", "Hold-10s ignorado durante OTA");
    return;
  }

  LOG_E("BUTTON", "FACTORY RESET ejecutado via hold 10s");
  _ledFeedbackFactoryReset();
  _executeFactoryReset();
}

void ButtonHandler::_executeFactoryReset() {
  Preferences prefs;
  prefs.begin("mush2", false);
  prefs.clear();
  prefs.end();

  Preferences blePrefs;
  blePrefs.begin("mush2_prov", false);
  blePrefs.clear();
  blePrefs.end();

  Preferences actPrefs;
  actPrefs.begin("mush2_ssr", false);
  actPrefs.clear();
  actPrefs.end();

  for (int i = 0; i < 5; i++) {
    setLEDColor(255, 0, 0);
    delay(100);
    setLEDColor(0, 0, 0);
    delay(100);
  }

  LOG_E("BUTTON", "NVS limpiada — reiniciando ESP32");
  delay(500);
  ESP.restart();
}

void ButtonHandler::ledHoldProgress(uint32_t elapsed) {
  if (elapsed < BUTTON_HOLD_3S_MS) {
    uint8_t brightness = (uint8_t)((elapsed * 128) / BUTTON_HOLD_3S_MS);
    setLEDColor(0, 0, brightness);
  } else {
    uint32_t redPhase = elapsed - BUTTON_HOLD_3S_MS;
    uint32_t redRange = BUTTON_HOLD_10S_MS - BUTTON_HOLD_3S_MS;
    uint8_t brightness = (uint8_t)((redPhase * 255) / redRange);
    setLEDColor(brightness, 0, 0);
  }
}

void ButtonHandler::_ledFeedbackClick() {
  setLEDColor(200, 200, 200);
  delay(50);
}

void ButtonHandler::_ledFeedbackDoubleClick() {
  for (int i = 0; i < 2; i++) {
    setLEDColor(0, 200, 200);
    delay(60);
    setLEDColor(0, 0, 0);
    delay(60);
  }
}

void ButtonHandler::_ledFeedbackHoldConfirm() {
  setLEDColor(0, 0, 255);
  delay(200);
  setLEDColor(0, 0, 0);
  delay(100);
  setLEDColor(0, 0, 255);
  delay(200);
  setLEDColor(0, 0, 0);
}

void ButtonHandler::_ledFeedbackFactoryReset() {
  for (int i = 0; i < 5; i++) {
    setLEDColor(255, 0, 0);
    delay(80);
    setLEDColor(0, 0, 0);
    delay(80);
  }
}
