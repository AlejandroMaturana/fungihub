#include "button_fsm.h"
#include "config.h"

ButtonFsm buttonFsm;

ButtonFsm::ButtonFsm()
  : _state(BFSM_IDLE), _pressStartTime(0), _releaseTime(0),
    _gestureReady(false), _lastGesture(BTN_NONE) {
}

void ButtonFsm::init() {
  _reset();
  Serial.println("[BUTTON] FSM initialized");
}

void ButtonFsm::loop() {
  buttonDriver.poll();

  uint32_t now = millis();

  if (buttonDriver.edgeDetected()) {
    bool isPress = buttonDriver.edgeIsPress();
    uint32_t edgeTs = buttonDriver.getEdgeTimestamp();

    switch (_state) {
      case BFSM_IDLE:
        if (isPress) {
          _pressStartTime = edgeTs;
          _state = BFSM_PRESSED;
        }
        break;

      case BFSM_PRESSED:
        if (!isPress) {
          uint32_t pressDuration = edgeTs - _pressStartTime;
          if (pressDuration < BUTTON_CLICK_MAX_MS) {
            _releaseTime = edgeTs;
            _state = BFSM_WAIT_SECOND_PRESS;
          } else {
            _reset();
          }
        }
        break;

      case BFSM_HOLD_3S_REACHED:
        if (!isPress) {
          _reset();
        }
        break;

      case BFSM_HOLD_10S_REACHED:
        if (!isPress) {
          _reset();
        }
        break;

      case BFSM_WAIT_SECOND_PRESS:
        if (isPress) {
          uint32_t gapDuration = edgeTs - _releaseTime;
          if (gapDuration <= BUTTON_DOUBLE_GAP_MS) {
            _publishGesture(BTN_DOUBLE_CLICK, 0);
            _reset();
          } else {
            _pressStartTime = edgeTs;
            _state = BFSM_PRESSED;
          }
        }
        break;
    }
  }

  if (_state == BFSM_PRESSED) {
    uint32_t held = now - _pressStartTime;

    if (held >= BUTTON_HOLD_10S_MS) {
      _publishGesture(BTN_HOLD_10S, held);
      _state = BFSM_HOLD_10S_REACHED;
    } else if (held >= BUTTON_HOLD_3S_MS) {
      _publishGesture(BTN_HOLD_3S, held);
      _state = BFSM_HOLD_3S_REACHED;
    }
  }

  if (_state == BFSM_WAIT_SECOND_PRESS) {
    if ((now - _releaseTime) > BUTTON_DOUBLE_GAP_MS) {
      _publishGesture(BTN_CLICK, 0);
      _reset();
    }
  }
}

ButtonGesture ButtonFsm::getGesture() {
  if (_gestureReady) {
    _gestureReady = false;
    return _lastGesture;
  }
  return BTN_NONE;
}

bool ButtonFsm::isHolding() {
  return (_state == BFSM_PRESSED || _state == BFSM_HOLD_3S_REACHED);
}

uint32_t ButtonFsm::getHoldDuration() {
  if (_state == BFSM_PRESSED || _state == BFSM_HOLD_3S_REACHED) {
    return millis() - _pressStartTime;
  }
  return 0;
}

void ButtonFsm::_reset() {
  _state = BFSM_IDLE;
  _pressStartTime = 0;
  _releaseTime = 0;
}

void ButtonFsm::_publishGesture(ButtonGesture gesture, uint32_t holdDuration) {
  _lastGesture = gesture;
  _gestureReady = true;

  Event event;
  event.type = EVT_BUTTON;
  event.timestamp = millis();
  event.payload.button.gesture = (uint8_t)gesture;
  event.payload.button.holdDuration = holdDuration;
  eventBus.publish(event);

  const char* names[] = {"NONE", "CLICK", "DOUBLE_CLICK", "HOLD_3S", "HOLD_10S"};
  Serial.printf("[BUTTON] Gesture: %s (hold=%lums)\n", names[gesture], holdDuration);
}
