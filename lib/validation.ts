import { z } from "zod";

// Validación para boleta
export const boletaSchema = z
  .string()
  .nonempty("Este campo es obligatorio")
  .regex(/^\d{10}$/, "La boleta debe tener 10 dígitos");

// Validación para contraseña
export const passwordSchema = z
  .string()
  .nonempty("Este campo es obligatorio")
  .min(8, "La contraseña debe tener al menos 8 caracteres");

// Esquema para login
export const authSchema = z.object({
  boleta: boletaSchema,
  password: passwordSchema,
});

export type AuthForm = z.infer<typeof authSchema>;

// Esquema para registro
export const registerSchema = z.object({
  correo: z
    .string()
    .nonempty("Este campo es obligatorio")
    .email("Formato de correo no válido")
    .endsWith(
      "@alumno.ipn.mx",
      "El correo electrónico debe ser institucional"
    ),
});

export type RegisterForm = z.infer<typeof registerSchema>;
