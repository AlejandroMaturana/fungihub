#ifndef BUTTON_FSM_H
#define BUTTON_FSM_H

#include <Arduino.h>
#include "button_driver.h"
#include "event_bus.h"

// ============================================================
//  Button FSM — Clasificacion de gestos
//  Consume edges confirmados del ButtonDriver.
//  Clasifica: Click, Double-Click, Hold-3s, Hold-10s.
//  Publica EVT_BUTTON via EventBus.
// ============================================================

enum ButtonGesture {
  BTN_NONE = 0,
  BTN_CLICK,
  BTN_DOUBLE_CLICK,
  BTN_HOLD_3S,
  BTN_HOLD_10S,
};

enum ButtonFsmState {
  BFSM_IDLE,
  BFSM_PRESSED,
  BFSM_HOLD_3S_REACHED,
  BFSM_HOLD_10S_REACHED,
  BFSM_WAIT_SECOND_PRESS,
};

class ButtonFsm {
public:
  ButtonFsm();
  void init();
  void loop();
  ButtonGesture getGesture();
  bool isHolding();
  uint32_t getHoldDuration();

private:
  ButtonFsmState _state;
  uint32_t _pressStartTime;
  uint32_t _releaseTime;
  bool _gestureReady;
  ButtonGesture _lastGesture;

  void _reset();
  void _publishGesture(ButtonGesture gesture, uint32_t holdDuration);
};

extern ButtonFsm buttonFsm;

#endif
