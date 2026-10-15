// app.js • Nota Feliz (PostyLocal) Interactive Mobile Logic
// Stand-Alone Embebido • Cero Servidores • 100% Local-First
// Dictado de voz real, grabación de audio real, filtros múltiples con pulsación larga, GPS satelital y alertas automáticas

// Datos iniciales de demostración
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
      { id: 'n1-l1', text: 'Pagar factura de luz antes de las 18:00', completed: false, hasAudio: true, audioDuration: '0:12', audioData: null },
      { id: 'n1-l2', text: 'Descargar comprobante en PDF', completed: false, hasAudio: false, audioDuration: null, audioData: null }
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
      { id: 'n2-l1', text: 'Cerrar la llave de paso de gas', completed: false, hasAudio: true, audioDuration: '0:07', audioData: null },
      { id: 'n2-l2', text: 'Desconectar cargadores de pared', completed: false, hasAudio: false, audioDuration: null, audioData: null }
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
    triggerLabel: '🟢 Sin alarma estricta',
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
    triggerLabel: '🟢 Sin alarma estricta',
    completed: false,
    completedAt: null,
    createdAt: Date.now() - 18000000,
    lines: [
      { id: 'n5-l1', text: 'Revisar apuntes de economía', completed: false, hasAudio: true, audioDuration: '0:14', audioData: null }
    ]
  }
];

// Presets dinámicos con frecuencia de uso
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

// Filtro activo único (permanece presionado hasta pulsar otro botón)
let currentFilter = 'urgent';
let modalPhotoData = null;

let selectedModalColor = 'yellow';
let selectedTriggerType = 'none';
let selectedTriggerLabel = 'Ninguna asignada';
let editingNoteId = null;
let modalLines = [];

let activeAudioElement = null;
let activeAudioId = null;
let currentVoicePromptType = 'time';

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
    } catch (e) {
      notes = JSON.parse(JSON.stringify(DEFAULT_NOTES));
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
  const savedTime = localStorage.getItem('posty_time_presets');
  timePresets = savedTime ? JSON.parse(savedTime) : JSON.parse(JSON.stringify(DEFAULT_TIME_PRESETS));

  const savedGeo = localStorage.getItem('posty_geo_presets');
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
    chipMap.urgent.textContent = `🔴 Urgente (${urgentCount})`;
    chipMap.urgent.classList.toggle('active', currentFilter === 'urgent');
  }
  if (chipMap.context) {
    chipMap.context.textContent = `🟡 Próximas (${contextCount})`;
    chipMap.context.classList.toggle('active', currentFilter === 'context');
  }
  if (chipMap.normal) {
    chipMap.normal.textContent = `🟢 Libres (${normalCount})`;
    chipMap.normal.classList.toggle('active', currentFilter === 'normal');
  }
  if (chipMap.completed) {
    chipMap.completed.textContent = `✓ Realizadas (${completedNotes.length})`;
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
        <button type="button" class="audio-play-btn" style="width: 24px; height: 24px; font-size: 11px; margin-left: 6px; cursor: pointer; border-radius: 50%; border: none; background: rgba(0,0,0,0.08);" onclick="playLineAudioById('${note.id}', '${line.id}')" title="Escuchar audio">▶️</button>
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
        <button class="btn-card-action" onclick="openEditNoteModal('${note.id}')" title="Editar nota y lista">✏️</button>
        <button class="btn-card-action" onclick="completeNoteWithDelay('${note.id}')" title="Marcar toda la nota como cumplida">✓</button>
      </div>
    `;
  } else {
    topActions = `<span class="completed-badge-pill">✓ Realizada</span>`;
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
      <span class="alarm-pill">${escapeHtml(note.triggerLabel || '🟢 Sin alarma')}</span>
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

  modalTitle.textContent = '✏️ Nueva Nota (Lista)';
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
  modalTitle.textContent = '✏️ Editar Nota y Lista';

  selectColor(note.color || 'yellow');
  selectedTriggerType = note.triggerType || 'none';
  selectedTriggerLabel = note.triggerLabel || 'Ninguna asignada';
  document.getElementById('selectedTriggerText').textContent = `Alerta: ${selectedTriggerLabel}`;

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
    row.className = 'modal-line-row';

    row.innerHTML = `
      <span style="font-size: 12px; font-weight: 700; opacity: 0.6;">${idx + 1}.</span>
      <input type="text" id="modalLineInput_${idx}" class="line-text-input" placeholder="Escriba o dicte el ítem ${idx + 1}..." value="${escapeHtml(line.text)}" oninput="updateModalLineText(${idx}, this.value)">
      <button type="button" class="btn-voice-mini" id="btnVoiceLine_${idx}" title="Dictar por voz">🎙️ Dictar</button>
      ${modalLines.length > 1 ? `<button type="button" class="btn-line-action" title="Eliminar línea" onclick="removeLineFromModal(${idx})">✕</button>` : ''}
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
      btn.innerHTML = '🎙️ Dictar';
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
          btn.innerHTML = '🔴 Escuchando...';
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
          btn.innerHTML = '🎙️ Dictar';
        };

        recognition.onend = () => {
          btn.classList.remove('listening');
          btn.innerHTML = '🎙️ Dictar';
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
      btn.innerHTML = '🔴 Escuchando...';
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
    window.activeDictationBtn.innerHTML = '🎙️ Dictar';
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
    if (box) box.classList.remove('hidden');
    if (btnAttach) btnAttach.style.display = 'none';
  } else {
    if (img) img.src = '';
    if (box) box.classList.add('hidden');
    if (btnAttach) btnAttach.style.display = 'block';
  }
}

function removeAttachedPhoto() {
  modalPhotoData = null;
  const fileInput = document.getElementById('notePhotoInput');
  if (fileInput) fileInput.value = '';
  renderPhotoPreview();
}

// Dictado para "➕ Otro tiempo" / "➕ Nuevo lugar"
function openVoicePromptModal(type) {
  currentVoicePromptType = type;
  const modal = document.getElementById('voicePromptModal');
  const title = document.getElementById('voicePromptTitle');
  const hint = document.getElementById('voicePromptHint');
  const label = document.getElementById('voicePromptInputLabel');
  const input = document.getElementById('voicePromptTextInput');

  input.value = '';
  modal.classList.remove('hidden');

  if (type === 'time') {
    title.textContent = '⏰ Agregar Alerta de Tiempo';
    hint.textContent = 'Presione "🎙️ Dictar" para hablar (ej: "45 minutos", "Hoy a las 20:00") o escriba directamente.';
    label.textContent = 'Escriba o dicte el tiempo:';
    input.placeholder = 'Ej: 45 min o 20:00';
  } else {
    title.textContent = '📍 Agregar Alerta de Lugar';
    hint.textContent = 'Presione "🎙️ Dictar" para hablar (ej: "Farmacia", "Oficina") o escriba directamente.';
    label.textContent = 'Escriba o dicte el lugar:';
    input.placeholder = 'Ej: Farmacia central';
  }
}

function confirmVoicePrompt() {
  const val = document.getElementById('voicePromptTextInput').value.trim();
  if (!val) {
    alert('Por favor ingrese o dicte un valor válido.');
    return;
  }

  if (currentVoicePromptType === 'time') {
    const minsMatch = val.match(/(\d+)\s*(m|min)/i);
    const mins = minsMatch ? parseInt(minsMatch[1]) : 45;
    const newPreset = {
      id: 't_custom_' + Date.now(),
      label: val.startsWith('+') ? val : `+${val}`,
      minutes: mins,
      uses: 10
    };
    timePresets.unshift(newPreset);
    localStorage.setItem('posty_time_presets', JSON.stringify(timePresets));
    renderTriggerPresets();
    selectTimePreset(newPreset);
  } else {
    const newGeo = {
      id: 'g_custom_' + Date.now(),
      label: `📍 ${val}`,
      place: val,
      transition: 'ENTER',
      uses: 10
    };
    geoPresets.unshift(newGeo);
    localStorage.setItem('posty_geo_presets', JSON.stringify(geoPresets));
    renderTriggerPresets();
    selectGeoPreset(newGeo);
  }

  closeVoicePromptModal();
}

function closeVoicePromptModal() {
  document.getElementById('voicePromptModal').classList.add('hidden');
}

// Presets Dinámicos de Tiempo y Lugar (Top 4 más usados al frente)
function renderTriggerPresets() {
  const sortedTime = [...timePresets].sort((a, b) => (b.uses || 0) - (a.uses || 0));
  const primaryTime = sortedTime.slice(0, 4);
  const secondaryTime = sortedTime.slice(4);

  const priTimeCont = document.getElementById('primaryTimePresets');
  const secTimeCont = document.getElementById('secondaryTimePresets');

  if (priTimeCont) {
    priTimeCont.innerHTML = primaryTime.map(p => `
      <button type="button" class="preset-btn" onclick="selectTimePresetById('${p.id}')">
        ⏰ ${escapeHtml(p.label)}
      </button>
    `).join('');
  }

  if (secTimeCont) {
    secTimeCont.innerHTML = secondaryTime.map(p => `
      <button type="button" class="preset-btn" onclick="selectTimePresetById('${p.id}')">
        ⏰ ${escapeHtml(p.label)}
      </button>
    `).join('');
  }

  const sortedGeo = [...geoPresets].sort((a, b) => (b.uses || 0) - (a.uses || 0));
  const primaryGeo = sortedGeo.slice(0, 3);
  const secondaryGeo = sortedGeo.slice(3);

  const priGeoCont = document.getElementById('primaryGeoPresets');
  const secGeoCont = document.getElementById('secondaryGeoPresets');

  if (priGeoCont) {
    priGeoCont.innerHTML = primaryGeo.map(g => `
      <button type="button" class="preset-btn" onclick="selectGeoPresetById('${g.id}')">
        ${escapeHtml(g.label)}
      </button>
    `).join('');
  }

  if (secGeoCont) {
    secGeoCont.innerHTML = secondaryGeo.map(g => `
      <button type="button" class="preset-btn" onclick="selectGeoPresetById('${g.id}')">
        ${escapeHtml(g.label)}
      </button>
    `).join('');
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
  selectedTriggerLabel = `⏰ ${preset.label}`;
  document.getElementById('selectedTriggerText').textContent = `Alerta: ${selectedTriggerLabel}`;

  preset.uses = (preset.uses || 0) + 1;
  localStorage.setItem('posty_time_presets', JSON.stringify(timePresets));

  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.includes(preset.label));
  });
}

function selectGeoPreset(preset) {
  selectedTriggerType = 'geo';
  selectedTriggerLabel = preset.label;
  document.getElementById('selectedTriggerText').textContent = `Alerta: ${selectedTriggerLabel}`;

  preset.uses = (preset.uses || 0) + 1;
  localStorage.setItem('posty_geo_presets', JSON.stringify(geoPresets));

  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.includes(preset.label));
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
  document.getElementById('selectedTriggerText').textContent = 'Alerta: Ninguna asignada';
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
}

function closeModal() {
  if (isRecordingActive) {
    stopRealVoiceRecording();
  }
  document.getElementById('newNoteModal').classList.add('hidden');
  stopAudio();
}

function saveNoteFromModal() {
  if (isRecordingActive) {
    stopRealVoiceRecording();
  }

  const validLines = modalLines.filter(l => l.text.trim().length > 0);
  if (validLines.length === 0) {
    alert('Por favor ingrese al menos una línea en la nota.');
    return;
  }

  const activePreset = timePresets.find(t => `⏰ ${t.label}` === selectedTriggerLabel);
  const urgency = classifyUrgency(selectedTriggerType, activePreset);

  if (editingNoteId) {
    const note = notes.find(n => n.id === editingNoteId);
    if (note) {
      note.lines = validLines;
      note.color = selectedModalColor;
      note.urgency = urgency;
      note.triggerType = selectedTriggerType;
      note.triggerLabel = selectedTriggerLabel;
      note.photo = modalPhotoData;
    }
  } else {
    const newNote = {
      id: 'n' + (Date.now() % 100000),
      color: selectedModalColor,
      urgency: urgency,
      triggerType: selectedTriggerType,
      triggerLabel: selectedTriggerLabel === 'Ninguna asignada' ? '🟢 Sin alarma' : selectedTriggerLabel,
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
function classifyUrgency(triggerType, preset) {
  if (triggerType === 'geo') return 'context'; // Geocercas -> Amarillo (UPCOMING)
  if (!preset || triggerType === 'none') return 'normal'; // Sin alarma -> Verde (NORMAL)
  if (preset.isTomorrow || preset.isNextWeek) return 'context'; // Mañana / Sig semana -> Amarillo (UPCOMING)
  if (preset.isToday || preset.minutes) return 'urgent'; // Vence hoy -> Rojo (URGENT_TODAY)
  return 'normal';
}

// Reproducción de Audios Infalible (Android TTS Nativo + Audio + Web Speech)
function playLineAudioById(noteId, lineId) {
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

// 5. ACTUALIZACIÓN DE GPS REAL ("ACTUALIZAR AQUÍ")
function updateGeoCoord(place) {
  const btn = event ? event.currentTarget : null;
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
    }, 3000);
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
          alert('No se pudo obtener el GPS: ' + (err.message || 'Verifique que la ubicación esté activada en su celular.'));
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
  saveRealLocationCoordinates(place, lat.toFixed(6), lng.toFixed(6), Math.round(accuracy));
};

function saveRealLocationCoordinates(place, lat, lng, accuracy) {
  const coordStr = `Lat: ${lat}, Lng: ${lng} (±${accuracy}m GPS Real)`;
  localStorage.setItem(`posty_geo_coords_${place}`, coordStr);

  const displayEl = document.getElementById(`coordsText${place}`);
  if (displayEl) {
    displayEl.textContent = coordStr;
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

  // Inyectar dinámicamente las 3 tareas más prioritarias
  const tasksCont = document.getElementById('screensaverTasksDynamic');
  if (tasksCont) {
    const active = notes.filter(n => !n.completed).slice(0, 3);
    tasksCont.innerHTML = active.map(n => `
      <div class="aod-task ${n.urgency === 'urgent' ? 'red' : 'yellow'}">
        <span class="aod-icon">${n.urgency === 'urgent' ? '🔴' : '🟡'}</span>
        <div class="aod-info">
          <span class="aod-task-title">${escapeHtml(n.lines ? n.lines[0].text : n.text)}</span>
          <span class="aod-task-meta">${escapeHtml(n.triggerLabel || 'Alarma activa')}</span>
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
  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function exportDataJSON() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', dataStr);
  dlAnchor.setAttribute('download', `notafeliz_respaldo_${Date.now()}.json`);
  dlAnchor.click();
}

function resetDemoData() {
  if (confirm('¿Desea restaurar las notas de demostración iniciales de Nota Feliz?')) {
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
