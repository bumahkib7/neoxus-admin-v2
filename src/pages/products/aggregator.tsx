import { useCallback, useEffect, useMemo, useState } from "react"
import Cookies from "js-cookie"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")

interface AdvertiserSummary {
  id: string
  name: string
  websiteUrl?: string | null
  programId: number
  lastSyncedAt?: string | null
}

type SyncStatus = {
  loading: boolean
  message?: string
}

const getHeaders = () => {
  const token = Cookies.get("auth_token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function requestJson<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || response.statusText)
  }

  return (await response.json()) as T
}

const formatDate = (value?: string | null) => {
  if (!value) return "Never synced"
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch (_error) {
    return value
  }
}

export default function AggregatorPage() {
  const [advertisers, setAdvertisers] = useState<AdvertiserSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [advertiserSyncState, setAdvertiserSyncState] = useState<SyncStatus>({ loading: false })
  const [offerSyncState, setOfferSyncState] = useState<SyncStatus>({ loading: false })
  const [productSyncStates, setProductSyncStates] = useState<Record<string, SyncStatus>>({})

  const refreshAdvertisers = useCallback(async () => {
    setLoading(true)
    setPageError(null)
    try {
      const data = await requestJson<AdvertiserSummary[]>("/admin/aggregator/rakuten/advertisers")
      setAdvertisers(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load advertisers"
      setPageError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAdvertisers()
  }, [refreshAdvertisers])

  const handleAdvertiserSync = async () => {
    setAdvertiserSyncState({ loading: true, message: "Enqueued advertiser sync..." })
    try {
      const result = await requestJson<{
        totalAdvertisers: number
        created: number
        updated: number
      }>("/admin/aggregator/rakuten/advertisers/sync", { method: "POST" })
      setAdvertiserSyncState({
        loading: false,
        message: `Synced ${result.totalAdvertisers} advertisers (created ${result.created}, updated ${result.updated})`,
      })
      refreshAdvertisers()
    } catch (error) {
      setAdvertiserSyncState({
        loading: false,
        message: error instanceof Error ? error.message : "Advertiser sync failed",
      })
    }
  }

  const handleOfferSync = async () => {
    setOfferSyncState({ loading: true, message: "Enqueued offer metadata sync..." })
    try {
      const result = await requestJson<{ totalOffers: number; merchantsUpdated: number }>(
        "/admin/aggregator/rakuten/offers/sync",
        { method: "POST" }
      )
      setOfferSyncState({
        loading: false,
        message: `Synced ${result.totalOffers} offers (merchants updated: ${result.merchantsUpdated})`,
      })
    } catch (error) {
      setOfferSyncState({
        loading: false,
        message: error instanceof Error ? error.message : "Offer sync failed",
      })
    }
  }

  const handleProductSync = async (advertiserId: string) => {
    setProductSyncStates((prev) => ({
      ...prev,
      [advertiserId]: { loading: true, message: "Syncing products..." },
    }))

    try {
      const result = await requestJson<{
        totalItems: number
        totalPages: number
        createdProducts: number
        updatedProducts: number
        createdOffers: number
        updatedOffers: number
        deactivatedOffers: number
      }>(`/admin/aggregator/rakuten/advertisers/${advertiserId}/sync-products`, {
        method: "POST",
      })

      setProductSyncStates((prev) => ({
        ...prev,
        [advertiserId]: {
          loading: false,
          message: `Products: ${result.createdProducts} new, ${result.updatedProducts} updated, ${result.deactivatedOffers} deactivated`,
        },
      }))
      refreshAdvertisers()
    } catch (error) {
      setProductSyncStates((prev) => ({
        ...prev,
        [advertiserId]: {
          loading: false,
          message: error instanceof Error ? error.message : "Product sync failed",
        },
      }))
    }
  }

  const advertiserCount = advertisers.length
  const summaryMessage = useMemo(() => {
    if (pageError) return "Unable to load advertisers"
    if (loading) return "Loading advertisers..."
    return `${advertiserCount} advertiser${advertiserCount === 1 ? "" : "s"} configured`
  }, [advertiserCount, loading, pageError])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Aggregator</p>
        <h1 className="text-3xl font-semibold">Rakuten console</h1>
        <p className="text-sm text-muted-foreground">
          {summaryMessage}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Advertiser sync</CardTitle>
              <CardDescription>Refresh the list of Rakuten advertisers and their metadata.</CardDescription>
            </div>
            <div className="flex items-start gap-2">
              <Button size="sm" variant="secondary" onClick={handleAdvertiserSync} disabled={advertiserSyncState.loading}>
                {advertiserSyncState.loading ? "Running…" : "Sync advertisers"}
              </Button>
              <Button size="sm" variant="outline" onClick={refreshAdvertisers} disabled={loading}>
                Refresh list
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {advertiserSyncState.message ?? "Last sync stats will surface here."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Offer metadata</CardTitle>
              <CardDescription>Pull offer metadata from Rakuten to keep catalogs in sync.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleOfferSync} disabled={offerSyncState.loading}>
                {offerSyncState.loading ? "Running…" : "Sync offers"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {offerSyncState.message ?? "Run this after advertiser or product syncs to refresh offer metadata."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="space-y-4">
        <CardHeader>
          <div>
            <CardTitle>Advertisers</CardTitle>
            <CardDescription>Kick off deeper product syncs for each advertiser.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {pageError ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {pageError}
            </div>
          ) : null}

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading advertisers…</p>
          ) : advertisers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No advertisers configured yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {advertisers.map((advertiser) => {
                const syncInfo = productSyncStates[advertiser.id]
                return (
                  <div
                    key={advertiser.id}
                    className="flex flex-col gap-3 rounded-xl border border-input/40 bg-muted/40 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold">{advertiser.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Advertiser ID: {advertiser.programId} · Merchant ID: {advertiser.id}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-right">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Last sync</p>
                        <p className="text-sm">{formatDate(advertiser.lastSyncedAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex-1 text-sm text-muted-foreground">
                        {syncInfo?.message ?? "Run a product sync to import canonical catalog data."}
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleProductSync(advertiser.id)}
                        disabled={syncInfo?.loading}
                      >
                        {syncInfo?.loading ? "Syncing…" : "Sync products"}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-xs text-muted-foreground">
            These syncs seed the Neoxus catalog with Rakuten inventory; use them when you need fresh data or after onboarding a new advertiser.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
