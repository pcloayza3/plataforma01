package com.postylocal.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class AlarmReceiver extends BroadcastReceiver {
    public static final String CHANNEL_ID = "nota_feliz_urgent_alerts";
    public static final String CHANNEL_NAME = "Alarmas de Nota Feliz";

    @Override
    public void onReceive(Context context, Intent intent) {
        String noteId = intent.getStringExtra("noteId");
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");

        if (title == null || title.isEmpty()) {
            title = "Nota Feliz • Alerta Urgente";
        }
        if (body == null || body.isEmpty()) {
            body = "Tiene una nota urgente pendiente.";
        }
        if (noteId == null) {
            noteId = "default";
        }

        // Crear canal de notificación con alta importancia
        createNotificationChannel(context);

        // Sonido de campana / notificación
        try {
            Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            if (soundUri == null) {
                soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            }
            Ringtone ringtone = RingtoneManager.getRingtone(context.getApplicationContext(), soundUri);
            if (ringtone != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    ringtone.setAudioAttributes(new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build());
                }
                ringtone.play();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Intent para abrir MainActivity enlazando a la nota específica
        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setAction("com.postylocal.app.ACTION_OPEN_NOTE");
        mainIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        mainIntent.putExtra("targetNoteId", noteId);
        mainIntent.putExtra("speakNoteText", body);

        int reqCode = Math.abs(noteId.hashCode());
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            reqCode,
            mainIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setVibrate(new long[]{0, 500, 200, 500})
            .setDefaults(NotificationCompat.DEFAULT_ALL);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        try {
            notificationManager.notify(reqCode, builder.build());
        } catch (SecurityException se) {
            se.printStackTrace();
        }
    }

    private void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = context.getSystemService(NotificationManager.class);
            if (manager != null) {
                NotificationChannel existing = manager.getNotificationChannel(CHANNEL_ID);
                if (existing == null) {
                    NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        CHANNEL_NAME,
                        NotificationManager.IMPORTANCE_HIGH
                    );
                    channel.setDescription("Notificaciones de alta prioridad para alertas y notas programadas");
                    channel.enableVibration(true);
                    channel.setVibrationPattern(new long[]{0, 500, 200, 500});
                    manager.createNotificationChannel(channel);
                }
            }
        }
    }
}
