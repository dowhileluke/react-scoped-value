import { createContext, useContext } from 'react'
import { apply, partialApply } from './apply'

const ScopeContext = createContext()

export function Scope({ value, setValue, children }) {
  return (
    <ScopeContext.Provider value={{ value, setValue }}>
      {children}
    </ScopeContext.Provider>
  )
}

export function useScopedValue(selectorFn) {
  const { value, setValue } = useContext(ScopeContext)
  const partial = selectorFn ? selectorFn(value) : value

  function setPartial(valueOrFn) {
    if (typeof valueOrFn === 'function') {
      setValue(partialApply(selectorFn, valueOrFn))
    }
    else {
      setValue(apply(value, selectorFn, valueOrFn))
    }
  }

  return [partial, setPartial]
}
