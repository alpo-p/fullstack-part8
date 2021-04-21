/* eslint-disable arrow-parens */
const { UserInputError, AuthenticationError, PubSub } = require('apollo-server')
const pubsub = new PubSub()

const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
// eslint-disable-next-line capitalized-comments
// const { v1: uuid } = require('uuid')

const jwt = require('jsonwebtoken')
const JWT_SECRET = 'SECRET123'

const addNewAuthorWithName = (name) => {
  const author = new Author({ name })
  return author.save()

  /*
   *Earlier exercises
   *const author = { name, id: uuid() }
   *authors = authors.concat(author)
   */
}

const resolvers = {
  // Resolvers not done for part 16
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const books = await Book.find({})
      if (!args.genre) {
        return books
      }
      return books.filter((b) => b.genres.includes(args.genre))

      /*
       *Earlier exercises
       * //////////////////////
       *if (!args.author && !args.genre)
       *  return books
       *if (args.author && args.genre)
       *  return books.filter(b => b.author === args.author && b.genres.includes(args.genre))
       *if (args.author)
       *  return books.filter(b => b.author === args.author)
       *if (args.genre)
       *  return books.filter(b => b.genres.includes(args.genre))
       */
    },
    allAuthors: () => Author.find({}),

    me: (_root, _args, context) => context.currentUser,
  },

  Book: {
    author: (root) => Author.findById(root.author)
  },

  Author: {
    bookCount: (root) => Book.countDocuments({ author: root.id })
    // Earlier exercises books.filter(b => b.author === root.name).length
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated!')
      }

      const author = await Author.findOne({ name: args.author }) || await addNewAuthorWithName(args.author)
      const book = new Book({ ...args, author })
      try {
        book.save()
      } catch (e) {
        throw new UserInputError(e?.message, { invalidArgs: args })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book

      /*
       *Earlier exercises
       *const book = { ...args, id: uuid() }
       *books = books.concat(book)
       *if (!authors.some(a => a.name === args.author)) {
       *  addNewAuthorWithName(args.author)
       *}
       *return book
       */
    },
    addAuthor: async (root, args) => {
      const author = new Author({ ...args })
      try {
        await author.save()
      } catch (e) {
        throw new UserInputError(e?.message, { invalidArgs: args })
      }
      return author
    },
    editAuthor: async (_root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated!')
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null 
      }
      author.born = args.setBornTo
      try {
        return await author.save()
      } catch (e) {
        throw new UserInputError(e?.message, { invalidArgs: args })
      }

      /*
       *Earlier exercises
       *const author = authors.find(a => a.name === args.name)
       *if (!author) return null
       *const updatedAuthor = { ...author, born: args.setBornTo}
       *authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
       *return updatedAuthor
       */
    },

    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

      return user.save()
        .catch(e => {
            throw new UserInputError(e?.message, { invalidArgs: args })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'salasana') {
        throw new UserInputError('Wrong creds!')
      }

      const userForToken = {
        username: user.username,
        // eslint-disable-next-line no-underscore-dangle
        id: user._id
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}


module.exports = resolvers