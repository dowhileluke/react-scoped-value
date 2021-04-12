import { useState } from 'react'
import { getByRole, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Scope, useScopedValue } from './scope'

describe('Scope/useScopedValue', () => {
  it('passes value', () => {
    function Consumer() {
      const [value] = useScopedValue()

      return value
    }

    function App({ value }) {
      return (
        <Scope value={value}>
          <Consumer />
        </Scope>
      )
    }

    const { rerender } = render(<App value={123} />)

    expect(screen.getByText('123')).toBeInTheDocument()

    rerender(<App value={456} />)
    
    expect(screen.queryByText('456')).toBeInTheDocument()
  })

  it('works with callback-style setter', () => {
    function Consumer() {
      const [count, setCount] = useScopedValue(x => x.count)

      function increment() {
        setCount(n => n + 1)
      }

      return (
        <button onClick={increment}>+1</button>
      )
    }

    const setValue = jest.fn()
    const data = { count: 1, unchanged: 3 }

    render(
      <Scope value={data} setValue={setValue}>
        <Consumer />
      </Scope>
    )

    userEvent.click(screen.getByRole('button'))

    const callbackArg = setValue.mock.calls[0][0]
    const result = callbackArg(data)

    expect(result).toEqual({ count: 2, unchanged: 3 })
  })

  it('allows updates for unsliced value', () => {
    function Consumer() {
      const [, setValue] = useScopedValue()

      return (
        <button onClick={() => setValue(5)}>=5</button>
      )
    }

    const setValue = jest.fn()

    render(
      <Scope value={1} setValue={setValue}>
        <Consumer />
      </Scope>
    )

    userEvent.click(screen.getByRole('button'))

    expect(setValue).toBeCalledWith(5)
  })

  it('plays nicely with text input', () => {
    function Input() {
      const [value, setValue] = useScopedValue(x => x.name)

      return (
        <label>
          Name
          <input value={value} onChange={e => setValue(e.target.value)} />
        </label>
      )
    }

    const setValue = jest.fn()

    render(
      <Scope value={{ name: '', age: 0 }} setValue={setValue}>
        <Input />
      </Scope>
    )

    userEvent.type(screen.getByLabelText('Name'), 'T')

    expect(setValue).toBeCalledWith({ name: 'T', age: 0 })
  })

  it('handles arrays', () => {
    function Consumer() {
      const [list, setList] = useScopedValue(x => x.list)

      function push() {
        setList([...list, {}])
      }

      return (
        <button onClick={push}>push()</button>
      )
    }

    const setValue = jest.fn()
    const data = { list: [{}, {}], unchanged: [] }

    render(
      <Scope value={data} setValue={setValue}>
        <Consumer />
      </Scope>
    )

    userEvent.click(screen.getByRole('button'))

    const callbackArg = setValue.mock.calls[0][0]

    expect(callbackArg).not.toBe(data)
    expect(callbackArg.unchanged).toBe(data.unchanged)
    expect(callbackArg.list[0]).toBe(data.list[0])
    expect(callbackArg.list).toHaveLength(3)
  })

  test('simple Form example', () => {
    function Input({ name, label }) {
      const [value, setValue] = useScopedValue(x => x[name])

      return (
        <label>
          {label}
          <input name={name} value={value} onChange={e => setValue(e.target.value)} />
        </label>
      )
    }

    const onSubmit = jest.fn()
    const initialState = {
      firstName: '',
      lastName: ''
    }
    const expectedState = {
      firstName: 'Leeroy',
      lastName: 'Jenkins'
    }

    function App() {
      const [state, setState] = useState(initialState)

      return (
        <Scope value={state} setValue={setState}>
          <Input name="firstName" label="First Name" />
          <Input name="lastName" label="Last Name" />
          <button onClick={() => onSubmit(state)}>Submit</button>
        </Scope>
      )
    }

    render(<App />)

    userEvent.type(screen.getByLabelText(/first name/i), expectedState.firstName)
    userEvent.type(screen.getByLabelText(/last name/i), expectedState.lastName)
    userEvent.click(screen.getByRole('button'))

    expect(onSubmit).toBeCalledWith(expectedState)
  })
})
