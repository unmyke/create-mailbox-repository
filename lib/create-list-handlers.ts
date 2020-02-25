export type List<Item> = Item[]
export type ListGetter<Item> = () => List<Item>
export type ListSetter<Item> = (item: Item) => void
export type ListProcessor = () => void

export type ListHandlers<Item> = {
  get: ListGetter<Item>;
  add: ListSetter<Item>;
  remove: ListSetter<Item>;
  drop: ListProcessor;
}

const createListHandlers = <Item>(): ListHandlers<Item> => {
  let list: Item[] = []

  const get = (): Item[] => {
    return [...list]
  }
  const add = (item: Item): void => {
    list = [...list, item]
  }
  const remove = (item: Item): void => {
    list = list.filter(curItem => {
      return item !== curItem
    })
  }
  const drop = (): void => {
    list = []
  }

  return {
    get,
    add,
    remove,
    drop
  }
}

export default createListHandlers
