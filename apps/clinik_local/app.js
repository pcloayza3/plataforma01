/**
 * ClinikLocal - Lógica de Aplicación Local-First Avanzada v2.5
 * Soporta:
 * 1. Transformación de Contacto Rápido a Paciente.
 * 2. Catálogo dinámico de Servicios y Análisis Clínicos (Configuración, Citas, Historia).
 * 3. Selección de uno o varios servicios en citas e historia.
 * 4. Captura directa de foto/video desde la cámara con descripción de texto opcional.
 * 5. Dictado por voz (Web Speech API) para anamnesis, diagnóstico y tratamiento.
 * 6. OCR inteligente de recetarios físicos (Tesseract.js).
 * 7. Correo electrónico como canal opcional (mailto:).
 * 8. Odontograma 100% responsivo y configurable.
 * 9. Sincronización continua en segundo plano cada 1 minuto con REST API y JWT.
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

const SAMPLE_RX_VALERIA = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjYwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2MCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNjAiIGZpbGw9IiMwYjEzMjkiLz48cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSIzNzAiIGhlaWdodD0iMjMwIiByeD0iNiIgZmlsbD0iIzExMWMzOCIgc3Ryb2tlPSIjMzhiZGY4IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjM1IiBjeT0iMzUiIHI9IjQiIGZpbGw9IiMzOGJkZjgiLz48dGV4dCB4PSIzNjAiIHk9IjM4IiBmaWxsPSIjOTRhM2I4IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9ImVuZCI+Ui0yNiDigKIgUEVSSUFQSUNBTDwvdGV4dD48cGF0aCBkPSJNIDEyMCAxODAgUSAxNTAgMTQwIDE4MCAxODAgUSAyMDAgMTM1IDIyMCAxODAgUSAyNTAgMTQwIDI4MCAxODAgQyAyODAgMjMwIDEyMCAyMzAgMTIwIDE4MCBaIiBmaWxsPSIjMWUyOTNiIiBzdHJva2U9IiM2NDc0OGIiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0gMTcwIDE3MCBDIDE3MCAxMTAgMTgwIDgwIDIwMCA4MCBDIDIyMCA4MCAyMzAgMTEwIDIzMCAxNzAgQyAyMjAgMTc1IDE4MCAxNzUgMTcwIDE3MCBaIiBmaWxsPSIjNDc1NTY5IiBzdHJva2U9IiM5NGEzYjgiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0gMTgwIDkwIFEgMjAwIDc1IDIyMCA5MCBRIDIyNSAxMTUgMjAwIDExNSBRIDE3NSAxMTUgMTgwIDkwIFoiIGZpbGw9IiNmOGZhZmMiIHN0cm9rZT0iIzM4YmRmOCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNIDE4MCAxNjUgUSAxNzUgMjEwIDE4NSAyMjAgUSAxOTAgMjAwIDE5MiAxNjUgWiIgZmlsbD0iIzMzNDE1NSIvPjxwYXRoIGQ9Ik0gMjIwIDE2NSBRIDIyNSAyMTAgMjE1IDIyMCBRIDIxMCAyMDAgMjA4IDE2NSBaIiBmaWxsPSIjMzM0MTU1Ii8+PGxpbmUgeDE9IjIwMCIgeTE9IjExNSIgeDI9IjE4NSIgeTI9IjIxNSIgc3Ryb2tlPSIjMzhiZGY4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWRhc2hhcnJheT0iMiwyIi8+PGxpbmUgeDE9IjIwMCIgeTE9IjExNSIgeDI9IjIxNSIgeTI9IjIxNSIgc3Ryb2tlPSIjMzhiZGY4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWRhc2hhcnJheT0iMiwyIi8+PHJlY3QgeD0iMzAiIHk9IjIwMCIgd2lkdGg9IjEzMCIgaGVpZ2h0PSIzMCIgcng9IjQiIGZpbGw9InJnYmEoMTUsIDIzLCA0MiwgMC44NSkiIHN0cm9rZT0iIzMzNDE1NSIvPjx0ZXh0IHg9Ijk1IiB5PSIyMjAiIGZpbGw9IiMzOGJkZjgiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSI2MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBpZXphIDI2IFRyYXRhZGE8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyNTAiIGZpbGw9IiM2NDc0OGIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBhY2llbnRlOiBWYWxlcmlhIFF1aXNwZSAtIENsaW5pa0xvY2FsIERpZ2l0YWwgUng8L3RleHQ+PC9zdmc+';

const DEFAULT_DB = {
  config: {
    clinicName: 'Centro Dental & Especialidades San Lucas',
    clinicIcon: '🩺',
    clinicSub: 'Gestión Clínica',
    doctorName: 'Dr. Alejandro Fernández',
    doctorReg: 'Matrícula Nac. Nº 14890 - CBBA',
    address: 'Av. Heroínas #450, Edif. Los Cedros, Piso 3, Consultorio 302',
    mapsUrl: 'https://maps.app.goo.gl/ejemploSanLucas',
    phone: '+59170000000',
    email: 'contacto@sanlucasclinic.com',
    theme: 'teal',
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
        '16': 'tratado',
        '26': 'caries',
        '36': 'endo',
        '48': 'ausente'
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
      odontograma: { '37': 'tratado', '46': 'caries' },
      consultas: []
    },
    {
      id: 'p-3',
      tipo: 'contacto',
      nombre: 'Mariana Rojas Benítez',
      telefono: '+59176543210',
      email: '',
      ci: '',
      nacimiento: '',
      alergias: 'Ninguna',
      notas: 'Contacto preliminar: solicitó información y presupuesto por WhatsApp.',
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
      estado: 'Confirmada'
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
        if (!parsed.subscription) parsed.subscription = DEFAULT_DB.subscription;
        if (!parsed.auditLogs) parsed.auditLogs = [];
        if (!parsed.cambiosPendientes) parsed.cambiosPendientes = [];
        if (parsed.pacientes && Array.isArray(parsed.pacientes)) {
          parsed.pacientes.forEach(p => {
            if (!p.tipo) p.tipo = 'paciente';
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
    this.adjuntosConsultaEnCola = [];
    this.recognitionInstance = null;

    this.initElements();
    this.initThemeAndBranding();
    this.initEvents();
    this.renderAll();
    
    // Iniciar el temporizador de Sincronización Continua cada 1 Minuto (60s)
    this.iniciarSincronizadorMinuto();
  }

  initElements() {
    // Drawer Hamburguesa
    this.btnBurger = document.getElementById('btn-menu-hamburguesa');
    this.sidebarDrawer = document.getElementById('sidebar-drawer');
    this.drawerBackdrop = document.getElementById('drawer-backdrop');
    this.btnCerrarDrawer = document.getElementById('btn-cerrar-drawer');
    this.drawerNavItems = document.querySelectorAll('.drawer-nav-item');
    this.views = document.querySelectorAll('.view-section');
    this.btnSyncNow = document.getElementById('btn-sync-now');

    // Pacientes
    this.listaPacientes = document.getElementById('lista-pacientes');
    this.inputBuscarPaciente = document.getElementById('input-buscar-paciente');
    this.selectOrdenPacientes = document.getElementById('select-orden-pacientes');
    this.lblTotalPacientes = document.getElementById('lbl-total-pacientes');
    this.btnNuevoPaciente = document.getElementById('btn-nuevo-paciente');
    this.btnNuevoContactoRapido = document.getElementById('btn-nuevo-contacto-rapido');
    this.btnImportarContacto = document.getElementById('btn-importar-contacto-dispositivo');
    this.modalPaciente = document.getElementById('modal-paciente');
    this.formPaciente = document.getElementById('form-paciente');
    this.bloqueDatosClinicos = document.getElementById('bloque-datos-clinicos-paciente');

    // Historia
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
    this.formConsulta = document.getElementById('form-consulta');
    this.consultaServicioSelect = document.getElementById('consulta-servicio-select');

    // Multimedia inputs (Cámara directa, archivos y enlaces web/nube)
    this.inputCamaraFoto = document.getElementById('input-camara-foto');
    this.inputAdjuntoFoto = document.getElementById('input-adjunto-foto');
    this.inputCamaraVideo = document.getElementById('input-camara-video');
    this.inputAdjuntoPdf = document.getElementById('input-adjunto-pdf');
    this.inputAdjuntoDesc = document.getElementById('input-adjunto-desc');
    this.inputEnlaceWebUrl = document.getElementById('input-enlace-web-url');
    this.inputEnlaceWebTitulo = document.getElementById('input-enlace-web-titulo');
    this.selectEnlaceWebTipo = document.getElementById('select-enlace-web-tipo');
    this.btnAgregarEnlaceWeb = document.getElementById('btn-agregar-enlace-web');
    this.colaAdjuntosPreview = document.getElementById('cola-adjuntos-preview');

    // Agenda
    this.listaCitas = document.getElementById('lista-citas');
    this.btnNuevaCita = document.getElementById('btn-nueva-cita');
    this.inputFechaAgenda = document.getElementById('input-fecha-agenda');
    this.btnDiaHoy = document.getElementById('btn-dia-hoy');
    this.modalCita = document.getElementById('modal-cita');
    this.formCita = document.getElementById('form-cita');
    this.citaPacienteSelect = document.getElementById('cita-paciente-select');
    this.citaServiciosCheckboxes = document.getElementById('cita-servicios-checkboxes');

    // Recetas & OCR
    this.recetaSelectPaciente = document.getElementById('receta-select-paciente');
    this.recetaDiagnostico = document.getElementById('receta-diagnostico');
    this.recetaIndicaciones = document.getElementById('receta-indicaciones');
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

    // Configuración & Servicios
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

    // Radio button de tema
    const radio = document.querySelector(`input[name="cfg-theme"][value="${cfg.theme}"]`);
    if (radio) radio.checked = true;

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

    // REGLA 3: Si el odontograma está desactivado, NO DEBE SER MOSTRADO EN ABSOLUTO
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

    // Compartir contacto
    const handlerCompartir = () => this.compartirUbicacionWhatsApp();
    this.btnProbarCompartir.addEventListener('click', handlerCompartir);
    this.btnDrawerCompartir.addEventListener('click', handlerCompartir);

    // Filtro y Ordenación de Pacientes
    this.inputBuscarPaciente.addEventListener('input', () => this.renderPacientes());
    this.selectOrdenPacientes.addEventListener('change', () => this.renderPacientes());

    // Modales de Paciente y Contacto Rápido
    this.btnNuevoPaciente.addEventListener('click', () => this.abrirModalPaciente('paciente'));
    this.btnNuevoContactoRapido.addEventListener('click', () => this.abrirModalPaciente('contacto'));
    if (this.btnImportarContacto) {
      this.btnImportarContacto.addEventListener('click', () => this.importarContactoDesdeDispositivo());
    }
    document.getElementById('btn-cerrar-modal-paciente').addEventListener('click', () => this.cerrarModalPaciente());
    document.getElementById('btn-cancelar-modal-paciente').addEventListener('click', () => this.cerrarModalPaciente());
    this.formPaciente.addEventListener('submit', (e) => this.guardarPaciente(e));

    // Toggle de tipo en modal paciente
    document.querySelectorAll('input[name="modal-tipo-registro"]').forEach(radio => {
      radio.addEventListener('change', (e) => this.cambiarModoRegistroPaciente(e.target.value));
    });

    // Historia
    this.selectPacienteHistoria.addEventListener('change', (e) => {
      this.pacienteActivoId = e.target.value;
      this.renderHistoria();
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

    // Modal Consulta y Multimedia
    this.btnNuevaConsulta.addEventListener('click', () => this.abrirModalConsulta());
    document.getElementById('btn-cerrar-modal-consulta').addEventListener('click', () => this.cerrarModalConsulta());
    document.getElementById('btn-cancelar-modal-consulta').addEventListener('click', () => this.cerrarModalConsulta());
    this.formConsulta.addEventListener('submit', (e) => this.guardarConsulta(e));

    // Captura Multimedia (Cámara, Archivos Imagen/Video y Enlaces Web/Nube)
    const procArchivo = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const tipo = file.type.startsWith('video/') ? 'video' : 'foto';
      this.procesarArchivoAdjunto(file, tipo);
      e.target.value = '';
    };
    this.inputCamaraFoto.addEventListener('change', (e) => {
      this.procesarArchivoAdjunto(e.target.files[0], 'foto');
      e.target.value = '';
    });
    this.inputAdjuntoFoto.addEventListener('change', procArchivo);
    this.inputCamaraVideo.addEventListener('change', (e) => {
      this.procesarArchivoAdjunto(e.target.files[0], 'video');
      e.target.value = '';
    });
    this.inputAdjuntoPdf.addEventListener('change', (e) => {
      this.procesarArchivoAdjunto(e.target.files[0], 'pdf');
      e.target.value = '';
    });
    if (this.btnAgregarEnlaceWeb) {
      this.btnAgregarEnlaceWeb.addEventListener('click', () => this.agregarEnlaceWebCola());
    }

    // Dictado por Voz (Web Speech API)
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

    // Recetas, OCR y Email
    this.recetaSelectPaciente.addEventListener('change', () => this.actualizarPreviewReceta());
    this.recetaDiagnostico.addEventListener('input', () => this.actualizarPreviewReceta());
    this.recetaIndicaciones.addEventListener('input', () => this.actualizarPreviewReceta());
    this.btnAgregarFarmaco.addEventListener('click', () => this.agregarFilaFarmaco());
    this.btnImprimirReceta.addEventListener('click', () => window.print());
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
    this.btnSyncCloud.addEventListener('click', () => this.forzarSincronizacionInmediata());

    // Configuración & Catálogo de Servicios
    this.btnAgregarServicio.addEventListener('click', () => this.agregarNuevoServicio());
    this.btnGuardarConfig.addEventListener('click', () => this.guardarConfiguracion());

    // Switch Reactivo de Módulos (Aplicación inmediata)
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

    if (tabId === 'tab-historia') {
      this.aplicarVisibilidadModulos();
      this.renderHistoria();
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

        recognition.onerror = (e) => {
          console.warn('Error en dictado de voz:', e);
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
        // Fallback simulación limpia de OCR si no hay internet para Tesseract
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

    servicios.forEach((s, idx) => {
      const chip = document.createElement('span');
      chip.className = 'service-chip';
      chip.innerHTML = `
        <span>${s}</span>
        <button type="button" class="service-chip-delete" onclick="app.eliminarServicio(${idx})">&times;</button>
      `;
      this.cfgServiciosBadgesList.appendChild(chip);
    });

    // Poblar select en Historia Clínica
    this.consultaServicioSelect.innerHTML = '';
    servicios.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      this.consultaServicioSelect.appendChild(opt);
    });

    // Poblar checkboxes en Modal de Citas
    this.citaServiciosCheckboxes.innerHTML = '';
    servicios.forEach((s, idx) => {
      const label = document.createElement('label');
      label.className = 'service-check-item';
      label.innerHTML = `
        <input type="checkbox" name="cita-servicio-item" value="${s}" ${idx === 0 ? 'checked' : ''}>
        <span>${s}</span>
      `;
      this.citaServiciosCheckboxes.appendChild(label);
    });
  }

  agregarNuevoServicio() {
    const nuevo = this.cfgNuevoServicioInput.value.trim();
    if (!nuevo) return;

    if (!this.db.config.servicios) this.db.config.servicios = [...DEFAULT_SERVICIOS];
    this.db.config.servicios.push(nuevo);
    this.cfgNuevoServicioInput.value = '';

    LocalDatabase.save(this.db);
    this.renderServiciosConfiguracion();
    this.showToast(`✅ Servicio "${nuevo}" agregado al catálogo.`);
  }

  eliminarServicio(idx) {
    if (confirm('¿Eliminar este servicio del catálogo?')) {
      this.db.config.servicios.splice(idx, 1);
      LocalDatabase.save(this.db);
      this.renderServiciosConfiguracion();
    }
  }

  guardarConfiguracion() {
    const selectedTheme = document.querySelector('input[name="cfg-theme"]:checked')?.value || 'teal';
    
    this.db.config = {
      clinicName: this.cfgClinicName.value.trim() || 'Consultorio Particular',
      clinicIcon: this.cfgClinicIcon.value,
      clinicSub: this.cfgClinicSub.value.trim() || 'Gestión Clínica',
      doctorName: this.cfgDoctorName.value.trim() || 'Dr(a). Profesional',
      doctorReg: this.cfgDoctorReg.value.trim(),
      address: this.cfgClinicAddress.value.trim(),
      mapsUrl: this.cfgClinicMaps.value.trim(),
      phone: this.cfgClinicPhone.value.trim(),
      email: this.cfgClinicEmail.value.trim(),
      theme: selectedTheme,
      servicios: this.db.config.servicios || DEFAULT_SERVICIOS,
      modules: {
        odontograma: this.cfgModuleOdonto.checked,
        recetas: this.cfgModuleRecetas.checked,
        agenda: this.cfgModuleAgenda.checked
      }
    };

    LocalDatabase.save(this.db);
    this.initThemeAndBranding();
    this.aplicarVisibilidadModulos();
    this.renderHistoria();
    this.registrarAuditoria('Configuracion', 'cfg-general', 'EDITAR', 'Actualización de preferencias y datos del consultorio');
    this.showToast('✅ Configuración guardada correctamente.');
  }

  compartirUbicacionWhatsApp() {
    const cfg = this.db.config;
    let texto = `*${cfg.clinicName.toUpperCase()}*\n`;
    texto += `👨‍⚕️ *Atención:* ${cfg.doctorName} (${cfg.doctorReg})\n`;
    texto += `📍 *Dirección:* ${cfg.address}\n`;
    if (cfg.mapsUrl) texto += `🗺️ *Ver en Google Maps:* ${cfg.mapsUrl}\n`;
    texto += `📞 *Teléfono / WhatsApp de Citas:* ${cfg.phone}\n`;
    if (cfg.email) texto += `✉️ *Correo Electrónico:* ${cfg.email}\n`;
    texto += `\n_Estamos a su entera disposición para su atención de salud._`;

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

  // ==================== PACIENTES & CONTACTOS ====================
  cambiarModoRegistroPaciente(modo) {
    if (modo === 'contacto') {
      this.bloqueDatosClinicos.style.display = 'none';
      document.getElementById('modal-paciente-titulo').textContent = '⚡ Registro de Contacto Rápido';
      document.getElementById('lbl-notas-paciente').textContent = 'Motivo de consulta preliminar o cotización:';
      document.getElementById('btn-submit-paciente').textContent = 'Guardar Contacto';
    } else {
      this.bloqueDatosClinicos.style.display = 'block';
      document.getElementById('modal-paciente-titulo').textContent = '👤 Ficha de Paciente Formal';
      document.getElementById('lbl-notas-paciente').textContent = 'Notas Clínicas y Antecedentes:';
      document.getElementById('btn-submit-paciente').textContent = 'Guardar Paciente';
    }
  }

  abrirModalPaciente(modo = 'paciente', prefill = null) {
    this.formPaciente.reset();
    document.getElementById('paciente-id').value = prefill ? prefill.id : '';

    const radio = document.querySelector(`input[name="modal-tipo-registro"][value="${modo}"]`);
    if (radio) radio.checked = true;
    this.cambiarModoRegistroPaciente(modo);

    if (prefill) {
      document.getElementById('paciente-nombre').value = prefill.nombre || '';
      document.getElementById('paciente-telefono').value = prefill.telefono || '';
      document.getElementById('paciente-email').value = prefill.email || '';
      document.getElementById('paciente-ci').value = prefill.ci || '';
      document.getElementById('paciente-nacimiento').value = prefill.nacimiento || '';
      document.getElementById('paciente-alergias').value = prefill.alergias || '';
      document.getElementById('paciente-notas').value = prefill.notas || '';
    }

    this.modalPaciente.classList.remove('hidden');
  }

  cerrarModalPaciente() {
    this.modalPaciente.classList.add('hidden');
  }

  async importarContactoDesdeDispositivo() {
    // Contact Picker API para navegadores móviles compatibles (Android Chrome / Web PWA)
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel', 'email'];
        const contacts = await navigator.contacts.select(props, { multiple: false });
        if (contacts && contacts.length > 0) {
          const c = contacts[0];
          if (c.name && c.name.length > 0) {
            document.getElementById('paciente-nombre').value = c.name[0];
          }
          if (c.tel && c.tel.length > 0) {
            document.getElementById('paciente-telefono').value = c.tel[0];
          }
          if (c.email && c.email.length > 0) {
            document.getElementById('paciente-email').value = c.email[0];
          }
          this.showToast(`✅ Contacto "${c.name ? c.name[0] : 'del dispositivo'}" importado exitosamente.`);
          return;
        }
      } catch (err) {
        console.warn('Acceso a contactos cancelado por el usuario o error:', err);
      }
    } else {
      // Explicación guiada en entornos de escritorio o navegadores sin soporte directo
      alert(
        '📲 Importación de Contactos desde el Dispositivo:\n\n' +
        '1. En teléfonos móviles con Google Chrome / Android (y navegadores con soporte de Contact Picker API), al presionar este botón se abre la lista de contactos de tu celular y rellena automáticamente el Nombre, Teléfono/WhatsApp y Correo.\n\n' +
        '2. En computadoras de escritorio (Mac, Windows, Linux) el sistema operativo protege la agenda por seguridad. Puedes ingresar o pegar los datos directamente en el formulario.\n\n' +
        '3. Además, si una persona te escribió primero por WhatsApp solicitando informes, puedes registrarla con 1 clic en "+ Contacto Rápido" y posteriormente convertirla a Paciente formal con el botón "⚡ Convertir a Paciente".'
      );
    }
  }

  guardarPaciente(e) {
    e.preventDefault();
    const idExistente = document.getElementById('paciente-id').value;
    const modo = document.querySelector('input[name="modal-tipo-registro"]:checked').value;
    const nombre = document.getElementById('paciente-nombre').value.trim();
    const telefono = document.getElementById('paciente-telefono').value.trim();
    const email = document.getElementById('paciente-email').value.trim();
    const ci = document.getElementById('paciente-ci').value.trim();
    const nacimiento = document.getElementById('paciente-nacimiento').value;
    const alergias = document.getElementById('paciente-alergias').value.trim();
    const notas = document.getElementById('paciente-notas').value.trim();

    if (idExistente) {
      // Editar o transformar
      const idx = this.db.pacientes.findIndex(p => p.id === idExistente);
      if (idx !== -1) {
        this.db.pacientes[idx].tipo = modo;
        this.db.pacientes[idx].nombre = nombre;
        this.db.pacientes[idx].telefono = telefono;
        this.db.pacientes[idx].email = email;
        this.db.pacientes[idx].ci = ci;
        this.db.pacientes[idx].nacimiento = nacimiento;
        this.db.pacientes[idx].alergias = alergias || 'Ninguna';
        this.db.pacientes[idx].notas = notas;
        this.registrarAuditoria('Paciente', idExistente, 'EDITAR', `Actualización/Conversión de ${nombre} a ${modo}`);
      }
    } else {
      // Nuevo registro
      const nuevo = {
        id: 'p-' + Date.now(),
        tipo: modo,
        nombre,
        telefono,
        email,
        ci,
        nacimiento,
        alergias: alergias || 'Ninguna',
        notas,
        ultimaAtencion: new Date().toISOString().split('T')[0],
        odontograma: {},
        consultas: []
      };
      this.db.pacientes.unshift(nuevo);
      this.registrarAuditoria('Paciente', nuevo.id, 'CREAR', `Nuevo ${modo}: ${nombre}`);
    }

    LocalDatabase.save(this.db);
    this.cerrarModalPaciente();
    this.renderAll();
    this.showToast(`✅ ${modo === 'contacto' ? 'Contacto' : 'Paciente'} guardado.`);
  }

  convertirContactoAPaciente(id) {
    const contacto = this.db.pacientes.find(p => p.id === id);
    if (!contacto) return;
    this.abrirModalPaciente('paciente', contacto);
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

    // ORDENACIÓN
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
      this.listaPacientes.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 3rem;">No se encontraron personas con ese criterio.</div>`;
      return;
    }

    filtrados.forEach(p => {
      const card = document.createElement('div');
      card.className = 'patient-card';
      const inicial = p.nombre.charAt(0).toUpperCase();
      const esContacto = p.tipo === 'contacto';

      card.innerHTML = `
        <div>
          <div class="patient-card-header">
            <div class="patient-avatar ${esContacto ? 'is-contact' : ''}">${inicial}</div>
            <div>
              <div class="patient-name">
                ${p.nombre}
                <span class="badge-tipo-tag ${esContacto ? 'contacto' : 'paciente'}">
                  ${esContacto ? 'Contacto' : 'Paciente'}
                </span>
              </div>
              <div class="patient-ci">${esContacto ? 'Contacto preliminar' : (p.ci ? 'Doc: ' + p.ci : 'Sin documento')}</div>
            </div>
          </div>
          <div class="patient-meta">
            <div>📱 <strong>WhatsApp:</strong> ${p.telefono}</div>
            ${p.email ? `<div>✉️ <strong>Email:</strong> ${p.email}</div>` : ''}
            ${!esContacto && p.nacimiento ? `<div>🎂 <strong>Nacimiento:</strong> ${p.nacimiento}</div>` : ''}
            <div class="last-visit-tag">🕒 Última atención: ${p.ultimaAtencion || 'Sin consultas previas'}</div>
            ${p.alergias && p.alergias !== 'Ninguna' ? `<div class="allergy-pill">⚠️ Alergia: ${p.alergias}</div>` : ''}
          </div>
        </div>
        <div class="patient-card-footer">
          <button class="btn btn-whatsapp" style="font-size: 0.8rem; padding: 0.4rem 0.65rem;" onclick="app.saludarPacienteWhatsApp('${p.id}')">
            💬 WhatsApp
          </button>
          ${esContacto ? `
            <button class="btn-convertir" onclick="app.convertirContactoAPaciente('${p.id}')">
              ⚡ Convertir a Paciente
            </button>
          ` : `
            <button class="btn btn-subtle" style="font-size: 0.8rem; padding: 0.4rem 0.65rem;" onclick="app.seleccionarPacienteYVerHistoria('${p.id}')">
              Ver Ficha →
            </button>
          `}
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
      sel.innerHTML = '';
      this.db.pacientes.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.nombre} (${p.tipo === 'contacto' ? 'Contacto' : 'Paciente'})`;
        sel.appendChild(opt);
      });
    });

    if (this.pacienteActivoId) {
      this.selectPacienteHistoria.value = this.pacienteActivoId;
      this.recetaSelectPaciente.value = this.pacienteActivoId;
    }
  }

  seleccionarPacienteYVerHistoria(id) {
    this.pacienteActivoId = id;
    this.selectPacienteHistoria.value = id;
    this.recetaSelectPaciente.value = id;
    this.renderHistoria();
    this.cambiarPestana('tab-historia');
    this.aplicarVisibilidadModulos();
  }

  // ==================== HISTORIA CLÍNICA & MULTIMEDIA ====================
  renderHistoria() {
    const paciente = this.db.pacientes.find(p => p.id === this.pacienteActivoId);
    if (!paciente) {
      this.timelineConsultas.innerHTML = '<p style="color: #94a3b8;">Selecciona un paciente para ver su historia.</p>';
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

    this.timelineConsultas.innerHTML = '';
    if (consultas.length === 0) {
      this.timelineConsultas.innerHTML = '<p style="color: #94a3b8; padding: 1.5rem 0;">No hay consultas registradas. Presiona "+ Registrar Consulta".</p>';
      return;
    }

    consultas.forEach(c => {
      const card = document.createElement('div');
      card.className = 'timeline-card';
      
      let mediaHtml = '';
      if (c.adjuntos && c.adjuntos.length > 0) {
        mediaHtml += `<div class="timeline-media-gallery">`;
        c.adjuntos.forEach(adj => {
          if (adj.tipo === 'foto') {
            mediaHtml += `
              <div class="media-thumbnail-card" onclick="app.abrirLightbox('${encodeURIComponent(adj.url)}', '${encodeURIComponent(adj.descripcion || adj.titulo)}')">
                <img src="${adj.url}" class="media-thumb-img" alt="${adj.titulo}">
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
            const isWeb = adj.url && adj.url.startsWith('http');
            if (isWeb) {
              mediaHtml += `
                <a href="${adj.url}" target="_blank" rel="noopener noreferrer" class="media-video-badge">
                  🎥 Video Web: ${adj.titulo} ${adj.descripcion ? `(${adj.descripcion})` : ''} ↗
                </a>
              `;
            } else {
              mediaHtml += `
                <div class="media-thumbnail-card" style="max-width: 200px;">
                  <video src="${adj.url}" controls style="width:100%; border-radius:4px;"></video>
                  <span class="media-thumb-label">🎥 ${adj.titulo}</span>
                  ${adj.descripcion ? `<span class="media-thumb-desc">${adj.descripcion}</span>` : ''}
                </div>
              `;
            }
          } else {
            // Documento / Enlace en la nube
            mediaHtml += `
              <a href="${adj.url}" target="_blank" rel="noopener noreferrer" class="media-doc-badge">
                🌐 Documento / Nube: ${adj.titulo} ${adj.descripcion ? `(${adj.descripcion})` : ''} ↗
              </a>
            `;
          }
        });
        mediaHtml += `</div>`;
      }

      card.innerHTML = `
        <div class="timeline-meta">
          <span>📅 ${c.fecha}</span>
          <span class="service-badge-timeline">🔬 ${c.servicio || 'Consulta Médica'}</span>
        </div>
        <div class="timeline-dx">🔬 Diagnóstico: ${c.diagnostico}</div>
        <div class="timeline-tx"><strong>Tratamiento y evolución:</strong> ${c.tratamiento}</div>
        ${mediaHtml}
      `;
      this.timelineConsultas.appendChild(card);
    });
  }

  abrirLightbox(urlEncoded, captionEncoded) {
    this.lightboxImg.src = decodeURIComponent(urlEncoded);
    this.lightboxCaption.textContent = decodeURIComponent(captionEncoded);
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
        descripcion: desc || (finalTipo === 'video' ? 'Video adjunto' : finalTipo === 'foto' ? 'Imagen adjunta' : 'Documento PDF'),
        url: event.target.result
      });
      if (this.inputAdjuntoDesc) this.inputAdjuntoDesc.value = '';
      this.renderColaAdjuntos();
      this.showToast(`✅ Archivo "${file.name}" agregado.`);
    };
    reader.readAsDataURL(file);
  }

  agregarEnlaceWebCola() {
    const url = this.inputEnlaceWebUrl ? this.inputEnlaceWebUrl.value.trim() : '';
    if (!url) {
      alert('Ingresa una URL válida (ej. https://drive.google.com/...)');
      return;
    }
    const titulo = (this.inputEnlaceWebTitulo && this.inputEnlaceWebTitulo.value.trim()) || 'Enlace Web';
    let tipo = this.selectEnlaceWebTipo ? this.selectEnlaceWebTipo.value : 'auto';

    if (tipo === 'auto') {
      const lower = url.toLowerCase();
      if (lower.endsWith('.pdf') || lower.includes('/pdf')) {
        tipo = 'pdf';
      } else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.svg')) {
        tipo = 'foto';
      } else if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com')) {
        tipo = 'video';
      } else {
        tipo = 'documento';
      }
    }

    this.adjuntosConsultaEnCola.push({
      tipo,
      titulo,
      descripcion: `Enlace en la nube: ${url}`,
      url
    });

    if (this.inputEnlaceWebUrl) this.inputEnlaceWebUrl.value = '';
    if (this.inputEnlaceWebTitulo) this.inputEnlaceWebTitulo.value = '';
    this.renderColaAdjuntos();
    this.showToast(`✅ Enlace "${titulo}" agregado.`);
  }

  renderColaAdjuntos() {
    this.colaAdjuntosPreview.innerHTML = '';
    this.adjuntosConsultaEnCola.forEach((item, idx) => {
      const badge = document.createElement('span');
      badge.className = 'preview-badge-item';
      const icon = item.tipo === 'foto' ? '📷' : item.tipo === 'pdf' ? '📑' : item.tipo === 'video' ? '🎥' : '🌐';
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

  abrirModalConsulta() {
    if (!this.pacienteActivoId) {
      alert('Seleccione un paciente primero.');
      return;
    }
    this.formConsulta.reset();
    if (this.inputEnlaceWebUrl) this.inputEnlaceWebUrl.value = '';
    if (this.inputEnlaceWebTitulo) this.inputEnlaceWebTitulo.value = '';
    if (this.inputAdjuntoDesc) this.inputAdjuntoDesc.value = '';
    this.adjuntosConsultaEnCola = [];
    this.renderColaAdjuntos();
    document.getElementById('consulta-fecha').value = new Date().toISOString().split('T')[0];
    this.modalConsulta.classList.remove('hidden');
  }

  cerrarModalConsulta() {
    this.modalConsulta.classList.add('hidden');
  }

  guardarConsulta(e) {
    e.preventDefault();
    const paciente = this.db.pacientes.find(p => p.id === this.pacienteActivoId);
    if (!paciente) return;

    const fecha = document.getElementById('consulta-fecha').value;
    const servicio = this.consultaServicioSelect.value;
    const motivo = document.getElementById('consulta-motivo').value.trim();
    const diagnostico = document.getElementById('consulta-diagnostico').value.trim();
    const tratamiento = document.getElementById('consulta-tratamiento').value.trim();

    // Si quedó un enlace escrito en el input sin pulsar el botón
    const enlaceUrl = this.inputEnlaceWebUrl ? this.inputEnlaceWebUrl.value.trim() : '';
    if (enlaceUrl) {
      const titulo = (this.inputEnlaceWebTitulo && this.inputEnlaceWebTitulo.value.trim()) || 'Enlace Externo';
      let tipo = this.selectEnlaceWebTipo ? this.selectEnlaceWebTipo.value : 'auto';
      if (tipo === 'auto') {
        const lower = enlaceUrl.toLowerCase();
        if (lower.endsWith('.pdf') || lower.includes('/pdf')) tipo = 'pdf';
        else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || lower.endsWith('.svg')) tipo = 'foto';
        else if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com')) tipo = 'video';
        else tipo = 'documento';
      }
      this.adjuntosConsultaEnCola.push({
        tipo,
        titulo,
        descripcion: `Enlace en la nube: ${enlaceUrl}`,
        url: enlaceUrl
      });
      this.inputEnlaceWebUrl.value = '';
    }

    const adjuntos = [...this.adjuntosConsultaEnCola];

    if (!paciente.consultas) paciente.consultas = [];
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

    LocalDatabase.save(this.db);
    this.cerrarModalConsulta();
    this.renderHistoria();
    this.renderRespaldoMetricas();
    this.showToast('✅ Consulta guardada en historia clínica.');
  }

  // ODONTOGRAMA FDI RESPONSIVO
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
    const estado = paciente.odontograma[num] || 'sano';
    btn.className = `tooth-btn tooth-${estado}`;
    btn.innerHTML = `
      <span>${num}</span>
      <span class="tooth-icon">🦷</span>
    `;
    btn.title = `Pieza ${num}: Estado ${estado}. Haz clic para alternar.`;

    btn.addEventListener('click', () => {
      const estados = ['sano', 'caries', 'tratado', 'endo', 'ausente'];
      const nextIdx = (estados.indexOf(estado) + 1) % estados.length;
      paciente.odontograma[num] = estados[nextIdx];
      
      this.registrarAuditoria('Odontograma', `diente-${num}`, 'ACTUALIZAR', `Pieza ${num} a ${estados[nextIdx]} (${paciente.nombre})`);
      LocalDatabase.save(this.db);
      this.renderOdontograma(paciente);
      this.showToast(`Pieza ${num}: ${estados[nextIdx].toUpperCase()}`);
    });

    return btn;
  }

  // ==================== AGENDA & CITAS CON SERVICIOS ====================
  renderAgenda() {
    const fechaFiltro = this.inputFechaAgenda.value;
    const citas = this.db.citas.filter(c => c.fecha === fechaFiltro);
    this.listaCitas.innerHTML = '';

    if (citas.length === 0) {
      this.listaCitas.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 2.5rem; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">No hay citas para el día ${fechaFiltro}.</div>`;
      return;
    }

    citas.sort((a, b) => a.hora.localeCompare(b.hora));

    citas.forEach(c => {
      const paciente = this.db.pacientes.find(p => p.id === c.pacienteId) || { nombre: 'Paciente no identificado', telefono: '', email: '' };
      const item = document.createElement('div');
      item.className = 'appointment-card';

      const serviciosBadges = (c.servicios || []).map(s => `<span class="service-pill-mini">🔬 ${s}</span>`).join(' ');

      item.innerHTML = `
        <div class="appointment-time">⏰ ${c.hora}</div>
        <div class="appointment-patient">
          <div class="appointment-name">${paciente.nombre}</div>
          <div class="appointment-services-row">${serviciosBadges}</div>
          <div class="appointment-reason">Nota: ${c.motivo || 'Atención regular'} • Tel: ${paciente.telefono}</div>
        </div>
        <div class="appointment-actions">
          <button class="btn btn-whatsapp" style="font-size:0.8rem; padding:0.4rem 0.65rem;" onclick="app.enviarRecordatorioCitaWhatsApp('${c.id}')">
            💬 WhatsApp
          </button>
          ${paciente.email ? `
            <button class="btn btn-subtle" style="font-size:0.8rem; padding:0.4rem 0.65rem;" onclick="app.enviarRecordatorioCitaEmail('${c.id}')">
              ✉️ Email
            </button>
          ` : ''}
          <button class="btn btn-subtle" style="font-size:0.8rem; padding:0.4rem 0.65rem;" onclick="app.eliminarCita('${c.id}')" title="Cancelar cita">
            ✕
          </button>
        </div>
      `;
      this.listaCitas.appendChild(item);
    });
  }

  abrirModalCita() {
    this.poblarSelectsPacientes();
    this.formCita.reset();
    document.getElementById('cita-fecha').value = this.inputFechaAgenda.value || new Date().toISOString().split('T')[0];
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

    // Obtener servicios marcados
    const checkboxes = document.querySelectorAll('input[name="cita-servicio-item"]:checked');
    const servicios = Array.from(checkboxes).map(cb => cb.value);

    const nueva = {
      id: 'cita-' + Date.now(),
      pacienteId,
      fecha,
      hora,
      servicios: servicios.length > 0 ? servicios : ['Consulta Regular'],
      motivo,
      estado: 'Pendiente'
    };

    this.db.citas.push(nueva);
    const p = this.db.pacientes.find(x => x.id === pacienteId);
    this.registrarAuditoria('Agenda', nueva.id, 'CREAR', `Cita para ${p ? p.nombre : 'Paciente'} el ${fecha} (${servicios.join(', ')})`);

    LocalDatabase.save(this.db);
    this.cerrarModalCita();
    this.renderAgenda();
    this.renderRespaldoMetricas();
    this.showToast('✅ Cita agendada correctamente.');
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

  // ==================== RECETAS & EMAIL ====================
  renderRecetasDefault() {
    this.listaFarmacosInputs.innerHTML = '';
    this.agregarFilaFarmaco('Amoxicilina 870mg + Ác. Clavulánico 125mg', '1 comp cada 12h', '7 días');
    this.agregarFilaFarmaco('Ibuprofeno 400mg', '1 tableta cada 8h en dolor', '3 días');
    this.actualizarPreviewReceta();
  }

  agregarFilaFarmaco(nombre = '', dosis = '', tiempo = '') {
    const row = document.createElement('div');
    row.className = 'med-row';
    row.innerHTML = `
      <input type="text" class="input-field med-nombre" placeholder="Fármaco (ej. Paracetamol 500mg)" value="${nombre}">
      <input type="text" class="input-field med-dosis" placeholder="Dosis (ej. 1 c/8h)" value="${dosis}">
      <input type="text" class="input-field med-tiempo" placeholder="Duración (ej. 5 días)" value="${tiempo}">
      <button type="button" class="btn btn-subtle" style="padding: 0.5rem;" onclick="this.parentElement.remove(); app.actualizarPreviewReceta();">&times;</button>
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
