import { Link } from "react-router-dom"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { requestJson } from "@/lib/api"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { PaginatedAdvertiserResponse, SyncStatus } from "@/types/api"

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
  const [advertisers, setAdvertisers] = useState<PaginatedAdvertiserResponse | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [advertiserSyncState, setAdvertiserSyncState] = useState<SyncStatus>({ loading: false })
  const [offerSyncState, setOfferSyncState] = useState<SyncStatus>({ loading: false })
  const [productSyncStates, setProductSyncStates] = useState<Record<string, SyncStatus>>({})
  const [cleanupState, setCleanupState] = useState<SyncStatus>({ loading: false })
  const [searchTerm, setSearchTerm] = useState("")

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const refreshAdvertisers = useCallback(async (query?: string, page = 0) => {
    setLoading(true)
    setPageError(null)
    try {
      const pageSize = 20
      let path = query
        ? `/admin/aggregator/rakuten/advertisers/search?query=${encodeURIComponent(query)}`
        : "/admin/aggregator/rakuten/advertisers"
      path += `&page=${page}&size=${pageSize}`
      path = path.replace("?&", "?")

      const data = await requestJson<PaginatedAdvertiserResponse>(path)
      setAdvertisers(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load advertisers"
      setPageError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAdvertisers(debouncedSearchTerm, page)
  }, [refreshAdvertisers, debouncedSearchTerm, page])

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

  const handleCleanupDummyJson = async () => {
    setCleanupState({ loading: true, message: "Deleting dummy JSON data…" })
    try {
      const result = await requestJson<{
        deletedMerchants: number
        deletedOffers: number
        deletedProducts: number
        deletedBrands: number
      }>("/admin/dev/seed/dummyjson", { method: "DELETE" })

      setCleanupState({
        loading: false,
        message: `Deleted ${result.deletedMerchants} merchants, ${result.deletedProducts} products, ${result.deletedOffers} offers.`,
      })
      refreshAdvertisers()
    } catch (error) {
      setCleanupState({
        loading: false,
        message: error instanceof Error ? error.message : "Cleanup failed",
      })
    }
  }

  const advertiserCount = advertisers?.totalElements ?? 0
  const advertiserList = useMemo(() => {
    return (advertisers?.content ?? []).map((advertiser) => {
      const syncInfo = productSyncStates[advertiser.id]
      return (
        <div
          key={advertiser.id}
          className="flex flex-col gap-3 rounded-xl border border-input/40 bg-muted/40 px-4 py-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="flex flex-col gap-1">
                                    <Link to={`/products/advertiser/${advertiser.id}`}>
                                      <p className="text-sm font-semibold hover:underline">{advertiser.name}</p>
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                      Advertiser ID: {advertiser.programId} · Merchant ID: {advertiser.id}
                                    </p>
                                  </div>            <div className="flex flex-col items-end gap-1 text-right">
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
    })
  }, [advertisers, productSyncStates, handleProductSync])

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
              <Button size="sm" variant="outline" onClick={() => refreshAdvertisers()} disabled={loading}>
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
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Advertisers</CardTitle>
              <CardDescription>Kick off deeper product syncs for each advertiser.</CardDescription>
            </div>
            <Input
              type="search"
              placeholder="Search advertisers..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {pageError ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {pageError}
            </div>
          ) : null}

          {loading && !advertiserList ? (
            <p className="text-sm text-muted-foreground">Loading advertisers…</p>
          ) : advertisers && advertisers.content.length === 0 ? (
            <p className="text-sm text-muted-foreground">No advertisers configured yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {advertiserList}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Page {advertisers ? advertisers.number + 1 : "-"} of {advertisers ? advertisers.totalPages : "-"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={!advertisers || advertisers.number === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={!advertisers || advertisers.number >= advertisers.totalPages - 1}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Remove dummy data</CardTitle>
            <CardDescription>
              Deletes everything imported through the DummyJSON seed so you can start with live Rakuten data.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="destructive" onClick={handleCleanupDummyJson} disabled={cleanupState.loading}>
              {cleanupState.loading ? "Cleaning…" : "Delete dummy data"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {cleanupState.message ?? "Run this after you finish building out Rakuten workflows."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
