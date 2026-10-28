package com.postylocal.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;

public class LockScreenWidgetProvider extends AppWidgetProvider {

    public static final String PREFS_NAME = "PostyWidgetPrefs";
    public static final String KEY_TITLE = "widget_title";
    public static final String KEY_TIME = "widget_time";
    public static final String KEY_COUNT = "widget_count";
    public static final String KEY_NOTE_ID = "widget_note_id";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateAllWidgetsFromPrefs(context, appWidgetManager, appWidgetIds);
    }

    public static void updateAllWidgets(Context context, String title, String time, int count, String noteId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putString(KEY_TITLE, title)
            .putString(KEY_TIME, time)
            .putInt(KEY_COUNT, count)
            .putString(KEY_NOTE_ID, noteId != null ? noteId : "")
            .apply();

        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName thisWidget = new ComponentName(context, LockScreenWidgetProvider.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
        if (appWidgetIds != null && appWidgetIds.length > 0) {
            updateAllWidgetsFromPrefs(context, appWidgetManager, appWidgetIds);
        }
    }

    public static void updateAllWidgetsFromPrefs(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String title = prefs.getString(KEY_TITLE, "Nota Feliz");
        String time = prefs.getString(KEY_TIME, "Sin alarmas pendientes");
        int count = prefs.getInt(KEY_COUNT, 0);
        String noteId = prefs.getString(KEY_NOTE_ID, "");

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.lock_screen_widget_layout);
            views.setTextViewText(R.id.widget_alarm_title, title);
            views.setTextViewText(R.id.widget_alarm_time, time);

            if (count > 0) {
                views.setTextViewText(R.id.widget_alarm_count, String.valueOf(count));
                views.setViewVisibility(R.id.widget_alarm_count, View.VISIBLE);
            } else {
                views.setViewVisibility(R.id.widget_alarm_count, View.GONE);
            }

            Intent intent = new Intent(context, MainActivity.class);
            intent.setAction("com.postylocal.app.ACTION_OPEN_NOTE");
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            if (!noteId.isEmpty()) {
                intent.putExtra("targetNoteId", noteId);
            }

            PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                appWidgetId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}
