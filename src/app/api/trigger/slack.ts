export async function sendNotification(name: string, description: string, url: string, teams: string[], milestoneOf?: string) {
  let context = `Teams: ${teams.join(", ")}`
  let emoji = ":dart:"
  if(milestoneOf) {
    context += ` • Project: ${milestoneOf}`
    emoji = ":star2:"
  }

  const payload = {
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `${emoji} *${name}*`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": ":globe_with_meridians: Linear",
            "emoji": true
          },
          "value": "click_me_123",
          "url": url,
          "action_id": "button-action"
        }
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "plain_text",
            "text": context,
            "emoji": true
          }
        ]
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `>${description.trim() ? description : "_No description_"}`,
        }
      },
      {
        "type": "divider"
      }
    ]
  }

  const res = await fetch(process.env.SLACK_HOOK_URL as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  if(!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }
}