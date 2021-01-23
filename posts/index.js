const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');
const axios = require('axios').default
const app = express()

/** MiddleWare */
app.use(express.json())
app.use(cors())

const posts = {}

/** Routes */
app.get('/posts', (req, res) => { res.status(200).send(posts) })

app.post('/posts/create', async (req, res) => {
  const id = uuidv4()
  const { title } = req.body
  posts[id] = {
    id, title
  }

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'PostCreated',
    data: {
      id,
      title
    }
  })
  res.status(201).send(posts[id])
})

app.post('/events', (req, res) => {
  console.log(`ReceivedEvent ${req.body.type}`);
  res.send({})
})

/** Server */
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log('version 20')
  console.log(`App listen on port ${PORT}`)
})
