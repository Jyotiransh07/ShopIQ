export type Gender = 'Male' | 'Female' | 'Other';
export type Device = 'Mobile' | 'Desktop' | 'Tablet';
export type Category = 'Electronics' | 'Fashion' | 'Grocery' | 'Beauty' | 'Sports' | 'Books' | 'Home Decor';
export type CartStatus = 'Completed' | 'Abandoned';
export type AbandonReason = 'Price Too High' | 'Bad Website UX' | 'Got Distracted' | 'Payment Failed' | 'Out of Stock' | 'Found Cheaper Elsewhere' | null;
export type Segment = 'Impulse Buyer' | 'Loyal Customer' | 'Bargain Hunter' | 'Window Shopper';
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';

export interface CustomerRecord {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  city: string;
  device: Device;
  category: Category;
  amountSpent: number;
  purchaseFrequency: number;
  sessionDuration: number;
  cartStatus: CartStatus;
  abandonReason: AbandonReason;
  dayOfWeek: DayOfWeek;
  hourOfDay: number;
  month: Month;
  customerSegment: Segment;
  rating: number | null;
}

export type Page = 'home' | 'data-entry' | 'dashboard' | 'insights' | 'about' | 'login' | 'signup';
