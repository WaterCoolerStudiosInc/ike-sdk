export type UnlockRequest = {
  azero: string
  creationTime: string
  claimableTime: string
  userUnlockId: string
}

export type UserUnlockRequests = {
  pendingUserUnlockRequests: UnlockRequest[]
  claimableUserUnlockRequests: UnlockRequest[]
}
