import useHookMock, { Mock, HookFactory } from "./create-hook-mock"
import { Msg, NotifyHook } from "../../lib"

const useNotifyHookMock = useHookMock(
  (mock: Mock): HookFactory<[number], NotifyHook> => {
    return (num: number): NotifyHook => {
      return (msg: Msg): void => {
        mock(`notifyHook${num}: ${msg}`)
      }
    }
  }
)
export default useNotifyHookMock