#include <Arduino.h>
#include <ArduinoJson.h>
#include <WebServer.h>
#include <WiFi.h>

#include "config.example.h"
#if __has_include("config.h")
#include "config.h"
#endif
#include "pins.h"

namespace {
constexpr float kInputDeadband = 0.02f;
constexpr int kJsonCapacity = 2048;

WebServer server(HTTP_PORT);

struct RoverState {
  float steer = 0.0f;
  float throttle = 0.0f;
  int speed = 0;
  bool cameraEnabled = false;
  unsigned long lastCommandAt = 0;
  bool watchdogTriggered = false;
};

RoverState state;

int dutyFromCommand(float value, int speedLimit, int maxDuty) {
  const float absValue = fabsf(value);
  const float limited = constrain(absValue, 0.0f, 1.0f);
  const float speedScale = constrain(speedLimit, 0, 100) / 100.0f;
  return static_cast<int>(limited * speedScale * maxDuty);
}

const char* directionFromThrottle(float throttle) {
  if (throttle > 0.05f) {
    return "forward";
  }
  if (throttle < -0.05f) {
    return "reverse";
  }
  return "idle";
}

const char* steeringFromInput(float steer) {
  if (steer > 0.08f) {
    return "right";
  }
  if (steer < -0.08f) {
    return "left";
  }
  return "straight";
}

int accelerationPct(float throttle, int speed) {
  return static_cast<int>(roundf(fabsf(throttle) * constrain(speed, 0, 100)));
}

void setBridge(int in1, int in2, int pwmChannel, float value, int duty) {
  if (value > kInputDeadband) {
    digitalWrite(in1, HIGH);
    digitalWrite(in2, LOW);
    ledcWrite(pwmChannel, duty);
    return;
  }

  if (value < -kInputDeadband) {
    digitalWrite(in1, LOW);
    digitalWrite(in2, HIGH);
    ledcWrite(pwmChannel, duty);
    return;
  }

  digitalWrite(in1, LOW);
  digitalWrite(in2, LOW);
  ledcWrite(pwmChannel, 0);
}

void applyDrive(float steer, float throttle, int speed) {
  const int driveDuty = dutyFromCommand(throttle, speed, MAX_DRIVE_DUTY);
  const int steerDuty = dutyFromCommand(steer, 100, MAX_STEER_DUTY);

  setBridge(PIN_DRIVE_IN1, PIN_DRIVE_IN2, PWM_CHANNEL_DRIVE, throttle, driveDuty);
  setBridge(PIN_STEER_IN1, PIN_STEER_IN2, PWM_CHANNEL_STEER, steer, steerDuty);

  state.steer = steer;
  state.throttle = throttle;
  state.speed = speed;
  state.lastCommandAt = millis();
  state.watchdogTriggered = false;
}

void stopMotors(bool fromWatchdog = false) {
  setBridge(PIN_DRIVE_IN1, PIN_DRIVE_IN2, PWM_CHANNEL_DRIVE, 0.0f, 0);
  setBridge(PIN_STEER_IN1, PIN_STEER_IN2, PWM_CHANNEL_STEER, 0.0f, 0);
  state.steer = 0.0f;
  state.throttle = 0.0f;
  state.speed = 0;
  if (fromWatchdog) {
    state.watchdogTriggered = true;
    state.lastCommandAt = 0;
  } else {
    state.lastCommandAt = millis();
    state.watchdogTriggered = false;
  }
}

void sendJson(const JsonDocument& doc) {
  String payload;
  serializeJson(doc, payload);
  server.send(200, "application/json", payload);
}

void sendError(int statusCode, const char* code) {
  JsonDocument doc;
  doc["error"] = code;
  String payload;
  serializeJson(doc, payload);
  server.send(statusCode, "application/json", payload);
}

void fillCamera(JsonObject camera) {
  camera["enabled"] = state.cameraEnabled;
  camera["streaming"] = state.cameraEnabled;
  camera["sensor"] = "esp32-s3-cam";
}

void fillNetwork(JsonObject network) {
  JsonObject iface = network["interface"].to<JsonObject>();
  iface["name"] = "wlan0";
  iface["mode"] = "station";
  iface["connected"] = WiFi.status() == WL_CONNECTED;
  iface["ssid"] = WiFi.SSID();
  iface["security"] = strlen(WIFI_PASSWORD) == 0 ? "open" : "wpa2";
  iface["signal"] = WiFi.RSSI();
  iface["ip_address"] = WiFi.localIP().toString();
  iface["mac_address"] = WiFi.macAddress();

  JsonArray visibleNetworks = network["visibleNetworks"].to<JsonArray>();
  JsonObject active = visibleNetworks.add<JsonObject>();
  active["ssid"] = WiFi.SSID();
  active["security"] = strlen(WIFI_PASSWORD) == 0 ? "open" : "wpa2";
  active["signal"] = WiFi.RSSI();
  active["channel"] = WiFi.channel();
}

void fillStatus(JsonDocument& doc) {
  const bool timedOut =
      state.lastCommandAt == 0 || millis() - state.lastCommandAt > COMMAND_TIMEOUT_MS;
  const int batteryRaw = analogRead(PIN_BATTERY_ADC);

  doc["online"] = true;
  doc["deviceId"] = DEVICE_ID;
  doc["timedOut"] = timedOut;
  doc["batteryRaw"] = batteryRaw;
  doc["batteryPct"] = map(constrain(batteryRaw, 0, 4095), 0, 4095, 0, 100);

  JsonObject drive = doc["drive"].to<JsonObject>();
  drive["x"] = state.steer;
  drive["y"] = state.throttle;
  drive["speed"] = state.speed;

  JsonObject pwm = doc["pwm"].to<JsonObject>();
  pwm["driveDuty"] = dutyFromCommand(state.throttle, state.speed, MAX_DRIVE_DUTY);
  pwm["steerDuty"] = dutyFromCommand(state.steer, 100, MAX_STEER_DUTY);

  JsonObject motion = doc["motion"].to<JsonObject>();
  motion["direction"] = directionFromThrottle(state.throttle);
  motion["steering"] = steeringFromInput(state.steer);
  motion["throttlePct"] = static_cast<int>(roundf(state.throttle * 100.0f));
  motion["steerPct"] = static_cast<int>(roundf(state.steer * 100.0f));
  motion["accelerationPct"] = accelerationPct(state.throttle, state.speed);

  JsonObject pose = doc["pose"].to<JsonObject>();
  pose["heading"] = state.steer * 24.0f;
  pose["x"] = state.throttle * 0.25f;
  pose["y"] = state.throttle * 0.16f;

  fillCamera(doc["camera"].to<JsonObject>());
  fillNetwork(doc["network"].to<JsonObject>());

  JsonObject debug = doc["debug"].to<JsonObject>();
  JsonObject lastOutcome = debug["lastOutcome"].to<JsonObject>();
  lastOutcome["signal"] = state.watchdogTriggered ? "watchdog_stop" : "drive_loop";
  lastOutcome["detail"] = state.watchdogTriggered
                              ? "Timeout comandi: motori arrestati dal watchdog."
                              : "Comandi applicati al bridge motori.";
}

void handleDrive() {
  JsonDocument doc;
  const DeserializationError error = deserializeJson(doc, server.arg("plain"));
  if (error) {
    sendError(400, "invalid_json");
    return;
  }

  const float steer = constrain(doc["x"] | 0.0f, -1.0f, 1.0f);
  const float throttle = constrain(doc["y"] | 0.0f, -1.0f, 1.0f);
  const int speed = constrain(doc["speed"] | 0, 0, 100);

  applyDrive(steer, throttle, speed);

  JsonDocument response;
  response["accepted"] = true;
  sendJson(response);
}

void handleStop() {
  stopMotors(false);

  JsonDocument response;
  response["stopped"] = true;
  sendJson(response);
}

void handleCameraPower() {
  JsonDocument doc;
  const DeserializationError error = deserializeJson(doc, server.arg("plain"));
  if (error) {
    sendError(400, "invalid_json");
    return;
  }

  state.cameraEnabled = doc["enabled"] | false;

  JsonDocument response;
  response["accepted"] = true;
  fillCamera(response["camera"].to<JsonObject>());
  sendJson(response);
}

void handleCameraStatus() {
  JsonDocument response;
  fillCamera(response.to<JsonObject>());
  sendJson(response);
}

void handleNetworkInterfaces() {
  JsonDocument response;
  JsonArray interfaces = response["interfaces"].to<JsonArray>();
  JsonObject iface = interfaces.add<JsonObject>();
  iface["name"] = "wlan0";
  iface["mode"] = "station";
  iface["connected"] = WiFi.status() == WL_CONNECTED;
  iface["ssid"] = WiFi.SSID();
  iface["security"] = strlen(WIFI_PASSWORD) == 0 ? "open" : "wpa2";
  iface["signal"] = WiFi.RSSI();
  iface["ip_address"] = WiFi.localIP().toString();
  iface["mac_address"] = WiFi.macAddress();

  JsonArray visibleNetworks = response["visible_networks"].to<JsonArray>();
  JsonObject active = visibleNetworks.add<JsonObject>();
  active["ssid"] = WiFi.SSID();
  active["security"] = strlen(WIFI_PASSWORD) == 0 ? "open" : "wpa2";
  active["signal"] = WiFi.RSSI();
  active["channel"] = WiFi.channel();
  sendJson(response);
}

void handleStatus() {
  JsonDocument response;
  fillStatus(response);
  sendJson(response);
}

void setupPins() {
  pinMode(PIN_DRIVE_IN1, OUTPUT);
  pinMode(PIN_DRIVE_IN2, OUTPUT);
  pinMode(PIN_STEER_IN1, OUTPUT);
  pinMode(PIN_STEER_IN2, OUTPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);

  ledcSetup(PWM_CHANNEL_DRIVE, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS);
  ledcSetup(PWM_CHANNEL_STEER, PWM_FREQUENCY_HZ, PWM_RESOLUTION_BITS);
  ledcAttachPin(PIN_DRIVE_PWM, PWM_CHANNEL_DRIVE);
  ledcAttachPin(PIN_STEER_PWM, PWM_CHANNEL_STEER);

  stopMotors(false);
}

void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
    delay(250);
  }

  digitalWrite(PIN_STATUS_LED, HIGH);
}

void setupServer() {
  server.on("/drive", HTTP_POST, handleDrive);
  server.on("/stop", HTTP_POST, handleStop);
  server.on("/camera/power", HTTP_POST, handleCameraPower);
  server.on("/camera/status", HTTP_GET, handleCameraStatus);
  server.on("/network/interfaces", HTTP_GET, handleNetworkInterfaces);
  server.on("/status", HTTP_GET, handleStatus);
  server.begin();
}
}  // namespace

void setup() {
  Serial.begin(115200);
  setupPins();
  setupWiFi();
  setupServer();

  Serial.print("Robocop rover firmware online: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  server.handleClient();

  const bool expired =
      state.lastCommandAt > 0 && millis() - state.lastCommandAt > COMMAND_TIMEOUT_MS;
  if (expired && !state.watchdogTriggered) {
    stopMotors(true);
  }
}
