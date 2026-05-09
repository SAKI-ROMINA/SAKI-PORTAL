export default function Layout({ children }) {
  return (
    <div
      style={{
        fontFamily: "system-ui,-apple-system,Segoe UI,Roboto",
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #071a33 0%, #082747 45%, #06172d 100%)",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "28px 18px 40px",
        }}
      >
        {children}

        <footer
          style={{
            marginTop: 48,
            color: "rgba(226, 232, 240, 0.45)",
            fontSize: 13,
          }}
        >
          © {new Date().getFullYear()} SAKI
        </footer>
      </div>
    </div>
  );
}