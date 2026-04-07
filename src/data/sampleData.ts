import { CustomerRecord, Gender, Device, Category, CartStatus, AbandonReason, Segment, DayOfWeek, Month } from '../types';

const INDIAN_NAMES = [
  'Arjun Sharma', 'Priya Patel', 'Rahul Singh', 'Ananya Iyer', 'Vikram Rao',
  'Sanya Gupta', 'Aditya Verma', 'Ishani Das', 'Rohan Malhotra', 'Kavita Reddy',
  'Siddharth Nair', 'Meera Joshi', 'Amitabh Bachchan', 'Deepika Padukone', 'Virat Kohli',
  'Priyanka Chopra', 'Ranbir Kapoor', 'Alia Bhatt', 'Shah Rukh Khan', 'Kareena Kapoor',
  'Aarav Kumar', 'Saanvi Sharma', 'Vivaan Gupta', 'Inaya Khan', 'Reyansh Singh',
  'Aadhya Patel', 'Ishaan Verma', 'Anika Reddy', 'Kabir Malhotra', 'Myra Das'
];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Jaipur'];
const DEVICES: Device[] = ['Mobile', 'Desktop', 'Tablet'];
const CATEGORIES: Category[] = ['Electronics', 'Fashion', 'Grocery', 'Beauty', 'Sports', 'Books', 'Home Decor'];
const SEGMENTS: Segment[] = ['Impulse Buyer', 'Loyal Customer', 'Bargain Hunter', 'Window Shopper'];
const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS: Month[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ABANDON_REASONS: AbandonReason[] = ['Price Too High', 'Bad Website UX', 'Got Distracted', 'Payment Failed', 'Out of Stock', 'Found Cheaper Elsewhere'];

export function generateSampleData(count: number = 500): CustomerRecord[] {
  const data: CustomerRecord[] = [];

  for (let i = 0; i < count; i++) {
    const isCompleted = Math.random() < 0.65;
    const cartStatus: CartStatus = isCompleted ? 'Completed' : 'Abandoned';
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const amountSpent = isCompleted ? Math.floor(Math.random() * 49500) + 500 : 0;
    
    data.push({
      id: `cust-${i + 1}`,
      name: INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)],
      age: Math.floor(Math.random() * 63) + 18,
      gender: (['Male', 'Female', 'Other'] as Gender[])[Math.floor(Math.random() * 3)],
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
      category,
      amountSpent,
      purchaseFrequency: Math.floor(Math.random() * 20) + 1,
      sessionDuration: Math.floor(Math.random() * 45) + 5,
      cartStatus,
      abandonReason: isCompleted ? null : ABANDON_REASONS[Math.floor(Math.random() * ABANDON_REASONS.length)],
      dayOfWeek: DAYS[Math.floor(Math.random() * DAYS.length)],
      hourOfDay: Math.floor(Math.random() * 24),
      month: MONTHS[Math.floor(Math.random() * MONTHS.length)],
      customerSegment: SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)],
      rating: isCompleted ? Math.floor(Math.random() * 5) + 1 : null,
    });
  }

  return data;
}
