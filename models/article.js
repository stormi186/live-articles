const mongoose = require('mongoose')
const Schema = mongoose.Schema

const articleSchema = new Schema({
  title: {
    type: String,
    minlength: 3,
    required: true
  },
  published: {
    type: Date,
    required: true
  },
  site: {
    type: String,
    minlength: 3,
    required: true
  },
})

const Article = mongoose.model('Article', articleSchema)

module.exports.Article = Article