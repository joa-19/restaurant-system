import http from "http";
import { initSocket } from "./socket";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import { requireAuth, requireRole, AuthRequest } from "./middleware/auth.middleware";
import menuRoutes from "./modules/menu/menu.routes";
import tablesRoutes from "./modules/tables/tables.routes";
import { getPublicMenu } from "./modules/menu/public.controller";
import ordersRoutes from "./modules/orders/orders.routes";
import paymentsRoutes from "./modules/payments/payments.routes";
import kitchenRoutes from "./modules/kitchen/kitchen.routes";
import waiterRoutes from "./modules/waiter/waiter.routes";
import cashierRoutes from "./modules/cashier/cashier.routes";
import managerRoutes from "./modules/manager/manager.routes";
import rateLimit from "express-rate-limit";
import helmet from "helmet";


dotenv.config();

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per IP per minute
  message: { error: "Too many requests, please slow down." },
});

app.use("/public", publicLimiter);
app.use("/orders", publicLimiter);
app.use("/payments", publicLimiter);


app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is alive 🚀" });
});

app.get("/public/menu", getPublicMenu);
app.use("/auth", authRoutes);

app.use("/menu", menuRoutes);
app.use("/tables", tablesRoutes);
app.use("/orders", ordersRoutes);
app.use("/payments", paymentsRoutes);
app.use("/kitchen", kitchenRoutes);
app.use("/waiter", waiterRoutes);
app.use("/cashier", cashierRoutes);
app.use("/manager", managerRoutes);


app.get("/me", requireAuth, requireRole("MANAGER"), (req: AuthRequest, res) => {
  res.json({ message: "You're in! 🎉", user: req.user });
});

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});