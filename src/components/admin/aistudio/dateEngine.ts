import { DateDistributionMode } from './types';

// Authentic, natural Indian player persona names
const INDIAN_FIRST_NAMES = [
  'Rahul', 'Rohit', 'Amit', 'Vikas', 'Deepak', 'Sanjay', 'Pooja', 'Sunil',
  'Ankit', 'Manish', 'Kunal', 'Rohan', 'Neeraj', 'Arjun', 'Priya', 'Kavita',
  'Sameer', 'Naveen', 'Gaurav', 'Aditya', 'Ravi', 'Manoj', 'Sachin', 'Pawan',
  'Harsh', 'Vikram', 'Rajesh', 'Suresh', 'Abhishek', 'Akash', 'Suraj', 'Ajay'
];

const INDIAN_LAST_INITIALS_OR_NAMES = [
  'Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Yadav', 'Gupta', 'Mehta',
  'Joshi', 'Chauhan', 'Rawat', 'Pandey', 'Malhotra', 'Reddy', 'Mishra', 'Tiwari',
  'K.', 'S.', 'R.', 'P.', 'V.', 'M.', 'B.', 'G.', 'D.', 'A.'
];

export function generateRealisticUserName(): string {
  const first = INDIAN_FIRST_NAMES[Math.floor(Math.random() * INDIAN_FIRST_NAMES.length)];
  const last = INDIAN_LAST_INITIALS_OR_NAMES[Math.floor(Math.random() * INDIAN_LAST_INITIALS_OR_NAMES.length)];
  return `${first} ${last}`;
}

export interface GeneratedDateResult {
  isoTimestamp: string;
  dateTag: 'Today' | 'Yesterday' | '2 Days Ago' | '3 Days Ago' | 'Custom';
  formattedDisplay: string;
}

/**
 * Generates an authentically randomized date timestamp based on the chosen mode.
 * Spreads hours/minutes naturally between 8:00 AM and 11:45 PM.
 */
export function generateRealisticTimestamp(
  mode: DateDistributionMode,
  indexInBatch: number,
  totalInBatch: number
): GeneratedDateResult {
  const now = new Date();
  let targetDate = new Date(now.getTime());
  let dateTag: 'Today' | 'Yesterday' | '2 Days Ago' | '3 Days Ago' | 'Custom' = 'Today';

  // Determine which day to target
  if (mode === 'today_only') {
    dateTag = 'Today';
  } else if (mode === 'yesterday_only') {
    targetDate.setDate(now.getDate() - 1);
    dateTag = 'Yesterday';
  } else if (mode === 'today_and_yesterday') {
    // Alternate or distribute 50% Today, 50% Yesterday
    const isYesterday = indexInBatch % 2 === 1;
    if (isYesterday) {
      targetDate.setDate(now.getDate() - 1);
      dateTag = 'Yesterday';
    } else {
      dateTag = 'Today';
    }
  } else if (mode === 'last_3_days') {
    const dayOffset = indexInBatch % 3;
    targetDate.setDate(now.getDate() - dayOffset);
    if (dayOffset === 0) dateTag = 'Today';
    else if (dayOffset === 1) dateTag = 'Yesterday';
    else dateTag = '2 Days Ago';
  } else if (mode === 'last_7_days') {
    const dayOffset = Math.floor(Math.random() * 7);
    targetDate.setDate(now.getDate() - dayOffset);
    if (dayOffset === 0) dateTag = 'Today';
    else if (dayOffset === 1) dateTag = 'Yesterday';
    else if (dayOffset === 2) dateTag = '2 Days Ago';
    else if (dayOffset === 3) dateTag = '3 Days Ago';
    else dateTag = 'Custom';
  }

  // Randomize time naturally (e.g. between 09:15 and 23:30)
  // If target is today, ensure the hour isn't in the future
  let maxHour = dateTag === 'Today' ? Math.max(9, now.getHours()) : 23;
  let minHour = 8;
  if (maxHour < minHour) maxHour = minHour;

  const randomHour = minHour + Math.floor(Math.random() * (maxHour - minHour + 1));
  const randomMinute = Math.floor(Math.random() * 60);
  const randomSecond = Math.floor(Math.random() * 60);

  targetDate.setHours(randomHour, randomMinute, randomSecond, 0);

  // If accidentally in the future for today, pull back by 15-45 minutes
  if (targetDate.getTime() > now.getTime()) {
    targetDate = new Date(now.getTime() - (Math.floor(Math.random() * 45) + 10) * 60000);
  }

  const hoursDisplay = targetDate.getHours() % 12 || 12;
  const ampm = targetDate.getHours() >= 12 ? 'PM' : 'AM';
  const minutesDisplay = String(targetDate.getMinutes()).padStart(2, '0');
  const formattedDisplay = `${dateTag}, ${hoursDisplay}:${minutesDisplay} ${ampm}`;

  return {
    isoTimestamp: targetDate.toISOString(),
    dateTag,
    formattedDisplay
  };
}
