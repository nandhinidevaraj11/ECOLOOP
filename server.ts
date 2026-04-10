import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Industrial Waste Reutilization System API is running" });
  });

  // Static recycling centers (fallback)
  app.get("/api/recycling-centers", (req, res) => {
    const mockCenters = [
      {
        id: 1,
        name: "Chennai E-Waste Management",
        location: "Guindy, Chennai",
        type: "E-Waste",
        contact: "+91 44 2235 1234",
        coordinates: { lat: 13.0067, lng: 80.2206 }
      },
      {
        id: 2,
        name: "Coimbatore Plastic Recyclers",
        location: "Peelamedu, Coimbatore",
        type: "Plastic",
        contact: "+91 422 257 5678",
        coordinates: { lat: 11.0272, lng: 77.0018 }
      },
      {
        id: 3,
        name: "Madurai Metal Recovery Unit",
        location: "K.Pudur, Madurai",
        type: "Metal",
        contact: "+91 452 256 9012",
        coordinates: { lat: 9.9252, lng: 78.1198 }
      }
    ];
    res.json(mockCenters);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
