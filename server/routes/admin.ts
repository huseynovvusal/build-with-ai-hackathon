import { Router } from 'express';
import prisma from '../db';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/metrics', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const usersCount = await prisma.user.count();
    const activeUsersCount = await prisma.user.count({ where: { isDisabled: false } });
    const projectsCount = await prisma.project.count();
    const invitesCount = await prisma.invite.count();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isDisabled: true,
        createdAt: true,
        lastActiveAt: true,
      }
    });

    const auditLogs = await prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { actorUser: { select: { name: true } } }
    });

    res.json({
      metrics: { usersCount, activeUsersCount, projectsCount, invitesCount },
      users,
      auditLogs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

router.put('/users/:id/role', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { role, isDisabled } = req.body;
    const userId = req.params.id;

    const updateData: any = {};
    if (role) updateData.role = role;
    if (isDisabled !== undefined) updateData.isDisabled = isDisabled;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: req.user.id,
        action: 'UPDATE_USER',
        metadataJson: JSON.stringify({ targetUserId: userId, updateData })
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
