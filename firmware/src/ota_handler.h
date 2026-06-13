#ifndef OTA_HANDLER_H
#define OTA_HANDLER_H

#include <Arduino.h>
#include <ESP8266httpUpdate.h>
#include <ESP8266WiFi.h>

class OTAHandler {
public:
  OTAHandler();
  void init(const char* deviceId);
  void loop();
  bool startArduinoOTA();
  bool startHTTPUpdate(const char* firmwareUrl);
  bool isUpdating();
  const char* getVersion();

private:
  bool updating;
  char deviceId[32];
  unsigned long lastCheck;
};

#endif
