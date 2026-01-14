import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const studentRouter = router({
  // Buscar todos com filtros
  getAll: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      grade: z.number().optional()
    }))
    .query(async ({ input }) => {
      const students = await db.getAllStudents();
      return students.filter(s => {
        const matchSearch = !input.search || 
          s.fullName.toLowerCase().includes(input.search.toLowerCase()) ||
          s.studentId.includes(input.search);
        const matchGrade = !input.grade || s.grade === input.grade;
        return matchSearch && matchGrade;
      });
    }),

  // Editar estudante
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      fullName: z.string().optional(),
      email: z.string().email().optional(),
      grade: z.number().optional(),
      isSuspended: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateStudent(id, data);
    }),

  // Deletar estudante
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteStudent(input.id);
    })
});