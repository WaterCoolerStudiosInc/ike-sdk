import { contractTxWithToast } from "@/utils/contract-tx-with-toast"
import { contractCallDryRun, contractQuery, decodeOutput, useInkathon } from "@scio-labs/use-inkathon"
import { TxParams, Vault, UnlockRequest, UserUnlockRequests } from '@water-cooler-studios/ike-sdk'
import { AwaitedReactNode, JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react"
import { CardFooter } from "../ui/card"
import { Button } from "../ui/button"
import { cn } from "@/utils/cn"
import { intervalToDuration } from 'date-fns'

export function UnlockRequests() {
  const { api, activeAccount } = useInkathon()
  const [vault] = useState<Vault>(new Vault())
  const [unlockRequests, setunlockRequests] = useState<UserUnlockRequests>({} as UserUnlockRequests)

  const now = Date.now()

  useEffect(() => {
    const configureSdk = async () => {
      await vault.init(api, "alephzero-testnet")
    }

    if(api && activeAccount?.address) {
      configureSdk()
      updateunlockRequests()
    }
  }, [[api, vault, activeAccount?.address]])

  const updateunlockRequests = async () => {
    if (!api || !activeAccount?.address || !vault) {
      return
    }

    const queryParams = vault.getUnlockRequestsQuery(activeAccount.address)
    const query = await contractQuery(api, activeAccount.address, queryParams.contract, queryParams.method, queryParams.options, queryParams.args)
    
    const { isError, decodedOutput } = decodeOutput(query,  queryParams.contract, queryParams.method)
    if (isError) throw new Error(decodedOutput)

    setunlockRequests(vault.parseUnlockRequests(decodedOutput))
  }

  const handleClaim = async (request: any) => {
    if (!api || !activeAccount?.address || !vault) {
      console.error('Wallet not connected. Try again…')
      return
    }

    const queryParams = vault.redeemTx(activeAccount.address, request.userUnlockId)

    const dryRunOutcome = await contractCallDryRun(
      api,
      activeAccount.address,
      queryParams.contract,
      queryParams.method,
      queryParams.options,
      queryParams.args
    )

    const {isError} = decodeOutput(dryRunOutcome, queryParams.contract, queryParams.method)

    try {
      if (!isError) {
        console.log(`Redeeming user unlock request #${request.userUnlockId}`)
        await contractTxWithToast(
          api,
          activeAccount.address,
          queryParams.contract,
          queryParams.method,
          queryParams.options,
          queryParams.args
        )
      } else {
        const queryParams = vault.redeemWithWithdrawTx(activeAccount.address, request.userUnlockId)
        console.log(`Redeeming (with withdraw) user unlock request #${request.userUnlockId}`)
        await contractTxWithToast(
          api,
          activeAccount.address,
          queryParams.contract,
          queryParams.method,
          queryParams.options,
          queryParams.args
        )
      }
    } catch (e) {
      console.error(e)
    }
  }
  
  return (
    <CardFooter className="flex flex-col items-start gap-2 text-sm text-secondary">
      <h3 className="mt-6 w-full border-b border-secondary pb-3 text-primary">Unstake Requests</h3>
      <ul
        className={cn(
          'flex  w-full flex-col overflow-x-hidden  rounded-md  scrollbar-thin ',
          unlockRequests?.pendingUserUnlockRequests?.length > 4 && 'h-[150px] overflow-y-scroll',
          unlockRequests?.claimableUserUnlockRequests?.length < 2 || unlockRequests?.pendingUserUnlockRequests?.length < 2
            ? 'h-auto'
            : 'h-[150px]',
        )}
      >
        {unlockRequests?.pendingUserUnlockRequests?.map((item: { claimableTime: string; creationTime: any; azero: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined }) => {
          const waitPeriod = intervalToDuration({
            start: now,
            end: Number.parseInt(item.claimableTime),
          })
          return (
            <li
              key={item.creationTime + item.azero}
              className=" flex w-full  items-center gap-1  px-1 py-2  xls:gap-4"
            >
              <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 whitespace-nowrap text-[0.65rem] font-medium xls:text-xs md:gap-6  md:text-sm">
                <span className=" text-secondary">
                  {item.azero}
                </span>
                <span className="justify-self-end">
                  Ready in{' '}
                  <span className="text-primary">
                    {waitPeriod?.days ?? 0}d {waitPeriod?.hours ?? 0}h {waitPeriod?.minutes ?? 0}M
                  </span>
                </span>
              </div>
            </li>
          )
        })}
        {unlockRequests?.claimableUserUnlockRequests?.map((item: { creationTime: any; azero: any; claimableTime?: string; userUnlockId?: string }) => (
          <li
            key={item.creationTime + item.azero}
            className=" flex w-full  items-center gap-1  px-1 py-2  xls:gap-4"
          >
            <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 whitespace-nowrap text-[0.65rem] font-medium xls:text-xs md:gap-6  md:text-sm">
              <span className=" text-primary">
                {item.azero}
              </span>
              <span className="justify-self-end">Ready now</span>
              <span className="justify-self-end">
                <Button
                  className="h-auto w-max px-4 py-1 "
                  variant="default"
                  onClick={() => handleClaim(item)}
                >
                  Claim
                </Button>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </CardFooter>
  )
}
