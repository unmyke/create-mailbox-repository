// tslint:disable: no-console
import { Msg } from './create-send-mail'

const defaultSendHook = (msg: Msg): void => {
  console.log(`send state: ok`)
  console.log(`msg text  : ${msg}`)
}

export default defaultSendHook
