import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import { Toggle } from '../ui/Toggle'
import { db } from '../../db/db'
import type { Photo, PhotoView } from '../../db/types'
import { parseDateKey, todayKey } from '../../lib/dates'

const PHOTOS_ENABLED_KEY = 'photosEnabled'
const VIEWS: PhotoView[] = ['front', 'side']
const VIEW_LABELS: Record<PhotoView, string> = { front: 'Front', side: 'Side' }

function dateLabel(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function PhotoThumb({ photo, onDelete }: { photo: Photo; onDelete: (id: number) => void }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo.blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo.blob])

  return (
    <div className="relative shrink-0">
      {url && (
        <img
          src={url}
          alt={`${VIEW_LABELS[photo.view]} view, ${dateLabel(photo.date)}`}
          className="h-32 w-24 rounded-lg object-cover"
        />
      )}
      <button
        type="button"
        aria-label="Delete photo"
        onClick={() => photo.id !== undefined && onDelete(photo.id)}
        className="pressable absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
      >
        ✕
      </button>
      <p className="mt-1 text-center text-[11px] text-muted">{dateLabel(photo.date)}</p>
    </div>
  )
}

function ViewSection({ view, photos, onAdd, onDelete }: {
  view: PhotoView
  photos: Photo[]
  onAdd: (view: PhotoView, file: File) => void
  onDelete: (id: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const earliest = photos[0]
  const latest = photos[photos.length - 1]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{VIEW_LABELS[view]}</h3>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="pressable min-h-12 rounded-lg bg-inset px-3 text-sm font-medium text-ink"
        >
          Add photo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) onAdd(view, file)
          }}
        />
      </div>

      {photos.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No {VIEW_LABELS[view].toLowerCase()} photos yet. Add one to start tracking.</p>
      ) : (
        <>
          {photos.length >= 2 && (
            <div className="mt-2 flex gap-3">
              <div>
                <p className="mb-1 text-xs text-muted">Earliest</p>
                <PhotoThumb photo={earliest} onDelete={onDelete} />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted">Latest</p>
                <PhotoThumb photo={latest} onDelete={onDelete} />
              </div>
            </div>
          )}
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {photos.map((p) => (
              <PhotoThumb key={p.id} photo={p} onDelete={onDelete} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function PhotosSection() {
  const setting = useLiveQuery(() => db.settings.get(PHOTOS_ENABLED_KEY), [])
  const photos = useLiveQuery(() => db.photos.orderBy('date').toArray(), [])
  const enabled = setting?.value === true

  async function toggle(next: boolean) {
    await db.settings.put({ key: PHOTOS_ENABLED_KEY, value: next })
  }

  async function addPhoto(view: PhotoView, file: File) {
    await db.photos.add({ date: todayKey(), view, blob: file })
  }

  async function deletePhoto(id: number) {
    await db.photos.delete(id)
  }

  return (
    <div>
      <Toggle checked={enabled} onChange={toggle} label="Track progress photos" />
      <p className="mt-1 text-xs text-muted">Photos stay on this device.</p>

      {enabled && photos && (
        <div className="mt-4 flex flex-col gap-5">
          {VIEWS.map((view) => (
            <ViewSection
              key={view}
              view={view}
              photos={photos.filter((p) => p.view === view)}
              onAdd={addPhoto}
              onDelete={deletePhoto}
            />
          ))}
        </div>
      )}
    </div>
  )
}
