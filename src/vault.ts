import { ContractPromise } from '@polkadot/api-contract'
import { ContractOptions } from '@polkadot/api-contract/types'

import { addStrings, convertString, removeCommas, toInt } from "./utils/bigNumberFmt"
import { TxParams } from './models/txParams'
import { UnlockRequest, UserUnlockRequests } from './models/userUnlockRequest'
import { getEraDurationMs } from './utils/eraInfo'

/**
 * https://docs.ike.xyz/the-ike-protocol/architecture/smart-contract-functions#unstaking-functions
 *
 * @export
 * @class Vault
 */
export class Vault {
  public chainId: string
  public vaultContract: ContractPromise
  public shareTokenContract: ContractPromise

  /**
   * Initialize the SDK
   *
   * @param {*} api
   * @param {('alephzero' | 'alephzero-testnet')} chainId
   * @memberof Vault
   */
  public async init(api: any, chainId: 'alephzero' | 'alephzero-testnet') {
    this.chainId = chainId

    const { default: vaultAbi } = await import(`@water-cooler-studios/ike-contracts/deployments/${this.chainId}/vault/vault.json`, {
      assert: { type: 'json' },
    })

    const { address: vaultAddress } = await import(`@water-cooler-studios/ike-contracts/deployments/${this.chainId}/vault/deployment`)

    this.vaultContract = new ContractPromise(api, vaultAbi, vaultAddress)

    const { default: shareTokenAbi } = await import(`@water-cooler-studios/ike-contracts/deployments/${this.chainId}/share_token/share_token.json`, {
      assert: { type: 'json' },
    })

    const { address: shareTokenAddress } = await import(`@water-cooler-studios/ike-contracts/deployments/${this.chainId}/share_token/deployment`)

    this.shareTokenContract = new ContractPromise(api, shareTokenAbi, shareTokenAddress)
  }

  /**
   * Stake AZERO with Ike's Vault
   *
   * @param {string} azero represented as a string ie '10.10'
   * @return {*}  {TxParams} - transaction params needed to call the IVault::stake transaction
   * @memberof Vault
   */
  public stakeTx(azero: string): TxParams {
    const method = 'IVault::stake'
    const value = convertString(azero, this.vaultContract.api.registry.chainDecimals?.[0] || 12)
    const options = { value } as ContractOptions
    const args = []

    return {
      contract: this.vaultContract,
      method: method,
      options: options,
      args: args
    } as TxParams
  }

  /**
   * Get the transaction params needed to request an unlock within Ike's Vault
   *
   * @param {string} shares represented as a string ie '10.10'
   * @return {*}  {TxParams} - transaction params needed to call the request IVault::request_unlock transaction
   * @memberof Vault
   */
  public requestUnlockTx(shares: string): TxParams {
    const method = 'IVault::request_unlock'
    const value = this.decimalToBnString(shares)
    const options = {} as ContractOptions
    const args = [value]

    return {
      contract: this.vaultContract,
      method: method,
      options: options,
      args: args
    } as TxParams
  }

  /**
   * Redeems an unlock ie returns the user's available unstaked AZERO to their wallet from the Vault.
   * A dry run should first be ran, and if it fails, redeemWithWithdrawTx should be called instead
   * 
   * @param {string} walletAddress
   * @param {string} userUnlockId
   * @return {*}  {TxParams} - transaction params needed to call the IVault::redeem transaction
   * @memberof Vault
   */
  public redeemTx(walletAddress: string, userUnlockId: string): TxParams {
    const method = 'IVault::redeem'
    const options = {} as ContractOptions
    const args = [walletAddress, userUnlockId]

    return {
      contract: this.vaultContract,
      method: method,
      options: options,
      args: args
    } as TxParams
  }

  /**
   * Executes delegateWithdrawUnbonded as well as redeem methods
   *
   * @param {string} walletAddress
   * @param {string} userUnlockId
   * @return {*}  {TxParams} - transaction params needed to call the IVault::redeem_with_withdraw transaction
   * @memberof Vault
   */
  public redeemWithWithdrawTx(walletAddress: string, userUnlockId: string): TxParams {
    const method = 'IVault::redeem_with_withdraw'
    const options = {} as ContractOptions
    const args = [walletAddress, userUnlockId]

    return {
      contract: this.vaultContract,
      method: method,
      options: options,
      args: args
    } as TxParams
  }

  /**
   * Returns the number of AZERO a given number of shares represent at this moment
   *
   * @param {string} shares represented as a string ie '10.10'
   * @return {*}  {TxParams} - transaction params needed to call the 'IVault::get_azero_from_shares query
   * @memberof Vault
   */
  public getAzeroFromSharesQuery(shares: string): TxParams {
    const method = 'IVault::get_azero_from_shares'
    const value = this.decimalToBnString(shares)
    const options = {} as ContractOptions
    const args = [value]

    return {
      contract: this.vaultContract,
      method: method,
      options: options,
      args: args
    } as TxParams
  }

  /**
   * Returns the number of SHARES a given number of AZERO represent at this moment
   * 
   * @param {string} azero
   * @return {*}  {TxParams} - transaction params needed to call the IVault::get_shares_from_azero query   
   * @memberof Vault
   */
  public getSharesFromAzeroQuery(azero: string): TxParams {
    const method = 'IVault::get_shares_from_azero'
    const value = this.decimalToBnString(azero)
    const options = {} as ContractOptions
    const args = [value]

    return {
      contract: this.vaultContract,
      method: method,
      options: options,
      args: args
    } as TxParams
  }

  /**
   * A list of unlock requests an address has made but not redeemed
   *
   * @param {string} walletAddress
   * @return {*}  {TxParams} - transaction params needed to call the IVault::get_unlock_requests query   
   * @memberof Vault
   */
  public getUnlockRequestsQuery(walletAddress: string): TxParams {
    const method = 'IVault::get_unlock_requests'
    const options = {} as ContractOptions
    const args = [walletAddress]

    return {
      contract: this.vaultContract,
      method: method,
      options: options,
      args: args
    } as TxParams
  }

  /**
   * Returns the balance of SHARES an address holds
   *
   * @param {string} walletAddress
   * @return {*}  {TxParams} - transaction params needed to call the PSP22::balance_of query   
   * @memberof Vault
   */
  public getShareTokenBalanceQuery(walletAddress: string): TxParams {
    const method = 'PSP22::balance_of'
    const options = {} as ContractOptions
    const args = [walletAddress]

    return {
      contract: this.shareTokenContract,
      method: method,
      options: options,
      args: args
    } as TxParams
  }

  /**
   * Helper function to parse out unlock requests by claimable/pending
   *
   * @param {string} decodedOutput - decoded output
   * @return {*}  {UserUnlockRequests}
   * @memberof Vault
   */
  public parseUnlockRequests(decodedOutput: string): UserUnlockRequests {
    const userUnlockRequests = JSON.parse(decodedOutput) as UnlockRequest[]

    const now = Date.now()
    const eraDuration = getEraDurationMs(this.vaultContract.api)

    const pendingUserUnlockRequests: Array<UnlockRequest> = []
    const claimableUserUnlockRequests: Array<UnlockRequest> = []

    for (let user_unlock_id = 0; user_unlock_id < userUnlockRequests.length; user_unlock_id++) {
      const userUnlockRequest = userUnlockRequests[user_unlock_id]
      // `creationTime` and `azero` are native properties
      userUnlockRequest.creationTime = removeCommas(userUnlockRequest.creationTime)
      userUnlockRequest.azero = this.decodeBnToString(userUnlockRequest.azero)
      // `claimableTime`, and `userUnlockId` are derived
      userUnlockRequest.claimableTime = addStrings(
        userUnlockRequest.creationTime,
        (14 * eraDuration).toString(),
      )
      userUnlockRequest.userUnlockId = user_unlock_id.toString()
      if (toInt(userUnlockRequest.claimableTime) > now) {
        pendingUserUnlockRequests.push(userUnlockRequest)
      } else {
        claimableUserUnlockRequests.push(userUnlockRequest)
      }
    }

    return {
      pendingUserUnlockRequests: pendingUserUnlockRequests,
      claimableUserUnlockRequests: claimableUserUnlockRequests
    } as UserUnlockRequests
  }

  /**
   * Helper function to convert a big number represented as a string, to a decimal represented as a string
   *
   * @param {string} decodedOutput
   * @return {*} 
   * @memberof Vault
   */
  public decodeBnToString(decodedOutput: string) {
    return convertString(decodedOutput, 0, this.vaultContract.api.registry.chainDecimals?.[0] || 12)
  }

  /**
   * Helper function to convert a decimal represented as a string to a big number represented as a string
   *
   * @param {string} decimalString
   * @return {*} 
   * @memberof Vault
   */
  public decimalToBnString(decimalString: string) {
    return convertString(decimalString, this.vaultContract.api.registry.chainDecimals?.[0] || 12)
  }
}
