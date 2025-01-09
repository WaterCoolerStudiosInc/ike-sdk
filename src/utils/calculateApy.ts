import { divideStrings } from './bigNumberFmt'

export async function calculateApy(data): Promise<number> {
  const numberOfDays = data.length

  // Calculate daily reward rates and sum them up
  let totalYieldNet = 0

  // we only care about latest minted and total shares
  const userSharePercent = divideStrings(
    data[0].mintedSharesAtStartOfEra,
    data[0].totalSharesAtStartOfEra,
  )

  // Use string math for rewards and staked amounts. But rates should be rather miniscule
  for (let i = 0; i < numberOfDays; i++) {
    // totalDailyRewardRate += reward[i] / stakedAmt
    const dailyGrossYield = divideStrings(data[i].reward, data[i].totalPooledAtStartOfEra)


    const dailyYieldNet = Number(dailyGrossYield) * Number(userSharePercent)

    totalYieldNet += dailyYieldNet
  }

  const totalYieldNetNum = Number(totalYieldNet)

  // Calculate the average daily reward rate
  const averageDailyYieldNet = totalYieldNetNum / numberOfDays

  // Calculate the APY using the formula for daily compounding
  const apy = (1 + averageDailyYieldNet) ** 365 - 1

  // Convert the APY to percentage
  const apyPercentage = apy * 100

  console.log(apyPercentage)

  return apyPercentage
}
