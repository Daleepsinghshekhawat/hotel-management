import useTheme from "./useTheme";

const User = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          theme === "dark"
            ? "linear-gradient(to right,#141e30,#243b55)"
            : "linear-gradient(to right,#e0eafc,#cfdef3)",
        color: theme === "dark" ? "white" : "black",
      }}
    >
      {/* Navbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          backgroundColor: theme === "dark" ? "#1e1e1e" : "white",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >
        <h2>User Dashboard</h2>

        <button onClick={toggleTheme} style={navBtn("black")}>
          {theme === "light" ? "🌙 Dark" : "☀ Light"}
        </button>
      </div>

      {/* Center Content */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 80px)",
        }}
      >
        <h1
          style={{
            fontSize: "50px",
            fontWeight: "bold",
            textShadow:
              theme === "dark"
                ? "2px 2px 10px rgba(255,255,255,0.3)"
                : "2px 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          👋 Hi, I am User
        </h1>
      </div>
    </div>
  );
};

const navBtn = (bg) => ({
  padding: "10px 18px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: bg,
  color: "white",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "bold",
});

export default User;
