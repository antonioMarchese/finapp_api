export const transactionSchema = {
  id: expect.any(Number),
  amount: expect.any(Number),
  dueDate: expect.any(Date),
  type: expect.any(String),
  createdAt: expect.any(Date),
  updatedAt: expect.any(Date),
  description: expect.any(String),
  category: {
    id: expect.any(Number),
    title: expect.any(String),
    color: expect.any(String),
  },
};

export const mockCreateTransaction = {
  amount: 100,
  dueDate: new Date(),
  type: 'income',
  categoryId: 1,
  description: 'Test transaction',
};
