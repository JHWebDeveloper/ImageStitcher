function testFn(input: string): string
function testFn(input?: undefined): undefined

function testFn(input?: string): string | undefined {
  return input
}

const test = testFn()