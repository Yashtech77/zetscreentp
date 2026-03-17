export default function Spinner({ size = 32, color = '#6366f1' }) {
  return (
    <>
      <style>{`@keyframes _spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${color}30`,
        borderTopColor: color,
        animation: '_spin 0.7s linear infinite',
        flexShrink: 0,
      }} />
    </>
  )
}

export function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
      <Spinner size={36} />
    </div>
  )
}
