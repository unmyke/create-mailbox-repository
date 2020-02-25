import createListHandlers, { List } from '../lib/create-list-handlers'

type Item = { name: string }

describe('list::', () => {
  describe('if no item added to list', () => {
    let list: List<Item>
    const { get } = createListHandlers<Item>()

    test('returns empty list', () => {
      list = get()
      expect(list).toHaveLength(0)
    })
  })

  describe('if 3 items added to list', () => {
    let list: List<Item>
    const { add, get } = createListHandlers<Item>()

    test('returns list with 3 items', () => {
      const item0 = { name: 'item0' }
      const item1 = { name: 'item1' }
      const item2 = { name: 'item2' }

      add(item0)
      add(item1)
      add(item2)

      list = get()
      expect(list).toHaveLength(3)
      expect(list[0]).toBe(item0)
      expect(list[1]).toBe(item1)
      expect(list[2]).toBe(item2)
    })
  })

  describe('if 3 items added to and one removed from list', () => {
    let list: List<Item>
    const { add, remove, get } = createListHandlers<Item>()

    test('returns list with 2 items', () => {
      const item0 = { name: 'item0' }
      const item1 = { name: 'item1' }
      const item2 = { name: 'item2' }

      add(item0)
      add(item1)
      add(item2)
      remove(item1)

      list = get()
      expect(list).toHaveLength(2)
      expect(list[0]).toBe(item0)
      expect(list[1]).toBe(item2)
    })
  })

  describe('if 3 items added to and 1 unexisted removed from list', () => {
    let list: List<Item>
    const { add, remove, get } = createListHandlers<Item>()

    test('returns list with 3 items', () => {
      const item0 = { name: 'item0' }
      const item1 = { name: 'item1' }
      const item2 = { name: 'item2' }
      const item3 = { name: 'item3' }

      add(item0)
      add(item1)
      add(item2)
      remove(item3)

      list = get()
      expect(list).toHaveLength(3)
      expect(list[0]).toBe(item0)
      expect(list[1]).toBe(item1)
      expect(list[2]).toBe(item2)
    })
  })

  describe('if 3 items added to and 3 extisted and 1 unexdisted removed from list', () => {
    let list: List<Item>
    const { add, remove, get } = createListHandlers<Item>()

    test('returns list with 0 items', () => {
      const item0 = { name: 'item0' }
      const item1 = { name: 'item1' }
      const item2 = { name: 'item2' }
      const item3 = { name: 'item3' }

      add(item0)
      add(item1)
      add(item2)
      remove(item0)
      remove(item1)
      remove(item2)
      remove(item3)

      list = get()
      expect(list).toHaveLength(0)
    })
  })
})
