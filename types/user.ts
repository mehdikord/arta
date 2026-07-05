/** Registered user account */
export interface User {
  id: string;
  name: string;
  /** Iranian mobile format: 09xxxxxxxxx */
  mobile: string;
  /** Mock only — hash in production */
  password: string;
  createdAt: string;
  /** Purchased product IDs */
  purchases: string[];
  /** Booked appointment IDs */
  appointments: string[];
}
