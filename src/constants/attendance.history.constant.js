export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  EXCUSED: 'excused',
  NOT_YET: 'not_yet',
};

export const STATUS_CONFIG = {
  [ATTENDANCE_STATUS.PRESENT]: {
    label: 'Có mặt',
    color: '#10b981',
    bgColor: '#d1fae5',
    icon: 'checkmark-circle',
  },
  [ATTENDANCE_STATUS.ABSENT]: {
    label: 'Vắng',
    color: '#ef4444',
    bgColor: '#fee2e2',
    icon: 'close-circle',
  },
  [ATTENDANCE_STATUS.EXCUSED]: {
    label: 'Có phép',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    icon: 'document-text',
  },
  [ATTENDANCE_STATUS.NOT_YET]: {
    label: 'Chưa học',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    icon: 'time-outline',
  },
};

export const STATUS_FILTER_OPTIONS = [
  { value: null, label: 'Tất cả' },
  { value: ATTENDANCE_STATUS.PRESENT, label: 'Có mặt' },
  { value: ATTENDANCE_STATUS.ABSENT, label: 'Vắng' },
  { value: ATTENDANCE_STATUS.EXCUSED, label: 'Có phép' },
];