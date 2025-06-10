import { globalHistoryManager } from './historySystem';

// Global state for skill unlock notifications
let pendingNotifications: string[] = [];
let notificationListeners: Array<(skills: string[]) => void> = [];

export function initializeGlobalSkillNotifications() {
  // Subscribe to history changes to detect new skill unlocks
  globalHistoryManager.subscribe((history) => {
    const newSkills = history.pendingSkills.filter(skill => !pendingNotifications.includes(skill));
    if (newSkills.length > 0) {
      pendingNotifications = [...pendingNotifications, ...newSkills];
      notifyListeners();
    }
  });
}

export function subscribeToSkillNotifications(listener: (skills: string[]) => void): () => void {
  notificationListeners.push(listener);
  return () => {
    const index = notificationListeners.indexOf(listener);
    if (index > -1) {
      notificationListeners.splice(index, 1);
    }
  };
}

export function clearPendingNotifications() {
  pendingNotifications = [];
  notifyListeners();
}

export function getPendingNotifications(): string[] {
  return [...pendingNotifications];
}

function notifyListeners() {
  notificationListeners.forEach(listener => listener([...pendingNotifications]));
}

// Initialize the system
initializeGlobalSkillNotifications();