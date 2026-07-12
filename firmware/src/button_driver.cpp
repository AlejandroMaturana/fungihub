#include "button_driver.h"
#include "config.h"

ButtonDriver buttonDriver;

ButtonDriver::ButtonDriver()
  : _pin(-1), _isrTimestamp(0), _rawLevel(true), _debouncedLevel(true),
    _pendingEdge(false), _pendingIsPress(false), _pendingTimestamp(0),
    _lastTransitionTime(0) {
}

bool ButtonDriver::init(int gpioPin) {
  _pin = gpioPin;

  pinMode(_pin, INPUT_PULLUP);

  _debouncedLevel = digitalRead(_pin);
  _rawLevel = _debouncedLevel;
  _lastTransitionTime = millis();

  attachInterruptArg(digitalPinToInterrupt(_pin), _isrHandler, this, CHANGE);

  Serial.printf("[BUTTON] Driver init: GPIO%d (INPUT_PULLUP, active LOW)\n", _pin);
  return true;
}

void IRAM_ATTR ButtonDriver::_isrHandler(void* arg) {
  ButtonDriver* self = static_cast<ButtonDriver*>(arg);
  self->_rawLevel = !digitalRead(self->_pin);
  self->_isrTimestamp = millis();
}

void ButtonDriver::poll() {
  uint32_t now = millis();
  bool raw = _rawLevel;

  if (raw != _debouncedLevel) {
    if ((now - _lastTransitionTime) >= BUTTON_DEBOUNCE_MS) {
      _debouncedLevel = raw;
      _pendingEdge = true;
      _pendingIsPress = raw;
      _pendingTimestamp = _isrTimestamp;
      _lastTransitionTime = now;
    }
  } else {
    _lastTransitionTime = now;
  }
}

bool ButtonDriver::isPressed() {
  return _debouncedLevel;
}

bool ButtonDriver::edgeDetected() {
  if (_pendingEdge) {
    _pendingEdge = false;
    return true;
  }
  return false;
}

bool ButtonDriver::edgeIsPress() {
  return _pendingIsPress;
}

uint32_t ButtonDriver::getEdgeTimestamp() {
  return _pendingTimestamp;
}
