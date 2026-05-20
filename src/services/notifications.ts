import { Platform } from 'react-native';
import { getUserProfile } from './db';

// Lazy load notifications to avoid Expo Go push warning side-effects at boot
let NotificationsModule: any = null;

const getNotifications = () => {
  if (Platform.OS === 'web') return null;
  if (!NotificationsModule) {
    try {
      NotificationsModule = require('expo-notifications');
      
      // Configure behavior once loaded
      NotificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (e) {
      console.warn('Failed to load expo-notifications:', e);
      return null;
    }
  }
  return NotificationsModule;
};

export const notificationService = {
  // Request permissions
  async requestPermissions() {
    const Notifications = getNotifications();
    if (!Notifications) return false;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  },

  // Schedule a daily reminder
  async scheduleDailyReminder(hour: number, minute: number) {
    const Notifications = getNotifications();
    if (!Notifications) return;
    
    // First cancel existing daily reminders
    await this.cancelDailyReminders();
    
    const profile = await getUserProfile();
    if (!profile?.notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Zeit für deine Quests! 🦊",
        body: "Hey Buddy, deine täglichen Quests warten auf dich. Schnapp dir die XP!",
        data: { screen: 'index' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  },

  // Cancel daily reminders
  async cancelDailyReminders() {
    const Notifications = getNotifications();
    if (!Notifications) return;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.title === "Zeit für deine Quests! 🦊") {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  },

  // Schedule streak reminder (e.g., in the evening)
  async scheduleStreakReminder() {
    const Notifications = getNotifications();
    if (!Notifications) return;
    
    const profile = await getUserProfile();
    if (!profile?.notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Streak in Gefahr! 🔥",
        body: "Du hast heute noch keine Quest erledigt. Rettest du deinen Streak?",
        data: { screen: 'index' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20, // 8 PM
        minute: 0,
      },
    });
  },

  // Send an immediate achievement notification
  async sendAchievementNotification(title: string) {
    const Notifications = getNotifications();
    if (!Notifications) return;
    
    const profile = await getUserProfile();
    if (!profile?.notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Neuer Erfolg! 🏆",
        body: `Du hast '${title}' freigeschaltet. Mega stabil!`,
        data: { screen: 'achievements' },
      },
      trigger: null, // Send immediately
    });
  },

  // Send notification for new quest
  async sendQuestNotification(title: string) {
    const Notifications = getNotifications();
    if (!Notifications) return;
    
    const profile = await getUserProfile();
    if (!profile?.notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Neue Quest verfügbar! 🎯",
        body: `Deine neue Quest '${title}' wartet auf dich. Bereit?`,
        data: { screen: 'index' },
      },
      trigger: null, // Send immediately
    });
  },

  // Send notification for streak safe
  async sendStreakSafeNotification(days: number) {
    const Notifications = getNotifications();
    if (!Notifications) return;
    
    const profile = await getUserProfile();
    if (!profile?.notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Streak gesichert! 🔥",
        body: `Du hast deinen ${days}-Tage-Streak für heute gerettet. Mega!`,
        data: { screen: 'index' },
      },
      trigger: null, // Send immediately
    });
  },

  // Cancel all notifications
  async cancelAll() {
    const Notifications = getNotifications();
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};
