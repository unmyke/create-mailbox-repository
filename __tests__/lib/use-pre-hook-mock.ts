import useHookMock, { Mock, HookFactory } from "./create-hook-mock"
import { Msg, Predicate } from "../../lib"

const usePreHookMock = useHookMock(
  (mock: Mock): HookFactory<[boolean], Predicate> => {
    return <Boolean extends boolean>(bool: Boolean): ((msg: Msg) => Boolean) => {
      return (msg: Msg): Boolean => {
        mock(msg)
        return bool
      }
    }
  }
)
export default usePreHookMock
