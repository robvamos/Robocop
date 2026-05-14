const baseUrlInput = document.getElementById("baseUrl");
const connectButton = document.getElementById("connectButton");
const connectionState = document.getElementById("connectionState");
const rover = document.getElementById("rover");
const signalBeam = document.getElementById("signalBeam");
const cameraLamp = document.getElementById("cameraLamp");
const cameraState = document.getElementById("cameraState");
const driveState = document.getElementById("driveState");
const poseState = document.getElementById("poseState");
const telemetryGrid = document.getElementById("telemetryGrid");
const networkSummary = document.getElementById("networkSummary");
const visibleNetworks = document.getElementById("visibleNetworks");
const eventLog = document.getElementById("eventLog");
const signalLog = document.getElementById("signalLog");
const lastOutcome = document.getElementById("lastOutcome");
const wheelLeft = document.getElementById("wheelLeft");
const wheelRight = document.getElementById("wheelRight");
const motionDirection = document.getElementById("motionDirection");
const motionSteering = document.getElementById("motionSteering");
const motionAcceleration = document.getElementById("motionAcceleration");

let pollTimer = null;
let lastCameraState = null;
let lastDriveText = "";

function appendEvent(text) {
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} - ${text}`;
  eventLog.prepend(li);
  while (eventLog.children.length > 8) {
    eventLog.removeChild(eventLog.lastChild);
  }
}

function setConnectionBadge(state, text) {
  connectionState.className = `badge ${state}`;
  connectionState.textContent = text;
}

function renderTelemetry(status) {
  const items = [
    ["Batteria", `${status.batteryPct}%`],
    ["Duty trazione", `${status.pwm.driveDuty}`],
    ["Duty sterzo", `${status.pwm.steerDuty}`],
    ["Accel.", `${status.motion.accelerationPct}%`],
    ["Timeout", status.timedOut ? "YES" : "NO"],
  ];

  telemetryGrid.innerHTML = "";
  for (const [label, value] of items) {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `<div class="label">${label}</div><div class="value">${value}</div>`;
    telemetryGrid.append(card);
  }
}

function renderNetwork(networkPayload) {
  const wifi = networkPayload.interfaces[0];
  networkSummary.innerHTML = `
    <p><strong>${wifi.name}</strong> collegata a <strong>${wifi.ssid}</strong></p>
    <p>Sicurezza: ${wifi.security} | IP: ${wifi.ip_address} | RSSI: ${wifi.signal} dBm</p>
  `;

  visibleNetworks.innerHTML = "";
  for (const network of networkPayload.visible_networks) {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${network.ssid}</strong><br />${network.security} | canale ${network.channel} | segnale ${network.signal} dBm`;
    visibleNetworks.append(item);
  }
}

function renderRover(status) {
  const heading = status.pose.heading;
  const offsetX = Math.max(-120, Math.min(120, status.pose.x * 42));
  const offsetY = Math.max(-100, Math.min(100, status.pose.y * 46));
  rover.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${heading}deg)`;

  const steer = status.drive.x * 18;
  wheelLeft.style.transform = `rotate(${steer}deg)`;
  wheelRight.style.transform = `rotate(${steer}deg)`;

  const cameraOn = Boolean(status.camera.enabled);
  cameraLamp.classList.toggle("on", cameraOn);
  signalBeam.classList.toggle("active", Math.abs(status.drive.y) > 0.02 || cameraOn);
  signalBeam.classList.toggle("reverse", status.motion.direction === "reverse");
  cameraState.textContent = cameraOn ? "ON" : "OFF";
  driveState.textContent = `${status.drive.x.toFixed(2)} / ${status.drive.y.toFixed(2)} / ${status.drive.speed}`;
  poseState.textContent = `${status.pose.x.toFixed(2)}, ${status.pose.y.toFixed(2)} / ${heading.toFixed(1)}deg`;
  motionDirection.textContent = status.motion.direction;
  motionSteering.textContent = status.motion.steering;
  motionAcceleration.textContent = `${status.motion.accelerationPct}%`;

  if (lastCameraState !== cameraOn) {
    appendEvent(`Camera ${cameraOn ? "accesa" : "spenta"}`);
    lastCameraState = cameraOn;
  }

  const driveText = driveState.textContent;
  if (driveText !== lastDriveText) {
    appendEvent(`Comando guida ${driveText}`);
    lastDriveText = driveText;
  }
}

function renderDebug(status) {
  const outcome = status.debug?.lastOutcome;
  if (!outcome) {
    lastOutcome.className = "debug-window empty";
    lastOutcome.textContent = "In attesa di segnali.";
    signalLog.innerHTML = "";
    return;
  }

  lastOutcome.className = "debug-window";
  lastOutcome.innerHTML = `
    <strong>${outcome.signal}</strong>
    <div class="meta">Esito: ${outcome.outcome}</div>
    <div class="meta">${outcome.detail}</div>
  `;

  signalLog.innerHTML = "";
  for (const signal of status.debug.lastSignals) {
    const item = document.createElement("li");
    item.innerHTML = `
      <strong>${signal.signal}</strong>
      <div class="meta">${signal.detail}</div>
      <div class="meta">Payload: ${JSON.stringify(signal.payload)} | esito: ${signal.outcome}</div>
    `;
    signalLog.append(item);
  }
}

async function fetchJson(path) {
  const response = await fetch(`${baseUrlInput.value}${path}`);
  if (!response.ok) {
    throw new Error(`${path} -> HTTP ${response.status}`);
  }
  return response.json();
}

async function refresh() {
  try {
    const [status, network] = await Promise.all([
      fetchJson("/status"),
      fetchJson("/network/interfaces"),
    ]);

    renderTelemetry(status);
    renderNetwork(network);
    renderRover(status);
    renderDebug(status);
    setConnectionBadge("connected", "connected");
  } catch (error) {
    setConnectionBadge("error", "error");
    appendEvent(error instanceof Error ? error.message : "Errore sconosciuto");
  }
}

function connect() {
  clearInterval(pollTimer);
  setConnectionBadge("idle", "sync");
  appendEvent(`Connessione a ${baseUrlInput.value}`);
  refresh();
  pollTimer = setInterval(refresh, 500);
}

connectButton.addEventListener("click", connect);
connect();
