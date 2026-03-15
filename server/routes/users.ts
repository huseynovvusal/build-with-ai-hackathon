import { Router } from 'express';
import prisma from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { role, skill, search } = req.query;

    const where: any = { isDisabled: false };
    if (role) where.role = role;
    if (search) where.name = { contains: String(search) };
    if (skill) {
      where.skills = {
        some: {
          skill: { name: { contains: String(skill) } }
        }
      };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        githubUsername: true,
        role: true,
        timezone: true,
        availabilityHours: true,
        lastActiveAt: true,
        skills: { include: { skill: true } }
      }
    });

    res.json(users.map(u => ({
      ...u,
      skills: u.skills.map(us => us.skill.name)
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, githubUsername, rolePreference, timezone, availabilityHours, skills } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        githubUsername,
        role: rolePreference === 'organizer' ? 'organizer' : 'member',
        timezone,
        availabilityHours: parseInt(availabilityHours) || 0,
      }
    });

    if (skills && Array.isArray(skills)) {
      // Clear existing skills
      await prisma.userSkill.deleteMany({ where: { userId: user.id } });
      
      for (const skillName of skills) {
        const skill = await prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName }
        });
        await prisma.userSkill.create({
          data: { userId: user.id, skillId: skill.id }
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
