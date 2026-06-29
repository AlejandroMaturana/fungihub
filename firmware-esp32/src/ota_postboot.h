#ifndef OTA_POSTBOOT_H
#define OTA_POSTBOOT_H

#include <Arduino.h>

class OTAConfirmation {
public:
  OTAConfirmation();
  bool selfTest();
  void confirm();
  void rollback();
};

#endif
