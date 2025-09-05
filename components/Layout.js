// components/Layout.js
import React from "react"

export default function Layout({ children }) {
  return (
    <div className="shell">
      {/* Barra superior */}
      <header className="topbar">
        <div className="brand">SAKI</div>
      </header>

      {/* Contenido principal */}
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} SAKI | Código de Movimiento
      </footer>
    </div>
  )
}
