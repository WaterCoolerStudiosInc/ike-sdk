import { useState, useEffect, SetStateAction } from 'react';
import { TxParams, Vault } from '@water-cooler-studios/ike-sdk'
import { useInkathon, contractQuery, usePSP22Balances, decodeOutput, useBalance } from '@scio-labs/use-inkathon';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { contractTxWithToast } from '@/utils/contract-tx-with-toast';

export function Unstake() {
  const { api, activeAccount } = useInkathon()
  const [inputValue, setInputValue] = useState('1')
  const [stakeRatio, setStakeRatio] = useState('1')
  const [isLoading, setIsLoading] = useState(false)
  const [vault] = useState<Vault>(new Vault())

  const { reducibleBalance, reducibleBalanceFormatted } = useBalance(activeAccount?.address, true, {
    forceUnit: false,
  })
  
  // This should be done at a project level in a context
  useEffect(() => {
    const configureSdk = async () => {
      await vault.init(api, "alephzero-testnet")
    }

    if(api && activeAccount?.address) {
      configureSdk()
    }
  })

  useEffect(() => {
    if (api && vault && inputValue) {
      getUnStakeRatio()
    }
  }, [api, vault, inputValue])

  const getUnStakeRatio =  async () => {
    if (!api || !activeAccount?.address || !vault) {
      return
    }

    const queryParams = vault.getAzeroFromSharesQuery(inputValue)
    const query = await contractQuery(api, activeAccount.address, queryParams.contract, queryParams.method, queryParams.options, queryParams.args)
    
    const { isError, decodedOutput } = decodeOutput(query,  queryParams.contract, queryParams.method)
    if (isError) throw new Error(decodedOutput)
    setStakeRatio(vault.decodeBnToString(decodedOutput))  
  }

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (api && activeAccount?.address) {
      const stake = await vault.requestUnlockTx(inputValue)
      setIsLoading(true)
      await contractTxWithToast(
        api,
        activeAccount?.address,
        stake.contract,
        stake.method,
        stake.options,
        stake.args
      )
    }
    setInputValue('')
    setIsLoading(false)
  }

  const handleChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setInputValue(e.target.value);
  };

  
  return (
    <Card>
      <CardContent className="pb-3 pt-6">
        <h2 style={{ marginBottom: '1.5rem' }}>Request unlock of sAZERO</h2>
        <form onSubmit={handleStake}>
          <Input 
            type="number" 
            value={inputValue} 
            onChange={handleChange} 
            placeholder="Enter text here"
          />
          <br></br>
          <strong>To Recieve: {stakeRatio} AZERO</strong>
          <br></br>
          <Button type="submit">Submit</Button>
        </form>

        <div className="flex min-w-[10rem] items-center justify-center gap-2 rounded-2xl border bg-gray-900 px-4 py-3 font-mono text-sm font-bold text-foreground">
          AZERO balance = {reducibleBalanceFormatted}
        </div>
      </CardContent>
    </Card>
  )
}