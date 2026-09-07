import { query } from "./index.js";

export class PaymentRepository {
  /**
   * Crear o registrar una transacción de custodia en la plataforma
   */
  static async createCustodyTransaction({
    id,
    projectId,
    milestoneId,
    studentId,
    consultantId,
    paymentMethod = "QR_SIMPLE",
    paymentOption = "MILESTONE",
    grossAmount,
    currency = "BOB",
    commissionRate,
    commissionAmount,
    netConsultantAmount,
    status = "EN_CUSTODIA_PLATAFORMA",
    metadata = {}
  }) {
    const text = `
      INSERT INTO platform_custody_transactions (
        id, project_id, milestone_id, student_id, consultant_id,
        payment_method, payment_option, gross_amount, currency,
        commission_rate, commission_amount, net_consultant_amount,
        status, funded_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), $14)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        funded_at = EXCLUDED.funded_at,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING *;
    `;
    const values = [
      id, projectId, milestoneId, studentId, consultantId,
      paymentMethod, paymentOption, grossAmount, currency,
      commissionRate, commissionAmount, netConsultantAmount,
      status, JSON.stringify(metadata)
    ];
    const res = await query(text, values);
    return res.rows[0];
  }

  /**
   * Obtener transacción de custodia por ID
   */
  static async getTransactionById(id) {
    const text = `
      SELECT t.*, 
             p.title AS project_title,
             m.title AS milestone_title,
             s.full_name AS student_name,
             c.full_name AS consultant_name
      FROM platform_custody_transactions t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN milestones m ON m.id = t.milestone_id
      LEFT JOIN users s ON s.id = t.student_id
      LEFT JOIN users c ON c.id = t.consultant_id
      WHERE t.id = $1;
    `;
    const res = await query(text, [id]);
    return res.rows[0] || null;
  }

  /**
   * Obtener transacciones de un proyecto
   */
  static async getTransactionsByProject(projectId) {
    const text = `
      SELECT * FROM platform_custody_transactions
      WHERE project_id = $1
      ORDER BY created_at DESC;
    `;
    const res = await query(text, [projectId]);
    return res.rows;
  }

  /**
   * Registrar desembolso / liquidación al consultor tras aprobación de hito
   */
  static async releaseToConsultant(transactionId, consultantAccount, payoutId) {
    // 1. Actualizar estado de transacción
    const updateTxText = `
      UPDATE platform_custody_transactions
      SET status = 'LIQUIDADO_AL_CONSULTOR',
          released_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    const txRes = await query(updateTxText, [transactionId]);
    const tx = txRes.rows[0];
    if (!tx) throw new Error(`Transacción de custodia ${transactionId} no encontrada.`);

    // 2. Registrar registro de pago
    const insertPayoutText = `
      INSERT INTO platform_payouts (
        id, transaction_id, consultant_id, amount, currency, consultant_account, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETADO')
      RETURNING *;
    `;
    const payoutRes = await query(insertPayoutText, [
      payoutId,
      transactionId,
      tx.consultant_id,
      tx.net_consultant_amount,
      tx.currency,
      consultantAccount
    ]);

    return {
      transaction: tx,
      payout: payoutRes.rows[0]
    };
  }
}
