import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const dayUTC = dayjs.utc;
export const dayWithTZ = dayjs.tz;
export { dayjs };
