import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

export const scheduleReminder = async (
  eventName: string,
  nextDateString: string
) => {
  const nextDate = new Date(nextDateString);
  const now = new Date();
  const notificationIds: string[] = [];

  const reminders = [
    { daysBefore: 7, label: "In a week" },
    { daysBefore: 1, label: "Tomorrow" },
  ];

  for (const config of reminders) {
    const reminderDate = new Date(nextDate.getTime());
    reminderDate.setDate(reminderDate.getDate() - config.daysBefore);
    reminderDate.setHours(10, 0, 0, 0);

    if (reminderDate > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Pet Reminder 🐾",
          body: `${config.label}: ${eventName}`,
          data: { eventName, daysBefore: config.daysBefore },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });
      notificationIds.push(id);
    } else {
      console.log(
        `Reminder for ${config.daysBefore} day(s) before has already passed.`
      );
    }
  }

  return notificationIds;
};
