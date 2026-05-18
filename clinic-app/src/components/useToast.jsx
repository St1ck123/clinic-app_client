import { useState, useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"

let _addToast = null
export function toast(message, type = "success", duration = 3500) {
    _addToast?.({ message, type, duration })
}
toast.success = (msg, dur) => toast(msg, "success", dur)
toast.error   = (msg, dur) => toast(msg, "error",   dur)
toast.info    = (msg, dur) => toast(msg, "info",    dur)

const icons = {
    success: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8l2.2 2.2L11 5.5" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    error: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round"/>
        </svg>
    ),
    info: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 7.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="8" cy="5" r="0.75" fill="currentColor"/>
        </svg>
    ),
}

function ToastItem({ id, message, type, duration, onRemove }) {
    const [visible, setVisible]   = useState(false)
    const [leaving, setLeaving]   = useState(false)
    const [progress, setProgress] = useState(100)
    const startRef  = useRef(null)
    const rafRef    = useRef(null)
    const timerRef  = useRef(null)

    const dismiss = useCallback(() => {
        setLeaving(true)
        cancelAnimationFrame(rafRef.current)
        clearTimeout(timerRef.current)
        setTimeout(() => onRemove(id), 300)
    }, [id, onRemove])

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true))

        timerRef.current = setTimeout(dismiss, duration)

        startRef.current = performance.now()
        const tick = (now) => {
            const elapsed = now - startRef.current
            const pct = Math.max(0, 100 - (elapsed / duration) * 100)
            setProgress(pct)
            if (pct > 0) rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)

        return () => {
            clearTimeout(timerRef.current)
            cancelAnimationFrame(rafRef.current)
        }
    }, [dismiss, duration])

    const colors = {
        success: { bg: "#f0fdf4", border: "#bbf7d0", icon: "#16a34a", bar: "#22c55e", text: "#15803d" },
        error:   { bg: "#fef2f2", border: "#fecaca", icon: "#dc2626", bar: "#ef4444", text: "#b91c1c" },
        info:    { bg: "#eff6ff", border: "#bfdbfe", icon: "#2563eb", bar: "#3b82f6", text: "#1d4ed8" },
    }
    const c = colors[type]

    return (
        <div
            role="alert"
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: "13px 14px 10px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
                minWidth: 280,
                maxWidth: 360,
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)",
                transform: visible && !leaving
                    ? "translateY(0) scale(1)"
                    : leaving
                        ? "translateY(8px) scale(0.96)"
                        : "translateY(16px) scale(0.96)",
                opacity: visible && !leaving ? 1 : 0,
                transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease",
            }}
            onClick={dismiss}
        >
            <span style={{ color: c.icon, flexShrink: 0, marginTop: 1 }}>{icons[type]}</span>

            <span style={{ fontSize: 14, lineHeight: 1.5, color: "#1a1815", flex: 1 }}>
        {message}
      </span>

            <button
                onClick={(e) => { e.stopPropagation(); dismiss() }}
                style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#9e9a94", fontSize: 16, lineHeight: 1, padding: 0,
                    flexShrink: 0, marginTop: -1,
                }}
                aria-label="Закрыть"
            >×</button>

            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
                background: `${c.border}`,
            }}>
                <div style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: c.bar,
                    transition: "width 0.1s linear",
                }} />
            </div>
        </div>
    )
}

export function ToastContainer() {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback(({ message, type, duration }) => {
        const id = Date.now() + Math.random()
        setToasts((prev) => [...prev, { id, message, type, duration }])
    }, [])

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    useEffect(() => {
        _addToast = addToast
        return () => { _addToast = null }
    }, [addToast])

    return createPortal(
        <div style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            zIndex: 9999,
            pointerEvents: "none",
        }}>
            {toasts.map((t) => (
                <div key={t.id} style={{ pointerEvents: "auto" }}>
                    <ToastItem {...t} onRemove={removeToast} />
                </div>
            ))}
        </div>,
        document.body
    )
}