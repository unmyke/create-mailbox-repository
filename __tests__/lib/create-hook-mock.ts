import { Msg } from "../../lib"

export type Mock = jest.Mock<Msg, [Msg]>
export type Hook = (msg: Msg) => any
export type HookFactory<
  HookParams extends any[],
  HookType extends Hook
> = (...args: HookParams) => HookType
export type HookFactoryFactory<
  HookParams extends any[],
  HookType extends Hook
> = (mock: Mock) => HookFactory<HookParams, HookType>

const useHookMock = <
  HookParams extends any[],
  HookType extends Hook
>(
  createHookFactory: HookFactoryFactory<HookParams, HookType>): () => {
  createHook: HookFactory<HookParams, HookType>,
  mockFn: Mock
} => (): {
  createHook: HookFactory<HookParams, HookType>,
  mockFn: Mock
} => {
  const mockFn = jest.fn<Msg, [Msg]>((msg: Msg): Msg => msg)
  const createHook = createHookFactory(mockFn)

  return { mockFn, createHook }
}
export default useHookMock
