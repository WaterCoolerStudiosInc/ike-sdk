import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'
import { fetchGraphql } from './fetchGraphql'


// Will get all compound analytics up to the limit.
// There is one per day, so passing in 30 days will get the last 30 days of data (default)
export const GET_COMPOUND_ANALYTICS_WITH_LIMIT = print(gql`
  query MyQuery($limit: Int = 30, $orderBy: [CompoundAnalyticsOrderByInput!] = timestamp_DESC) {
    compoundAnalytics(
      limit: $limit
      orderBy: $orderBy
      where: { eraEndDate_gt: "2024-11-19" }
    ) {
      id
      compoundsEvents
      eraEndBlock
      eraEndDate
      eraStartBlock
      mintedSharesAtStartOfEra
      reward
      totalPooledAtStartOfEra
      totalSharesAtStartOfEra
      virtualSharesAtStartOfEra
    }
  }
`)


export async function getAllCompoundAnalyticsWithLimit(limit: number = 30, url: string) {
  const requestBody = {
    query: GET_COMPOUND_ANALYTICS_WITH_LIMIT,
    variables: {
      limit,
    },
  }

  const res = await fetchGraphql(requestBody, url)
  const result = await res.json()
  return result.data.compoundAnalytics
}