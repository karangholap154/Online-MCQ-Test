import { useState, useEffect } from "react";
import { Home, ArrowLeft, Rocket, RefreshCw } from "lucide-react";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  return (
    <div
      className="vh-100 w-100 d-flex align-items-center justify-content-center text-center position-relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg,#eef2ff,#f8fafc,#e0e7ff,#edf2ff)",
      }}
    >
      {/* Page Animations */}
      <style>
        {`
        @keyframes float {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-25px)}
        }
        @keyframes pulse {
          0%,100%{opacity:.4;transform:scale(.9)}
          50%{opacity:1;transform:scale(1.1)}
        }
        .floating {
          animation: float 6s ease-in-out infinite;
        }
        .pulse {
          animation: pulse 4s infinite ease-in-out;
        }
      `}
      </style>

      {/* Decorative Bubbles */}
      <span
        className="position-absolute rounded-circle pulse"
        style={{
          width: 180,
          height: 180,
          background: "#c7d2fe",
          top: "10%",
          left: "8%",
          filter: "blur(10px)",
        }}
      />
      <span
        className="position-absolute rounded-circle pulse"
        style={{
          width: 220,
          height: 220,
          background: "#e0e7ff",
          bottom: "12%",
          right: "10%",
          filter: "blur(12px)",
        }}
      />

      {/* Main Card */}
      <div className="p-5 rounded-4 shadow-lg bg-white position-relative">
        <div
          className="mx-auto floating"
          style={{
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          }}
        >
          <Rocket size={120} className="text-primary mb-3" />
        </div>

        <h1 className="display-1 fw-bold text-primary mb-0">404</h1>
        <h3 className="fw-semibold text-dark mb-3">
          Ohh, we lost the page
        </h3>

        <p className="text-secondary mb-4 fs-5">
          The page you are looking for isn't found or may have moved.
        </p>

        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 px-4"
          >
            <ArrowLeft size={18} /> Go Back
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="btn btn-primary text-white d-flex align-items-center justify-content-center gap-2 px-4"
          >
            <Home size={18} /> Return Home
          </button>
        </div>

        <div className="mt-4 border-top pt-3 text-muted small">
          Error Code: <strong>404_NOT_FOUND</strong>
          <br />
          <button
            onClick={() => window.location.reload()}
            className="btn btn-link text-decoration-none text-primary d-flex align-items-center gap-1 mx-auto"
          >
            <RefreshCw size={14} /> Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
