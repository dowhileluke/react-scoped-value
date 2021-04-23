import { trace, apply, partialApply } from './apply'

describe('trace()', () => {
  const cases = [
    ['basic use case', x => x.y.z, ['y', 'z']],
    ['no props', x => x, []],
    ['array indexes', x => x.points[0][2].title, ['points', '0', '2', 'title']],
    ['bracket notation', x => x['a']['b'], ['a', 'b']]
  ]

  test.each(cases)('%s', (_, input, intended) => {
    expect(trace(input)).toEqual(intended)
  })
})

describe('apply()', () =>{
  it('builds an immutable-safe structure', () => {
    const data = { a: { b: { c: [{ d: 'text' }] } } }
    const result = apply(data, x => x.a.b.c[0].d, 'new')

    expect(data.a).not.toBe(result.a)
    expect(data.a.b).not.toBe(result.a.b)
    expect(data.a.b.c).not.toBe(result.a.b.c)
    expect(data.a.b.c[0]).not.toBe(result.a.b.c[0])
    expect(result.a.b.c[0].d).toBe('new')
  })

  it('returns `source` when trying to overwrite a value with itself', () => {
    const data = { a: 123, b: { value: 456 } }
    const result = apply(data, x => x.b, data.b)

    expect(result).toBe(data)
  })
})

describe('partialApply()', () => {
  it('matches result from apply()', () => {
    const data = {
      users: [
        { id: 1, name: 'A', age: 1 },
        { id: 2, name: 'B', age: 2 },
        { id: 3, name: 'C', age: 3 },
      ]
    }

    const selectorFn = x => x.users[0].name
    const newValue = 'Z'

    const intended = apply(data, selectorFn, newValue)
    const partialFn = partialApply(selectorFn, () => newValue)
    const result = partialFn(data)

    expect(result).toEqual(intended)
    expect(result.users[1]).toBe(intended.users[1])
  })

  it('creates callbacks that work in any order', () => {
    const data = {
      users: [
        { id: 1, name: 'A', age: 1, tags: [] },
        { id: 2, name: 'B', age: 2, tags: [] },
        { id: 3, name: 'C', age: 3, tags: [] },
      ]
    }

    const callback1 = partialApply(x => x.users[0].name, () => 'Z')
    const callback2 = partialApply(x => x.users[1], prev => ({ ...prev, age: 99 }))

    const result1 = callback2(callback1(data))

    expect(result1.users[0].name).toBe('Z')
    expect(result1.users[1].age).toBe(99)
    expect(result1.users[1].tags).toBe(data.users[1].tags)
    expect(result1.users[2]).toBe(data.users[2])

    // reverse callback order
    const result2 = callback1(callback2(data))

    expect(result2.users[0].name).toBe('Z')
    expect(result2.users[1].age).toBe(99)
    expect(result2.users[1].tags).toBe(data.users[1].tags)
    expect(result2.users[2]).toBe(data.users[2])
  })
})
