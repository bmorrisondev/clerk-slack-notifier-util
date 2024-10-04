import { sendNotification } from './slack';
import { getProjectsWithMilestones, getProjectsWithoutMilestone } from './linear';
import { ShippedType, getAllSentItems, logSentItem } from './mysql';
import { sleep } from './utils';

export async function scanForUpdates() {
  console.log('Scanning for updates')
  const res = await getAllSentItems()
  const cache = res.map(el => el.id)
  // Get recent projects with no milestones
  const projects = await getProjectsWithoutMilestone()
  console.log(`Found ${projects.length} projects without milestones`)
  for(const i of projects) {
    if(cache.find(ci => ci === i.id)) {
      continue
    }
    console.log(`Sending notification for project ${i.name}`)
    // Send it
    await sendNotification(i.name, i.description, i.url, i.teams)

    await logSentItem({
      id: i.id,
      name: i.name,
      type: ShippedType.Project,
      sent_on: new Date()
    })
    await sleep(500)
  }

  const milestones = await getProjectsWithMilestones()
  console.log(`Found ${milestones.length} milestones`)
  for(const i of milestones) {
    if(cache.find(ci => ci === i.id)) {
      continue
    }
    console.log(`Sending notification for mileston ${i.name} of project ${i.project_name}`)
    // Send it
    await sendNotification(`${i.name} (${i.project_name} milestone)`, i.project_url, i.project_url, i.project_teams)

    // Log it
    await logSentItem({
      id: i.id,
      name: i.name,
      type: ShippedType.Milestone,
      sent_on: new Date()
    })
    await sleep(500)
  }
}