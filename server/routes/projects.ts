import { Router } from 'express';
import prisma from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { generateRecommendations } from '../utils/matching';
import { createGithubRepo } from '../utils/github';

const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, description, mustHaveTech, rolesNeeded, teamSize } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        mustHaveTech: Array.isArray(mustHaveTech) ? mustHaveTech.join(', ') : mustHaveTech,
        rolesNeeded: Array.isArray(rolesNeeded) ? rolesNeeded.join(', ') : rolesNeeded,
        teamSize: parseInt(teamSize) || 3,
        ownerId: req.user.id,
      }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { name: true, email: true } },
        teamMembers: { include: { user: { select: { name: true, githubUsername: true } } } },
        recommendations: true,
      }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.post('/:id/recommendations', requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const users = await prisma.user.findMany({
      where: { isDisabled: false, role: 'member' },
      include: { skills: { include: { skill: true } } }
    });

    const recommendations = generateRecommendations(project, users);

    // Save recommendations
    for (const rec of recommendations) {
      const dbRec = await prisma.projectRecommendation.create({
        data: {
          projectId: project.id,
          variant: rec.variant,
        }
      });
      // We don't save the full team details in DB for recommendations to keep it simple,
      // we just return them to the frontend. In a real app we might serialize it.
      rec.id = dbRec.id;
    }

    res.json(recommendations);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

router.post('/:id/approve', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { teamMembers } = req.body; // Array of { userId, assignedRole, score }
    const projectId = req.params.id;

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'recruiting' }
    });

    for (const member of teamMembers) {
      await prisma.projectTeamMember.create({
        data: {
          projectId,
          userId: member.userId,
          assignedRole: member.assignedRole,
          score: member.score,
          status: 'approved'
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve team' });
  }
});

router.post('/:id/invites/send', requireAuth, async (req: AuthRequest, res) => {
  try {
    const projectId = req.params.id;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const teamMembers = await prisma.projectTeamMember.findMany({
      where: { projectId, status: 'approved' },
      include: { user: true }
    });

    const invites = [];
    for (const member of teamMembers) {
      const message = `Hi ${member.user.name},\n\nYou've been matched to join "${project.title}" as a ${member.assignedRole}. Your skills are a perfect fit!\n\nAre you available to join?`;
      
      const invite = await prisma.invite.create({
        data: {
          projectId,
          userId: member.userId,
          message,
        }
      });
      invites.push(invite);
    }

    res.json(invites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send invites' });
  }
});

router.post('/:id/github/kickoff', requireAuth, async (req: AuthRequest, res) => {
  try {
    const projectId = req.params.id;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { teamMembers: { include: { user: true } } }
    });
    
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const result = await createGithubRepo(project);
    
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'active' }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create GitHub repo' });
  }
});

export default router;
