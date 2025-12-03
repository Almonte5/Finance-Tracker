import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to current month if no dates provided
    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const end = endDate
      ? new Date(endDate as string)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // Get all transactions in date range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        category: true,
      },
    });

    // Calculate totals
    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    // Group by category
    const categoryBreakdown = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc: any, transaction) => {
        const categoryName = transaction.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = {
            name: categoryName,
            amount: 0,
            color: transaction.category.color,
            count: 0,
          };
        }
        acc[categoryName].amount += transaction.amount;
        acc[categoryName].count += 1;
        return acc;
      }, {});

    const categoryData = Object.values(categoryBreakdown).sort(
      (a: any, b: any) => b.amount - a.amount
    );

    // Get previous month for comparison
    const prevMonthStart = new Date(start);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(end);
    prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);

    const prevMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
    });

    const prevMonthExpenses = prevMonthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseChange = prevMonthExpenses
      ? ((expenses - prevMonthExpenses) / prevMonthExpenses) * 100
      : 0;

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 5,
    });

    res.json({
      summary: {
        income,
        expenses,
        balance,
        transactionCount: transactions.length,
        expenseChange: expenseChange.toFixed(1),
      },
      categoryBreakdown: categoryData,
      recentTransactions,
      dateRange: {
        start,
        end,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSpendingTrend = async (req: Request, res: Response) => {
  try {
    const { months = 6 } = req.query;

    const monthsNum = parseInt(months as string);
    const data = [];

    for (let i = monthsNum - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.userId,
          date: {
            gte: start,
            lte: end,
          },
        },
      });

      const income = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
      });
    }

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};