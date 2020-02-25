import { Msg, MsgProcessor } from './create-send-mail'
import createListHandlers, {
  ListGetter,
  ListSetter,
  ListProcessor
} from './create-list-handlers'
import { CallIfEnabled } from './create-call-if-enabled'

export type NotifyHook = (msg: Msg) => void
export type NotifyHooksGetter = ListGetter<NotifyHook>
export type NotifyHookSetter = ListSetter<NotifyHook>

export type NotifyHookList = {
  getNotifyHooks: ListGetter<NotifyHook>;
  addNotifyHook: NotifyHookSetter;
  removeNotifyHook: NotifyHookSetter;
  runNotifyHooks: MsgProcessor;
  dropNotifyHooks: ListProcessor;
}

const createNotifyHookList = (
  callIfEnabled: CallIfEnabled<NotifyHookSetter | ListProcessor | MsgProcessor>
): NotifyHookList => {
  const { get: getNotifyHooks, add, remove, drop } = createListHandlers<
    NotifyHook
  >()

  const runNotifyHooks = callIfEnabled((msg: string): void => {
    const notifyHooks = getNotifyHooks()

    notifyHooks.forEach((curNotifyHooks: NotifyHook): void => {
      curNotifyHooks(msg)
    })
  })

  const addNotifyHook = callIfEnabled(add)
  const removeNotifyHook = callIfEnabled(remove)
  const dropNotifyHooks = callIfEnabled(drop)

  return {
    getNotifyHooks,
    addNotifyHook,
    removeNotifyHook,
    runNotifyHooks,
    dropNotifyHooks
  }
}

export default createNotifyHookList
