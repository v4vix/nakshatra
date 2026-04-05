import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from '@/lib/lucide-icons'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface UploadResult {
  success: boolean
  message: string
  source?: {
    id: string
    type: string
    metadata: { title: string }
    chunkCount: number
  }
}

interface KnowledgeUploaderProps {
  onUploadComplete?: (result: UploadResult) => void
  apiBase?: string
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error'

// ─── Component ──────────────────────────────────────────────────────────────────

export default function KnowledgeUploader({
  onUploadComplete,
  apiBase = import.meta.env.VITE_API_URL || '',
}: KnowledgeUploaderProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Drag & Drop Handlers ──

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState('dragging')
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState('idle')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState('idle')

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [])

  // ── File Selection ──

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [])

  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'text/plain', 'text/markdown']
    const validExtensions = /\.(pdf|txt|md|text)$/i

    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      setState('error')
      setMessage(`Unsupported file type. Please upload PDF, TXT, or MD files.`)
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setState('error')
      setMessage('File too large. Maximum size is 20 MB.')
      return
    }

    setSelectedFile(file)
    uploadFile(file)
  }

  // ── Upload ──

  const uploadFile = async (file: File) => {
    setState('uploading')
    setProgress(0)
    setMessage(`Uploading "${file.name}"...`)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          setProgress(pct)
          if (pct === 100) {
            setMessage('Processing and indexing...')
          }
        }
      })

      const result = await new Promise<UploadResult>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText)
            resolve({
              success: true,
              message: data.message,
              source: data.source,
            })
          } else {
            try {
              const err = JSON.parse(xhr.responseText)
              reject(new Error(err.error || 'Upload failed'))
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error')))
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

        xhr.open('POST', `${apiBase}/knowledge/upload`)
        xhr.send(formData)
      })

      setState('success')
      setMessage(result.message)
      setProgress(100)
      onUploadComplete?.(result)

      // Reset after 3s
      setTimeout(() => {
        setState('idle')
        setSelectedFile(null)
        setProgress(0)
        setMessage('')
      }, 3000)
    } catch (err) {
      setState('error')
      setMessage((err as Error).message)
    }
  }

  const reset = () => {
    setState('idle')
    setSelectedFile(null)
    setProgress(0)
    setMessage('')
    if (inputRef.current) inputRef.current.value = ''
  }

  // ── Render ──

  return (
    <div className="relative">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => state === 'idle' && inputRef.current?.click()}
        className={`
          relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer
          transition-all duration-300
          ${state === 'dragging'
            ? 'border-gold bg-gold/5 scale-[1.02]'
            : state === 'uploading'
              ? 'border-celestial/40 bg-celestial/5 cursor-wait'
              : state === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/5 cursor-default'
                : state === 'error'
                  ? 'border-red-500/40 bg-red-500/5 cursor-pointer'
                  : 'border-gold/20 hover:border-gold/40 hover:bg-gold/5'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,.text"
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-gold/70" />
              </div>
              <div>
                <p className="font-cinzel text-champagne text-sm">
                  Drop a sacred text here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PDF, TXT, or Markdown — up to 20 MB
                </p>
              </div>
            </motion.div>
          )}

          {state === 'dragging' && (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center animate-pulse">
                <FileText className="w-7 h-7 text-gold" />
              </div>
              <p className="font-cinzel text-gold text-sm">Release to upload</p>
            </motion.div>
          )}

          {state === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <Loader2 className="w-10 h-10 text-celestial animate-spin" />
              <p className="font-cinzel text-champagne text-sm">{message}</p>
              {/* Progress bar */}
              <div className="w-full max-w-xs h-2 bg-stardust rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold-shimmer rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-slate-400">{progress}%</p>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <CheckCircle className="w-10 h-10 text-emerald-400" />
              <p className="font-cinzel text-emerald-300 text-sm">{message}</p>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="font-cinzel text-red-300 text-sm">{message}</p>
              <button
                onClick={(e) => { e.stopPropagation(); reset() }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-champagne transition-colors"
              >
                <X size={12} /> Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
