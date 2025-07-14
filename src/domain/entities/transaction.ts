import { TransactionType } from 'src/types/transactions/transactionTypes';

export default class Transaction {
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(
    private readonly id: number,
    private amount: number,
    private dueDate: Date,
    private type: TransactionType,
    private categoryId: number,
    private description?: string,
  ) {
    this.id = id;
    this.setAmount(amount);
    this.setDueDate(dueDate);
    this.setType(type);
    this.setDescription(description);
    this.setCategoryId(categoryId);

    this.createdAt = new Date();
    this.setUpdatedAt();
  }

  getId() {
    return this.id;
  }

  getAmount() {
    return this.amount;
  }

  getDueDate() {
    return this.dueDate;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  getType() {
    return this.type;
  }

  getDescription() {
    return this.description;
  }

  getCategoryId() {
    return this.categoryId;
  }

  setAmount(amount: number) {
    this.amount = amount;
  }

  setDueDate(dueDate: Date) {
    this.dueDate = dueDate;
  }

  setUpdatedAt() {
    this.updatedAt = new Date();
  }

  setType(type: TransactionType) {
    this.type = type;
  }

  setDescription(description?: string) {
    this.description = description;
  }

  setCategoryId(categoryId: number) {
    this.categoryId = categoryId;
  }
}
