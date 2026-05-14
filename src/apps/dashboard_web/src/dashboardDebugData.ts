import type { ArchitectureBlock } from './dashboardTypes';

export const architectureBlocks: ArchitectureBlock[] = [
  {
    id: 'mobile-shell',
    title: 'Mobile App Debug',
    subtitle: 'Controller simulato',
    environment: 'Browser / React + Vite',
    role: 'Invia trazione, sterzo, velocita` e camera dal pannello a sinistra.',
    io: 'POST /drive, /stop, /camera/power verso chip emulator.',
  },
  {
    id: 'control-agent',
    title: 'Control Agent',
    subtitle: 'Gateway comandi',
    environment: 'Node.js service',
    role: 'Normalizza i comandi e li puo` inoltrare allo stack rover reale o emulato.',
    io: 'MQTT/HTTP lato controllo, HTTP lato rover.',
  },
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
    io: 'Polling verso chip emulator, embedded via iframe.',
  },
];

export const architectureLinks = [
  {
    id: 'mobile-emulator',
    from: 'Mobile App Debug',
    to: 'Chip Emulator',
    label: 'HTTP drive / stop / camera',
  },
  {
    id: 'agent-emulator',
    from: 'Control Agent',
    to: 'Chip Emulator',
    label: 'Stessa API rover per reale ed emulato',
  },
  {
    id: 'ui-emulator',
    from: 'Rover Emulator UI',
    to: 'Chip Emulator',
    label: 'Polling status + debug',
  },
];
