"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LuArrowRightLeft as Transfer, LuArrowLeft as Return } from "react-icons/lu"
import { SUPABASE_CONFIG } from "@/config"
import { supabase } from "@/lib/supabaseClient"

interface TransferAssetDialogProps {
  open: boolean
  onClose: () => void
  assetId: number
  assetName: string
  currentLocation: string
  homeLocation: string
  isTransferred: boolean
  locations: Array<{ name: string }>
  onTransferComplete: () => void
  token?: string
}

export function TransferAssetDialog({
  open,
  onClose,
  assetId,
  assetName,
  currentLocation,
  homeLocation,
  isTransferred,
  locations,
  onTransferComplete,
  token,
}: TransferAssetDialogProps) {
  const [toLocation, setToLocation] = useState("")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")
  const [transferReason, setTransferReason] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const handleTransfer = async () => {
    if (!toLocation) {
      toast.error("Please select a destination location")
      return
    }

    setLoading(true)
    try {
      if (SUPABASE_CONFIG.USE_SUPABASE && supabase) {
        // Use Supabase RPC
        const { error } = await supabase.rpc('initiate_component_transfer', {
          p_component_id: assetId,
          p_to_location: toLocation,
          p_expected_return_date: expectedReturnDate || null,
          p_transfer_reason: transferReason || null,
          p_notes: notes || null
        });

        if (error) throw error;
        
        toast.success(`${assetName} transferred to ${toLocation}`)
        onTransferComplete()
        onClose()
        resetForm()
      } else {
        // Use REST API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/components/${assetId}/transfer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            to_location: toLocation,
            expected_return_date: expectedReturnDate || null,
            transfer_reason: transferReason,
            notes: notes,
          }),
        })

        if (response.ok) {
          toast.success(`${assetName} transferred to ${toLocation}`)
          onTransferComplete()
          onClose()
          resetForm()
        } else {
          const error = await response.json()
          toast.error(error.detail || "Failed to transfer asset")
        }
      }
    } catch (error: any) {
      console.error("Transfer error:", error)
      toast.error(error.message || "Failed to transfer asset")
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async () => {
    setLoading(true)
    try {
      if (SUPABASE_CONFIG.USE_SUPABASE && supabase) {
        // Use Supabase RPC
        const { error } = await supabase.rpc('return_component_from_transfer', {
          p_component_id: assetId,
          p_notes: notes || null
        });

        if (error) throw error;

        toast.success(`${assetName} returned to ${homeLocation}`)
        onTransferComplete()
        onClose()
        resetForm()
      } else {
        // Use REST API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/components/${assetId}/return`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes: notes,
          }),
        })

        if (response.ok) {
          toast.success(`${assetName} returned to ${homeLocation}`)
          onTransferComplete()
          onClose()
          resetForm()
        } else {
          const error = await response.json()
          toast.error(error.detail || "Failed to return asset")
        }
      }
    } catch (error: any) {
      console.error("Return error:", error)
      toast.error(error.message || "Failed to return asset")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setToLocation("")
    setExpectedReturnDate("")
    setTransferReason("")
    setNotes("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isTransferred ? (
              <>
                <Return className="w-5 h-5" />
                Return Asset to Home Location
              </>
            ) : (
              <>
                <Transfer className="w-5 h-5" />
                Transfer Asset
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isTransferred
              ? `Return ${assetName} from ${currentLocation} back to ${homeLocation}`
              : `Transfer ${assetName} from ${currentLocation} to another location`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isTransferred ? (
            <>
              {/* Transfer Form */}
              <div className="space-y-2">
                <Label htmlFor="toLocation">Destination Location *</Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations
                      .filter((loc) => loc.name !== currentLocation)
                      .map((location) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedReturnDate">Expected Return Date</Label>
                <Input
                  id="expectedReturnDate"
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferReason">Reason for Transfer</Label>
                <Input
                  id="transferReason"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g., Project requirement, Training, Temporary assignment"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this transfer"
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              {/* Return Form */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Current Location:</strong> {currentLocation}
                  <br />
                  <strong>Home Location:</strong> {homeLocation}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnNotes">Return Notes</Label>
                <Textarea
                  id="returnNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about the return (optional)"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          {isTransferred ? (
            <Button onClick={handleReturn} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Return className="w-4 h-4 mr-2" />
              {loading ? "Returning..." : "Return to Home"}
            </Button>
          ) : (
            <Button onClick={handleTransfer} disabled={loading}>
              <Transfer className="w-4 h-4 mr-2" />
              {loading ? "Transferring..." : "Transfer Asset"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
