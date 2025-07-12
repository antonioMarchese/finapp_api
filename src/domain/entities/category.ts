export default class Category {
  constructor(
    private readonly id: number,
    private slug: string,
    private title: string,
    private color: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
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

  setUpdatedAt() {
    this.updatedAt = new Date();
  }
}
