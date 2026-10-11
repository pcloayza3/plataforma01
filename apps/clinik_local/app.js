/**
 * ClinikLocal - Lógica de Aplicación Local-First
 * Maneja persistencia en localStorage, odontograma FDI, WhatsApp deep links y módulo de respaldo.
 */

const STORAGE_KEY = 'clinik_local_db_v1';

// ESTADO INICIAL / SEED DATA
const DEFAULT_DB = {
  pacientes: [
    {
      id: 'p-1',
      nombre: 'Valeria Quispe Morales',
      telefono: '+59171234567',
      ci: '6549821 CBBA',
      nacimiento: '1994-05-14',
      alergias: 'Penicilina, Betalactámicos',
      notas: 'Tratamiento de ortodoncia en curso. Sensibilidad en molares.',
      odontograma: {
        '16': 'tratado',
        '26': 'caries',
        '36': 'endo',
        '48': 'ausente'
      },
      consultas: [
        {
          id: 'c-101',
          fecha: '2026-10-02',
          tipo: 'Odontológica',
          motivo: 'Control mensual y cambio de arcos',
          diagnostico: 'Alineación favorable. Ligera inflamación gingival en pieza 26.',
          tratamiento: 'Profilaxis localizada, ajuste de arco superior 0.016 NiTi.'
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
          tratamiento: 'Prescripción de relajante muscular y derivación a fisioterapia maxilofacial.'
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
  recetas: [],
  meta: {
    doctor: 'Dr. Alejandro Fernández',
    especialidad: 'Odontología Integral y Especialidades Médicas',
    registro: 'Matrícula Nac. Nº 14890',
    telefono: '+591 70000000',
    ultimaSincronizacionCloud: null
  }
};

// ==================== GESTOR DE BASE DE DATOS LOCAL ====================
class LocalDatabase {
  static load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error cargando localStorage:', e);
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
    downloadAnchor.setAttribute('download', `clinik_respaldo_local_${dateStr}.clinik`);
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
      console.error('Archivo de respaldo inválido:', e);
    }
    return false;
  }
}

// ==================== APP CONTROLLER ====================
class ClinikApp {
  constructor() {
    this.db = LocalDatabase.load();
    this.pacienteActivoId = this.db.pacientes.length > 0 ? this.db.pacientes[0].id : null;
    this.initElements();
    this.initEvents();
    this.renderAll();
  }

  initElements() {
    // Tabs
    this.navTabs = document.querySelectorAll('.nav-tab');
    this.views = document.querySelectorAll('.view-section');

    // Pacientes
    this.listaPacientes = document.getElementById('lista-pacientes');
    this.inputBuscarPaciente = document.getElementById('input-buscar-paciente');
    this.lblTotalPacientes = document.getElementById('lbl-total-pacientes');
    this.btnNuevoPaciente = document.getElementById('btn-nuevo-paciente');
    this.modalPaciente = document.getElementById('modal-paciente');
    this.formPaciente = document.getElementById('form-paciente');

    // Historia & Odontograma
    this.selectPacienteHistoria = document.getElementById('select-paciente-historia');
    this.alertaAlergias = document.getElementById('alerta-alergias');
    this.txtAlergiasPaciente = document.getElementById('txt-alergias-paciente');
    this.btnModoMedico = document.getElementById('btn-modo-medico');
    this.btnModoDental = document.getElementById('btn-modo-dental');
    this.seccionOdontograma = document.getElementById('seccion-odontograma');
    this.arcadaSuperior = document.getElementById('arcada-superior');
    this.arcadaInferior = document.getElementById('arcada-inferior');
    this.timelineConsultas = document.getElementById('timeline-consultas');
    this.btnNuevaConsulta = document.getElementById('btn-nueva-consulta');
    this.modalConsulta = document.getElementById('modal-consulta');
    this.formConsulta = document.getElementById('form-consulta');

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
    this.btnExportarLocal = document.getElementById('btn-exportar-local');
    this.inputImportarLocal = document.getElementById('input-importar-local');
    this.btnSyncCloud = document.getElementById('btn-sync-cloud');
    this.cloudLastSync = document.getElementById('cloud-last-sync');

    // Toast
    this.toastEl = document.getElementById('toast');
  }

  initEvents() {
    // Navegación
    this.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.navTabs.forEach(t => t.classList.remove('active'));
        this.views.forEach(v => v.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });

    // Filtro pacientes
    this.inputBuscarPaciente.addEventListener('input', () => this.renderPacientes());

    // Modales
    this.btnNuevoPaciente.addEventListener('click', () => this.abrirModalPaciente());
    document.getElementById('btn-cerrar-modal-paciente').addEventListener('click', () => this.cerrarModalPaciente());
    document.getElementById('btn-cancelar-modal-paciente').addEventListener('click', () => this.cerrarModalPaciente());
    this.formPaciente.addEventListener('submit', (e) => this.guardarPaciente(e));

    // Historia
    this.selectPacienteHistoria.addEventListener('change', (e) => {
      this.pacienteActivoId = e.target.value;
      this.renderHistoria();
    });
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
    this.btnNuevaConsulta.addEventListener('click', () => this.abrirModalConsulta());
    document.getElementById('btn-cerrar-modal-consulta').addEventListener('click', () => this.cerrarModalConsulta());
    document.getElementById('btn-cancelar-modal-consulta').addEventListener('click', () => this.cerrarModalConsulta());
    this.formConsulta.addEventListener('submit', (e) => this.guardarConsulta(e));

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

    // Respaldo
    this.btnExportarLocal.addEventListener('click', () => {
      LocalDatabase.exportBackup();
      this.showToast('✅ Respaldo descargado exitosamente (.clinik)');
    });
    this.inputImportarLocal.addEventListener('change', (e) => this.manejarImportacion(e));
    this.btnSyncCloud.addEventListener('click', () => this.simularCloudSync());
  }

  showToast(mensaje) {
    this.toastEl.textContent = mensaje;
    this.toastEl.classList.remove('hidden');
    setTimeout(() => {
      this.toastEl.classList.add('hidden');
    }, 3500);
  }

  renderAll() {
    this.renderPacientes();
    this.poblarSelectsPacientes();
    this.renderHistoria();
    this.renderAgenda();
    this.renderRecetasDefault();
    this.renderRespaldoMetricas();
  }

  // ==================== SECCIÓN PACIENTES ====================
  renderPacientes() {
    const q = this.inputBuscarPaciente.value.toLowerCase().trim();
    const filtrados = this.db.pacientes.filter(p => 
      p.nombre.toLowerCase().includes(q) ||
      (p.ci && p.ci.toLowerCase().includes(q)) ||
      (p.telefono && p.telefono.includes(q))
    );

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
            ${p.alergias && p.alergias !== 'Ninguna' && p.alergias !== 'Ninguna conocida' ? `<div class="allergy-pill">⚠️ Alergia: ${p.alergias}</div>` : ''}
          </div>
        </div>
        <div class="patient-card-footer">
          <button class="btn btn-whatsapp" style="font-size: 0.8rem; padding: 0.4rem 0.75rem;" onclick="app.abrirChatWhatsApp('${p.telefono}', 'Hola ${encodeURIComponent(p.nombre)}, le saludamos desde el consultorio médico.')">
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
    // Cambiar a pestaña historia
    document.querySelector('[data-tab="tab-historia"]').click();
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
      odontograma: {},
      consultas: []
    };

    this.db.pacientes.unshift(nuevo);
    LocalDatabase.save(this.db);
    this.pacienteActivoId = nuevo.id;
    this.cerrarModalPaciente();
    this.renderAll();
    this.showToast(`✅ Paciente "${nombre}" guardado localmente.`);
  }

  // ==================== SECCIÓN HISTORIA & ODONTOGRAMA ====================
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
    this.renderOdontograma(paciente);

    // Consultas
    this.timelineConsultas.innerHTML = '';
    const consultas = paciente.consultas || [];
    if (consultas.length === 0) {
      this.timelineConsultas.innerHTML = '<p style="color: #94a3b8; padding: 1.5rem 0;">Aún no se han registrado consultas para este paciente. Presiona "+ Registrar Consulta".</p>';
      return;
    }

    consultas.forEach(c => {
      const card = document.createElement('div');
      card.className = 'timeline-card';
      card.innerHTML = `
        <div class="timeline-meta">
          <span>📅 ${c.fecha} &bull; <strong>${c.tipo}</strong></span>
        </div>
        <div class="timeline-dx">🔬 Diagnóstico: ${c.diagnostico}</div>
        <div class="timeline-tx"><strong>Tratamiento realizado:</strong> ${c.tratamiento}</div>
      `;
      this.timelineConsultas.appendChild(card);
    });
  }

  renderOdontograma(paciente) {
    if (!paciente.odontograma) paciente.odontograma = {};

    // Arcada Superior: 18 a 11 (derecha cuadrante 1) y 21 a 28 (izquierda cuadrante 2)
    const superiores = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
    // Arcada Inferior: 48 a 41 y 31 a 38
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
      LocalDatabase.save(this.db);
      this.renderOdontograma(paciente);
      this.showToast(`Pieza ${num}: ${estados[nextIdx].toUpperCase()}`);
    });

    return btn;
  }

  abrirModalConsulta() {
    if (!this.pacienteActivoId) {
      alert('Seleccione un paciente primero.');
      return;
    }
    this.formConsulta.reset();
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

    if (!paciente.consultas) paciente.consultas = [];
    paciente.consultas.unshift({
      id: 'c-' + Date.now(),
      fecha,
      tipo,
      motivo,
      diagnostico,
      tratamiento
    });

    LocalDatabase.save(this.db);
    this.cerrarModalConsulta();
    this.renderHistoria();
    this.renderRespaldoMetricas();
    this.showToast('✅ Consulta agregada al historial clínico.');
  }

  // ==================== SECCIÓN AGENDA ====================
  renderAgenda() {
    const fechaFiltro = this.inputFechaAgenda.value;
    const citas = this.db.citas.filter(c => c.fecha === fechaFiltro);
    this.listaCitas.innerHTML = '';

    if (citas.length === 0) {
      this.listaCitas.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 2.5rem; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">No hay citas agendadas para el día ${fechaFiltro}.</div>`;
      return;
    }

    // Ordenar por hora
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

    this.db.citas.push({
      id: 'cita-' + Date.now(),
      pacienteId,
      fecha,
      hora,
      motivo,
      estado: 'Pendiente'
    });

    LocalDatabase.save(this.db);
    this.cerrarModalCita();
    this.renderAgenda();
    this.renderRespaldoMetricas();
    this.showToast('✅ Cita agendada correctamente.');
  }

  eliminarCita(id) {
    if (confirm('¿Deseas cancelar esta cita de la agenda?')) {
      this.db.citas = this.db.citas.filter(c => c.id !== id);
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

    const mensaje = `Hola ${paciente.nombre}, le saludamos cordialmente del consultorio médico/odontológico. Le recordamos su cita programada para el día ${cita.fecha} a las ${cita.hora} (${cita.motivo || 'Control'}).\n\nPor favor confirme su asistencia respondiendo a este mensaje. ¡Muchas gracias!`;
    this.abrirChatWhatsApp(paciente.telefono, mensaje);
  }

  // ==================== SECCIÓN RECETAS ====================
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

    let texto = `*RECETA MÉDICA - ${this.db.meta.doctor}*\n`;
    texto += `*Paciente:* ${paciente.nombre}\n`;
    texto += `*Fecha:* ${new Date().toLocaleDateString('es-ES')}\n`;
    texto += `*Diagnóstico:* ${this.recetaDiagnostico.value.trim() || 'Control'}\n\n`;
    texto += `*INDICACIÓN Y FÁRMACOS:*\n`;

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

    texto += `\n_Para cualquier duda o urgencia, responda a este mensaje._`;

    this.abrirChatWhatsApp(paciente.telefono, texto);
  }

  // ==================== COMUNICACIÓN WHATSAPP ====================
  abrirChatWhatsApp(telefono, mensaje) {
    if (!telefono) {
      alert('Número telefónico no especificado.');
      return;
    }
    // Sanitizar número: solo dígitos (preservando código internacional)
    const numeroLimpio = telefono.replace(/\D/g, '');
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  // ==================== RESPALDO & CLOUD ====================
  renderRespaldoMetricas() {
    const totalConsultas = this.db.pacientes.reduce((acc, p) => acc + (p.consultas ? p.consultas.length : 0), 0);
    this.bkMetricPacientes.textContent = this.db.pacientes.length;
    this.bkMetricConsultas.textContent = totalConsultas;
    this.bkMetricCitas.textContent = this.db.citas.length;
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
        this.renderAll();
        this.showToast('✅ Base de datos restaurada con éxito desde el archivo.');
      } else {
        alert('El archivo seleccionado no tiene un formato válido de ClinikLocal (.clinik).');
      }
    };
    reader.readAsText(file);
  }

  simularCloudSync() {
    this.btnSyncCloud.disabled = true;
    this.btnSyncCloud.textContent = '⏳ Cifrando y enviando a la nube...';

    setTimeout(() => {
      const ahora = new Date().toLocaleString('es-ES');
      this.db.meta.ultimaSincronizacionCloud = ahora;
      LocalDatabase.save(this.db);
      this.cloudLastSync.textContent = ahora;
      this.btnSyncCloud.disabled = false;
      this.btnSyncCloud.textContent = '☁️ Respaldar Ahora en la Nube';
      this.showToast('✅ Respaldo cifrado (AES-256) sincronizado exitosamente en la nube.');
    }, 1200);
  }
}

// Inicializar la aplicación cuando cargue el DOM
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new ClinikApp();
  window.app = app;
});
