const express = require('express')
const axios = require('axios')
const app = express()
/** Middleware */
app.use(express.json())

const events = []

/** Routes */
app.post('/events', (req, res) => {
  const event = req.body
  events.push(event)
  // Send to all different services
  axios.post('http://posts-clusterip-srv:4000/events', event)
  axios.post('http://comments-srv:4001/events', event)
  axios.post('http://query-srv:4002/events', event)
  axios.post('http://moderation-srv:4003/events', event)
  res.send({ status: 'Ok' })
})
// if any service down now it can get the missed event 
app.get('/events', (req, res) => res.send(events))

/** Server */
const PORT = process.env.PORT || 4005
app.listen(PORT, () => console.log(`App listen on port ${PORT}`))
