import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Search,
  Database,
  Globe,
  Trash2,
  Download,
  Sparkles,
  FileText,
  Link2,
  BarChart3,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from '@/lib/lucide-icons'
import toast from 'react-hot-toast'
import axios from 'axios'
import KnowledgeUploader from '@/components/KnowledgeUploader'

// ─── Config ─────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || ''

// ─── Types ──────────────────────────────────────────────────────────────────────

interface KnowledgeSource {
  id: string
  type: 'pdf' | 'text' | 'url' | 'seed'
  metadata: {
    title: string
    url?: string
    author?: string
    pageCount?: number
  }
  chunkCount: number
  createdAt: string
  updatedAt: string
}

interface KBStats {
  totalChunks: number
  totalSources: number
  sourceBreakdown: Record<string, number>
  estimatedSizeBytes: number
  lastUpdated: string | null
}

interface SearchResult {
  chunkId: string
  text: string
  score: number
  sourceId: string
  section?: string
}

interface AuthenticSource {
  name: string
  url: string
  category: string
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function KnowledgeBase() {
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [stats, setStats] = useState<KBStats | null>(null)
  const [authenticSources, setAuthenticSources] = useState<AuthenticSource[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upload' | 'scrape' | 'search'>('upload')
  const [expandedResult, setExpandedResult] = useState<string | null>(null)

  // ── Data Fetching ──

  const fetchData = useCallback(async () => {
    try {
      const [sourcesRes, statsRes, authRes] = await Promise.all([
        axios.get(`${API_BASE}/knowledge/sources`),
        axios.get(`${API_BASE}/knowledge/stats`),
        axios.get(`${API_BASE}/knowledge/authentic-sources`),
      ])
      setSources(sourcesRes.data.sources)
      setStats(statsRes.data)
      setAuthenticSources(authRes.data.sources)
    } catch (err) {
      if (import.meta.env.DEV) console.warn('Knowledge API not available:', (err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Actions ──

  const handleSeed = async () => {
    setIsSeeding(true)
    try {
      const res = await axios.post(`${API_BASE}/knowledge/seed`)
      toast.success(res.data.message)
      fetchData()
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.success(err.response.data.message)
      } else {
        toast.error('Failed to seed knowledge base')
      }
    } finally {
      setIsSeeding(false)
    }
  }

  const handleScrape = async (url?: string) => {
    const targetUrl = url || scrapeUrl
    if (!targetUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }
    setIsScraping(true)
    try {
      const res = await axios.post(`${API_BASE}/knowledge/scrape`, { url: targetUrl })
      toast.success(res.data.message)
      setScrapeUrl('')
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to scrape URL')
    } finally {
      setIsScraping(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await axios.post(`${API_BASE}/knowledge/search`, {
        query: searchQuery,
        topK: 5,
      })
      setSearchResults(res.data.results)
      if (res.data.results.length === 0) {
        toast('No results found. Try a different query.', { icon: 'i' })
      }
    } catch (err) {
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Remove "${title}" and all its indexed chunks?`)) return
    try {
      await axios.delete(`${API_BASE}/knowledge/sources/${id}`)
      toast.success(`Removed "${title}"`)
      fetchData()
    } catch {
      toast.error('Failed to remove source')
    }
  }

  // ── Helpers ──

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={14} className="text-red-400" />
      case 'url': return <Globe size={14} className="text-blue-400" />
      case 'seed': return <Sparkles size={14} className="text-gold" />
      default: return <FileText size={14} className="text-slate-400" />
    }
  }

  // ── Render ──

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20">
          <BookOpen size={14} className="text-gold" />
          <span className="text-xs font-cinzel text-gold">Vedic Knowledge Engine</span>
        </div>
        <h1 className="font-cinzel text-3xl text-gold-gradient font-bold">
          Knowledge Base
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto font-cormorant">
          Upload sacred texts, scrape authentic sources, and build your Vedic wisdom library
          for the Cosmic Oracle.
        </p>
      </motion.div>

      {/* Stats Dashboard */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { label: 'Knowledge Chunks', value: stats.totalChunks.toLocaleString(), icon: Database, color: 'text-gold' },
            { label: 'Sources', value: stats.totalSources.toString(), icon: BookOpen, color: 'text-celestial' },
            { label: 'Index Size', value: formatBytes(stats.estimatedSizeBytes), icon: BarChart3, color: 'text-saffron' },
            { label: 'Last Updated', value: stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Never', icon: Sparkles, color: 'text-ethereal' },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass-card p-4 rounded-xl border border-gold/10 text-center"
            >
              <stat.icon size={18} className={`mx-auto mb-2 ${stat.color}`} />
              <p className="font-cinzel text-xl text-champagne">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Seed Button (if no sources) */}
      {!loading && sources.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 rounded-2xl border border-gold/20 text-center space-y-4"
        >
          <Sparkles className="w-12 h-12 text-gold mx-auto" />
          <h3 className="font-cinzel text-lg text-champagne">Start Your Knowledge Journey</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Seed the knowledge base with built-in Vedic wisdom covering all 27 Nakshatras,
            12 Rashis, 9 Grahas, Dasha systems, and more.
          </p>
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold/20 border border-gold/30 text-gold font-cinzel text-sm hover:bg-gold/30 transition-all disabled:opacity-50"
          >
            {isSeeding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isSeeding ? 'Seeding...' : 'Seed Default Knowledge'}
          </button>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 justify-center">
        {[
          { id: 'upload' as const, label: 'Upload', icon: FileText },
          { id: 'scrape' as const, label: 'Web Scrape', icon: Globe },
          { id: 'search' as const, label: 'Search', icon: Search },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-cinzel text-xs transition-all
              ${activeTab === tab.id
                ? 'bg-gold/15 border border-gold/30 text-gold'
                : 'border border-transparent text-slate-400 hover:text-champagne hover:bg-stardust/50'
              }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <KnowledgeUploader
              apiBase={API_BASE}
              onUploadComplete={() => fetchData()}
            />
          </motion.div>
        )}

        {/* Scrape Tab */}
        {activeTab === 'scrape' && (
          <motion.div
            key="scrape"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* URL Input */}
            <div className="glass-card p-5 rounded-2xl border border-gold/10 space-y-3">
              <h3 className="font-cinzel text-sm text-champagne flex items-center gap-2">
                <Link2 size={14} className="text-gold" />
                Scrape a Web Page
              </h3>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                  placeholder="https://www.sacred-texts.com/hin/gita/"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-cosmos border border-gold/10 text-champagne text-sm placeholder:text-slate-500 focus:outline-none focus:border-gold/40 transition-colors"
                />
                <button
                  onClick={() => handleScrape()}
                  disabled={isScraping || !scrapeUrl.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gold/20 border border-gold/30 text-gold font-cinzel text-xs hover:bg-gold/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isScraping ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Globe size={14} />
                  )}
                  {isScraping ? 'Scraping...' : 'Scrape'}
                </button>
              </div>
            </div>

            {/* Authentic Sources */}
            {authenticSources.length > 0 && (
              <div className="glass-card p-5 rounded-2xl border border-gold/10 space-y-3">
                <h3 className="font-cinzel text-sm text-champagne flex items-center gap-2">
                  <Sparkles size={14} className="text-saffron" />
                  Authentic Vedic Sources
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-configured authentic, public-domain Vedic texts you can scrape directly.
                </p>
                <div className="grid gap-2">
                  {authenticSources.map((src, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-stardust/30 border border-gold/5 hover:border-gold/20 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ExternalLink size={12} className="text-slate-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-cinzel text-champagne truncate">
                            {src.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{src.url}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleScrape(src.url)}
                        disabled={isScraping}
                        className="flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-xs font-cinzel text-gold/70 border border-gold/10 hover:bg-gold/10 hover:text-gold transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      >
                        Scrape
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="glass-card p-5 rounded-2xl border border-gold/10 space-y-3">
              <h3 className="font-cinzel text-sm text-champagne flex items-center gap-2">
                <Search size={14} className="text-gold" />
                Semantic Search
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="What are the characteristics of Pushya Nakshatra?"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-cosmos border border-gold/10 text-champagne text-sm placeholder:text-slate-500 focus:outline-none focus:border-gold/40 transition-colors"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gold/20 border border-gold/30 text-gold font-cinzel text-xs hover:bg-gold/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSearching ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                  Search
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-cinzel px-1">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </p>
                {searchResults.map((result, i) => (
                  <motion.div
                    key={result.chunkId}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-xl border border-gold/10 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedResult(
                        expandedResult === result.chunkId ? null : result.chunkId
                      )}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gold/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                          <span className="text-xs font-cinzel text-gold">#{i + 1}</span>
                        </div>
                        <div className="min-w-0">
                          {result.section && (
                            <span className="text-xs text-gold/70 font-cinzel">{result.section}</span>
                          )}
                          <p className="text-xs text-slate-300 truncate">
                            {result.text.slice(0, 120)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-xs text-slate-500">
                          {(result.score * 100).toFixed(1)}%
                        </span>
                        {expandedResult === result.chunkId ? (
                          <ChevronUp size={14} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedResult === result.chunkId && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-gold/5">
                            <p className="text-xs text-slate-300 mt-3 whitespace-pre-wrap leading-relaxed">
                              {result.text}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indexed Sources */}
      {sources.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="font-cinzel text-sm text-champagne flex items-center gap-2 px-1">
            <Database size={14} className="text-gold" />
            Indexed Sources ({sources.length})
          </h2>
          <div className="grid gap-2">
            {sources.map((source) => (
              <div
                key={source.id}
                className="glass-card flex items-center justify-between p-4 rounded-xl border border-gold/10 group hover:border-gold/20 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {typeIcon(source.type)}
                  <div className="min-w-0">
                    <p className="text-sm text-champagne font-cinzel truncate">
                      {source.metadata.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{source.chunkCount} chunks</span>
                      <span>{source.type.toUpperCase()}</span>
                      <span>{new Date(source.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(source.id, source.metadata.title)}
                  className="flex-shrink-0 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove source"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Seed Button (when sources exist but no seed) */}
          {!sources.some((s) => s.type === 'seed') && (
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-gold/15 text-gold/50 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all text-xs font-cinzel disabled:opacity-50"
            >
              {isSeeding ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {isSeeding ? 'Seeding...' : 'Seed Built-in Vedic Knowledge'}
            </button>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="text-xs text-slate-400 font-cinzel">Connecting to Knowledge Engine...</p>
        </div>
      )}
    </div>
  )
}
