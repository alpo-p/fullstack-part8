/* eslint-disable no-magic-numbers */
/* eslint-disable consistent-return */
/* eslint-disable multiline-ternary */
/* eslint-disable no-ternary */
const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const JWT_SECRET = 'SECRET123'

const User = require('./models/user')
const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')

require('dotenv').config()
// eslint-disable-next-line no-undef
const MONGODB_URI = process.env.MONGODB_URI 
const mongooseConfig = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }

console.log(`connecting to ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI, mongooseConfig)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((e) => {
    console.log(`error connecting to MongoDB: ${e?.message}`)
  })

mongoose.set('debug', true)

const context = async ({ req }) => {
  const auth = req ? req.headers.authorization : null
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
    const currentUser = await User.findById(decodedToken.id)
    return { currentUser }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})