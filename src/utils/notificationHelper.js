/**
 * Map notification type → icon + color cho hiển thị trong app
 */
const TYPE_CONFIG = {
  class_reminder: {
    icon: 'time-outline',
    iconColor: '#f59e0b',
  },
  class_started: {
    icon: 'play-circle-outline',
    iconColor: '#10b981',
  },
  attendance_success: {
    icon: 'checkmark-circle-outline',
    iconColor: '#10b981',
  },
  class_cancelled: {
    icon: 'close-circle-outline',
    iconColor: '#ef4444',
  },
  schedule_change: {
    icon: 'swap-horizontal-outline',
    iconColor: '#3b82f6',
  },
  leave_request: {
    icon: 'document-text-outline',
    iconColor: '#8b5cf6',
  },
  create_session_now: {
    icon: 'qr-code-outline',
    iconColor: '#10b981',
  },
  missing_qr: {
    icon: 'alert-circle-outline',
    iconColor: '#ef4444',
  },
  other: {
    icon: 'notifications-outline',
    iconColor: '#6b7280',
  },
};

const DEFAULT_CONFIG = {
  icon: 'notifications-outline',
  iconColor: '#6b7280',
};

/**
 * Lấy config icon theo notification type
 */
export const getNotificationTypeConfig = (type) => {
  return TYPE_CONFIG[type] || DEFAULT_CONFIG;
};

/**
 * Lấy action button theo notification type (cho teacher)
 */
export const getNotificationAction = (type) => {
  switch (type) {
    case 'create_session_now':
    case 'missing_qr':
      return 'create_qr';
    default:
      return null;
  }
};

/**
 * Format thời gian hiển thị (relative time)
 */
export const getTimeAgo = (timeString) => {
  if (!timeString) return '';
  const now = new Date();
  const notifTime = new Date(timeString);
  const diffMs = now - notifTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return notifTime.toLocaleDateString('vi-VN');
};

/**
 * Lấy border style theo priority (cho teacher)
 */
export const getPriorityBorder = (priority, userRole) => {
  if (userRole === 'student') return 'border-l-4 border-transparent';
  
  switch (priority) {
    case 'urgent':
      return 'border-l-4 border-red-500';
    case 'high':
      return 'border-l-4 border-orange-500';
    default:
      return 'border-l-4 border-transparent';
  }
};
