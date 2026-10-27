package com.postylocal.app;

import android.os.Build;
import android.service.dreams.DreamService;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class PostyScreensaverService extends DreamService {

    private WebView webView;

    @Override
    public void onAttachedToWindow() {
        super.onAttachedToWindow();

        setInteractive(true);
        setFullscreen(true);
        setScreenBright(true);

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                // Forzar despliegue inmediato de la Pantalla Feliz con su Post-it y Carita Feliz
                view.evaluateJavascript("if (window.openScreensaver) { window.openScreensaver(); }", null);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (failingUrl != null && failingUrl.startsWith("file:///android_asset/www/index.html")) {
                    view.loadUrl("file:///android_asset/index.html?screensaver=1");
                }
            }
        });

        setContentView(webView);
        webView.loadUrl("file:///android_asset/www/index.html?screensaver=1");
    }

    @Override
    public void onDreamingStarted() {
        super.onDreamingStarted();
        if (webView != null) {
            webView.evaluateJavascript("if (window.openScreensaver) { window.openScreensaver(); }", null);
        }
    }

    @Override
    public void onDreamingStopped() {
        super.onDreamingStopped();
    }

    @Override
    public void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
    }
}
