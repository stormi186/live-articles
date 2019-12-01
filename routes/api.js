'use strict'

var mongoose = require('mongoose')
var mongooseConfig = require('../config/mongoose_config')
require('dotenv').config()
var CONNECTION_STRING = process.env.MONGO_DB
var { Article } = require('../models/Article')

mongoose.connect(CONNECTION_STRING, mongooseConfig)

module.exports = app => {
  app.post('/articles/', (req, res, next) => {
    const body = req.body

    const article = new Article({
      title: body.title,
      published: body.published,
      site: body.site
    })

    article.save()
      .then(res.redirect('/'))
      .catch(error => next(error))
  })
}