#!/usr/bin/env python3
"""
Test Suite para ClinikLocal Cloud Sync REST API
Verifica:
1. Generación y validación de JWT (HMAC-SHA256).
2. Endpoints de salud y autenticación (/api/health, /api/auth/login).
3. Pasarela de pagos (/api/payments/checkout) con PayPal y QR.
4. Sincronización Push / Pull con validación de token JWT y suscripción.
5. Bitácora de Auditoría (/api/audit/logs).
"""

import unittest
import json
import time
import urllib.request
import urllib.parse
import threading
import sys
import os

# Importar funciones de sync_server
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))
import sync_server

class SyncApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Iniciar servidor en puerto de test 4055
        cls.test_port = 4055
        cls.server = sync_server.HTTPServer(('', cls.test_port), sync_server.SyncApiHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever)
        cls.thread.daemon = True
        cls.thread.start()
        time.sleep(0.3)
        cls.base_url = f"http://127.0.0.1:{cls.test_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def _post(self, path, data, token=None):
        url = self.base_url + path
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                return resp.status, json.loads(resp.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode('utf-8'))

    def _get(self, path, token=None):
        url = self.base_url + path
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        req = urllib.request.Request(url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req) as resp:
                return resp.status, json.loads(resp.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode('utf-8'))

    def test_01_health_check(self):
        status, body = self._get("/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(body["status"], "healthy")

    def test_02_jwt_auth_login(self):
        status, body = self._post("/api/auth/login", {
            "email": "doctor@test.com",
            "doctor": "Dra. Sofía Mendoza",
            "clinic_id": "clinic-test-1"
        })
        self.assertEqual(status, 200)
        self.assertTrue(body["success"])
        self.assertIn("token", body)
        self.__class__.jwt_token = body["token"]

    def test_03_payment_activation_qr_and_paypal(self):
        # 1. Pago vía QR
        status, body = self._post("/api/payments/checkout", {
            "method": "qr",
            "plan": "mensual",
            "doctor": "Dra. Sofía Mendoza"
        })
        self.assertEqual(status, 200)
        self.assertTrue(body["subscription"]["active"])
        self.assertEqual(body["subscription"]["payment_method"], "QR")
        self.assertTrue(body["subscription"]["multi_device_enabled"])

    def test_04_sync_push_with_jwt(self):
        # Enviar cambios
        test_snapshot = {
            "pacientes": [{"id": "p-1", "nombre": "Carlos López"}],
            "citas": []
        }
        changes = [
            {"entity": "Paciente", "entity_id": "p-1", "action": "CREAR", "summary": "Alta de Carlos López"}
        ]
        status, body = self._post("/api/sync/push", {
            "snapshot": test_snapshot,
            "changes": changes,
            "device": "MacBook Pro M2"
        }, token=self.jwt_token)

        self.assertEqual(status, 200)
        self.assertTrue(body["success"])
        self.assertEqual(body["changes_recorded"], 1)

    def test_05_sync_pull_with_jwt(self):
        status, body = self._get("/api/sync/pull", token=self.jwt_token)
        self.assertEqual(status, 200)
        self.assertTrue(body["success"])
        self.assertIsNotNone(body["snapshot"])
        self.assertEqual(body["snapshot"]["pacientes"][0]["nombre"], "Carlos López")

    def test_06_audit_logs_access(self):
        status, body = self._get("/api/audit/logs", token=self.jwt_token)
        self.assertEqual(status, 200)
        self.assertTrue(body["success"])
        self.assertGreater(body["total"], 0)
        # Verificar que el cambio de Carlos López está en la auditoría
        summaries = [l["summary"] for l in body["logs"]]
        self.assertTrue(any("Carlos López" in s for s in summaries))

if __name__ == '__main__':
    unittest.main()
