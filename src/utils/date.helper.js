/**
 * Tính toán date range theo view mode
 */
export const getDateRange = (baseDate, mode) => {
  const date = new Date(baseDate);
  console.log('Calculating date range for date:', baseDate, 'mode:', mode);
  
  if (mode === 'month') {
    // Lấy ngày đầu và cuối tháng
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
    };
  } else if (mode === 'week') {
    // Lấy ngày đầu (Thứ 2) và cuối (Chủ nhật) của tuần
    const dayOfWeek = date.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0],
    };
  } else {
    // Day mode - chỉ lấy ngày đó (hoặc cả tuần để có context)
    const monday = new Date(date);
    console.log('Calculating day mode range for date:', date.toISOString().split('T')[0]);
    const dayOfWeek = date.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(date.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    console.log('Day mode range:', monday.toISOString().split('T')[0], 'to', sunday.toISOString().split('T')[0]);
    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0],
    };
  }
};

/**
 * Kiểm tra xem date có nằm trong range đã fetch không
 */
export const isDateInRange = (date, range) => {
  if (!range || !range.startDate || !range.endDate) return false;
  return date >= range.startDate && date <= range.endDate;
};