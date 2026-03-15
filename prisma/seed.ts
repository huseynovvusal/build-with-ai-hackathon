import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // 1. Create Skills
  const skillNames = [
    'React', 'Node.js', 'Python', 'Java', 'Docker', 'TypeScript',
    'Tailwind CSS', 'PostgreSQL', 'FastAPI', 'Machine Learning',
    'Kubernetes', 'GitHub Actions', 'Agile', 'Next.js', 'React Native',
    'Spring Boot', 'Playwright', 'Cypress', 'OWASP', 'AppSec'
  ];

  const skills = await Promise.all(
    skillNames.map(name =>
      prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const getSkillIds = (names: string[]) => {
    return names.map(n => skills.find(s => s.name === n)?.id).filter(Boolean) as string[];
  };

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      name: 'Aysel Mammadova',
      email: 'aysel@example.com',
      passwordHash,
      githubUsername: 'ayselm',
      role: 'member',
      timezone: 'Asia/Baku',
      availabilityHours: 20,
      skills: ['React', 'TypeScript', 'Tailwind CSS']
    },
    {
      name: 'Kamran Aliyev',
      email: 'kamran@example.com',
      passwordHash,
      githubUsername: 'kamran_dev',
      role: 'member',
      timezone: 'Asia/Baku',
      availabilityHours: 15,
      skills: ['Node.js', 'PostgreSQL', 'TypeScript']
    },
    {
      name: 'Nigar Hasanli',
      email: 'nigar@example.com',
      passwordHash,
      githubUsername: 'nigar_ml',
      role: 'member',
      timezone: 'Asia/Baku',
      availabilityHours: 10,
      skills: ['Python', 'FastAPI', 'Machine Learning']
    },
    {
      name: 'Elvin Abdullayev',
      email: 'elvin@example.com',
      passwordHash,
      githubUsername: 'elvin_ops',
      role: 'member',
      timezone: 'Asia/Baku',
      availabilityHours: 25,
      skills: ['Docker', 'Kubernetes', 'GitHub Actions']
    },
    {
      name: 'Sabina Rahimova',
      email: 'sabina@example.com',
      passwordHash,
      githubUsername: 'sabina_pm',
      role: 'member',
      timezone: 'Asia/Baku',
      availabilityHours: 30,
      skills: ['Agile', 'React']
    },
    {
      name: 'Ramil Ismayilov',
      email: 'ramil@example.com',
      passwordHash,
      githubUsername: 'ramil_fs',
      role: 'member',
      timezone: 'Asia/Baku',
      availabilityHours: 20,
      skills: ['Next.js', 'Node.js', 'React', 'TypeScript']
    },
    {
      name: 'Leyla Karimova',
      email: 'leyla@example.com',
      passwordHash,
      githubUsername: 'leyla_mob',
      role: 'member',
      timezone: 'Asia/Baku',
      availabilityHours: 15,
      skills: ['React Native', 'TypeScript']
    },
    {
      name: 'Farid Huseynov',
      email: 'farid@example.com',
      passwordHash,
      githubUsername: 'farid_backend',
      role: 'member',
      timezone: 'Asia/Baku',
      availabilityHours: 20,
      skills: ['Java', 'Spring Boot', 'PostgreSQL']
    },
    {
      name: 'Gunel Abbasova',
      email: 'gunel@example.com',
      passwordHash,
      githubUsername: 'gunel_qa',
      role: 'member',
      timezone: 'Asia/Baku',
      availabilityHours: 10,
      skills: ['Playwright', 'Cypress', 'TypeScript']
    },
    {
      name: 'Tural Najafov',
      email: 'tural@example.com',
      passwordHash,
      githubUsername: 'tural_sec',
      role: 'member',
      timezone: 'Asia/Baku',
      availabilityHours: 15,
      skills: ['OWASP', 'AppSec', 'Python']
    },
    // Admin and Organizer
    {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      githubUsername: 'admin_cm',
      role: 'admin',
      timezone: 'Asia/Baku',
      availabilityHours: 40,
      skills: []
    },
    {
      name: 'Organizer User',
      email: 'organizer@example.com',
      passwordHash,
      githubUsername: 'org_cm',
      role: 'organizer',
      timezone: 'Asia/Baku',
      availabilityHours: 40,
      skills: []
    }
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        githubUsername: u.githubUsername,
        role: u.role,
        timezone: u.timezone,
        availabilityHours: u.availabilityHours,
      }
    });

    if (u.skills.length > 0) {
      const skillIds = getSkillIds(u.skills);
      for (const skillId of skillIds) {
        await prisma.userSkill.upsert({
          where: {
            userId_skillId: { userId: user.id, skillId }
          },
          update: {},
          create: { userId: user.id, skillId }
        });
      }
    }
  }

  // 3. Create Projects
  const organizer = await prisma.user.findUnique({ where: { email: 'organizer@example.com' } });
  
  if (organizer) {
    const projectsData = [
      {
        title: 'EcoTrack Baku',
        description: 'A mobile app to track carbon footprint and suggest eco-friendly alternatives for citizens of Baku.',
        mustHaveTech: 'React Native, Node.js, PostgreSQL',
        rolesNeeded: 'Frontend Developer, Backend Developer, UI/UX Designer',
        teamSize: 3,
        status: 'recruiting'
      },
      {
        title: 'HealthSync API',
        description: 'A secure API gateway for healthcare providers to share patient records safely.',
        mustHaveTech: 'Java, Spring Boot, OWASP, Docker',
        rolesNeeded: 'Backend Developer, Security Engineer, DevOps',
        teamSize: 3,
        status: 'recruiting'
      },
      {
        title: 'AI Study Buddy',
        description: 'An AI-powered web application that helps students prepare for university entrance exams.',
        mustHaveTech: 'Python, FastAPI, Machine Learning, React',
        rolesNeeded: 'ML Engineer, Full-stack Developer, Data Scientist',
        teamSize: 3,
        status: 'draft'
      }
    ];

    for (const p of projectsData) {
      await prisma.project.create({
        data: {
          ...p,
          ownerId: organizer.id
        }
      });
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
