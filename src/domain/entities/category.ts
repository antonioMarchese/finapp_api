import { CategoryIcon } from 'src/types/categories/categoryIcons';
import { TransactionType } from 'src/types/transactions/transactionTypes';

export default class Category {
  constructor(
    private readonly id: number,
    private slug: string,
    private title: string,
    private color: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private type: TransactionType = 'expense',
    private icon: CategoryIcon | null = null,
    private active: boolean = true,
    private weeklyBudget: number | null = null,
    private position: number = 0,
    private excludeFromWeekly: boolean = false,
  ) {}

  getId() {
    return this.id;
  }

  getSlug() {
    return this.slug;
  }

  getTitle() {
    return this.title;
  }

  getColor() {
    return this.color;
  }

  getType() {
    return this.type;
  }

  getIcon() {
    return this.icon;
  }

  isActive() {
    return this.active;
  }

  getWeeklyBudget() {
    return this.weeklyBudget;
  }

  isExcludedFromWeekly() {
    return this.excludeFromWeekly;
  }

  getPosition() {
    return this.position;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }

  setTitle(title: string) {
    this.title = title;
  }

  setColor(color: string) {
    this.color = color;
  }

  setType(type: TransactionType) {
    this.type = type;
  }

  setIcon(icon: CategoryIcon | null) {
    this.icon = icon;
  }

  setActive(active: boolean) {
    this.active = active;
  }

  setWeeklyBudget(weeklyBudget: number | null) {
    this.weeklyBudget = weeklyBudget;
  }

  setExcludeFromWeekly(excludeFromWeekly: boolean) {
    this.excludeFromWeekly = excludeFromWeekly;
  }

  setPosition(position: number) {
    this.position = position;
  }

  setUpdatedAt() {
    this.updatedAt = new Date();
  }

  setSlug(slug: string) {
    this.slug = slug;
  }
}
