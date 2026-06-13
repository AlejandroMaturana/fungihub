#ifndef MQTT_HANDLER_H
#define MQTT_HANDLER_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <ESP8266WiFi.h>

class MQTTHandler {
public:
  MQTTHandler();
  void init(const char* deviceId);
  void loop();
  bool isConnected();
  bool publish(const char* topic, const char* payload, bool retain = false);
  bool publishTelemetry(const char* payload);
  bool publishState(const char* payload);
  bool publishBoot();
  bool publishAck(const char* cmdId, const char* status, const char* channelInfo);
  bool publishAlarm(const char* reason);
  bool publishConfigAck(const char* cmdId, const char* status);
  bool publishOnline(bool online);
  void setCallback(MQTT_CALLBACK_SIGNATURE);
  void setCommandCallback(void (*cb)(const char* cmdId, int channel, const char* command));
  void setConfigCallback(void (*cb)(const char* cmdId, JsonDocument& config));
  void setOTACallback(void (*cb)(const char* cmdId, const char* action, const char* url));

private:
  WiFiClient wifiClient;
  PubSubClient client;
  const char* brokers[2];
  int brokerPorts[2];
  int currentBroker;
  String deviceId;
  unsigned long lastReconnect;
  unsigned int backoffDelay;
  static const unsigned int BACKOFF_MIN = 5000;
  static const unsigned int BACKOFF_MAX = 180000;
  bool connectToBroker(int index);

  static void onMessage(char* topic, byte* payload, unsigned int length);
  static void (*commandCallback)(const char* cmdId, int channel, const char* command);
  static void (*configCallback)(const char* cmdId, JsonDocument& config);
  static void (*otaCallback)(const char* cmdId, const char* action, const char* url);

  void setupTopics();
};

#endif
