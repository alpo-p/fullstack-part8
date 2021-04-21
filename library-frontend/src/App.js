import React, { useEffect, useState } from 'react'

import { useApolloClient, useQuery,
  useSubscription } from '@apollo/client'
import { ALL_BOOKS, ALL_AUTHORS, BOOK_ADDED } from './queries'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommended from './components/Recommended'


const App = () => {
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const [page, setPage] = useState('authors')
  const books = useQuery(ALL_BOOKS)
  const authors = useQuery(ALL_AUTHORS)
  const [error, setError] = useState('')

  useEffect(() => {
    setToken(localStorage.getItem('library-user-token'))
  }, [])

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => set.map(b => b.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if(!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook) }
      })
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      //window.alert(`${subscriptionData.data.bookAdded.title} added!`)
      const addedBook = subscriptionData.data.bookAdded
      updateCacheWith(addedBook)
    }
  })

  const showLoginOrLogout = () => {
    const logout = () => {
      setToken(null)
      localStorage.clear()
      client.resetStore()
      setPage('authors')
    }

    if (!token) {
      return (
        <button onClick={() => setPage('login')}>login</button>
      )
    }

    return (
      <span>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommended')}>recommended</button>
        <button onClick={logout}>logout</button>
      </span>
    )
  }

  const handleLogin =  (tok) => {
    setToken(tok)
    setPage('authors')
  }

  return (
    <div>
      {error}
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {showLoginOrLogout()}
      </div>

      <Authors
        show={page === 'authors'}
        result={authors}
      />

      <Books
        show={page === 'books'}
        result={books}
      />

      <NewBook
        show={page === 'add'}
        setError={setError}
      />

      <LoginForm
        show={page === 'login'}
        handleLogin={handleLogin}
      />

      <Recommended
        show={page === 'recommended'}
        result={books}
      />

    </div>
  )
}

export default App