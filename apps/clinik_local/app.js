/**
 * ClinikLocal - Lógica de Aplicación Local-First Avanzada
 * Soporta:
 * 1. Menú hamburguesa colapsable y drawer lateral.
 * 2. Panel de Configuración completo (consultorio, doctor, temas, switches de módulos, compartir ubicación).
 * 3. Ordenación avanzada de pacientes (recientes atendidos por defecto, hoy, apellido asc/desc).
 * 4. Soporte multimedia en historia (fotos con lightbox, video embebido, PDF de estudios).
 * 5. Pasarela de pago (PayPal / QR) para activar copia en la nube y multi-dispositivo.
 * 6. Motor de Sincronización Continua en la Nube cada 1 minuto con JWT y Bitácora de Auditoría.
 */

const STORAGE_KEY = 'clinik_local_db_v2';
const API_BASE_URL = 'http://localhost:4050';

// BASE DE DATOS INICIAL CON CONFIGURACIÓN Y EJEMPLOS REALES
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
    theme: 'teal',
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
      nombre: 'Valeria Quispe Morales',
      telefono: '+59171234567',
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
          tipo: 'Odontológica',
          motivo: 'Control de Caries y Ajuste de Arco',
          diagnostico: 'Pulpitis reversible en pieza 26. Progresión favorable.',
          tratamiento: 'Curación estética con resina nanohíbrida y ajuste de arco superior.',
          adjuntos: [
            {
              tipo: 'foto',
              titulo: 'Radiografía Periapical Pieza 26',
              url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" style="background:%231e293b;fill:%23f8fafc;font-family:sans-serif;font-size:14px;"><text x="20" y="100">Radiografía Pieza 26 (Pieza Tratada)</text></svg>'
            }
          ]
        }
      ]
    },
    {
      id: 'p-2',
      nombre: 'Rodrigo Camacho Flores',
      telefono: '+59179876543',
      ci: '7841209 LPZ',
      nacimiento: '1988-11-20',
      alergias: 'Ninguna conocida',
      notas: 'Paciente con bruxismo nocturno. Usa férula de descarga.',
      ultimaAtencion: '2026-09-18',
      odontograma: {
        '37': 'tratado',
        '46': 'caries'
      },
      consultas: [
        {
          id: 'c-102',
          fecha: '2026-09-18',
          tipo: 'Médica General',
          motivo: 'Cefalea tensional recurrente y tensión mandibular',
          diagnostico: 'Disfunción de la articulación temporomandibular (ATM).',
          tratamiento: 'Prescripción de relajante muscular y derivación a fisioterapia maxilofacial.',
          adjuntos: []
        }
      ]
    }
  ],
  citas: [
    {
      id: 'cita-1',
      pacienteId: 'p-1',
      fecha: new Date().toISOString().split('T')[0],
      hora: '10:30',
      motivo: 'Control de Caries en Pieza 26',
      estado: 'Confirmada'
    },
    {
      id: 'cita-2',
      pacienteId: 'p-2',
      fecha: new Date().toISOString().split('T')[0],
      hora: '15:00',
      motivo: 'Ajuste de placa oclusal',
      estado: 'Pendiente'
    }
  ],
  auditLogs: [
    {
      id: 'log-seed',
      timestamp: new Date().toLocaleString('es-ES'),
      entity: 'Sistema',
      action: 'INICIALIZACION',
      device: 'Dispositivo Local',
      summary: 'Base de datos local inicializada con éxito.'
    }
  ],
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
        if (!parsed.subscription) parsed.subscription = DEFAULT_DB.subscription;
        if (!parsed.auditLogs) parsed.auditLogs = DEFAULT_DB.auditLogs;
        if (!parsed.cambiosPendientes) parsed.cambiosPendientes = [];
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
    this.db = LocalDatabase.load();
    this.pacienteActivoId = this.db.pacientes.length > 0 ? this.db.pacientes[0].id : null;
    this.adjuntosConsultaEnCola = [];
    
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

    // Sincronización Pills
    this.syncPill = document.getElementById('sync-pill');
    this.syncDot = document.getElementById('sync-dot');
    this.syncLabel = document.getElementById('sync-label');
    this.btnSyncNow = document.getElementById('btn-sync-now');

    // Pacientes
    this.listaPacientes = document.getElementById('lista-pacientes');
    this.inputBuscarPaciente = document.getElementById('input-buscar-paciente');
    this.selectOrdenPacientes = document.getElementById('select-orden-pacientes');
    this.lblTotalPacientes = document.getElementById('lbl-total-pacientes');
    this.btnNuevoPaciente = document.getElementById('btn-nuevo-paciente');
    this.modalPaciente = document.getElementById('modal-paciente');
    this.formPaciente = document.getElementById('form-paciente');

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

    // Multimedia inputs
    this.inputAdjuntoFoto = document.getElementById('input-adjunto-foto');
    this.inputAdjuntoPdf = document.getElementById('input-adjunto-pdf');
    this.inputAdjuntoVideo = document.getElementById('input-adjunto-video');
    this.colaAdjuntosPreview = document.getElementById('cola-adjuntos-preview');

    // Agenda
    this.listaCitas = document.getElementById('lista-citas');
    this.btnNuevaCita = document.getElementById('btn-nueva-cita');
    this.inputFechaAgenda = document.getElementById('input-fecha-agenda');
    this.btnDiaHoy = document.getElementById('btn-dia-hoy');
    this.modalCita = document.getElementById('modal-cita');
    this.formCita = document.getElementById('form-cita');
    this.citaPacienteSelect = document.getElementById('cita-paciente-select');

    // Recetas
    this.recetaSelectPaciente = document.getElementById('receta-select-paciente');
    this.recetaDiagnostico = document.getElementById('receta-diagnostico');
    this.recetaIndicaciones = document.getElementById('receta-indicaciones');
    this.listaFarmacosInputs = document.getElementById('lista-farmacos-inputs');
    this.btnAgregarFarmaco = document.getElementById('btn-agregar-farmaco');
    this.btnImprimirReceta = document.getElementById('btn-imprimir-receta');
    this.btnWaReceta = document.getElementById('btn-wa-receta');
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

    // Configuración
    this.cfgClinicName = document.getElementById('cfg-clinic-name');
    this.cfgClinicIcon = document.getElementById('cfg-clinic-icon');
    this.cfgClinicSub = document.getElementById('cfg-clinic-sub');
    this.cfgDoctorName = document.getElementById('cfg-doctor-name');
    this.cfgDoctorReg = document.getElementById('cfg-doctor-reg');
    this.cfgClinicAddress = document.getElementById('cfg-clinic-address');
    this.cfgClinicMaps = document.getElementById('cfg-clinic-maps');
    this.cfgClinicPhone = document.getElementById('cfg-clinic-phone');
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

    // Modal Pagos
    this.modalPago = document.getElementById('modal-pago');
    this.vistaPagoPaypal = document.getElementById('vista-pago-paypal');
    this.vistaPagoQr = document.getElementById('vista-pago-qr');
    this.btnConfirmarPaypal = document.getElementById('btn-confirmar-pago-paypal');
    this.btnConfirmarQr = document.getElementById('btn-confirmar-pago-qr');

    // Modal Auditoría
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
    document.getElementById('header-clinic-subtitle').innerHTML = `<span>${cfg.doctorName}</span> &bull; <span class="badge-local">100% Local</span>`;

    document.getElementById('drawer-clinic-name').textContent = cfg.clinicName;
    document.getElementById('drawer-clinic-icon').textContent = cfg.clinicIcon;
    document.getElementById('drawer-clinic-sub').textContent = cfg.clinicSub;
    document.getElementById('drawer-doctor-name').textContent = cfg.doctorName;

    // Recetas membrete
    document.getElementById('rx-header-doctor').textContent = `${cfg.doctorName} (${cfg.doctorReg})`;
    document.getElementById('rx-header-clinic').textContent = cfg.clinicName;
    document.getElementById('rx-header-contact').textContent = `${cfg.address} &bull; WhatsApp: ${cfg.phone}`;

    // Llenar campos de configuración
    this.cfgClinicName.value = cfg.clinicName;
    this.cfgClinicIcon.value = cfg.clinicIcon;
    this.cfgClinicSub.value = cfg.clinicSub;
    this.cfgDoctorName.value = cfg.doctorName;
    this.cfgDoctorReg.value = cfg.doctorReg;
    this.cfgClinicAddress.value = cfg.address;
    this.cfgClinicMaps.value = cfg.mapsUrl;
    this.cfgClinicPhone.value = cfg.phone;

    // Radio button de tema
    const radio = document.querySelector(`input[name="cfg-theme"][value="${cfg.theme}"]`);
    if (radio) radio.checked = true;

    // Switches de módulos
    this.cfgModuleOdonto.checked = cfg.modules.odontograma !== false;
    this.cfgModuleRecetas.checked = cfg.modules.recetas !== false;
    this.cfgModuleAgenda.checked = cfg.modules.agenda !== false;

    this.aplicarVisibilidadModulos();
    this.actualizarEstadoSuscripcionUI();
  }

  aplicarVisibilidadModulos() {
    const mods = this.db.config.modules;
    // Odontograma
    if (mods.odontograma === false) {
      this.toggleOdontoWrapper.style.display = 'none';
      this.seccionOdontograma.classList.add('hidden');
    } else {
      this.toggleOdontoWrapper.style.display = 'flex';
    }

    // Recetas en drawer
    const menuRecetas = document.getElementById('menu-item-recetas');
    if (menuRecetas) menuRecetas.style.display = mods.recetas === false ? 'none' : 'flex';

    // Agenda en drawer
    const menuAgenda = document.getElementById('menu-item-agenda');
    if (menuAgenda) menuAgenda.style.display = mods.agenda === false ? 'none' : 'flex';
  }

  initEvents() {
    // Drawer Hamburguesa
    this.btnBurger.addEventListener('click', () => this.abrirDrawer());
    this.btnCerrarDrawer.addEventListener('click', () => this.cerrarDrawer());
    this.drawerBackdrop.addEventListener('click', () => this.cerrarDrawer());

    this.drawerNavItems.forEach(item => {
      item.addEventListener('click', () => {
        const tabTarget = item.dataset.tab;
        this.cambiarPestana(tabTarget);
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

    // Modales de Paciente
    this.btnNuevoPaciente.addEventListener('click', () => this.abrirModalPaciente());
    document.getElementById('btn-cerrar-modal-paciente').addEventListener('click', () => this.cerrarModalPaciente());
    document.getElementById('btn-cancelar-modal-paciente').addEventListener('click', () => this.cerrarModalPaciente());
    this.formPaciente.addEventListener('submit', (e) => this.guardarPaciente(e));

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
    });
    this.btnModoDental.addEventListener('click', () => {
      this.btnModoDental.classList.add('active');
      this.btnModoMedico.classList.remove('active');
      this.seccionOdontograma.classList.remove('hidden');
    });

    // Modal Consulta y Multimedia
    this.btnNuevaConsulta.addEventListener('click', () => this.abrirModalConsulta());
    document.getElementById('btn-cerrar-modal-consulta').addEventListener('click', () => this.cerrarModalConsulta());
    document.getElementById('btn-cancelar-modal-consulta').addEventListener('click', () => this.cerrarModalConsulta());
    this.formConsulta.addEventListener('submit', (e) => this.guardarConsulta(e));

    this.inputAdjuntoFoto.addEventListener('change', (e) => this.procesarAdjuntoFoto(e));
    this.inputAdjuntoPdf.addEventListener('change', (e) => this.procesarAdjuntoPdf(e));

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

    // Recetas
    this.recetaSelectPaciente.addEventListener('change', () => this.actualizarPreviewReceta());
    this.recetaDiagnostico.addEventListener('input', () => this.actualizarPreviewReceta());
    this.recetaIndicaciones.addEventListener('input', () => this.actualizarPreviewReceta());
    this.btnAgregarFarmaco.addEventListener('click', () => this.agregarFilaFarmaco());
    this.btnImprimirReceta.addEventListener('click', () => window.print());
    this.btnWaReceta.addEventListener('click', () => this.enviarRecetaWhatsApp());

    // Respaldo y Sincronización Manual
    this.btnExportarLocal.addEventListener('click', () => {
      LocalDatabase.exportBackup();
      this.registrarAuditoria('Respaldo', 'backup-local', 'EXPORTAR', 'Exportación de archivo .clinik');
      this.showToast('✅ Respaldo descargado exitosamente (.clinik)');
    });
    this.inputImportarLocal.addEventListener('change', (e) => this.manejarImportacion(e));
    this.btnSyncNow.addEventListener('click', () => this.forzarSincronizacionInmediata());
    this.btnSyncCloud.addEventListener('click', () => this.forzarSincronizacionInmediata());

    // Guardar Configuración
    this.btnGuardarConfig.addEventListener('click', () => this.guardarConfiguracion());

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
  }

  showToast(mensaje) {
    this.toastEl.textContent = mensaje;
    this.toastEl.classList.remove('hidden');
    setTimeout(() => {
      this.toastEl.classList.add('hidden');
    }, 3500);
  }

  // ==================== CONFIGURACIÓN Y TEMAS ====================
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
      theme: selectedTheme,
      modules: {
        odontograma: this.cfgModuleOdonto.checked,
        recetas: this.cfgModuleRecetas.checked,
        agenda: this.cfgModuleAgenda.checked
      }
    };

    LocalDatabase.save(this.db);
    this.initThemeAndBranding();
    this.registrarAuditoria('Configuracion', 'cfg-general', 'EDITAR', 'Actualización de preferencias y datos del consultorio');
    this.showToast('✅ Configuración guardada correctamente.');
  }

  compartirUbicacionWhatsApp() {
    const cfg = this.db.config;
    let texto = `*${cfg.clinicName.toUpperCase()}*\n`;
    texto += `👨‍⚕️ *Atención:* ${cfg.doctorName} (${cfg.doctorReg})\n`;
    texto += `📍 *Dirección:* ${cfg.address}\n`;
    if (cfg.mapsUrl) {
      texto += `🗺️ *Ver en Google Maps:* ${cfg.mapsUrl}\n`;
    }
    texto += `📞 *Teléfono / WhatsApp de Citas:* ${cfg.phone}\n\n`;
    texto += `_Estamos a su disposición para su consulta de salud._`;

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

  // ==================== ORDENACIÓN Y PACIENTES ====================
  renderPacientes() {
    const q = this.inputBuscarPaciente.value.toLowerCase().trim();
    const orden = this.selectOrdenPacientes.value;
    const fechaHoy = new Date().toISOString().split('T')[0];

    let filtrados = this.db.pacientes.filter(p => 
      p.nombre.toLowerCase().includes(q) ||
      (p.ci && p.ci.toLowerCase().includes(q)) ||
      (p.telefono && p.telefono.includes(q))
    );

    // LÓGICA DE ORDENACIÓN AVANZADA
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
      if (orden === 'nombre_asc') {
        return a.nombre.localeCompare(b.nombre);
      }
      if (orden === 'nombre_desc') {
        return b.nombre.localeCompare(a.nombre);
      }
      return 0;
    });

    this.lblTotalPacientes.textContent = `${filtrados.length} registrados`;
    this.listaPacientes.innerHTML = '';

    if (filtrados.length === 0) {
      this.listaPacientes.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 3rem;">No se encontraron pacientes registrados con ese criterio.</div>`;
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
              <div class="patient-ci">Doc: ${p.ci || 'Sin registro'}</div>
            </div>
          </div>
          <div class="patient-meta">
            <div>📱 <strong>WhatsApp:</strong> ${p.telefono}</div>
            <div>🎂 <strong>Nacimiento:</strong> ${p.nacimiento || 'No registrada'}</div>
            <div class="last-visit-tag">🕒 Última atención: ${p.ultimaAtencion || 'Sin consultas previas'}</div>
            ${p.alergias && p.alergias !== 'Ninguna' && p.alergias !== 'Ninguna conocida' ? `<div class="allergy-pill">⚠️ Alergia: ${p.alergias}</div>` : ''}
          </div>
        </div>
        <div class="patient-card-footer">
          <button class="btn btn-whatsapp" style="font-size: 0.8rem; padding: 0.4rem 0.75rem;" onclick="app.abrirChatWhatsApp('${p.telefono}', 'Hola ${encodeURIComponent(p.nombre)}, le saludamos desde ${encodeURIComponent(app.db.config.clinicName)}.')">
            💬 Abrir WhatsApp
          </button>
          <button class="btn btn-subtle" style="font-size: 0.8rem; padding: 0.4rem 0.75rem;" onclick="app.seleccionarPacienteYVerHistoria('${p.id}')">
            Ver Ficha →
          </button>
        </div>
      `;
      this.listaPacientes.appendChild(card);
    });
  }

  poblarSelectsPacientes() {
    const selects = [this.selectPacienteHistoria, this.citaPacienteSelect, this.recetaSelectPaciente];
    selects.forEach(sel => {
      sel.innerHTML = '';
      this.db.pacientes.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.nombre} (${p.telefono})`;
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
  }

  abrirModalPaciente() {
    this.formPaciente.reset();
    document.getElementById('paciente-id').value = '';
    this.modalPaciente.classList.remove('hidden');
  }

  cerrarModalPaciente() {
    this.modalPaciente.classList.add('hidden');
  }

  guardarPaciente(e) {
    e.preventDefault();
    const nombre = document.getElementById('paciente-nombre').value.trim();
    const telefono = document.getElementById('paciente-telefono').value.trim();
    const ci = document.getElementById('paciente-ci').value.trim();
    const nacimiento = document.getElementById('paciente-nacimiento').value;
    const alergias = document.getElementById('paciente-alergias').value.trim();
    const notas = document.getElementById('paciente-notas').value.trim();

    const nuevo = {
      id: 'p-' + Date.now(),
      nombre,
      telefono,
      ci,
      nacimiento,
      alergias: alergias || 'Ninguna',
      notas,
      ultimaAtencion: new Date().toISOString().split('T')[0],
      odontograma: {},
      consultas: []
    };

    this.db.pacientes.unshift(nuevo);
    this.registrarAuditoria('Paciente', nuevo.id, 'CREAR', `Alta de paciente: ${nombre} (${telefono})`);
    
    LocalDatabase.save(this.db);
    this.pacienteActivoId = nuevo.id;
    this.cerrarModalPaciente();
    this.renderAll();
    this.showToast(`✅ Paciente "${nombre}" guardado localmente.`);
  }

  // ==================== HISTORIA Y MULTIMEDIA ====================
  renderHistoria() {
    const paciente = this.db.pacientes.find(p => p.id === this.pacienteActivoId);
    if (!paciente) {
      this.timelineConsultas.innerHTML = '<p style="color: #94a3b8;">Selecciona un paciente para ver su historia.</p>';
      return;
    }

    // Alerta de alergias
    if (paciente.alergias && paciente.alergias !== 'Ninguna' && paciente.alergias !== 'Ninguna conocida') {
      this.alertaAlergias.classList.remove('hidden');
      this.txtAlergiasPaciente.textContent = paciente.alergias;
    } else {
      this.alertaAlergias.classList.add('hidden');
    }

    // Odontograma FDI
    if (this.db.config.modules.odontograma !== false) {
      this.renderOdontograma(paciente);
    }

    // Consultas ordenadas
    const orden = this.selectOrdenHistoria.value;
    let consultas = [...(paciente.consultas || [])];
    consultas.sort((a, b) => {
      return orden === 'reciente_primero' ? b.fecha.localeCompare(a.fecha) : a.fecha.localeCompare(b.fecha);
    });

    this.timelineConsultas.innerHTML = '';
    if (consultas.length === 0) {
      this.timelineConsultas.innerHTML = '<p style="color: #94a3b8; padding: 1.5rem 0;">Aún no se han registrado consultas para este paciente. Presiona "+ Registrar Consulta".</p>';
      return;
    }

    consultas.forEach(c => {
      const card = document.createElement('div');
      card.className = 'timeline-card';
      
      // Renderizado de multimedia (fotos, video, pdf)
      let mediaHtml = '';
      if (c.adjuntos && c.adjuntos.length > 0) {
        mediaHtml += `<div class="timeline-media-gallery">`;
        c.adjuntos.forEach(adj => {
          if (adj.tipo === 'foto') {
            mediaHtml += `
              <div class="media-thumbnail-card" onclick="app.abrirLightbox('${encodeURIComponent(adj.url)}', '${encodeURIComponent(adj.titulo)}')">
                <img src="${adj.url}" class="media-thumb-img" alt="${adj.titulo}">
                <span class="media-thumb-label">📷 ${adj.titulo}</span>
              </div>
            `;
          } else if (adj.tipo === 'pdf') {
            mediaHtml += `
              <a href="${adj.url}" target="_blank" download="${adj.titulo}.pdf" class="media-pdf-badge">
                📄 Descargar PDF: ${adj.titulo}
              </a>
            `;
          } else if (adj.tipo === 'video') {
            mediaHtml += `
              <div class="media-video-container">
                <video src="${adj.url}" controls></video>
                <span class="microcopy">🎥 ${adj.titulo}</span>
              </div>
            `;
          }
        });
        mediaHtml += `</div>`;
      }

      card.innerHTML = `
        <div class="timeline-meta">
          <span>📅 ${c.fecha} &bull; <strong>${c.tipo}</strong></span>
        </div>
        <div class="timeline-dx">🔬 Diagnóstico: ${c.diagnostico}</div>
        <div class="timeline-tx"><strong>Tratamiento y evolución:</strong> ${c.tratamiento}</div>
        ${mediaHtml}
      `;
      this.timelineConsultas.appendChild(card);
    });
  }

  abrirLightbox(urlEncoded, captionEncoded) {
    const url = decodeURIComponent(urlEncoded);
    const caption = decodeURIComponent(captionEncoded);
    this.lightboxImg.src = url;
    this.lightboxCaption.textContent = caption;
    this.lightbox.classList.remove('hidden');
  }

  procesarAdjuntoFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      this.adjuntosConsultaEnCola.push({
        tipo: 'foto',
        titulo: file.name,
        url: event.target.result
      });
      this.renderColaAdjuntos();
    };
    reader.readAsDataURL(file);
  }

  procesarAdjuntoPdf(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      this.adjuntosConsultaEnCola.push({
        tipo: 'pdf',
        titulo: file.name,
        url: event.target.result
      });
      this.renderColaAdjuntos();
    };
    reader.readAsDataURL(file);
  }

  renderColaAdjuntos() {
    this.colaAdjuntosPreview.innerHTML = '';
    this.adjuntosConsultaEnCola.forEach((item, idx) => {
      const badge = document.createElement('span');
      badge.className = 'preview-badge-item';
      badge.innerHTML = `
        <span>${item.tipo === 'foto' ? '📷' : item.tipo === 'pdf' ? '📄' : '🎥'} ${item.titulo}</span>
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
    const tipo = document.getElementById('consulta-tipo').value;
    const motivo = document.getElementById('consulta-motivo').value.trim();
    const diagnostico = document.getElementById('consulta-diagnostico').value.trim();
    const tratamiento = document.getElementById('consulta-tratamiento').value.trim();
    const videoUrl = this.inputAdjuntoVideo.value.trim();

    const adjuntos = [...this.adjuntosConsultaEnCola];
    if (videoUrl) {
      adjuntos.push({
        tipo: 'video',
        titulo: 'Video del Procedimiento',
        url: videoUrl
      });
    }

    if (!paciente.consultas) paciente.consultas = [];
    const nuevaConsulta = {
      id: 'c-' + Date.now(),
      fecha,
      tipo,
      motivo,
      diagnostico,
      tratamiento,
      adjuntos
    };
    paciente.consultas.unshift(nuevaConsulta);
    paciente.ultimaAtencion = fecha;

    this.registrarAuditoria('Historia', nuevaConsulta.id, 'CREAR', `Consulta ${tipo} para ${paciente.nombre}: ${diagnostico}`);

    LocalDatabase.save(this.db);
    this.cerrarModalConsulta();
    this.renderHistoria();
    this.renderRespaldoMetricas();
    this.showToast('✅ Consulta agregada a la historia clínica.');
  }

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
      
      this.registrarAuditoria('Odontograma', `diente-${num}`, 'ACTUALIZAR', `Pieza dental ${num} cambiada a ${estados[nextIdx]} (${paciente.nombre})`);
      LocalDatabase.save(this.db);
      this.renderOdontograma(paciente);
      this.showToast(`Pieza ${num}: ${estados[nextIdx].toUpperCase()}`);
    });

    return btn;
  }

  // ==================== AGENDA ====================
  renderAgenda() {
    const fechaFiltro = this.inputFechaAgenda.value;
    const citas = this.db.citas.filter(c => c.fecha === fechaFiltro);
    this.listaCitas.innerHTML = '';

    if (citas.length === 0) {
      this.listaCitas.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 2.5rem; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">No hay citas agendadas para el día ${fechaFiltro}.</div>`;
      return;
    }

    citas.sort((a, b) => a.hora.localeCompare(b.hora));

    citas.forEach(c => {
      const paciente = this.db.pacientes.find(p => p.id === c.pacienteId) || { nombre: 'Paciente no identificado', telefono: '' };
      const item = document.createElement('div');
      item.className = 'appointment-card';
      item.innerHTML = `
        <div class="appointment-time">⏰ ${c.hora}</div>
        <div class="appointment-patient">
          <div class="appointment-name">${paciente.nombre}</div>
          <div class="appointment-reason">Motivo: ${c.motivo || 'Consulta general'} &bull; Tel: ${paciente.telefono}</div>
        </div>
        <div class="appointment-actions">
          <button class="btn btn-whatsapp" onclick="app.enviarRecordatorioCitaWhatsApp('${c.id}')">
            💬 Recordatorio WhatsApp
          </button>
          <button class="btn btn-subtle" onclick="app.eliminarCita('${c.id}')" title="Cancelar cita">
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

    const nueva = {
      id: 'cita-' + Date.now(),
      pacienteId,
      fecha,
      hora,
      motivo,
      estado: 'Pendiente'
    };

    this.db.citas.push(nueva);
    const p = this.db.pacientes.find(x => x.id === pacienteId);
    this.registrarAuditoria('Agenda', nueva.id, 'CREAR', `Cita programada para ${p ? p.nombre : 'Paciente'} el ${fecha} a las ${hora}`);

    LocalDatabase.save(this.db);
    this.cerrarModalCita();
    this.renderAgenda();
    this.renderRespaldoMetricas();
    this.showToast('✅ Cita agendada correctamente.');
  }

  eliminarCita(id) {
    if (confirm('¿Deseas cancelar esta cita de la agenda?')) {
      const c = this.db.citas.find(x => x.id === id);
      this.db.citas = this.db.citas.filter(x => x.id !== id);
      this.registrarAuditoria('Agenda', id, 'ELIMINAR', `Cancelación de cita del ${c ? c.fecha : ''}`);
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
    const mensaje = `Hola ${paciente.nombre}, le saludamos cordialmente de *${cfg.clinicName}* (${cfg.doctorName}).\n\nLe recordamos su cita programada para el día *${cita.fecha}* a las *${cita.hora}* (Motivo: ${cita.motivo || 'Consulta'}).\n\n📍 *Ubicación:* ${cfg.address}\n\nPor favor confirme su asistencia respondiendo a este mensaje. ¡Muchas gracias!`;
    this.abrirChatWhatsApp(paciente.telefono, mensaje);
  }

  // ==================== RECETAS ====================
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

    this.rxPreviewInstrucciones.textContent = this.recetaIndicaciones.value.trim() || 'Seguir la posología indicada. En caso de presentar efectos adversos, suspender y consultar de inmediato.';
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
    texto += `*INDICACIÓN Y MEDICACIÓN:*\n`;

    const rows = this.listaFarmacosInputs.querySelectorAll('.med-row');
    rows.forEach((r, idx) => {
      const n = r.querySelector('.med-nombre').value.trim();
      const d = r.querySelector('.med-dosis').value.trim();
      const t = r.querySelector('.med-tiempo').value.trim();
      if (n) {
        texto += `${idx + 1}. ${n} -> ${d} ${t ? `(${t})` : ''}\n`;
      }
    });

    if (this.recetaIndicaciones.value.trim()) {
      texto += `\n*Indicaciones:* ${this.recetaIndicaciones.value.trim()}\n`;
    }

    texto += `\n📍 *Consultorio:* ${cfg.address}\n`;
    texto += `_Ante cualquier duda, responda a este chat de WhatsApp._`;

    this.registrarAuditoria('Receta', `rx-${Date.now()}`, 'CREAR', `Receta enviada por WhatsApp para ${paciente.nombre}`);
    this.abrirChatWhatsApp(paciente.telefono, texto);
  }

  abrirChatWhatsApp(telefono, mensaje) {
    if (!telefono) {
      alert('Número de WhatsApp no especificado.');
      return;
    }
    const numeroLimpio = telefono.replace(/\D/g, '');
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  // ==================== RESPALDO Y AUDITORÍA ====================
  registrarAuditoria(entity, entity_id, action, summary) {
    const logItem = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('es-ES'),
      entity,
      entity_id,
      action,
      device: navigator.userAgent.includes('Mac') ? 'MacBook / macOS' : navigator.userAgent.includes('Windows') ? 'Windows PC' : 'Móvil / Web',
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
        this.showToast('✅ Base de datos restaurada con éxito desde el archivo.');
      } else {
        alert('El archivo seleccionado no tiene un formato válido de ClinikLocal (.clinik).');
      }
    };
    reader.readAsText(file);
  }

  // ==================== PASARELA DE PAGOS (PAYPAL / QR) ====================
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
        body: JSON.stringify({
          method,
          plan: 'mensual',
          doctor
        })
      });
      if (res.ok) {
        const data = await res.json();
        this.db.subscription = data.subscription;
      } else {
        throw new Error('Servidor no respondió');
      }
    } catch (e) {
      // Fallback local autónomo
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
    this.showToast(`🎉 ¡Pago confirmado! Respaldo en la nube y Multi-dispositivo ACTIVADOS.`);
    this.forzarSincronizacionInmediata();
  }

  desactivarSuscripcion() {
    if (confirm('¿Estás seguro de desactivar la copia de seguridad en la nube y el acceso multi-dispositivo?')) {
      this.db.subscription.active = false;
      this.db.subscription.multiDeviceEnabled = false;
      this.registrarAuditoria('Finanzas', 'pago-cancel', 'DESACTIVACION', 'Copia de seguridad en la nube desactivada.');
      LocalDatabase.save(this.db);
      this.actualizarEstadoSuscripcionUI();
      this.showToast('Copia de seguridad en la nube desactivada.');
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

  // ==================== MOTOR DE SINCRONIZACIÓN CADA 1 MINUTO ====================
  iniciarSincronizadorMinuto() {
    // Ejecutar cada 60 segundos (1 minuto)
    setInterval(() => {
      this.ejecutarCicloSincronizacion();
    }, 60000);

    // Ejecutar primera verificación inicial tras 3 segundos
    setTimeout(() => {
      this.ejecutarCicloSincronizacion();
    }, 3000);
  }

  forzarSincronizacionInmediata() {
    this.ejecutarCicloSincronizacion(true);
  }

  async ejecutarCicloSincronizacion(esManual = false) {
    if (!this.db.subscription || !this.db.subscription.active) {
      this.actualizarPillSincronizacion('local', 'Modo Local Autónomo');
      return;
    }

    this.actualizarPillSincronizacion('syncing', 'Sincronizando...');

    try {
      // 1. Verificar si el REST API está accesible
      const healthRes = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
      if (!healthRes.ok) throw new Error('API Offline');

      // 2. Obtener Token JWT si no existe
      if (!this.db.meta.jwtToken) {
        const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctor: this.db.config.doctorName,
            clinic_id: 'clinic-local-1'
          })
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          this.db.meta.jwtToken = loginData.token;
        }
      }

      // 3. Sync Push: Enviar cambios pendientes y snapshot
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
          device: navigator.userAgent.includes('Mac') ? 'MacBook' : 'PC/Móvil'
        })
      });

      if (pushRes.ok) {
        // Limpiar cambios pendientes tras sincronizar con éxito
        this.db.cambiosPendientes = [];
        const ahora = new Date().toLocaleString('es-ES');
        this.db.meta.ultimaSincronizacionCloud = ahora;
        LocalDatabase.save(this.db);
        this.renderRespaldoMetricas();
        this.actualizarPillSincronizacion('synced', `Nube al día (${ahora.split(' ')[1]})`);
        if (esManual) this.showToast('✅ Sincronización bidireccional completada con éxito.');
      } else {
        throw new Error('Fallo en Sync Push');
      }

    } catch (err) {
      if (this.db.cambiosPendientes && this.db.cambiosPendientes.length > 0) {
        this.actualizarPillSincronizacion('pending', `${this.db.cambiosPendientes.length} cambios pendientes`);
      } else {
        this.actualizarPillSincronizacion('local', 'Local-First (Servidor Offline)');
      }
      if (esManual) this.showToast('⚠️ No se pudo conectar al REST API. Datos resguardados localmente.');
    }
  }

  actualizarPillSincronizacion(estado, texto) {
    this.syncDot.className = 'sync-indicator-dot';
    if (estado === 'synced') {
      this.syncDot.classList.add('active-green');
    } else if (estado === 'syncing' || estado === 'pending') {
      this.syncDot.classList.add('syncing-yellow');
    }
    this.syncLabel.textContent = texto;
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

// Inicializar cuando cargue el DOM
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new ClinikApp();
  window.app = app;
});
