import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requestJson } from "@/lib/api"
import type { AffiliateMerchant } from "@/types/api"

export default function AdvertiserDetailPage() {
  const [merchant, setMerchant] = useState<AffiliateMerchant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    if (!id) {
      setError("No merchant ID provided.")
      setLoading(false)
      return
    }

    const fetchMerchant = async () => {
      setLoading(true)
      try {
        const data = await requestJson<AffiliateMerchant>(`/admin/merchants/${id}`)
        setMerchant(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load merchant details")
      } finally {
        setLoading(false)
      }
    }

    fetchMerchant()
  }, [id])

  const renderJson = (jsonString: string | null | undefined, title: string) => {
    if (!jsonString) return null
    try {
      const data = JSON.parse(jsonString)
      return (
        <div>
          <h3 className="font-semibold mt-4 mb-2">{title}</h3>
          <pre className="p-4 bg-muted rounded-md text-sm overflow-auto">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      )
    } catch {
      return (
        <div>
          <h3 className="font-semibold mt-4 mb-2">{title}</h3>
          <p className="text-destructive text-sm">Failed to parse JSON.</p>
          <pre className="p-4 bg-muted rounded-md text-sm overflow-auto">
            <code>{jsonString}</code>
          </pre>
        </div>
      )
    }
  }

  if (loading) {
    return <p>Loading details...</p>
  }

  if (error) {
    return <p className="text-destructive">{error}</p>
  }

  if (!merchant) {
    return <p>No merchant data found.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{merchant.name}</h1>
        <p className="text-sm text-muted-foreground">
          ID: {merchant.id} · Program ID: {merchant.programId}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div><span className="font-semibold">Network:</span> {merchant.network}</div>
            <div><span className="font-semibold">Status:</span> {merchant.active ? "Active" : "Inactive"}</div>
            <div><span className="font-semibold">Website:</span> <a href={merchant.websiteUrl ?? '#'} target="_blank" rel="noreferrer" className="text-primary hover:underline">{merchant.websiteUrl}</a></div>
            <div><span className="font-semibold">Last Synced:</span> {new Date(merchant.lastSyncedAt ?? 0).toLocaleString()}</div>
          </div>
          {renderJson(merchant.policiesJson, "Policies")}
          {renderJson(merchant.featuresJson, "Features")}
          {renderJson(merchant.metadataJson, "Metadata")}
        </CardContent>
      </Card>
    </div>
  )
}
