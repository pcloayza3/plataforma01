package com.postylocal.app;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;
    private WebView webView;
    private String pendingVoiceTargetIndex = "0";

    private final ActivityResultLauncher<Intent> speechResultLauncher =
        registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                ArrayList<String> matches = result.getData().getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (matches != null && !matches.isEmpty()) {
                    String recognizedText = matches.get(0).replace("'", "\\'");
                    webView.post(() -> {
                        webView.evaluateJavascript("if (window.onNativeVoiceDictated) { window.onNativeVoiceDictated('" + pendingVoiceTargetIndex + "', '" + recognizedText + "'); }", null);
                    });
                }
            }
        });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Previene que el contenido sobrepase la barra base de botones de Android (||| O <)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        webView = new WebView(this);
        setContentView(webView);

        // Ajuste dinámico de Insets del sistema (Status Bar + Navigation Bar)
        ViewCompat.setOnApplyWindowInsetsListener(webView, (v, insets) -> {
            int bottom = insets.getInsets(WindowInsetsCompat.Type.systemBars()).bottom;
            int top = insets.getInsets(WindowInsetsCompat.Type.systemBars()).top;
            v.setPadding(0, 0, 0, bottom);
            return insets;
        });

        requestAppPermissions();
        configureWebView();

        // Cargar Nota Feliz 100% offline y local desde assets
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setGeolocationEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Puente nativo JavaScript para Voz real y GPS satelital
        webView.addJavascriptInterface(new AndroidNativeBridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient());

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    // Otorgar permisos de captura de audio a la WebApp
                    request.grant(request.getResources());
                });
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                // Otorgar permisos de geolocalización local
                callback.invoke(origin, true, false);
            }
        });
    }

    private void requestAppPermissions() {
        List<String> permissions = new ArrayList<>();
        permissions.add(Manifest.permission.RECORD_AUDIO);
        permissions.add(Manifest.permission.MODIFY_AUDIO_SETTINGS);
        permissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS);
        }

        List<String> needed = new ArrayList<>();
        for (String perm : permissions) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                needed.add(perm);
            }
        }

        if (!needed.isEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    public class AndroidNativeBridge {

        @JavascriptInterface
        public void startVoiceDictation(String targetIndex) {
            pendingVoiceTargetIndex = targetIndex;
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "es-ES");
                    intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Dicte su nota para Nota Feliz...");
                    speechResultLauncher.launch(intent);
                } catch (Exception e) {
                    webView.evaluateJavascript("alert('El servicio de voz de Android no está disponible o requiere activación.');", null);
                }
            });
        }

        @JavascriptInterface
        public void getRealGPSLocation(String placeName) {
            runOnUiThread(() -> {
                try {
                    LocationManager lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
                    if (lm == null) return;

                    boolean hasFine = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
                    if (!hasFine) {
                        requestAppPermissions();
                        return;
                    }

                    Location bestLocation = null;
                    if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                        bestLocation = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                    }
                    if (bestLocation == null && lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                        bestLocation = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                    }

                    if (bestLocation != null) {
                        double lat = bestLocation.getLatitude();
                        double lng = bestLocation.getLongitude();
                        float acc = bestLocation.getAccuracy();
                        sendGpsToWebView(placeName, lat, lng, acc);
                    } else {
                        // Solicitar actualización única fresca de ubicación
                        LocationListener listener = new LocationListener() {
                            @Override
                            public void onLocationChanged(Location loc) {
                                lm.removeUpdates(this);
                                sendGpsToWebView(placeName, loc.getLatitude(), loc.getLongitude(), loc.getAccuracy());
                            }
                            @Override public void onStatusChanged(String provider, int status, Bundle extras) {}
                            @Override public void onProviderEnabled(String provider) {}
                            @Override public void onProviderDisabled(String provider) {}
                        };
                        if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                            lm.requestSingleUpdate(LocationManager.GPS_PROVIDER, listener, null);
                        } else if (lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                            lm.requestSingleUpdate(LocationManager.NETWORK_PROVIDER, listener, null);
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        private void sendGpsToWebView(String place, double lat, double lng, float acc) {
            webView.post(() -> {
                String js = String.format(java.util.Locale.US,
                    "if (window.onNativeGPSReceived) { window.onNativeGPSReceived('%s', %.6f, %.6f, %.1f); }",
                    place, lat, lng, acc);
                webView.evaluateJavascript(js, null);
            });
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
