import { ContractPromise } from "@polkadot/api-contract"
import { ContractOptions } from "@polkadot/api-contract/types"

export type TxParams = {
  contract: ContractPromise,
  method: string,
  options: ContractOptions,
  args: any[]
}