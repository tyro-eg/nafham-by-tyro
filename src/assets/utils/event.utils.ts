export const INITIAL_EVENTS = [];

export type TimeSlotType = {
  id: number;
  start: string;
  end: string;
  status: string;
  color: string;
};

export const parseTimeSlotsIntoCalendarEvents = (timeSlots: any[]) => {
  const parsedSlots = timeSlots.map((event: any) => {
    const eventObj: TimeSlotType = {
      id: event.id ? event.id : undefined,
      start: event.start_time ? event.start_time : undefined,
      end: event.end_time ? event.end_time : undefined,
      status: event.status ? event.status : undefined,
      color: eventColor(event.status),
    };
    return eventObj;
  });
  return parsedSlots;
};

const eventColor = (status: string) => {
  switch (status) {
    case 'available':
      return '#3ac5f1';
    case 'reserved':
      return '#9ca5af';
    default:
      return '#3ac5f1';
  }
};
