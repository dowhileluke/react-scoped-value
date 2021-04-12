# react-context-slice
A simple way to pass and update partial context values.

#### Demo

A parent component can use a complex state...

```jsx
function App() {
  const [state, setState] = useState({
    firstName: '',
    lastName: ''
  })

  return (
    <Scope value={state} setValue={setState}>
      <Input name="firstName" label="First Name" />
      <Input name="lastName" label="Last Name" />
    </Scope>
  )
}
```

...while a child component can read and update only the data it cares about.

```jsx
function Input({ name, label }) {
  const [value, setValue] = useScopedValue(x => x[name])

  return (
    <label>
      {label}
      <input name={name} value={value} onChange={e => setValue(e.target.value)} />
    </label>
  )
}
```

When the scoped setter receives updates, it generates a fresh, immutable-safe complete state with updates applied before emitting the final object back to `Scope`. 
