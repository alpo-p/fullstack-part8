import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import Select from 'react-select'
import { ALL_AUTHORS, ALL_BOOKS, EDIT_AUTHOR } from '../queries'

const SetBirthYear = ({ result }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS}, { query: ALL_BOOKS }]
  })

  const submit = e => {
    e.preventDefault()
    editAuthor({ variables: { name: name.value, setBornTo: Number(born) } })

    setName('')
    setBorn('')
  }

  const allAuthorNames = result?.data?.allAuthors?.map(a => a.name)

  const options = allAuthorNames?.map(name => (
    { value: name, label: name }
  ))

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          <Select
            defaultValue={name}
            onChange={setName}
            options={options}
          />
        </div>
        <div>
          born
          <input 
            type='number'
            value={born}
            onChange={({ target }) => setBorn(target.value)} />
        </div>
        <div>
          <button type="submit">update author</button>
        </div>
      </form>
    </div>
  )
}

const Authors = ({ show, result }) => {
  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {result.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <SetBirthYear result={result}/>
    </div>
  )
}

export default Authors
