export function generateRecommendations(project: any, users: any[]) {
  const mustHaveTech = project.mustHaveTech.split(',').map((t: string) => t.trim().toLowerCase());
  const rolesNeeded = project.rolesNeeded.split(',').map((r: string) => r.trim());
  const teamSize = project.teamSize;

  const scoredUsers = users.map(user => {
    const userSkills = user.skills.map((us: any) => us.skill.name.toLowerCase());
    
    // 1. Skill Match (0-60)
    let skillMatch = 0;
    const matchedTech = mustHaveTech.filter((tech: string) => userSkills.includes(tech));
    if (mustHaveTech.length > 0) {
      skillMatch = (matchedTech.length / mustHaveTech.length) * 60;
    } else {
      skillMatch = 60; // If no specific tech required, full points
    }

    // 2. Availability Fit (0-20)
    let availabilityFit = 0;
    if (user.availabilityHours >= 20) availabilityFit = 20;
    else if (user.availabilityHours >= 10) availabilityFit = 10;
    else availabilityFit = 5;

    // 3. Activity Score (0-10) - Mocked based on lastActiveAt
    let activityScore = 5;
    if (user.lastActiveAt) {
      const daysSinceActive = (new Date().getTime() - new Date(user.lastActiveAt).getTime()) / (1000 * 3600 * 24);
      if (daysSinceActive < 7) activityScore = 10;
      else if (daysSinceActive < 30) activityScore = 7;
    }

    // 4. Collaboration Score (0-10) - Mocked
    const collaborationScore = Math.floor(Math.random() * 5) + 5; // 5-10

    const totalScore = skillMatch + availabilityFit + activityScore + collaborationScore;

    return {
      ...user,
      score: totalScore,
      matchedTech,
      details: { skillMatch, availabilityFit, activityScore, collaborationScore }
    };
  });

  // Sort by score descending
  scoredUsers.sort((a, b) => b.score - a.score);

  // Generate 3 variants
  const variants = ['A', 'B', 'C'];
  const recommendations = [];

  for (let i = 0; i < variants.length; i++) {
    const team = [];
    const availableUsers = [...scoredUsers];
    
    // Try to fill roles
    for (const role of rolesNeeded) {
      // Simple heuristic: pick highest scored user not already in team
      // In a real app, we'd match role to user's preferred role
      const userIndex = availableUsers.findIndex(u => !team.find(t => t.userId === u.id));
      if (userIndex !== -1) {
        const user = availableUsers[userIndex];
        team.push({
          userId: user.id,
          name: user.name,
          assignedRole: role,
          score: user.score,
          matchedTech: user.matchedTech,
          whySelected: [
            `Strong match for ${role}`,
            `Matches ${user.matchedTech.length} required technologies`,
            `Available ${user.availabilityHours} hours/week`
          ]
        });
        availableUsers.splice(userIndex, 1);
      }
    }

    // Fill remaining spots if teamSize > rolesNeeded.length
    while (team.length < teamSize && availableUsers.length > 0) {
      const user = availableUsers.shift();
      if (user) {
        team.push({
          userId: user.id,
          name: user.name,
          assignedRole: 'General Member',
          score: user.score,
          matchedTech: user.matchedTech,
          whySelected: [
            `High overall score (${Math.round(user.score)}/100)`,
            `Available ${user.availabilityHours} hours/week`
          ]
        });
      }
    }

    // Calculate coverage
    const allMatchedTech = new Set(team.flatMap(m => m.matchedTech));
    const coverage = Array.from(allMatchedTech);

    recommendations.push({
      variant: variants[i],
      team,
      coverageReport: {
        covered: coverage,
        missing: mustHaveTech.filter((t: string) => !coverage.includes(t))
      }
    });

    // Shuffle slightly for next variant to get different teams
    scoredUsers.sort(() => Math.random() - 0.5);
  }

  return recommendations;
}
