#ifndef MQTT_CLIENT_H
#define MQTT_CLIENT_H

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

class MQTTClient {
public:
  MQTTClient();
  void init(const char* deviceId);
  void loop();
  bool isConnected();
  bool publish(const char* topic, const char* payload, bool retained = false);

  void setOtaCallback(void (*cb)(const char* url, const char* version));

private:
  WiFiClient _tcpClient;
  PubSubClient _client;
  char _deviceId[32];
  char _topicBase[48];
  unsigned long _lastReconnect;
  void (*_otaCb)(const char* url, const char* version);

  void _connect();
  void _onMessage(char* topic, uint8_t* payload, unsigned int len);
  static void _staticCallback(char* topic, uint8_t* payload, unsigned int len);
  static MQTTClient* _instance;
};

#endif
