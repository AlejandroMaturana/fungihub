#ifndef MQTT_CLIENT_H
#define MQTT_CLIENT_H

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

struct ActuatorCommand {
  uint8_t channel;
  uint8_t state;
  uint8_t mode;
};

class MQTTClient {
public:
  MQTTClient();
  void init(const char* deviceId);
  void loop();
  bool isConnected();

  bool publish(const char* topic, const char* payload, bool retained = false);
  bool publishTelemetry(float temp, float hum, uint16_t eco2, uint16_t tvoc, uint8_t aqi);
  bool publishStatus(const char* state, const char* mode, int rssi);
  bool publishAlarm(const char* reason);

  void setOtaCallback(void (*cb)(const char* url, const char* version));
  void setActuatorCallback(void (*cb)(const ActuatorCommand* cmds, int count));

  bool isFallbackActive() { return _usingFallback; }

private:
  WiFiClient _tcpClient;
  PubSubClient _client;
  char _deviceId[32];
  char _topicBase[48];
  unsigned long _lastReconnect;
  unsigned long _fallbackRetry;
  bool _usingFallback;

  void (*_otaCb)(const char* url, const char* version);
  void (*_actuatorCb)(const ActuatorCommand* cmds, int count);

  void _connect();
  void _onMessage(char* topic, uint8_t* payload, unsigned int len);
  static void _staticCallback(char* topic, uint8_t* payload, unsigned int len);
  static MQTTClient* _instance;
};

#endif
