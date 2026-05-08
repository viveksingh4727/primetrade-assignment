import Joi from "joi";

export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(1000).allow("", null).optional(),
  status: Joi.string().valid("PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED").default("PENDING"),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").default("MEDIUM"),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().max(1000).allow("", null).optional(),
  status: Joi.string().valid("PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED").optional(),
  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").optional(),
}).min(1);
