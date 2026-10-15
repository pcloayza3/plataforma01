// app.js • PostyLocal Interactive Mobile Logic
// Stand-Alone Embebido • Cero Servidores • 100% Local-First
// Soporte de Edición, Listas de hasta 5 líneas con audio, Transición de 1s a Realizadas y Dictado por voz de alertas

// Datos iniciales de demostración con líneas estructuradas
const DEFAULT_NOTES = [
  {
    id: 'n1',
    color: 'yellow',
    urgency: 'urgent',
    triggerType: 'time',
    triggerLabel: '⏰ Vence Hoy 18:00',
    completed: false,
    completedAt: null,
    createdAt: Date.now() - 3600000,
    lines: [
      { id: 'n1-l1', text: 'Pagar factura de luz antes de las 18:00', completed: false, hasAudio: true, audioDuration: '0:12' },
      { id: 'n1-l2', text: 'Descargar comprobante en PDF', completed: false, hasAudio: false, audioDuration: null }
    ]
  },
  {
    id: 'n2',
    color: 'pink',
    urgency: 'context',
    triggerType: 'geo',
    triggerLabel: '🏠 Al salir de casa (150m)',
    completed: false,
    completedAt: null,
    createdAt: Date.now() - 7200000,
    lines: [
      { id: 'n2-l1', text: 'Cerrar la llave de paso de gas', completed: false, hasAudio: true, audioDuration: '0:07' },
      { id: 'n2-l2', text: 'Desconectar cargadores de pared', completed: false, hasAudio: false, audioDuration: null }
    ]
  },
  {
    id: 'n3',
    color: 'green',
    urgency: 'context',
    triggerType: 'geo',
    triggerLabel: '🛒 Cerca del supermercado',
    completed: false,
    completedAt: null,
    createdAt: Date.now() - 10800000,
    lines: [
      { id: 'n3-l1', text: 'Comprar leche descremada', completed: false, hasAudio: false, audioDuration: null },
      { id: 'n3-l2', text: 'Manzanas verdes y plátanos', completed: false, hasAudio: true, audioDuration: '0:09' },
      { id: 'n3-l3', text: 'Avena en grano sin azúcar', completed: false, hasAudio: false, audioDuration: null }
    ]
  },
  {
    id: 'n4',
    color: 'blue',
    urgency: 'normal',
    triggerType: 'none',
    triggerLabel: '🟢 Sin alarma estricta',
    completed: false,
    completedAt: null,
    createdAt: Date.now() - 14400000,
    lines: [
      { id: 'n4-l1', text: 'Llamar a carpintero para repisa de libros', completed: false, hasAudio: false, audioDuration: null }
    ]
  },
  {
    id: 'n5',
    color: 'purple',
    urgency: 'normal',
    triggerType: 'none',
    triggerLabel: '🟢 Sin alarma estricta',
    completed: false,
    completedAt: null,
    createdAt: Date.now() - 18000000,
    lines: [
      { id: 'n5-l1', text: 'Revisar apuntes de economía', completed: false, hasAudio: true, audioDuration: '0:14' }
    ]
  }
];

// Presets dinámicos con frecuencia de uso (más utilizados en primer plano)
const DEFAULT_TIME_PRESETS = [
  { id: 't15', label: '+15 min', minutes: 15, uses: 22 },
  { id: 't30', label: '+30 min', minutes: 30, uses: 16 },
  { id: 't60', label: '+1 hora', minutes: 60, uses: 13 },
  { id: 't120', label: '+2 horas', minutes: 120, uses: 9 },
  { id: 't_hoy18', label: 'Hoy 18:00', timeStr: '18:00', isToday: true, uses: 8 },
  { id: 't_manana', label: 'Mañana 09:00', timeStr: '09:00', isTomorrow: true, uses: 7 },
  { id: 't_sig_semana', label: 'Siguiente Semana', isNextWeek: true, uses: 6 }
];

const DEFAULT_GEO_PRESETS = [
  { id: 'g_casa', label: '🏠 Al salir de casa', place: 'Casa', transition: 'EXIT', uses: 28 },
  { id: 'g_super', label: '🛒 Cerca del súper', place: 'Supermercado', transition: 'ENTER', uses: 20 },
  { id: 'g_trabajo', label: '🏢 En el trabajo', place: 'Trabajo', transition: 'ENTER', uses: 15 },
  { id: 'g_farmacia', label: '💊 Cerca de la farmacia', place: 'Farmacia', transition: 'ENTER', uses: 9 },
  { id: 'g_gym', label: '🏋️ Al llegar al gym', place: 'Gimnasio', transition: 'ENTER', uses: 5 },
  { id: 'g_banco', label: '🏦 Cerca del banco', place: 'Banco', transition: 'ENTER', uses: 2 }
];

let notes = [];
let timePresets = [];
let geoPresets = [];

let currentFilter = 'all';
let selectedModalColor = 'yellow';
let selectedTriggerType = 'none';
let selectedTriggerLabel = 'Ninguna asignada';
let editingNoteId = null; // null si es nueva, string si se está editando
let modalLines = []; // Líneas en el modal (máx 5)

let activeAudioId = null;
let audioInterval = null;
let currentVoicePromptType = 'time'; // 'time' o 'geo'

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  loadPresets();
  renderBoard();
  renderTriggerPresets();
  startClockUpdater();
});

// Cargar o Inicializar
function loadNotes() {
  const saved = localStorage.getItem('postylocal_notes');
  if (saved) {
    try {
      notes = JSON.parse(saved);
    } catch (e) {
      notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
    }
  } else {
    notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
    saveToStorage();
  }
}

function saveToStorage() {
  localStorage.setItem('postylocal_notes', JSON.stringify(notes));
}

function loadPresets() {
  const savedTime = localStorage.getItem('postylocal_time_presets');
  timePresets = savedTime ? JSON.parse(savedTime) : JSON.parse(JSON.stringify(DEFAULT_TIME_PRESETS));

  const savedGeo = localStorage.getItem('postylocal_geo_presets');
  geoPresets = savedGeo ? JSON.parse(savedGeo) : JSON.parse(JSON.stringify(DEFAULT_GEO_PRESETS));
}

function savePresets() {
  localStorage.setItem('postylocal_time_presets', JSON.stringify(timePresets));
  localStorage.setItem('postylocal_geo_presets', JSON.stringify(geoPresets));
}

// Clasificador de Urgencia (Mañana y Siguiente Semana son PRÓXIMAS / AMARILLO)
function classifyUrgency(triggerType, presetObj) {
  if (triggerType === 'geo') {
    return 'context'; // Amarillo
  }
  if (triggerType === 'time') {
    if (presetObj && (presetObj.isTomorrow || presetObj.isNextWeek || (presetObj.label && (presetObj.label.includes('Mañana') || presetObj.label.includes('Semana'))))) {
      return 'context'; // Amarillo (Próxima)
    }
    return 'urgent'; // Rojo (Hoy / en minutos)
  }
  return 'normal'; // Verde
}

// Renderizado de Presets Dinámicos con prioridad a los más usados
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

  const sortedTimes = [...timePresets].sort((a, b) => b.uses - a.uses);
  const sortedGeos = [...geoPresets].sort((a, b) => b.uses - a.uses);

  const mainTimes = sortedTimes.slice(0, 4);
  const extraTimes = sortedTimes.slice(4);

  mainTimes.forEach(p => primaryTimeBox.appendChild(createPresetButton(p, 'time')));
  extraTimes.forEach(p => secondaryTimeBox.appendChild(createPresetButton(p, 'time')));

  const btnToggleMoreTime = document.getElementById('btnToggleMoreTime');
  if (btnToggleMoreTime) {
    btnToggleMoreTime.style.display = extraTimes.length > 0 ? 'inline-flex' : 'none';
  }

  const mainGeos = sortedGeos.slice(0, 3);
  const extraGeos = sortedGeos.slice(3);

  mainGeos.forEach(g => primaryGeoBox.appendChild(createPresetButton(g, 'geo')));
  extraGeos.forEach(g => secondaryGeoBox.appendChild(createPresetButton(g, 'geo')));

  const btnToggleMoreGeo = document.getElementById('btnToggleMoreGeo');
  if (btnToggleMoreGeo) {
    btnToggleMoreGeo.style.display = extraGeos.length > 0 ? 'inline-flex' : 'none';
  }
}

function createPresetButton(item, type) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `preset-btn ${type === 'geo' ? 'geo-btn' : ''}`;
  btn.textContent = item.label;
  btn.onclick = () => {
    if (type === 'time') selectTimePreset(item, btn);
    else selectGeoPreset(item, btn);
  };
  return btn;
}

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

// Modal de Dictado / Texto para Crear Otro Tiempo o Lugar
function openVoicePromptModal(type) {
  currentVoicePromptType = type;
  const modal = document.getElementById('voicePromptModal');
  const title = document.getElementById('voicePromptTitle');
  const hint = document.getElementById('voicePromptHint');
  const inputLabel = document.getElementById('voicePromptInputLabel');
  const input = document.getElementById('voicePromptTextInput');

  input.value = '';
  modal.classList.remove('hidden');

  if (type === 'time') {
    title.textContent = '⏰ Agregar Horario por Voz';
    hint.textContent = 'Dicte el tiempo (ej: "45 minutos", "3 horas", "mañana a las diez")';
    inputLabel.textContent = 'O escriba el tiempo directamente:';
    input.placeholder = 'Ej: +45 min, Mañana 10:00';
  } else {
    title.textContent = '📍 Agregar Nuevo Lugar por Voz';
    hint.textContent = 'Dicte el nombre del sitio (ej: "Farmacia", "Colegio", "Gimnasio")';
    inputLabel.textContent = 'O escriba el nombre del lugar:';
    input.placeholder = 'Ej: Farmacia Central, Colegio San Martín';
  }
}

function closeVoicePromptModal() {
  document.getElementById('voicePromptModal').classList.add('hidden');
}

function triggerVoicePromptDictation() {
  const input = document.getElementById('voicePromptTextInput');
  const caption = document.getElementById('promptMicCaption');
  caption.textContent = 'ESCUCHANDO...';

  // Simulación fonética o reconocimiento real
  setTimeout(() => {
    if (currentVoicePromptType === 'time') {
      const times = ['+45 min', 'Mañana 10:00', 'Siguiente Lunes', '+3 horas'];
      input.value = times[Math.floor(Math.random() * times.length)];
    } else {
      const places = ['Farmacia San Lucas', 'Gimnasio Olimpo', 'Colegio Alemán', 'Banco Central'];
      input.value = places[Math.floor(Math.random() * places.length)];
    }
    caption.textContent = 'PULSAR PARA HABLAR';
  }, 1200);
}

function confirmVoicePrompt() {
  const input = document.getElementById('voicePromptTextInput');
  const val = input.value.trim();
  if (!val) {
    alert('Por favor dicte o escriba un valor.');
    return;
  }

  if (currentVoicePromptType === 'time') {
    const isTomorrow = val.toLowerCase().includes('mañana');
    const isNextWeek = val.toLowerCase().includes('semana') || val.toLowerCase().includes('lunes');
    const newPreset = {
      id: 't_c_' + Date.now(),
      label: val.startsWith('+') || val.includes(':') || isTomorrow || isNextWeek ? val : `+${val}`,
      isTomorrow: isTomorrow,
      isNextWeek: isNextWeek,
      uses: 35 // Alta prioridad
    };
    timePresets.push(newPreset);
    savePresets();
    renderTriggerPresets();
    selectTimePreset(newPreset);
  } else {
    const icon = val.toLowerCase().includes('farmacia') ? '💊' :
                 val.toLowerCase().includes('gym') || val.toLowerCase().includes('gimnasio') ? '🏋️' :
                 val.toLowerCase().includes('colegio') ? '🏫' :
                 val.toLowerCase().includes('banco') ? '🏦' : '📍';
    const newGeo = {
      id: 'g_c_' + Date.now(),
      label: `${icon} Cerca de ${val}`,
      place: val,
      transition: 'ENTER',
      uses: 40 // Alta prioridad
    };
    geoPresets.push(newGeo);
    savePresets();
    renderTriggerPresets();
    selectGeoPreset(newGeo);
  }

  closeVoicePromptModal();
}

// Renderizado del Tablero
function renderBoard() {
  const gridUrgent = document.getElementById('gridUrgent');
  const gridContext = document.getElementById('gridContext');
  const gridNormal = document.getElementById('gridNormal');
  const gridCompleted = document.getElementById('gridCompleted');

  gridUrgent.innerHTML = '';
  gridContext.innerHTML = '';
  gridNormal.innerHTML = '';
  gridCompleted.innerHTML = '';

  const activeNotes = notes.filter(n => !n.completed);
  const completedNotes = notes.filter(n => n.completed);

  // Renderizar Notas Activas
  activeNotes.forEach(note => {
    const card = createNoteCardElement(note, false);
    if (note.urgency === 'urgent') gridUrgent.appendChild(card);
    else if (note.urgency === 'context') gridContext.appendChild(card);
    else gridNormal.appendChild(card);
  });

  // Renderizar Notas Cumplidas (Solo lectura y escucha)
  completedNotes.forEach(note => {
    const card = createNoteCardElement(note, true);
    gridCompleted.appendChild(card);
  });

  // Filtrado de Secciones
  const showAll = currentFilter === 'all';
  document.getElementById('sectionUrgent').style.display = (showAll || currentFilter === 'urgent') ? 'flex' : 'none';
  document.getElementById('sectionContext').style.display = (showAll || currentFilter === 'context') ? 'flex' : 'none';
  document.getElementById('sectionNormal').style.display = (showAll || currentFilter === 'normal') ? 'flex' : 'none';
  document.getElementById('sectionCompleted').style.display = (currentFilter === 'completed') ? 'flex' : 'none';

  // Contadores en pestañas
  const urgentCount = activeNotes.filter(n => n.urgency === 'urgent').length;
  const contextCount = activeNotes.filter(n => n.urgency === 'context').length;
  const normalCount = activeNotes.filter(n => n.urgency === 'normal').length;

  document.getElementById('chipAll').textContent = `Todas (${activeNotes.length})`;
  document.getElementById('chipUrgent').textContent = `🔴 Urgente (${urgentCount})`;
  document.getElementById('chipContext').textContent = `🟡 Próximas (${contextCount})`;
  document.getElementById('chipNormal').textContent = `🟢 Libres (${normalCount})`;
  document.getElementById('chipDone').textContent = `✓ Realizadas (${completedNotes.length})`;

  document.getElementById('urgentSummaryText').textContent = `${activeNotes.length} actividades pendientes • ${urgentCount} urgente`;
}

// Crear Elemento HTML de Nota (Activa o Cumplida de Solo Lectura)
function createNoteCardElement(note, isCompletedView) {
  const card = document.createElement('div');
  card.className = `postit-card ${note.color} ${note.completed ? 'completed' : ''}`;
  card.id = `card-${note.id}`;

  // Checklist de líneas (hasta 5)
  let linesHtml = '<div class="postit-checklist">';
  if (note.lines && note.lines.length > 0) {
    note.lines.forEach(line => {
      const audioBtn = line.hasAudio ? `
        <button class="audio-play-btn" style="width: 22px; height: 22px; font-size: 10px;" onclick="playAudioClip('${line.id}', '${escapeHtml(line.text)}', '${line.audioDuration}')" title="Escuchar audio">▶️</button>
      ` : '';

      const checkAttr = isCompletedView ? 'disabled checked' : (line.completed ? 'checked' : '');
      const clickHandler = isCompletedView ? '' : `onclick="toggleLineCheck('${note.id}', '${line.id}')"`;

      linesHtml += `
        <div class="checklist-item ${line.completed ? 'done' : ''}">
          <input type="checkbox" class="checklist-checkbox" ${checkAttr} ${clickHandler}>
          <span class="checklist-text">${escapeHtml(line.text)}</span>
          ${audioBtn}
        </div>
      `;
    });
  } else {
    linesHtml += `<div class="checklist-item"><span class="checklist-text">${escapeHtml(note.text || 'Sin texto')}</span></div>`;
  }
  linesHtml += '</div>';

  // Botones de Cabecera (Editar solo si no está completada)
  let topActions = '';
  if (!isCompletedView) {
    topActions = `
      <div style="display: flex; gap: 6px;">
        <button class="btn-card-action" onclick="openEditNoteModal('${note.id}')" title="Editar nota y lista">✏️</button>
        <button class="btn-card-action" onclick="completeNoteWithDelay('${note.id}')" title="Marcar toda la nota como cumplida">✓</button>
      </div>
    `;
  } else {
    topActions = `
      <span class="completed-badge-pill">✓ Realizada</span>
    `;
  }

  // Paleta de Color Inmediata (Solo en activas)
  let colorStrip = '';
  if (!isCompletedView) {
    colorStrip = `
      <div class="card-color-strip" title="Cambiar color de toda la nota inmediatamente">
        <span class="card-dot-opt opt-yellow" onclick="changeCardColor('${note.id}', 'yellow')"></span>
        <span class="card-dot-opt opt-green" onclick="changeCardColor('${note.id}', 'green')"></span>
        <span class="card-dot-opt opt-blue" onclick="changeCardColor('${note.id}', 'blue')"></span>
        <span class="card-dot-opt opt-pink" onclick="changeCardColor('${note.id}', 'pink')"></span>
        <span class="card-dot-opt opt-purple" onclick="changeCardColor('${note.id}', 'purple')"></span>
      </div>
    `;
  } else {
    colorStrip = `<span class="read-only-notice">Solo lectura y escucha</span>`;
  }

  card.innerHTML = `
    <div class="postit-top-row">
      <div style="flex: 1;">${linesHtml}</div>
      ${topActions}
    </div>
    <div class="postit-footer">
      ${colorStrip}
      <span class="alarm-pill">${escapeHtml(note.triggerLabel || '🟢 Sin alarma')}</span>
    </div>
  `;

  return card;
}

// 4. TRANSICIÓN DE 1 SEGUNDO HACIA TAREAS REALIZADAS
function completeNoteWithDelay(noteId) {
  const card = document.getElementById(`card-${noteId}`);
  if (card) {
    // 1. Mostrar visualmente la animación y tachado
    card.classList.add('task-completing');
    playSuccessChime();

    // 2. Esperar exactamente 1 segundo (1000ms)
    setTimeout(() => {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        note.completed = true;
        note.completedAt = new Date().toISOString();
        if (note.lines) {
          note.lines.forEach(l => l.completed = true);
        }
        saveToStorage();
        renderBoard();
      }
    }, 1000);
  }
}

function toggleLineCheck(noteId, lineId) {
  const note = notes.find(n => n.id === noteId);
  if (!note || note.completed) return;

  const line = note.lines.find(l => l.id === lineId);
  if (line) {
    line.completed = !line.completed;
    // Si todas las líneas se completaron, disparar la transición de 1 segundo
    if (note.lines.length > 0 && note.lines.every(l => l.completed)) {
      completeNoteWithDelay(noteId);
      return;
    }
    saveToStorage();
    renderBoard();
  }
}

// Sonido sutil de éxito al completar
function playSuccessChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

// Cambio Inmediato de Color
function changeCardColor(noteId, newColor) {
  const note = notes.find(n => n.id === noteId);
  if (note && !note.completed) {
    note.color = newColor;
    saveToStorage();
    const card = document.getElementById(`card-${noteId}`);
    if (card) {
      card.className = `postit-card ${newColor} ${note.completed ? 'completed' : ''}`;
    }
  }
}

function selectColor(color) {
  selectedModalColor = color;
  const preview = document.getElementById('postitCardPreview');
  preview.className = `postit-preview ${color}`;

  document.querySelectorAll('.color-opt').forEach(opt => opt.classList.remove('active'));
  const activeOpt = document.querySelector(`.opt-${color}`);
  if (activeOpt) activeOpt.classList.add('active');
}

// 1. EDICIÓN DE NOTAS Y GESTIÓN DE LÍNEAS (MÁXIMO 5 LÍNEAS)
function openNewNoteModal(mode) {
  editingNoteId = null;
  modalLines = [{ id: 'ml-1', text: '', completed: false, hasAudio: false, audioDuration: null }];
  const modal = document.getElementById('newNoteModal');
  const voiceBox = document.getElementById('voiceRecordingBox');
  const modalTitle = document.getElementById('modalTitle');

  modal.classList.remove('hidden');
  resetModalForm();
  renderModalLines();
  renderTriggerPresets();

  if (mode === 'voice') {
    modalTitle.textContent = '🎙️ Dictar Nota Rápida';
    voiceBox.style.display = 'flex';
    simulateSpeechRecognitionForModal();
  } else {
    modalTitle.textContent = '✏️ Nueva Nota (Lista)';
    voiceBox.style.display = 'none';
  }
}

function openEditNoteModal(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (!note || note.completed) return; // Solo lectura para completadas

  editingNoteId = noteId;
  modalLines = (note.lines && note.lines.length > 0)
    ? JSON.parse(JSON.stringify(note.lines))
    : [{ id: 'ml-1', text: note.text || '', completed: false, hasAudio: false, audioDuration: null }];

  const modal = document.getElementById('newNoteModal');
  const voiceBox = document.getElementById('voiceRecordingBox');
  const modalTitle = document.getElementById('modalTitle');

  modal.classList.remove('hidden');
  voiceBox.style.display = 'none';
  modalTitle.textContent = '✏️ Editar Nota y Lista';

  selectColor(note.color || 'yellow');
  selectedTriggerType = note.triggerType || 'none';
  selectedTriggerLabel = note.triggerLabel || 'Ninguna asignada';
  document.getElementById('selectedTriggerText').textContent = `Alerta: ${selectedTriggerLabel}`;

  renderModalLines();
  renderTriggerPresets();
}

function renderModalLines() {
  const container = document.getElementById('modalLinesList');
  const btnAdd = document.getElementById('btnAddLine');
  const counter = document.getElementById('lineCountDisplay');
  container.innerHTML = '';

  counter.textContent = `${modalLines.length}/5`;
  btnAdd.disabled = modalLines.length >= 5;

  modalLines.forEach((line, idx) => {
    const row = document.createElement('div');
    row.className = 'modal-line-row';

    const audioPill = line.hasAudio ? `
      <span class="line-audio-badge" onclick="playAudioClip('${line.id}', '${escapeHtml(line.text)}', '${line.audioDuration}')" title="Escuchar audio">▶️ Audio ${line.audioDuration}</span>
    ` : '';

    row.innerHTML = `
      <span style="font-size: 12px; font-weight: 700; opacity: 0.6;">${idx + 1}.</span>
      <input type="text" class="line-text-input" placeholder="Escriba o dicte el ítem ${idx + 1}..." value="${escapeHtml(line.text)}" oninput="updateModalLineText(${idx}, this.value)">
      ${audioPill}
      <button type="button" class="btn-line-action" title="Grabar audio para esta línea" onclick="recordAudioForLine(${idx})">🎙️</button>
      ${modalLines.length > 1 ? `<button type="button" class="btn-line-action" title="Eliminar línea" onclick="removeLineFromModal(${idx})">✕</button>` : ''}
    `;
    container.appendChild(row);
  });
}

function updateModalLineText(idx, val) {
  if (modalLines[idx]) {
    modalLines[idx].text = val;
  }
}

function addNewLineToModal(initialText = '', audioDur = null) {
  if (modalLines.length >= 5) {
    alert('Límite alcanzado: máximo 5 líneas por nota.');
    return;
  }
  modalLines.push({
    id: 'ml-' + Date.now() + '-' + modalLines.length,
    text: initialText,
    completed: false,
    hasAudio: !!audioDur,
    audioDuration: audioDur
  });
  renderModalLines();
}

function removeLineFromModal(idx) {
  if (modalLines.length > 1) {
    modalLines.splice(idx, 1);
    renderModalLines();
  }
}

function recordAudioForLine(idx) {
  const phrase = prompt('Dicte o simule la grabación de audio para esta línea:');
  if (phrase && phrase.trim()) {
    modalLines[idx].text = phrase.trim();
    modalLines[idx].hasAudio = true;
    modalLines[idx].audioDuration = '0:06';
    renderModalLines();
  }
}

function simulateSpeechRecognitionForModal() {
  const timer = document.getElementById('recordingTimer');
  let sec = 1;
  const intv = setInterval(() => {
    sec++;
    timer.textContent = `0:0${sec}`;
    if (sec >= 4) {
      clearInterval(intv);
      modalLines[0].text = 'Comprar leche y pan fresco';
      modalLines[0].hasAudio = true;
      modalLines[0].audioDuration = '0:08';

      // Segunda línea opcional por voz
      addNewLineToModal('Pagar en ventanilla rápida', '0:05');
      renderModalLines();
      selectTimePreset(timePresets[0]);
    }
  }, 700);
}

function resetModalForm() {
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

function saveNoteFromModal() {
  // Filtrar líneas vacías
  const validLines = modalLines.filter(l => l.text.trim().length > 0);
  if (validLines.length === 0) {
    alert('Por favor ingrese al menos una línea en la nota.');
    return;
  }

  // Evaluar urgencia con el clasificador
  const activePreset = timePresets.find(t => `⏰ ${t.label}` === selectedTriggerLabel);
  const urgency = classifyUrgency(selectedTriggerType, activePreset);

  if (editingNoteId) {
    // Modo Edición
    const note = notes.find(n => n.id === editingNoteId);
    if (note) {
      note.lines = validLines;
      note.color = selectedModalColor;
      note.urgency = urgency;
      note.triggerType = selectedTriggerType;
      note.triggerLabel = selectedTriggerLabel;
    }
  } else {
    // Modo Creación
    const newNote = {
      id: 'n' + (Date.now() % 100000),
      color: selectedModalColor,
      urgency: urgency,
      triggerType: selectedTriggerType,
      triggerLabel: selectedTriggerLabel === 'Ninguna asignada' ? '🟢 Sin alarma' : selectedTriggerLabel,
      completed: false,
      completedAt: null,
      createdAt: Date.now(),
      lines: validLines
    };
    notes.unshift(newNote);
  }

  saveToStorage();
  renderBoard();
  closeModal();

  if (selectedTriggerType !== 'none') {
    setTimeout(() => {
      triggerPushBanner(selectedTriggerLabel, validLines[0].text);
    }, 1200);
  }
}

// Reproducción de Audios
function playAudioClip(clipId, text, durationStr) {
  if (activeAudioId === clipId) {
    stopAudio();
    return;
  }
  stopAudio();
  activeAudioId = clipId;

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.onend = () => stopAudio();
    window.speechSynthesis.speak(utterance);
  }

  const durationSec = durationStr ? (parseInt(durationStr.split(':')[1]) || 6) : 6;
  audioInterval = setTimeout(() => {
    stopAudio();
  }, durationSec * 1000);
}

function stopAudio() {
  if (audioInterval) {
    clearTimeout(audioInterval);
    audioInterval = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeAudioId = null;
}

// Filtros del Tablero
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  const map = { all: 'chipAll', urgent: 'chipUrgent', context: 'chipContext', normal: 'chipNormal', completed: 'chipDone' };
  if (map[filter]) document.getElementById(map[filter]).classList.add('active');
  renderBoard();
}

// Modo Protector de Pantalla (AOD / Screensaver)
function openScreensaver() {
  document.getElementById('screensaverOverlay').classList.remove('hidden');
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

// Notificación Push Nativa Simulada
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
    completeNoteWithDelay(firstUrgent.id);
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
    notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
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
