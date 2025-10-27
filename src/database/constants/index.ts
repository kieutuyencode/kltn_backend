export enum NetworkId {
  TOBE = 1,
  BNB = 2,
  ETH = 3,
}

export enum ContractId {
  FACTORY_TOBE = 1,
  ROUTER_TOBE = 2,
  BRIDGE_TOBE = 3,
  BRIDGE_BNB = 4,
  BRIDGE_ETH = 5,
}

export enum PoolTransactionTypeId {
  SWAP = 1,
  ADD = 2,
  REMOVE = 3,
}

export enum SwapStatusId {
  INCOMPLETE = 1,
  PENDING_CONFIRM = 2,
  PROCESSING = 3,
  PROCESSED = 4,
  SUCCESS = 5,
  FAIL = 6,
}
