const deprecatedCaller = newMethod => (...args) => {
  const result = newMethod(...args)
  // tslint:disable-next-line: no-console
  console.log(`deprecated! called ${newMethod.name} insted`)
  return result
}

export default deprecatedCaller
