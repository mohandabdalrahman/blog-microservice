const express = require('express')
const cors = require('cors')
const axios = require('axios').default
const app = express()

/** Middleware */
app.use(express.json())
app.use(cors())

/** Data Store
 * posts === {
 * "postId":{
 * id,
 * title,
 * comments:[
 * {id,content}
 * ]
 * }
 * }
 * 
 */
const posts = {}


const handleEvents = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data
    posts[id] = { id, title, comments: [] }
  }
  if (type === 'CommentCreated') {
    const { id, postId, content, status } = data
    const post = posts[postId]
    post.comments.push({ id, content, status })
  }
  if (type === 'CommentUpdated') {
    const { id: commentId, postId, content, status } = data
    const post = posts[postId]
    const comment = post.comments.find(comment => comment.id === commentId)
    comment.status = status
    comment.content = content
  }
}

/** Routes */
app.post('/events', (req, res) => {
  const { type, data } = req.body
  handleEvents(type, data)
  res.send({})
})

app.get('/posts', (_, res) => {
  res.send(posts)
})
/** Server */
const PORT = process.env.PORT || 4002
app.listen(PORT, async () => {
  console.log(`App listen on port ${PORT}`)
  const { data } = await axios.get('http://event-bus-srv:4005/events')
  for (let event of data) {
    handleEvents(event.type, event.data)
  }

})