import { useEffect, useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Spinner } from "../ui/spinner"
import { useInkathon } from "@scio-labs/use-inkathon"
import { Vault } from '@water-cooler-studios/ike-sdk'

export const AnalyticsPage = () => {
  const { api, activeAccount } = useInkathon()
  const [vault] = useState<Vault>(new Vault())
  const [apy, setApy] = useState<number>()

  useEffect(() => {
    const configureSdk = async () => {
      await vault.init(api, "alephzero-testnet")
    }

    if(api && activeAccount?.address) {
      configureSdk()
    }
  }, [api, activeAccount?.address, vault])

  useEffect(() => {
    const getApy = async () => {
      const apy = await vault.get30DayApy()
      
      setApy(apy)
    }

    if(api && vault) { 
      getApy()
    }
  }, [api, vault])

  return (
    <>
      <div className="flex max-w-[22rem] grow flex-col gap-4">
        <h2 className="text-center font-mono text-gray-400">Chain Info</h2>

        <Card>
          <CardContent className="pb-3 pt-6">
            <div className="flex min-w-[10rem] items-center justify-center gap-2 rounded-2xl border bg-gray-900 px-4 py-3 font-mono text-sm font-bold text-foreground">
            APY = {apy}
          </div>  
          </CardContent>
        </Card>
      </div>
    </>
  )
}
