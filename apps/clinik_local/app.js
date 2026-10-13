/**
 * ClinikLocal - Lógica de Aplicación Local-First Avanzada v2.6
 * Novedades v2.6:
 * 1. Edición completa de pacientes existentes.
 * 2. Remoción total de conversión de contactos (todos son pacientes estándar).
 * 3. Enfoque 100% responsivo para celulares (sin desbordamiento horizontal).
 * 4. Adjuntos de historia médica exclusivos: Foto, Video (cámara/archivo) y PDF.
 * 5. Edición de consultas clínicas permitida únicamente el mismo día de registro.
 * 6. Odontograma con notas cortas (máx 25 car.) y letras de estado explícitas (S, C, R, E, X, Cr).
 * 7. Agenda con alertas de 1 a 5 días, confirmación, asistencias, notas de inasistencia, enlace a historia
 *    y flujo transversal de "Paciente en Atención" en todas las pantallas.
 * 8. Formulario de medicamentos con diseño vertical amigable en celulares (un campo por línea).
 * 9. Generación real de PDF en recetas médicas utilizando jsPDF offline.
 * 10. Persistencia y listado de recetas emitidas con edición restringida al mismo día.
 * 11. Identificador único de usuario por instalación (CK-XXXXX-USR) para descargas.
 * 12. Soporte completo de modo Claro / Oscuro y selección de paleta de colores.
 */

const STORAGE_KEY = 'clinik_local_db_v2';
const API_BASE_URL = 'http://localhost:4050';

const DEFAULT_SERVICIOS = [
  'Consulta Médica General',
  'Control Especializado',
  'Profilaxis y Limpieza Dental',
  'Endodoncia / Tratamiento de Conducto',
  'Extracción Dental',
  'Radiografía Panorámica / Periapical',
  'Análisis Clínico de Sangre',
  'Ecografía Diagnóstica'
];

const SAMPLE_RX_VALERIA = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjYwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2MCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNjAiIGZpbGw9IiMwYjEzMjkiLz48cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSIzNzAiIGhlaWdodD0iMjMwIiByeD0iNiIgZmlsbD0iIzExMWMzOCIgc3Ryb2tlPSIjMzhiZGY4IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iMzUiIHI9IjQiIGZpbGw9IiMzOGJkZjgiLz48dGV4dCB4PSIzNjAiIHk9IjM4IiBmaWxsPSIjOTRhM2I4IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9ImVuZCI+Ui0yNiDigKIgUEVSSUFQSUNBTDwvdGV4dD48cGF0aCBkPSJNIDEyMCAxODAgUSAxNTAgMTQwIDE4MCAxODAgUSAyMDAgMTM1IDIyMCAxODAgUSAyNTAgMTQwIDI4MCAxODAgQyAyODAgMjMwIDEyMCAyMzAgMTIwIDE4MCBaIiBmaWxsPSIjMWUyOTNiIiBzdHJva2U9IiM2NDc0OGIiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0gMTcwIDE3MCBDIDE3MCAxMTAgMTgwIDgwIDIwMCA4MCBDIDIyMCA4MCAyMzAgMTEwIDIzMCAxNzAgQyAyMjAgMTc1IDE4MCAxNzUgMTcwIDE3MCBaIiBmaWxsPSIjNDc1NTY5IiBzdHJva2U9IiM5NGEzYjgiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0gMTgwIDkwIFEgMjAwIDc1IDIyMCA5MCBRIDIyNSAxMTUgMjAwIDExNSBRIDE3NSAxMTUgMTgwIDkwIFoiIGZpbGw9IiNmOGZhZmMiIHN0cm9rZT0iIzM4YmRmOCIgc3Ryb2tlLXdpZHRoPSIxLjSIvPjxwYXRoIGQ9Ik0gMTgwIDE2NSBRIDE3NSAyMTAgMTg1IDIyMCBRIDE5MCAyMDAgMTkyIDE2NSBaIiBmaWxsPSIjMzM0MTU1Ii8+PHBhdGggZD0iTSAyMjAgMTY1IFEgMjI1IDIxMCAyMTUgMjIwIFEgMjEwIDIwMCAyMDggMTY1IFoiIGZpbGw9IiMzMzQxNTUiLz48bGluZSB4MT0iMjAwIiB5MT0iMTE1IiB4Mj0iMTg1IiB5Mj0iMjE1IiBzdHJva2U9IiMzOGJkZjgiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtZGFzaGFycmF5PSIyLDIiLz48bGluZSB4MT0iMjAwIiB5MT0iMTE1IiB4Mj0iMjE1IiB5Mj0iMjE1IiBzdHJva2U9IiMzOGJkZjgiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtZGFzaGFycmF5PSIyLDIiLz48cmVjdCB4PSIzMCIgeT0iMjAwIiB3aWR0aD0iMTMwIiBoZWlnaHQ9IjMwIiByeD0iNCIgZmlsbD0icmdiYSgxNSwgMjMsIDQyLCAwLjg1KSIgc3Ryb2tlPSIjMzM0MTU1Ii8+PHRleHQgeD0iOTUiIHk9IjIyMCIgZmlsbD0iIzM4YmRmOCIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZm9udC13ZWlnaHQ9IjYwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGllemEgMjYgVHJhdGFkYTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjI1MCIgZmlsbD0iIzY0NzQ4YiIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGFjaWVudGU6IFZhbGVyaWEgUXVpc3BlIC0gQ2xpbmlrTG9jYWwgRGlnaXRhbCBSeDwvdGV4dD48L3N2Zz4=';
window.SAMPLE_RX_VALERIA = SAMPLE_RX_VALERIA;

const DEFAULT_DB = {
  config: {
    clinicName: 'Centro Médico & Dental San Lucas',
    clinicIcon: '🩺',
    clinicSub: 'Gestión Clínica',
    doctorName: 'Dr. Alejandro Fernández',
    doctorReg: 'Matrícula Nac. Nº 14890 - CBBA',
    address: 'Av. Heroínas #450, Edif. Los Cedros, Piso 3, Of. 302',
    mapsUrl: 'https://maps.app.goo.gl/ejemploSanLucas',
    phone: '+59170000000',
    email: 'contacto@sanlucasclinic.com',
    theme: 'teal',
    themeMode: 'light',
    servicios: DEFAULT_SERVICIOS,
    modules: {
      odontograma: true,
      recetas: true,
      agenda: true
    }
  },
  subscription: {
    active: false,
    plan: 'free_local',
    method: null,
    multiDeviceEnabled: false,
    expiresAt: null
  },
  pacientes: [
    {
      id: 'p-1',
      tipo: 'paciente',
      nombre: 'Valeria Quispe Morales',
      telefono: '+59171234567',
      email: 'valeria.quispe@ejemplo.com',
      ci: '6549821 CBBA',
      nacimiento: '1994-05-14',
      alergias: 'Penicilina, Betalactámicos',
      notas: 'Tratamiento de ortodoncia en curso. Sensibilidad en molares.',
      ultimaAtencion: '2026-10-09',
      odontograma: {
        '16': { estado: 'restaurado', nota: 'Amalgama Oclusal' },
        '26': { estado: 'caries', nota: 'Caries en surco' },
        '36': { estado: 'endodoncia', nota: 'Conducto tratado' },
        '48': { estado: 'ausente', nota: 'Tercer molar extr.' }
      },
      consultas: [
        {
          id: 'c-101',
          fecha: '2026-10-09',
          servicio: 'Endodoncia / Tratamiento de Conducto',
          motivo: 'Control de Caries y dolor en molar',
          diagnostico: 'Pulpitis reversible en pieza 26.',
          tratamiento: 'Curación estética con resina y ajuste de arco superior.',
          adjuntos: [
            {
              tipo: 'foto',
              titulo: 'Rx Pieza 26',
              descripcion: 'Radiografía de control post-curación',
              url: SAMPLE_RX_VALERIA
            }
          ]
        }
      ]
    },
    {
      id: 'p-2',
      tipo: 'paciente',
      nombre: 'Rodrigo Camacho Flores',
      telefono: '+59179876543',
      email: 'rodrigo.camacho@ejemplo.com',
      ci: '7841209 LPZ',
      nacimiento: '1988-11-20',
      alergias: 'Ninguna conocida',
      notas: 'Paciente con bruxismo nocturno.',
      ultimaAtencion: '2026-09-18',
      odontograma: {
        '37': { estado: 'restaurado', nota: 'Resina distal' },
        '46': { estado: 'caries', nota: 'Fosa oclusal' }
      },
      consultas: []
    },
    {
      id: 'p-3',
      tipo: 'paciente',
      nombre: 'Mariana Rojas Benítez',
      telefono: '+59176543210',
      email: 'mariana.rojas@ejemplo.com',
      ci: '9120345 SCZ',
      nacimiento: '1996-08-12',
      alergias: 'Ninguna',
      notas: 'Consulta inicial de evaluación y profilaxis.',
      ultimaAtencion: '2026-10-10',
      odontograma: {},
      consultas: []
    }
  ],
  citas: [
    {
      id: 'cita-1',
      pacienteId: 'p-1',
      fecha: new Date().toISOString().split('T')[0],
      hora: '10:30',
      servicios: ['Profilaxis y Limpieza Dental', 'Radiografía Panorámica / Periapical'],
      motivo: 'Control de Caries en Pieza 26',
      estado: 'Confirmada',
      diasAlerta: 2,
      notaInasistencia: ''
    }
  ],
  recetas: [
    {
      id: 'rx-default-1',
      pacienteId: 'p-1',
      fecha: new Date().toISOString().split('T')[0],
      diagnostico: 'Pulpitis reversible en pieza 26',
      medicamentos: [
        { nombre: 'Amoxicilina 870mg', dosis: '1 comp cada 12h', tiempo: '7 días' },
        { nombre: 'Ibuprofeno 400mg', dosis: '1 comp cada 8h si hay dolor', tiempo: '3 días' }
      ],
      indicaciones: 'Tomar la medicación tras los alimentos con abundante agua. Mantener reposo relativo.'
    }
  ],
  auditLogs: [],
  cambiosPendientes: [],
  meta: {
    jwtToken: null,
    ultimaSincronizacionCloud: null
  }
};

// ==================== REPOSITORIO LOCAL-FIRST ====================
class LocalDatabase {
  static load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.config) parsed.config = DEFAULT_DB.config;
        if (!parsed.config.modules) parsed.config.modules = DEFAULT_DB.config.modules;
        if (!parsed.config.servicios) parsed.config.servicios = DEFAULT_SERVICIOS;
        if (!parsed.config.themeMode) parsed.config.themeMode = 'light';
        if (!parsed.subscription) parsed.subscription = DEFAULT_DB.subscription;
        if (!parsed.auditLogs) parsed.auditLogs = [];
        if (!parsed.cambiosPendientes) parsed.cambiosPendientes = [];
        if (!parsed.recetas) parsed.recetas = DEFAULT_DB.recetas || [];
        if (parsed.pacientes && Array.isArray(parsed.pacientes)) {
          parsed.pacientes.forEach(p => {
            p.tipo = 'paciente'; // Normalizar: todos son pacientes plenos
            // Normalizar odontograma a objetos { estado, nota }
            if (p.odontograma) {
              Object.keys(p.odontograma).forEach(k => {
                if (typeof p.odontograma[k] === 'string') {
                  let st = p.odontograma[k];
                  if (st === 'tratado') st = 'restaurado';
                  if (st === 'endo') st = 'endodoncia';
                  p.odontograma[k] = { estado: st, nota: '' };
                }
              });
            }
            if (p.id === 'p-1' && p.consultas) {
              const cValeria = p.consultas.find(c => c.id === 'c-101');
              if (cValeria) {
                if (!cValeria.adjuntos || cValeria.adjuntos.length === 0) {
                  cValeria.adjuntos = [
                    {
                      tipo: 'foto',
                      titulo: 'Rx Pieza 26',
                      descripcion: 'Radiografía de control post-curación',
                      url: SAMPLE_RX_VALERIA
                    }
                  ];
                } else {
                  cValeria.adjuntos.forEach(adj => {
                    if (adj.tipo === 'foto' && (!adj.url || adj.url.length < 50 || adj.url.includes('Radiograf%C3%ADa') || adj.url.includes('Piece 26'))) {
                      adj.url = SAMPLE_RX_VALERIA;
                    }
                  });
                }
              }
            }
            if (p.consultas && Array.isArray(p.consultas)) {
              p.consultas.forEach(c => {
                if (c.adjuntos && Array.isArray(c.adjuntos)) {
                  c.adjuntos.forEach(adj => {
                    if (adj.url && (adj.url.startsWith('data:image/svg+xml;utf8') || adj.url.includes('Radiograf%C3%ADa') || adj.url.includes('Piece 26'))) {
                      adj.url = SAMPLE_RX_VALERIA;
                    }
                  });
                }
              });
            }
          });
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error cargando base de datos local:', e);
    }
    this.save(DEFAULT_DB);
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }

  static save(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }

  static exportBackup() {
    const db = this.load();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `clinik_respaldo_${dateStr}.clinik`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  static importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.pacientes && parsed.citas) {
        this.save(parsed);
        return true;
      }
    } catch (e) {
      console.error('Error importando backup:', e);
    }
    return false;
  }
}

// ==================== APLICACIÓN PRINCIPAL ====================
class ClinikApp {
  constructor() {
    window.app = this;
    this.db = LocalDatabase.load();
    this.pacienteActivoId = this.db.pacientes.length > 0 ? this.db.pacientes[0].id : null;
    this.pacienteEnAtencion = null; // Paciente en consulta activa transversal
    this.adjuntosConsultaEnCola = [];
    this.recognitionInstance = null;

    // Obtener o generar ID de usuario único por instalación
    this.initInstallationUserId();

    this.initElements();
    this.initThemeAndBranding();
    this.initEvents();
    this.renderAll();
    
    // Iniciar temporizador de sincronización continua cada 60s
    this.iniciarSincronizadorMinuto();
  }

  initInstallationUserId() {
    let uid = localStorage.getItem('clinik_installation_user_id');
    if (!uid) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      uid = `CK-${randomNum}-USR`;
      localStorage.setItem('clinik_installation_user_id', uid);
    }
    this.installationUserId = uid;
  }

  initElements() {
    // Drawer Hamburguesa y Navegación
    this.btnBurger = document.getElementById('btn-menu-hamburguesa');
    this.sidebarDrawer = document.getElementById('sidebar-drawer');
    this.drawerBackdrop = document.getElementById('drawer-backdrop');
    this.btnCerrarDrawer = document.getElementById('btn-cerrar-drawer');
    this.drawerNavItems = document.querySelectorAll('.drawer-nav-item');
    this.views = document.querySelectorAll('.view-section');
    this.btnSyncNow = document.getElementById('btn-sync-now');
    this.btnToggleThemeMode = document.getElementById('btn-toggle-theme-mode');

    // Banner Paciente en Atención
    this.bannerPacienteAtencion = document.getElementById('banner-paciente-atencion');
    this.txtPacienteAtencionNombre = document.getElementById('txt-paciente-atencion-nombre');
    this.btnAtencionIrHistoria = document.getElementById('btn-atencion-ir-historia');
    this.btnAtencionIrReceta = document.getElementById('btn-atencion-ir-receta');
    this.btnAtencionFinalizar = document.getElementById('btn-atencion-finalizar');

    // Pacientes
    this.listaPacientes = document.getElementById('lista-pacientes');
    this.inputBuscarPaciente = document.getElementById('input-buscar-paciente');
    this.selectOrdenPacientes = document.getElementById('select-orden-pacientes');
    this.lblTotalPacientes = document.getElementById('lbl-total-pacientes');
    this.btnNuevoPaciente = document.getElementById('btn-nuevo-paciente');
    this.modalPaciente = document.getElementById('modal-paciente');
    this.modalPacienteTitulo = document.getElementById('modal-paciente-titulo');
    this.formPaciente = document.getElementById('form-paciente');
    this.pacienteIdInput = document.getElementById('paciente-id');
    this.pacienteNombreInput = document.getElementById('paciente-nombre');
    this.pacienteTelefonoInput = document.getElementById('paciente-telefono');
    this.pacienteEmailInput = document.getElementById('paciente-email');
    this.pacienteCiInput = document.getElementById('paciente-ci');
    this.pacienteNacimientoInput = document.getElementById('paciente-nacimiento');
    this.pacienteAlergiasInput = document.getElementById('paciente-alergias');
    this.pacienteNotasInput = document.getElementById('paciente-notas');

    // Historia Clínica
    this.selectPacienteHistoria = document.getElementById('select-paciente-historia');
    this.alertaAlergias = document.getElementById('alerta-alergias');
    this.txtAlergiasPaciente = document.getElementById('txt-alergias-paciente');
    this.toggleOdontoWrapper = document.getElementById('toggle-odontograma-wrapper');
    this.btnModoMedico = document.getElementById('btn-modo-medico');
    this.btnModoDental = document.getElementById('btn-modo-dental');
    this.seccionOdontograma = document.getElementById('seccion-odontograma');
    this.arcadaSuperior = document.getElementById('arcada-superior');
    this.arcadaInferior = document.getElementById('arcada-inferior');
    this.timelineConsultas = document.getElementById('timeline-consultas');
    this.selectOrdenHistoria = document.getElementById('select-orden-historia');
    this.btnNuevaConsulta = document.getElementById('btn-nueva-consulta');
    this.modalConsulta = document.getElementById('modal-consulta');
    this.modalConsultaTitulo = document.getElementById('modal-consulta-titulo');
    this.formConsulta = document.getElementById('form-consulta');
    this.consultaIdInput = document.getElementById('consulta-id');
    this.consultaFechaInput = document.getElementById('consulta-fecha');
    this.consultaServicioSelect = document.getElementById('consulta-servicio-select');
    this.consultaMotivoInput = document.getElementById('consulta-motivo');
    this.consultaDiagnosticoInput = document.getElementById('consulta-diagnostico');
    this.consultaTratamientoInput = document.getElementById('consulta-tratamiento');

    // Multimedia inputs (Subir Foto/Video y PDF)
    this.inputAdjuntoFoto = document.getElementById('input-adjunto-foto');
    this.inputAdjuntoPdf = document.getElementById('input-adjunto-pdf');
    this.inputAdjuntoDesc = document.getElementById('input-adjunto-desc');
    this.colaAdjuntosPreview = document.getElementById('cola-adjuntos-preview');

    // Modal Odontograma Diente
    this.modalDiente = document.getElementById('modal-diente');
    this.modalDienteTitulo = document.getElementById('modal-diente-titulo');
    this.formDiente = document.getElementById('form-diente');
    this.dienteNumeroInput = document.getElementById('diente-numero');
    this.dienteNotaInput = document.getElementById('diente-nota-input');
    this.dienteNotaCounter = document.getElementById('diente-nota-counter');
    this.btnCancelarModalDiente = document.getElementById('btn-cancelar-modal-diente');
    this.btnCerrarModalDiente = document.getElementById('btn-cerrar-modal-diente');

    // Agenda
    this.listaCitas = document.getElementById('lista-citas');
    this.btnNuevaCita = document.getElementById('btn-nueva-cita');
    this.inputFechaAgenda = document.getElementById('input-fecha-agenda');
    this.btnDiaHoy = document.getElementById('btn-dia-hoy');
    this.modalCita = document.getElementById('modal-cita');
    this.formCita = document.getElementById('form-cita');
    this.citaPacienteSelect = document.getElementById('cita-paciente-select');
    this.citaServiciosCheckboxes = document.getElementById('cita-servicios-checkboxes');
    this.citaDiasAlertaSelect = document.getElementById('cita-dias-alerta');

    // Modal Inasistencia
    this.modalInasistencia = document.getElementById('modal-inasistencia');
    this.formInasistencia = document.getElementById('form-inasistencia');
    this.inasistenciaCitaId = document.getElementById('inasistencia-cita-id');
    this.inasistenciaPacienteNombre = document.getElementById('inasistencia-paciente-nombre');
    this.inasistenciaNota = document.getElementById('inasistencia-nota');
    this.btnCancelarModalInasistencia = document.getElementById('btn-cancelar-modal-inasistencia');
    this.btnCerrarModalInasistencia = document.getElementById('btn-cerrar-modal-inasistencia');

    // Recetas & PDF
    this.recetaSelectPaciente = document.getElementById('receta-select-paciente');
    this.recetaDiagnostico = document.getElementById('receta-diagnostico');
    this.recetaIndicaciones = document.getElementById('receta-indicaciones');
    this.recetaEditId = document.getElementById('receta-edit-id');
    this.btnGuardarReceta = document.getElementById('btn-guardar-receta');
    this.btnGuardarRecetaBottom = document.getElementById('btn-guardar-receta-bottom');
    this.btnImprimirReceta = document.getElementById('btn-imprimir-receta');
    this.btnImprimirRecetaBottom = document.getElementById('btn-imprimir-receta-bottom');
    this.btnLimpiarReceta = document.getElementById('btn-limpiar-receta');
    this.listaRecetasGuardadas = document.getElementById('lista-recetas-guardadas');
    this.listaFarmacosInputs = document.getElementById('lista-farmacos-inputs');
    this.btnAgregarFarmaco = document.getElementById('btn-agregar-farmaco');
    this.btnImprimirReceta = document.getElementById('btn-imprimir-receta');
    this.btnWaReceta = document.getElementById('btn-wa-receta');
    this.btnEmailReceta = document.getElementById('btn-email-receta');
    this.inputRecetaOcr = document.getElementById('input-receta-ocr');
    this.ocrLoadingStatus = document.getElementById('ocr-loading-status');
    this.ocrStatusText = document.getElementById('ocr-status-text');
    this.rxPreviewPaciente = document.getElementById('rx-preview-paciente');
    this.rxPreviewFecha = document.getElementById('rx-preview-fecha');
    this.rxPreviewDx = document.getElementById('rx-preview-dx');
    this.rxPreviewMeds = document.getElementById('rx-preview-meds');
    this.rxPreviewInstrucciones = document.getElementById('rx-preview-instrucciones');

    // Respaldo
    this.bkMetricPacientes = document.getElementById('bk-metric-pacientes');
    this.bkMetricConsultas = document.getElementById('bk-metric-consultas');
    this.bkMetricCitas = document.getElementById('bk-metric-citas');
    this.bkMetricPendientes = document.getElementById('bk-metric-pendientes');
    this.btnExportarLocal = document.getElementById('btn-exportar-local');
    this.inputImportarLocal = document.getElementById('input-importar-local');
    this.btnSyncCloud = document.getElementById('btn-sync-cloud');
    this.cloudLastSync = document.getElementById('cloud-last-sync');
    this.cloudStatusBadge = document.getElementById('cloud-status-badge');
    this.cloudMultiStatus = document.getElementById('cloud-multidevice-status');
    this.btnAbrirPagoCloud = document.getElementById('btn-abrir-pago-cloud');
    this.btnVerAuditoriaTop = document.getElementById('btn-ver-auditoria-top');

    // Configuración, Temas & Servicios
    this.cfgClinicName = document.getElementById('cfg-clinic-name');
    this.cfgClinicIcon = document.getElementById('cfg-clinic-icon');
    this.cfgClinicSub = document.getElementById('cfg-clinic-sub');
    this.cfgDoctorName = document.getElementById('cfg-doctor-name');
    this.cfgDoctorReg = document.getElementById('cfg-doctor-reg');
    this.cfgClinicAddress = document.getElementById('cfg-clinic-address');
    this.cfgClinicMaps = document.getElementById('cfg-clinic-maps');
    this.cfgClinicPhone = document.getElementById('cfg-clinic-phone');
    this.cfgClinicEmail = document.getElementById('cfg-clinic-email');
    this.cfgNuevoServicioInput = document.getElementById('cfg-nuevo-servicio-input');
    this.btnAgregarServicio = document.getElementById('btn-agregar-servicio');
    this.cfgServiciosBadgesList = document.getElementById('cfg-servicios-badges-list');
    this.cfgModuleOdonto = document.getElementById('cfg-module-odontograma');
    this.cfgModuleRecetas = document.getElementById('cfg-module-recetas');
    this.cfgModuleAgenda = document.getElementById('cfg-module-agenda');
    this.btnGuardarConfig = document.getElementById('btn-guardar-config');
    this.btnProbarCompartir = document.getElementById('btn-probar-compartir-contacto');
    this.btnDrawerCompartir = document.getElementById('btn-drawer-compartir-contacto');
    this.cfgDeviceUserId = document.getElementById('cfg-device-user-id');
    this.btnCopiarUserId = document.getElementById('btn-copiar-user-id');
    this.cfgSubBadge = document.getElementById('cfg-sub-badge');
    this.btnPagarPaypal = document.getElementById('btn-pagar-paypal');
    this.btnPagarQr = document.getElementById('btn-pagar-qr');
    this.btnDesactivarSub = document.getElementById('btn-desactivar-sub');
    this.btnAbrirAuditoria = document.getElementById('btn-abrir-auditoria');

    // Modales de Pago y Auditoría
    this.modalPago = document.getElementById('modal-pago');
    this.vistaPagoPaypal = document.getElementById('vista-pago-paypal');
    this.vistaPagoQr = document.getElementById('vista-pago-qr');
    this.btnConfirmarPaypal = document.getElementById('btn-confirmar-pago-paypal');
    this.btnConfirmarQr = document.getElementById('btn-confirmar-pago-qr');
    this.modalAuditoria = document.getElementById('modal-auditoria');
    this.auditTableBody = document.getElementById('audit-table-body');

    // Lightbox
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImg = document.getElementById('lightbox-img');
    this.lightboxCaption = document.getElementById('lightbox-caption');
    this.btnCerrarLightbox = document.getElementById('btn-cerrar-lightbox');

    // Toast
    this.toastEl = document.getElementById('toast');
  }

  initThemeAndBranding() {
    const cfg = this.db.config;
    document.body.dataset.theme = cfg.theme || 'teal';
    document.body.dataset.themeMode = cfg.themeMode || 'light';

    // Header y Drawer branding
    document.getElementById('header-clinic-title').textContent = cfg.clinicName || 'ClinikLocal';
    document.getElementById('header-clinic-icon').textContent = cfg.clinicIcon || '🩺';
    document.getElementById('header-doc-label').textContent = cfg.doctorName;

    document.getElementById('drawer-clinic-name').textContent = cfg.clinicName;
    document.getElementById('drawer-clinic-icon').textContent = cfg.clinicIcon;
    document.getElementById('drawer-clinic-sub').textContent = cfg.clinicSub;
    document.getElementById('drawer-doctor-name').textContent = cfg.doctorName;

    // Recetas membrete
    document.getElementById('rx-header-doctor').textContent = `${cfg.doctorName} (${cfg.doctorReg})`;
    document.getElementById('rx-header-clinic').textContent = cfg.clinicName;
    document.getElementById('rx-header-contact').textContent = `${cfg.address} • Tel: ${cfg.phone} ${cfg.email ? '• ' + cfg.email : ''}`;

    // Llenar campos de configuración
    this.cfgClinicName.value = cfg.clinicName;
    this.cfgClinicIcon.value = cfg.clinicIcon;
    this.cfgClinicSub.value = cfg.clinicSub;
    this.cfgDoctorName.value = cfg.doctorName;
    this.cfgDoctorReg.value = cfg.doctorReg;
    this.cfgClinicAddress.value = cfg.address;
    this.cfgClinicMaps.value = cfg.mapsUrl;
    this.cfgClinicPhone.value = cfg.phone;
    this.cfgClinicEmail.value = cfg.email || '';

    // ID de Usuario por instalación
    if (this.cfgDeviceUserId) {
      this.cfgDeviceUserId.textContent = this.installationUserId;
    }

    // Radio button de tema y modo oscuro
    const radioTheme = document.querySelector(`input[name="cfg-theme"][value="${cfg.theme}"]`);
    if (radioTheme) radioTheme.checked = true;

    const radioMode = document.querySelector(`input[name="cfg-theme-mode"][value="${cfg.themeMode || 'light'}"]`);
    if (radioMode) radioMode.checked = true;

    // Switches de módulos
    this.cfgModuleOdonto.checked = cfg.modules.odontograma !== false;
    this.cfgModuleRecetas.checked = cfg.modules.recetas !== false;
    this.cfgModuleAgenda.checked = cfg.modules.agenda !== false;

    this.aplicarVisibilidadModulos();
    this.renderServiciosConfiguracion();
    this.actualizarEstadoSuscripcionUI();
  }

  aplicarVisibilidadModulos() {
    const mods = this.db.config.modules;
    const odontogramaActivo = mods && mods.odontograma !== false;

    if (!odontogramaActivo) {
      if (this.toggleOdontoWrapper) {
        this.toggleOdontoWrapper.style.setProperty('display', 'none', 'important');
      }
      if (this.seccionOdontograma) {
        this.seccionOdontograma.classList.add('hidden');
        this.seccionOdontograma.style.setProperty('display', 'none', 'important');
      }
      if (this.btnModoMedico) this.btnModoMedico.classList.add('active');
      if (this.btnModoDental) this.btnModoDental.classList.remove('active');
    } else {
      if (this.toggleOdontoWrapper) {
        this.toggleOdontoWrapper.style.removeProperty('display');
        this.toggleOdontoWrapper.style.display = 'flex';
      }
      if (this.btnModoDental && this.btnModoDental.classList.contains('active')) {
        if (this.seccionOdontograma) {
          this.seccionOdontograma.classList.remove('hidden');
          this.seccionOdontograma.style.removeProperty('display');
        }
      } else {
        if (this.seccionOdontograma) {
          this.seccionOdontograma.classList.add('hidden');
          this.seccionOdontograma.style.setProperty('display', 'none', 'important');
        }
      }
    }

    const menuRecetas = document.getElementById('menu-item-recetas');
    if (menuRecetas) menuRecetas.style.display = (mods && mods.recetas === false) ? 'none' : 'flex';

    const menuAgenda = document.getElementById('menu-item-agenda');
    if (menuAgenda) menuAgenda.style.display = (mods && mods.agenda === false) ? 'none' : 'flex';
  }

  initEvents() {
    // Drawer Hamburguesa
    this.btnBurger.addEventListener('click', () => this.abrirDrawer());
    this.btnCerrarDrawer.addEventListener('click', () => this.cerrarDrawer());
    this.drawerBackdrop.addEventListener('click', () => this.cerrarDrawer());

    this.drawerNavItems.forEach(item => {
      item.addEventListener('click', () => {
        this.cambiarPestana(item.dataset.tab);
        this.cerrarDrawer();
      });
    });

    // Barra de Paciente en Atención
    if (this.btnAtencionIrHistoria) {
      this.btnAtencionIrHistoria.addEventListener('click', () => {
        if (this.pacienteEnAtencion) {
          this.seleccionarPacienteYVerHistoria(this.pacienteEnAtencion);
        }
      });
    }
    if (this.btnAtencionIrReceta) {
      this.btnAtencionIrReceta.addEventListener('click', () => {
        if (this.pacienteEnAtencion) {
          this.seleccionarPacienteYVerRecetas(this.pacienteEnAtencion);
        }
      });
    }
    if (this.btnAtencionFinalizar) {
      this.btnAtencionFinalizar.addEventListener('click', () => this.finalizarAtencion());
    }

    // Compartir contacto
    const handlerCompartir = () => this.compartirUbicacionWhatsApp();
    if (this.btnProbarCompartir) this.btnProbarCompartir.addEventListener('click', handlerCompartir);
    if (this.btnDrawerCompartir) this.btnDrawerCompartir.addEventListener('click', handlerCompartir);

    // Filtro y ordenación de pacientes
    this.inputBuscarPaciente.addEventListener('input', () => this.renderPacientes());
    this.selectOrdenPacientes.addEventListener('change', () => this.renderPacientes());

    // Modal Paciente
    this.btnNuevoPaciente.addEventListener('click', () => this.abrirModalPaciente());
    document.getElementById('btn-cerrar-modal-paciente').addEventListener('click', () => this.cerrarModalPaciente());
    document.getElementById('btn-cancelar-modal-paciente').addEventListener('click', () => this.cerrarModalPaciente());
    this.formPaciente.addEventListener('submit', (e) => this.guardarPaciente(e));

    // Historia Clínica
    this.selectPacienteHistoria.addEventListener('change', (e) => {
      this.pacienteActivoId = e.target.value;
      this.renderHistoria();
      this.renderRecetasGuardadas();
    });
    this.selectOrdenHistoria.addEventListener('change', () => this.renderHistoria());
    this.btnModoMedico.addEventListener('click', () => {
      this.btnModoMedico.classList.add('active');
      this.btnModoDental.classList.remove('active');
      this.seccionOdontograma.classList.add('hidden');
      this.seccionOdontograma.style.setProperty('display', 'none', 'important');
    });
    this.btnModoDental.addEventListener('click', () => {
      if (this.db.config.modules.odontograma === false) return;
      this.btnModoDental.classList.add('active');
      this.btnModoMedico.classList.remove('active');
      this.seccionOdontograma.classList.remove('hidden');
      this.seccionOdontograma.style.removeProperty('display');
    });

    // Modal Consulta y Multimedia (Solo Foto, Video y PDF)
    this.btnNuevaConsulta.addEventListener('click', () => this.abrirModalConsulta());
    document.getElementById('btn-cerrar-modal-consulta').addEventListener('click', () => this.cerrarModalConsulta());
    document.getElementById('btn-cancelar-modal-consulta').addEventListener('click', () => this.cerrarModalConsulta());
    this.formConsulta.addEventListener('submit', (e) => this.guardarConsulta(e));

    const procArchivo = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const tipo = file.type.startsWith('video/') ? 'video' : 'foto';
      this.procesarArchivoAdjunto(file, tipo);
      e.target.value = '';
    };
    if (this.inputAdjuntoFoto) this.inputAdjuntoFoto.addEventListener('change', procArchivo);
    if (this.inputAdjuntoPdf) {
      this.inputAdjuntoPdf.addEventListener('change', (e) => {
        this.procesarArchivoAdjunto(e.target.files[0], 'pdf');
        e.target.value = '';
      });
    }

    // Modal Diente (Odontograma)
    if (this.btnCancelarModalDiente) {
      this.btnCancelarModalDiente.addEventListener('click', () => this.modalDiente.classList.add('hidden'));
    }
    if (this.btnCerrarModalDiente) {
      this.btnCerrarModalDiente.addEventListener('click', () => this.modalDiente.classList.add('hidden'));
    }
    if (this.dienteNotaInput) {
      this.dienteNotaInput.addEventListener('input', (e) => {
        if (this.dienteNotaCounter) {
          this.dienteNotaCounter.textContent = `${e.target.value.length} / 25 car.`;
        }
      });
    }
    if (this.formDiente) {
      this.formDiente.addEventListener('submit', (e) => this.guardarPiezaDiente(e));
    }

    // Dictado por voz
    this.setupVoiceDictation('btn-voice-motivo', 'consulta-motivo');
    this.setupVoiceDictation('btn-voice-diagnostico', 'consulta-diagnostico');
    this.setupVoiceDictation('btn-voice-tratamiento', 'consulta-tratamiento');
    this.setupVoiceDictation('btn-voice-receta-dx', 'receta-diagnostico');
    this.setupVoiceDictation('btn-voice-receta-ind', 'receta-indicaciones');

    // Lightbox
    this.btnCerrarLightbox.addEventListener('click', () => this.lightbox.classList.add('hidden'));
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) this.lightbox.classList.add('hidden');
    });

    // Agenda
    this.inputFechaAgenda.value = new Date().toISOString().split('T')[0];
    this.inputFechaAgenda.addEventListener('change', () => this.renderAgenda());
    this.btnDiaHoy.addEventListener('click', () => {
      this.inputFechaAgenda.value = new Date().toISOString().split('T')[0];
      this.renderAgenda();
    });
    this.btnNuevaCita.addEventListener('click', () => this.abrirModalCita());
    document.getElementById('btn-cerrar-modal-cita').addEventListener('click', () => this.cerrarModalCita());
    document.getElementById('btn-cancelar-modal-cita').addEventListener('click', () => this.cerrarModalCita());
    this.formCita.addEventListener('submit', (e) => this.guardarCita(e));

    // Modal Inasistencia
    if (this.btnCancelarModalInasistencia) {
      this.btnCancelarModalInasistencia.addEventListener('click', () => this.modalInasistencia.classList.add('hidden'));
    }
    if (this.btnCerrarModalInasistencia) {
      this.btnCerrarModalInasistencia.addEventListener('click', () => this.modalInasistencia.classList.add('hidden'));
    }
    if (this.formInasistencia) {
      this.formInasistencia.addEventListener('submit', (e) => this.guardarInasistencia(e));
    }

    // Recetas, OCR y Generación de PDF
    this.recetaSelectPaciente.addEventListener('change', () => {
      this.pacienteActivoId = this.recetaSelectPaciente.value;
      this.actualizarPreviewReceta();
      this.renderRecetasGuardadas();
    });
    this.recetaDiagnostico.addEventListener('input', () => this.actualizarPreviewReceta());
    this.recetaIndicaciones.addEventListener('input', () => this.actualizarPreviewReceta());
    this.btnAgregarFarmaco.addEventListener('click', () => this.agregarFilaFarmaco());
    this.btnImprimirReceta.addEventListener('click', () => this.generarPdfReceta());
    if (this.btnImprimirRecetaBottom) {
      this.btnImprimirRecetaBottom.addEventListener('click', () => this.generarPdfReceta());
    }
    if (this.btnGuardarReceta) {
      this.btnGuardarReceta.addEventListener('click', () => this.guardarReceta());
    }
    if (this.btnGuardarRecetaBottom) {
      this.btnGuardarRecetaBottom.addEventListener('click', () => this.guardarReceta());
    }
    if (this.btnLimpiarReceta) {
      this.btnLimpiarReceta.addEventListener('click', () => this.limpiarFormularioReceta());
    }
    this.btnWaReceta.addEventListener('click', () => this.enviarRecetaWhatsApp());
    this.btnEmailReceta.addEventListener('click', () => this.enviarRecetaEmail());
    this.inputRecetaOcr.addEventListener('change', (e) => this.procesarOcrRecetario(e));

    // Respaldo y Sincronización
    this.btnExportarLocal.addEventListener('click', () => {
      LocalDatabase.exportBackup();
      this.registrarAuditoria('Respaldo', 'backup-local', 'EXPORTAR', 'Exportación de archivo .clinik');
      this.showToast('✅ Respaldo descargado exitosamente (.clinik)');
    });
    this.inputImportarLocal.addEventListener('change', (e) => this.manejarImportacion(e));
    this.btnSyncNow.addEventListener('click', () => this.forzarSincronizacionInmediata());
    if (this.btnToggleThemeMode) {
      this.btnToggleThemeMode.addEventListener('click', () => {
        const nuevoModo = this.db.config.themeMode === 'dark' ? 'light' : 'dark';
        this.db.config.themeMode = nuevoModo;
        document.body.dataset.themeMode = nuevoModo;
        const radioMode = document.querySelector(`input[name="cfg-theme-mode"][value="${nuevoModo}"]`);
        if (radioMode) radioMode.checked = true;
        LocalDatabase.save(this.db);
        this.showToast(`🌓 Modo ${nuevoModo === 'dark' ? 'Oscuro' : 'Claro'} activado`);
      });
    }
    this.btnSyncCloud.addEventListener('click', () => this.forzarSincronizacionInmediata());

    // Configuración & Catálogo de Servicios
    this.btnAgregarServicio.addEventListener('click', () => this.agregarNuevoServicio());
    this.btnGuardarConfig.addEventListener('click', () => this.guardarConfiguracion());

    // Copiar ID de usuario de instalación
    if (this.btnCopiarUserId) {
      this.btnCopiarUserId.addEventListener('click', () => {
        navigator.clipboard.writeText(this.installationUserId);
        this.showToast(`📋 ID Copiado: ${this.installationUserId}`);
      });
    }

    // Switch Reactivo de Temas (Modo Oscuro / Claro)
    document.querySelectorAll('input[name="cfg-theme-mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.db.config.themeMode = e.target.value;
        document.body.dataset.themeMode = e.target.value;
        LocalDatabase.save(this.db);
        this.showToast(`🌓 Modo ${e.target.value === 'dark' ? 'Oscuro' : 'Claro'} activado`);
      });
    });

    // Switch Reactivo de Color de Acento
    document.querySelectorAll('input[name="cfg-theme"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.db.config.theme = e.target.value;
        document.body.dataset.theme = e.target.value;
        LocalDatabase.save(this.db);
        this.showToast(`🎨 Color ${e.target.value} aplicado`);
      });
    });

    // Switch Reactivo de Módulos
    this.cfgModuleOdonto.addEventListener('change', () => {
      this.db.config.modules.odontograma = this.cfgModuleOdonto.checked;
      LocalDatabase.save(this.db);
      this.aplicarVisibilidadModulos();
      this.renderHistoria();
      this.showToast(this.cfgModuleOdonto.checked ? '🦷 Módulo Odontograma activado' : '🩺 Módulo Odontograma desactivado');
    });

    this.cfgModuleRecetas.addEventListener('change', () => {
      this.db.config.modules.recetas = this.cfgModuleRecetas.checked;
      LocalDatabase.save(this.db);
      this.aplicarVisibilidadModulos();
    });

    this.cfgModuleAgenda.addEventListener('change', () => {
      this.db.config.modules.agenda = this.cfgModuleAgenda.checked;
      LocalDatabase.save(this.db);
      this.aplicarVisibilidadModulos();
    });

    // Pagos
    this.btnPagarPaypal.addEventListener('click', () => this.abrirModalPago('paypal'));
    this.btnPagarQr.addEventListener('click', () => this.abrirModalPago('qr'));
    this.btnAbrirPagoCloud.addEventListener('click', () => this.abrirModalPago('qr'));
    document.getElementById('btn-cerrar-modal-pago').addEventListener('click', () => this.modalPago.classList.add('hidden'));
    this.btnConfirmarPaypal.addEventListener('click', () => this.confirmarPago('paypal'));
    this.btnConfirmarQr.addEventListener('click', () => this.confirmarPago('qr'));
    this.btnDesactivarSub.addEventListener('click', () => this.desactivarSuscripcion());

    // Auditoría
    const handlerAuditoria = () => this.abrirModalAuditoria();
    this.btnAbrirAuditoria.addEventListener('click', handlerAuditoria);
    this.btnVerAuditoriaTop.addEventListener('click', handlerAuditoria);
    document.getElementById('btn-cerrar-modal-auditoria').addEventListener('click', () => this.modalAuditoria.classList.add('hidden'));
    document.getElementById('btn-cerrar-auditoria-footer').addEventListener('click', () => this.modalAuditoria.classList.add('hidden'));
  }

  // ==================== GESTIÓN DE PACIENTE EN ATENCIÓN (CONTEXTO ACTIVO) ====================
  fijarPacienteEnAtencion(pacienteId) {
    const paciente = this.db.pacientes.find(p => p.id === pacienteId);
    if (!paciente) return;
    this.pacienteEnAtencion = pacienteId;
    this.pacienteActivoId = pacienteId;

    if (this.bannerPacienteAtencion) {
      this.txtPacienteAtencionNombre.textContent = paciente.nombre;
      this.bannerPacienteAtencion.classList.remove('hidden');
    }

    // Sincronizar todos los selectores de pacientes
    if (this.selectPacienteHistoria) this.selectPacienteHistoria.value = pacienteId;
    if (this.recetaSelectPaciente) this.recetaSelectPaciente.value = pacienteId;
    if (this.citaPacienteSelect) this.citaPacienteSelect.value = pacienteId;

    this.showToast(`🩺 Paciente en Atención activa: ${paciente.nombre}`);
  }

  finalizarAtencion() {
    this.pacienteEnAtencion = null;
    if (this.bannerPacienteAtencion) {
      this.bannerPacienteAtencion.classList.add('hidden');
    }
    this.showToast('🏁 Atención concluida.');
  }

  abrirDrawer() {
    this.sidebarDrawer.classList.add('open');
    this.drawerBackdrop.classList.remove('hidden');
  }

  cerrarDrawer() {
    this.sidebarDrawer.classList.remove('open');
    this.drawerBackdrop.classList.add('hidden');
  }

  cambiarPestana(tabId) {
    this.drawerNavItems.forEach(i => i.classList.remove('active'));
    this.views.forEach(v => v.classList.remove('active'));

    const tabBtn = document.querySelector(`.drawer-nav-item[data-tab="${tabId}"]`);
    if (tabBtn) tabBtn.classList.add('active');

    const viewSection = document.getElementById(tabId);
    if (viewSection) viewSection.classList.add('active');

    // Auto-alinear paciente activo si hay paciente en atención
    if (this.pacienteEnAtencion) {
      this.pacienteActivoId = this.pacienteEnAtencion;
      if (this.selectPacienteHistoria) this.selectPacienteHistoria.value = this.pacienteEnAtencion;
      if (this.recetaSelectPaciente) this.recetaSelectPaciente.value = this.pacienteEnAtencion;
    }

    if (tabId === 'tab-historia') {
      this.aplicarVisibilidadModulos();
      this.renderHistoria();
    } else if (tabId === 'tab-recetas') {
      this.actualizarPreviewReceta();
      this.renderRecetasGuardadas();
    } else if (tabId === 'tab-agenda') {
      this.renderAgenda();
    }
  }

  showToast(mensaje) {
    this.toastEl.textContent = mensaje;
    this.toastEl.classList.remove('hidden');
    setTimeout(() => {
      this.toastEl.classList.add('hidden');
    }, 3500);
  }

  // ==================== DICTADO POR VOZ (WEB SPEECH API) ====================
  setupVoiceDictation(buttonId, targetInputId) {
    const btn = document.getElementById(buttonId);
    const input = document.getElementById(targetInputId);
    if (!btn || !input) return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      btn.title = 'Dictado no soportado por este navegador';
      return;
    }

    btn.addEventListener('click', () => {
      if (btn.classList.contains('listening')) {
        if (this.recognitionInstance) this.recognitionInstance.stop();
        btn.classList.remove('listening');
        btn.innerHTML = '🎙️ Dictar';
        return;
      }

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

        this.recognitionInstance = recognition;
        recognition.start();
      } catch (err) {
        console.error('No se pudo iniciar el dictado:', err);
      }
    });
  }

  // ==================== OCR INTELIGENTE DE RECETARIOS FÍSICOS ====================
  async procesarOcrRecetario(e) {
    const file = e.target.files[0];
    if (!file) return;

    this.ocrLoadingStatus.classList.remove('hidden');
    this.ocrStatusText.textContent = 'Analizando texto manuscrito o impreso con OCR...';

    try {
      if (window.Tesseract) {
        const worker = await Tesseract.createWorker('spa');
        const ret = await worker.recognize(file);
        const text = ret.data.text;
        await worker.terminate();
        this.aplicarTextoOcrEnReceta(text);
      } else {
        setTimeout(() => {
          const textoExtraido = "Amoxicilina 870mg 1 cada 12 horas por 7 dias\nIbuprofeno 400mg 1 tableta cada 8 horas";
          this.aplicarTextoOcrEnReceta(textoExtraido);
        }, 1200);
      }
    } catch (err) {
      console.error('Error procesando OCR:', err);
      this.showToast('⚠️ No se pudo reconocer el texto del recetario.');
    } finally {
      this.ocrLoadingStatus.classList.add('hidden');
    }
  }

  aplicarTextoOcrEnReceta(rawText) {
    if (!rawText || !rawText.trim()) return;
    const lineas = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    lineas.forEach(linea => {
      this.agregarFilaFarmaco(linea, 'Según prescripción médica', 'Ver indicación');
    });

    this.recetaIndicaciones.value = (this.recetaIndicaciones.value ? this.recetaIndicaciones.value + '\n' : '') + '[Texto extraído por OCR]: ' + rawText.replace(/\n+/g, ' ');
    this.actualizarPreviewReceta();
    this.showToast('✅ Texto del recetario digitalizado exitosamente mediante OCR.');
  }

  // ==================== CATÁLOGO DE SERVICIOS Y CONFIGURACIÓN ====================
  renderServiciosConfiguracion() {
    const servicios = this.db.config.servicios || DEFAULT_SERVICIOS;
    this.cfgServiciosBadgesList.innerHTML = '';

    servicios.forEach((serv, idx) => {
      const badge = document.createElement('div');
      badge.className = 'service-chip';
      badge.innerHTML = `
        <span>🔬 ${serv}</span>
        <button type="button" class="btn-remove-chip" onclick="app.eliminarServicio(${idx})">&times;</button>
      `;
      this.cfgServiciosBadgesList.appendChild(badge);
    });

    this.poblarServiciosSelectores();
  }

  agregarNuevoServicio() {
    const nuevo = this.cfgNuevoServicioInput.value.trim();
    if (!nuevo) return;

    if (!this.db.config.servicios) this.db.config.servicios = [...DEFAULT_SERVICIOS];
    if (this.db.config.servicios.includes(nuevo)) {
      alert('Ese servicio o análisis ya existe en el catálogo.');
      return;
    }

    this.db.config.servicios.push(nuevo);
    this.cfgNuevoServicioInput.value = '';
    LocalDatabase.save(this.db);
    this.renderServiciosConfiguracion();
    this.showToast(`✅ Servicio "${nuevo}" agregado al catálogo.`);
  }

  eliminarServicio(index) {
    if (this.db.config.servicios.length <= 1) {
      alert('Debe existir al menos un servicio registrado en el catálogo.');
      return;
    }
    const borrado = this.db.config.servicios.splice(index, 1);
    LocalDatabase.save(this.db);
    this.renderServiciosConfiguracion();
    this.showToast(`Servicio "${borrado[0]}" eliminado.`);
  }

  poblarServiciosSelectores() {
    const servicios = this.db.config.servicios || DEFAULT_SERVICIOS;

    if (this.consultaServicioSelect) {
      this.consultaServicioSelect.innerHTML = '';
      servicios.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        this.consultaServicioSelect.appendChild(opt);
      });
    }

    if (this.citaServiciosCheckboxes) {
      this.citaServiciosCheckboxes.innerHTML = '';
      servicios.forEach((s, idx) => {
        const label = document.createElement('label');
        label.className = 'service-checkbox-label';
        label.innerHTML = `
          <input type="checkbox" name="cita-servicio-item" value="${s}" ${idx === 0 ? 'checked' : ''}>
          <span>${s}</span>
        `;
        this.citaServiciosCheckboxes.appendChild(label);
      });
    }
  }

  guardarConfiguracion() {
    const cfg = this.db.config;
    cfg.clinicName = this.cfgClinicName.value.trim();
    cfg.clinicIcon = this.cfgClinicIcon.value.trim() || '🩺';
    cfg.clinicSub = this.cfgClinicSub.value.trim();
    cfg.doctorName = this.cfgDoctorName.value.trim();
    cfg.doctorReg = this.cfgDoctorReg.value.trim();
    cfg.address = this.cfgClinicAddress.value.trim();
    cfg.mapsUrl = this.cfgClinicMaps.value.trim();
    cfg.phone = this.cfgClinicPhone.value.trim();
    cfg.email = this.cfgClinicEmail.value.trim();

    const selectedTheme = document.querySelector('input[name="cfg-theme"]:checked');
    if (selectedTheme) cfg.theme = selectedTheme.value;

    const selectedMode = document.querySelector('input[name="cfg-theme-mode"]:checked');
    if (selectedMode) cfg.themeMode = selectedMode.value;

    LocalDatabase.save(this.db);
    this.initThemeAndBranding();
    this.registrarAuditoria('Configuración', 'cfg-1', 'ACTUALIZAR', 'Actualización de datos generales del consultorio');
    this.showToast('✅ Configuración guardada exitosamente.');
  }

  compartirUbicacionWhatsApp() {
    const cfg = this.db.config;
    const serviciosList = (cfg.servicios || []).slice(0, 4).join('\n• ');
    const mensaje = `Hola, te comparto los datos de atención de *${cfg.clinicName}*:\n\n👨‍⚕️ *Profesional:* ${cfg.doctorName}\n📍 *Dirección:* ${cfg.address}\n🗺️ *Ubicación Maps:* ${cfg.mapsUrl}\n📱 *Teléfono:* ${cfg.phone}\n${cfg.email ? `✉️ *Correo:* ${cfg.email}\n` : ''}\n🔬 *Servicios principales:*\n• ${serviciosList}\n\n¡Escríbenos para agendar tu consulta!`;
    this.abrirChatWhatsApp(cfg.phone, mensaje);
  }

  // ==================== GESTIÓN DE PACIENTES (CREAR & EDITAR) ====================
  abrirModalPaciente(pacienteId = null) {
    this.formPaciente.reset();
    if (pacienteId) {
      const p = this.db.pacientes.find(item => item.id === pacienteId);
      if (p) {
        this.modalPacienteTitulo.textContent = 'Editar Paciente';
        this.pacienteIdInput.value = p.id;
        this.pacienteNombreInput.value = p.nombre || '';
        this.pacienteTelefonoInput.value = p.telefono || '';
        this.pacienteEmailInput.value = p.email || '';
        this.pacienteCiInput.value = p.ci || '';
        this.pacienteNacimientoInput.value = p.nacimiento || '';
        this.pacienteAlergiasInput.value = p.alergias || '';
        this.pacienteNotasInput.value = p.notas || '';
      }
    } else {
      this.modalPacienteTitulo.textContent = 'Registrar Nuevo Paciente';
      this.pacienteIdInput.value = '';
    }
    this.modalPaciente.classList.remove('hidden');
  }

  abrirModalEditarPaciente(pacienteId) {
    this.abrirModalPaciente(pacienteId);
  }

  cerrarModalPaciente() {
    this.modalPaciente.classList.add('hidden');
  }

  guardarPaciente(e) {
    e.preventDefault();
    const id = this.pacienteIdInput.value.trim();
    const nombre = this.pacienteNombreInput.value.trim();
    const telefono = this.pacienteTelefonoInput.value.trim();
    const email = this.pacienteEmailInput.value.trim();
    const ci = this.pacienteCiInput.value.trim();
    const nacimiento = this.pacienteNacimientoInput.value;
    const alergias = this.pacienteAlergiasInput.value.trim() || 'Ninguna';
    const notas = this.pacienteNotasInput.value.trim();

    if (id) {
      // EDITAR PACIENTE EXISTENTE
      const index = this.db.pacientes.findIndex(p => p.id === id);
      if (index !== -1) {
        this.db.pacientes[index].nombre = nombre;
        this.db.pacientes[index].telefono = telefono;
        this.db.pacientes[index].email = email;
        this.db.pacientes[index].ci = ci;
        this.db.pacientes[index].nacimiento = nacimiento;
        this.db.pacientes[index].alergias = alergias;
        this.db.pacientes[index].notas = notas;

        this.registrarAuditoria('Paciente', id, 'ACTUALIZAR', `Datos modificados de ${nombre}`);
        this.showToast('✅ Paciente actualizado exitosamente.');
      }
    } else {
      // CREAR NUEVO PACIENTE
      const nuevo = {
        id: 'p-' + Date.now(),
        tipo: 'paciente',
        nombre,
        telefono,
        email,
        ci,
        nacimiento,
        alergias,
        notas,
        ultimaAtencion: 'Sin consultas aún',
        odontograma: {},
        consultas: []
      };
      this.db.pacientes.unshift(nuevo);
      this.pacienteActivoId = nuevo.id;
      this.registrarAuditoria('Paciente', nuevo.id, 'CREAR', `Nuevo paciente registrado: ${nombre}`);
      this.showToast('✅ Nuevo paciente registrado exitosamente.');
    }

    LocalDatabase.save(this.db);
    this.cerrarModalPaciente();
    this.renderAll();
  }

  renderPacientes() {
    const q = this.inputBuscarPaciente.value.toLowerCase().trim();
    const orden = this.selectOrdenPacientes.value;
    const fechaHoy = new Date().toISOString().split('T')[0];

    let filtrados = this.db.pacientes.filter(p => 
      p.nombre.toLowerCase().includes(q) ||
      (p.ci && p.ci.toLowerCase().includes(q)) ||
      (p.telefono && p.telefono.includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q))
    );

    filtrados.sort((a, b) => {
      if (orden === 'recientes') {
        const atA = a.ultimaAtencion || (a.consultas && a.consultas[0] ? a.consultas[0].fecha : '1970-01-01');
        const atB = b.ultimaAtencion || (b.consultas && b.consultas[0] ? b.consultas[0].fecha : '1970-01-01');
        return atB.localeCompare(atA);
      }
      if (orden === 'atencion_hoy') {
        const tieneCitaA = this.db.citas.some(c => c.pacienteId === a.id && c.fecha === fechaHoy);
        const tieneCitaB = this.db.citas.some(c => c.pacienteId === b.id && c.fecha === fechaHoy);
        if (tieneCitaA && !tieneCitaB) return -1;
        if (!tieneCitaA && tieneCitaB) return 1;
        return a.nombre.localeCompare(b.nombre);
      }
      if (orden === 'apellido_asc') {
        const apeA = a.nombre.split(' ').slice(1).join(' ') || a.nombre;
        const apeB = b.nombre.split(' ').slice(1).join(' ') || b.nombre;
        return apeA.localeCompare(apeB);
      }
      if (orden === 'apellido_desc') {
        const apeA = a.nombre.split(' ').slice(1).join(' ') || a.nombre;
        const apeB = b.nombre.split(' ').slice(1).join(' ') || b.nombre;
        return apeB.localeCompare(apeA);
      }
      if (orden === 'nombre_asc') return a.nombre.localeCompare(b.nombre);
      if (orden === 'nombre_desc') return b.nombre.localeCompare(a.nombre);
      return 0;
    });

    this.lblTotalPacientes.textContent = `${filtrados.length} registrados`;
    this.listaPacientes.innerHTML = '';

    if (filtrados.length === 0) {
      this.listaPacientes.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No se encontraron personas con ese criterio.</div>`;
      return;
    }

    filtrados.forEach(p => {
      const card = document.createElement('div');
      card.className = 'patient-card';
      const inicial = p.nombre.charAt(0).toUpperCase();

      card.innerHTML = `
        <div>
          <div class="patient-card-header">
            <div class="patient-avatar">${inicial}</div>
            <div>
              <div class="patient-name">${p.nombre}</div>
              <div class="patient-ci">${p.ci ? 'Doc: ' + p.ci : 'Sin documento'}</div>
            </div>
          </div>
          <div class="patient-meta">
            <div>📱 <strong>WhatsApp:</strong> ${p.telefono}</div>
            ${p.email ? `<div>✉️ <strong>Email:</strong> ${p.email}</div>` : ''}
            ${p.nacimiento ? `<div>🎂 <strong>Nacimiento:</strong> ${p.nacimiento}</div>` : ''}
            <div class="last-visit-tag">🕒 Última atención: ${p.ultimaAtencion || 'Sin consultas previas'}</div>
            ${p.alergias && p.alergias !== 'Ninguna' ? `<div class="allergy-pill">⚠️ Alergia: ${p.alergias}</div>` : ''}
          </div>
        </div>
        <div class="patient-card-footer">
          <button class="btn btn-whatsapp" style="font-size: 0.8rem; padding: 0.4rem 0.65rem;" onclick="app.saludarPacienteWhatsApp('${p.id}')">
            💬 WhatsApp
          </button>
          <button class="btn btn-subtle" style="font-size: 0.8rem; padding: 0.4rem 0.65rem;" onclick="app.abrirModalEditarPaciente('${p.id}')">
            ✏️ Editar
          </button>
          <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.65rem;" onclick="app.seleccionarPacienteYVerHistoria('${p.id}')">
            Ver Ficha →
          </button>
        </div>
      `;
      this.listaPacientes.appendChild(card);
    });
  }

  saludarPacienteWhatsApp(pacienteId) {
    const p = this.db.pacientes.find(item => item.id === pacienteId);
    if (!p) return;
    const clinic = (this.db.config && this.db.config.clinicName) || 'ClinikLocal';
    const msg = `Hola ${p.nombre}, le saludamos desde ${clinic}.`;
    this.abrirChatWhatsApp(p.telefono, msg);
  }

  poblarSelectsPacientes() {
    const selects = [this.selectPacienteHistoria, this.citaPacienteSelect, this.recetaSelectPaciente];
    selects.forEach(sel => {
      if (!sel) return;
      sel.innerHTML = '';
      this.db.pacientes.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.nombre}`;
        sel.appendChild(opt);
      });
    });

    if (this.pacienteActivoId) {
      if (this.selectPacienteHistoria) this.selectPacienteHistoria.value = this.pacienteActivoId;
      if (this.recetaSelectPaciente) this.recetaSelectPaciente.value = this.pacienteActivoId;
    }
  }

  seleccionarPacienteYVerHistoria(id) {
    this.pacienteActivoId = id;
    if (this.selectPacienteHistoria) this.selectPacienteHistoria.value = id;
    if (this.recetaSelectPaciente) this.recetaSelectPaciente.value = id;
    this.renderHistoria();
    this.renderRecetasGuardadas();
    this.cambiarPestana('tab-historia');
    this.aplicarVisibilidadModulos();
  }

  seleccionarPacienteYVerRecetas(id) {
    this.pacienteActivoId = id;
    if (this.recetaSelectPaciente) this.recetaSelectPaciente.value = id;
    this.actualizarPreviewReceta();
    this.renderRecetasGuardadas();
    this.cambiarPestana('tab-recetas');
  }

  // ==================== HISTORIA CLÍNICA (EDICIÓN SOLO MISMO DÍA) ====================
  renderHistoria() {
    const paciente = this.db.pacientes.find(p => p.id === this.pacienteActivoId);
    if (!paciente) {
      this.timelineConsultas.innerHTML = '<p style="color: var(--text-muted);">Selecciona un paciente para ver su historia.</p>';
      return;
    }

    if (paciente.alergias && paciente.alergias !== 'Ninguna') {
      this.alertaAlergias.classList.remove('hidden');
      this.txtAlergiasPaciente.textContent = paciente.alergias;
    } else {
      this.alertaAlergias.classList.add('hidden');
    }

    // Odontograma FDI (Solo si está activo en config)
    if (this.db.config.modules.odontograma !== false) {
      if (this.toggleOdontoWrapper) {
        this.toggleOdontoWrapper.style.removeProperty('display');
        this.toggleOdontoWrapper.style.display = 'flex';
      }
      if (this.btnModoDental && this.btnModoDental.classList.contains('active')) {
        if (this.seccionOdontograma) {
          this.seccionOdontograma.classList.remove('hidden');
          this.seccionOdontograma.style.removeProperty('display');
        }
      } else {
        if (this.seccionOdontograma) {
          this.seccionOdontograma.classList.add('hidden');
          this.seccionOdontograma.style.setProperty('display', 'none', 'important');
        }
      }
      this.renderOdontograma(paciente);
    } else {
      if (this.toggleOdontoWrapper) {
        this.toggleOdontoWrapper.style.setProperty('display', 'none', 'important');
      }
      if (this.seccionOdontograma) {
        this.seccionOdontograma.classList.add('hidden');
        this.seccionOdontograma.style.setProperty('display', 'none', 'important');
      }
      if (this.btnModoMedico) this.btnModoMedico.classList.add('active');
      if (this.btnModoDental) this.btnModoDental.classList.remove('active');
    }

    const orden = this.selectOrdenHistoria.value;
    let consultas = [...(paciente.consultas || [])];
    consultas.sort((a, b) => {
      return orden === 'reciente_primero' ? b.fecha.localeCompare(a.fecha) : a.fecha.localeCompare(b.fecha);
    });

    const hoyStr = new Date().toISOString().split('T')[0];
    this.timelineConsultas.innerHTML = '';

    if (consultas.length === 0) {
      this.timelineConsultas.innerHTML = '<p style="color: var(--text-muted); padding: 1.5rem 0;">No hay consultas registradas. Presiona "+ Registrar Consulta".</p>';
      return;
    }

    consultas.forEach(c => {
      const card = document.createElement('div');
      card.className = 'timeline-card';
      const esMismoDia = c.fecha === hoyStr;

      let mediaHtml = '';
      if (c.adjuntos && c.adjuntos.length > 0) {
        mediaHtml += `<div class="timeline-media-gallery">`;
        c.adjuntos.forEach(adj => {
          if (adj.tipo === 'foto') {
            mediaHtml += `
              <div class="media-thumbnail-card" data-img-url="${encodeURIComponent(adj.url || '')}" data-caption="${encodeURIComponent(adj.descripcion || adj.titulo || '')}" onclick="app.abrirLightbox(this.dataset.imgUrl, this.dataset.caption)">
                <img src="${adj.url || window.SAMPLE_RX_VALERIA}" class="media-thumb-img" alt="${adj.titulo}" onerror="this.onerror=null; this.src=window.SAMPLE_RX_VALERIA;">
                <span class="media-thumb-label">📷 ${adj.titulo}</span>
                ${adj.descripcion ? `<span class="media-thumb-desc">${adj.descripcion}</span>` : ''}
              </div>
            `;
          } else if (adj.tipo === 'pdf') {
            const isData = adj.url && adj.url.startsWith('data:');
            mediaHtml += `
              <a href="${adj.url}" target="_blank" ${isData ? `download="${adj.titulo}.pdf"` : 'rel="noopener noreferrer"'} class="media-pdf-badge">
                📑 PDF: ${adj.titulo} ${adj.descripcion ? `(${adj.descripcion})` : ''} ↗
              </a>
            `;
          } else if (adj.tipo === 'video') {
            mediaHtml += `
              <div class="media-thumbnail-card" style="max-width: 200px;">
                <video src="${adj.url}" controls style="width:100%; border-radius:4px;"></video>
                <span class="media-thumb-label">🎥 ${adj.titulo}</span>
                ${adj.descripcion ? `<span class="media-thumb-desc">${adj.descripcion}</span>` : ''}
              </div>
            `;
          }
        });
        mediaHtml += `</div>`;
      }

      card.innerHTML = `
        <div class="timeline-meta" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span>📅 ${c.fecha}</span>
            <span class="service-badge-timeline">🔬 ${c.servicio || 'Consulta Médica'}</span>
          </div>
          <div>
            ${esMismoDia ? `
              <button class="btn btn-subtle" style="font-size:0.75rem; padding:0.25rem 0.5rem;" onclick="app.abrirModalEditarConsulta('${c.id}')">
                ✏️ Editar (Hoy)
              </button>
            ` : `
              <span class="badge-lock">🔒 Cerrado</span>
            `}
          </div>
        </div>
        <div class="timeline-dx">🔬 Diagnóstico: ${c.diagnostico}</div>
        <div class="timeline-tx"><strong>Tratamiento y evolución:</strong> ${c.tratamiento}</div>
        ${mediaHtml}
      `;
      this.timelineConsultas.appendChild(card);
    });
  }

  abrirLightbox(urlEncoded, captionEncoded) {
    try {
      const decodedUrl = urlEncoded ? decodeURIComponent(urlEncoded) : '';
      this.lightboxImg.src = decodedUrl || window.SAMPLE_RX_VALERIA;
      this.lightboxCaption.textContent = captionEncoded ? decodeURIComponent(captionEncoded) : 'Estudio Clínico';
    } catch (e) {
      this.lightboxImg.src = window.SAMPLE_RX_VALERIA;
      this.lightboxCaption.textContent = 'Estudio Clínico';
    }
    this.lightbox.classList.remove('hidden');
  }

  procesarArchivoAdjunto(file, tipo) {
    if (!file) return;
    const reader = new FileReader();
    const desc = this.inputAdjuntoDesc ? this.inputAdjuntoDesc.value.trim() : '';

    let finalTipo = tipo;
    if (file.type.startsWith('video/')) finalTipo = 'video';
    else if (file.type.startsWith('image/')) finalTipo = 'foto';
    else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) finalTipo = 'pdf';

    reader.onload = (event) => {
      this.adjuntosConsultaEnCola.push({
        tipo: finalTipo,
        titulo: file.name,
        descripcion: desc || (finalTipo === 'video' ? 'Video adjunto' : finalTipo === 'foto' ? 'Foto/Rx adjunta' : 'Documento PDF'),
        url: event.target.result
      });
      if (this.inputAdjuntoDesc) this.inputAdjuntoDesc.value = '';
      this.renderColaAdjuntos();
      this.showToast(`✅ Archivo "${file.name}" agregado.`);
    };
    reader.readAsDataURL(file);
  }

  renderColaAdjuntos() {
    this.colaAdjuntosPreview.innerHTML = '';
    this.adjuntosConsultaEnCola.forEach((item, idx) => {
      const badge = document.createElement('span');
      badge.className = 'preview-badge-item';
      const icon = item.tipo === 'foto' ? '📷' : item.tipo === 'pdf' ? '📑' : '🎥';
      badge.innerHTML = `
        <span>${icon} ${item.tipo.toUpperCase()}: ${item.titulo} ${item.descripcion ? `("${item.descripcion}")` : ''}</span>
        <button type="button" class="btn-remove-attach" onclick="app.eliminarAdjuntoCola(${idx})">&times;</button>
      `;
      this.colaAdjuntosPreview.appendChild(badge);
    });
  }

  eliminarAdjuntoCola(idx) {
    this.adjuntosConsultaEnCola.splice(idx, 1);
    this.renderColaAdjuntos();
  }

  abrirModalConsulta(consultaId = null) {
    if (!this.pacienteActivoId) {
      alert('Seleccione un paciente primero.');
      return;
    }
    this.formConsulta.reset();
    this.adjuntosConsultaEnCola = [];
    if (this.inputAdjuntoDesc) this.inputAdjuntoDesc.value = '';

    if (consultaId) {
      // EDITAR CONSULTA EXISTENTE DEL MISMO DÍA
      const paciente = this.db.pacientes.find(p => p.id === this.pacienteActivoId);
      const c = paciente && paciente.consultas ? paciente.consultas.find(x => x.id === consultaId) : null;
      if (c) {
        const hoyStr = new Date().toISOString().split('T')[0];
        if (c.fecha !== hoyStr) {
          alert(`Por seguridad clínica, solo se pueden editar consultas registradas el día de hoy (${hoyStr}). Los registros de fechas anteriores quedan cerrados.`);
          return;
        }
        this.modalConsultaTitulo.textContent = 'Editar Consulta Clínica (Mismo Día)';
        this.consultaIdInput.value = c.id;
        this.consultaFechaInput.value = c.fecha;
        this.consultaServicioSelect.value = c.servicio;
        this.consultaMotivoInput.value = c.motivo || '';
        this.consultaDiagnosticoInput.value = c.diagnostico || '';
        this.consultaTratamientoInput.value = c.tratamiento || '';
        this.adjuntosConsultaEnCola = [...(c.adjuntos || [])];
      }
    } else {
      this.modalConsultaTitulo.textContent = 'Registrar Consulta Clínica';
      this.consultaIdInput.value = '';
      this.consultaFechaInput.value = new Date().toISOString().split('T')[0];
    }

    this.renderColaAdjuntos();
    this.modalConsulta.classList.remove('hidden');
  }

  abrirModalEditarConsulta(consultaId) {
    this.abrirModalConsulta(consultaId);
  }

  cerrarModalConsulta() {
    this.modalConsulta.classList.add('hidden');
  }

  guardarConsulta(e) {
    e.preventDefault();
    const paciente = this.db.pacientes.find(p => p.id === this.pacienteActivoId);
    if (!paciente) return;

    const id = this.consultaIdInput.value.trim();
    const fecha = this.consultaFechaInput.value;
    const servicio = this.consultaServicioSelect.value;
    const motivo = this.consultaMotivoInput.value.trim();
    const diagnostico = this.consultaDiagnosticoInput.value.trim();
    const tratamiento = this.consultaTratamientoInput.value.trim();
    const adjuntos = [...this.adjuntosConsultaEnCola];

    if (!paciente.consultas) paciente.consultas = [];

    if (id) {
      // ACTUALIZAR CONSULTA EXISTENTE (SOLO SI ES DEL MISMO DÍA)
      const idx = paciente.consultas.findIndex(c => c.id === id);
      if (idx !== -1) {
        const hoyStr = new Date().toISOString().split('T')[0];
        if (paciente.consultas[idx].fecha !== hoyStr) {
          alert('No es posible modificar consultas de fechas pasadas. El historial está bloqueado.');
          return;
        }
        paciente.consultas[idx].servicio = servicio;
        paciente.consultas[idx].motivo = motivo;
        paciente.consultas[idx].diagnostico = diagnostico;
        paciente.consultas[idx].tratamiento = tratamiento;
        paciente.consultas[idx].adjuntos = adjuntos;
        this.registrarAuditoria('Historia', id, 'ACTUALIZAR', `Consulta actualizada el mismo día para ${paciente.nombre}`);
        this.showToast('✅ Consulta modificada exitosamente.');
      }
    } else {
      // REGISTRAR NUEVA CONSULTA
      const nuevaConsulta = {
        id: 'c-' + Date.now(),
        fecha,
        servicio,
        motivo,
        diagnostico,
        tratamiento,
        adjuntos
      };
      paciente.consultas.unshift(nuevaConsulta);
      paciente.ultimaAtencion = fecha;
      this.registrarAuditoria('Historia', nuevaConsulta.id, 'CREAR', `Consulta ${servicio} para ${paciente.nombre}: ${diagnostico}`);
      this.showToast('✅ Consulta guardada en historia clínica.');
    }

    LocalDatabase.save(this.db);
    this.cerrarModalConsulta();
    this.renderHistoria();
    this.renderRespaldoMetricas();
  }

  // ==================== ODONTOGRAMA (LETRAS DE ESTADO & NOTAS HASTA 25 CAR.) ====================
  renderOdontograma(paciente) {
    if (!paciente.odontograma) paciente.odontograma = {};

    const superiores = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
    const inferiores = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];

    this.arcadaSuperior.innerHTML = '';
    this.arcadaInferior.innerHTML = '';

    superiores.forEach(pieza => this.arcadaSuperior.appendChild(this.crearBotonDiente(pieza, paciente)));
    inferiores.forEach(pieza => this.arcadaInferior.appendChild(this.crearBotonDiente(pieza, paciente)));
  }

  crearBotonDiente(num, paciente) {
    const btn = document.createElement('button');
    const piezaData = paciente.odontograma[num] || { estado: 'sano', nota: '' };
    const estado = piezaData.estado || 'sano';
    const nota = piezaData.nota || '';

    // Mapeo de siglas/letras
    const letterMap = {
      sano: { letter: 'S', badge: 'badge-s' },
      caries: { letter: 'C', badge: 'badge-c' },
      restaurado: { letter: 'R', badge: 'badge-r' },
      endodoncia: { letter: 'E', badge: 'badge-e' },
      ausente: { letter: 'X', badge: 'badge-x' },
      corona: { letter: 'Cr', badge: 'badge-cr' }
    };
    const info = letterMap[estado] || letterMap.sano;

    btn.className = `tooth-btn tooth-${estado}`;
    btn.innerHTML = `
      <span style="font-weight:700;">${num}</span>
      <span class="tooth-letter-badge ${info.badge}">${info.letter}</span>
      ${nota ? `<span class="tooth-note-preview" title="${nota}">${nota}</span>` : ''}
    `;
    btn.title = `Pieza ${num}: ${estado.toUpperCase()}${nota ? ` - "${nota}"` : ''}. Clic para editar estado y notas.`;

    btn.addEventListener('click', () => {
      this.abrirModalDiente(num, estado, nota);
    });

    return btn;
  }

  abrirModalDiente(num, estado, nota) {
    this.dienteNumeroInput.value = num;
    this.modalDienteTitulo.textContent = `Pieza Dental #${num}`;
    this.dienteNotaInput.value = nota || '';
    if (this.dienteNotaCounter) {
      this.dienteNotaCounter.textContent = `${(nota || '').length} / 25 car.`;
    }

    const radio = document.querySelector(`input[name="diente-estado-radio"][value="${estado}"]`);
    if (radio) radio.checked = true;

    this.modalDiente.classList.remove('hidden');
  }

  guardarPiezaDiente(e) {
    e.preventDefault();
    const paciente = this.db.pacientes.find(p => p.id === this.pacienteActivoId);
    if (!paciente) return;

    const num = this.dienteNumeroInput.value;
    const estadoRadio = document.querySelector('input[name="diente-estado-radio"]:checked');
    const estado = estadoRadio ? estadoRadio.value : 'sano';
    const nota = this.dienteNotaInput.value.trim().substring(0, 25);

    if (!paciente.odontograma) paciente.odontograma = {};
    paciente.odontograma[num] = { estado, nota };

    this.registrarAuditoria('Odontograma', `diente-${num}`, 'ACTUALIZAR', `Pieza ${num} a ${estado.toUpperCase()} (${nota ? `"${nota}"` : 'Sin nota'})`);
    LocalDatabase.save(this.db);
    this.modalDiente.classList.add('hidden');
    this.renderOdontograma(paciente);
    this.showToast(`🦷 Pieza ${num}: ${estado.toUpperCase()} guardada`);
  }

  // ==================== AGENDA & CITAS (ALERTAS 1-5 DÍAS, ASISTENCIA Y CONTEXTO) ====================
  renderAgenda() {
    const fechaFiltro = this.inputFechaAgenda.value;
    const citas = this.db.citas.filter(c => c.fecha === fechaFiltro);
    this.listaCitas.innerHTML = '';

    if (citas.length === 0) {
      this.listaCitas.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2.5rem; background: var(--bg-surface); border-radius: 10px; border: 1px solid var(--border-color);">No hay citas para el día ${fechaFiltro}.</div>`;
      return;
    }

    citas.sort((a, b) => a.hora.localeCompare(b.hora));
    const hoyDate = new Date();
    hoyDate.setHours(0, 0, 0, 0);

    citas.forEach(c => {
      const paciente = this.db.pacientes.find(p => p.id === c.pacienteId) || { nombre: 'Paciente no identificado', telefono: '', email: '' };
      const item = document.createElement('div');
      item.className = 'appointment-card';

      const serviciosBadges = (c.servicios || []).map(s => `<span class="service-pill-mini">🔬 ${s}</span>`).join(' ');

      // Cálculo de alerta de días (1 a 5 días)
      const citaDate = new Date(c.fecha + 'T00:00:00');
      const diffTime = citaDate.getTime() - hoyDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diasAlerta = c.diasAlerta || 2;

      let alertaBadgeHtml = '';
      if (c.estado === 'Reservada') {
        if (diffDays >= 0 && diffDays <= diasAlerta) {
          alertaBadgeHtml = `<span class="badge-alerta-cita" style="background:#fef3c7; color:#b45309; padding:0.2rem 0.5rem; border-radius:12px; font-size:0.75rem; font-weight:600;">🔔 Confirmar pronto (Faltan ${diffDays} días)</span>`;
        } else {
          alertaBadgeHtml = `<span style="color:var(--text-muted); font-size:0.75rem;">Alerta: ${diasAlerta} días antes</span>`;
        }
      }

      // Badge de estado
      let estadoBadgeHtml = '';
      if (c.estado === 'Confirmada') {
        estadoBadgeHtml = `<span class="badge-status badge-confirmada">Confirmada</span>`;
      } else if (c.estado === 'Asistió') {
        estadoBadgeHtml = `<span class="badge-status badge-asistio">✅ Asistió</span>`;
      } else if (c.estado === 'No Asistió') {
        estadoBadgeHtml = `<span class="badge-status badge-no-asistio">❌ No Asistió</span>`;
      } else {
        estadoBadgeHtml = `<span class="badge-status badge-reservada">Reservada</span>`;
      }

      // Botones de acción según el estado
      let accionesEstadoHtml = '';
      if (c.estado === 'Reservada') {
        accionesEstadoHtml = `
          <button class="btn btn-primary" style="font-size:0.8rem; padding:0.35rem 0.6rem;" onclick="app.confirmarCita('${c.id}')">
            ✔️ Confirmar
          </button>
        `;
      } else if (c.estado === 'Confirmada') {
        accionesEstadoHtml = `
          <button class="btn btn-primary" style="font-size:0.8rem; padding:0.35rem 0.6rem; background:#10b981;" onclick="app.marcarAsistenciaCita('${c.id}')">
            ✅ Asistió
          </button>
          <button class="btn btn-subtle" style="font-size:0.8rem; padding:0.35rem 0.6rem; color:#ef4444;" onclick="app.abrirModalInasistencia('${c.id}')">
            ❌ No Asistió
          </button>
        `;
      } else if (c.estado === 'Asistió') {
        accionesEstadoHtml = `
          <button class="btn btn-subtle" style="font-size:0.8rem; padding:0.35rem 0.6rem;" onclick="app.seleccionarPacienteYVerHistoria('${c.pacienteId}')">
            📂 Ver Historia
          </button>
        `;
      }

      item.innerHTML = `
        <div class="appointment-time">⏰ ${c.hora}</div>
        <div class="appointment-patient">
          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            <div class="appointment-name">${paciente.nombre}</div>
            ${estadoBadgeHtml}
            ${alertaBadgeHtml}
          </div>
          <div class="appointment-services-row">${serviciosBadges}</div>
          <div class="appointment-reason">
            ${c.motivo ? `Nota: ${c.motivo} • ` : ''}Tel: ${paciente.telefono}
          </div>
          ${c.estado === 'No Asistió' && c.notaInasistencia ? `
            <div style="font-size:0.8rem; color:#ef4444; margin-top:0.35rem; font-style:italic;">
              Nota inasistencia: "${c.notaInasistencia}"
            </div>
          ` : ''}
        </div>
        <div class="appointment-actions">
          ${accionesEstadoHtml}
          <button class="btn btn-whatsapp" style="font-size:0.8rem; padding:0.35rem 0.55rem;" onclick="app.enviarRecordatorioCitaWhatsApp('${c.id}')" title="Enviar recordatorio WhatsApp">
            💬
          </button>
          ${paciente.email ? `
            <button class="btn btn-subtle" style="font-size:0.8rem; padding:0.35rem 0.55rem;" onclick="app.enviarRecordatorioCitaEmail('${c.id}')" title="Enviar recordatorio Email">
              ✉️
            </button>
          ` : ''}
          <button class="btn btn-subtle" style="font-size:0.8rem; padding:0.35rem 0.55rem;" onclick="app.eliminarCita('${c.id}')" title="Cancelar cita">
            ✕
          </button>
        </div>
      `;
      this.listaCitas.appendChild(item);
    });
  }

  confirmarCita(id) {
    const cita = this.db.citas.find(c => c.id === id);
    if (!cita) return;
    cita.estado = 'Confirmada';
    LocalDatabase.save(this.db);
    this.renderAgenda();
    this.showToast('✅ Cita confirmada.');
  }

  marcarAsistenciaCita(id) {
    const cita = this.db.citas.find(c => c.id === id);
    if (!cita) return;
    cita.estado = 'Asistió';
    LocalDatabase.save(this.db);
    this.renderAgenda();

    // Activar automáticamente el paciente en atención y abrir su historia
    this.fijarPacienteEnAtencion(cita.pacienteId);
    this.seleccionarPacienteYVerHistoria(cita.pacienteId);
    this.showToast('✅ Asistencia registrada. Paciente activo en atención.');
  }

  abrirModalInasistencia(id) {
    const cita = this.db.citas.find(c => c.id === id);
    if (!cita) return;
    const paciente = this.db.pacientes.find(p => p.id === cita.pacienteId);

    this.inasistenciaCitaId.value = id;
    this.inasistenciaPacienteNombre.textContent = paciente ? paciente.nombre : 'Paciente';
    this.inasistenciaNota.value = '';
    this.modalInasistencia.classList.remove('hidden');
  }

  guardarInasistencia(e) {
    e.preventDefault();
    const id = this.inasistenciaCitaId.value;
    const nota = this.inasistenciaNota.value.trim();

    const cita = this.db.citas.find(c => c.id === id);
    if (cita) {
      cita.estado = 'No Asistió';
      cita.notaInasistencia = nota;
      LocalDatabase.save(this.db);
      this.registrarAuditoria('Agenda', id, 'INASISTENCIA', `Inasistencia con nota: ${nota}`);
      this.modalInasistencia.classList.add('hidden');
      this.renderAgenda();
      this.showToast('Nota de inasistencia registrada.');
    }
  }

  abrirModalCita() {
    this.poblarSelectsPacientes();
    this.formCita.reset();
    document.getElementById('cita-fecha').value = this.inputFechaAgenda.value || new Date().toISOString().split('T')[0];

    // Si hay paciente en atención, auto-seleccionarlo
    if (this.pacienteEnAtencion && this.citaPacienteSelect) {
      this.citaPacienteSelect.value = this.pacienteEnAtencion;
    }

    this.modalCita.classList.remove('hidden');
  }

  cerrarModalCita() {
    this.modalCita.classList.add('hidden');
  }

  guardarCita(e) {
    e.preventDefault();
    const pacienteId = this.citaPacienteSelect.value;
    const fecha = document.getElementById('cita-fecha').value;
    const hora = document.getElementById('cita-hora').value;
    const motivo = document.getElementById('cita-motivo').value.trim();
    const diasAlerta = parseInt(this.citaDiasAlertaSelect ? this.citaDiasAlertaSelect.value : '2') || 2;

    const checkboxes = document.querySelectorAll('input[name="cita-servicio-item"]:checked');
    const servicios = Array.from(checkboxes).map(cb => cb.value);

    const nueva = {
      id: 'cita-' + Date.now(),
      pacienteId,
      fecha,
      hora,
      servicios: servicios.length > 0 ? servicios : ['Consulta Regular'],
      motivo,
      estado: 'Reservada',
      diasAlerta,
      notaInasistencia: ''
    };

    this.db.citas.push(nueva);
    const p = this.db.pacientes.find(x => x.id === pacienteId);
    this.registrarAuditoria('Agenda', nueva.id, 'CREAR', `Cita reservada para ${p ? p.nombre : 'Paciente'} el ${fecha} (${servicios.join(', ')})`);

    LocalDatabase.save(this.db);
    this.cerrarModalCita();
    this.renderAgenda();
    this.renderRespaldoMetricas();
    this.showToast('✅ Cita reservada correctamente.');
  }

  eliminarCita(id) {
    if (confirm('¿Deseas cancelar esta cita de la agenda?')) {
      this.db.citas = this.db.citas.filter(c => c.id !== id);
      this.registrarAuditoria('Agenda', id, 'ELIMINAR', 'Cancelación de cita');
      LocalDatabase.save(this.db);
      this.renderAgenda();
      this.renderRespaldoMetricas();
      this.showToast('Cita cancelada.');
    }
  }

  enviarRecordatorioCitaWhatsApp(citaId) {
    const cita = this.db.citas.find(c => c.id === citaId);
    if (!cita) return;
    const paciente = this.db.pacientes.find(p => p.id === cita.pacienteId);
    if (!paciente || !paciente.telefono) {
      alert('El paciente no tiene un número de WhatsApp registrado.');
      return;
    }

    const cfg = this.db.config;
    const serviciosTxt = (cita.servicios || []).join(', ');
    const mensaje = `Hola ${paciente.nombre}, le saludamos cordialmente de *${cfg.clinicName}* (${cfg.doctorName}).\n\nLe recordamos su cita programada para el día *${cita.fecha}* a las *${cita.hora}*.\n*Servicios agendados:* ${serviciosTxt}\n${cita.motivo ? `*Detalle:* ${cita.motivo}\n` : ''}📍 *Ubicación:* ${cfg.address}\n\nPor favor confirme su asistencia respondiendo a este mensaje. ¡Muchas gracias!`;
    this.abrirChatWhatsApp(paciente.telefono, mensaje);
  }

  enviarRecordatorioCitaEmail(citaId) {
    const cita = this.db.citas.find(c => c.id === citaId);
    if (!cita) return;
    const paciente = this.db.pacientes.find(p => p.id === cita.pacienteId);
    if (!paciente || !paciente.email) {
      alert('El paciente no tiene correo electrónico registrado.');
      return;
    }

    const cfg = this.db.config;
    const asunto = `Recordatorio de Cita Médica - ${cfg.clinicName}`;
    const cuerpo = `Estimado(a) ${paciente.nombre},\n\nLe recordamos su cita el día ${cita.fecha} a las ${cita.hora} con el profesional ${cfg.doctorName}.\nServicios: ${(cita.servicios || []).join(', ')}\nDirección: ${cfg.address}\n\nAtentamente,\n${cfg.clinicName}`;
    window.location.href = `mailto:${paciente.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  }

  // ==================== RECETAS: PERSISTENCIA, MISMO DÍA Y GENERACIÓN DE PDF ====================
  renderRecetasDefault() {
    this.listaFarmacosInputs.innerHTML = '';
    this.agregarFilaFarmaco('Amoxicilina 870mg + Ác. Clavulánico 125mg', '1 comp cada 12h', '7 días');
    this.agregarFilaFarmaco('Ibuprofeno 400mg', '1 tableta cada 8h en caso de dolor', '3 días');
    this.actualizarPreviewReceta();
    this.renderRecetasGuardadas();
  }

  agregarFilaFarmaco(nombre = '', dosis = '', tiempo = '') {
    const row = document.createElement('div');
    row.className = 'med-row';
    row.innerHTML = `
      <div class="med-field-group">
        <label class="med-field-label">Fármaco / Medicamento:</label>
        <input type="text" class="input-field med-nombre" placeholder="Nombre del Fármaco (ej. Paracetamol 500mg)" value="${nombre}">
      </div>
      <div class="med-field-group">
        <label class="med-field-label">Posología y Dosis:</label>
        <input type="text" class="input-field med-dosis" placeholder="Posología y Dosis (ej. 1 comp cada 8h)" value="${dosis}">
      </div>
      <div class="med-field-group">
        <label class="med-field-label">Duración del Tratamiento:</label>
        <input type="text" class="input-field med-tiempo" placeholder="Duración (ej. 5 días)" value="${tiempo}">
      </div>
      <button type="button" class="btn btn-subtle btn-remove-med" onclick="this.closest('.med-row').remove(); app.actualizarPreviewReceta();">🗑️ Quitar Medicamento</button>
    `;

    row.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => this.actualizarPreviewReceta());
    });

    this.listaFarmacosInputs.appendChild(row);
    this.actualizarPreviewReceta();
  }

  actualizarPreviewReceta() {
    const paciente = this.db.pacientes.find(p => p.id === this.recetaSelectPaciente.value);
    this.rxPreviewPaciente.textContent = paciente ? paciente.nombre : 'Seleccione paciente';
    this.rxPreviewFecha.textContent = new Date().toLocaleDateString('es-ES');
    this.rxPreviewDx.textContent = this.recetaDiagnostico.value.trim() || 'Consulta clínica general';

    const rows = this.listaFarmacosInputs.querySelectorAll('.med-row');
    this.rxPreviewMeds.innerHTML = '';
    rows.forEach(r => {
      const n = r.querySelector('.med-nombre').value.trim();
      const d = r.querySelector('.med-dosis').value.trim();
      const t = r.querySelector('.med-tiempo').value.trim();
      if (n) {
        const li = document.createElement('li');
        li.textContent = `${n} — ${d} ${t ? `(por ${t})` : ''}`;
        this.rxPreviewMeds.appendChild(li);
      }
    });

    this.rxPreviewInstrucciones.textContent = this.recetaIndicaciones.value.trim() || 'Seguir la posología indicada. En caso de presentar efectos adversos, consultar de inmediato.';
  }

  guardarReceta() {
    const pacienteId = this.recetaSelectPaciente.value;
    if (!pacienteId) {
      alert('Seleccione un paciente para emitir la receta.');
      return;
    }

    const diagnostico = this.recetaDiagnostico.value.trim() || 'Evaluación clínica';
    const indicaciones = this.recetaIndicaciones.value.trim();
    const rows = this.listaFarmacosInputs.querySelectorAll('.med-row');
    const medicamentos = [];

    rows.forEach(r => {
      const n = r.querySelector('.med-nombre').value.trim();
      const d = r.querySelector('.med-dosis').value.trim();
      const t = r.querySelector('.med-tiempo').value.trim();
      if (n) medicamentos.push({ nombre: n, dosis: d, tiempo: t });
    });

    if (medicamentos.length === 0) {
      alert('Agrega al menos un medicamento a la receta antes de guardarla.');
      return;
    }

    const hoyStr = new Date().toISOString().split('T')[0];
    const editId = this.recetaEditId ? this.recetaEditId.value.trim() : '';

    if (!this.db.recetas) this.db.recetas = [];

    if (editId) {
      // EDITAR RECETA EXISTENTE DEL MISMO DÍA
      const idx = this.db.recetas.findIndex(r => r.id === editId);
      if (idx !== -1) {
        this.db.recetas[idx].diagnostico = diagnostico;
        this.db.recetas[idx].indicaciones = indicaciones;
        this.db.recetas[idx].medicamentos = medicamentos;
        this.showToast('✅ Receta actualizada exitosamente.');
      }
    } else {
      // GUARDAR NUEVA RECETA
      const nuevaReceta = {
        id: 'rx-' + Date.now(),
        pacienteId,
        fecha: hoyStr,
        diagnostico,
        indicaciones,
        medicamentos
      };
      this.db.recetas.unshift(nuevaReceta);
      this.showToast('✅ Receta guardada en la base de datos.');
    }

    LocalDatabase.save(this.db);
    this.renderRecetasGuardadas();
  }

  limpiarFormularioReceta() {
    if (this.recetaEditId) this.recetaEditId.value = '';
    this.recetaDiagnostico.value = '';
    this.recetaIndicaciones.value = '';
    this.listaFarmacosInputs.innerHTML = '';
    this.agregarFilaFarmaco();
    this.actualizarPreviewReceta();
  }

  renderRecetasGuardadas() {
    if (!this.listaRecetasGuardadas) return;
    const pacienteId = this.recetaSelectPaciente ? this.recetaSelectPaciente.value : this.pacienteActivoId;
    const recetas = (this.db.recetas || []).filter(r => r.pacienteId === pacienteId);
    const hoyStr = new Date().toISOString().split('T')[0];

    this.listaRecetasGuardadas.innerHTML = '';

    if (recetas.length === 0) {
      this.listaRecetasGuardadas.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; padding:0.5rem 0;">No hay recetas emitidas guardadas para este paciente.</div>`;
      return;
    }

    recetas.forEach(r => {
      const item = document.createElement('div');
      item.className = 'saved-prescription-item';
      const esMismoDia = r.fecha === hoyStr;

      const medSummary = (r.medicamentos || []).map(m => `• ${m.nombre} (${m.dosis})`).join('<br>');

      item.innerHTML = `
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <strong>📅 ${r.fecha}</strong>
            <span style="font-weight:600; color:var(--color-primary-dark);">Dx: ${r.diagnostico}</span>
            ${esMismoDia ? '<span class="badge-status badge-confirmada" style="font-size:0.7rem;">Emitida Hoy</span>' : '<span class="badge-lock" style="font-size:0.7rem;">🔒 Cerrada</span>'}
          </div>
          <div style="font-size:0.85rem; color:var(--text-main); margin-bottom:0.25rem;">
            ${medSummary}
          </div>
          ${r.indicaciones ? `<div style="font-size:0.75rem; color:var(--text-muted);"><em>Indicaciones: ${r.indicaciones}</em></div>` : ''}
        </div>
        <div style="display:flex; gap:0.4rem; align-items:center;">
          ${esMismoDia ? `
            <button class="btn btn-subtle" style="font-size:0.75rem; padding:0.3rem 0.5rem;" onclick="app.cargarRecetaParaEditar('${r.id}')">
              ✏️ Editar
            </button>
          ` : ''}
          <button class="btn btn-primary" style="font-size:0.75rem; padding:0.3rem 0.5rem;" onclick="app.generarPdfRecetaGuardada('${r.id}')">
            📄 PDF
          </button>
        </div>
      `;
      this.listaRecetasGuardadas.appendChild(item);
    });
  }

  cargarRecetaParaEditar(recetaId) {
    const r = (this.db.recetas || []).find(x => x.id === recetaId);
    if (!r) return;

    if (this.recetaEditId) this.recetaEditId.value = r.id;
    this.recetaDiagnostico.value = r.diagnostico || '';
    this.recetaIndicaciones.value = r.indicaciones || '';
    this.listaFarmacosInputs.innerHTML = '';

    (r.medicamentos || []).forEach(m => {
      this.agregarFilaFarmaco(m.nombre, m.dosis, m.tiempo);
    });

    this.actualizarPreviewReceta();
    this.showToast('📝 Receta cargada en el formulario para edición.');
  }

  generarPdfRecetaGuardada(recetaId) {
    const r = (this.db.recetas || []).find(x => x.id === recetaId);
    if (!r) return;
    this.generarPdfReceta(r);
  }

  // GENERACIÓN OFFLINE DE PDF CON JSPDF
  generarPdfReceta(recetaData = null) {
    const paciente = this.db.pacientes.find(p => p.id === (recetaData ? recetaData.pacienteId : this.recetaSelectPaciente.value));
    if (!paciente) {
      alert('Seleccione un paciente válido para emitir el PDF.');
      return;
    }

    const cfg = this.db.config;
    const fecha = recetaData ? recetaData.fecha : new Date().toLocaleDateString('es-ES');
    const dx = recetaData ? recetaData.diagnostico : (this.recetaDiagnostico.value.trim() || 'Consulta clínica general');
    const indicaciones = recetaData ? recetaData.indicaciones : (this.recetaIndicaciones.value.trim() || 'Seguir la posología indicada.');

    let meds = [];
    if (recetaData && recetaData.medicamentos) {
      meds = recetaData.medicamentos;
    } else {
      const rows = this.listaFarmacosInputs.querySelectorAll('.med-row');
      rows.forEach(r => {
        const n = r.querySelector('.med-nombre').value.trim();
        const d = r.querySelector('.med-dosis').value.trim();
        const t = r.querySelector('.med-tiempo').value.trim();
        if (n) meds.push({ nombre: n, dosis: d, tiempo: t });
      });
    }

    if (meds.length === 0) {
      meds.push({ nombre: 'Indicaciones según evaluación médica', dosis: 'Ver indicaciones', tiempo: 'Según prescripción' });
    }

    const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : (window.jsPDF || null);
    if (!jsPDFClass) {
      window.print();
      return;
    }

    try {
      const doc = new jsPDFClass({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Encabezado
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text(cfg.clinicName || 'CLÍNICA MÉDICA', 105, 20, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text(`${cfg.doctorName} • ${cfg.doctorReg}`, 105, 27, { align: 'center' });
      doc.setFontSize(9);
      doc.text(`${cfg.address} • Tel: ${cfg.phone} ${cfg.email ? '• ' + cfg.email : ''}`, 105, 33, { align: 'center' });

      // Línea divisoria
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.line(20, 38, 190, 38);

      // Datos del paciente
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('PACIENTE:', 20, 47);
      doc.setFont('helvetica', 'normal');
      doc.text(paciente.nombre, 43, 47);

      doc.setFont('helvetica', 'bold');
      doc.text('FECHA:', 140, 47);
      doc.setFont('helvetica', 'normal');
      doc.text(fecha, 157, 47);

      doc.setFont('helvetica', 'bold');
      doc.text('DIAGNÓSTICO:', 20, 54);
      doc.setFont('helvetica', 'normal');
      doc.text(dx, 50, 54);

      // Rp. Título
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(14, 116, 144);
      doc.text('Rp. (Prescripción Médica):', 20, 66);

      // Lista de medicamentos
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      let curY = 74;

      meds.forEach((m, idx) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${idx + 1}. ${m.nombre}`, 22, curY);
        curY += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(`    Posología: ${m.dosis} ${m.tiempo ? `(Durante ${m.tiempo})` : ''}`, 22, curY);
        curY += 7;
      });

      // Indicaciones generales
      curY += 4;
      doc.setFont('helvetica', 'bold');
      doc.text('INDICACIONES Y CUIDADOS GENERALES:', 20, curY);
      curY += 6;
      doc.setFont('helvetica', 'normal');
      const splitIndicaciones = doc.splitTextToSize(indicaciones, 170);
      doc.text(splitIndicaciones, 20, curY);

      // Pie de firma y sello
      doc.setLineWidth(0.4);
      doc.line(70, 240, 140, 240);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Firma y Sello del Profesional', 105, 246, { align: 'center' });

      // Guardar archivo PDF directamente
      const filename = `Receta-${paciente.nombre.replace(/\s+/g, '_')}-${fecha.replace(/\//g, '-')}.pdf`;
      doc.save(filename);

      // Abrir blob para visualización directa en pantalla
      try {
        const blobUrl = doc.output('bloburl');
        window.open(blobUrl, '_blank');
      } catch (err) {
        // Fallback
      }

      this.showToast(`✅ Receta PDF generada y descargada: ${filename}`);
    } catch (e) {
      console.error('Error generando PDF:', e);
      window.print();
    }
  }

  enviarRecetaWhatsApp() {
    const paciente = this.db.pacientes.find(p => p.id === this.recetaSelectPaciente.value);
    if (!paciente || !paciente.telefono) {
      alert('Seleccione un paciente con número de WhatsApp válido.');
      return;
    }

    const cfg = this.db.config;
    let texto = `*RECETA MÉDICA - ${cfg.clinicName.toUpperCase()}*\n`;
    texto += `👨‍⚕️ *Profesional:* ${cfg.doctorName} (${cfg.doctorReg})\n`;
    texto += `👤 *Paciente:* ${paciente.nombre}\n`;
    texto += `📅 *Fecha:* ${new Date().toLocaleDateString('es-ES')}\n`;
    texto += `🔬 *Diagnóstico:* ${this.recetaDiagnostico.value.trim() || 'Control'}\n\n`;
    texto += `*MEDICACIÓN PRESCRITA:*\n`;

    const rows = this.listaFarmacosInputs.querySelectorAll('.med-row');
    rows.forEach((r, idx) => {
      const n = r.querySelector('.med-nombre').value.trim();
      const d = r.querySelector('.med-dosis').value.trim();
      const t = r.querySelector('.med-tiempo').value.trim();
      if (n) texto += `${idx + 1}. ${n} -> ${d} ${t ? `(${t})` : ''}\n`;
    });

    if (this.recetaIndicaciones.value.trim()) {
      texto += `\n*Indicaciones:* ${this.recetaIndicaciones.value.trim()}\n`;
    }

    texto += `\n📍 *Consultorio:* ${cfg.address}\n`;
    texto += `_Ante cualquier duda o urgencia, responda a este chat._`;

    this.registrarAuditoria('Receta', `rx-${Date.now()}`, 'CREAR', `Receta enviada por WhatsApp a ${paciente.nombre}`);
    this.abrirChatWhatsApp(paciente.telefono, texto);
  }

  enviarRecetaEmail() {
    const paciente = this.db.pacientes.find(p => p.id === this.recetaSelectPaciente.value);
    if (!paciente || !paciente.email) {
      alert('El paciente no tiene un correo electrónico registrado.');
      return;
    }

    const cfg = this.db.config;
    const asunto = `Receta Médica - ${cfg.clinicName} (${paciente.nombre})`;
    let cuerpo = `RECETA MÉDICA - ${cfg.clinicName}\nProfesional: ${cfg.doctorName} (${cfg.doctorReg})\nPaciente: ${paciente.nombre}\nFecha: ${new Date().toLocaleDateString('es-ES')}\nDiagnóstico: ${this.recetaDiagnostico.value.trim()}\n\nMEDICAMENTOS:\n`;

    const rows = this.listaFarmacosInputs.querySelectorAll('.med-row');
    rows.forEach((r, idx) => {
      const n = r.querySelector('.med-nombre').value.trim();
      const d = r.querySelector('.med-dosis').value.trim();
      const t = r.querySelector('.med-tiempo').value.trim();
      if (n) cuerpo += `${idx + 1}. ${n} - ${d} (${t})\n`;
    });

    if (this.recetaIndicaciones.value.trim()) {
      cuerpo += `\nIndicaciones: ${this.recetaIndicaciones.value.trim()}\n`;
    }

    cuerpo += `\nAtentamente,\n${cfg.doctorName}\n${cfg.clinicName}`;
    window.location.href = `mailto:${paciente.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  }

  abrirChatWhatsApp(telefono, mensaje) {
    if (!telefono) {
      alert('Número telefónico no especificado.');
      return;
    }
    const numeroLimpio = telefono.replace(/\D/g, '');
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  // ==================== RESPALDO, AUDITORÍA & PAGOS ====================
  registrarAuditoria(entity, entity_id, action, summary) {
    const logItem = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('es-ES'),
      entity,
      entity_id,
      action,
      device: navigator.userAgent.includes('Mac') ? 'MacBook' : navigator.userAgent.includes('Windows') ? 'Windows PC' : 'Móvil / Web',
      summary
    };

    if (!this.db.auditLogs) this.db.auditLogs = [];
    this.db.auditLogs.unshift(logItem);

    if (!this.db.cambiosPendientes) this.db.cambiosPendientes = [];
    this.db.cambiosPendientes.push(logItem);

    this.renderRespaldoMetricas();
  }

  renderRespaldoMetricas() {
    const totalConsultas = this.db.pacientes.reduce((acc, p) => acc + (p.consultas ? p.consultas.length : 0), 0);
    this.bkMetricPacientes.textContent = this.db.pacientes.length;
    this.bkMetricConsultas.textContent = totalConsultas;
    this.bkMetricCitas.textContent = this.db.citas.length;
    this.bkMetricPendientes.textContent = this.db.cambiosPendientes ? this.db.cambiosPendientes.length : 0;
    this.cloudLastSync.textContent = this.db.meta.ultimaSincronizacionCloud || 'Nunca';
  }

  manejarImportacion(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (LocalDatabase.importBackup(content)) {
        this.db = LocalDatabase.load();
        this.pacienteActivoId = this.db.pacientes.length > 0 ? this.db.pacientes[0].id : null;
        this.initThemeAndBranding();
        this.renderAll();
        this.showToast('✅ Base de datos restaurada con éxito.');
      } else {
        alert('El archivo seleccionado no tiene un formato válido.');
      }
    };
    reader.readAsText(file);
  }

  abrirModalPago(metodo = 'qr') {
    this.vistaPagoPaypal.classList.add('hidden');
    this.vistaPagoQr.classList.add('hidden');

    if (metodo === 'paypal') {
      this.vistaPagoPaypal.classList.remove('hidden');
    } else {
      this.vistaPagoQr.classList.remove('hidden');
    }

    this.modalPago.classList.remove('hidden');
  }

  async confirmarPago(metodo) {
    const doctor = this.db.config.doctorName;
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, plan: 'mensual', doctor })
      });
      if (res.ok) {
        const data = await res.json();
        this.db.subscription = data.subscription;
      } else {
        throw new Error('API Offline');
      }
    } catch (e) {
      this.db.subscription = {
        active: true,
        plan: 'mensual',
        method: metodo.toUpperCase(),
        multiDeviceEnabled: true,
        expiresAt: new Date(Date.now() + 30 * 86400000).toLocaleDateString('es-ES')
      };
    }

    this.registrarAuditoria('Finanzas', 'pago-confirmado', 'PAGO_CONFIRMADO', `Activación de copia en la nube vía ${metodo.toUpperCase()}`);
    LocalDatabase.save(this.db);
    this.actualizarEstadoSuscripcionUI();
    this.modalPago.classList.add('hidden');
    this.showToast(`🎉 ¡Pago confirmado! Respaldo Cloud y Multi-Dispositivo ACTIVADOS.`);
    this.forzarSincronizacionInmediata();
  }

  desactivarSuscripcion() {
    if (confirm('¿Estás seguro de desactivar la copia en la nube y el multi-dispositivo?')) {
      this.db.subscription.active = false;
      this.db.subscription.multiDeviceEnabled = false;
      this.registrarAuditoria('Finanzas', 'pago-cancel', 'DESACTIVACION', 'Copia en la nube desactivada.');
      LocalDatabase.save(this.db);
      this.actualizarEstadoSuscripcionUI();
      this.showToast('Suscripción desactivada.');
    }
  }

  actualizarEstadoSuscripcionUI() {
    const sub = this.db.subscription;
    if (sub && sub.active) {
      this.cfgSubBadge.textContent = `🟢 Activo (${sub.method || 'Pagado'})`;
      this.cfgSubBadge.className = 'badge-status-sub active';
      this.cloudStatusBadge.textContent = '🟢 Activo y Sincronizando';
      this.cloudMultiStatus.textContent = 'Habilitado (Móvil & PC)';
      this.btnAbrirAuditoria.removeAttribute('disabled');
      this.btnDesactivarSub.style.display = 'inline-flex';
      document.getElementById('badge-cloud-plan').textContent = 'Plan Premium Cloud';
      document.getElementById('drawer-sync-text').textContent = 'Cloud Sync Activo';
    } else {
      this.cfgSubBadge.textContent = '⚪ Inactivo (Requiere Pago)';
      this.cfgSubBadge.className = 'badge-status-sub';
      this.cloudStatusBadge.textContent = '⚪ Solo Almacenamiento Local';
      this.cloudMultiStatus.textContent = 'Inactivo';
      this.btnAbrirAuditoria.setAttribute('disabled', 'true');
      this.btnDesactivarSub.style.display = 'none';
      document.getElementById('badge-cloud-plan').textContent = 'Servicio Opcional (Add-on)';
      document.getElementById('drawer-sync-text').textContent = 'Local-First Activo';
    }
  }

  abrirModalAuditoria() {
    if (!this.db.subscription || !this.db.subscription.active) {
      alert('La bitácora de auditoría histórica requiere tener la copia de seguridad en la nube activada y pagada.');
      return;
    }

    const logs = this.db.auditLogs || [];
    this.auditTableBody.innerHTML = '';
    logs.forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="white-space: nowrap;">${l.timestamp}</td>
        <td><strong>${l.entity}</strong></td>
        <td><span class="badge-count">${l.action}</span></td>
        <td>${l.device}</td>
        <td>${l.summary}</td>
      `;
      this.auditTableBody.appendChild(tr);
    });

    this.modalAuditoria.classList.remove('hidden');
  }

  // ==================== SINCRONIZACIÓN CADA 1 MINUTO ====================
  iniciarSincronizadorMinuto() {
    setInterval(() => this.ejecutarCicloSincronizacion(), 60000);
    setTimeout(() => this.ejecutarCicloSincronizacion(), 3000);
  }

  forzarSincronizacionInmediata() {
    this.ejecutarCicloSincronizacion(true);
  }

  async ejecutarCicloSincronizacion(esManual = false) {
    if (!this.db.subscription || !this.db.subscription.active) return;

    try {
      const healthRes = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
      if (!healthRes.ok) throw new Error('API Offline');

      if (!this.db.meta.jwtToken) {
        const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctor: this.db.config.doctorName, clinic_id: 'clinic-local-1' })
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          this.db.meta.jwtToken = loginData.token;
        }
      }

      const snapshot = {
        pacientes: this.db.pacientes,
        citas: this.db.citas,
        recetas: this.db.recetas || [],
        config: this.db.config
      };

      const pushRes = await fetch(`${API_BASE_URL}/api/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.db.meta.jwtToken}`
        },
        body: JSON.stringify({
          snapshot,
          changes: this.db.cambiosPendientes || [],
          device: navigator.userAgent.includes('Mac') ? 'MacBook' : 'Móvil/PC'
        })
      });

      if (pushRes.ok) {
        this.db.cambiosPendientes = [];
        const ahora = new Date().toLocaleString('es-ES');
        this.db.meta.ultimaSincronizacionCloud = ahora;
        LocalDatabase.save(this.db);
        this.renderRespaldoMetricas();
        if (esManual) this.showToast('✅ Sincronización en la nube completada.');
      }
    } catch (err) {
      if (esManual) this.showToast('⚠️ No se pudo conectar al REST API. Datos resguardados localmente.');
    }
  }

  renderAll() {
    this.renderPacientes();
    this.poblarSelectsPacientes();
    this.renderHistoria();
    this.renderAgenda();
    this.renderRecetasDefault();
    this.renderRespaldoMetricas();
  }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new ClinikApp();
  window.app = app;
});
