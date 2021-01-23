const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');
const axios = require('axios').default
const app = express()

/** MiddleWare */
app.use(express.json())
app.use(cors())

const commentsByPostId = {}

/** Routes */
app.get('/posts/:id/comments', (req, res) => { res.status(200).send(commentsByPostId[req.params.id] || []) })

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = uuidv4()
  const { content } = req.body
  const comments = commentsByPostId[req.params.id] || []
  comments.push({ id: commentId, content, status: 'pending' })
  commentsByPostId[req.params.id] = comments
  
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      postId: req.params.id,
      content,
      status: 'pending'
    }
  })
  res.status(201).send(commentsByPostId[req.params.id])
})

app.post('/events', async (req, res) => {
  const { type, data } = req.body
  if (type === 'CommentModerated') {
    const { id: commentId, postId, content, status } = data
    const comments = commentsByPostId[postId]
    const comment = comments.find(comment => comment.id === commentId)
    comment.status = status
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
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
const PORT = process.env.PORT || 4001
app.listen(PORT, () => console.log(`App listen on port ${PORT}`))
