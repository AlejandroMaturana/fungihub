#ifndef BUTTON_HANDLER_H
#define BUTTON_HANDLER_H

#include <Arduino.h>
#include "button_fsm.h"
#include "state_machine.h"

// ============================================================
//  Button Handler — Despacho de acciones por DeviceState
//  Mapea (DeviceState x ButtonGesture) -> Accion.
//  No conoce GPIO, debounce, ni timing.
// ============================================================

class ButtonHandler {
public:
  ButtonHandler();
  void init(StateMachine* stateMachine);
  void handleGesture(ButtonGesture gesture, uint32_t holdDuration);
  void ledHoldProgress(uint32_t elapsed);

private:
  StateMachine* _sm;

  void _actionClick();
  void _actionDoubleClick();
  void _actionHold3s();
  void _actionHold10s();

  void _ledFeedbackClick();
  void _ledFeedbackDoubleClick();
  void _ledFeedbackHoldConfirm();
  void _ledFeedbackFactoryReset();

  void _executeFactoryReset();
};

extern ButtonHandler buttonHandler;

void buttonEventCallback(const Event& event, void* context);

#endif
