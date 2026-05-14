#pragma once

// Pinout generico. Validare sulla board ESP32-S3-CAM scelta.
constexpr int PIN_DRIVE_IN1 = 4;
constexpr int PIN_DRIVE_IN2 = 5;
constexpr int PIN_DRIVE_PWM = 6;

constexpr int PIN_STEER_IN1 = 7;
constexpr int PIN_STEER_IN2 = 8;
constexpr int PIN_STEER_PWM = 9;

constexpr int PIN_STATUS_LED = 10;
constexpr int PIN_BATTERY_ADC = 1;

constexpr int PWM_CHANNEL_DRIVE = 0;
constexpr int PWM_CHANNEL_STEER = 1;
