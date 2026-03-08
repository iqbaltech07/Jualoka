/**
 * storeStatus.ts
 * Dummy in-memory store for open/closed status.
 * In production, replace with a real database / API call.
 */

export interface StoreStatus {
    isOpen: boolean
    closedMessage: string
}

const defaultStatus: StoreStatus = {
    isOpen: true,
    closedMessage: "Toko sedang tutup sementara. Kami akan segera kembali! 🙏",
}

let _status: StoreStatus = { ...defaultStatus }

export function getStoreStatus(): StoreStatus {
    return { ..._status }
}

export function setStoreStatus(status: Partial<StoreStatus>): void {
    _status = { ..._status, ...status }
}

export function toggleStoreOpen(): void {
    _status = { ..._status, isOpen: !_status.isOpen }
}
