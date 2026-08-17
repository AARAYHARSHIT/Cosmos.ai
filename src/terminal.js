/**
 * COSMOS.AI Mission Control CLI Terminal Engine
 */
import { playBeep } from './audio.js';
import { showToast } from './toast.js';

let terminalModal = null;
let terminalOutput = null;
let terminalInput = null;
let sceneRef = null;

const ASCII_BANNER = `
  ██████╗ ██████╗ ███████╗███╗   ███╗ ██████╗ ███████╗
 ██╔════╝██╔═══██╗██╔════╝████╗ ████║██╔═══██╗██╔════╝
 ██║     ██║   ██║███████╗██╔████╔██║██║   ██║███████╗
 ██║     ██║   ██║╚════██║██║╚██╔╝██║██║   ██║╚════██║
 ╚██████╗╚██████╔╝███████║██║ ╚═╝ ██║╚██████╔╝███████║
  ╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝
           [ v2.5 DEEP SPACE INTELLIGENCE OS ]
`;

const COMMANDS = {
  help: 'Display all available mission commands and flight telemetry functions.',
  scan: 'Initiate deep spectral scan on targeted celestial body (e.g. `scan azurea`, `scan vesperion`).',
  warp: 'Toggle warp speed hyperspace propulsion (`warp on` / `warp off`).',
  telemetry: 'Display real-time orbital telemetry, camera vector coordinates, and WebGL metrics.',
  planets: 'List all currently mapped worlds and stellar coordinates.',
  nebula: 'Change nebula shader resonance (`nebula violet`, `nebula cyan`, `nebula gold`, `nebula emerald`).',
  audio: 'Toggle procedural audio synthesis engine.',
  clear: 'Clear terminal buffer.',
  exit: 'Close mission console.',
};

export function initTerminal(context = {}) {
  sceneRef = context;
  terminalModal = document.getElementById('terminal-modal');
  if (!terminalModal) return;

  terminalOutput = terminalModal.querySelector('.terminal-output');
  terminalInput = terminalModal.querySelector('.terminal-input');
  const closeBtn = terminalModal.querySelector('.modal-close');
  const quickChips = terminalModal.querySelectorAll('.terminal-chip');

  if (terminalOutput && terminalOutput.children.length === 0) {
    printLine(ASCII_BANNER, 'banner');
    printLine('Welcome Commander. System online. Type `help` or click command chips below.', 'system');
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = terminalInput.value.trim();
        terminalInput.value = '';
        if (cmd) {
          executeCommand(cmd);
        }
      }
    });
  }

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd || chip.textContent.trim();
      executeCommand(cmd);
      playBeep('click');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeTerminal);
  }

  terminalModal.addEventListener('click', (e) => {
    if (e.target === terminalModal) {
      closeTerminal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && terminalModal.classList.contains('active')) {
      closeTerminal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleTerminal();
    }
  });
}

export function openTerminal() {
  if (!terminalModal) return;
  terminalModal.classList.add('active');
  playBeep('activate');
  setTimeout(() => {
    terminalInput?.focus();
  }, 100);
}

export function closeTerminal() {
  if (!terminalModal) return;
  terminalModal.classList.remove('active');
  playBeep('click');
}

export function toggleTerminal() {
  if (terminalModal?.classList.contains('active')) {
    closeTerminal();
  } else {
    openTerminal();
  }
}

function printLine(text, type = 'normal') {
  if (!terminalOutput) return;
  const line = document.createElement('div');
  line.className = `terminal-line line-${type}`;
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

export function executeCommand(rawCmd) {
  printLine(`> ${rawCmd}`, 'input-echo');
  playBeep('click');

  const parts = rawCmd.toLowerCase().trim().split(/\s+/);
  const cmd = parts[0];
  const arg = parts[1];

  switch (cmd) {
    case 'help':
      printLine('╔════════════════════ AVAILABLE COMMANDS ════════════════════╗', 'system');
      Object.entries(COMMANDS).forEach(([c, desc]) => {
        printLine(`  • ${c.padEnd(12)} - ${desc}`, 'help-item');
      });
      printLine('╚════════════════════════════════════════════════════════════╝', 'system');
      break;

    case 'scan':
      if (!arg) {
        printLine('Scan initiated on global sector. Target celestial body: azurea or vesperion.', 'warning');
      } else {
        printLine(`[SCANNING] Locking sensors on sector target: ${arg.toUpperCase()}...`, 'system');
        setTimeout(() => {
          if (arg === 'azurea') {
            printLine('✓ AZUREA PRIME: Ocean super-earth. Depth: 120km liquid ocean. Atmosphere: Nitrogen/Oxygen/Water vapor. Biosignatures: 94.2% Probable.', 'success');
            showToast('Scan complete: Azurea oceanic biosignatures detected.', { title: 'Spectrometry Scanner', type: 'scan' });
          } else if (arg === 'vesperion') {
            printLine('✓ VESPERION: Gas giant with dual Cassini rings. Winds: 1,800 km/h. High-energy violet aurora mapped.', 'success');
            showToast('Scan complete: Vesperion ring topology mapped.', { title: 'Spectrometry Scanner', type: 'scan' });
          } else {
            printLine(`Target "${arg}" analyzed. Sector coordinates recorded.`, 'normal');
          }
        }, 400);
      }
      break;

    case 'warp':
      if (sceneRef?.toggleWarpDrive) {
        const isWarp = arg === 'on' || arg === 'true' || (arg === undefined && !sceneRef.isWarpActive());
        sceneRef.setWarpDrive(isWarp);
        printLine(`HYPERSPACE WARP PROPULSION: ${isWarp ? 'ENGAGED [WARP 9.9]' : 'DISENGAGED [SUBLIGHT]'}.`, isWarp ? 'warp' : 'normal');
        showToast(isWarp ? 'Warp 9.9 Engaged. Relativistic shift active.' : 'Warp drive disengaged.', { title: 'Propulsion Control', type: 'warp' });
      }
      break;

    case 'telemetry':
      printLine('--- LIVE DEEP SPACE TELEMETRY ---', 'system');
      printLine(`• Sector Coordinates: RA 18h 36m 56s | Dec +38° 47′ 01″`, 'normal');
      printLine(`• Relativistic Velocity: 0.85c (254,827 km/s)`, 'normal');
      printLine(`• Active Stars in Buffer: 5,500 diamond entities`, 'normal');
      printLine(`• Quantum Sensor Latency: 0.8ms`, 'normal');
      printLine(`• Engine Status: All systems nominal (100% operational)`, 'success');
      break;

    case 'planets':
      printLine('1. Azurea Prime - Orbital Radius: 1.12 AU | Radius: 12,800 km | Type: Ocean Super-Earth (Class-A)', 'normal');
      printLine('2. Vesperion    - Orbital Radius: 3.45 AU | Radius: 54,000 km | Type: Ringed Gas Giant', 'normal');
      break;

    case 'nebula':
      if (sceneRef?.setNebulaColor) {
        const preset = arg || 'violet';
        sceneRef.setNebulaColor(preset);
        printLine(`Nebula shader resonance updated to preset: [${preset.toUpperCase()}].`, 'success');
        showToast(`Nebula resonance shifted to ${preset}.`, { title: 'Quantum Shader', type: 'info' });
      } else {
        printLine(`Nebula resonance shifted to ${arg || 'default'}.`, 'normal');
      }
      break;

    case 'clear':
      if (terminalOutput) {
        terminalOutput.innerHTML = '';
      }
      break;

    case 'exit':
      closeTerminal();
      break;

    default:
      printLine(`Command not recognized: "${rawCmd}". Type \`help\` for command catalog.`, 'error');
      break;
  }
}
