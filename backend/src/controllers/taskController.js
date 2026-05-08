import { prisma } from "../lib/prisma.js";

const isAdmin = (user) => user.role === "ADMIN";

export const listTasks = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(isAdmin(req.user) ? {} : { userId: req.user.id }),
      ...(status && { status }),
      ...(priority && { priority }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: isAdmin(req.user)
          ? { user: { select: { id: true, name: true, email: true } } }
          : undefined,
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await prisma.task.create({ data: { ...req.body, userId: req.user.id } });
    res.status(201).json({ success: true, message: "Task created", data: { task } });
  } catch (err) {
    next(err);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (!isAdmin(req.user)) where.userId = req.user.id;

    const task = await prisma.task.findFirst({ where });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (!isAdmin(req.user)) where.userId = req.user.id;

    const existing = await prisma.task.findFirst({ where });
    if (!existing) return res.status(404).json({ success: false, message: "Task not found" });

    const task = await prisma.task.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, message: "Task updated", data: { task } });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (!isAdmin(req.user)) where.userId = req.user.id;

    const existing = await prisma.task.findFirst({ where });
    if (!existing) return res.status(404).json({ success: false, message: "Task not found" });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};
