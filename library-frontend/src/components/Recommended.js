import { useQuery } from '@apollo/client'
import React from 'react'
import { ME } from '../queries'

const Recommended = ({ show, result }) => {
  let filter = useQuery(ME)

  if (!show) {
    return null
  }

  if (result.loading || filter.loading) {
    return <div>loading...</div>
  }

  // horrible hack quickly put together to get unique list of genres from books
  let uniqueGenres = []
  const genreArray = result.data.allBooks.map(b => b.genres)
  genreArray.forEach(genres => genres.forEach(genre => {
    if(uniqueGenres.indexOf(genre) === -1)
     uniqueGenres.push(genre)
  }))

  filter = filter?.data?.me?.favoriteGenre

  let books = result?.data?.allBooks
  if (filter) {
    books = books.filter(b => b.genres.includes(filter))
  }

  return (
    <div>
      <h2>books</h2>
      <span>books in your favorite genre <b>{filter}</b></span>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(b =>
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended