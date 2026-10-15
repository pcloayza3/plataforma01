package com.postylocal.app;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.media.MediaRecorder;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.util.Base64;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.view.WindowCompat;
import java.io.File;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;
    private WebView webView;
    private String pendingVoiceTargetIndex = "0";

    // Grabación nativa de audio de Android (Hardware de Micrófono)
    private MediaRecorder nativeRecorder = null;
    private File currentAudioFile = null;
    private long recordingStartTime = 0;

    // Lanzador nativo de reconocimiento de voz del sistema Android
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

        // Ajusta la ventana para que NO se superponga con la barra de navegación de Android (||| O <)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        webView = new WebView(this);
        setContentView(webView);

        requestAppPermissions();
        configureWebView();

        // Carga 100% local y offline desde los assets del APK (sin dependencia de red)
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setGeolocationEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // Fallback de contingencia si falla alguna ruta
                view.loadUrl("file:///android_asset/index.html");
            }
        });

        // Puente nativo JavaScript para Voz real, Grabación real y GPS satelital
        webView.addJavascriptInterface(new AndroidNativeBridge(), "AndroidBridge");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    // Otorgar permisos nativos de hardware
                    request.grant(request.getResources());
                });
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
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
                    webView.evaluateJavascript("alert('El servicio de voz del celular no está disponible.');", null);
                }
            });
        }

        // Grabación física con el micrófono del celular (MediaRecorder nativo)
        @JavascriptInterface
        public void startNativeAudioRecording() {
            runOnUiThread(() -> {
                try {
                    if (nativeRecorder != null) {
                        try { nativeRecorder.stop(); } catch (Exception ignored) {}
                        nativeRecorder.release();
                        nativeRecorder = null;
                    }
                    currentAudioFile = new File(getCacheDir(), "audio_" + System.currentTimeMillis() + ".m4a");
                    nativeRecorder = new MediaRecorder();
                    nativeRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
                    nativeRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
                    nativeRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
                    nativeRecorder.setAudioEncodingBitRate(64000);
                    nativeRecorder.setAudioSamplingRate(44100);
                    nativeRecorder.setOutputFile(currentAudioFile.getAbsolutePath());
                    nativeRecorder.prepare();
                    nativeRecorder.start();
                    recordingStartTime = System.currentTimeMillis();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        @JavascriptInterface
        public void stopNativeAudioRecording(String targetIndexStr) {
            runOnUiThread(() -> {
                try {
                    if (nativeRecorder != null) {
                        nativeRecorder.stop();
                        nativeRecorder.release();
                        nativeRecorder = null;

                        long durationSec = Math.max(1, (System.currentTimeMillis() - recordingStartTime) / 1000);
                        byte[] bytes = Files.readAllBytes(currentAudioFile.toPath());
                        String base64 = Base64.encodeToString(bytes, Base64.NO_WRAP);
                        String dataUrl = "data:audio/mp4;base64," + base64;
                        String durStr = String.format(java.util.Locale.US, "0:%02d", durationSec);

                        webView.evaluateJavascript(
                            String.format("if (window.onNativeAudioRecorded) { window.onNativeAudioRecorded('%s', '%s', '%s'); }",
                            targetIndexStr, durStr, dataUrl), null
                        );
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        // Obtener GPS real del hardware del celular
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
                        sendGpsToWebView(placeName, bestLocation.getLatitude(), bestLocation.getLongitude(), bestLocation.getAccuracy());
                    } else {
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
