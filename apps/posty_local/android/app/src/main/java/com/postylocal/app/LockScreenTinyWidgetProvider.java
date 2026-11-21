package com.postylocal.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;

public class LockScreenTinyWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateTinyWidgets(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        updateTinyWidgets(context, appWidgetManager, new int[]{appWidgetId});
    }

    public static void updateTinyWidgets(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences prefs = context.getSharedPreferences(LockScreenWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
        int count = prefs.getInt(LockScreenWidgetProvider.KEY_COUNT, 0);
        String noteId = prefs.getString(LockScreenWidgetProvider.KEY_NOTE_ID, "");

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.lock_screen_widget_tiny);

            if (count > 0) {
                views.setTextViewText(R.id.widget_tiny_count, String.valueOf(count));
                views.setViewVisibility(R.id.widget_tiny_count, View.VISIBLE);
            } else {
                views.setViewVisibility(R.id.widget_tiny_count, View.GONE);
            }

            Intent intent = new Intent(context, MainActivity.class);
            intent.setAction("com.postylocal.app.ACTION_OPEN_NOTE");
            intent.putExtra("open_screensaver", true);
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
            views.setOnClickPendingIntent(R.id.widget_tiny_container, pendingIntent);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}
