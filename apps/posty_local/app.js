// app.js • PostyLocal Interactive Mobile Logic

// Estado en memoria y datos iniciales de demostración
const DEFAULT_NOTES = [
  {
    id: 'n1',
    text: 'Pagar factura de luz antes de las 18:00 en ventanilla o banca',
    color: 'yellow',
    urgency: 'urgent',
    triggerType: 'time',
    triggerLabel: '⏰ Vence Hoy 18:00',
    hasAudio: true,
    audioDuration: '0:12',
    completed: false,
    createdAt: Date.now() - 3600000
  },
  {
    id: 'n2',
    text: 'Cerrar la llave de paso de gas de la cocina al salir de casa',
    color: 'pink',
    urgency: 'context',
    triggerType: 'geo',
    triggerLabel: '🏠 Al salir de casa (150m)',
    hasAudio: true,
    audioDuration: '0:07',
    completed: false,
    createdAt: Date.now() - 7200000
  },
  {
    id: 'n3',
    text: 'Comprar leche descremada, manzanas verdes y avena en grano',
    color: 'green',
    urgency: 'context',
    triggerType: 'geo',
    triggerLabel: '🛒 Cerca del supermercado',
    hasAudio: true,
    audioDuration: '0:09',
    completed: false,
    createdAt: Date.now() - 10800000
  },
  {
    id: 'n4',
    text: 'Llamar a carpintero para cotización de repisa de libros',
    color: 'blue',
    urgency: 'normal',
    triggerType: 'none',
    triggerLabel: '🟢 Sin alarma estricta',
    hasAudio: false,
    audioDuration: null,
    completed: false,
    createdAt: Date.now() - 14400000
  },
  {
    id: 'n5',
    text: 'Revisar apuntes de clase y resumen de economía',
    color: 'purple',
    urgency: 'normal',
    triggerType: 'none',
    triggerLabel: '🟢 Sin alarma estricta',
    hasAudio: true,
    audioDuration: '0:14',
    completed: false,
    createdAt: Date.now() - 18000000
  }
];

let notes = [];
let currentFilter = 'all';
let selectedModalColor = 'yellow';
let selectedTriggerType = 'none';
let selectedTriggerLabel = 'Ninguna asignada';
let activeAudioNoteId = null;
let audioInterval = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  renderBoard();
  startClockUpdater();
});

// Cargar o Inicializar
function loadNotes() {
  const saved = localStorage.getItem('postylocal_notes');
  if (saved) {
    try {
      notes = JSON.parse(saved);
    } catch (e) {
      notes = [...DEFAULT_NOTES];
    }
  } else {
    notes = [...DEFAULT_NOTES];
    saveToStorage();
  }
}

function saveToStorage() {
  localStorage.setItem('postylocal_notes', JSON.stringify(notes));
}

// Renderizado del Tablero
function renderBoard() {
  const gridUrgent = document.getElementById('gridUrgent');
  const gridContext = document.getElementById('gridContext');
  const gridNormal = document.getElementById('gridNormal');

  gridUrgent.innerHTML = '';
  gridContext.innerHTML = '';
  gridNormal.innerHTML = '';

  const filtered = notes.filter(n => {
    if (currentFilter === 'all') return true;
    return n.urgency === currentFilter;
  });

  let urgentCount = 0;
  let contextCount = 0;
  let normalCount = 0;

  filtered.forEach(note => {
    const card = createNoteCardElement(note);
    if (note.urgency === 'urgent') {
      gridUrgent.appendChild(card);
      urgentCount++;
    } else if (note.urgency === 'context') {
      gridContext.appendChild(card);
      contextCount++;
    } else {
      gridNormal.appendChild(card);
      normalCount++;
    }
  });

  // Ocultar o mostrar secciones según filtro
  document.getElementById('sectionUrgent').style.display = (currentFilter === 'all' || currentFilter === 'urgent') ? 'flex' : 'none';
  document.getElementById('sectionContext').style.display = (currentFilter === 'all' || currentFilter === 'context') ? 'flex' : 'none';
  document.getElementById('sectionNormal').style.display = (currentFilter === 'all' || currentFilter === 'normal') ? 'flex' : 'none';

  // Actualizar subtítulo
  const activeCount = notes.filter(n => !n.completed).length;
  const urgentActive = notes.filter(n => n.urgency === 'urgent' && !n.completed).length;
  document.getElementById('urgentSummaryText').textContent = `${activeCount} actividades pendientes • ${urgentActive} urgente`;
}

// Crear Elemento HTML de Nota
function createNoteCardElement(note) {
  const card = document.createElement('div');
  card.className = `postit-card ${note.color} ${note.completed ? 'completed' : ''}`;
  card.id = `card-${note.id}`;

  let audioSection = '';
  if (note.hasAudio) {
    audioSection = `
      <div class="mini-audio-player">
        <button class="audio-play-btn" id="playbtn-${note.id}" onclick="playNoteAudio('${note.id}')" title="Escuchar audio original">▶️</button>
        <div class="audio-track">
          <div class="audio-progress-bar">
            <div class="audio-progress-fill" id="prog-${note.id}"></div>
          </div>
          <span class="audio-time-label" id="time-${note.id}">Audio original • ${note.audioDuration}</span>
        </div>
        <span class="audio-badge">Voz</span>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="postit-top-row">
      <div class="postit-text">${escapeHtml(note.text)}</div>
      <button class="btn-check-done" onclick="toggleCompleteNote('${note.id}')" title="Marcar como cumplida">
        ${note.completed ? '✓' : '○'}
      </button>
    </div>
    ${audioSection}
    <div class="postit-footer">
      <span class="alarm-pill">${escapeHtml(note.triggerLabel)}</span>
      <span style="opacity: 0.6; font-size: 11px;">#${note.id}</span>
    </div>
  `;

  return card;
}

// Reproducción de Audio Sintético/Simulado (Web Speech / Beep Tone)
function playNoteAudio(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  const btn = document.getElementById(`playbtn-${noteId}`);
  const prog = document.getElementById(`prog-${noteId}`);
  const timeLabel = document.getElementById(`time-${noteId}`);

  if (activeAudioNoteId === noteId) {
    // Detener reproducción
    stopAudio();
    return;
  }

  stopAudio();
  activeAudioNoteId = noteId;
  btn.textContent = '⏸️';

  let progress = 0;
  const durationSec = parseInt(note.audioDuration.split(':')[1]) || 8;
  const intervalStep = 100;
  const totalSteps = (durationSec * 1000) / intervalStep;

  // Si el navegador soporta SpeechSynthesis, reproducir la nota con voz real
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(note.text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.onend = () => stopAudio();
    window.speechSynthesis.speak(utterance);
  }

  audioInterval = setInterval(() => {
    progress++;
    const percent = Math.min(100, (progress / totalSteps) * 100);
    if (prog) prog.style.width = `${percent}%`;
    const curSec = Math.floor((progress * intervalStep) / 1000);
    if (timeLabel) timeLabel.textContent = `Reproduciendo... 0:0${curSec} / ${note.audioDuration}`;

    if (progress >= totalSteps) {
      stopAudio();
    }
  }, intervalStep);
}

function stopAudio() {
  if (audioInterval) {
    clearInterval(audioInterval);
    audioInterval = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (activeAudioNoteId) {
    const btn = document.getElementById(`playbtn-${activeAudioNoteId}`);
    const prog = document.getElementById(`prog-${activeAudioNoteId}`);
    const note = notes.find(n => n.id === activeAudioNoteId);
    if (btn) btn.textContent = '▶️';
    if (prog) prog.style.width = '0%';
    if (note) {
      const timeLabel = document.getElementById(`time-${activeAudioNoteId}`);
      if (timeLabel) timeLabel.textContent = `Audio original • ${note.audioDuration}`;
    }
    activeAudioNoteId = null;
  }
}

// Completar Nota
function toggleCompleteNote(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (note) {
    note.completed = !note.completed;
    saveToStorage();
    renderBoard();
  }
}

// Filtros
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  const chipMap = {
    all: 0,
    urgent: 1,
    context: 2,
    normal: 3
  };
  const chips = document.querySelectorAll('.filter-chip');
  if (chips[chipMap[filter]]) chips[chipMap[filter]].classList.add('active');
  renderBoard();
}

// Modal de Creación
function openNewNoteModal(mode) {
  const modal = document.getElementById('newNoteModal');
  const voiceBox = document.getElementById('voiceRecordingBox');
  const audioPreview = document.getElementById('audioPreviewPlayer');
  const modalTitle = document.getElementById('modalTitle');
  const textInput = document.getElementById('noteTextInput');

  modal.classList.remove('hidden');
  resetModalForm();

  if (mode === 'voice') {
    modalTitle.textContent = '🎙️ Dictado por Voz (Transcripción)';
    voiceBox.style.display = 'flex';
    audioPreview.style.display = 'flex';
    simulateSpeechRecognition();
  } else {
    modalTitle.textContent = '✏️ Nueva Nota Manual';
    voiceBox.style.display = 'none';
    audioPreview.style.display = 'none';
    textInput.placeholder = 'Escriba su nota aquí...';
    textInput.focus();
  }
}

function simulateSpeechRecognition() {
  const textInput = document.getElementById('noteTextInput');
  const timer = document.getElementById('recordingTimer');
  textInput.value = '';
  
  const sampleVoicePhrases = [
    { text: 'Comprar pan dulce y café en 15 minutos', delta: 15, type: 'time', label: '⏰ En 15 min' },
    { text: 'Revisar cerradura y apagar luces al salir de casa', delta: null, type: 'geo', label: '🏠 Al salir de casa' },
    { text: 'Comprar detergente y toallas cuando esté cerca del súper', delta: null, type: 'geo', label: '🛒 Cerca del súper' }
  ];

  const pick = sampleVoicePhrases[Math.floor(Math.random() * sampleVoicePhrases.length)];

  let sec = 1;
  const intv = setInterval(() => {
    sec++;
    timer.textContent = `0:0${sec}`;
    if (sec >= 4) {
      clearInterval(intv);
      textInput.value = pick.text;
      if (pick.type === 'time') {
        setPresetTime(pick.delta);
      } else {
        setPresetGeo(pick.label);
      }
    }
  }, 700);
}

function resetModalForm() {
  document.getElementById('noteTextInput').value = '';
  selectColor('yellow');
  selectedTriggerType = 'none';
  selectedTriggerLabel = 'Ninguna asignada';
  document.getElementById('selectedTriggerText').textContent = 'Alerta: Ninguna asignada';
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
}

function closeModal() {
  document.getElementById('newNoteModal').classList.add('hidden');
  stopAudio();
}

function selectColor(color) {
  selectedModalColor = color;
  const preview = document.getElementById('postitCardPreview');
  preview.className = `postit-preview ${color}`;

  document.querySelectorAll('.color-opt').forEach(opt => opt.classList.remove('active'));
  const activeOpt = document.querySelector(`.opt-${color}`);
  if (activeOpt) activeOpt.classList.add('active');
}

function setPresetTime(minutes, btnElement) {
  selectedTriggerType = 'time';
  selectedTriggerLabel = `⏰ En ${minutes} min`;
  document.getElementById('selectedTriggerText').textContent = `Alerta programada: ${selectedTriggerLabel}`;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
}

function setPresetTodayTime(timeStr, btnElement) {
  selectedTriggerType = 'time';
  selectedTriggerLabel = `⏰ Hoy ${timeStr}`;
  document.getElementById('selectedTriggerText').textContent = `Alerta programada: ${selectedTriggerLabel}`;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
}

function setPresetGeo(geoLabel, btnElement) {
  selectedTriggerType = 'geo';
  selectedTriggerLabel = `📍 ${geoLabel}`;
  document.getElementById('selectedTriggerText').textContent = `Alerta de Ubicación: ${geoLabel}`;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
}

function saveNoteFromModal() {
  const text = document.getElementById('noteTextInput').value.trim();
  if (!text) {
    alert('Por favor ingrese o dicte el contenido de la nota.');
    return;
  }

  const voiceBox = document.getElementById('voiceRecordingBox');
  const isVoice = voiceBox.style.display !== 'none';

  let urgency = 'normal';
  if (selectedTriggerType === 'time') {
    urgency = 'urgent';
  } else if (selectedTriggerType === 'geo') {
    urgency = 'context';
  }

  const newNote = {
    id: 'n' + (Date.now() % 10000),
    text: text,
    color: selectedModalColor,
    urgency: urgency,
    triggerType: selectedTriggerType,
    triggerLabel: selectedTriggerLabel === 'Ninguna asignada' ? '🟢 Sin alarma' : selectedTriggerLabel,
    hasAudio: isVoice,
    audioDuration: isVoice ? '0:07' : null,
    completed: false,
    createdAt: Date.now()
  };

  notes.unshift(newNote);
  saveToStorage();
  renderBoard();
  closeModal();

  // Simular confirmación rápida con push opcional
  if (selectedTriggerType !== 'none') {
    setTimeout(() => {
      triggerPushBanner(newNote.triggerLabel, newNote.text);
    }, 1500);
  }
}

// MODO PROTECTOR DE PANTALLA (Screensaver / AOD)
function openScreensaver() {
  const overlay = document.getElementById('screensaverOverlay');
  overlay.classList.remove('hidden');
  updateAodClock();
}

function closeScreensaver() {
  document.getElementById('screensaverOverlay').classList.add('hidden');
}

function updateAodClock() {
  const clock = document.getElementById('aodClock');
  const now = new Date();
  const hrs = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  if (clock) clock.textContent = `${hrs}:${mins}`;
}

function startClockUpdater() {
  setInterval(updateAodClock, 10000);
}

// NOTIFICACIÓN PUSH NATIVA (Simulación)
function triggerPushBanner(title, body) {
  const banner = document.getElementById('pushNotificationBanner');
  document.getElementById('pushTitle').textContent = title || '⏰ Recordatorio';
  document.getElementById('pushBody').textContent = body || 'Tiene un recordatorio pendiente por cumplirse.';
  banner.classList.remove('hidden');

  // Sonido de alerta sutil usando AudioContext
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

function dismissPush() {
  document.getElementById('pushNotificationBanner').classList.add('hidden');
}

function completeFromPush() {
  dismissPush();
  // Completar la primera nota urgente activa
  const firstUrgent = notes.find(n => n.urgency === 'urgent' && !n.completed);
  if (firstUrgent) {
    firstUrgent.completed = true;
    saveToStorage();
    renderBoard();
  }
}

function snoozeFromPush() {
  dismissPush();
  alert('⏱️ Recordatorio pospuesto por 15 minutos.');
}

function simulatePushTrigger() {
  triggerPushBanner('🛒 Cerca del Supermercado (150m)', 'Comprar leche descremada y fruta fresca.');
}

// Configuración & Geocercas
function openSettings() {
  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function updateGeoCoord(place) {
  alert(`📍 Coordenadas de '${place}' actualizadas con la ubicación GPS del móvil (precisión ±8m).`);
}

function exportDataJSON() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', dataStr);
  dlAnchor.setAttribute('download', `postylocal_respaldo_${Date.now()}.json`);
  dlAnchor.click();
}

function resetDemoData() {
  if (confirm('¿Desea restaurar las notas de demostración iniciales?')) {
    notes = [...DEFAULT_NOTES];
    saveToStorage();
    renderBoard();
    closeSettings();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}
