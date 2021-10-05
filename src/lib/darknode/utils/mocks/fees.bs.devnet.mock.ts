export const queryBlockStateResponse = {
    jsonrpc: "2.0",
    id: 1,
    result: {
        state: {
            t: {
                struct: [
                    {
                        BCH: {
                            struct: [
                                {
                                    latestHeight: "u256",
                                },
                                {
                                    gasCap: "u256",
                                },
                                {
                                    gasLimit: "u256",
                                },
                                {
                                    gasPrice: "u256",
                                },
                                {
                                    minimumAmount: "u256",
                                },
                                {
                                    dustAmount: "u256",
                                },
                                {
                                    shards: {
                                        list: {
                                            struct: [
                                                {
                                                    shard: "bytes32",
                                                },
                                                {
                                                    pubKey: "bytes",
                                                },
                                                {
                                                    queue: {
                                                        list: {
                                                            struct: [
                                                                {
                                                                    hash: "bytes32",
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    state: {
                                                        struct: [
                                                            {
                                                                outpoint: {
                                                                    struct: [
                                                                        {
                                                                            hash: "bytes",
                                                                        },
                                                                        {
                                                                            index: "u32",
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                            {
                                                                value: "u256",
                                                            },
                                                            {
                                                                pubKeyScript:
                                                                    "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    minted: {
                                        list: {
                                            struct: [
                                                {
                                                    chain: "string",
                                                },
                                                {
                                                    amount: "u256",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    fees: {
                                        struct: [
                                            {
                                                reserved: {
                                                    struct: [
                                                        {
                                                            fund: "u256",
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                unassigned: "u256",
                                            },
                                            {
                                                unclaimed: "u256",
                                            },
                                            {
                                                epochs: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                epoch: "u64",
                                                            },
                                                            {
                                                                amount: "u256",
                                                            },
                                                            {
                                                                numNodes: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                nodes: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                node: "bytes32",
                                                            },
                                                            {
                                                                amountClaimed:
                                                                    "u256",
                                                            },
                                                            {
                                                                nonce: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        BTC: {
                            struct: [
                                {
                                    latestHeight: "u256",
                                },
                                {
                                    gasCap: "u256",
                                },
                                {
                                    gasLimit: "u256",
                                },
                                {
                                    gasPrice: "u256",
                                },
                                {
                                    minimumAmount: "u256",
                                },
                                {
                                    dustAmount: "u256",
                                },
                                {
                                    shards: {
                                        list: {
                                            struct: [
                                                {
                                                    shard: "bytes32",
                                                },
                                                {
                                                    pubKey: "bytes",
                                                },
                                                {
                                                    queue: {
                                                        list: {
                                                            struct: [
                                                                {
                                                                    hash: "bytes32",
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    state: {
                                                        struct: [
                                                            {
                                                                outpoint: {
                                                                    struct: [
                                                                        {
                                                                            hash: "bytes",
                                                                        },
                                                                        {
                                                                            index: "u32",
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                            {
                                                                value: "u256",
                                                            },
                                                            {
                                                                pubKeyScript:
                                                                    "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    minted: {
                                        list: {
                                            struct: [
                                                {
                                                    chain: "string",
                                                },
                                                {
                                                    amount: "u256",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    fees: {
                                        struct: [
                                            {
                                                reserved: {
                                                    struct: [
                                                        {
                                                            fund: "u256",
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                unassigned: "u256",
                                            },
                                            {
                                                unclaimed: "u256",
                                            },
                                            {
                                                epochs: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                epoch: "u64",
                                                            },
                                                            {
                                                                amount: "u256",
                                                            },
                                                            {
                                                                numNodes: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                nodes: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                node: "bytes32",
                                                            },
                                                            {
                                                                amountClaimed:
                                                                    "u256",
                                                            },
                                                            {
                                                                nonce: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        DAI: {
                            struct: [
                                {
                                    latestHeight: "u256",
                                },
                                {
                                    gasCap: "u256",
                                },
                                {
                                    gasLimit: "u256",
                                },
                                {
                                    gasPrice: "u256",
                                },
                                {
                                    minimumAmount: "u256",
                                },
                                {
                                    dustAmount: "u256",
                                },
                                {
                                    shards: {
                                        list: {
                                            struct: [
                                                {
                                                    shard: "bytes32",
                                                },
                                                {
                                                    pubKey: "bytes",
                                                },
                                                {
                                                    queue: {
                                                        list: {
                                                            struct: [
                                                                {
                                                                    hash: "bytes32",
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    state: {
                                                        struct: [
                                                            {
                                                                nonce: "u256",
                                                            },
                                                            {
                                                                gnonces: {
                                                                    list: {
                                                                        struct: [
                                                                            {
                                                                                address:
                                                                                    "string",
                                                                            },
                                                                            {
                                                                                nonce: "u256",
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    minted: {
                                        list: {
                                            struct: [
                                                {
                                                    chain: "string",
                                                },
                                                {
                                                    amount: "u256",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    fees: {
                                        struct: [
                                            {
                                                reserved: {
                                                    struct: [
                                                        {
                                                            fund: "u256",
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                unassigned: "u256",
                                            },
                                            {
                                                unclaimed: "u256",
                                            },
                                            {
                                                epochs: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                epoch: "u64",
                                                            },
                                                            {
                                                                amount: "u256",
                                                            },
                                                            {
                                                                numNodes: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                nodes: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                node: "bytes32",
                                                            },
                                                            {
                                                                amountClaimed:
                                                                    "u256",
                                                            },
                                                            {
                                                                nonce: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        DGB: {
                            struct: [
                                {
                                    latestHeight: "u256",
                                },
                                {
                                    gasCap: "u256",
                                },
                                {
                                    gasLimit: "u256",
                                },
                                {
                                    gasPrice: "u256",
                                },
                                {
                                    minimumAmount: "u256",
                                },
                                {
                                    dustAmount: "u256",
                                },
                                {
                                    shards: {
                                        list: {
                                            struct: [
                                                {
                                                    shard: "bytes32",
                                                },
                                                {
                                                    pubKey: "bytes",
                                                },
                                                {
                                                    queue: {
                                                        list: {
                                                            struct: [
                                                                {
                                                                    hash: "bytes32",
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    state: {
                                                        struct: [
                                                            {
                                                                outpoint: {
                                                                    struct: [
                                                                        {
                                                                            hash: "bytes",
                                                                        },
                                                                        {
                                                                            index: "u32",
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                            {
                                                                value: "u256",
                                                            },
                                                            {
                                                                pubKeyScript:
                                                                    "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    minted: {
                                        list: {
                                            struct: [
                                                {
                                                    chain: "string",
                                                },
                                                {
                                                    amount: "u256",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    fees: {
                                        struct: [
                                            {
                                                reserved: {
                                                    struct: [
                                                        {
                                                            fund: "u256",
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                unassigned: "u256",
                                            },
                                            {
                                                unclaimed: "u256",
                                            },
                                            {
                                                epochs: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                epoch: "u64",
                                                            },
                                                            {
                                                                amount: "u256",
                                                            },
                                                            {
                                                                numNodes: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                nodes: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                node: "bytes32",
                                                            },
                                                            {
                                                                amountClaimed:
                                                                    "u256",
                                                            },
                                                            {
                                                                nonce: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        DOGE: {
                            struct: [
                                {
                                    latestHeight: "u256",
                                },
                                {
                                    gasCap: "u256",
                                },
                                {
                                    gasLimit: "u256",
                                },
                                {
                                    gasPrice: "u256",
                                },
                                {
                                    minimumAmount: "u256",
                                },
                                {
                                    dustAmount: "u256",
                                },
                                {
                                    shards: {
                                        list: {
                                            struct: [
                                                {
                                                    shard: "bytes32",
                                                },
                                                {
                                                    pubKey: "bytes",
                                                },
                                                {
                                                    queue: {
                                                        list: {
                                                            struct: [
                                                                {
                                                                    hash: "bytes32",
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    state: {
                                                        struct: [
                                                            {
                                                                outpoint: {
                                                                    struct: [
                                                                        {
                                                                            hash: "bytes",
                                                                        },
                                                                        {
                                                                            index: "u32",
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                            {
                                                                value: "u256",
                                                            },
                                                            {
                                                                pubKeyScript:
                                                                    "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    minted: {
                                        list: {
                                            struct: [
                                                {
                                                    chain: "string",
                                                },
                                                {
                                                    amount: "u256",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    fees: {
                                        struct: [
                                            {
                                                reserved: {
                                                    struct: [
                                                        {
                                                            fund: "u256",
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                unassigned: "u256",
                                            },
                                            {
                                                unclaimed: "u256",
                                            },
                                            {
                                                epochs: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                epoch: "u64",
                                                            },
                                                            {
                                                                amount: "u256",
                                                            },
                                                            {
                                                                numNodes: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                nodes: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                node: "bytes32",
                                                            },
                                                            {
                                                                amountClaimed:
                                                                    "u256",
                                                            },
                                                            {
                                                                nonce: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        ETH: {
                            struct: [
                                {
                                    latestHeight: "u256",
                                },
                                {
                                    gasCap: "u256",
                                },
                                {
                                    gasLimit: "u256",
                                },
                                {
                                    gasPrice: "u256",
                                },
                                {
                                    minimumAmount: "u256",
                                },
                                {
                                    dustAmount: "u256",
                                },
                                {
                                    shards: {
                                        list: {
                                            struct: [
                                                {
                                                    shard: "bytes32",
                                                },
                                                {
                                                    pubKey: "bytes",
                                                },
                                                {
                                                    queue: {
                                                        list: {
                                                            struct: [
                                                                {
                                                                    hash: "bytes32",
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    state: {
                                                        struct: [
                                                            {
                                                                nonce: "u256",
                                                            },
                                                            {
                                                                gnonces: {
                                                                    list: {
                                                                        struct: [
                                                                            {
                                                                                address:
                                                                                    "string",
                                                                            },
                                                                            {
                                                                                nonce: "u256",
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    minted: {
                                        list: {
                                            struct: [
                                                {
                                                    chain: "string",
                                                },
                                                {
                                                    amount: "u256",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    fees: {
                                        struct: [
                                            {
                                                reserved: {
                                                    struct: [
                                                        {
                                                            fund: "u256",
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                unassigned: "u256",
                                            },
                                            {
                                                unclaimed: "u256",
                                            },
                                            {
                                                epochs: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                epoch: "u64",
                                                            },
                                                            {
                                                                amount: "u256",
                                                            },
                                                            {
                                                                numNodes: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                nodes: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                node: "bytes32",
                                                            },
                                                            {
                                                                amountClaimed:
                                                                    "u256",
                                                            },
                                                            {
                                                                nonce: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        FIL: {
                            struct: [
                                {
                                    latestHeight: "u256",
                                },
                                {
                                    gasCap: "u256",
                                },
                                {
                                    gasLimit: "u256",
                                },
                                {
                                    gasPrice: "u256",
                                },
                                {
                                    minimumAmount: "u256",
                                },
                                {
                                    dustAmount: "u256",
                                },
                                {
                                    shards: {
                                        list: {
                                            struct: [
                                                {
                                                    shard: "bytes32",
                                                },
                                                {
                                                    pubKey: "bytes",
                                                },
                                                {
                                                    queue: {
                                                        list: {
                                                            struct: [
                                                                {
                                                                    hash: "bytes32",
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    state: {
                                                        struct: [
                                                            {
                                                                nonce: "u256",
                                                            },
                                                            {
                                                                gnonces: {
                                                                    list: {
                                                                        struct: [
                                                                            {
                                                                                address:
                                                                                    "string",
                                                                            },
                                                                            {
                                                                                nonce: "u256",
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    minted: {
                                        list: {
                                            struct: [
                                                {
                                                    chain: "string",
                                                },
                                                {
                                                    amount: "u256",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    fees: {
                                        struct: [
                                            {
                                                reserved: {
                                                    struct: [
                                                        {
                                                            fund: "u256",
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                unassigned: "u256",
                                            },
                                            {
                                                unclaimed: "u256",
                                            },
                                            {
                                                epochs: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                epoch: "u64",
                                                            },
                                                            {
                                                                amount: "u256",
                                                            },
                                                            {
                                                                numNodes: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                nodes: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                node: "bytes32",
                                                            },
                                                            {
                                                                amountClaimed:
                                                                    "u256",
                                                            },
                                                            {
                                                                nonce: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        LUNA: {
                            struct: [
                                {
                                    latestHeight: "u256",
                                },
                                {
                                    gasCap: "u256",
                                },
                                {
                                    gasLimit: "u256",
                                },
                                {
                                    gasPrice: "u256",
                                },
                                {
                                    minimumAmount: "u256",
                                },
                                {
                                    dustAmount: "u256",
                                },
                                {
                                    shards: {
                                        list: {
                                            struct: [
                                                {
                                                    shard: "bytes32",
                                                },
                                                {
                                                    pubKey: "bytes",
                                                },
                                                {
                                                    queue: {
                                                        list: {
                                                            struct: [
                                                                {
                                                                    hash: "bytes32",
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    state: {
                                                        struct: [
                                                            {
                                                                nonce: "u256",
                                                            },
                                                            {
                                                                gnonces: {
                                                                    list: {
                                                                        struct: [
                                                                            {
                                                                                address:
                                                                                    "string",
                                                                            },
                                                                            {
                                                                                nonce: "u256",
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    minted: {
                                        list: {
                                            struct: [
                                                {
                                                    chain: "string",
                                                },
                                                {
                                                    amount: "u256",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    fees: {
                                        struct: [
                                            {
                                                reserved: {
                                                    struct: [
                                                        {
                                                            fund: "u256",
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                unassigned: "u256",
                                            },
                                            {
                                                unclaimed: "u256",
                                            },
                                            {
                                                epochs: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                epoch: "u64",
                                                            },
                                                            {
                                                                amount: "u256",
                                                            },
                                                            {
                                                                numNodes: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                nodes: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                node: "bytes32",
                                                            },
                                                            {
                                                                amountClaimed:
                                                                    "u256",
                                                            },
                                                            {
                                                                nonce: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        System: {
                            struct: [
                                {
                                    epoch: {
                                        struct: [
                                            {
                                                hash: "bytes32",
                                            },
                                            {
                                                number: "u64",
                                            },
                                            {
                                                numNodes: "u64",
                                            },
                                            {
                                                timestamp: "u64",
                                            },
                                        ],
                                    },
                                },
                                {
                                    nodes: {
                                        list: {
                                            struct: [
                                                {
                                                    id: "bytes32",
                                                },
                                                {
                                                    enteredAt: "u64",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    shards: {
                                        struct: [
                                            {
                                                primary: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                shard: "bytes32",
                                                            },
                                                            {
                                                                pubKey: "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                secondary: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                shard: "bytes32",
                                                            },
                                                            {
                                                                pubKey: "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                tertiary: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                shard: "bytes32",
                                                            },
                                                            {
                                                                pubKey: "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    signatories: {
                                        list: "bytes32",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        ZEC: {
                            struct: [
                                {
                                    latestHeight: "u256",
                                },
                                {
                                    gasCap: "u256",
                                },
                                {
                                    gasLimit: "u256",
                                },
                                {
                                    gasPrice: "u256",
                                },
                                {
                                    minimumAmount: "u256",
                                },
                                {
                                    dustAmount: "u256",
                                },
                                {
                                    shards: {
                                        list: {
                                            struct: [
                                                {
                                                    shard: "bytes32",
                                                },
                                                {
                                                    pubKey: "bytes",
                                                },
                                                {
                                                    queue: {
                                                        list: {
                                                            struct: [
                                                                {
                                                                    hash: "bytes32",
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    state: {
                                                        struct: [
                                                            {
                                                                outpoint: {
                                                                    struct: [
                                                                        {
                                                                            hash: "bytes",
                                                                        },
                                                                        {
                                                                            index: "u32",
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                            {
                                                                value: "u256",
                                                            },
                                                            {
                                                                pubKeyScript:
                                                                    "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    minted: {
                                        list: {
                                            struct: [
                                                {
                                                    chain: "string",
                                                },
                                                {
                                                    amount: "u256",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    fees: {
                                        struct: [
                                            {
                                                reserved: {
                                                    struct: [
                                                        {
                                                            fund: "u256",
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                unassigned: "u256",
                                            },
                                            {
                                                unclaimed: "u256",
                                            },
                                            {
                                                epochs: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                epoch: "u64",
                                                            },
                                                            {
                                                                amount: "u256",
                                                            },
                                                            {
                                                                numNodes: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                nodes: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                node: "bytes32",
                                                            },
                                                            {
                                                                amountClaimed:
                                                                    "u256",
                                                            },
                                                            {
                                                                nonce: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
            v: {
                BCH: {
                    dustAmount: "546",
                    fees: {
                        chains: [
                            {
                                burnFee: "7",
                                chain: "Arbitrum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Avalanche",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "BinanceSmartChain",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Ethereum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Fantom",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Goerli",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Polygon",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Solana",
                                mintFee: "36",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "5",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "6",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "7",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "8",
                                numNodes: "29",
                            },
                            {
                                amount: "106566",
                                epoch: "9",
                                numNodes: "29",
                            },
                            {
                                amount: "53283",
                                epoch: "10",
                                numNodes: "29",
                            },
                            {
                                amount: "26641",
                                epoch: "11",
                                numNodes: "30",
                            },
                            {
                                amount: "13321",
                                epoch: "12",
                                numNodes: "31",
                            },
                            {
                                amount: "6660",
                                epoch: "13",
                                numNodes: "31",
                            },
                            {
                                amount: "3330",
                                epoch: "14",
                                numNodes: "31",
                            },
                            {
                                amount: "1665",
                                epoch: "15",
                                numNodes: "31",
                            },
                            {
                                amount: "833",
                                epoch: "16",
                                numNodes: "31",
                            },
                            {
                                amount: "416",
                                epoch: "17",
                                numNodes: "31",
                            },
                            {
                                amount: "208",
                                epoch: "18",
                                numNodes: "31",
                            },
                            {
                                amount: "104",
                                epoch: "19",
                                numNodes: "31",
                            },
                            {
                                amount: "52",
                                epoch: "20",
                                numNodes: "31",
                            },
                            {
                                amount: "26",
                                epoch: "21",
                                numNodes: "31",
                            },
                            {
                                amount: "13",
                                epoch: "22",
                                numNodes: "31",
                            },
                            {
                                amount: "7",
                                epoch: "23",
                                numNodes: "31",
                            },
                            {
                                amount: "3",
                                epoch: "24",
                                numNodes: "31",
                            },
                            {
                                amount: "2",
                                epoch: "25",
                                numNodes: "32",
                            },
                            {
                                amount: "1",
                                epoch: "26",
                                numNodes: "32",
                            },
                            {
                                amount: "429",
                                epoch: "27",
                                numNodes: "32",
                            },
                            {
                                amount: "215",
                                epoch: "28",
                                numNodes: "32",
                            },
                            {
                                amount: "107",
                                epoch: "29",
                                numNodes: "32",
                            },
                            {
                                amount: "54",
                                epoch: "30",
                                numNodes: "33",
                            },
                            {
                                amount: "23",
                                epoch: "31",
                                numNodes: "33",
                            },
                            {
                                amount: "12",
                                epoch: "32",
                                numNodes: "32",
                            },
                            {
                                amount: "6",
                                epoch: "33",
                                numNodes: "33",
                            },
                            {
                                amount: "3",
                                epoch: "34",
                                numNodes: "33",
                            },
                            {
                                amount: "2",
                                epoch: "35",
                                numNodes: "33",
                            },
                            {
                                amount: "1",
                                epoch: "36",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "37",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "38",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "39",
                                numNodes: "33",
                            },
                            {
                                amount: "1393",
                                epoch: "40",
                                numNodes: "32",
                            },
                            {
                                amount: "697",
                                epoch: "41",
                                numNodes: "33",
                            },
                            {
                                amount: "349",
                                epoch: "42",
                                numNodes: "33",
                            },
                            {
                                amount: "175",
                                epoch: "43",
                                numNodes: "32",
                            },
                            {
                                amount: "87",
                                epoch: "44",
                                numNodes: "32",
                            },
                            {
                                amount: "44",
                                epoch: "45",
                                numNodes: "32",
                            },
                            {
                                amount: "22",
                                epoch: "46",
                                numNodes: "33",
                            },
                            {
                                amount: "12",
                                epoch: "47",
                                numNodes: "32",
                            },
                            {
                                amount: "6",
                                epoch: "48",
                                numNodes: "32",
                            },
                            {
                                amount: "3",
                                epoch: "49",
                                numNodes: "33",
                            },
                            {
                                amount: "2",
                                epoch: "50",
                                numNodes: "32",
                            },
                            {
                                amount: "1",
                                epoch: "51",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "52",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "53",
                                numNodes: "32",
                            },
                        ],
                        nodes: [],
                        reserved: {
                            fund: "209",
                        },
                        unassigned: "2",
                        unclaimed: "110422",
                    },
                    gasCap: "2",
                    gasLimit: "400",
                    gasPrice: "2",
                    latestHeight: "1462525",
                    minimumAmount: "547",
                    minted: [
                        {
                            amount: "18583125",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "3728339",
                            chain: "Ethereum",
                        },
                        {
                            amount: "9636",
                            chain: "Fantom",
                        },
                        {
                            amount: "8990",
                            chain: "Polygon",
                        },
                    ],
                    shards: [
                        {
                            pubKey: "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard: "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                outpoint: {
                                    hash: "FbiDmiKfQA6qKDEh4UjyYJXIxtl_ffLRa_7FxBzkKSY",
                                    index: "1",
                                },
                                pubKeyScript:
                                    "dqkUyZiyqIrJZnbhTwdzkANBl5mmgjqIrA",
                                value: "74617588",
                            },
                        },
                    ],
                },
                BTC: {
                    dustAmount: "546",
                    fees: {
                        chains: [
                            {
                                burnFee: "7",
                                chain: "Arbitrum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Avalanche",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "BinanceSmartChain",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Ethereum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Fantom",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Goerli",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Polygon",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Solana",
                                mintFee: "36",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "1460",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "5",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "6",
                                numNodes: "29",
                            },
                            {
                                amount: "10207",
                                epoch: "7",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "8",
                                numNodes: "29",
                            },
                            {
                                amount: "1039621",
                                epoch: "9",
                                numNodes: "29",
                            },
                            {
                                amount: "520857",
                                epoch: "10",
                                numNodes: "29",
                            },
                            {
                                amount: "260803",
                                epoch: "11",
                                numNodes: "30",
                            },
                            {
                                amount: "130652",
                                epoch: "12",
                                numNodes: "31",
                            },
                            {
                                amount: "100075",
                                epoch: "13",
                                numNodes: "31",
                            },
                            {
                                amount: "50037",
                                epoch: "14",
                                numNodes: "31",
                            },
                            {
                                amount: "25019",
                                epoch: "15",
                                numNodes: "31",
                            },
                            {
                                amount: "12509",
                                epoch: "16",
                                numNodes: "31",
                            },
                            {
                                amount: "6255",
                                epoch: "17",
                                numNodes: "31",
                            },
                            {
                                amount: "3127",
                                epoch: "18",
                                numNodes: "31",
                            },
                            {
                                amount: "1564",
                                epoch: "19",
                                numNodes: "31",
                            },
                            {
                                amount: "782",
                                epoch: "20",
                                numNodes: "31",
                            },
                            {
                                amount: "391",
                                epoch: "21",
                                numNodes: "31",
                            },
                            {
                                amount: "195",
                                epoch: "22",
                                numNodes: "31",
                            },
                            {
                                amount: "98",
                                epoch: "23",
                                numNodes: "31",
                            },
                            {
                                amount: "49",
                                epoch: "24",
                                numNodes: "31",
                            },
                            {
                                amount: "24",
                                epoch: "25",
                                numNodes: "32",
                            },
                            {
                                amount: "12",
                                epoch: "26",
                                numNodes: "32",
                            },
                            {
                                amount: "7537",
                                epoch: "27",
                                numNodes: "32",
                            },
                            {
                                amount: "3769",
                                epoch: "28",
                                numNodes: "32",
                            },
                            {
                                amount: "1884",
                                epoch: "29",
                                numNodes: "32",
                            },
                            {
                                amount: "942",
                                epoch: "30",
                                numNodes: "33",
                            },
                            {
                                amount: "1827",
                                epoch: "31",
                                numNodes: "33",
                            },
                            {
                                amount: "1555",
                                epoch: "32",
                                numNodes: "32",
                            },
                            {
                                amount: "793",
                                epoch: "33",
                                numNodes: "33",
                            },
                            {
                                amount: "3939",
                                epoch: "34",
                                numNodes: "33",
                            },
                            {
                                amount: "1983",
                                epoch: "35",
                                numNodes: "33",
                            },
                            {
                                amount: "992",
                                epoch: "36",
                                numNodes: "32",
                            },
                            {
                                amount: "701",
                                epoch: "37",
                                numNodes: "32",
                            },
                            {
                                amount: "736",
                                epoch: "38",
                                numNodes: "32",
                            },
                            {
                                amount: "368",
                                epoch: "39",
                                numNodes: "33",
                            },
                            {
                                amount: "16308",
                                epoch: "40",
                                numNodes: "32",
                            },
                            {
                                amount: "8154",
                                epoch: "41",
                                numNodes: "33",
                            },
                            {
                                amount: "4077",
                                epoch: "42",
                                numNodes: "33",
                            },
                            {
                                amount: "2038",
                                epoch: "43",
                                numNodes: "32",
                            },
                            {
                                amount: "1053",
                                epoch: "44",
                                numNodes: "32",
                            },
                            {
                                amount: "2091",
                                epoch: "45",
                                numNodes: "32",
                            },
                            {
                                amount: "1046",
                                epoch: "46",
                                numNodes: "33",
                            },
                            {
                                amount: "523",
                                epoch: "47",
                                numNodes: "32",
                            },
                            {
                                amount: "274",
                                epoch: "48",
                                numNodes: "32",
                            },
                            {
                                amount: "137",
                                epoch: "49",
                                numNodes: "33",
                            },
                            {
                                amount: "69",
                                epoch: "50",
                                numNodes: "32",
                            },
                            {
                                amount: "35",
                                epoch: "51",
                                numNodes: "32",
                            },
                            {
                                amount: "18",
                                epoch: "52",
                                numNodes: "33",
                            },
                            {
                                amount: "9",
                                epoch: "53",
                                numNodes: "32",
                            },
                        ],
                        nodes: [
                            {
                                amountClaimed: "4214",
                                node: "MWVxL0a9O3mnvxRzzOkcT4ziH3kAAAAAAAAAAAAAAAA",
                                nonce: "0",
                            },
                            {
                                amountClaimed: "73517",
                                node: "xoFRPv_xsoti6yaZAoZT5zNkU7sAAAAAAAAAAAAAAAA",
                                nonce: "5",
                            },
                        ],
                        reserved: {
                            fund: "2746",
                        },
                        unassigned: "2508",
                        unclaimed: "1180193",
                    },
                    gasCap: "2",
                    gasLimit: "400",
                    gasPrice: "2",
                    latestHeight: "2097587",
                    minimumAmount: "547",
                    minted: [
                        {
                            amount: "146",
                            chain: "Avalanche",
                        },
                        {
                            amount: "7529035",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "535686336",
                            chain: "Ethereum",
                        },
                        {
                            amount: "28301",
                            chain: "Fantom",
                        },
                        {
                            amount: "3195",
                            chain: "Goerli",
                        },
                        {
                            amount: "1023973",
                            chain: "Polygon",
                        },
                        {
                            amount: "7204088",
                            chain: "Solana",
                        },
                    ],
                    shards: [
                        {
                            pubKey: "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard: "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                outpoint: {
                                    hash: "5eO-MZ2jHOUXkR3bWbl113LnCb8ALwZCDST8_n1Bqkw",
                                    index: "0",
                                },
                                pubKeyScript:
                                    "dqkUyZiyqIrJZnbhTwdzkANBl5mmgjqIrA",
                                value: "856828195",
                            },
                        },
                    ],
                },
                DAI: {
                    dustAmount: "0",
                    fees: {
                        chains: [
                            {
                                burnFee: "7",
                                chain: "Arbitrum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Avalanche",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "BinanceSmartChain",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Fantom",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Goerli",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Polygon",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Solana",
                                mintFee: "36",
                            },
                        ],
                        epochs: [
                            {
                                amount: "1392874475699122",
                                epoch: "40",
                                numNodes: "32",
                            },
                            {
                                amount: "696437237849561",
                                epoch: "41",
                                numNodes: "33",
                            },
                            {
                                amount: "348218618924781",
                                epoch: "42",
                                numNodes: "33",
                            },
                            {
                                amount: "174109309462390",
                                epoch: "43",
                                numNodes: "32",
                            },
                            {
                                amount: "87054654731196",
                                epoch: "44",
                                numNodes: "32",
                            },
                            {
                                amount: "299549277327365598",
                                epoch: "45",
                                numNodes: "32",
                            },
                            {
                                amount: "149774638663682799",
                                epoch: "46",
                                numNodes: "33",
                            },
                            {
                                amount: "74887319331841400",
                                epoch: "47",
                                numNodes: "32",
                            },
                            {
                                amount: "37443659665920700",
                                epoch: "48",
                                numNodes: "32",
                            },
                            {
                                amount: "18721829832960351",
                                epoch: "49",
                                numNodes: "33",
                            },
                            {
                                amount: "9360914916480175",
                                epoch: "50",
                                numNodes: "32",
                            },
                            {
                                amount: "4680457458240088",
                                epoch: "51",
                                numNodes: "32",
                            },
                            {
                                amount: "2340228729120044",
                                epoch: "52",
                                numNodes: "33",
                            },
                            {
                                amount: "1170114364560022",
                                epoch: "53",
                                numNodes: "32",
                            },
                        ],
                        nodes: [],
                        reserved: {
                            fund: "46112538705762420",
                        },
                        unassigned: "22259948707397463",
                        unclaimed: "646739673292600647",
                    },
                    gasCap: "6000000028",
                    gasLimit: "21000",
                    gasPrice: "6000000000",
                    latestHeight: "27380730",
                    minimumAmount: "1",
                    minted: [
                        {
                            amount: "77883000000000000000",
                            chain: "Arbitrum",
                        },
                        {
                            amount: "70893500000000000000",
                            chain: "Avalanche",
                        },
                        {
                            amount: "63882748377998741890",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "68896500000000000000",
                            chain: "Fantom",
                        },
                        {
                            amount: "67898000000000000000",
                            chain: "Goerli",
                        },
                        {
                            amount: "67898000000000000000",
                            chain: "Polygon",
                        },
                    ],
                    shards: [
                        {
                            pubKey: "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard: "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                gnonces: [],
                                nonce: "0",
                            },
                        },
                    ],
                },
                DGB: {
                    dustAmount: "546",
                    fees: {
                        chains: [
                            {
                                burnFee: "7",
                                chain: "Arbitrum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Avalanche",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "BinanceSmartChain",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Ethereum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Fantom",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Goerli",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Polygon",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Solana",
                                mintFee: "36",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "5",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "6",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "7",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "8",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "9",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "10",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "11",
                                numNodes: "30",
                            },
                            {
                                amount: "0",
                                epoch: "12",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "13",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "14",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "15",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "16",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "17",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "18",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "19",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "20",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "21",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "22",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "23",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "24",
                                numNodes: "31",
                            },
                            {
                                amount: "0",
                                epoch: "25",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "26",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "27",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "28",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "29",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "30",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "31",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "32",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "33",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "34",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "35",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "36",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "37",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "38",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "39",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "40",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "41",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "42",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "43",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "44",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "45",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "46",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "47",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "48",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "49",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "50",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "51",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "52",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "53",
                                numNodes: "32",
                            },
                        ],
                        nodes: [],
                        reserved: {
                            fund: "0",
                        },
                        unassigned: "0",
                        unclaimed: "0",
                    },
                    gasCap: "200",
                    gasLimit: "400",
                    gasPrice: "200",
                    latestHeight: "0",
                    minimumAmount: "547",
                    minted: [
                        {
                            amount: "100006187",
                            chain: "BinanceSmartChain",
                        },
                    ],
                    shards: [
                        {
                            pubKey: "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard: "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                outpoint: {
                                    hash: "CAMXN7OBkSnafGgHxBBe5mm-dcqjz1fwduqiexG_9Zo",
                                    index: "0",
                                },
                                pubKeyScript:
                                    "dqkUyZiyqIrJZnbhTwdzkANBl5mmgjqIrA",
                                value: "203114980",
                            },
                        },
                    ],
                },
                DOGE: {
                    dustAmount: "100000000",
                    fees: {
                        chains: [
                            {
                                burnFee: "7",
                                chain: "Arbitrum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Avalanche",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "BinanceSmartChain",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Ethereum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Fantom",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Goerli",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Polygon",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Solana",
                                mintFee: "36",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "5",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "6",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "7",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "8",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "9",
                                numNodes: "29",
                            },
                            {
                                amount: "12100000",
                                epoch: "10",
                                numNodes: "29",
                            },
                            {
                                amount: "6050000",
                                epoch: "11",
                                numNodes: "30",
                            },
                            {
                                amount: "3025000",
                                epoch: "12",
                                numNodes: "31",
                            },
                            {
                                amount: "1512500",
                                epoch: "13",
                                numNodes: "31",
                            },
                            {
                                amount: "756250",
                                epoch: "14",
                                numNodes: "31",
                            },
                            {
                                amount: "378125",
                                epoch: "15",
                                numNodes: "31",
                            },
                            {
                                amount: "189062",
                                epoch: "16",
                                numNodes: "31",
                            },
                            {
                                amount: "94531",
                                epoch: "17",
                                numNodes: "31",
                            },
                            {
                                amount: "47266",
                                epoch: "18",
                                numNodes: "31",
                            },
                            {
                                amount: "23633",
                                epoch: "19",
                                numNodes: "31",
                            },
                            {
                                amount: "11816",
                                epoch: "20",
                                numNodes: "31",
                            },
                            {
                                amount: "5908",
                                epoch: "21",
                                numNodes: "31",
                            },
                            {
                                amount: "2954",
                                epoch: "22",
                                numNodes: "31",
                            },
                            {
                                amount: "1477",
                                epoch: "23",
                                numNodes: "31",
                            },
                            {
                                amount: "739",
                                epoch: "24",
                                numNodes: "31",
                            },
                            {
                                amount: "369",
                                epoch: "25",
                                numNodes: "32",
                            },
                            {
                                amount: "185",
                                epoch: "26",
                                numNodes: "32",
                            },
                            {
                                amount: "92",
                                epoch: "27",
                                numNodes: "32",
                            },
                            {
                                amount: "46",
                                epoch: "28",
                                numNodes: "32",
                            },
                            {
                                amount: "23",
                                epoch: "29",
                                numNodes: "32",
                            },
                            {
                                amount: "12",
                                epoch: "30",
                                numNodes: "33",
                            },
                            {
                                amount: "5",
                                epoch: "31",
                                numNodes: "33",
                            },
                            {
                                amount: "3",
                                epoch: "32",
                                numNodes: "32",
                            },
                            {
                                amount: "1",
                                epoch: "33",
                                numNodes: "33",
                            },
                            {
                                amount: "1",
                                epoch: "34",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "35",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "36",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "37",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "38",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "39",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "40",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "41",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "42",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "43",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "44",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "45",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "46",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "47",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "48",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "49",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "50",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "51",
                                numNodes: "32",
                            },
                            {
                                amount: "0",
                                epoch: "52",
                                numNodes: "33",
                            },
                            {
                                amount: "0",
                                epoch: "53",
                                numNodes: "32",
                            },
                        ],
                        nodes: [],
                        reserved: {
                            fund: "0",
                        },
                        unassigned: "43560002",
                        unclaimed: "24199998",
                    },
                    gasCap: "800000",
                    gasLimit: "400",
                    gasPrice: "800000",
                    latestHeight: "3357427",
                    minimumAmount: "100000001",
                    minted: [
                        {
                            amount: "12422822660",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "56183713300",
                            chain: "Ethereum",
                        },
                        {
                            amount: "29018220",
                            chain: "Fantom",
                        },
                        {
                            amount: "9680000000",
                            chain: "Polygon",
                        },
                    ],
                    shards: [
                        {
                            pubKey: "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard: "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                outpoint: {
                                    hash: "iE-N4RB42R7wmyM36rLoiS3uz0bLpZAyoe73aHi7cUE",
                                    index: "0",
                                },
                                pubKeyScript:
                                    "dqkUyZiyqIrJZnbhTwdzkANBl5mmgjqIrA",
                                value: "131985681476",
                            },
                        },
                    ],
                },
                ETH: {
                    dustAmount: "0",
                    fees: {
                        chains: [
                            {
                                burnFee: "7",
                                chain: "Arbitrum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Avalanche",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "BinanceSmartChain",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Fantom",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Goerli",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Polygon",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Solana",
                                mintFee: "36",
                            },
                        ],
                        epochs: [
                            {
                                amount: "69564737849590",
                                epoch: "40",
                                numNodes: "32",
                            },
                            {
                                amount: "34782368924795",
                                epoch: "41",
                                numNodes: "33",
                            },
                            {
                                amount: "17391184462398",
                                epoch: "42",
                                numNodes: "33",
                            },
                            {
                                amount: "8695592231199",
                                epoch: "43",
                                numNodes: "32",
                            },
                            {
                                amount: "4347796115599",
                                epoch: "44",
                                numNodes: "32",
                            },
                            {
                                amount: "71738635907390",
                                epoch: "45",
                                numNodes: "32",
                            },
                            {
                                amount: "35869317953695",
                                epoch: "46",
                                numNodes: "33",
                            },
                            {
                                amount: "17934658976848",
                                epoch: "47",
                                numNodes: "32",
                            },
                            {
                                amount: "8967329488425",
                                epoch: "48",
                                numNodes: "32",
                            },
                            {
                                amount: "4483664744212",
                                epoch: "49",
                                numNodes: "33",
                            },
                            {
                                amount: "2241832372106",
                                epoch: "50",
                                numNodes: "32",
                            },
                            {
                                amount: "1120916186054",
                                epoch: "51",
                                numNodes: "32",
                            },
                            {
                                amount: "560458093027",
                                epoch: "52",
                                numNodes: "33",
                            },
                            {
                                amount: "280229046514",
                                epoch: "53",
                                numNodes: "32",
                            },
                        ],
                        nodes: [],
                        reserved: {
                            fund: "21341534299216",
                        },
                        unassigned: "301743347168",
                        unclaimed: "299320256651068",
                    },
                    gasCap: "6000000028",
                    gasLimit: "21000",
                    gasPrice: "6000000000",
                    latestHeight: "27309799",
                    minimumAmount: "1",
                    minted: [
                        {
                            amount: "199448377998825764",
                            chain: "BinanceSmartChain",
                        },
                    ],
                    shards: [
                        {
                            pubKey: "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard: "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                gnonces: [
                                    {
                                        address:
                                            "0x051F5ecfcBac240B136d431470848D01b27deF3d",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "0x43aAff4899452Dc24a79eeAc4A70A792C2BEea68",
                                        nonce: "1",
                                    },
                                ],
                                nonce: "0",
                            },
                        },
                    ],
                },
                FIL: {
                    dustAmount: "0",
                    fees: {
                        chains: [
                            {
                                burnFee: "7",
                                chain: "Arbitrum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Avalanche",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "BinanceSmartChain",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Ethereum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Fantom",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Goerli",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Polygon",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Solana",
                                mintFee: "36",
                            },
                        ],
                        epochs: [
                            {
                                amount: "124999999446133500",
                                epoch: "10",
                                numNodes: "29",
                            },
                            {
                                amount: "62499999723066750",
                                epoch: "11",
                                numNodes: "30",
                            },
                            {
                                amount: "31249999861533375",
                                epoch: "12",
                                numNodes: "31",
                            },
                            {
                                amount: "15624999930766687",
                                epoch: "13",
                                numNodes: "31",
                            },
                            {
                                amount: "7812499965383344",
                                epoch: "14",
                                numNodes: "31",
                            },
                            {
                                amount: "3906249982691672",
                                epoch: "15",
                                numNodes: "31",
                            },
                            {
                                amount: "1953124991345836",
                                epoch: "16",
                                numNodes: "31",
                            },
                            {
                                amount: "976562495672918",
                                epoch: "17",
                                numNodes: "31",
                            },
                            {
                                amount: "488281247836459",
                                epoch: "18",
                                numNodes: "31",
                            },
                            {
                                amount: "244140623918229",
                                epoch: "19",
                                numNodes: "31",
                            },
                            {
                                amount: "122070311959115",
                                epoch: "20",
                                numNodes: "31",
                            },
                            {
                                amount: "61035155979557",
                                epoch: "21",
                                numNodes: "31",
                            },
                            {
                                amount: "30517577989779",
                                epoch: "22",
                                numNodes: "31",
                            },
                            {
                                amount: "15258788994889",
                                epoch: "23",
                                numNodes: "31",
                            },
                            {
                                amount: "7629394497445",
                                epoch: "24",
                                numNodes: "31",
                            },
                            {
                                amount: "199816239144311722",
                                epoch: "25",
                                numNodes: "32",
                            },
                            {
                                amount: "99908119572155861",
                                epoch: "26",
                                numNodes: "32",
                            },
                            {
                                amount: "322681550751453755",
                                epoch: "27",
                                numNodes: "32",
                            },
                            {
                                amount: "161340775375726878",
                                epoch: "28",
                                numNodes: "32",
                            },
                            {
                                amount: "80670387687863439",
                                epoch: "29",
                                numNodes: "32",
                            },
                            {
                                amount: "40335193843931719",
                                epoch: "30",
                                numNodes: "33",
                            },
                            {
                                amount: "17304558028793292",
                                epoch: "31",
                                numNodes: "33",
                            },
                            {
                                amount: "20227178157365328",
                                epoch: "32",
                                numNodes: "32",
                            },
                            {
                                amount: "10113589078682665",
                                epoch: "33",
                                numNodes: "33",
                            },
                            {
                                amount: "5056794539341332",
                                epoch: "34",
                                numNodes: "33",
                            },
                            {
                                amount: "2528397269670666",
                                epoch: "35",
                                numNodes: "33",
                            },
                            {
                                amount: "1264198634835333",
                                epoch: "36",
                                numNodes: "32",
                            },
                            {
                                amount: "632099317417667",
                                epoch: "37",
                                numNodes: "32",
                            },
                            {
                                amount: "316049658708834",
                                epoch: "38",
                                numNodes: "32",
                            },
                            {
                                amount: "158024829354417",
                                epoch: "39",
                                numNodes: "33",
                            },
                            {
                                amount: "2175157031280498",
                                epoch: "40",
                                numNodes: "32",
                            },
                            {
                                amount: "1087578515640249",
                                epoch: "41",
                                numNodes: "33",
                            },
                            {
                                amount: "543789257820124",
                                epoch: "42",
                                numNodes: "33",
                            },
                            {
                                amount: "271894628910062",
                                epoch: "43",
                                numNodes: "32",
                            },
                            {
                                amount: "135947314455031",
                                epoch: "44",
                                numNodes: "32",
                            },
                            {
                                amount: "1461023348510083",
                                epoch: "45",
                                numNodes: "32",
                            },
                            {
                                amount: "730511674255042",
                                epoch: "46",
                                numNodes: "33",
                            },
                            {
                                amount: "365255837127521",
                                epoch: "47",
                                numNodes: "32",
                            },
                            {
                                amount: "182627918563761",
                                epoch: "48",
                                numNodes: "32",
                            },
                            {
                                amount: "91313959281880",
                                epoch: "49",
                                numNodes: "33",
                            },
                            {
                                amount: "45656979640940",
                                epoch: "50",
                                numNodes: "32",
                            },
                            {
                                amount: "22828489820471",
                                epoch: "51",
                                numNodes: "32",
                            },
                            {
                                amount: "11414244910235",
                                epoch: "52",
                                numNodes: "33",
                            },
                            {
                                amount: "5707122455118",
                                epoch: "53",
                                numNodes: "32",
                            },
                        ],
                        nodes: [
                            {
                                amountClaimed: "6244257473259741",
                                node: "MWVxL0a9O3mnvxRzzOkcT4ziGlEAAAAAAAAAAAAAAAA",
                                nonce: "1",
                            },
                        ],
                        reserved: {
                            fund: "547452741258146",
                        },
                        unassigned: "1656294610112884",
                        unclaimed: "1229603678438622765",
                    },
                    gasCap: "201464",
                    gasLimit: "2200000",
                    gasPrice: "199356",
                    latestHeight: "296792",
                    minimumAmount: "1",
                    minted: [
                        {
                            amount: "19969111667700200",
                            chain: "Arbitrum",
                        },
                        {
                            amount: "1996999557439637800",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "196537376131698670200",
                            chain: "Ethereum",
                        },
                        {
                            amount: "98622068073887708000",
                            chain: "Solana",
                        },
                    ],
                    shards: [
                        {
                            pubKey: "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard: "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                gnonces: [
                                    {
                                        address:
                                            "f12tbtrke5readulk7zlijqbafjvofdrobihrbvzy",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f15on27mllxvs6v74q6s7vekkvsuiwmgnf7tx77wi",
                                        nonce: "2",
                                    },
                                    {
                                        address:
                                            "f16w2po3rkbzw3n62myupqdixtivaqxnrvhs47puy",
                                        nonce: "7",
                                    },
                                    {
                                        address:
                                            "f1bs6zvenxpj5hiw3xx67spijvvszq7ptkahezhha",
                                        nonce: "3",
                                    },
                                    {
                                        address:
                                            "f1bwksigubmigjmxdtq57scsvc6p76xczmg7w7eny",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f1cey4ocsiilhcxlcdxoyoimyjbjs5wxzwt7o7eai",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f1cobxhyrzyycifdpn5f5adshex2536gyoh376r7y",
                                        nonce: "2",
                                    },
                                    {
                                        address:
                                            "f1g64yuzsb7eierhk7ib5hzvgxbxwkk36a6aoncji",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f1gpxrwgney7jfyrvx43uy5bzw4r5z5gkmgck5bhq",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f1ideeie52dgbdbr4p4uww426fu6oh2b5suqqlzmy",
                                        nonce: "3",
                                    },
                                    {
                                        address:
                                            "f1kjwcp463h4i5jg62zenupyfkjdloh4dy3cvpyfq",
                                        nonce: "7",
                                    },
                                    {
                                        address:
                                            "f1pjz2vagxgpynggwfytidrufw2g4nzoj3yarccti",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f1riebr67zmyt3rmxl6yluicuqlxyq6fs2copuomq",
                                        nonce: "6",
                                    },
                                    {
                                        address:
                                            "f1sozlqnb4ls3fr25nwapbkyha3h2j5oy6yd5gmti",
                                        nonce: "2",
                                    },
                                    {
                                        address:
                                            "f1uduxnovxtvl7y3qs4wnihzrs6r7vedebly5smna",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f1ue6slujr5kxoacgm73ekswzoz4wxnpjpi6qzdla",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f1wfjib3pch3s4bad7fyjofdrgkpuiw7473vk4obq",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f1y2m7md3fefqottcamcbztkzyguftbamok424bjq",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f1yfwz766le23s4zowh3sylu2w5dbcfvgsidyxpza",
                                        nonce: "7",
                                    },
                                ],
                                nonce: "50",
                            },
                        },
                    ],
                },
                LUNA: {
                    dustAmount: "0",
                    fees: {
                        chains: [
                            {
                                burnFee: "7",
                                chain: "Arbitrum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Avalanche",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "BinanceSmartChain",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Ethereum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Fantom",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Goerli",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Polygon",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Solana",
                                mintFee: "36",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "2098",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "1874",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "5",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "6",
                                numNodes: "29",
                            },
                            {
                                amount: "600251",
                                epoch: "7",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "8",
                                numNodes: "29",
                            },
                            {
                                amount: "303399",
                                epoch: "9",
                                numNodes: "29",
                            },
                            {
                                amount: "153199",
                                epoch: "10",
                                numNodes: "29",
                            },
                            {
                                amount: "76600",
                                epoch: "11",
                                numNodes: "30",
                            },
                            {
                                amount: "38300",
                                epoch: "12",
                                numNodes: "31",
                            },
                            {
                                amount: "19150",
                                epoch: "13",
                                numNodes: "31",
                            },
                            {
                                amount: "9575",
                                epoch: "14",
                                numNodes: "31",
                            },
                            {
                                amount: "4787",
                                epoch: "15",
                                numNodes: "31",
                            },
                            {
                                amount: "2394",
                                epoch: "16",
                                numNodes: "31",
                            },
                            {
                                amount: "1197",
                                epoch: "17",
                                numNodes: "31",
                            },
                            {
                                amount: "598",
                                epoch: "18",
                                numNodes: "31",
                            },
                            {
                                amount: "299",
                                epoch: "19",
                                numNodes: "31",
                            },
                            {
                                amount: "150",
                                epoch: "20",
                                numNodes: "31",
                            },
                            {
                                amount: "75",
                                epoch: "21",
                                numNodes: "31",
                            },
                            {
                                amount: "37",
                                epoch: "22",
                                numNodes: "31",
                            },
                            {
                                amount: "19",
                                epoch: "23",
                                numNodes: "31",
                            },
                            {
                                amount: "9",
                                epoch: "24",
                                numNodes: "31",
                            },
                            {
                                amount: "5",
                                epoch: "25",
                                numNodes: "32",
                            },
                            {
                                amount: "2",
                                epoch: "26",
                                numNodes: "32",
                            },
                            {
                                amount: "22951",
                                epoch: "27",
                                numNodes: "32",
                            },
                            {
                                amount: "11476",
                                epoch: "28",
                                numNodes: "32",
                            },
                            {
                                amount: "5738",
                                epoch: "29",
                                numNodes: "32",
                            },
                            {
                                amount: "3393",
                                epoch: "30",
                                numNodes: "33",
                            },
                            {
                                amount: "9664",
                                epoch: "31",
                                numNodes: "33",
                            },
                            {
                                amount: "8498",
                                epoch: "32",
                                numNodes: "32",
                            },
                            {
                                amount: "4249",
                                epoch: "33",
                                numNodes: "33",
                            },
                            {
                                amount: "2832",
                                epoch: "34",
                                numNodes: "33",
                            },
                            {
                                amount: "1416",
                                epoch: "35",
                                numNodes: "33",
                            },
                            {
                                amount: "708",
                                epoch: "36",
                                numNodes: "32",
                            },
                            {
                                amount: "354",
                                epoch: "37",
                                numNodes: "32",
                            },
                            {
                                amount: "4872",
                                epoch: "38",
                                numNodes: "32",
                            },
                            {
                                amount: "2757",
                                epoch: "39",
                                numNodes: "33",
                            },
                            {
                                amount: "6583",
                                epoch: "40",
                                numNodes: "32",
                            },
                            {
                                amount: "3292",
                                epoch: "41",
                                numNodes: "33",
                            },
                            {
                                amount: "1646",
                                epoch: "42",
                                numNodes: "33",
                            },
                            {
                                amount: "823",
                                epoch: "43",
                                numNodes: "32",
                            },
                            {
                                amount: "412",
                                epoch: "44",
                                numNodes: "32",
                            },
                            {
                                amount: "206",
                                epoch: "45",
                                numNodes: "32",
                            },
                            {
                                amount: "104",
                                epoch: "46",
                                numNodes: "33",
                            },
                            {
                                amount: "52",
                                epoch: "47",
                                numNodes: "32",
                            },
                            {
                                amount: "26",
                                epoch: "48",
                                numNodes: "32",
                            },
                            {
                                amount: "13",
                                epoch: "49",
                                numNodes: "33",
                            },
                            {
                                amount: "6",
                                epoch: "50",
                                numNodes: "32",
                            },
                            {
                                amount: "4",
                                epoch: "51",
                                numNodes: "32",
                            },
                            {
                                amount: "2",
                                epoch: "52",
                                numNodes: "33",
                            },
                            {
                                amount: "1",
                                epoch: "53",
                                numNodes: "32",
                            },
                        ],
                        nodes: [
                            {
                                amountClaimed: "20698",
                                node: "xoFRPv_xsoti6yaZAoZT5zNkU7sAAAAAAAAAAAAAAAA",
                                nonce: "0",
                            },
                        ],
                        reserved: {
                            fund: "1006",
                        },
                        unassigned: "6005699",
                        unclaimed: "405356",
                    },
                    gasCap: "2",
                    gasLimit: "150000",
                    gasPrice: "2",
                    latestHeight: "5940384",
                    minimumAmount: "1",
                    minted: [
                        {
                            amount: "1897150",
                            chain: "Arbitrum",
                        },
                        {
                            amount: "1200000",
                            chain: "Avalanche",
                        },
                        {
                            amount: "1004513740",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "2027720309",
                            chain: "Ethereum",
                        },
                        {
                            amount: "1005098998",
                            chain: "Fantom",
                        },
                        {
                            amount: "1790400",
                            chain: "Goerli",
                        },
                        {
                            amount: "3800698",
                            chain: "Polygon",
                        },
                        {
                            amount: "1012438701",
                            chain: "Solana",
                        },
                    ],
                    shards: [
                        {
                            pubKey: "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard: "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                gnonces: [
                                    {
                                        address:
                                            "terra10fadhfnnd49y9wf45wxu90duwk5uztdvxsywv3",
                                        nonce: "19",
                                    },
                                    {
                                        address:
                                            "terra125kdk43c54d3hye3v0xv9n2qtv3chw5j2x5rk2",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra130rp0825alp6jhyh9pjydtd3kc3yzhfsgvv7kp",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra137rxphcjx64v8vcjurdx9fydk6mld4v8nzh0wc",
                                        nonce: "5",
                                    },
                                    {
                                        address:
                                            "terra13l236mfc2rk67wqa3cskr8uklqydyzy5ffwj3k",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra13ryx5gxx7dt8qgaajzg6syadnmpu39wv2vxp0q",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra15afyktyh9f4f9gtpkxwz0mztvyqznk8gf2gzsa",
                                        nonce: "2",
                                    },
                                    {
                                        address:
                                            "terra15cdmhng0hmzfaw5ahhdd496kpjuekv72gt2ttu",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra15ng6axfnxggcfqd7ndzeplg7kdgtxq8ufgdlxx",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra15pds7x6p99e97uhrzuf8ulhn08n0k2dshtdzxu",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra16095k47hx0veesegjrymkrntrvh2e2pvxvp9u8",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra17l3wqk63wzkyf59hy25xdageyn5jxx5vjucgn8",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1c3q6paqpehwgxfwdgymkuw060r0j0x7xw9f4vt",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1fw6wr5ra3jgyt5r27a5e2lveam9zcgts9npkrf",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1gqcm37f0mj2xuephntg88g4655ut9jp5qkdhyn",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1gu0hgqjlea0cv7uml8hztwrj5gq2ldxvn9alwz",
                                        nonce: "3",
                                    },
                                    {
                                        address:
                                            "terra1hmm2w589ce0luwpjl2fwl9a6le2e5vvgzhv48q",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1j9h758r53tcmwgjnntq49pvmknxelle94wzjy3",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1jkw8cnnwvl6204y0cyf0fxshc9ahr5xwjfr0mw",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1jm456vyqz0xzdfwj40rep2z0pywctpxhyur79s",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1jnhkudqg0svvvf6srh22nlph8pp0l7z8rccknh",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1kne6rpjkt74mhfsxqurfzrj3x6tk9eww0ts9rh",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1ljnmtadcxsg850k9xh8ax0a9g2wksn5cc83kp4",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1nhs982e90tuakg9wmr68h9uvtyfzdx54wj3t5s",
                                        nonce: "2",
                                    },
                                    {
                                        address:
                                            "terra1nmu9cvyw9yjexn7svwp9u47ue7v2puhvlvkkg7",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1p9nskzka0cy8r6rjj0sdny7jmdkmpuw2zmr06e",
                                        nonce: "4",
                                    },
                                    {
                                        address:
                                            "terra1pdq3yllq65dz6hgdkrepjrd467lgx3gdz60vh4",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1pjjuw09hxfh4j0fm6vs0nc0epaknfuj79zh8kq",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1rldlj662yghnl7n6hpz9sttwpvtm0fq3edy20r",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1rt2q0ecj3nu68umysxfm02wgyzps0yp798nu3m",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1s8msgzyprs67ec0a8wg9jeg0zur599k4ah3hxh",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1t665tqwg5s8ndsd02leeghp3n8vh7a74e8exkw",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1td7x8z4d8t7x0k3nks7cypygc3z8afthsqmvxy",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1uxuguvgsqtg3qt6j3x3ku40f436962mr6yukkv",
                                        nonce: "2",
                                    },
                                    {
                                        address:
                                            "terra1x8xwd5k2x22uwddd6v2xyt59pggv5dljsz7zpp",
                                        nonce: "2",
                                    },
                                    {
                                        address:
                                            "terra1yeuhuqhzhkmng3k93tcacezjfaju2ewmtgchfq",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1zm4synl405a0vnx6ey49h8v7l6z87kvkhdu35p",
                                        nonce: "3",
                                    },
                                ],
                                nonce: "25",
                            },
                        },
                    ],
                },
                System: {
                    epoch: {
                        hash: "HxxvkPinyHVkgQ_T42_PS5dQL8bwlpdQlEReMXEtmH4",
                        numNodes: "32",
                        number: "54",
                        timestamp: "1632562396",
                    },
                    nodes: [
                        {
                            enteredAt: "1",
                            id: "A4Ae-w7-KiXt5d06ADrogMApLk0AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "E6_GXd6GMt7CfB_y18ANrdv4VnEAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "FjJaemzR0yM0qeSPQuB0rlwtULsAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "F5v8ySp_LD4Nxc0NhsQy130amNQAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "GDyNbhISjFNHlkSZrrZJDtibKZ0AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt58AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt6kAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt6wAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt60AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt7EAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt7UAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt7YAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "J7fZV3Wtra9OfodIPirFQIhG9KcAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "J7fZV3Wtra9OfodIPirFQIhG9KkAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "25",
                            id: "MWVxL0a9O3mnvxRzzOkcT4ziGlEAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "MWVxL0a9O3mnvxRzzOkcT4ziH2MAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "12",
                            id: "MWVxL0a9O3mnvxRzzOkcT4ziH3kAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "MWVxL0a9O3mnvxRzzOkcT4ziH3oAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "Pw6qQvCz1dJVoXGFwFZJXg3uClUAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "RBXkx2ZEfxWr13HieiAcoYPTVhQAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "3",
                            id: "SyTisHjbuHAGR3v1qdPuF9DGmzoAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "V45fDFds68kdgmexvsF6Kmh_G_EAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "30",
                            id: "WW6CIaML_m5-_2f-5mSgHHO6PFYAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "XcjOWxs-0LWYZi5Zk3wwcKa1EcEAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "eHmg2lMEItdGr0tbHObTT9SVxH0AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "pcZEHL5OmrI6n1JOowfkyxf62BQAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "sHc0AwOjpUGUjIBO8jd9HFLgQigAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "s8H_JD5emy5bQ8tsk-MpN0zajB8AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "3",
                            id: "xoFRPv_xsoti6yaZAoZT5zNkU7sAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "1GWpyZYCwW05KeKzyAbLNlfjwr4AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "6GqgN1mUVh_HdjTabX3Chy3t23MAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "8xL7xhN6EM7ElhS09-j99g4h21cAAAAAAAAAAAAAAAA",
                        },
                    ],
                    shards: {
                        primary: [
                            {
                                pubKey: "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                                shard: "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            },
                        ],
                        secondary: [],
                        tertiary: [],
                    },
                    signatories: [
                        "jut_jL4LdIPa9MU7kbIRDHXTlYZ7ujlh6VBBnd_yMus",
                        "ASPR0p-yqn2bn7-wOqEuNIsOLhx5qwo__lxpb35WRu4",
                        "DVYGeJVbfJnpiiDXw3rxrF286lYshbCgJTSK_l5ywCw",
                        "gDb63a7MuM5GLc3sciw9L_LxYc-q51VA9JKF3rg0yzg",
                    ],
                },
                ZEC: {
                    dustAmount: "546",
                    fees: {
                        chains: [
                            {
                                burnFee: "7",
                                chain: "Arbitrum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Avalanche",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "BinanceSmartChain",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Ethereum",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Fantom",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Goerli",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Polygon",
                                mintFee: "36",
                            },
                            {
                                burnFee: "7",
                                chain: "Solana",
                                mintFee: "36",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "565",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "1338",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "5",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "6",
                                numNodes: "29",
                            },
                            {
                                amount: "13043268",
                                epoch: "7",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "8",
                                numNodes: "29",
                            },
                            {
                                amount: "7740102",
                                epoch: "9",
                                numNodes: "29",
                            },
                            {
                                amount: "3897451",
                                epoch: "10",
                                numNodes: "29",
                            },
                            {
                                amount: "1948725",
                                epoch: "11",
                                numNodes: "30",
                            },
                            {
                                amount: "974363",
                                epoch: "12",
                                numNodes: "31",
                            },
                            {
                                amount: "487181",
                                epoch: "13",
                                numNodes: "31",
                            },
                            {
                                amount: "243591",
                                epoch: "14",
                                numNodes: "31",
                            },
                            {
                                amount: "121795",
                                epoch: "15",
                                numNodes: "31",
                            },
                            {
                                amount: "60898",
                                epoch: "16",
                                numNodes: "31",
                            },
                            {
                                amount: "30449",
                                epoch: "17",
                                numNodes: "31",
                            },
                            {
                                amount: "15224",
                                epoch: "18",
                                numNodes: "31",
                            },
                            {
                                amount: "7612",
                                epoch: "19",
                                numNodes: "31",
                            },
                            {
                                amount: "3806",
                                epoch: "20",
                                numNodes: "31",
                            },
                            {
                                amount: "1903",
                                epoch: "21",
                                numNodes: "31",
                            },
                            {
                                amount: "952",
                                epoch: "22",
                                numNodes: "31",
                            },
                            {
                                amount: "476",
                                epoch: "23",
                                numNodes: "31",
                            },
                            {
                                amount: "238",
                                epoch: "24",
                                numNodes: "31",
                            },
                            {
                                amount: "119",
                                epoch: "25",
                                numNodes: "32",
                            },
                            {
                                amount: "59",
                                epoch: "26",
                                numNodes: "32",
                            },
                            {
                                amount: "391620",
                                epoch: "27",
                                numNodes: "32",
                            },
                            {
                                amount: "195810",
                                epoch: "28",
                                numNodes: "32",
                            },
                            {
                                amount: "97905",
                                epoch: "29",
                                numNodes: "32",
                            },
                            {
                                amount: "48953",
                                epoch: "30",
                                numNodes: "33",
                            },
                            {
                                amount: "27493",
                                epoch: "31",
                                numNodes: "33",
                            },
                            {
                                amount: "13747",
                                epoch: "32",
                                numNodes: "32",
                            },
                            {
                                amount: "6874",
                                epoch: "33",
                                numNodes: "33",
                            },
                            {
                                amount: "3437",
                                epoch: "34",
                                numNodes: "33",
                            },
                            {
                                amount: "1719",
                                epoch: "35",
                                numNodes: "33",
                            },
                            {
                                amount: "859",
                                epoch: "36",
                                numNodes: "32",
                            },
                            {
                                amount: "430",
                                epoch: "37",
                                numNodes: "32",
                            },
                            {
                                amount: "421",
                                epoch: "38",
                                numNodes: "32",
                            },
                            {
                                amount: "210",
                                epoch: "39",
                                numNodes: "33",
                            },
                            {
                                amount: "384025",
                                epoch: "40",
                                numNodes: "32",
                            },
                            {
                                amount: "192012",
                                epoch: "41",
                                numNodes: "33",
                            },
                            {
                                amount: "96007",
                                epoch: "42",
                                numNodes: "33",
                            },
                            {
                                amount: "48004",
                                epoch: "43",
                                numNodes: "32",
                            },
                            {
                                amount: "24002",
                                epoch: "44",
                                numNodes: "32",
                            },
                            {
                                amount: "262527",
                                epoch: "45",
                                numNodes: "32",
                            },
                            {
                                amount: "131264",
                                epoch: "46",
                                numNodes: "33",
                            },
                            {
                                amount: "65632",
                                epoch: "47",
                                numNodes: "32",
                            },
                            {
                                amount: "32817",
                                epoch: "48",
                                numNodes: "32",
                            },
                            {
                                amount: "16408",
                                epoch: "49",
                                numNodes: "33",
                            },
                            {
                                amount: "8205",
                                epoch: "50",
                                numNodes: "32",
                            },
                            {
                                amount: "4102",
                                epoch: "51",
                                numNodes: "32",
                            },
                            {
                                amount: "2051",
                                epoch: "52",
                                numNodes: "33",
                            },
                            {
                                amount: "1026",
                                epoch: "53",
                                numNodes: "32",
                            },
                        ],
                        nodes: [
                            {
                                amountClaimed: "449767",
                                node: "xoFRPv_xsoti6yaZAoZT5zNkU7sAAAAAAAAAAAAAAAA",
                                nonce: "0",
                            },
                        ],
                        reserved: {
                            fund: "97348",
                        },
                        unassigned: "122277",
                        unclaimed: "9958926",
                    },
                    gasCap: "200",
                    gasLimit: "400",
                    gasPrice: "200",
                    latestHeight: "1588223",
                    minimumAmount: "547",
                    minted: [
                        {
                            amount: "9905120",
                            chain: "Arbitrum",
                        },
                        {
                            amount: "20101680",
                            chain: "Avalanche",
                        },
                        {
                            amount: "302849901",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "1945667084",
                            chain: "Ethereum",
                        },
                        {
                            amount: "5549246",
                            chain: "Fantom",
                        },
                        {
                            amount: "961535",
                            chain: "Polygon",
                        },
                        {
                            amount: "69974880",
                            chain: "Solana",
                        },
                    ],
                    shards: [
                        {
                            pubKey: "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard: "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                outpoint: {
                                    hash: "RmOyJl0gkBrsVQXi7WzHNJM5EojgtumZ4LbXqZVxfOU",
                                    index: "0",
                                },
                                pubKeyScript:
                                    "dqkUyZiyqIrJZnbhTwdzkANBl5mmgjqIrA",
                                value: "4210379751",
                            },
                        },
                    ],
                },
            },
        },
    },
};
