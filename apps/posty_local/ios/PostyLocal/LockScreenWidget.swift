import WidgetKit
import SwiftUI

struct PostyAlarmEntry: TimelineEntry {
    let date: Date
    let title: String
    let time: String
    let count: Int
}

struct PostyWidgetProvider: TimelineProvider {
    let appGroupId = "group.com.postylocal.app"

    func placeholder(in context: Context) -> PostyAlarmEntry {
        PostyAlarmEntry(date: Date(), title: "Nota Feliz", time: "18:00", count: 1)
    }

    func getSnapshot(in context: Context, completion: @escaping (PostyAlarmEntry) -> Void) {
        completion(getCurrentData())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PostyAlarmEntry>) -> Void) {
        let entry = getCurrentData()
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }

    private func getCurrentData() -> PostyAlarmEntry {
        let sharedDefaults = UserDefaults(suiteName: appGroupId)
        let title = sharedDefaults?.string(forKey: "widget_title") ?? "Nota Feliz"
        let time = sharedDefaults?.string(forKey: "widget_time") ?? "Sin avisos"
        let count = sharedDefaults?.integer(forKey: "widget_count") ?? 0
        return PostyAlarmEntry(date: Date(), title: title, time: time, count: count)
    }
}

struct LockScreenWidgetEntryView: View {
    var entry: PostyWidgetProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Image(systemName: "bell.fill")
                        .font(.system(size: 11, weight: .semibold))
                    Text(entry.title)
                        .font(.system(size: 13, weight: .bold))
                        .widgetAccentable()
                        .lineLimit(1)
                }
                HStack {
                    Text(entry.time)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    if entry.count > 1 {
                        Spacer()
                        Text("+\(entry.count - 1)")
                            .font(.system(size: 10, weight: .bold))
                            .padding(.horizontal, 4)
                            .padding(.vertical, 1)
                            .background(Color.secondary.opacity(0.3))
                            .cornerRadius(4)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

        default:
            VStack(alignment: .leading, spacing: 4) {
                Text(entry.title).font(.headline).lineLimit(1)
                Text(entry.time).font(.subheadline).foregroundColor(.secondary)
            }
            .padding()
        }
    }
}

struct PostyLockScreenWidget: Widget {
    let kind: String = "LockScreenWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PostyWidgetProvider()) { entry in
            LockScreenWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Nota Feliz - Próxima Alarma")
        .description("Muestra la próxima alarma o nota urgente en la pantalla de bloqueo.")
        .supportedFamilies([.accessoryRectangular, .systemSmall])
    }
}
