import { Msg } from './create-send-mail'
import createListHandlers, {
  ListGetter,
  ListSetter,
  ListProcessor
} from './create-list-handlers'
import { CallIfEnabled } from './create-call-if-enabled'

export type Predicate = (msg: Msg) => boolean
export type PredicatesGetter = ListGetter<Predicate>
export type PredicateSetter = ListSetter<Predicate>

export type PredicateList = {
  getPredicates: PredicatesGetter
  addPredicate: PredicateSetter
  removePredicate: PredicateSetter
  checkMsg: Predicate
  dropPredicates: ListProcessor
}

const createPredicateList = (
  callIfEnabled: CallIfEnabled<PredicateSetter | ListProcessor>
): PredicateList => {
  const {
    get: getPredicates,
    add,
    remove,
    drop: dropPredicates
  } = createListHandlers<Predicate>()

  const checkMsg = (msg: string): boolean => {
    const predicates = getPredicates()
    return predicates.reduce(
      (prevPredicateCheck: boolean, curPredicate: Predicate): boolean => {
        return prevPredicateCheck && curPredicate(msg)
      },
      true
    )
  }

  const addPredicate = callIfEnabled(add)
  const removePredicate = callIfEnabled(remove)

  return {
    getPredicates,
    addPredicate,
    removePredicate,
    checkMsg,
    dropPredicates
  }
}

export default createPredicateList
