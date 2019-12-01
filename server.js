'use strict'

var express     = require('express')
var app         = express()
var bodyParser  = require('body-parser')
var cors        = require('cors')
var server      = require('http').createServer(app)
var io          = require('socket.io')(server)
var { Article } = require('./models/Article')
var apiRoutes   = require('./routes/api.js')

app.use(cors({ origin: '*' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'html')
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/styles'))
app.use(express.static(__dirname + '/js'))

io.on('connection', socket => {
  setInterval(() => getDataAndEmit(socket), 100)
  io.emit ('totalUsers', { users: io.engine.clientsCount })
  socket.on('disconnect', () =>
  {
    io.emit ('totalUsers', { users: io.engine.clientsCount })
  })
})

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html')
})

apiRoutes(app)

const getDataAndEmit = socket => {
  Article.find({}, function(err, articles) {
    if (!articles) {
      socket.emit('updating', { success: false, message: 'Articles not found' })
    } else {
      socket.emit('updating', { success: true, articles: articles })
    }
  })
}

app.use((req, res) => {
  res.status(404).sendFile(process.cwd() + '/views/404.html')
})

server.listen(3000)

module.exports = app