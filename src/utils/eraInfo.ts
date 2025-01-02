import { toInt } from "./bigNumberFmt"
import { ApiBase } from "@polkadot/api/types"

export const getEraDurationMs = (api): number => {

  const sessionPeriod = toInt(api.consts.committeeManagement.sessionPeriod.toString())
  const sessionsPerEra = toInt(api.consts.staking.sessionsPerEra.toString())
  return 1_000 * sessionPeriod * sessionsPerEra
}