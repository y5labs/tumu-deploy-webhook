const inject = require('seacreature/lib/inject')
const { parentPort } = require('worker_threads')

const detect = body => {
  try {
    return {
      repo: body.repository.ssh_url,
      branch: body.ref.split('refs/heads/')[1]
    }
  }
  catch (e) { return null }
}

inject('pod', async ({ app, hub, log }) => {
  if (parentPort)
    parentPort.on('message', async msg => {
      const { e, p } = JSON.parse(msg)
      await hub.emit(e, p)
    })
  app.post(process.env.GITHUB_WEBHOOK_URL, (req, res) => {
    if (req.hub_verified) {
      const p = detect(req.body)
      if (p && parentPort)
        parentPort.postMessage(JSON.stringify({ e: 'check_changes', p }))
    }
    res.send('ok')
  })
})