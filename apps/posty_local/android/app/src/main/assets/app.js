// app.js • Nota Feliz (PostyLocal) Interactive Mobile Logic
// Stand-Alone Embebido • Cero Servidores • 100% Local-First
// Sistema de Íconos Minimalistas 2D Planos y Monocromáticos (Negro en claro / Blanco en oscuro)

const ICONS = {
  screensaver: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  close: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  plus: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  play: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
  speaker: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
  microphone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`,
  camera: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
  clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  pin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  urgentDot: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  listIcon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
  download: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
  upload: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
  gpsTarget: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>`
};

// Datos iniciales de demostración
const DEFAULT_NOTES = [
  {
    id: 'n1',
    color: 'yellow',
    urgency: 'urgent',
    triggerType: 'time',
    triggerLabel: 'Hoy 18:00',
    alertDateTimeStr: 'Hoy 18:00',
    completed: false,
    completedAt: null,
    createdAt: Date.now() - 3600000,
    lines: [
      { id: 'n1-l1', text: 'Pagar factura de luz antes de las 18:00', completed: false, hasAudio: true, audioDuration: '0:12', audioData: null },
      { id: 'n1-l2', text: 'Descargar comprobante en PDF', completed: false, hasAudio: false, audioDuration: null, audioData: null }
    ]
  },
  {
    id: 'n2',
    color: 'pink',
    urgency: 'context',
    triggerType: 'geo',
    triggerLabel: 'Al salir de casa',
    alertDateTimeStr: 'Al salir de casa',
    completed: false,
    completedAt: null,
    createdAt: Date.now() - 7200000,
    lines: [
      { id: 'n2-l1', text: 'Cerrar la llave de paso de gas', completed: false, hasAudio: true, audioDuration: '0:07', audioData: null },
      { id: 'n2-l2', text: 'Desconectar cargadores de pared', completed: false, hasAudio: false, audioDuration: null, audioData: null }
    ]
  },
  {
    id: 'n3',
    color: 'green',
    urgency: 'context',
    triggerType: 'geo',
    triggerLabel: 'Cerca del súper',
    alertDateTimeStr: 'Cerca del súper',
    completed: false,
    completedAt: null,
    createdAt: Date.now() - 10800000,
    lines: [
      { id: 'n3-l1', text: 'Comprar leche descremada', completed: false, hasAudio: false, audioDuration: null, audioData: null },
      { id: 'n3-l2', text: 'Manzanas verdes y plátanos', completed: false, hasAudio: true, audioDuration: '0:09', audioData: null },
      { id: 'n3-l3', text: 'Avena en grano sin azúcar', completed: false, hasAudio: false, audioDuration: null, audioData: null }
    ]
  },
  {
    id: 'n4',
    color: 'blue',
    urgency: 'normal',
    triggerType: 'none',
    triggerLabel: 'Sin alarma',
    alertDateTimeStr: 'Sin alarma',
    completed: false,
    completedAt: null,
    createdAt: Date.now() - 14400000,
    lines: [
      { id: 'n4-l1', text: 'Llamar a carpintero para repisa de libros', completed: false, hasAudio: false, audioDuration: null, audioData: null }
    ]
  },
  {
    id: 'n5',
    color: 'purple',
    urgency: 'normal',
    triggerType: 'none',
    triggerLabel: 'Sin alarma',
    alertDateTimeStr: 'Sin alarma',
    completed: false,
    completedAt: null,
    createdAt: Date.now() - 18000000,
    lines: [
      { id: 'n5-l1', text: 'Revisar apuntes de economía', completed: false, hasAudio: true, audioDuration: '0:14', audioData: null }
    ]
  }
];

// Presets dinámicos: Exactamente las 3 opciones requeridas por defecto
const DEFAULT_TIME_PRESETS = [
  { id: 't60', label: '+1 hora', minutes: 60, uses: 10 },
  { id: 't_hoy18', label: 'Hoy a las 18:00', timeStr: '18:00', isToday: true, uses: 8 },
  { id: 't_manana12', label: 'Mañana medio día', timeStr: '12:00', isTomorrow: true, uses: 6 }
];

// Georreferencias por defecto: Exactamente las 3 requeridas
const DEFAULT_GEO_PRESETS = [
  { id: 'g_casa', label: 'Al salir de casa', place: 'Casa', transition: 'EXIT', uses: 10 },
  { id: 'g_super', label: 'Cerca del súper', place: 'Supermercado', transition: 'ENTER', uses: 8 },
  { id: 'g_trabajo', label: 'En el trabajo', place: 'Trabajo', transition: 'ENTER', uses: 6 }
];

let notes = [];
let timePresets = [];
let geoPresets = [];

// Filtro activo único (permanece presionado hasta pulsar otro botón)
let currentFilter = 'urgent';
let modalPhotoData = null;

let selectedModalColor = 'yellow';
let selectedTriggerType = 'none';
let selectedTriggerLabel = 'Ninguna asignada';
let selectedTargetTimestamp = null;
let selectedAlertDateTimeStr = null;
let editingNoteId = null;
let modalLines = [];

let activeAudioElement = null;
let activeAudioId = null;
let currentVoicePromptType = 'time';
let pendingNewPlaceCoords = null;

// Reconocimiento de Voz Web (Web Speech API)
let postyRecognitionInstance = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initAppTheme();
  loadNotes();
  loadPresets();
  setupFilterButtons();
  renderBoard();
  renderTriggerPresets();
  startClockUpdater();
  startAutomaticAlertMonitor();

  // Conectar dictado estilo clinik_local en el modal de otro tiempo / nuevo lugar
  setupVoiceDictation('btnVoicePromptDictar', 'voicePromptTextInput');

  // Si se abre como protector de pantalla (Daydream en Android: ?screensaver=1)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('screensaver') === '1') {
    openScreensaver();
  }
});

// 11. GESTIÓN DE TEMAS (OSCURO, CLARO, SISTEMA)
function initAppTheme() {
  const savedTheme = localStorage.getItem('posty_theme') || 'system';
  setAppTheme(savedTheme, false);
}

function setAppTheme(theme, save = true) {
  document.body.setAttribute('data-theme', theme);
  if (save) {
    localStorage.setItem('posty_theme', theme);
  }

  // Actualizar botones en configuración
  const buttons = {
    dark: document.getElementById('themeBtnDark'),
    light: document.getElementById('themeBtnLight'),
    system: document.getElementById('themeBtnSystem')
  };

  Object.keys(buttons).forEach(k => {
    if (buttons[k]) {
      if (k === theme) buttons[k].classList.add('active');
      else buttons[k].classList.remove('active');
    }
  });
}

// Persistencia en LocalStorage
function loadNotes() {
  const saved = localStorage.getItem('posty_notes_v2');
  if (saved) {
    try {
      notes = JSON.parse(saved);
      // Reclasificar según regla estricta: hoy -> urgente, otras fechas/geo -> próximas, sin alertas -> libres
      notes.forEach(note => {
        note.urgency = classifyUrgency(note.triggerType, null, note.alertTimestamp, note.alertDateTimeStr || note.triggerLabel);
      });
    } catch (e) {
      notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
      saveToStorage();
    }
  } else {
    notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
    saveToStorage();
  }
}

function saveToStorage() {
  localStorage.setItem('posty_notes_v2', JSON.stringify(notes));
}

function loadPresets() {
  const savedTime = localStorage.getItem('posty_time_presets_v2');
  timePresets = savedTime ? JSON.parse(savedTime) : JSON.parse(JSON.stringify(DEFAULT_TIME_PRESETS));

  const savedGeo = localStorage.getItem('posty_geo_presets_v2');
  geoPresets = savedGeo ? JSON.parse(savedGeo) : JSON.parse(JSON.stringify(DEFAULT_GEO_PRESETS));

  // Cargar coordenadas de lugares guardadas
  ['Casa', 'Supermercado', 'Trabajo'].forEach(p => {
    const savedCoord = localStorage.getItem(`posty_geo_coords_${p}`);
    if (savedCoord) {
      const el = document.getElementById(`coordsText${p}`);
      if (el) el.textContent = savedCoord;
    }
  });
}

// 4. FILTROS RÁPIDOS (BOTÓN SELECCIONADO PERMANECE PRESIONADO HASTA QUE SE PRESIONE OTRO)
function setupFilterButtons() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const filterType = chip.getAttribute('data-filter');
      handleFilterClick(filterType);
    });
  });
}

function handleFilterClick(filterType) {
  currentFilter = filterType;
  renderBoard();
}

// Renderizado del Tablero
function renderBoard() {
  const gridUrgent = document.getElementById('gridUrgent');
  const gridContext = document.getElementById('gridContext');
  const gridNormal = document.getElementById('gridNormal');
  const gridCompleted = document.getElementById('gridCompleted');

  if (!gridUrgent || !gridContext || !gridNormal || !gridCompleted) return;

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

  // Renderizar Notas Cumplidas
  completedNotes.forEach(note => {
    const card = createNoteCardElement(note, true);
    gridCompleted.appendChild(card);
  });

  // Visibilidad de secciones según currentFilter (el botón seleccionado permanece activo hasta pulsar otro)
  document.getElementById('sectionUrgent').style.display = (currentFilter === 'urgent') ? 'flex' : 'none';
  document.getElementById('sectionContext').style.display = (currentFilter === 'context') ? 'flex' : 'none';
  document.getElementById('sectionNormal').style.display = (currentFilter === 'normal') ? 'flex' : 'none';
  document.getElementById('sectionCompleted').style.display = (currentFilter === 'completed') ? 'flex' : 'none';

  // Actualizar estado visual de los chips de filtro
  const chipMap = {
    urgent: document.getElementById('chipUrgent'),
    context: document.getElementById('chipContext'),
    normal: document.getElementById('chipNormal'),
    completed: document.getElementById('chipDone')
  };

  const urgentCount = activeNotes.filter(n => n.urgency === 'urgent').length;
  const contextCount = activeNotes.filter(n => n.urgency === 'context').length;
  const normalCount = activeNotes.filter(n => n.urgency === 'normal').length;

  if (chipMap.urgent) {
    chipMap.urgent.innerHTML = (currentFilter === 'urgent') ? `🔴 <span>Urgente (${urgentCount})</span>` : '🔴';
    chipMap.urgent.classList.toggle('active', currentFilter === 'urgent');
  }
  if (chipMap.context) {
    chipMap.context.innerHTML = (currentFilter === 'context') ? `🟡 <span>Próximas (${contextCount})</span>` : '🟡';
    chipMap.context.classList.toggle('active', currentFilter === 'context');
  }
  if (chipMap.normal) {
    chipMap.normal.innerHTML = (currentFilter === 'normal') ? `🟢 <span>Libres (${normalCount})</span>` : '🟢';
    chipMap.normal.classList.toggle('active', currentFilter === 'normal');
  }
  if (chipMap.completed) {
    chipMap.completed.innerHTML = (currentFilter === 'completed') ? `✓ <span>Realizadas (${completedNotes.length})</span>` : '✓';
    chipMap.completed.classList.toggle('active', currentFilter === 'completed');
  }

  const urgentSummary = document.getElementById('urgentSummaryText');
  if (urgentSummary) {
    urgentSummary.textContent = `${activeNotes.length} actividades • ${urgentCount} urgente`;
  }
}

// Crear Elemento HTML de Nota
function createNoteCardElement(note, isCompletedView) {
  const card = document.createElement('div');
  card.className = `postit-card ${note.color} ${note.completed ? 'completed' : ''}`;
  card.id = `card-${note.id}`;

  let linesHtml = '<div class="postit-checklist">';
  if (note.lines && note.lines.length > 0) {
    note.lines.forEach((line, lIdx) => {
      const audioBtn = `
        <button type="button" class="audio-play-btn" style="width: 24px; height: 24px; margin-left: 6px; cursor: pointer; border-radius: 50%; border: none; background: rgba(0,0,0,0.08); display: inline-flex; align-items: center; justify-content: center; color: inherit;" onclick="playLineAudioById('${note.id}', '${line.id}')" title="Escuchar audio">${ICONS.play}</button>
      `;

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

  let photoHtml = '';
  if (note.photo) {
    photoHtml = `<img src="${note.photo}" class="note-attached-image" alt="Foto adjunta" onclick="window.open('${note.photo}')">`;
  }

  let topActions = '';
  if (!isCompletedView) {
    topActions = `
      <div style="display: flex; gap: 6px;">
        <button class="btn-card-action" onclick="openEditNoteModal('${note.id}')" title="Editar nota y lista">${ICONS.edit}</button>
        <button class="btn-card-action" onclick="completeNoteWithDelay('${note.id}')" title="Marcar toda la nota como cumplida">${ICONS.check}</button>
      </div>
    `;
  } else {
    topActions = `<span class="completed-badge-pill">${ICONS.check} Realizada</span>`;
  }

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

  const trigIcon = note.triggerType === 'geo' ? ICONS.pin : (note.triggerType === 'time' ? ICONS.clock : ICONS.listIcon);
  const trigText = note.alertDateTimeStr || note.triggerLabel || 'Sin alarma';

  card.innerHTML = `
    <div class="postit-top-row">
      <div style="flex: 1;">
        ${linesHtml}
        ${photoHtml}
      </div>
      ${topActions}
    </div>
    <div class="postit-footer">
      ${colorStrip}
      <span class="alarm-pill">${trigIcon} <span>${escapeHtml(trigText)}</span></span>
    </div>
  `;

  return card;
}

// Transición de 1 segundo a Tareas Realizadas
function completeNoteWithDelay(noteId) {
  const card = document.getElementById(`card-${noteId}`);
  if (card) {
    card.classList.add('task-completing');
    playSuccessChime();

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
    if (note.lines.length > 0 && note.lines.every(l => l.completed)) {
      completeNoteWithDelay(noteId);
      return;
    }
    saveToStorage();
    renderBoard();
  }
}

function playSuccessChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

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
  if (preview) preview.className = `postit-preview ${color}`;

  document.querySelectorAll('.color-opt').forEach(opt => opt.classList.remove('active'));
  const activeOpt = document.querySelector(`.opt-${color}`);
  if (activeOpt) activeOpt.classList.add('active');
}

// 1. CREACIÓN, EDICIÓN Y GESTIÓN DE NOTAS CON LISTAS
function openNewNoteModal() {
  editingNoteId = null;
  modalLines = [{ id: 'ml-1', text: '', completed: false, hasAudio: false, audioDuration: null, audioData: null }];
  modalPhotoData = null;
  const modal = document.getElementById('newNoteModal');
  const modalTitle = document.getElementById('modalTitle');

  modal.classList.remove('hidden');
  resetModalForm();
  renderModalLines();
  renderPhotoPreview();
  renderTriggerPresets();

  modalTitle.textContent = 'Nueva Nota';
}

function openEditNoteModal(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (!note || note.completed) return;

  editingNoteId = noteId;
  modalLines = (note.lines && note.lines.length > 0)
    ? JSON.parse(JSON.stringify(note.lines))
    : [{ id: 'ml-1', text: note.text || '', completed: false, hasAudio: false, audioDuration: null, audioData: null }];
  modalPhotoData = note.photo || null;

  const modal = document.getElementById('newNoteModal');
  const modalTitle = document.getElementById('modalTitle');

  modal.classList.remove('hidden');
  modalTitle.textContent = 'Editar Nota';

  selectColor(note.color || 'yellow');
  selectedTriggerType = note.triggerType || 'none';
  selectedTriggerLabel = note.triggerLabel || 'Ninguna asignada';
  const selTrig = document.getElementById('selectedTriggerText');
  if (selTrig) selTrig.textContent = `Alerta: ${selectedTriggerLabel}`;

  renderModalLines();
  renderPhotoPreview();
  renderTriggerPresets();
}

function renderModalLines() {
  const container = document.getElementById('modalLinesList');
  const btnAdd = document.getElementById('btnAddLine');
  const counter = document.getElementById('lineCountDisplay');
  if (!container) return;

  container.innerHTML = '';
  if (counter) counter.textContent = `${modalLines.length}/5`;
  if (btnAdd) btnAdd.disabled = modalLines.length >= 5;

  modalLines.forEach((line, idx) => {
    const row = document.createElement('div');
    row.className = 'modal-line-container';

    row.innerHTML = `
      <div class="modal-line-box">
        <button type="button" class="btn-voice-mini icon-only" id="btnVoiceLine_${idx}" title="Dictar por voz">${ICONS.microphone}</button>
        <span class="line-number" style="font-size: 13px; font-weight: 700; opacity: 0.6; min-width: 14px; text-align: center; flex-shrink: 0;">${idx + 1}.</span>
        <input type="text" id="modalLineInput_${idx}" class="line-text-input" placeholder="Escriba o dicte el ítem ${idx + 1}..." value="${escapeHtml(line.text)}" oninput="updateModalLineText(${idx}, this.value)">
      </div>
      ${modalLines.length > 1 ? `<button type="button" class="btn-line-action" title="Eliminar línea" onclick="removeLineFromModal(${idx})">${ICONS.close}</button>` : ''}
    `;
    container.appendChild(row);

    // Conectar dictado estilo clinik_local
    setupVoiceDictation(`btnVoiceLine_${idx}`, `modalLineInput_${idx}`, idx);
  });
}

function updateModalLineText(idx, val) {
  if (modalLines[idx]) {
    modalLines[idx].text = val;
  }
}

function addNewLineToModal(initialText = '', audioDur = null, audioData = null) {
  if (modalLines.length >= 5) {
    alert('Límite alcanzado: máximo 5 líneas por nota.');
    return;
  }
  modalLines.push({
    id: 'ml-' + Date.now() + '-' + modalLines.length,
    text: initialText,
    completed: false,
    hasAudio: !!audioDur,
    audioDuration: audioDur,
    audioData: audioData
  });
  renderModalLines();
}

function removeLineFromModal(idx) {
  if (modalLines.length > 1) {
    modalLines.splice(idx, 1);
    renderModalLines();
  }
}

// ==================== DICTADO POR VOZ (IDÉNTICO A CLINIK_LOCAL) ====================
function setupVoiceDictation(buttonOrId, targetInputOrId, lineIdx = null) {
  const btn = typeof buttonOrId === 'string' ? document.getElementById(buttonOrId) : buttonOrId;
  const input = typeof targetInputOrId === 'string' ? document.getElementById(targetInputOrId) : targetInputOrId;
  if (!btn || !input) return;

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (btn.classList.contains('listening')) {
      if (postyRecognitionInstance) {
        try { postyRecognitionInstance.stop(); } catch (err) {}
      }
      btn.classList.remove('listening');
      return;
    }

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          btn.classList.add('listening');
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            const val = input.value ? input.value + ' ' + transcript : transcript;
            input.value = val;
            input.dispatchEvent(new Event('input'));
            if (lineIdx !== null && modalLines[lineIdx]) {
              modalLines[lineIdx].text = val;
              modalLines[lineIdx].hasAudio = true;
            }
          }
        };

        recognition.onerror = () => {
          btn.classList.remove('listening');
        };

        recognition.onend = () => {
          btn.classList.remove('listening');
        };

        postyRecognitionInstance = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRec fallo, intentando fallback nativo:', err);
      }
    }

    // Fallback nativo para Android WebView cuando WebSpeech no está soportado internamente
    if (window.AndroidBridge && window.AndroidBridge.startVoiceDictation) {
      btn.classList.add('listening');
      window.activeDictationInput = input;
      window.activeDictationBtn = btn;
      window.activeDictationLineIdx = lineIdx;
      window.AndroidBridge.startVoiceDictation(lineIdx !== null ? String(lineIdx) : 'prompt');
    } else {
      alert('Dictado por voz no disponible en este dispositivo.');
    }
  });
}

// Callback invocado por el puente nativo de Android al dictar texto
window.onNativeVoiceDictated = function(targetIndexStr, recognizedText) {
  if (window.activeDictationInput && recognizedText) {
    const val = window.activeDictationInput.value ? window.activeDictationInput.value + ' ' + recognizedText : recognizedText;
    window.activeDictationInput.value = val;
    window.activeDictationInput.dispatchEvent(new Event('input'));
    if (window.activeDictationLineIdx !== null && modalLines[window.activeDictationLineIdx]) {
      modalLines[window.activeDictationLineIdx].text = val;
      modalLines[window.activeDictationLineIdx].hasAudio = true;
    }
  }
  if (window.activeDictationBtn) {
    window.activeDictationBtn.classList.remove('listening');
  }
};

// ==================== ADJUNTAR FOTO OPCIONAL (1 SOLA FOTO) ====================
function handlePhotoSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let width = img.width;
      let height = img.height;
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      modalPhotoData = canvas.toDataURL('image/jpeg', 0.8);
      renderPhotoPreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderPhotoPreview() {
  const box = document.getElementById('photoPreviewBox');
  const img = document.getElementById('photoPreviewImg');
  const btnAttach = document.getElementById('btnAttachPhoto');
  if (modalPhotoData) {
    if (img) img.src = modalPhotoData;
    if (box) {
      box.classList.remove('hidden');
      box.style.display = 'flex';
    }
    if (btnAttach) btnAttach.style.display = 'none';
  } else {
    if (img) img.src = '';
    if (box) {
      box.classList.add('hidden');
      box.style.display = 'none';
    }
    if (btnAttach) btnAttach.style.display = 'inline-flex';
  }
}

function removeAttachedPhoto() {
  modalPhotoData = null;
  const fileInput = document.getElementById('notePhotoInput');
  if (fileInput) fileInput.value = '';
  renderPhotoPreview();
}

// Modal para "➕ Otro tiempo" / "➕ Nuevo lugar"
function openVoicePromptModal(type) {
  currentVoicePromptType = type;
  const modal = document.getElementById('voicePromptModal');
  const title = document.getElementById('voicePromptTitle');
  const timeSection = document.getElementById('voicePromptTimeSection');
  const geoSection = document.getElementById('voicePromptGeoSection');
  const dtInput = document.getElementById('voicePromptDateTimeInput');
  const geoInput = document.getElementById('voicePromptTextInput');

  pendingNewPlaceCoords = null;
  const statusEl = document.getElementById('newPlaceCoordsStatus');
  if (statusEl) {
    statusEl.textContent = 'Sin fijar (puede fijarse luego al estar en la zona).';
    statusEl.style.color = 'var(--text-muted)';
  }

  modal.classList.remove('hidden');

  if (type === 'time') {
    title.textContent = 'Programar Fecha y Hora';
    if (timeSection) timeSection.classList.remove('hidden');
    if (geoSection) geoSection.classList.add('hidden');

    const defDate = new Date(Date.now() + 3600000);
    const yr = defDate.getFullYear();
    const mo = String(defDate.getMonth() + 1).padStart(2, '0');
    const da = String(defDate.getDate()).padStart(2, '0');
    const ho = String(defDate.getHours()).padStart(2, '0');
    const mi = String(defDate.getMinutes()).padStart(2, '0');
    if (dtInput) dtInput.value = `${yr}-${mo}-${da}T${ho}:${mi}`;
  } else {
    title.textContent = 'Agregar Nuevo Lugar';
    if (timeSection) timeSection.classList.add('hidden');
    if (geoSection) geoSection.classList.remove('hidden');
    if (geoInput) {
      geoInput.value = '';
      setTimeout(() => geoInput.focus(), 150);
    }
  }
}

// Fijar ubicación GPS satelital opcional al crear un nuevo lugar
function captureGPSForNewPlace() {
  const statusEl = document.getElementById('newPlaceCoordsStatus');
  const btn = document.getElementById('btnCaptureGeoNewPlace');
  if (statusEl) statusEl.textContent = '🛰️ Obteniendo posición GPS satelital...';
  if (btn) btn.disabled = true;

  if (window.AndroidBridge && window.AndroidBridge.getRealGPSLocation) {
    window.AndroidBridge.getRealGPSLocation('__pending_new_place__');
    setTimeout(() => {
      if (btn) btn.disabled = false;
    }, 4000);
    return;
  }

  if (!navigator.geolocation) {
    if (statusEl) statusEl.textContent = 'Geolocalización no disponible en este dispositivo.';
    if (btn) btn.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      const acc = Math.round(pos.coords.accuracy || 10);
      pendingNewPlaceCoords = `Lat: ${lat}, Lng: ${lng} (±${acc}m GPS Real)`;
      if (statusEl) {
        statusEl.textContent = `✓ Ubicación fijada: ${pendingNewPlaceCoords}`;
        statusEl.style.color = '#10B981';
      }
      if (btn) btn.disabled = false;
    },
    (err) => {
      if (statusEl) {
        statusEl.textContent = 'No se pudo obtener GPS directo. Puede fijarse luego.';
        statusEl.style.color = 'var(--text-muted)';
      }
      if (btn) btn.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function confirmVoicePrompt() {
  if (currentVoicePromptType === 'time') {
    const dtInput = document.getElementById('voicePromptDateTimeInput');
    const val = dtInput ? dtInput.value : '';
    if (!val) {
      alert('Por favor seleccione fecha y hora.');
      return;
    }
    const targetDate = new Date(val);
    const ts = targetDate.getTime();
    if (isNaN(ts)) {
      alert('Fecha u hora inválida.');
      return;
    }
    const day = String(targetDate.getDate()).padStart(2, '0');
    const mon = String(targetDate.getMonth() + 1).padStart(2, '0');
    const yr = targetDate.getFullYear();
    const hrs = String(targetDate.getHours()).padStart(2, '0');
    const mins = String(targetDate.getMinutes()).padStart(2, '0');
    const exactFormatted = `${day}/${mon}/${yr} ${hrs}:${mins}`;

    const newPreset = {
      id: 't_custom_' + Date.now(),
      label: exactFormatted,
      targetTimestamp: ts,
      alertDateTimeStr: exactFormatted,
      uses: 10
    };
    timePresets.unshift(newPreset);
    localStorage.setItem('posty_time_presets_v2', JSON.stringify(timePresets));
    renderTriggerPresets();
    selectTimePreset(newPreset);
  } else {
    const geoInput = document.getElementById('voicePromptTextInput');
    const val = geoInput ? geoInput.value.trim() : '';
    if (!val) {
      alert('Por favor ingrese o dicte el nombre del nuevo lugar.');
      return;
    }
    const newGeo = {
      id: 'g_custom_' + Date.now(),
      label: val,
      place: val,
      transition: 'ENTER',
      uses: 10
    };
    geoPresets.unshift(newGeo);
    localStorage.setItem('posty_geo_presets_v2', JSON.stringify(geoPresets));

    if (pendingNewPlaceCoords) {
      localStorage.setItem(`posty_geo_coords_${val}`, pendingNewPlaceCoords);
    }

    renderTriggerPresets();
    renderSettingsLocations();
    selectGeoPreset(newGeo);
  }

  closeVoicePromptModal();
}

function closeVoicePromptModal() {
  document.getElementById('voicePromptModal').classList.add('hidden');
}

// Cálculo Exacto de Fecha y Hora de Alarma
function calculateAlertDateTime(preset) {
  const now = new Date();
  if (preset.minutes) {
    const target = new Date(now.getTime() + preset.minutes * 60 * 1000);
    const hrs = String(target.getHours()).padStart(2, '0');
    const mins = String(target.getMinutes()).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const mon = String(target.getMonth() + 1).padStart(2, '0');
    return {
      timestamp: target.getTime(),
      label: `Hoy ${hrs}:${mins} (${day}/${mon})`
    };
  }
  if (preset.isToday && preset.timeStr) {
    const [h, m] = preset.timeStr.split(':').map(Number);
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    const day = String(target.getDate()).padStart(2, '0');
    const mon = String(target.getMonth() + 1).padStart(2, '0');
    return {
      timestamp: target.getTime(),
      label: `Hoy ${preset.timeStr} (${day}/${mon})`
    };
  }
  if (preset.isTomorrow && preset.timeStr) {
    const [h, m] = preset.timeStr.split(':').map(Number);
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m, 0);
    const day = String(target.getDate()).padStart(2, '0');
    const mon = String(target.getMonth() + 1).padStart(2, '0');
    return {
      timestamp: target.getTime(),
      label: `Mañana ${preset.timeStr} (${day}/${mon})`
    };
  }
  if (preset.targetTimestamp) {
    const target = new Date(preset.targetTimestamp);
    const hrs = String(target.getHours()).padStart(2, '0');
    const mins = String(target.getMinutes()).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const mon = String(target.getMonth() + 1).padStart(2, '0');
    const yr = target.getFullYear();
    return {
      timestamp: target.getTime(),
      label: `${day}/${mon}/${yr} ${hrs}:${mins}`
    };
  }
  return {
    timestamp: null,
    label: preset.label
  };
}

// Presets Dinámicos de Tiempo y Lugar (Íconos Minimalistas Planos 2D)
function renderTriggerPresets() {
  const sortedTime = [...timePresets].sort((a, b) => (b.uses || 0) - (a.uses || 0));
  const primaryTime = sortedTime.slice(0, 3);
  const secondaryTime = sortedTime.slice(3);

  const priTimeCont = document.getElementById('primaryTimePresets');
  const secTimeCont = document.getElementById('secondaryTimePresets');
  const btnMoreTime = document.getElementById('btnToggleMoreTime');

  if (priTimeCont) {
    priTimeCont.innerHTML = primaryTime.map(p => `
      <button type="button" class="preset-btn" onclick="selectTimePresetById('${p.id}')">
        ${ICONS.clock} <span>${escapeHtml(p.label)}</span>
      </button>
    `).join('');
  }

  if (secTimeCont) {
    secTimeCont.innerHTML = secondaryTime.map(p => `
      <button type="button" class="preset-btn" onclick="selectTimePresetById('${p.id}')">
        ${ICONS.clock} <span>${escapeHtml(p.label)}</span>
      </button>
    `).join('');
    if (btnMoreTime) {
      btnMoreTime.style.display = secondaryTime.length > 0 ? 'inline-flex' : 'none';
    }
  }

  const sortedGeo = [...geoPresets].sort((a, b) => (b.uses || 0) - (a.uses || 0));
  const primaryGeo = sortedGeo.slice(0, 3);
  const secondaryGeo = sortedGeo.slice(3);

  const priGeoCont = document.getElementById('primaryGeoPresets');
  const secGeoCont = document.getElementById('secondaryGeoPresets');
  const btnMoreGeo = document.getElementById('btnToggleMoreGeo');

  if (priGeoCont) {
    priGeoCont.innerHTML = primaryGeo.map(g => `
      <button type="button" class="preset-btn" onclick="selectGeoPresetById('${g.id}')">
        ${ICONS.pin} <span>${escapeHtml(g.label)}</span>
      </button>
    `).join('');
  }

  if (secGeoCont) {
    secGeoCont.innerHTML = secondaryGeo.map(g => `
      <button type="button" class="preset-btn" onclick="selectGeoPresetById('${g.id}')">
        ${ICONS.pin} <span>${escapeHtml(g.label)}</span>
      </button>
    `).join('');
    if (btnMoreGeo) {
      btnMoreGeo.style.display = secondaryGeo.length > 0 ? 'inline-flex' : 'none';
    }
  }
}

function selectTimePresetById(id) {
  const p = timePresets.find(t => t.id === id);
  if (p) selectTimePreset(p);
}

function selectGeoPresetById(id) {
  const g = geoPresets.find(item => item.id === id);
  if (g) selectGeoPreset(g);
}

function selectTimePreset(preset) {
  selectedTriggerType = 'time';
  const calc = calculateAlertDateTime(preset);
  selectedTargetTimestamp = calc.timestamp;
  selectedAlertDateTimeStr = calc.label;
  selectedTriggerLabel = calc.label;
  const selTrig = document.getElementById('selectedTriggerText');
  if (selTrig) selTrig.textContent = `Alerta: ${selectedAlertDateTimeStr}`;

  preset.uses = (preset.uses || 0) + 1;
  localStorage.setItem('posty_time_presets_v2', JSON.stringify(timePresets));

  document.querySelectorAll('#primaryTimePresets .preset-btn, #secondaryTimePresets .preset-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.includes(preset.label));
  });
  document.querySelectorAll('#primaryGeoPresets .preset-btn, #secondaryGeoPresets .preset-btn').forEach(b => {
    b.classList.remove('active');
  });
}

function selectGeoPreset(preset) {
  selectedTriggerType = 'geo';
  selectedTargetTimestamp = null;
  selectedAlertDateTimeStr = preset.label;
  selectedTriggerLabel = preset.label;
  const selTrig = document.getElementById('selectedTriggerText');
  if (selTrig) selTrig.textContent = `Alerta: ${preset.label}`;

  preset.uses = (preset.uses || 0) + 1;
  localStorage.setItem('posty_geo_presets_v2', JSON.stringify(geoPresets));

  document.querySelectorAll('#primaryGeoPresets .preset-btn, #secondaryGeoPresets .preset-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.includes(preset.label));
  });
  document.querySelectorAll('#primaryTimePresets .preset-btn, #secondaryTimePresets .preset-btn').forEach(b => {
    b.classList.remove('active');
  });
}

function toggleMoreTimePresets() {
  const sec = document.getElementById('secondaryTimePresets');
  const btn = document.getElementById('btnToggleMoreTime');
  const isHidden = sec.classList.toggle('hidden');
  btn.innerHTML = isHidden ? '<span>Ver más horarios</span> <span class="arrow-icon">▼</span>' : '<span>Ocultar</span> <span class="arrow-icon">▲</span>';
}

function toggleMoreGeoPresets() {
  const sec = document.getElementById('secondaryGeoPresets');
  const btn = document.getElementById('btnToggleMoreGeo');
  const isHidden = sec.classList.toggle('hidden');
  btn.innerHTML = isHidden ? '<span>Ver más lugares</span> <span class="arrow-icon">▼</span>' : '<span>Ocultar</span> <span class="arrow-icon">▲</span>';
}

function resetModalForm() {
  selectColor('yellow');
  selectedTriggerType = 'none';
  selectedTriggerLabel = 'Ninguna asignada';
  selectedTargetTimestamp = null;
  selectedAlertDateTimeStr = null;
  document.getElementById('selectedTriggerText').textContent = 'Alerta: Ninguna asignada';
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
}

function closeModal() {
  if (postyRecognitionInstance) {
    try { postyRecognitionInstance.stop(); } catch (err) {}
    postyRecognitionInstance = null;
  }
  document.getElementById('newNoteModal').classList.add('hidden');
  stopAudio();
}

function saveNoteFromModal() {
  if (postyRecognitionInstance) {
    try { postyRecognitionInstance.stop(); } catch (err) {}
    postyRecognitionInstance = null;
  }

  // Sincronizar todos los inputs de texto del DOM hacia modalLines
  const lineInputs = document.querySelectorAll('#modalLinesList .line-text-input');
  lineInputs.forEach((inp, idx) => {
    if (modalLines[idx]) {
      modalLines[idx].text = inp.value;
    }
  });

  const validLines = modalLines.filter(l => l.text.trim().length > 0);
  if (validLines.length === 0) {
    alert('Por favor ingrese al menos una línea en la nota.');
    return;
  }

  const activePreset = timePresets.find(t => t.label === selectedTriggerLabel || (t.alertDateTimeStr && t.alertDateTimeStr === selectedTriggerLabel));
  const urgency = classifyUrgency(selectedTriggerType, activePreset, selectedTargetTimestamp, selectedAlertDateTimeStr);

  if (editingNoteId) {
    const note = notes.find(n => n.id === editingNoteId);
    if (note) {
      note.lines = validLines;
      note.color = selectedModalColor;
      note.urgency = urgency;
      note.triggerType = selectedTriggerType;
      note.triggerLabel = selectedAlertDateTimeStr || selectedTriggerLabel;
      note.alertTimestamp = selectedTargetTimestamp;
      note.alertDateTimeStr = selectedAlertDateTimeStr;
      note.photo = modalPhotoData;
    }
  } else {
    const newNote = {
      id: 'n' + (Date.now() % 100000),
      color: selectedModalColor,
      urgency: urgency,
      triggerType: selectedTriggerType,
      triggerLabel: selectedAlertDateTimeStr || (selectedTriggerLabel === 'Ninguna asignada' ? 'Sin alarma' : selectedTriggerLabel),
      alertTimestamp: selectedTargetTimestamp,
      alertDateTimeStr: selectedAlertDateTimeStr,
      completed: false,
      completedAt: null,
      createdAt: Date.now(),
      lines: validLines,
      photo: modalPhotoData
    };
    notes.unshift(newNote);
  }

  saveToStorage();
  renderBoard();
  closeModal();
}

// Clasificación de Urgencia Estricta
// Hoy -> Urgente, Otras fechas -> Próximas, Georreferenciadas -> Próximas, Sin alertas -> Libres
function classifyUrgency(triggerType, preset, targetTimestamp, alertDateTimeStr) {
  if (triggerType === 'none' || !triggerType) {
    return 'normal'; // Sin alertas -> Libres
  }

  if (triggerType === 'geo') {
    return 'context'; // Georreferenciadas -> Próximas
  }

  if (triggerType === 'time') {
    // Si viene de preset con flags explícitos
    if (preset && (preset.isToday || preset.minutes)) {
      return 'urgent'; // Hoy -> Urgente
    }
    if (preset && (preset.isTomorrow || preset.isNextWeek)) {
      return 'context'; // Otras fechas -> Próximas
    }

    const ts = targetTimestamp || (preset ? preset.targetTimestamp : null);
    if (ts) {
      const now = new Date();
      const target = new Date(ts);
      const isToday = (now.getFullYear() === target.getFullYear() &&
                       now.getMonth() === target.getMonth() &&
                       now.getDate() === target.getDate());
      return isToday ? 'urgent' : 'context';
    }

    const str = alertDateTimeStr || (preset ? (preset.alertDateTimeStr || preset.label) : '');
    if (str) {
      const lower = str.toLowerCase();
      if (lower.includes('hoy') || lower.includes('hora') || lower.includes('min')) {
        return 'urgent';
      }
      return 'context';
    }

    return 'urgent';
  }

  return 'normal';
}

// Reproducción de Audios Infalible (Android TTS Nativo + Audio + Web Speech)
function playLineAudioById(noteId, lineId) {
  const btn = event ? event.currentTarget : null;
  if (btn) {
    btn.textContent = '🔊';
    setTimeout(() => { if (btn) btn.textContent = '▶️'; }, 2500);
  }

  const note = notes.find(n => n.id === noteId);
  if (!note) return;
  const line = (note.lines && note.lines.length > 0) ? note.lines.find(l => l.id === lineId) : null;
  const textToSpeak = line ? line.text : (note.text || '');

  if (!textToSpeak) return;

  // 1. Android APK Nativo: Invocar el motor de voz TTS de hardware de Android
  if (window.AndroidBridge && window.AndroidBridge.speakText) {
    window.AndroidBridge.speakText(textToSpeak);
    return;
  }

  // 2. Si hay clip grabado base64 en memoria
  if (line && line.audioData && typeof line.audioData === 'string' && line.audioData.startsWith('data:audio')) {
    try {
      if (activeAudioElement) {
        activeAudioElement.pause();
        activeAudioElement = null;
      }
      activeAudioElement = new Audio(line.audioData);
      activeAudioElement.play().catch(() => fallbackSpeechSynthesis(textToSpeak));
      return;
    } catch (e) {
      fallbackSpeechSynthesis(textToSpeak);
      return;
    }
  }

  // 3. Fallback a SpeechSynthesis del Navegador
  fallbackSpeechSynthesis(textToSpeak);
}

function playAudioClip(clipId, text, durationStr, audioDataUrl) {
  if (window.AndroidBridge && window.AndroidBridge.speakText) {
    window.AndroidBridge.speakText(text);
    return;
  }
  fallbackSpeechSynthesis(text);
}

function fallbackSpeechSynthesis(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => stopAudio();
    window.speechSynthesis.speak(utterance);
  }
}

function stopAudio() {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeAudioId = null;
}

// 6. ALERTAS AUTOMÁTICAS (CERO SIMULACIÓN MANUAL)
function startAutomaticAlertMonitor() {
  setInterval(() => {
    const now = new Date();
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    notes.forEach(note => {
      if (note.completed || !note.triggerLabel) return;

      // Alerta de hora fija (ej: "18:00")
      if (note.triggerLabel.includes(currentHourMin) && !note.alreadyAlertedToday) {
        note.alreadyAlertedToday = true;
        triggerPushBanner(note.triggerLabel, note.lines ? note.lines[0].text : note.text);
      }
    });
  }, 10000); // Chequeo periódico cada 10s
}

function triggerPushBanner(title, body) {
  const banner = document.getElementById('pushNotificationBanner');
  if (!banner) return;

  document.getElementById('pushTitle').textContent = title || '⏰ Recordatorio Automático';
  document.getElementById('pushBody').textContent = body || 'Tiene una nota pendiente por cumplirse.';
  banner.classList.remove('hidden');

  // Sonido de alerta
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
  const banner = document.getElementById('pushNotificationBanner');
  if (banner) banner.classList.add('hidden');
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
  alert('⏱️ Recordatorio pospuesto automáticamente por 15 minutos.');
}

// 5. ACTUALIZACIÓN DE GPS REAL ("ACTUALIZAR AQUÍ") PARA CUALQUIER LUGAR
function renderSettingsLocations() {
  const container = document.getElementById('settingsLocationsList');
  if (!container) return;

  const uniquePlaces = [];
  const seen = new Set();
  (geoPresets || []).forEach(g => {
    const p = g.place || g.label;
    if (p && !seen.has(p)) {
      seen.add(p);
      uniquePlaces.push({
        place: p,
        label: g.label || p
      });
    }
  });

  // Asegurar los 3 lugares por defecto requeridos
  ['Casa', 'Supermercado', 'Trabajo'].forEach(p => {
    if (!seen.has(p)) {
      seen.add(p);
      const label = p === 'Casa' ? 'Al salir de casa' : (p === 'Supermercado' ? 'Cerca del súper' : 'En el trabajo');
      uniquePlaces.push({ place: p, label: label });
    }
  });

  container.innerHTML = uniquePlaces.map(item => {
    const p = item.place;
    const safeId = p.replace(/[^a-zA-Z0-9_-]/g, '_');
    const savedCoord = localStorage.getItem(`posty_geo_coords_${p}`) || 'Sin georreferencia fijada (toque Actualizar Aquí al estar en la zona)';
    const isFixed = savedCoord.includes('Lat:');
    const escapedPlace = escapeHtml(p);
    const escapedLabel = escapeHtml(item.label);
    return `
      <div class="location-item">
        <div style="flex: 1 1 auto; min-width: 0; padding-right: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            ${ICONS.pin}
            <strong>${escapedLabel}</strong>
          </div>
          <div class="coords-text ${isFixed ? 'coords-fixed' : ''}" id="coordsText_${safeId}">
            ${escapeHtml(savedCoord)}
          </div>
        </div>
        <button class="chip-action" id="btnUpdate_${safeId}" onclick="updateGeoCoord('${escapedPlace}')">
          Actualizar Aquí
        </button>
      </div>
    `;
  }).join('');
}

function updateGeoCoord(place) {
  const safeId = place.replace(/[^a-zA-Z0-9_-]/g, '_');
  const btn = document.getElementById(`btnUpdate_${safeId}`) || (event ? event.currentTarget : null);
  const originalText = btn ? btn.innerHTML : 'Actualizar Aquí';
  if (btn) {
    btn.innerHTML = '🛰️ Obteniendo GPS...';
    btn.disabled = true;
  }

  // Si estamos en la app Android nativa con puente GPS de hardware
  if (window.AndroidBridge && window.AndroidBridge.getRealGPSLocation) {
    window.AndroidBridge.getRealGPSLocation(place);
    setTimeout(() => {
      if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }, 4000);
    return;
  }

  if (!navigator.geolocation) {
    alert('Geolocalización no soportada en este navegador.');
    if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      const acc = Math.round(pos.coords.accuracy || 10);
      saveRealLocationCoordinates(place, lat, lng, acc);
      if (btn) {
        btn.innerHTML = '✓ Actualizado';
        setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000);
      }
    },
    (err) => {
      // Reintentar con baja precisión (red celular o WiFi) si el GPS satelital directo tarda
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          saveRealLocationCoordinates(place, lat, lng, 30);
          if (btn) {
            btn.innerHTML = '✓ Actualizado';
            setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000);
          }
        },
        (err2) => {
          alert('No se pudo obtener el GPS: ' + (err.message || 'Active la ubicación en su celular.'));
          if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
  );
}

// Callback global invocado por AndroidBridge cuando el GPS nativo responde
window.onNativeGPSReceived = function(place, lat, lng, accuracy) {
  if (place === '__pending_new_place__') {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const acc = Math.round(accuracy);
    pendingNewPlaceCoords = `Lat: ${latStr}, Lng: ${lngStr} (±${acc}m GPS Real)`;
    const statusEl = document.getElementById('newPlaceCoordsStatus');
    if (statusEl) {
      statusEl.textContent = `✓ Ubicación fijada: ${pendingNewPlaceCoords}`;
      statusEl.style.color = '#10B981';
    }
    const btn = document.getElementById('btnCaptureGeoNewPlace');
    if (btn) btn.disabled = false;
    return;
  }
  saveRealLocationCoordinates(place, lat.toFixed(6), lng.toFixed(6), Math.round(accuracy));
  const safeId = place.replace(/[^a-zA-Z0-9_-]/g, '_');
  const btn = document.getElementById(`btnUpdate_${safeId}`);
  if (btn) {
    btn.innerHTML = '✓ Actualizado';
    setTimeout(() => { btn.innerHTML = 'Actualizar Aquí'; btn.disabled = false; }, 2000);
  }
};

function saveRealLocationCoordinates(place, lat, lng, accuracy) {
  const coordStr = `Lat: ${lat}, Lng: ${lng} (±${accuracy}m GPS Real)`;
  localStorage.setItem(`posty_geo_coords_${place}`, coordStr);

  const safeId = place.replace(/[^a-zA-Z0-9_-]/g, '_');
  const displayEl = document.getElementById(`coordsText_${safeId}`);
  if (displayEl) {
    displayEl.textContent = coordStr;
    displayEl.classList.add('coords-fixed');
    displayEl.style.color = '#10B981';
    displayEl.style.fontWeight = '600';
  }
}

// Reloj y Trazabilidad
function startClockUpdater() {
  const update = () => {
    const el = document.getElementById('currentDateDisplay');
    const aod = document.getElementById('aodClock');
    const aodDate = document.getElementById('aodDate');
    const now = new Date();

    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateFormatted = now.toLocaleDateString('es-ES', options);
    const capitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

    if (el) el.textContent = capitalized;

    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    if (aod) aod.textContent = `${hrs}:${mins}`;
    if (aodDate) aodDate.textContent = `${capitalized} • Nota Feliz`;
  };
  update();
  setInterval(update, 10000);
}

// Modo Protector de Pantalla (AOD)
function openScreensaver() {
  const overlay = document.getElementById('screensaverOverlay');
  if (overlay) overlay.classList.remove('hidden');

  // Inyectar dinámicamente las 3 tareas más prioritarias con íconos vectoriales planos
  const tasksCont = document.getElementById('screensaverTasksDynamic');
  if (tasksCont) {
    const active = notes.filter(n => !n.completed).slice(0, 3);
    tasksCont.innerHTML = active.map(n => `
      <div class="aod-task ${n.urgency === 'urgent' ? 'red' : 'yellow'}">
        <span class="aod-icon">${n.urgency === 'urgent' ? ICONS.urgentDot : ICONS.clock}</span>
        <div class="aod-info">
          <span class="aod-task-title">${escapeHtml(n.lines ? n.lines[0].text : n.text)}</span>
          <span class="aod-task-meta">${escapeHtml(n.alertDateTimeStr || n.triggerLabel || 'Alarma')}</span>
        </div>
      </div>
    `).join('');
  }
}

function closeScreensaver() {
  const overlay = document.getElementById('screensaverOverlay');
  if (overlay) overlay.classList.add('hidden');
}

// Configuración & Respaldo
function openSettings() {
  renderSettingsLocations();
  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.add('hidden');
}

// Requerimiento 3: Exportar notas, audios, fotos y videos a archivo JSON
function exportDataJSON() {
  const exportPayload = {
    appName: 'Nota Feliz',
    version: '2.0',
    exportDate: new Date().toISOString(),
    totalNotes: notes.length,
    notes: notes,
    geoPresets: geoPresets,
    timePresets: timePresets
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const dlAnchor = document.createElement('a');
  const d = new Date();
  const dateTag = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  dlAnchor.setAttribute('href', dataStr);
  dlAnchor.setAttribute('download', `notafeliz_respaldo_${dateTag}.json`);
  dlAnchor.click();
}

// Requerimiento 3: Restaurar notas, audios, fotos y configuraciones desde archivo JSON
function importDataJSON(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      let importedNotes = null;

      if (Array.isArray(data)) {
        importedNotes = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.notes)) {
          importedNotes = data.notes;
        }
        if (Array.isArray(data.geoPresets)) {
          geoPresets = data.geoPresets;
          localStorage.setItem('posty_geo_presets_v2', JSON.stringify(geoPresets));
        }
        if (Array.isArray(data.timePresets)) {
          timePresets = data.timePresets;
          localStorage.setItem('posty_time_presets_v2', JSON.stringify(timePresets));
        }
      }

      if (!importedNotes || !Array.isArray(importedNotes)) {
        throw new Error('El archivo no contiene un formato de notas válido.');
      }

      notes = importedNotes;
      saveToStorage();
      renderBoard();
      renderTriggerPresets();
      renderSettingsLocations();
      alert(`✓ Respaldo restaurado exitosamente: ${notes.length} notas con sus audios y fotos recuperadas.`);
      closeSettings();
    } catch (err) {
      alert('Error al restaurar respaldo JSON: ' + (err.message || 'Formato de archivo inválido.'));
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function resetDemoData() {
  if (confirm('¿Desea restaurar las notas de demostración iniciales de Nota Feliz?')) {
    notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
    timePresets = JSON.parse(JSON.stringify(DEFAULT_TIME_PRESETS));
    geoPresets = JSON.parse(JSON.stringify(DEFAULT_GEO_PRESETS));
    localStorage.removeItem('posty_time_presets_v2');
    localStorage.removeItem('posty_geo_presets_v2');
    saveToStorage();
    renderBoard();
    renderTriggerPresets();
    renderSettingsLocations();
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
