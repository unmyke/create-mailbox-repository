import ENVS from './envs'
import defaultSendHook from './default-send-hook'
import { Predicate } from '../create-predicate-list'
import { CallIfEnabled } from '../create-call-if-enabled'

export type Msg = string
export type MsgProcessor = (msg: Msg) => void

export type SendMail = {
  name: string
  checkMsg: Predicate
  runNotifyHooks: MsgProcessor
  callIfMailboxEnabled: CallIfEnabled<MsgProcessor>
  send?: MsgProcessor
}

const createSendMail = ({
  name,
  checkMsg,
  runNotifyHooks,
  callIfMailboxEnabled,
  send
}: SendMail): MsgProcessor => {
  const sendHook =
    process.env.NODE_ENV === ENVS.PROD || !send ? defaultSendHook : send

  return callIfMailboxEnabled((msg: string): void => {
    if (checkMsg(msg)) {
      // insert send logic here
      sendHook(msg)

      runNotifyHooks(msg)
    }
  })
}

export default createSendMail
