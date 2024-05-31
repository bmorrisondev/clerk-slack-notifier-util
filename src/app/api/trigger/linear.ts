import { sleep } from './utils'

export type GetMilestonesResponse = {
  id: string
  name: string
  is_done: boolean
  project_id: string
  project_name: string
  project_description: string
  project_url: string
  project_teams: string[]
}

export type GetProjectResponse = {
  id: string
  name: string
  description: string
  url: string
  teams: string[]
}


export async function getProjectsWithMilestones() {
  const query = `{
    projects(orderBy: updatedAt, filter: {
      projectMilestones: {
        length: {
          gt: 0
        }
      }
      status: {
        name: {
          neq: "Completed"
        }
      }
    }) {
      nodes {
        id
        updatedAt
        name
        description
        url
        projectMilestones {
          nodes {
            id
            name
          }
        }
        teams {
          edges {
            node {
              name
            }
          }
        }
        status {
          name
        }
      }
    }
  }`
  const res = await exec(query)
  let arr: GetMilestonesResponse[] = []

  const { nodes } = res.data.projects
  for(const projectNode of nodes) {
    for(const milestoneNode of projectNode.projectMilestones.nodes) {
      let isDone = await getMilestoneStatus(milestoneNode.id)
      const m = {
        id: milestoneNode.id,
        name: milestoneNode.name,
        is_done: isDone,
        project_id: projectNode.id,
        project_name: projectNode.name,
        project_description: projectNode.description,
        project_url: projectNode.url,
        project_teams: projectNode.teams.edges.map((el: any) => el.node.name)
      }
      arr.push(m)
      await sleep(500)
    }
  }
  return arr
}

export async function getProjectsWithoutMilestone() {
  const query = `{
    projects(orderBy: updatedAt, filter: {
      projectMilestones: {
        length: {
          eq: 0
        }
      }
      status: {
        name: {
          eq: "Completed"
        }
      }
    }) {
      nodes {
        id
        updatedAt
        name
        description
        url
        teams {
          edges {
            node {
              name
            }
          }
        }
        status {
          name
        }
      }
    }
  }`
  const res = await exec(query)
  let arr: GetProjectResponse[] = []
  res.data.projects.nodes.forEach((el: any) => {
    const p = {
      id: el.id,
      name: el.name,
      description: el.description,
      url: el.url,
      teams: []
    }
    el.teams.edges.forEach(({ node }: any) => {
      // @ts-ignore
      p.teams.push(node.name)
    })
    arr.push(p)
  })
  return arr
}

const closedStatuses = [
  "92fd3e34-6e4c-4ece-a474-138b2dc096d8", // Done
  "ea93e62d-ca16-4619-9a54-b73ce8929985", // Duplicate
  "56993d4c-0f27-465e-845e-37f8051e8e86" // Cancelled
]

// Returns true if all tasks within a milestone are done
export async function getMilestoneStatus(milestoneId: string) {
  const query = `{
    projectMilestone(id: "${milestoneId}") {
      id
      name
      issues {
        nodes {
          id
          state {
            id
          }
        }
      }
    }
  }
  `
  const res = await exec(query)
  const { issues } = res.data.projectMilestone
  let isDone = false
  if(issues?.nodes) {
    const statuses = issues.nodes.map((el: any) => el.state.id)
    isDone = !statuses.some((el: any) => !closedStatuses.includes(el))
  }
  return isDone
}

async function exec(query: string) {
  const url = 'https://api.linear.app/graphql'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.LINEAR_API_KEY as string
    },
    body: JSON.stringify({
      query
    })
  })
  return await res.json()
}
