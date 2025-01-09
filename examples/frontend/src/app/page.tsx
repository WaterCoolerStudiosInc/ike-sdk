'use client'

import { useEffect } from 'react'

import { useInkathon } from '@scio-labs/use-inkathon'
import { toast } from 'react-hot-toast'

import { ChainInfo } from '@/components/web3/chain-info'
import { ConnectButton } from '@/components/web3/connect-button'
import { Stake } from '@/components/ike/stake'
import { Unstake } from '@/components/ike/unstake'
import { UnlockRequests } from '@/components/ike/unlock-requests'
import { AnalyticsPage } from '@/components/ike/analyticsPage'

export default function HomePage() {
  // Display `useInkathon` error messages (optional)
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      <div className="container relative flex grow flex-col items-center justify-center py-10">
        {/* Connect Wallet Button */}
        <ConnectButton />
        <div className="mt-12 flex w-full flex-wrap items-start justify-center gap-4">
          <AnalyticsPage />
        </div>
        <div className="mt-12 flex w-full flex-wrap items-start justify-center gap-4">
          {/* Ike staking */}
          <Stake />
          <Unstake />
        </div>
        <div className="mt-12 flex w-full flex-wrap items-start justify-center gap-4">
          {/* Unlock requests */}
          <UnlockRequests />
        </div>
        <div className="mt-12 flex w-full flex-wrap items-start justify-center gap-4">
          {/* Chain Metadata Information */}
          <ChainInfo />
        </div>
      </div>
    </>
  )
}
