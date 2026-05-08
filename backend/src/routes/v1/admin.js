import { Router } from "express";
import { getUsers, updateUserRole } from "../../controllers/adminController.js";
import { authenticate, requireRole } from "../../middleware/auth.js";

const router = Router();
router.use(authenticate, requireRole("ADMIN"));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: List all users with task counts (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated user list
 *       403:
 *         description: Forbidden
 */
router.get("/users", getUsers);

/**
 * @swagger
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     summary: Update a user's role (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: Role updated
 *       403:
 *         description: Forbidden
 */
router.patch("/users/:id/role", updateUserRole);

export default router;
