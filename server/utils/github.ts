export async function createGithubRepo(project: any) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    // MOCK MODE
    console.log('Running in MOCK MODE: GitHub Token not found.');
    return {
      repoUrl: `https://github.com/mock-org/${project.title.toLowerCase().replace(/\\s+/g, '-')}`,
      filesCreated: ['README.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', '.gitignore'],
      issuesCreated: project.rolesNeeded.split(',').map((r: string) => `Setup tasks for ${r.trim()}`),
      isMock: true
    };
  }

  // REAL MODE (simplified for MVP)
  try {
    const repoName = project.title.toLowerCase().replace(/\\s+/g, '-');
    
    // Create repo
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: repoName,
        description: project.description,
        private: false,
        auto_init: true
      })
    });

    if (!createRes.ok) {
      throw new Error(`GitHub API error: ${createRes.statusText}`);
    }

    const repoData = await createRes.json();
    const owner = repoData.owner.login;

    // Create issues
    const roles = project.rolesNeeded.split(',').map((r: string) => r.trim());
    for (const role of roles) {
      await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `Setup tasks for ${role}`,
          body: `Please review the initial setup requirements for the ${role} role.`
        })
      });
    }

    return {
      repoUrl: repoData.html_url,
      filesCreated: ['README.md (auto-init)'],
      issuesCreated: roles.map((r: string) => `Setup tasks for ${r}`),
      isMock: false
    };
  } catch (error) {
    console.error('GitHub integration error:', error);
    throw new Error('Failed to create GitHub repository');
  }
}
