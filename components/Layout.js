export default function Layout({ children }) {
  return (
    <div style={{fontFamily:'system-ui,-apple-system,Segoe UI,Roboto', maxWidth: 920, margin: '40px auto', padding: '0 16px'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 style={{margin:0}}>SAKI</h1>
        <nav><a href="/" style={{marginRight:12}}>Inicio</a><a href="/dashboard">Panel</a></nav>
      </header>
      {children}
      <footer style={{marginTop:48,opacity:.6}}>© {new Date().getFullYear()} SAKI</footer>
    </div>
  );
}
