const express = require('express')
const axios = require('axios').default
const app = express()
/** Middleware */
app.use(express.json())

/** Routes */
app.post('/events', async (req, res) => {
  const { type, data } = req.body
  if (type === 'CommentCreated') {
    const { id, postId, content } = data
    const status = content.includes('orange') ? 'Rejected' : 'Approved'
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentModerated',
      data: {
        id,
        postId,
        content,
        status
      }
    })
  }
  res.send({})
})

/** Server */
const PORT = process.env.PORT || 4003
app.listen(PORT, () => console.log(`App listen on port ${PORT}`))