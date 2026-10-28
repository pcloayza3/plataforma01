package com.postylocal.app;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.media.MediaRecorder;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.util.Base64;
import android.view.WindowManager;
import android.widget.Toast;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.SharedPreferences;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1002;
    private WebView webView;
    private String pendingVoiceTargetIndex = "0";
    private TextToSpeech textToSpeech;
    private ValueCallback<Uri[]> fileUploadCallback;
    private LocationListener continuousLocationListener = null;
    private volatile boolean isModalOpen = false;

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

        setContentView(R.layout.activity_main);
        android.widget.FrameLayout rootLayout = findViewById(R.id.root_layout);
        webView = findViewById(R.id.webview);

        // Previene de forma infalible que la barra de botones (||| O <) o barra de estado solapen la aplicación
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        ViewCompat.setOnApplyWindowInsetsListener(rootLayout, (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });

        // Inicializar motor de voz Text-To-Speech en español para reproducción infalible
        textToSpeech = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int res = textToSpeech.setLanguage(new Locale("es", "ES"));
                if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                    textToSpeech.setLanguage(Locale.getDefault());
                }
            }
        });

        // Requerimiento: Al instalarse, inicializar todos los datos limpios al momento de la instalación
        SharedPreferences prefs = getSharedPreferences("PostyPrefs", Context.MODE_PRIVATE);
        boolean isFirstLaunch = prefs.getBoolean("is_first_launch_fresh_v2", true);
        if (isFirstLaunch) {
            prefs.edit().putBoolean("is_first_launch_fresh_v2", false).apply();
            WebStorage.getInstance().deleteAllData();
        }

        requestAppPermissions();
        configureWebView();

        // Carga 100% local y offline desde los assets del APK (sin dependencia de red)
        webView.loadUrl("file:///android_asset/www/index.html");

        handleDeepLinkNotification(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLinkNotification(intent);
    }

    private void handleDeepLinkNotification(Intent intent) {
        if (intent == null) return;
        String targetNoteId = intent.getStringExtra("targetNoteId");
        String speakText = intent.getStringExtra("speakNoteText");
        if (targetNoteId != null && !targetNoteId.isEmpty()) {
            webView.postDelayed(() -> {
                webView.evaluateJavascript("if (window.openNoteFromNotification) { window.openNoteFromNotification('" + targetNoteId + "'); }", null);
                if (speakText != null && !speakText.isEmpty() && textToSpeech != null) {
                    textToSpeech.speak(speakText, TextToSpeech.QUEUE_FLUSH, null, "AlertTTS");
                }
            }, 1200);
        }
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
        settings.setBlockNetworkImage(false);
        settings.setBlockNetworkLoads(false);
        // User agent estándar para evitar bloqueos por parte de servidores de mapas (Google, CartoDB)
        settings.setUserAgentString("Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 NotaFelizApp/1.0");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                // Proceder para cargar azulejos de mapas seguros sin interrupción
                handler.proceed();
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // Fallback de contingencia únicamente si falla la carga del documento HTML principal
                if (failingUrl != null && failingUrl.startsWith("file:///android_asset/www/index.html")) {
                    view.loadUrl("file:///android_asset/index.html");
                }
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

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (fileUploadCallback != null) {
                    fileUploadCallback.onReceiveValue(null);
                }
                fileUploadCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                } catch (Exception e) {
                    fileUploadCallback = null;
                    return false;
                }
                return true;
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
        } else {
            startContinuousLocationUpdates();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            startContinuousLocationUpdates();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        startContinuousLocationUpdates();
    }

    private void startContinuousLocationUpdates() {
        runOnUiThread(() -> {
            try {
                LocationManager lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
                if (lm == null) return;

                if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    return;
                }

                if (continuousLocationListener != null) {
                    lm.removeUpdates(continuousLocationListener);
                }

                continuousLocationListener = new LocationListener() {
                    @Override
                    public void onLocationChanged(Location loc) {
                        sendDeviceLocationToWebView(loc.getLatitude(), loc.getLongitude(), loc.getAccuracy());
                    }
                    @Override public void onStatusChanged(String provider, int status, Bundle extras) {}
                    @Override public void onProviderEnabled(String provider) {}
                    @Override public void onProviderDisabled(String provider) {}
                };

                // Emitir inmediatamente la última ubicación conocida
                Location best = null;
                if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    best = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                }
                if (best == null && lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    best = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                }
                if (best != null) {
                    sendDeviceLocationToWebView(best.getLatitude(), best.getLongitude(), best.getAccuracy());
                }

                if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 3000, 2, continuousLocationListener);
                }
                if (lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 4000, 3, continuousLocationListener);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private void sendDeviceLocationToWebView(double lat, double lng, float acc) {
        if (webView == null) return;
        webView.post(() -> {
            String js = String.format(java.util.Locale.US,
                "if (window.onDeviceLocationUpdate) { window.onDeviceLocationUpdate(%.6f, %.6f, %.1f); }",
                lat, lng, acc);
            webView.evaluateJavascript(js, null);
        });
    }

    public class AndroidNativeBridge {

        @JavascriptInterface
        public void setModalOpen(boolean isOpen) {
            isModalOpen = isOpen;
        }

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

        @JavascriptInterface
        public void speakText(String text) {
            runOnUiThread(() -> {
                if (textToSpeech != null && text != null && !text.isEmpty()) {
                    textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "PostyTTS");
                }
            });
        }

        // Programar Alarma Nativa de Android (Push en segundo plano aun con la app cerrada)
        @JavascriptInterface
        public void scheduleNativeAlarm(String noteId, String title, String body, long triggerTimestamp) {
            if (triggerTimestamp <= System.currentTimeMillis()) return;
            try {
                AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                if (am == null) return;

                Intent intent = new Intent(MainActivity.this, AlarmReceiver.class);
                intent.setAction("com.postylocal.app.ACTION_NOTE_ALARM");
                intent.putExtra("noteId", noteId);
                intent.putExtra("title", title);
                intent.putExtra("body", body);

                int reqCode = Math.abs(noteId.hashCode());
                PendingIntent pi = PendingIntent.getBroadcast(
                    MainActivity.this, reqCode, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTimestamp, pi);
                } else {
                    am.setExact(AlarmManager.RTC_WAKEUP, triggerTimestamp, pi);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Cancelar Alarma Nativa de Android
        @JavascriptInterface
        public void cancelNativeAlarm(String noteId) {
            try {
                AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                if (am == null) return;

                Intent intent = new Intent(MainActivity.this, AlarmReceiver.class);
                intent.setAction("com.postylocal.app.ACTION_NOTE_ALARM");
                int reqCode = Math.abs(noteId.hashCode());
                PendingIntent pi = PendingIntent.getBroadcast(
                    MainActivity.this, reqCode, intent,
                    PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
                );
                if (pi != null) {
                    am.cancel(pi);
                    pi.cancel();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Guardar Respaldo JSON en la Carpeta Descargas del Smartphone
        @JavascriptInterface
        public void saveJsonExport(String filename, String jsonContent) {
            runOnUiThread(() -> {
                try {
                    File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    if (!downloadsDir.exists()) downloadsDir.mkdirs();
                    File destFile = new File(downloadsDir, filename);

                    try (FileOutputStream fos = new FileOutputStream(destFile)) {
                        fos.write(jsonContent.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                        fos.flush();
                    }

                    MediaScannerConnection.scanFile(
                        MainActivity.this,
                        new String[]{destFile.getAbsolutePath()},
                        new String[]{"application/json"},
                        null
                    );

                    Toast.makeText(MainActivity.this, "✓ Guardado en Descargas:\n" + filename, Toast.LENGTH_LONG).show();
                } catch (Exception e) {
                    e.printStackTrace();
                    try {
                        File internalDir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                        if (internalDir == null) internalDir = getFilesDir();
                        File fallbackFile = new File(internalDir, filename);
                        try (FileOutputStream fos = new FileOutputStream(fallbackFile)) {
                            fos.write(jsonContent.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                            fos.flush();
                        }
                        Toast.makeText(MainActivity.this, "✓ Guardado en:\n" + fallbackFile.getAbsolutePath(), Toast.LENGTH_LONG).show();
                    } catch (Exception ex) {
                        Toast.makeText(MainActivity.this, "Error al exportar: " + ex.getMessage(), Toast.LENGTH_LONG).show();
                    }
                }
            });
        }

        // Actualizar Actividades Relevantes directamente en Pantalla de Bloqueo y AOD (Protector actual)
        @JavascriptInterface
        public void updateLockScreenLiveWidget(String title, String summary, String detailsText) {
            runOnUiThread(() -> {
                try {
                    NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                    if (manager == null) return;

                    String channelId = "nota_feliz_lockscreen_feed";
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        NotificationChannel channel = manager.getNotificationChannel(channelId);
                        if (channel == null) {
                            channel = new NotificationChannel(
                                channelId,
                                "Nota Feliz - Pantalla de Bloqueo y AOD",
                                NotificationManager.IMPORTANCE_LOW
                            );
                            channel.setDescription("Muestra las notas relevantes en la pantalla de bloqueo y Always On Display");
                            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                            channel.setShowBadge(true);
                            manager.createNotificationChannel(channel);
                        }
                    }

                    Intent mainIntent = new Intent(MainActivity.this, MainActivity.class);
                    mainIntent.setAction("com.postylocal.app.ACTION_OPEN_FROM_LOCKSCREEN");
                    mainIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

                    PendingIntent pendingIntent = PendingIntent.getActivity(
                        MainActivity.this,
                        1001,
                        mainIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );

                    NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, channelId)
                        .setSmallIcon(R.mipmap.ic_launcher)
                        .setContentTitle(title)
                        .setContentText(summary)
                        .setStyle(new NotificationCompat.BigTextStyle().bigText(detailsText))
                        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                        .setOngoing(true)
                        .setContentIntent(pendingIntent)
                        .setShowWhen(true);

                    manager.notify(1001, builder.build());
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        // Remover Widget de Pantalla de Bloqueo si el usuario lo desactiva
        @JavascriptInterface
        public void removeLockScreenLiveWidget() {
            runOnUiThread(() -> {
                try {
                    NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                    if (manager != null) {
                        manager.cancel(1001);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        // Abrir Ajustes de Protector de Pantalla del Sistema Android directamente
        @JavascriptInterface
        public void openDreamSettings() {
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(Settings.ACTION_DREAM_SETTINGS);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                } catch (Exception e) {
                    try {
                        Intent intent = new Intent(Settings.ACTION_DISPLAY_SETTINGS);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                    } catch (Exception ignored) {}
                }
            });
        }

        // Mantener Pantalla Encendida durante el Modo Reposo OLED
        @JavascriptInterface
        public void setKeepScreenOn(boolean keepOn) {
            runOnUiThread(() -> {
                if (keepOn) {
                    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                } else {
                    getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            });
        }

        // Actualizar datos del Lock Screen Widget nativo (AppWidget / Keyguard / Pantalla de Bloqueo)
        @JavascriptInterface
        public void updateLockScreenWidgetData(String title, String timeStr, int count, String noteId) {
            runOnUiThread(() -> {
                LockScreenWidgetProvider.updateAllWidgets(MainActivity.this, title, timeStr, count, noteId);
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
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (fileUploadCallback != null) {
                Uri[] results = null;
                if (resultCode == RESULT_OK && data != null) {
                    if (data.getData() != null) {
                        results = new Uri[]{data.getData()};
                    } else if (data.getClipData() != null) {
                        int count = data.getClipData().getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = data.getClipData().getItemAt(i).getUri();
                        }
                    }
                }
                fileUploadCallback.onReceiveValue(results);
                fileUploadCallback = null;
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    protected void onDestroy() {
        if (continuousLocationListener != null) {
            LocationManager lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            if (lm != null) {
                lm.removeUpdates(continuousLocationListener);
            }
        }
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript(
                "(function() { return (window.handleAndroidBackButton && window.handleAndroidBackButton()) ? 'closed' : 'exit'; })();",
                result -> {
                    if (result != null && result.contains("closed")) {
                        // Se cerró un formulario/modal abierto con éxito, no salir de la app
                        return;
                    }
                    runOnUiThread(() -> {
                        if (webView.canGoBack()) {
                            webView.goBack();
                        } else {
                            MainActivity.super.onBackPressed();
                        }
                    });
                }
            );
        } else {
            super.onBackPressed();
        }
    }
}
