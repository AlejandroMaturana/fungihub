#ifndef BUTTON_DRIVER_H
#define BUTTON_DRIVER_H

#include <Arduino.h>
#include <freertos/FreeRTOS.h>

// ============================================================
//  Button Driver — Capa GPIO + debounce hardware
//  Detecta edges via interrupt CHANGE, aplica debounce de 20ms.
//  No clasifica gestos ni publica eventos.
// ============================================================

class ButtonDriver {
public:
  ButtonDriver();
  bool init(int gpioPin);
  void poll();
  bool isPressed();
  bool edgeDetected();
  bool edgeIsPress();
  uint32_t getEdgeTimestamp();

private:
  int _pin;
  volatile uint32_t _isrTimestamp;
  volatile bool _rawLevel;
  bool _debouncedLevel;
  bool _pendingEdge;
  bool _pendingIsPress;
  uint32_t _pendingTimestamp;
  uint32_t _lastTransitionTime;

  static void IRAM_ATTR _isrHandler(void* arg);
};

extern ButtonDriver buttonDriver;

#endif
