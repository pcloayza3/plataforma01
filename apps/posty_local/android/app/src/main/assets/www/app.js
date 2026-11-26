// app.js • UnLethe Interactive Mobile Logic
// Stand-Alone Embebido • Cero Servidores • 100% Local-First
// Sistema de Íconos Minimalistas 2D Planos y Monocromáticos (Negro en claro / Blanco en oscuro)

const ICONS = {
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

// ==========================================
// SISTEMA DE INTERNACIONALIZACIÓN (i18n)
// Soporte Integral para Español (es) e English (en)
// ==========================================
const TRANSLATIONS = {
  es: {
    app_badge: "UnLethe",
    urgent_summary_format: "{total} actividades • {urgent} urgente",
    urgent_summary_format_plural: "{total} actividades • {urgent} urgentes",
    no_urgent_summary: "{total} actividades • ninguna urgente",
    all_caught_up: "¡Todo al día! Sin tareas pendientes",
    btn_settings_title: "Configuración de UnLethe",

    filter_urgent: "Urgente",
    filter_context: "Próximas",
    filter_normal: "Libres",
    filter_completed: "Realizadas",

    section_urgent: "URGENTE / VENCE HOY",
    section_context: "CONTEXTO & PRÓXIMAS (MAÑANA / GEOFENCE)",
    section_normal: "PENDIENTES LIBRES (SIN PLAZO FIJO)",
    section_completed: "TAREAS REALIZADAS (SOLO LECTURA Y ESCUCHA)",
    empty_board_section: "No hay notas en esta sección.",
    empty_board_hint: "Crea una nueva nota pulsando el botón + o dicta por voz.",

    card_complete: "✓ Completar",
    card_undo: "↺ Deshacer",
    card_edit: "Editar nota y lista",
    card_delete: "Eliminar",
    btn_create_note: "CREAR NOTA",

    modal_title_new: "Nueva Nota",
    modal_title_edit: "Editar Nota",
    placeholder_task: "Escribe o dicta una tarea...",
    placeholder_subtask: "Escribe o dicta una subtarea...",
    btn_add_line: "➕ Aumentar nueva línea de lista",
    label_color: "Color:",
    btn_attach_photo: "Adjuntar Foto (Opcional)",
    btn_remove_photo: "Quitar foto",
    tab_by_time: "Por tiempo",
    tab_by_geo: "Por ubicación",
    btn_no_alert: "🚫 Sin alerta",
    label_preset_times: "Horarios predefinidos:",
    btn_other_time: "➕ Otro tiempo",
    btn_more_times: "Ver más horarios",
    btn_hide_more: "Ocultar",
    label_preset_geo: "Lugares georreferenciados:",
    btn_new_place: "➕ Nuevo lugar",
    btn_more_places: "Ver más lugares",
    alert_none_assigned: "Alerta: Ninguna asignada",
    alert_no_alarm: "Alerta: Sin alarma",
    alert_prefix: "Alerta: ",
    btn_save_note: "Guardar Nota",

    settings_title: "Configuración de UnLethe",
    settings_theme_title: "Tema Visual de Fondo",
    theme_dark: "Oscuro",
    theme_light: "Claro",
    theme_system: "Sistema",
    settings_language_title: "Idioma / Language",
    settings_buttons_title: "Gestión de Botones de Alertas",
    settings_buttons_desc: "Personalice los accesos rápidos de alertas para asignar recordatorios en un toque.",
    settings_tab_time: "Alertas de tiempo",
    settings_tab_geo: "Alertas de ubicación",
    settings_time_desc: "Horarios predefinidos (+1 hora, Hoy 18:00, Mañana 09:00...):",
    btn_add_time_alert: "➕ Agregar alerta de tiempo",
    settings_geo_desc: "Lugares georreferenciados para alertar por proximidad (elegir en mapa o GPS):",
    btn_add_geo_place: "➕ Agregar nuevo lugar",

    settings_backup_title: "Respaldo y Soberanía Local",
    settings_backup_desc: "Exportar, importar JSON y restaurar notas",
    btn_back_to_settings: "Volver a Configuración",

    backup_sub_title: "Respaldo y Soberanía Local",
    backup_sub_desc: "Cree copias de seguridad de sus notas locales o restaure desde un archivo JSON.",
    btn_export_json: "Exportar Notas, Audios, Fotos y Videos (JSON)",
    btn_import_json: "Restaurar desde archivo JSON",
    btn_reset_initial: "Restaurar Datos Iniciales",
    privacy_callout: "🛡️ 100% Local-First: Todos los audios, textos, fotos y ubicaciones residen únicamente en este dispositivo.",
    btn_close: "Cerrar",

    push_app_name: "UnLethe • Recordatorio",
    push_title_default: "⏰ Recordatorio Automático",
    btn_push_complete: "✓ Completar",
    btn_push_snooze: "⏱️ Posponer 15m",

    confirm_delete_note: "¿Eliminar esta nota?",
    confirm_delete_preset: "¿Eliminar este botón predefinido?",
    confirm_reset_data: "¿Desea restaurar la nota limpia inicial de UnLethe?",
    backup_restored_success: "✓ Respaldo restaurado exitosamente: {count} notas con sus audios y fotos recuperadas.",
    backup_restore_error: "Error al restaurar respaldo JSON: ",
    invalid_file_format: "El archivo no contiene un formato de notas válido.",
    dictation_not_available: "Dictado por voz no disponible en este dispositivo.",
    uses_count: "usos",

    btn_cancel: "Cancelar",
    voice_modal_title: "Programar Alerta",
    voice_label_time: "Seleccione fecha y hora exacta de la alarma:",
    voice_time_hint: "La alarma se guardará con fecha y hora exacta y se mostrará en la nota.",
    voice_when_trigger: "¿Cuándo disparar la alarma?",
    voice_transition_enter: "🚗 Al llegar a",
    voice_transition_exit: "🚪 Al salir de",
    voice_label_placename: "Nombre del lugar:",
    voice_placeholder_geo: "Ej: Gimnasio, Farmacia, Casa...",
    geo_coverage_title: "📍 Área de Cobertura en el Mapa:",
    geo_coverage_hint: "✓ Geocerca lista en el mapa. Toque el mapa para moverla.",
    geo_slider_label: "🎯 Cobertura Geocerca:",
    geo_drag_hint: "Arrastre marcador o toque mapa para ubicar centro",
    btn_save_alert: "✓ Aceptar"
  },
  en: {
    app_badge: "UnLethe",
    urgent_summary_format: "{total} activities • {urgent} urgent",
    urgent_summary_format_plural: "{total} activities • {urgent} urgent",
    no_urgent_summary: "{total} activities • none urgent",
    all_caught_up: "All caught up! No pending tasks",
    btn_settings_title: "UnLethe Settings",

    filter_urgent: "Urgent",
    filter_context: "Upcoming",
    filter_normal: "General",
    filter_completed: "Done",

    section_urgent: "URGENT / DUE TODAY",
    section_context: "CONTEXT & UPCOMING (TOMORROW / GEOFENCE)",
    section_normal: "GENERAL PENDING (NO DEADLINE)",
    section_completed: "COMPLETED TASKS (READ & LISTEN ONLY)",
    empty_board_section: "No notes in this section.",
    empty_board_hint: "Create a new note by tapping + or use voice dictation.",

    card_complete: "✓ Complete",
    card_undo: "↺ Undo",
    card_edit: "Edit note and list",
    card_delete: "Delete",
    btn_create_note: "CREATE NOTE",

    modal_title_new: "New Note",
    modal_title_edit: "Edit Note",
    placeholder_task: "Write or speak a task...",
    placeholder_subtask: "Write or speak a subtask...",
    btn_add_line: "➕ Add new line to list",
    label_color: "Color:",
    btn_attach_photo: "Attach Photo (Optional)",
    btn_remove_photo: "Remove photo",
    tab_by_time: "By time",
    tab_by_geo: "By location",
    btn_no_alert: "🚫 No alert",
    label_preset_times: "Preset times:",
    btn_other_time: "➕ Other time",
    btn_more_times: "See more times",
    btn_hide_more: "Hide",
    label_preset_geo: "Georeferenced places:",
    btn_new_place: "➕ New place",
    btn_more_places: "See more places",
    alert_none_assigned: "Alert: None assigned",
    alert_no_alarm: "Alert: No alarm",
    alert_prefix: "Alert: ",
    btn_save_note: "Save Note",

    settings_title: "UnLethe Settings",
    settings_theme_title: "Visual Background Theme",
    theme_dark: "Dark",
    theme_light: "Light",
    theme_system: "System",
    settings_language_title: "Language / Idioma",
    settings_buttons_title: "Alert Buttons Management",
    settings_buttons_desc: "Customize quick alert shortcuts to set reminders in a single tap.",
    settings_tab_time: "Time alerts",
    settings_tab_geo: "Location alerts",
    settings_time_desc: "Preset times (+1 hour, Today 18:00, Tomorrow 09:00...):",
    btn_add_time_alert: "➕ Add time alert",
    settings_geo_desc: "Georeferenced places to alert by proximity (choose on map or GPS):",
    btn_add_geo_place: "➕ Add new place",

    settings_backup_title: "Local Backup & Sovereignty",
    settings_backup_desc: "Export, import JSON and restore notes",
    btn_back_to_settings: "Back to Settings",

    backup_sub_title: "Local Backup & Sovereignty",
    backup_sub_desc: "Create local backups of your notes or restore from a JSON file.",
    btn_export_json: "Export Notes, Audios, Photos and Videos (JSON)",
    btn_import_json: "Restore from JSON file",
    btn_reset_initial: "Restore Initial Data",
    privacy_callout: "🛡️ 100% Local-First: All audios, texts, photos and locations stay strictly on this device.",
    btn_close: "Close",

    push_app_name: "UnLethe • Reminder",
    push_title_default: "⏰ Automatic Reminder",
    btn_push_complete: "✓ Complete",
    btn_push_snooze: "⏱️ Snooze 15m",

    confirm_delete_note: "Delete this note?",
    confirm_delete_preset: "Delete this preset button?",
    confirm_reset_data: "Do you want to restore UnLethe's clean initial note?",
    backup_restored_success: "✓ Backup successfully restored: {count} notes with audios and photos recovered.",
    backup_restore_error: "Error restoring JSON backup: ",
    invalid_file_format: "File does not contain a valid notes format.",
    dictation_not_available: "Voice dictation not available on this device.",
    uses_count: "uses",

    btn_cancel: "Cancel",
    voice_modal_title: "Schedule Alert",
    voice_label_time: "Select exact date and time for alarm:",
    voice_time_hint: "The alarm will be saved with exact date & time and displayed on the note.",
    voice_when_trigger: "When to trigger the alarm?",
    voice_transition_enter: "🚗 Arriving at",
    voice_transition_exit: "🚪 Leaving",
    voice_label_placename: "Place name:",
    voice_placeholder_geo: "E.g. Gym, Pharmacy, Home...",
    geo_coverage_title: "📍 Coverage Area on Map:",
    geo_coverage_hint: "✓ Geofence ready on map. Tap map to move.",
    geo_slider_label: "🎯 Geofence Coverage:",
    geo_drag_hint: "Drag marker or tap map to position center",
    btn_save_alert: "✓ Accept"
  }
};

let currentLanguage = localStorage.getItem('posty_language') || 'es';

function t(key, fallback = '') {
  const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.es;
  return dict[key] || TRANSLATIONS.es[key] || fallback || key;
}

function setAppLanguage(lang, save = true) {
  currentLanguage = (lang === 'en') ? 'en' : 'es';
  if (save) {
    localStorage.setItem('posty_language', currentLanguage);
  }

  const btnEs = document.getElementById('langBtnEs');
  const btnEn = document.getElementById('langBtnEn');
  if (btnEs) btnEs.classList.toggle('active', currentLanguage === 'es');
  if (btnEn) btnEn.classList.toggle('active', currentLanguage === 'en');

  applyTranslations();
  renderBoard();
  renderTriggerPresets();
  renderSettingsTimePresets();
  renderSettingsLocations();
  updateClockAndDates();
}

function initAppLanguage() {
  const savedLang = localStorage.getItem('posty_language') || 'es';
  setAppLanguage(savedLang, false);
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) {
      if (val.includes('<') && val.includes('>')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) el.placeholder = val;
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = t(key);
    if (val) el.title = val;
  });
}

function formatPresetLabel(label) {
  if (!label) return '';
  if (currentLanguage === 'en') {
    const map = {
      '+1 hora': '+1 hour',
      '+1 hour': '+1 hour',
      'Hoy 18:00': 'Today 18:00',
      'Hoy a las 18:00': 'Today at 18:00',
      'Mañana 09:00': 'Tomorrow 09:00',
      'Mañana medio día': 'tomorrow at noon',
      'Mañana a mediodía': 'tomorrow at noon',
      'tomorrow at noon': 'tomorrow at noon',
      'Tomorrow at noon': 'tomorrow at noon',
      'Al salir de casa': 'Leaving Home',
      'Al salir de Casa': 'Leaving Home',
      'Leaving Home': 'Leaving Home',
      'Al llegar a Trabajo': 'Arriving at Work',
      'Al llegar al Trabajo': 'Arriving at Work',
      'Arriving at Work': 'Arriving at Work',
      'Arraiving at Work': 'Arriving at Work',
      'Al llegar a Casa': 'Arriving at Home',
      'Al salir de Trabajo': 'Leaving Work',
      'Casa': 'Home',
      'Supermercado': 'Supermarket',
      'Trabajo': 'Work',
      'Sin alarma': 'No alarm',
      'Ninguna asignada': 'None assigned'
    };
    if (map[label]) return map[label];

    if (label.startsWith('Al llegar a ')) {
      const place = label.substring('Al llegar a '.length).trim();
      const placeEn = (place === 'Casa' ? 'Home' : (place === 'Trabajo' ? 'Work' : place));
      return 'Arriving at ' + placeEn;
    }
    if (label.startsWith('Al llegar al ')) {
      const place = label.substring('Al llegar al '.length).trim();
      const placeEn = (place === 'Casa' ? 'Home' : (place === 'Trabajo' ? 'Work' : place));
      return 'Arriving at ' + placeEn;
    }
    if (label.startsWith('Al salir de ')) {
      const place = label.substring('Al salir de '.length).trim();
      const placeEn = (place === 'Casa' ? 'Home' : (place === 'Trabajo' ? 'Work' : place));
      return 'Leaving ' + placeEn;
    }
    if (label.startsWith('Mañana a mediodía')) {
      return label.replace('Mañana a mediodía', 'Tomorrow at noon');
    }
    if (label.startsWith('Mañana 12:00')) {
      return label.replace('Mañana 12:00', 'Tomorrow at noon');
    }
    if (label.startsWith('Mañana ')) {
      return label.replace('Mañana ', 'Tomorrow ');
    }
    if (label.startsWith('Hoy ')) {
      return label.replace('Hoy ', 'Today ');
    }
  } else {
    // Modo Español
    const mapEs = {
      '+1 hour': '+1 hora',
      '+1 hora': '+1 hora',
      'tomorrow at noon': 'Mañana a mediodía',
      'Tomorrow at noon': 'Mañana a mediodía',
      'Mañana medio día': 'Mañana a mediodía',
      'Mañana a mediodía': 'Mañana a mediodía',
      'Leaving Home': 'Al salir de Casa',
      'Al salir de Casa': 'Al salir de Casa',
      'Al salir de casa': 'Al salir de Casa',
      'Arriving at Work': 'Al llegar a Trabajo',
      'Arraiving at Work': 'Al llegar a Trabajo',
      'Al llegar a Trabajo': 'Al llegar a Trabajo',
      'Home': 'Casa',
      'Work': 'Trabajo',
      'Supermarket': 'Supermercado',
      'No alarm': 'Sin alarma',
      'None assigned': 'Ninguna asignada'
    };
    if (mapEs[label]) return mapEs[label];

    if (label.startsWith('Leaving ')) {
      const place = label.substring('Leaving '.length).trim();
      const placeEs = (place === 'Home' ? 'Casa' : (place === 'Work' ? 'Trabajo' : place));
      return 'Al salir de ' + placeEs;
    }
    if (label.startsWith('Arriving at ')) {
      const place = label.substring('Arriving at '.length).trim();
      const placeEs = (place === 'Home' ? 'Casa' : (place === 'Work' ? 'Trabajo' : place));
      return 'Al llegar a ' + placeEs;
    }
    if (label.startsWith('Tomorrow at noon')) {
      return label.replace('Tomorrow at noon', 'Mañana a mediodía');
    }
    if (label.startsWith('tomorrow at noon')) {
      return label.replace('tomorrow at noon', 'Mañana a mediodía');
    }
    if (label.startsWith('Tomorrow ')) {
      return label.replace('Tomorrow ', 'Mañana ');
    }
    if (label.startsWith('Today ')) {
      return label.replace('Today ', 'Hoy ');
    }
  }
  return label;
}

function updateClockAndDates() {
  const el = document.getElementById('currentDateDisplay');
  const aod = document.getElementById('aodClock');
  const aodDate = document.getElementById('aodDate');
  const now = new Date();

  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateFormatted = now.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'es-ES', options);
  const capitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  if (el) el.textContent = capitalized;

  const hrs = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  if (aod) aod.textContent = `${hrs}:${mins}`;
  if (aodDate) aodDate.textContent = `${capitalized} • UnLethe`;
}

// Requerimiento: Al instalar la app, se crea limpia con una sola nota urgente (+5 minutos)
function createDefaultInitialNotes() {
  const targetTime = Date.now() + 5 * 60 * 1000;
  const d = new Date(targetTime);
  const hrs = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return [
    {
      id: 'n_welcome',
      color: 'yellow',
      urgency: 'urgent',
      triggerType: 'time',
      triggerLabel: `Hoy ${hrs}:${mins} (+5m)`,
      alertTimestamp: targetTime,
      alertDateTimeStr: `Hoy ${hrs}:${mins}`,
      completed: false,
      completedAt: null,
      createdAt: Date.now(),
      lines: [
        { id: 'ml-welcome-1', text: (currentLanguage === 'en' ? 'Welcome to UnLethe' : 'Bienvenido a UnLethe'), completed: false, hasAudio: false, audioDuration: null, audioData: null }
      ]
    }
  ];
}

const DEFAULT_NOTES = createDefaultInitialNotes();

// Presets dinámicos: Exactamente las 2 opciones requeridas por defecto (+1 hora y Mañana a mediodía)
const DEFAULT_TIME_PRESETS = [
  { id: 't60', label: '+1 hora', minutes: 60, uses: 10 },
  { id: 't_manana12', label: 'Mañana a mediodía', timeStr: '12:00', isTomorrow: true, uses: 8 }
];

// Georreferencias por defecto: Casa/Home ("Leaving Home") y Trabajo/Work ("Arriving at Work")
const DEFAULT_GEO_PRESETS = [
  { id: 'g_casa', label: 'Al salir de Casa', place: 'Casa', transition: 'EXIT', uses: 10 },
  { id: 'g_trabajo', label: 'Al llegar a Trabajo', place: 'Trabajo', transition: 'ENTER', uses: 8 }
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
let selectedGeoPlace = null;
let selectedGeoTransition = 'ENTER';
let editingNoteId = null;
let modalLines = [];

let activeAudioElement = null;
let activeAudioId = null;
let currentVoicePromptType = 'time';
let currentGeoTransition = 'ENTER'; // 'ENTER' (Al llegar a) o 'EXIT' (Al salir de)
let pendingNewPlaceCoords = null;

// Ubicación satelital del usuario en tiempo real
let currentUserLat = null;
let currentUserLng = null;
let currentUserAccuracy = null;
let userLocationMarker = null;

// Reconocimiento de Voz Web (Web Speech API)
let postyRecognitionInstance = null;

// Versionado de instalación: Al instalarse o actualizarse presets, se ejecuta de manera 100% automática la restauración
const APP_DATA_VERSION = 'v5_presets_clean';

function checkInitialInstallation() {
  const currentVer = localStorage.getItem('posty_app_installed_version');
  if (currentVer !== APP_DATA_VERSION) {
    initializeDefaultFreshData();
    localStorage.setItem('posty_app_installed_version', APP_DATA_VERSION);
  }
}

function initializeDefaultFreshData() {
  notes = createDefaultInitialNotes();
  timePresets = JSON.parse(JSON.stringify(DEFAULT_TIME_PRESETS));
  geoPresets = JSON.parse(JSON.stringify(DEFAULT_GEO_PRESETS));

  localStorage.removeItem('posty_time_presets_v2');
  localStorage.removeItem('posty_geo_presets_v2');
  localStorage.removeItem('posty_deleted_geo_presets');

  // Coordenadas iniciales para los 2 lugares predeterminados (Casa y Trabajo)
  localStorage.setItem('posty_geo_coords_Casa', 'Lat: -17.783300, Lng: -63.182100 (Radio: 50m GPS)');
  localStorage.setItem('posty_geo_coords_Trabajo', 'Lat: -17.778609, Lng: -63.175607 (Radio: 50m GPS)');
  localStorage.removeItem('posty_geo_coords_Supermercado');

  saveToStorage();
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initAppTheme();
  initAppLanguage();
  checkInitialInstallation();
  loadNotes();
  loadPresets();
  setupFilterButtons();
  
  // Requerimiento: Iniciar siempre mostrando las notas urgentes
  handleFilterClick('urgent');

  renderTriggerPresets();
  startClockUpdater();
  startAutomaticAlertMonitor();
  syncAllAlarmsToNative();

  // Asegurar que inicie limpio sin modales abiertos
  closeModal();
  closeVoicePromptModal();
  closeSettings();

  // Conectar dictado estilo clinik_local en el modal de otro tiempo / nuevo lugar
  setupVoiceDictation('btnVoicePromptDictar', 'voicePromptTextInput');

  // Ajuste para que el teclado androide no tape el campo de texto del nuevo lugar y vista previa dinámica
  const geoTextInput = document.getElementById('voicePromptTextInput');
  if (geoTextInput) {
    geoTextInput.addEventListener('input', updateGeoFinalTextPreview);
    geoTextInput.addEventListener('focus', () => {
      setTimeout(() => {
        geoTextInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  }

  // Iniciar monitoreo continuo de geolocalización para alertas de entrada y salida
  startContinuousLocationEngine();
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
      if (!Array.isArray(notes) || notes.length === 0) {
        notes = createDefaultInitialNotes();
        saveToStorage();
      } else {
        // Reclasificar según regla estricta: hoy -> urgente, otras fechas/geo -> próximas, sin alertas -> libres
        notes.forEach(note => {
          note.urgency = classifyUrgency(note.triggerType, null, note.alertTimestamp, note.alertDateTimeStr || note.triggerLabel);
        });
      }
    } catch (e) {
      notes = createDefaultInitialNotes();
      saveToStorage();
    }
  } else {
    notes = createDefaultInitialNotes();
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
  ['Casa', 'Trabajo'].forEach(p => {
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

  const urgentText = t('filter_urgent');
  const contextText = t('filter_context');
  const normalText = t('filter_normal');
  const doneText = t('filter_completed');

  if (chipMap.urgent) {
    chipMap.urgent.innerHTML = (currentFilter === 'urgent') ? `🔴 <span>${urgentText} (${urgentCount})</span>` : '🔴';
    chipMap.urgent.classList.toggle('active', currentFilter === 'urgent');
  }
  if (chipMap.context) {
    chipMap.context.innerHTML = (currentFilter === 'context') ? `🟡 <span>${contextText} (${contextCount})</span>` : '🟡';
    chipMap.context.classList.toggle('active', currentFilter === 'context');
  }
  if (chipMap.normal) {
    chipMap.normal.innerHTML = (currentFilter === 'normal') ? `🟢 <span>${normalText} (${normalCount})</span>` : '🟢';
    chipMap.normal.classList.toggle('active', currentFilter === 'normal');
  }
  if (chipMap.completed) {
    chipMap.completed.innerHTML = (currentFilter === 'completed') ? `✓ <span>${doneText} (${completedNotes.length})</span>` : '✓';
    chipMap.completed.classList.toggle('active', currentFilter === 'completed');
  }

  const urgentSummary = document.getElementById('urgentSummaryText');
  if (urgentSummary) {
    const format = (urgentCount === 1) ? t('urgent_summary_format') : t('urgent_summary_format_plural');
    urgentSummary.textContent = format.replace('{total}', activeNotes.length).replace('{urgent}', urgentCount);
  }

  const secUrgent = document.querySelector('#sectionUrgent .section-label span:last-child');
  const secContext = document.querySelector('#sectionContext .section-label span:last-child');
  const secNormal = document.querySelector('#sectionNormal .section-label span:last-child');
  const secCompleted = document.querySelector('#sectionCompleted .section-label span:last-child');
  if (secUrgent) secUrgent.textContent = t('section_urgent');
  if (secContext) secContext.textContent = t('section_context');
  if (secNormal) secNormal.textContent = t('section_normal');
  if (secCompleted) secCompleted.textContent = t('section_completed');
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
        <button class="btn-card-action" onclick="openEditNoteModal('${note.id}')" title="${t('card_edit')}">${ICONS.edit}</button>
        <button class="btn-card-action" onclick="completeNoteWithDelay('${note.id}')" title="${t('card_complete')}">${ICONS.check}</button>
      </div>
    `;
  } else {
    topActions = `<span class="completed-badge-pill">${ICONS.check} ${t('filter_completed')}</span>`;
  }

  let colorStrip = '';
  if (!isCompletedView) {
    colorStrip = `
      <div class="card-color-strip" title="Color">
        <span class="card-dot-opt opt-yellow" onclick="changeCardColor('${note.id}', 'yellow')"></span>
        <span class="card-dot-opt opt-green" onclick="changeCardColor('${note.id}', 'green')"></span>
        <span class="card-dot-opt opt-blue" onclick="changeCardColor('${note.id}', 'blue')"></span>
        <span class="card-dot-opt opt-pink" onclick="changeCardColor('${note.id}', 'pink')"></span>
        <span class="card-dot-opt opt-purple" onclick="changeCardColor('${note.id}', 'purple')"></span>
      </div>
    `;
  } else {
    colorStrip = `<span class="read-only-notice">${t('card_undo')}</span>`;
  }

  const trigIcon = note.triggerType === 'geo' ? ICONS.pin : (note.triggerType === 'time' ? ICONS.clock : ICONS.listIcon);
  const trigText = formatPresetLabel(note.alertDateTimeStr || note.triggerLabel || t('alert_no_alarm'));

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
        if (window.AndroidBridge && window.AndroidBridge.cancelNativeAlarm) {
          window.AndroidBridge.cancelNativeAlarm(noteId);
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
  selectedGeoPlace = null;
  selectedGeoTransition = 'ENTER';
  const modal = document.getElementById('newNoteModal');
  const modalTitle = document.getElementById('modalTitle');

  notifyModalState(true);
  modal.classList.remove('hidden');
  resetModalForm();
  renderModalLines();
  renderPhotoPreview();
  renderTriggerPresets();
  switchAlertTab('time');
  selectNoAlert();

  modalTitle.textContent = t('modal_title_new');
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

  notifyModalState(true);
  modal.classList.remove('hidden');
  modalTitle.textContent = t('modal_title_edit');

  selectColor(note.color || 'yellow');
  selectedTriggerType = note.triggerType || 'none';
  selectedTriggerLabel = note.triggerLabel || 'Ninguna asignada';
  selectedGeoPlace = note.geoPlace || null;
  selectedGeoTransition = note.geoTransition || 'ENTER';
  const selTrig = document.getElementById('selectedTriggerText');
  if (selTrig) selTrig.textContent = `${t('alert_prefix')} ${formatPresetLabel(selectedTriggerLabel)}`;

  renderModalLines();
  renderPhotoPreview();
  renderTriggerPresets();

  if (note.triggerType === 'geo') {
    switchAlertTab('geo');
  } else {
    switchAlertTab('time');
  }

  if (!note.triggerType || note.triggerType === 'none') {
    selectNoAlert();
  } else {
    const btnNoAlert = document.getElementById('btnSelectNoAlert');
    if (btnNoAlert) btnNoAlert.classList.remove('active');
  }
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

// Modal para "➕ Otro tiempo" / "➕ Nuevo lugar" / "🗺️ Elegir de mapa"
function openVoicePromptModal(type, placeToEdit = null) {
  currentVoicePromptType = type;
  notifyModalState(true);
  const modal = document.getElementById('voicePromptModal');
  const title = document.getElementById('voicePromptTitle');
  const timeSection = document.getElementById('voicePromptTimeSection');
  const geoSection = document.getElementById('voicePromptGeoSection');
  const dtInput = document.getElementById('voicePromptDateTimeInput');
  const geoInput = document.getElementById('voicePromptTextInput');

  pendingNewPlaceCoords = null;
  const statusEl = document.getElementById('newPlaceCoordsStatus');
  if (statusEl) {
    statusEl.textContent = '✓ Geocerca lista en el mapa. Toque el mapa para moverla.';
    statusEl.style.color = '#10B981';
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
    title.textContent = placeToEdit ? `Ubicación: ${placeToEdit}` : 'Agregar Nuevo Lugar';
    if (timeSection) timeSection.classList.add('hidden');
    if (geoSection) geoSection.classList.remove('hidden');

    let initLat = currentMapLat;
    let initLng = currentMapLng;
    let initRadius = currentMapRadius;

    if (placeToEdit) {
      if (geoInput) geoInput.value = placeToEdit;
      const matched = geoPresets.find(g => (g.place || g.label) === placeToEdit || g.label === placeToEdit);
      const isExit = (matched && matched.transition === 'EXIT') || placeToEdit.toLowerCase().includes('salir');
      selectGeoTransition(isExit ? 'EXIT' : 'ENTER');

      const saved = localStorage.getItem(`posty_geo_coords_${placeToEdit}`);
      if (saved) {
        const matchLat = saved.match(/Lat:\s*([-\d.]+)/);
        const matchLng = saved.match(/Lng:\s*([-\d.]+)/);
        const matchRad = saved.match(/Radio:\s*(\d+)m/);
        if (matchLat && matchLng) {
          initLat = parseFloat(matchLat[1]);
          initLng = parseFloat(matchLng[1]);
        }
        if (matchRad) {
          initRadius = parseInt(matchRad[1]);
        }
      }
    } else {
      selectGeoTransition('ENTER');
      if (geoInput) {
        geoInput.value = '';
        setTimeout(() => geoInput.focus(), 150);
      }
      if (currentUserLat !== null && currentUserLng !== null) {
        initLat = currentUserLat;
        initLng = currentUserLng;
      }
    }

    updateGeoFinalTextPreview();

    // Inicializar o refrescar el mapa interactivo de geocerca
    setTimeout(() => {
      initOrRefreshGeoMap(initLat, initLng, initRadius);
    }, 150);
  }
}

function selectGeoTransition(trans) {
  currentGeoTransition = trans;
  const btnEnter = document.getElementById('btnTransitionEnter');
  const btnExit = document.getElementById('btnTransitionExit');
  if (btnEnter) btnEnter.classList.toggle('active', trans === 'ENTER');
  if (btnExit) btnExit.classList.toggle('active', trans === 'EXIT');
  updateGeoFinalTextPreview();
}

function updateGeoFinalTextPreview() {
  const geoInput = document.getElementById('voicePromptTextInput');
  const rawName = (geoInput ? geoInput.value : '').trim();
  const prefix = currentGeoTransition === 'EXIT' ? 'Al salir de' : 'Al llegar a';
  const previewEl = document.getElementById('geoFinalTextPreview');
  if (previewEl) {
    previewEl.textContent = rawName ? `Alarma: ${prefix} ${rawName}` : `Alarma: ${prefix} [Nombre del lugar]`;
  }
}

function openGeoPickerForPlace(placeName) {
  openVoicePromptModal('geo', placeName);
}

// Variables del Mapa Interactivo Táctil
let geoMap = null;
let geoMarker = null;
let geoCircle = null;
let currentMapLat = -17.783300;
let currentMapLng = -63.182100;
let currentMapRadius = 50;

let currentMapLayerType = 'google';
let activeTileLayer = null;

// Proveedores de mapas de alta fiabilidad compatibles con Android WebView (Cero bloqueos 403)
const MAP_TILE_CONFIGS = {
  google: {
    name: 'Google Maps',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    options: {
      subdomains: '0123',
      maxZoom: 20
    }
  },
  satellite: {
    name: 'Satélite',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    options: {
      subdomains: '0123',
      maxZoom: 20
    }
  }
};

function switchMapLayer(type) {
  if (!MAP_TILE_CONFIGS[type]) type = 'google';
  currentMapLayerType = type;

  // Actualizar estado visual de los botones de cambio de mapa
  const btnGoogle = document.getElementById('btnMapGoogle');
  const btnSat = document.getElementById('btnMapSat');
  if (btnGoogle) btnGoogle.classList.toggle('active', type === 'google');
  if (btnSat) btnSat.classList.toggle('active', type === 'satellite');

  if (geoMap) {
    if (activeTileLayer) {
      geoMap.removeLayer(activeTileLayer);
    }
    const cfg = MAP_TILE_CONFIGS[type];
    activeTileLayer = L.tileLayer(cfg.url, cfg.options).addTo(geoMap);
  }
}

// Punto azul oscuro con sombra celeste tenue de nuestra ubicación satelital en tiempo real
function updateUserLocationMapMarker(lat, lng) {
  if (!geoMap || typeof L === 'undefined' || lat === null || lng === null) return;
  const userLocIcon = L.divIcon({
    className: 'user-realtime-loc-marker',
    html: `<div style="width: 14px; height: 14px; background: #1D4ED8; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.55), 0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });

  if (userLocationMarker) {
    userLocationMarker.setLatLng([lat, lng]);
  } else {
    userLocationMarker = L.marker([lat, lng], {
      icon: userLocIcon,
      interactive: false,
      zIndexOffset: 1000
    }).addTo(geoMap);
  }
}

function initOrRefreshGeoMap(customLat, customLng, customRadius) {
  if (typeof L === 'undefined') {
    console.warn('Leaflet aún no cargado');
    return;
  }

  if (customLat && customLng) {
    currentMapLat = parseFloat(customLat);
    currentMapLng = parseFloat(customLng);
  } else if (currentUserLat !== null && currentUserLng !== null) {
    currentMapLat = currentUserLat;
    currentMapLng = currentUserLng;
  }

  if (customRadius) {
    currentMapRadius = parseInt(customRadius);
  }

  const slider = document.getElementById('geoRadiusSlider');
  const label = document.getElementById('geoRadiusLabel');
  if (slider) slider.value = currentMapRadius;
  if (label) label.textContent = `${currentMapRadius} m`;

  const mapContainer = document.getElementById('geoMapContainer');
  if (!mapContainer) return;

  const targetLayer = currentMapLayerType || 'google';

  if (!geoMap) {
    try {
      geoMap = L.map('geoMapContainer', {
        center: [currentMapLat, currentMapLng],
        zoom: 16,
        zoomControl: true,
        attributionControl: false
      });

      switchMapLayer(targetLayer);

      const pinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background: #EF4444; color: white; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 2.5px solid white;"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      geoMarker = L.marker([currentMapLat, currentMapLng], {
        draggable: true,
        icon: pinIcon
      }).addTo(geoMap);

      geoCircle = L.circle([currentMapLat, currentMapLng], {
        radius: currentMapRadius,
        color: '#38BDF8',
        fillColor: '#38BDF8',
        fillOpacity: 0.25,
        weight: 2
      }).addTo(geoMap);

      // Permitir arrastrar el marcador con el dedo para mover el centro
      geoMarker.on('drag', (e) => {
        const pos = e.target.getLatLng();
        currentMapLat = pos.lat;
        currentMapLng = pos.lng;
        geoCircle.setLatLng(pos);
        updatePendingCoordsString();
      });

      // Permitir tocar cualquier punto del mapa para reubicar centro
      geoMap.on('click', (e) => {
        currentMapLat = e.latlng.lat;
        currentMapLng = e.latlng.lng;
        geoMarker.setLatLng(e.latlng);
        geoCircle.setLatLng(e.latlng);
        updatePendingCoordsString();
      });
    } catch (e) {
      console.warn('Error al inicializar Leaflet:', e);
    }
  } else {
    try {
      geoMap.setView([currentMapLat, currentMapLng], 16);
      if (geoMarker) geoMarker.setLatLng([currentMapLat, currentMapLng]);
      if (geoCircle) {
        geoCircle.setLatLng([currentMapLat, currentMapLng]);
        geoCircle.setRadius(currentMapRadius);
      }
      switchMapLayer(targetLayer);
    } catch (e) {}
  }

  // Refrescar punto de ubicación del usuario en tiempo real en el mapa
  if (currentUserLat !== null && currentUserLng !== null) {
    updateUserLocationMapMarker(currentUserLat, currentUserLng);
  }

  // Múltiples invalidaciones para asegurar renderizado perfecto tras transiciones
  [60, 200, 500, 800].forEach(delay => {
    setTimeout(() => {
      if (geoMap) geoMap.invalidateSize();
    }, delay);
  });

  updatePendingCoordsString();
}

function updateGeoMapRadius(val) {
  currentMapRadius = parseInt(val);
  lastGeofenceEditTimestamp = Date.now(); // Suprimir alertas inmediatas mientras se ajusta el slider
  const label = document.getElementById('geoRadiusLabel');
  if (label) label.textContent = `${currentMapRadius} m`;
  if (geoCircle) geoCircle.setRadius(currentMapRadius);
  updatePendingCoordsString();
}

function updatePendingCoordsString() {
  const latFixed = currentMapLat.toFixed(6);
  const lngFixed = currentMapLng.toFixed(6);
  pendingNewPlaceCoords = `Lat: ${latFixed}, Lng: ${lngFixed} (Radio: ${currentMapRadius}m GPS)`;
  const statusEl = document.getElementById('newPlaceCoordsStatus');
  if (statusEl) {
    statusEl.textContent = `✓ Geocerca configurada • Cobertura: ${currentMapRadius}m`;
    statusEl.style.color = '#10B981';
  }
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
    renderSettingsTimePresets();
    selectTimePreset(newPreset);
  } else {
    const geoInput = document.getElementById('voicePromptTextInput');
    const val = geoInput ? geoInput.value.trim() : '';
    if (!val) {
      alert('Por favor ingrese o dicte el nombre del lugar.');
      return;
    }

    const prefix = currentGeoTransition === 'EXIT' ? 'Al salir de' : 'Al llegar a';
    const finalLabel = `${prefix} ${val}`;

    let targetGeo = geoPresets.find(g => (g.place === val || g.label === finalLabel) && g.transition === currentGeoTransition);
    if (!targetGeo) {
      targetGeo = {
        id: 'g_' + (currentGeoTransition === 'EXIT' ? 'exit_' : 'enter_') + val.replace(/\s+/g, '_').toLowerCase(),
        label: finalLabel,
        place: val,
        transition: currentGeoTransition,
        uses: 10
      };
      geoPresets.unshift(targetGeo);
    } else {
      targetGeo.label = finalLabel;
    }
    localStorage.setItem('posty_geo_presets_v2', JSON.stringify(geoPresets));

    const finalCoords = pendingNewPlaceCoords || `Lat: ${currentMapLat.toFixed(6)}, Lng: ${currentMapLng.toFixed(6)} (Radio: ${currentMapRadius}m GPS)`;
    localStorage.setItem(`posty_geo_coords_${val}`, finalCoords);
    lastGeofenceEditTimestamp = Date.now();
    calibrateNotesGeofenceState(val);

    // Si estaba en la lista de eliminados, restaurarlo
    const deleted = JSON.parse(localStorage.getItem('posty_deleted_geo_presets') || '[]');
    if (deleted.includes(val)) {
      const filtered = deleted.filter(p => p !== val);
      localStorage.setItem('posty_deleted_geo_presets', JSON.stringify(filtered));
    }

    renderTriggerPresets();
    renderSettingsLocations();
    selectGeoPreset(targetGeo);
  }

  closeVoicePromptModal();
}

function closeVoicePromptModal() {
  notifyModalState(false);
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
      label: currentLanguage === 'en' ? `Tomorrow at noon (${day}/${mon})` : `Mañana a mediodía (${day}/${mon})`
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
        ${ICONS.clock} <span>${escapeHtml(formatPresetLabel(p.label))}</span>
      </button>
    `).join('');
  }

  if (secTimeCont) {
    secTimeCont.innerHTML = secondaryTime.map(p => `
      <button type="button" class="preset-btn" onclick="selectTimePresetById('${p.id}')">
        ${ICONS.clock} <span>${escapeHtml(formatPresetLabel(p.label))}</span>
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
        ${ICONS.pin} <span>${escapeHtml(formatPresetLabel(g.label))}</span>
      </button>
    `).join('');
  }

  if (secGeoCont) {
    secGeoCont.innerHTML = secondaryGeo.map(g => `
      <button type="button" class="preset-btn" onclick="selectGeoPresetById('${g.id}')">
        ${ICONS.pin} <span>${escapeHtml(formatPresetLabel(g.label))}</span>
      </button>
    `).join('');
    if (btnMoreGeo) {
      btnMoreGeo.style.display = secondaryGeo.length > 0 ? 'inline-flex' : 'none';
    }
  }

  stabilizeAlertTabHeight();
}

// Estabilizador de altura: mantiene la altura de la pestaña más grande (por tiempo o por ubicación)
// para evitar saltos o vibraciones visuales en el modal de nota
function stabilizeAlertTabHeight() {
  requestAnimationFrame(() => {
    const paneTime = document.getElementById('alertTabContentTime');
    const paneGeo = document.getElementById('alertTabContentGeo');
    const body = document.querySelector('.alert-tab-body');
    if (!paneTime || !paneGeo || !body) return;

    const hTime = paneTime.scrollHeight || paneTime.offsetHeight || 0;
    const hGeo = paneGeo.scrollHeight || paneGeo.offsetHeight || 0;
    const maxH = Math.max(hTime, hGeo);
    if (maxH > 0) {
      body.style.minHeight = `${maxH}px`;
    }
  });
}

function selectTimePresetById(id) {
  const p = timePresets.find(t => t.id === id);
  if (p) selectTimePreset(p);
}

function selectGeoPresetById(id) {
  const g = geoPresets.find(item => item.id === id);
  if (g) selectGeoPreset(g);
}

function selectNoAlert() {
  selectedTriggerType = 'none';
  selectedTargetTimestamp = null;
  selectedAlertDateTimeStr = t('alert_no_alarm');
  selectedTriggerLabel = t('alert_no_alarm');
  const selTrig = document.getElementById('selectedTriggerText');
  if (selTrig) selTrig.textContent = t('alert_no_alarm');

  document.querySelectorAll('#primaryTimePresets .preset-btn, #secondaryTimePresets .preset-btn, #primaryGeoPresets .preset-btn, #secondaryGeoPresets .preset-btn').forEach(b => {
    b.classList.remove('active');
  });
  const btn = document.getElementById('btnSelectNoAlert');
  if (btn) btn.classList.add('active');
}

// Gestión de Pestañas de Alerta (Por tiempo vs Por ubicación sobre el mismo espacio)
let currentAlertTab = 'time';

function switchAlertTab(tab) {
  currentAlertTab = tab;
  const btnTime = document.getElementById('tabBtnTime');
  const btnGeo = document.getElementById('tabBtnGeo');
  const paneTime = document.getElementById('alertTabContentTime');
  const paneGeo = document.getElementById('alertTabContentGeo');

  if (tab === 'time') {
    if (btnTime) {
      btnTime.classList.add('active');
      btnTime.setAttribute('aria-selected', 'true');
    }
    if (btnGeo) {
      btnGeo.classList.remove('active');
      btnGeo.setAttribute('aria-selected', 'false');
    }
    if (paneTime) paneTime.classList.remove('hidden');
    if (paneGeo) paneGeo.classList.add('hidden');
  } else {
    if (btnGeo) {
      btnGeo.classList.add('active');
      btnGeo.setAttribute('aria-selected', 'true');
    }
    if (btnTime) {
      btnTime.classList.remove('active');
      btnTime.setAttribute('aria-selected', 'false');
    }
    if (paneGeo) paneGeo.classList.remove('hidden');
    if (paneTime) paneTime.classList.add('hidden');
  }
  stabilizeAlertTabHeight();
}

function selectTimePreset(preset) {
  selectedTriggerType = 'time';
  switchAlertTab('time');
  const calc = calculateAlertDateTime(preset);
  selectedTargetTimestamp = calc.timestamp;
  selectedAlertDateTimeStr = calc.label;
  selectedTriggerLabel = calc.label;
  const selTrig = document.getElementById('selectedTriggerText');
  if (selTrig) selTrig.textContent = `${t('alert_prefix')} ${formatPresetLabel(selectedAlertDateTimeStr)}`;

  const btnNoAlert = document.getElementById('btnSelectNoAlert');
  if (btnNoAlert) btnNoAlert.classList.remove('active');

  preset.uses = (preset.uses || 0) + 1;
  localStorage.setItem('posty_time_presets_v2', JSON.stringify(timePresets));

  document.querySelectorAll('#primaryTimePresets .preset-btn, #secondaryTimePresets .preset-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.includes(formatPresetLabel(preset.label)));
  });
  document.querySelectorAll('#primaryGeoPresets .preset-btn, #secondaryGeoPresets .preset-btn').forEach(b => {
    b.classList.remove('active');
  });
}

function selectGeoPreset(preset) {
  selectedTriggerType = 'geo';
  switchAlertTab('geo');
  selectedTargetTimestamp = null;
  selectedAlertDateTimeStr = preset.label;
  selectedTriggerLabel = preset.label;
  selectedGeoPlace = preset.place || preset.label.replace(/^Al\s+(llegar\s+a|salir\s+de)\s+/i, '').trim();
  selectedGeoTransition = preset.transition || (preset.label.toLowerCase().includes('salir') ? 'EXIT' : 'ENTER');
  const selTrig = document.getElementById('selectedTriggerText');
  if (selTrig) selTrig.textContent = `${t('alert_prefix')} ${formatPresetLabel(preset.label)}`;

  const btnNoAlert = document.getElementById('btnSelectNoAlert');
  if (btnNoAlert) btnNoAlert.classList.remove('active');

  preset.uses = (preset.uses || 0) + 1;
  localStorage.setItem('posty_geo_presets_v2', JSON.stringify(geoPresets));

  document.querySelectorAll('#primaryGeoPresets .preset-btn, #secondaryGeoPresets .preset-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.includes(formatPresetLabel(preset.label)));
  });
  document.querySelectorAll('#primaryTimePresets .preset-btn, #secondaryTimePresets .preset-btn').forEach(b => {
    b.classList.remove('active');
  });
}

function toggleMoreTimePresets() {
  const sec = document.getElementById('secondaryTimePresets');
  const btn = document.getElementById('btnToggleMoreTime');
  const isHidden = sec.classList.toggle('hidden');
  btn.innerHTML = isHidden ? `<span>${t('btn_more_times')}</span> <span class="arrow-icon">▼</span>` : `<span>${t('btn_hide_more')}</span> <span class="arrow-icon">▲</span>`;
  stabilizeAlertTabHeight();
}

function toggleMoreGeoPresets() {
  const sec = document.getElementById('secondaryGeoPresets');
  const btn = document.getElementById('btnToggleMoreGeo');
  const isHidden = sec.classList.toggle('hidden');
  btn.innerHTML = isHidden ? `<span>${t('btn_more_places')}</span> <span class="arrow-icon">▼</span>` : `<span>${t('btn_hide_more')}</span> <span class="arrow-icon">▲</span>`;
  stabilizeAlertTabHeight();
}

function resetModalForm() {
  selectColor('yellow');
  selectedTriggerType = 'none';
  selectedTriggerLabel = t('alert_none_assigned');
  selectedTargetTimestamp = null;
  selectedAlertDateTimeStr = null;
  document.getElementById('selectedTriggerText').textContent = t('alert_none_assigned');
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
}

function closeModal() {
  if (postyRecognitionInstance) {
    try { postyRecognitionInstance.stop(); } catch (err) {}
    postyRecognitionInstance = null;
  }
  notifyModalState(false);
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
      if (selectedTriggerType === 'geo') {
        note.geoPlace = selectedGeoPlace;
        note.geoTransition = selectedGeoTransition;
        note.alreadyAlertedToday = false;
        note.lastInsideState = null;
        note.geofenceState = null;
        note.lastAlertedTimestamp = 0;
      }
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
      geoPlace: (selectedTriggerType === 'geo') ? selectedGeoPlace : null,
      geoTransition: (selectedTriggerType === 'geo') ? selectedGeoTransition : null,
      alreadyAlertedToday: false,
      lastInsideState: null,
      geofenceState: null,
      lastAlertedTimestamp: 0,
      completed: false,
      completedAt: null,
      createdAt: Date.now(),
      lines: validLines,
      photo: modalPhotoData
    };
    notes.unshift(newNote);
  }

  saveToStorage();
  if (selectedTriggerType === 'geo') {
    calibrateNotesGeofenceState(selectedGeoPlace);
  }
  syncAllAlarmsToNative();
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

// Campana armónica resonante y mensaje sonoro de la nota
function playBellChime(followupText = null) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, now); // A6 (armónico)

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      gain2.gain.setValueAtTime(0.18, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    }
  } catch (e) {}

  if (followupText) {
    setTimeout(() => {
      if (window.AndroidBridge && window.AndroidBridge.speakText) {
        window.AndroidBridge.speakText(followupText);
      } else if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(followupText);
        utter.lang = 'es-ES';
        utter.rate = 1.0;
        window.speechSynthesis.speak(utter);
      }
    }, 750);
  }
}

// Sincronización de Alarmas de Sistema con Android AlarmManager (incluso app cerrada)
function syncAllAlarmsToNative() {
  if (!window.AndroidBridge || !window.AndroidBridge.scheduleNativeAlarm) return;
  const now = Date.now();
  notes.forEach(note => {
    if (!note.completed && note.alertTimestamp && note.alertTimestamp > now) {
      const noteText = (note.lines && note.lines.length > 0) ? note.lines.map(l => l.text).join('. ') : (note.text || 'Nota Urgente');
      window.AndroidBridge.scheduleNativeAlarm(note.id, 'UnLethe • Alerta Urgente', noteText, note.alertTimestamp);
    }
  });
}

// Abrir nota directamente al pulsar sobre la notificación push
window.openNoteFromNotification = function(targetNoteId) {
  const note = notes.find(n => n.id === targetNoteId);
  if (!note) return;

  currentFilter = note.urgency || 'urgent';
  renderBoard();

  const noteCard = document.getElementById(`card_${targetNoteId}`);
  if (noteCard) {
    noteCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    noteCard.style.outline = '3px solid #EF4444';
    noteCard.style.transform = 'scale(1.04)';
    setTimeout(() => {
      noteCard.style.outline = '';
      noteCard.style.transform = '';
    }, 3000);
  }

  const noteText = (note.lines && note.lines.length > 0) ? note.lines.map(l => l.text).join('. ') : (note.text || '');
  playBellChime(noteText);
};

// Motor Geofence: Distancia Haversine y Máquina de Estados por Transición de Cambio
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getCoordsForPlace(place) {
  if (!place) return null;
  const p = place.trim();
  let saved = localStorage.getItem(`posty_geo_coords_${p}`);
  if (!saved) {
    if (p.toLowerCase() === 'home' || p.toLowerCase() === 'casa') {
      saved = localStorage.getItem('posty_geo_coords_Casa') || localStorage.getItem('posty_geo_coords_Home');
    } else if (p.toLowerCase() === 'work' || p.toLowerCase() === 'trabajo') {
      saved = localStorage.getItem('posty_geo_coords_Trabajo') || localStorage.getItem('posty_geo_coords_Work');
    }
  }
  let parsed = parseCoordsString(saved);
  if (!parsed) {
    if (p.toLowerCase().includes('casa') || p.toLowerCase().includes('home')) {
      parsed = { lat: -17.783300, lng: -63.182100, radius: 50 };
    } else if (p.toLowerCase().includes('trabajo') || p.toLowerCase().includes('work')) {
      parsed = { lat: -17.778609, lng: -63.175607, radius: 50 };
    }
  }
  return parsed;
}

function getNoteGeoPlaceAndTransition(note) {
  let place = note.geoPlace;
  if (!place && note.triggerLabel) {
    place = note.triggerLabel
      .replace(/^Al\s+(llegar\s+a|salir\s+de)\s+/i, '')
      .replace(/^(Leaving|Arriving\s+at)\s+/i, '')
      .trim();
  }
  
  let transition = note.geoTransition;
  if (!transition) {
    const lbl = (note.triggerLabel || '').toLowerCase();
    if (lbl.includes('salir') || lbl.startsWith('leaving')) {
      transition = 'EXIT';
    } else {
      transition = 'ENTER';
    }
  }
  return { place, transition };
}

// Calibrar la posición base de las notas sin disparar alertas al editar o crear geocercas
function calibrateNotesGeofenceState(placeName = null) {
  if (currentUserLat === null || currentUserLng === null) return;

  notes.forEach(note => {
    if (note.completed || note.triggerType !== 'geo') return;
    const { place } = getNoteGeoPlaceAndTransition(note);
    if (placeName && place !== placeName) return;
    if (!place) return;

    const coords = getCoordsForPlace(place);
    if (!coords) return;

    const dist = getDistanceFromLatLonInMeters(currentUserLat, currentUserLng, coords.lat, coords.lng);
    note.lastInsideState = (dist <= coords.radius);
  });
  saveToStorage();
}

function checkGeofenceAlerts(userLat, userLng) {
  if (userLat === null || userLng === null || isNaN(userLat) || isNaN(userLng)) return;

  let stateChanged = false;

  notes.forEach(note => {
    // Las alertas de ubicación operan sobre notas activas no completadas
    if (note.completed || note.triggerType !== 'geo') return;

    const { place, transition } = getNoteGeoPlaceAndTransition(note);
    if (!place) return;

    const placeCoords = getCoordsForPlace(place);
    if (!placeCoords) return;

    const dist = getDistanceFromLatLonInMeters(userLat, userLng, placeCoords.lat, placeCoords.lng);
    const isInside = dist <= placeCoords.radius;

    // Primer registro de posición para esta nota (línea base): no suena ni antes ni después
    if (note.lastInsideState === null || note.lastInsideState === undefined) {
      note.lastInsideState = isInside;
      stateChanged = true;
      return;
    }

    const wasInside = note.lastInsideState;

    // Regla de Oro: Se activa ÚNICAMENTE en el cambio de estado (transición)
    if (wasInside !== isInside) {
      note.lastInsideState = isInside;
      stateChanged = true;

      // Regla 1: "Al Salir de": Estaba adentro de la geocerca y sale de ella
      if (transition === 'EXIT' && wasInside && !isInside) {
        const noteText = (note.lines && note.lines.length > 0)
          ? note.lines.map(l => l.text).join('. ')
          : (note.text || (currentLanguage === 'en' ? 'Left ' + formatPresetLabel(place) : 'Salió de ' + place));
        const alertTitle = currentLanguage === 'en'
          ? `🚪 Leaving ${formatPresetLabel(place)}`
          : `🚪 Al salir de ${place}`;
        triggerPushBanner(alertTitle, noteText, note.id);
      }

      // Regla 2: "Al llegar a": Estaba afuera de la geocerca e ingresa a ella
      if (transition === 'ENTER' && !wasInside && isInside) {
        const noteText = (note.lines && note.lines.length > 0)
          ? note.lines.map(l => l.text).join('. ')
          : (note.text || (currentLanguage === 'en' ? 'Arrived at ' + formatPresetLabel(place) : 'Llegó a ' + place));
        const alertTitle = currentLanguage === 'en'
          ? `📍 Arriving at ${formatPresetLabel(place)}`
          : `📍 Al llegar a ${place}`;
        triggerPushBanner(alertTitle, noteText, note.id);
      }
    }
  });

  if (stateChanged) {
    saveToStorage();
  }
}

function startContinuousLocationEngine() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy || 10);
        window.onDeviceLocationUpdate(lat, lng, acc);
      },
      (err) => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }
}

window.onDeviceLocationUpdate = function(lat, lng, acc) {
  currentUserLat = lat;
  currentUserLng = lng;
  currentUserAccuracy = acc;
  updateUserLocationMapMarker(lat, lng);
  checkGeofenceAlerts(lat, lng);
};

function notifyModalState(isOpen) {
  if (window.AndroidBridge && window.AndroidBridge.setModalOpen) {
    try {
      window.AndroidBridge.setModalOpen(isOpen);
    } catch (e) {}
  }
}

window.handleAndroidBackButton = function() {
  const voiceModal = document.getElementById('voicePromptModal');
  if (voiceModal && !voiceModal.classList.contains('hidden')) {
    closeVoicePromptModal();
    return true;
  }
  const noteModal = document.getElementById('newNoteModal');
  if (noteModal && !noteModal.classList.contains('hidden')) {
    closeModal();
    return true;
  }
  const settingsModal = document.getElementById('settingsModal');
  if (settingsModal && !settingsModal.classList.contains('hidden')) {
    if (typeof currentSettingsScreen !== 'undefined' && currentSettingsScreen !== 'main') {
      openSettingsSubscreen('main');
      return true;
    }
    closeSettings();
    return true;
  }
  return false;
};

// 6. ALERTAS AUTOMÁTICAS (Push en pantalla y de sistema nativo)
function startAutomaticAlertMonitor() {
  setInterval(() => {
    const now = Date.now();
    const d = new Date();
    const currentHourMin = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    notes.forEach(note => {
      if (note.completed || !note.triggerLabel) return;

      const matchesTimestamp = note.alertTimestamp && now >= note.alertTimestamp && !note.alreadyAlertedToday;
      const matchesTimeStr = note.triggerLabel.includes(currentHourMin) && !note.alreadyAlertedToday;

      if (matchesTimestamp || matchesTimeStr) {
        note.alreadyAlertedToday = true;
        const noteText = (note.lines && note.lines.length > 0) ? note.lines.map(l => l.text).join('. ') : (note.text || 'Nota Urgente');
        triggerPushBanner(note.triggerLabel, noteText, note.id);
      }
    });

    if (currentUserLat !== null && currentUserLng !== null) {
      checkGeofenceAlerts(currentUserLat, currentUserLng);
    }
  }, 6000);
}

function triggerPushBanner(title, body, noteId = null) {
  const banner = document.getElementById('pushNotificationBanner');
  if (banner) {
    document.getElementById('pushTitle').textContent = title || '⏰ Recordatorio Automático';
    document.getElementById('pushBody').textContent = body || 'Tiene una nota pendiente por cumplirse.';
    banner.classList.remove('hidden');

    banner.onclick = () => {
      dismissPush();
      if (noteId) {
        window.openNoteFromNotification(noteId);
      }
    };
  }

  // Notificación nativa del smartphone (sonido, vibración y aviso en bloqueo)
  if (window.AndroidBridge && window.AndroidBridge.triggerNativeNotification) {
    try {
      window.AndroidBridge.triggerNativeNotification(title, body, noteId);
    } catch (e) {}
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title || 'UnLethe', {
        body: body || 'Tiene una nota pendiente.',
        icon: 'icon.png'
      });
    } catch (e) {}
  }

  playBellChime(body);
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

// 5. GESTIÓN DE ALERTAS DE TIEMPO Y UBICACIÓN EN CONFIGURACIÓN
function renderSettingsTimePresets() {
  const container = document.getElementById('settingsTimePresetsList');
  if (!container) return;

  if (!timePresets || timePresets.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 10px;">No hay alertas de tiempo guardadas. Pulse "Agregar alerta de tiempo" abajo.</div>`;
    return;
  }

  container.innerHTML = timePresets.map(p => {
    const escapedLabel = escapeHtml(p.label);
    const uses = p.uses || 0;
    return `
      <div class="time-preset-item">
        <div style="display: flex; align-items: center; gap: 8px;">
          ${ICONS.clock}
          <strong>${escapedLabel}</strong>
          <span style="font-size: 11px; opacity: 0.6;">(${uses} usos)</span>
        </div>
        <button type="button" class="btn-delete-small" onclick="deleteTimePreset('${p.id}')" title="Eliminar alerta de tiempo">
          ${ICONS.trash}
        </button>
      </div>
    `;
  }).join('');
}

function deleteTimePreset(presetId) {
  const p = timePresets.find(t => t.id === presetId);
  const name = p ? formatPresetLabel(p.label) : 'alerta';
  const confirmMsg = currentLanguage === 'en' ? `Delete time alert "${name}"?` : `¿Eliminar la alerta de tiempo "${name}"?`;
  if (confirm(confirmMsg)) {
    timePresets = timePresets.filter(t => t.id !== presetId);
    localStorage.setItem('posty_time_presets_v2', JSON.stringify(timePresets));
    renderSettingsTimePresets();
    renderTriggerPresets();
  }
}

function parseCoordsString(coordStr) {
  if (!coordStr) return null;
  const latMatch = coordStr.match(/Lat:\s*([-\d.]+)/i);
  const lngMatch = coordStr.match(/Lng:\s*([-\d.]+)/i);
  const radMatch = coordStr.match(/Radio:\s*(\d+)m/i);
  if (latMatch && lngMatch) {
    return {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1]),
      radius: radMatch ? parseInt(radMatch[1]) : 50
    };
  }
  return null;
}

const miniMapInstances = {};

function initMiniLocationMap(elemId, lat, lng, radius) {
  const elem = document.getElementById(elemId);
  if (!elem || typeof L === 'undefined') return;

  if (miniMapInstances[elemId]) {
    try {
      miniMapInstances[elemId].remove();
    } catch (e) {}
    delete miniMapInstances[elemId];
  }

  try {
    const mini = L.map(elemId, {
      center: [lat, lng],
      zoom: 16,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      subdomains: '0123',
      maxZoom: 20
    }).addTo(mini);

    const pinIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background: #EF4444; color: white; width: 22px; height: 22px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.4); border: 2px solid white;"><div style="width: 7px; height: 7px; background: white; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 22]
    });

    L.marker([lat, lng], { icon: pinIcon }).addTo(mini);

    const circle = L.circle([lat, lng], {
      radius: radius,
      color: '#0284C7',
      fillColor: '#38BDF8',
      fillOpacity: 0.25,
      weight: 2
    }).addTo(mini);

    // Ajusta la vista para que el mapa cubra exactamente toda la geocerca
    mini.fitBounds(circle.getBounds().pad(0.35));

    [60, 200, 450].forEach(delay => {
      setTimeout(() => {
        if (mini) mini.invalidateSize();
      }, delay);
    });

    miniMapInstances[elemId] = mini;
  } catch (err) {
    console.warn('Error al inicializar mini mapa:', err);
  }
}

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

  // Asegurar los 2 lugares por defecto si no han sido eliminados por el usuario
  const deletedPlaces = JSON.parse(localStorage.getItem('posty_deleted_geo_presets') || '[]');
  ['Casa', 'Trabajo'].forEach(p => {
    if (!seen.has(p) && !deletedPlaces.includes(p)) {
      seen.add(p);
      const label = p === 'Casa' ? 'Al salir de Casa' : 'Al llegar a Trabajo';
      uniquePlaces.push({ place: p, label: label });
    }
  });

  if (uniquePlaces.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 10px;">No hay lugares configurados. Pulse "Agregar nuevo lugar" abajo.</div>`;
    return;
  }

  container.innerHTML = uniquePlaces.map(item => {
    const p = item.place;
    const safeId = p.replace(/[^a-zA-Z0-9_-]/g, '_');
    const savedCoord = localStorage.getItem(`posty_geo_coords_${p}`) || '';
    const coords = parseCoordsString(savedCoord);
    const escapedPlace = escapeHtml(p);
    const escapedLabel = escapeHtml(formatPresetLabel(item.label));
    return `
      <div class="location-item-card">
        <!-- Línea 1: Nombre del lugar y a la derecha solo íconos planos (mapa, pin actual, basurero) -->
        <div class="location-card-header">
          <div class="location-name-title">
            ${ICONS.pin}
            <span>${escapedLabel}</span>
          </div>
          <div class="location-flat-actions">
            <button type="button" class="btn-flat-action" onclick="openGeoPickerForPlace('${escapedPlace}')" title="Elegir y ajustar en el mapa">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
            </button>
            <button type="button" class="btn-flat-action delete" onclick="deleteGeoPreset('${escapedPlace}')" title="Eliminar lugar">
              ${ICONS.trash}
            </button>
          </div>
        </div>

        <!-- Línea 2: El mapa imagen que cubre toda la geocerca -->
        <div class="location-map-wrapper" onclick="openGeoPickerForPlace('${escapedPlace}')" title="Toque para editar geocerca en el mapa">
          <div id="miniMap_${safeId}" class="location-mini-map"></div>
          <div class="mini-map-badge">${coords ? `Cobertura: ${coords.radius}m GPS` : 'Sin georreferencia fijada'}</div>
        </div>
      </div>
    `;
  }).join('');

  // Inicializar cada mapa imagen para que cubra la geocerca correspondiente
  setTimeout(() => {
    uniquePlaces.forEach(item => {
      const p = item.place;
      const safeId = p.replace(/[^a-zA-Z0-9_-]/g, '_');
      const savedCoord = localStorage.getItem(`posty_geo_coords_${p}`);
      const coords = parseCoordsString(savedCoord) || { lat: -17.783300, lng: -63.182100, radius: 50 };
      initMiniLocationMap(`miniMap_${safeId}`, coords.lat, coords.lng, coords.radius);
    });
  }, 100);
}

function deleteGeoPreset(placeName) {
  const confirmMsg = currentLanguage === 'en' ? `Delete place "${placeName}" from your alerts?` : `¿Eliminar el lugar "${placeName}" de sus alertas?`;
  if (confirm(confirmMsg)) {
    geoPresets = geoPresets.filter(g => (g.place || g.label) !== placeName && g.label !== placeName);
    localStorage.setItem('posty_geo_presets_v2', JSON.stringify(geoPresets));
    localStorage.removeItem(`posty_geo_coords_${placeName}`);

    const deleted = JSON.parse(localStorage.getItem('posty_deleted_geo_presets') || '[]');
    if (!deleted.includes(placeName)) {
      deleted.push(placeName);
      localStorage.setItem('posty_deleted_geo_presets', JSON.stringify(deleted));
    }

    renderSettingsLocations();
    renderTriggerPresets();
  }
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
    const now = new Date();

    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateFormatted = now.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'es-ES', options);
    const capitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

    if (el) el.textContent = capitalized;
  };
  update();
  setInterval(update, 10000);
}

// Pestañas de Gestión de Botones en Configuración (Tiempo vs Ubicación)
let currentSettingsButtonsTab = 'time';

function switchSettingsButtonsTab(tab) {
  currentSettingsButtonsTab = tab;
  const btnTime = document.getElementById('settingsTabBtnTime');
  const btnGeo = document.getElementById('settingsTabBtnGeo');
  const paneTime = document.getElementById('settingsTabPaneTime');
  const paneGeo = document.getElementById('settingsTabPaneGeo');

  if (tab === 'time') {
    if (btnTime) {
      btnTime.classList.add('active');
      btnTime.setAttribute('aria-selected', 'true');
    }
    if (btnGeo) {
      btnGeo.classList.remove('active');
      btnGeo.setAttribute('aria-selected', 'false');
    }
    if (paneTime) paneTime.classList.remove('hidden');
    if (paneGeo) paneGeo.classList.add('hidden');
  } else {
    if (btnGeo) {
      btnGeo.classList.add('active');
      btnGeo.setAttribute('aria-selected', 'true');
    }
    if (btnTime) {
      btnTime.classList.remove('active');
      btnTime.setAttribute('aria-selected', 'false');
    }
    if (paneGeo) paneGeo.classList.remove('hidden');
    if (paneTime) paneTime.classList.add('hidden');
  }
}

// Configuración: Navegación por Sub-pantallas
let currentSettingsScreen = 'main';

function handleSettingsCloseBtn() {
  if (typeof currentSettingsScreen !== 'undefined' && currentSettingsScreen !== 'main') {
    openSettingsSubscreen('main');
    return;
  }
  closeSettings();
}

function handleSettingsFooterBtn() {
  if (typeof currentSettingsScreen !== 'undefined' && currentSettingsScreen !== 'main') {
    openSettingsSubscreen('main');
    return;
  }
  closeSettings();
}

function openSettingsSubscreen(screen) {
  currentSettingsScreen = screen;
  const mainView = document.getElementById('settingsMainView');
  const backupSub = document.getElementById('settingsSubscreenBackup');

  if (mainView) mainView.classList.toggle('hidden', screen !== 'main');
  if (backupSub) backupSub.classList.toggle('hidden', screen !== 'backup');

  const titleEl = document.getElementById('settingsModalTitle');
  const headerBackBtn = document.getElementById('settingsHeaderBackBtn');
  const footerBtn = document.getElementById('settingsFooterBtn');
  const btnBackup = document.getElementById('btnNavBackup');

  if (btnBackup) btnBackup.classList.toggle('active', screen === 'backup');

  if (headerBackBtn) {
    headerBackBtn.style.display = (screen !== 'main') ? 'inline-flex' : 'none';
  }

  if (titleEl) {
    if (screen === 'backup') {
      titleEl.textContent = t('backup_sub_title');
    } else {
      titleEl.textContent = t('settings_title');
    }
  }

  if (footerBtn) {
    if (screen !== 'main') {
      footerBtn.textContent = '‹ ' + t('btn_back_to_settings');
      footerBtn.setAttribute('data-i18n', 'btn_back_to_settings');
    } else {
      footerBtn.textContent = t('btn_close');
      footerBtn.setAttribute('data-i18n', 'btn_close');
    }
  }
}

// Configuración & Respaldo
function openSettings() {
  notifyModalState(true);
  openSettingsSubscreen('main');
  renderSettingsTimePresets();
  renderSettingsLocations();
  switchSettingsButtonsTab(currentSettingsButtonsTab || 'time');
  const btnEs = document.getElementById('langBtnEs');
  const btnEn = document.getElementById('langBtnEn');
  if (btnEs) btnEs.classList.toggle('active', currentLanguage === 'es');
  if (btnEn) btnEn.classList.toggle('active', currentLanguage === 'en');

  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
  notifyModalState(false);
  openSettingsSubscreen('main');
  document.getElementById('settingsModal').classList.add('hidden');
}

// Requerimiento 3 y 6: Exportar notas a archivo con formato NotaFelizYYYYMMDDHHMMSS.JSON
function exportDataJSON() {
  const d = new Date();
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const SS = String(d.getSeconds()).padStart(2, '0');
  const filename = `UnLethe${YYYY}${MM}${DD}${HH}${mm}${SS}.JSON`;

  const exportPayload = {
    appName: 'UnLethe',
    version: '2.0',
    exportDate: d.toISOString(),
    totalNotes: notes.length,
    notes: notes,
    geoPresets: geoPresets,
    timePresets: timePresets
  };
  const jsonContent = JSON.stringify(exportPayload, null, 2);

  // Si estamos en la app Android nativa: guardar directo en la carpeta Descargas del smartphone
  if (window.AndroidBridge && window.AndroidBridge.saveJsonExport) {
    window.AndroidBridge.saveJsonExport(filename, jsonContent);
    return;
  }

  // En navegador web / PWA: Descarga mediante Blob
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dlAnchor = document.createElement('a');
  dlAnchor.href = url;
  dlAnchor.download = filename;
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  setTimeout(() => {
    document.body.removeChild(dlAnchor);
    URL.revokeObjectURL(url);
  }, 1000);
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
        throw new Error(t('invalid_file_format'));
      }

      notes = importedNotes;
      saveToStorage();
      renderBoard();
      renderTriggerPresets();
      renderSettingsLocations();
      alert(t('backup_restored_success').replace('{count}', notes.length));
      closeSettings();
    } catch (err) {
      alert(t('backup_restore_error') + (err.message || 'Error'));
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function resetDemoData(silent = false) {
  if (silent || confirm(t('confirm_reset_data'))) {
    initializeDefaultFreshData();
    renderBoard();
    renderTriggerPresets();
    renderSettingsLocations();
    renderSettingsTimePresets();
    syncAllAlarmsToNative();
    if (!silent) {
      closeSettings();
    }
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
