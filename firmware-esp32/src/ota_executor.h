#ifndef OTA_EXECUTOR_H
#define OTA_EXECUTOR_H

#include <Arduino.h>
#include <WiFi.h>
#include <Update.h>

class OTAExecutor {
public:
  OTAExecutor();
  bool begin(const String& url);
  void setCaCert(const char* cert);
};

#endif
