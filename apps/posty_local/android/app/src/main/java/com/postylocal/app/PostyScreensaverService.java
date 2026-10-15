package com.postylocal.app;

import android.service.dreams.DreamService;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class PostyScreensaverService extends DreamService {

    @Override
    public void onAttachedToWindow() {
        super.onAttachedToWindow();

        setInteractive(true);
        setFullscreen(true);
        setScreenBright(false); // Ahorro de batería para pantallas OLED

        WebView webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);

        setContentView(webView);
        webView.loadUrl("file:///android_asset/www/index.html?screensaver=1");
    }
}
