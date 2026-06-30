#ifndef OTA_POSTBOOT_H
#define OTA_POSTBOOT_H

#include <Arduino.h>
#include <esp_ota_ops.h>

class OTAConfirmation {
public:
  OTAConfirmation();
  bool selfTest();
  void confirm();
  void rollback();
  bool isPendingVerification();

private:
  bool _otaPending;
};

#endif
