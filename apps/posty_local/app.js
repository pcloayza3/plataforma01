// app.js • PostyLocal Interactive Mobile Logic
// Stand-Alone Embebido • Cero Servidores • 100% Local-First

// Estado en memoria y datos iniciales de notas
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

// Presets dinámicos con contador de frecuencia de uso (más utilizados en primer plano)
const DEFAULT_TIME_PRESETS = [
  { id: 't15', label: '+15 min', minutes: 15, uses: 20 },
  { id: 't30', label: '+30 min', minutes: 30, uses: 15 },
  { id: 't60', label: '+1 hora', minutes: 60, uses: 12 },
  { id: 't120', label: '+2 horas', minutes: 120, uses: 9 },
  { id: 't18', label: 'Hoy 18:00', timeStr: '18:00', uses: 7 },
  { id: 't20', label: 'Hoy 20:00', timeStr: '20:00', uses: 5 },
  { id: 't_m9', label: 'Mañana 09:00', timeStr: '09:00', uses: 3 }
];

const DEFAULT_GEO_PRESETS = [
  { id: 'g_casa', label: '🏠 Al salir de casa', place: 'Casa', transition: 'EXIT', uses: 25 },
  { id: 'g_super', label: '🛒 Cerca del súper', place: 'Supermercado', transition: 'ENTER', uses: 18 },
  { id: 'g_trabajo', label: '🏢 En el trabajo', place: 'Trabajo', transition: 'ENTER', uses: 14 },
  { id: 'g_farmacia', label: '💊 Cerca de la farmacia', place: 'Farmacia', transition: 'ENTER', uses: 8 },
  { id: 'g_gym', label: '🏋️ Al llegar al gym', place: 'Gimnasio', transition: 'ENTER', uses: 4 },
  { id: 'g_banco', label: '🏦 Cerca del banco', place: 'Banco', transition: 'ENTER', uses: 2 }
];

let notes = [];
let timePresets = [];
let geoPresets = [];

let currentFilter = 'all';
let selectedModalColor = 'yellow';
let selectedTriggerType = 'none';
let selectedTriggerLabel = 'Ninguna asignada';
let activeAudioNoteId = null;
let audioInterval = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  loadPresets();
  renderBoard();
  renderTriggerPresets();
  startClockUpdater();
});

// Cargar o Inicializar Notas
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

// Cargar Presets de Alertas Dinámicas
function loadPresets() {
  const savedTime = localStorage.getItem('postylocal_time_presets');
  timePresets = savedTime ? JSON.parse(savedTime) : [...DEFAULT_TIME_PRESETS];

  const savedGeo = localStorage.getItem('postylocal_geo_presets');
  geoPresets = savedGeo ? JSON.parse(savedGeo) : [...DEFAULT_GEO_PRESETS];
}

function savePresets() {
  localStorage.setItem('postylocal_time_presets', JSON.stringify(timePresets));
  localStorage.setItem('postylocal_geo_presets', JSON.stringify(geoPresets));
}

// Renderizado de Presets con Prioridad a los Más Utilizados
function renderTriggerPresets() {
  const primaryTimeBox = document.getElementById('primaryTimePresets');
  const secondaryTimeBox = document.getElementById('secondaryTimePresets');
  const primaryGeoBox = document.getElementById('primaryGeoPresets');
  const secondaryGeoBox = document.getElementById('secondaryGeoPresets');

  if (!primaryTimeBox || !primaryGeoBox) return;

  primaryTimeBox.innerHTML = '';
  secondaryTimeBox.innerHTML = '';
  primaryGeoBox.innerHTML = '';
  secondaryGeoBox.innerHTML = '';

  // Ordenar por uso descendente
  const sortedTimes = [...timePresets].sort((a, b) => b.uses - a.uses);
  const sortedGeos = [...geoPresets].sort((a, b) => b.uses - a.uses);

  // Primer término: 3 o 4 más utilizados. El resto como segunda opción
  const mainTimes = sortedTimes.slice(0, 4);
  const extraTimes = sortedTimes.slice(4);

  mainTimes.forEach(p => {
    primaryTimeBox.appendChild(createTimePresetButton(p));
  });
  extraTimes.forEach(p => {
    secondaryTimeBox.appendChild(createTimePresetButton(p));
  });

  // Ocultar botón "Ver más" si no hay extras
  const btnToggleMoreTime = document.getElementById('btnToggleMoreTime');
  if (btnToggleMoreTime) {
    btnToggleMoreTime.style.display = extraTimes.length > 0 ? 'inline-flex' : 'none';
  }

  // Lugares: Primer término: 3 más utilizados
  const mainGeos = sortedGeos.slice(0, 3);
  const extraGeos = sortedGeos.slice(3);

  mainGeos.forEach(g => {
    primaryGeoBox.appendChild(createGeoPresetButton(g));
  });
  extraGeos.forEach(g => {
    secondaryGeoBox.appendChild(createGeoPresetButton(g));
  });

  const btnToggleMoreGeo = document.getElementById('btnToggleMoreGeo');
  if (btnToggleMoreGeo) {
    btnToggleMoreGeo.style.display = extraGeos.length > 0 ? 'inline-flex' : 'none';
  }
}

function createTimePresetButton(p) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'preset-btn';
  btn.textContent = p.label;
  btn.onclick = () => selectTimePreset(p, btn);
  return btn;
}

function createGeoPresetButton(g) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'preset-btn geo-btn';
  btn.textContent = g.label;
  btn.onclick = () => selectGeoPreset(g, btn);
  return btn;
}

// Selección de Presets con Aumento de Frecuencia de Uso
function selectTimePreset(preset, btnElement) {
  selectedTriggerType = 'time';
  selectedTriggerLabel = `⏰ ${preset.label}`;
  preset.uses = (preset.uses || 0) + 1;
  savePresets();

  document.getElementById('selectedTriggerText').textContent = `Alerta programada: ${selectedTriggerLabel}`;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
}

function selectGeoPreset(preset, btnElement) {
  selectedTriggerType = 'geo';
  selectedTriggerLabel = `📍 ${preset.label}`;
  preset.uses = (preset.uses || 0) + 1;
  savePresets();

  document.getElementById('selectedTriggerText').textContent = `Alerta de Ubicación: ${preset.label}`;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
}

// Alternar Secciones Secundarias ("Ver más")
function toggleMoreTimePresets() {
  const box = document.getElementById('secondaryTimePresets');
  const btn = document.getElementById('btnToggleMoreTime');
  box.classList.toggle('hidden');
  const isHidden = box.classList.contains('hidden');
  btn.querySelector('span:first-child').textContent = isHidden ? 'Ver más horarios' : 'Ocultar horarios';
  btn.querySelector('.arrow-icon').textContent = isHidden ? '▼' : '▲';
}

function toggleMoreGeoPresets() {
  const box = document.getElementById('secondaryGeoPresets');
  const btn = document.getElementById('btnToggleMoreGeo');
  box.classList.toggle('hidden');
  const isHidden = box.classList.contains('hidden');
  btn.querySelector('span:first-child').textContent = isHidden ? 'Ver más lugares' : 'Ocultar lugares';
  btn.querySelector('.arrow-icon').textContent = isHidden ? '▼' : '▲';
}

// Adición Sencilla de Más Tiempos de Alerta
function promptCustomTime() {
  const val = prompt('Indique el tiempo para la alerta:\nEjemplo: "45 min", "3 horas", "Hoy 19:30", "Mañana 08:00":');
  if (!val || !val.trim()) return;

  const clean = val.trim();
  const newPreset = {
    id: 't_custom_' + Date.now(),
    label: clean.startsWith('+') ? clean : (clean.includes(':') ? clean : `+${clean}`),
    uses: 30 // Prioridad alta inmediata por ser creado por el usuario
  };

  timePresets.push(newPreset);
  savePresets();
  renderTriggerPresets();

  // Seleccionar automáticamente el nuevo preset
  selectedTriggerType = 'time';
  selectedTriggerLabel = `⏰ ${newPreset.label}`;
  document.getElementById('selectedTriggerText').textContent = `Alerta programada: ${selectedTriggerLabel}`;
}

// Adición Sencilla de Nuevos Lugares de Ubicación
function promptCustomLocation() {
  const placeName = prompt('Ingrese el nombre del nuevo lugar para la alerta:\nEjemplo: Farmacia, Colegio, Gimnasio, Banco:');
  if (!placeName || !placeName.trim()) return;

  const clean = placeName.trim();
  const icon = clean.toLowerCase().includes('farmacia') ? '💊' :
               clean.toLowerCase().includes('gym') || clean.toLowerCase().includes('gimnasio') ? '🏋️' :
               clean.toLowerCase().includes('colegio') || clean.toLowerCase().includes('escuela') ? '🏫' :
               clean.toLowerCase().includes('banco') ? '🏦' : '📍';

  const newGeo = {
    id: 'g_custom_' + Date.now(),
    label: `${icon} Cerca de ${clean}`,
    place: clean,
    transition: 'ENTER',
    uses: 35 // Prioridad alta inmediata
  };

  geoPresets.push(newGeo);
  savePresets();
  renderTriggerPresets();

  // Seleccionar automáticamente el nuevo lugar
  selectedTriggerType = 'geo';
  selectedTriggerLabel = `📍 ${newGeo.label}`;
  document.getElementById('selectedTriggerText').textContent = `Alerta de Ubicación: ${newGeo.label}`;
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

  filtered.forEach(note => {
    const card = createNoteCardElement(note);
    if (note.urgency === 'urgent') {
      gridUrgent.appendChild(card);
    } else if (note.urgency === 'context') {
      gridContext.appendChild(card);
    } else {
      gridNormal.appendChild(card);
    }
  });

  document.getElementById('sectionUrgent').style.display = (currentFilter === 'all' || currentFilter === 'urgent') ? 'flex' : 'none';
  document.getElementById('sectionContext').style.display = (currentFilter === 'all' || currentFilter === 'context') ? 'flex' : 'none';
  document.getElementById('sectionNormal').style.display = (currentFilter === 'all' || currentFilter === 'normal') ? 'flex' : 'none';

  const activeCount = notes.filter(n => !n.completed).length;
  const urgentActive = notes.filter(n => n.urgency === 'urgent' && !n.completed).length;
  document.getElementById('urgentSummaryText').textContent = `${activeCount} actividades pendientes • ${urgentActive} urgente`;
}

// Crear Elemento HTML de Nota con Selector de Color Inmediato
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
      <div class="card-color-strip" title="Cambiar color de toda la nota de forma inmediata">
        <span class="card-dot-opt opt-yellow" onclick="changeCardColor('${note.id}', 'yellow')"></span>
        <span class="card-dot-opt opt-green" onclick="changeCardColor('${note.id}', 'green')"></span>
        <span class="card-dot-opt opt-blue" onclick="changeCardColor('${note.id}', 'blue')"></span>
        <span class="card-dot-opt opt-pink" onclick="changeCardColor('${note.id}', 'pink')"></span>
        <span class="card-dot-opt opt-purple" onclick="changeCardColor('${note.id}', 'purple')"></span>
      </div>
      <span class="alarm-pill">${escapeHtml(note.triggerLabel)}</span>
    </div>
  `;

  return card;
}

// CAMBIO INMEDIATO DE COLOR DE TODA LA NOTA (En el Tablero)
function changeCardColor(noteId, newColor) {
  const note = notes.find(n => n.id === noteId);
  if (note) {
    note.color = newColor;
    saveToStorage();

    // Actualizar inmediatamente las clases de la tarjeta en el DOM sin recargar
    const card = document.getElementById(`card-${noteId}`);
    if (card) {
      card.className = `postit-card ${newColor} ${note.completed ? 'completed' : ''}`;
    }
  }
}

// CAMBIO INMEDIATO DE COLOR EN EL MODAL DE CREACIÓN
function selectColor(color) {
  selectedModalColor = color;
  const preview = document.getElementById('postitCardPreview');
  // Aplica inmediatamente el color al 100% de la tarjeta de previsualización
  preview.className = `postit-preview ${color}`;

  document.querySelectorAll('.color-opt').forEach(opt => opt.classList.remove('active'));
  const activeOpt = document.querySelector(`.opt-${color}`);
  if (activeOpt) activeOpt.classList.add('active');
}

// Reproducción de Audio
function playNoteAudio(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  const btn = document.getElementById(`playbtn-${noteId}`);
  const prog = document.getElementById(`prog-${noteId}`);
  const timeLabel = document.getElementById(`time-${noteId}`);

  if (activeAudioNoteId === noteId) {
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
  const chipMap = { all: 0, urgent: 1, context: 2, normal: 3 };
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
  renderTriggerPresets();

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
    { text: 'Comprar pan dulce y café en 15 minutos', label: '+15 min', type: 'time' },
    { text: 'Revisar cerradura y apagar luces al salir de casa', label: '🏠 Al salir de casa', type: 'geo' },
    { text: 'Comprar detergente y toallas cuando esté cerca del súper', label: '🛒 Cerca del súper', type: 'geo' }
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
        const found = timePresets.find(t => t.label === pick.label);
        if (found) selectTimePreset(found);
      } else {
        const foundGeo = geoPresets.find(g => g.label === pick.label);
        if (foundGeo) selectGeoPreset(foundGeo);
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

  // Asegurar que las secciones secundarias estén cerradas inicialmente
  const secTime = document.getElementById('secondaryTimePresets');
  if (secTime) secTime.classList.add('hidden');
  const secGeo = document.getElementById('secondaryGeoPresets');
  if (secGeo) secGeo.classList.add('hidden');
}

function closeModal() {
  document.getElementById('newNoteModal').classList.add('hidden');
  stopAudio();
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

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
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
