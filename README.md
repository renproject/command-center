# `🎛️ Command Center`

[mainnet.renproject.io](https://mainnet.renproject.io)

The Command Center is a dashboard for seeing RenVM stats and for operating darknodes. It should be used along side the [Darknode CLI](https://github.com/renproject/darknode-cli).

For instructions on running a darknode, see [docs.renproject.io/darknodes](https://docs.renproject.io/darknodes).

## Previews

Network stats

![preview 1](./preview-1.png)

Darknode page

![preview 2](./preview-2.png)

## Developer notes

### Project

The project is structured into [`components`](./src/components), [`store`](./src/store) and [`lib`](./src/lib).

The library (`lib`) files of note are:

* [`contractReads.ts`](./src/lib/ethereum/contractReads.ts)
* [`contractWrites.ts`](./src/lib/ethereum/contractWrites.ts)

### Running locally

After cloning, run:

```sh
yarn
yarn start
```

Change the network with the environment variable `REACT_APP_NETWORK="testnet"`.

### Tests

(see [CircleCI config](./.circleci/config.yml) for more details)

In one terminal, start a local Ethereum node by running:

```bash
cd ./node_modules/darknode-sol
yarn install
(yarn ganache-cli -d  > /dev/null &)
sleep 5
yarn truffle migrate 
```

In another, run:

```bash
yarn run test
```