# @water-cooler-studios/ike-sdk

Typescript wrapper for interacting with [Ike Contracts](https://github.com/WaterCoolerStudiosInc/ike-contracts), specifically Vault. Example usage can be found in the [examples directory](examples/README.md)

## Usage

```bash
pnpm install @water-cooler-studios/ike-sdk
```

All tx/query methods return the params needed to perform contract calls using the Polkadot SDK or related frameworks.

```js
import { Vault } from "@water-cooler-studios/ike-sdk";

const vault = new Vault();
await vault.init(api, "alephzero-testnet");

const amount = "1";
const stake = await vault.stakeTx(amount);

// Example usage with inkathon
await contractTxWithToast(
  api,
  activeAccount.address,
  stake.contract,
  stake.method,
  stake.options,
  stake.args
);
```
