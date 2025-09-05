// components/Layout.js
export default function Layout({ children }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">SAKI</div>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <small>© {new Date().getFullYear()} SAKI</small>
      </footer>
    </div>
  )
}
