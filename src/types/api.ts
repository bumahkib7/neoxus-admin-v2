export interface PaginatedAdvertiserResponse {
  content: AdvertiserSummary[]
  totalElements: number
  totalPages: number
  number: number
}

export interface AdvertiserSummary {
  id: string
  name: string
  websiteUrl?: string | null
  programId: number
  lastSyncedAt?: string | null
}

export interface AffiliateMerchant extends AdvertiserSummary {
  network: string
  logoUrl?: string | null
  active: boolean
  policiesJson?: string | null
  featuresJson?: string | null
  metadataJson?: string | null
}

export type SyncStatus = {
  loading: boolean
  message?: string
}

export interface DummyJsonSeedResult {
  total: number
  createdProducts: number
  updatedProducts: number
  createdOffers: number
  updatedOffers: number
  skippedProducts: number
  errors: string[]
}
