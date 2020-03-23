// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deprecatedCaller = <Fn extends (...args: any[]) => any>(
  newMethod: Fn,
) => (...args: Parameters<Fn>): ReturnType<Fn> => {
  const result = newMethod(...args)
  // tslint:disable-next-line: no-console
  console.log(`deprecated! called ${newMethod.name} instead`)
  return result
}

export default deprecatedCaller
