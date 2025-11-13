import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function SongCard({ song }) {
  return (
    <div className="group rounded-xl border border-neutral-200/70 bg-white/70 backdrop-blur-sm hover:bg-white transition-colors p-4 flex gap-4">
      <img
        src={song.cover_url || `https://picsum.photos/seed/${encodeURIComponent(song.title)}/96/96`}
        alt={`${song.title} cover`}
        className="h-24 w-24 rounded-lg object-cover shadow-sm"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{song.title}</h3>
            <p className="text-neutral-600">{song.artist}{song.album ? ` • ${song.album}` : ''}</p>
            {song.genre && (
              <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">{song.genre}</span>
            )}
          </div>
          {song.listen_url && (
            <a
              href={song.listen_url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              Listen
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M13.5 4.5h6v6m0-6L10 14m9.5-9.5H14" strokeWidth="1.5"/>
              </svg>
            </a>
          )}
        </div>
        {song.year && <p className="text-xs mt-2 text-neutral-500">Released {song.year}</p>}
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200/60 backdrop-blur bg-white/70">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-neutral-700 to-black text-white grid place-items-center font-bold">FM</div>
          <span className="text-lg font-semibold tracking-tight text-neutral-900">Free Music</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-700">
          <a className="hover:text-black" href="#">Home</a>
          <a className="hover:text-black" href="#">Discover</a>
          <a className="hover:text-black" href="#">About</a>
        </nav>
      </div>
    </header>
  )
}

function App() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [genre, setGenre] = useState('')

  const genres = useMemo(() => {
    const set = new Set()
    songs.forEach(s => s.genre && set.add(s.genre))
    return Array.from(set).sort()
  }, [songs])

  const fetchSongs = async (params = {}) => {
    setLoading(true)
    const usp = new URLSearchParams()
    if (params.q) usp.set('q', params.q)
    if (params.genre) usp.set('genre', params.genre)
    const res = await fetch(`${API_BASE}/api/songs?${usp.toString()}`)
    const data = await res.json()
    setSongs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchSongs({})
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Explore Free Music</h1>
          <p className="text-neutral-600 mt-1">Browse a community-curated list of free tracks.</p>
        </section>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197M17.803 10.651a7.151 7.151 0 1 1-14.303 0 7.151 7.151 0 0 1 14.303 0Z" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter') fetchSongs({ q, genre })}}
              placeholder="Search title or artist"
              className="w-full outline-none py-2 text-sm"
            />
            <button onClick={()=>fetchSongs({ q, genre })} className="ml-auto text-sm px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-black">Search</button>
          </div>
          <div className="flex items-center gap-2">
            <select value={genre} onChange={(e)=>{ setGenre(e.target.value); fetchSongs({ q, genre: e.target.value }) }} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
              <option value="">All genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="grid place-items-center py-24 text-neutral-500">Loading songs…</div>
        ) : songs.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-neutral-600">No songs found. Be the first to add one below.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {songs.map(s => <SongCard key={s.id || s._id || s.title+Math.random()} song={s} />)}
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3">Add a free track</h2>
          <SongForm onAdded={()=>fetchSongs({ q, genre })} />
        </section>
      </main>

      <footer className="mt-16 border-t border-neutral-200/70 bg-white/60">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-neutral-600">
          Built with a simple, classic aesthetic. Enjoy the music.
        </div>
      </footer>
    </div>
  )
}

function SongForm({ onAdded }) {
  const [form, setForm] = useState({ title: '', artist: '', album: '', genre: '', year: '', cover_url: '', listen_url: '' })
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const payload = { ...form, year: form.year ? Number(form.year) : undefined, is_free: true }
    const res = await fetch(`${API_BASE}/api/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    setSubmitting(false)
    if (res.ok) {
      setForm({ title: '', artist: '', album: '', genre: '', year: '', cover_url: '', listen_url: '' })
      onAdded && onAdded()
    } else {
      const err = await res.json().catch(()=>({detail:'Unknown error'}))
      alert(err.detail || 'Failed to add song')
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" name="title" placeholder="Title" value={form.title} onChange={onChange} required />
        <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" name="artist" placeholder="Artist" value={form.artist} onChange={onChange} required />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" name="album" placeholder="Album" value={form.album} onChange={onChange} />
        <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" name="genre" placeholder="Genre" value={form.genre} onChange={onChange} />
        <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" name="year" placeholder="Year" value={form.year} onChange={onChange} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" name="cover_url" placeholder="Cover image URL" value={form.cover_url} onChange={onChange} />
        <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" name="listen_url" placeholder="Listen URL (YouTube, SoundCloud, etc.)" value={form.listen_url} onChange={onChange} />
      </div>
      <div className="flex justify-end">
        <button disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-black disabled:opacity-60">
          {submitting ? 'Adding…' : 'Add song'}
        </button>
      </div>
    </form>
  )
}

export default App
