export async function fetchGraphql(requestBody: any, url: string, cache: RequestCache = 'force-cache') {
  // TODO: put chain config when we create it
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'content-type': 'application/json',
    },
    cache: cache,
  })
  return res
}