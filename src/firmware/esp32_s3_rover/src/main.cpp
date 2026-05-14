#include <Arduino.h>
#include <ArduinoJson.h>
#include <WebServer.h>
#include <WiFi.h>

#include "config.h"
#include "pins.h"

WebServer server(HTTP_PORT);

struct MotorState {
  float x = 0.0f;
  float y = 0.0f;
  int speed = 0;
  unsigned long lastCommandAt = 0;
};

MotorState state;

int dutyFromCommand(float value, int speedLimit, int maxDuty) {
  const float absValue = fabs(value);
  const float limited = constrain(absValue, 0.0f, 1.0f);
  const float speedScale = constrain(speedLimit, 0, 100) / 100.0f;
  return static_cast<int>(limited * speedScale * maxDuty);
}

void setBridge(int in1, int in2, int pwmChannel, float value, int duty) {
  if (value > 0.02f) {
    digitalWrite(in1, HIGH);
    digitalWrite(in2, LOW);
    ledcWrite(pwmChannel, duty);
    return;
  }

  if (value < -0.02f) {
    digitalWrite(in1, LOW);
    digitalWrite(in2, HIGH);
    ledcWrite(pwmChannel, duty);
    return;
  }

  digitalWrite(in1, LOW);
  digitalWrite(in2, LOW);
  ledcWrite(pwmChannel, 0);
}

void applyDrive(float x, float y, int speed) {
  const int driveDuty = dutyFromCommand(y, speed, MAX_DRIVE_DUTY);
  const int steerDuty = dutyFromCommand(x, 100, MAX_STEER_DUTY);

  // y positivo = avanti, y negativo = indietro.
  setBridge(PIN_DRIVE_IN1, PIN_DRIVE_IN2, PWM_CHANNEL_DRIVE, y, driveDuty);

  // x positivo = destra, x negativo = sinistra.
  setBridge(PIN_STEER_IN1, PIN_STEER_IN2, PWM_CHANNEL_STEER, x, steerDuty);

  state.x = x;
  state.y = y;
  state.speed = speed;
  state.lastCommandAt = millis();
}

void stopMotors() {
  applyDrive(0.0f, 0.0f, 0);
}

void handleDrive() {
  JsonDocument doc;
  const DeserializationError error = deserializeJson(doc, server.arg("plain"));
  if (error) {
    server.send(400, "application/json", "{\"error\":\"invalid_json\"}");
    return;
  }

  const float x = constrain(doc["x"] | 0.0f, -1.0f, 1.0f);
  const float y = constrain(doc["y"] | 0.0f, -1.0f, 1.0f);
  const int speed = constrain(doc["speed"] | 0, 0, 100);

  applyDrive(x, y, speed);
  server.send(200, "application/json", "{\"accepted\":true}");
}

void handleStop() {
  stopMotors();
  server.send(200, "application/json", "{\"stopped\":true}");
}

void handleStatus() {
  const bool timedOut = millis() - state.lastCommandAt > COMMAND_TIMEOUT_MS;
  const int batteryRaw = analogRead(PIN_BATTERY_ADC);

  String payload = "{";
  payload += "\"online\":true,";
  payload += "\"deviceId\":\"" DEVICE_ID "\",";
  payload += "\"timedOut\":";
  payload += timedOut ? "true" : "false";
  payload += ",\"drive\":{\"x\":";
  payload += String(state.x, 3);
  payload += ",\"y\":";
  payload += String(state.y, 3);
  payload += ",\"speed\":";
  payload += String(state.speed);
  payload += "},\"batteryRaw\":";
  payload += String(batteryRaw);
  payload += "}";

  server.send(200, "application/json", payload);
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

  stopMotors();
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
  server.on("/status", HTTP_GET, handleStatus);
  server.begin();
}

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

  if (state.lastCommandAt > 0 && millis() - state.lastCommandAt > COMMAND_TIMEOUT_MS) {
    stopMotors();
  }
}
