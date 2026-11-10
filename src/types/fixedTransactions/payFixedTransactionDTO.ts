import { Currency } from '../currency';

// Every field is optional: the template supplies the defaults, and the caller
// only overrides what differs this month (a variable amount, a late payment).
export default interface PayFixedTransactionDTO {
  amount?: number;
  currency?: Currency;
  dueDate?: Date;
  description?: string;
}
