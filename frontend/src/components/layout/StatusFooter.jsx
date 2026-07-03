function StatusFooter() {
  return (
    <footer className="status-footer">
      <span className="status-footer-left">Mush2 OS v2.4.1 | SYS_UPTIME: --:--:--</span>
      <div className="status-footer-right">
        <span className="status-footer-link" style={{ cursor: 'pointer' }} title="Not available">DEBUG_CON</span>
        <span className="status-footer-link" style={{ cursor: 'pointer' }} title="Not available">FIRMWARE_PUSH</span>
      </div>
    </footer>
  )
}

export default StatusFooter
