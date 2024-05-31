export async function sendNotification(name: string, description: string, url: string, teams: string[]) {
  const payload = {
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `:rocket:*${name}:rocket:*\n${description}\n\n*Url*: ${url}\n*Teams*: ${teams.join(", ")}`
        },
      },
    ]
  }
  await fetch(process.env.SLACK_HOOK_URL as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
}