import 'package:flutter/material.dart';

void main() {
  runApp(const RobocopApp());
}

class RobocopApp extends StatelessWidget {
  const RobocopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Robocop',
      theme: ThemeData(useMaterial3: true),
      home: const RoverControlPage(),
    );
  }
}

class RoverControlPage extends StatelessWidget {
  const RoverControlPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Robocop')),
      body: const Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(child: _VideoPlaceholder()),
            SizedBox(height: 16),
            _TelemetryPanel(),
            SizedBox(height: 16),
            _JoystickPlaceholder(),
          ],
        ),
      ),
    );
  }
}

class _VideoPlaceholder extends StatelessWidget {
  const _VideoPlaceholder();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(border: Border.all(color: Colors.black26)),
      child: const Center(child: Text('MJPEG/WebRTC video')),
    );
  }
}

class _TelemetryPanel extends StatelessWidget {
  const _TelemetryPanel();

  @override
  Widget build(BuildContext context) {
    return const Text('Telemetry: battery, RSSI, speed, mode');
  }
}

class _JoystickPlaceholder extends StatelessWidget {
  const _JoystickPlaceholder();

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: null,
      child: Text('Joystick MQTT command source'),
    );
  }
}
