import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { studentsRouter } from "./routers/students";
import { mirrorRouter } from "./routers/mirror";
import { messagesRouter } from "./routers/messages";
import { academicRouter } from "./routers/academic";
import { adminRouter } from "./routers/admin";
import { notificationsRouter } from "./routers/notifications";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  students: studentsRouter,
  mirror: mirrorRouter,
  messages: messagesRouter,
  academic: academicRouter,
  admin: adminRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
