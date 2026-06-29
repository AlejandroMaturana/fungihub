#ifndef OTA_SHUTDOWN_H
#define OTA_SHUTDOWN_H

#include <Arduino.h>

class OTAShutdown {
public:
  OTAShutdown();
  bool begin();
  void abortRollback();
};

#endif
