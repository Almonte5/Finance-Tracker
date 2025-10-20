import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Get all transactions for logged-in user
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, categoryId, type } = req.query;

    const where: any = { userId: req.userId };

    // Filter by date range
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    // Filter by category
    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    // Filter by type
    if (type && ['INCOME', 'EXPENSE'].includes(type as string)) {
      where.type = type as string;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            type: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single transaction
export const getTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a transaction
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { categoryId, amount, type, description, date } = req.body;

    if (!categoryId || !amount || !type || !date) {
      return res.status(400).json({
        error: 'Category, amount, type, and date are required',
      });
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({ error: 'Type must be INCOME or EXPENSE' });
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: req.userId },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.userId!,
        categoryId,
        amount: parseFloat(amount),
        type,
        description: description || null,
        date: new Date(date),
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({ transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a transaction
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { categoryId, amount, type, description, date } = req.body;

    // Check if transaction belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // If updating category, verify it belongs to user
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: req.userId },
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(categoryId && { categoryId }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
      },
      include: {
        category: true,
      },
    });

    res.json({ transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if transaction belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await prisma.transaction.delete({ where: { id } });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};