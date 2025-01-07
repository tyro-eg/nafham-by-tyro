export const INITIAL_EVENTS = [];

export const parseTimeSlotsIntoCalendarEvents = (timeSlots: any[]) => {
  const parsedSlots = timeSlots.map((event: any) => {
    const eventObj: any = {};
    if (event) {
      eventObj.id = event.id ? event.id : undefined;
      eventObj.start = event.start_time ? event.start_time : undefined;
      eventObj.end = event.end_time ? event.end_time : undefined;
      eventObj.status = event.status ? event.status : undefined;
      eventObj.color = eventColor(event.status);
    }
    return eventObj;
  });
  return parsedSlots;
};

const eventColor = (status: string) => {
  switch (status) {
    case 'available':
      return '#357cd6';
    case 'reserved':
      return '#9ca5af';
    default:
      return '#357cd6';
  }
};
