import type { ArchitectureBlock } from './dashboardTypes';

export type RuntimeTarget = 'esp32_s3_rover' | 'raspberry_pi_zero_2w_rover';

export const runtimeTargetPresets: Record<
  RuntimeTarget,
  {
    baseUrl: string;
    description: string;
    emulatorUiUrl: string;
    label: string;
    runtimeTitle: string;
  }
> = {
  esp32_s3_rover: {
    label: 'ESP32-S3',
    runtimeTitle: 'ESP32-S3 Rover',
    description: 'Firmware microcontroller con camera e PWM locali.',
    baseUrl: 'http://127.0.0.1:8010',
    emulatorUiUrl: 'http://127.0.0.1:8091',
  },
  raspberry_pi_zero_2w_rover: {
    label: 'Raspberry Pi Zero 2 W',
    runtimeTitle: 'Raspberry Pi Zero 2 W Rover',
    description: 'Runtime Linux a bordo per video, debug e networking evoluti.',
    baseUrl: 'http://127.0.0.1:8011',
    emulatorUiUrl: 'http://127.0.0.1:8091',
  },
};

export function getArchitectureBlocks(target: RuntimeTarget): ArchitectureBlock[] {
  const runtimeBlock =
    target === 'esp32_s3_rover'
      ? {
          id: 'target-runtime',
          title: 'ESP32-S3 Rover',
          subtitle: 'Firmware reale chip-specifico',
          environment: 'Arduino / PlatformIO',
          role: 'Gestisce WiFi, H-bridge, watchdog e camera su microcontrollore.',
          io: 'HTTP compatibile con simulatore e control agent.',
        }
      : {
          id: 'target-runtime',
          title: 'Raspberry Pi Zero 2 W Rover',
          subtitle: 'Runtime reale chip-specifico',
          environment: 'Linux / Python + FastAPI',
          role: 'Gestisce camera, networking e controllo rover su board Linux.',
          io: 'HTTP compatibile con simulatore e control agent.',
        };

  return [
    {
      id: 'mobile-shell',
      title: 'Mobile App Debug',
      subtitle: 'Controller simulato',
      environment: 'Browser / React + Vite',
      role: 'Invia trazione, sterzo, velocita` e camera dal pannello a sinistra.',
      io: 'POST /drive, /stop, /camera/power verso runtime attivo.',
    },
    {
      id: 'control-agent',
      title: 'Control Agent',
      subtitle: 'Gateway comandi',
      environment: 'Node.js service',
      role: 'Normalizza i comandi e li puo` inoltrare allo stack rover reale o emulato.',
      io: 'MQTT/HTTP lato controllo, HTTP lato rover.',
    },
    runtimeBlock,
    {
      id: 'chip-emulator',
      title: 'Chip Emulator',
      subtitle: 'Firmware emulato',
      environment: 'Python / FastAPI',
      role: 'Replica stato rete, PWM, watchdog, camera e pose del chip a bordo.',
      io: 'HTTP status + debug + camera + drive.',
    },
    {
      id: 'rover-ui',
      title: 'Rover Emulator UI',
      subtitle: 'Osservatore grafico',
      environment: 'HTML / JS separato',
      role: 'Visualizza macchina, ruote, segnali ricevuti ed esito applicato.',
      io: 'Polling verso target o emulatore, embedded via iframe.',
    },
  ];
}

export function getArchitectureLinks(target: RuntimeTarget) {
  const runtimeName =
    target === 'esp32_s3_rover' ? 'ESP32-S3 Rover' : 'Raspberry Pi Zero 2 W Rover';

  return [
    {
      id: 'mobile-runtime',
      from: 'Mobile App Debug',
      to: runtimeName,
      label: 'HTTP drive / stop / camera',
    },
    {
      id: 'agent-runtime',
      from: 'Control Agent',
      to: runtimeName,
      label: 'Stessa API rover per reale ed emulato',
    },
    {
      id: 'ui-emulator',
      from: 'Rover Emulator UI',
      to: 'Chip Emulator',
      label: 'Polling status + debug',
    },
  ];
}
