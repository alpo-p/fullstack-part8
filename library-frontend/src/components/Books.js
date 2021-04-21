import React, { useState } from 'react'

const Books = ({ show, result }) => {
  const [filter, setFilter] = useState('all genres')

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  // horrible hack quickly put together to get unique list of genres from books
  let uniqueGenres = []
  const genreArray = result.data.allBooks.map(b => b.genres)
  genreArray.forEach(genres => genres.forEach(genre => {
    if(uniqueGenres.indexOf(genre) === -1)
     uniqueGenres.push(genre)
  }))

  let books = result?.data?.allBooks
  if (filter !== 'all genres') {
    books = books.filter(b => b.genres.includes(filter))
  }

  return (
    <div>
      <h2>books</h2>
      <span>in genre <b>{filter}</b></span>
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
      <div>
        {uniqueGenres.map(genre => 
          <button key={genre} onClick={() => setFilter(genre)}>{genre}</button>  
        )}
        <button onClick={() => setFilter('all genres')}>all genres</button>
      </div>
    </div>
  )
}

export default Books