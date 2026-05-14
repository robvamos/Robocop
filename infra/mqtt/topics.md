# MQTT topics

Formato base:

```text
rover/{deviceId}/{channel}
```

## Topic

```text
rover/{deviceId}/cmd
rover/{deviceId}/status
rover/{deviceId}/telemetry
rover/{deviceId}/events
rover/{deviceId}/agent/output
```

## Comando drive

```json
{
  "type": "drive",
  "x": 0.4,
  "y": 0.8,
  "speed": 60,
  "seq": 1024,
  "ts": "2026-05-14T10:30:00Z"
}
```

## Comando stop

```json
{
  "type": "stop",
  "seq": 1025,
  "ts": "2026-05-14T10:30:01Z"
}
```

## Telemetria

```json
{
  "battery": 82,
  "rssi": -58,
  "speed": 0.32,
  "heading": 142,
  "mode": "manual",
  "obstacle_cm": 46
}
```

## Note

- MQTT e' usato per comandi, stato, telemetria ed eventi.
- Il video non deve passare su MQTT continuo: usare MJPEG per MVP e WebRTC in seguito.
- Tutti i topic devono essere protetti da TLS e ACL per device.
