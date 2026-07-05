/** Contact form submission record */
export interface ContactSubmission {
  id: string;
  name: string;
  mobile: string;
  subject: string;
  message?: string;
  createdAt: string;
}
