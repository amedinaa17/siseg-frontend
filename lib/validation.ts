import { z } from "zod";

// Validación para correo institucional
export const emailSchema = z.object({
  correo: z
    .string()
    .nonempty("Este campo es obligatorio")
    .email("El formato de correo es inválido")
    .endsWith(
      "@alumno.ipn.mx",
      "El correo electrónico debe ser institucional"
    ),
});

export type EmailForm = z.infer<typeof emailSchema>;

// Validación para boleta
export const boletaSchema = z
  .string()
  .nonempty("Este campo es obligatorio")
  .refine((val) => /^\d+$/.test(val), {
      message: "La boleta solo debe contener dígitos",
    })
    .refine((val) => val.length === 10, {
      message: "La boleta debe contener exactamente 10 dígitos",
    });

// Validación para contraseña
export const passwordSchema = z
  .string()
  .nonempty("Este campo es obligatorio")
  .min(8, "La contraseña debe tener al menos 8 caracteres");

// Esquema para inicio de sesión
export const authSchema = z.object({
  boleta: boletaSchema,
  password: passwordSchema,
});

export type AuthForm = z.infer<typeof authSchema>;

// Esquema para registro 
export const registroSchema = z.object({
  rfc: z
    .string()
    .nonempty("El RFC es obligatorio")
    .min(12, "El RFC debe tener al menos 12 caracteres")
    .max(13, "El RFC no puede tener más de 13 caracteres")
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, "Formato de RFC inválido"),

  calle: z
    .string()
    .nonempty("Este campo es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres"),

  colonia: z
    .string()
    .nonempty("Este campo es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres"),

  municipio: z
    .string()
    .nonempty("Este campo es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres"),

  estado: z
    .string()
    .nonempty("Este campo es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres"),

  codigoPostal: z
    .string()
    .nonempty("El código postal es obligatorio")
    .refine((val) => /^\d+$/.test(val), {
      message: "El código postal solo debe contener dígitos",
    })
    .refine((val) => val.length === 5, {
      message: "El código postal debe contener exactamente 5 dígitos",
    }),

  sexo: z
    .string()
    .nonempty("Este campo es obligatorio"),

  telefonoCelular: z
    .string()
    .nonempty("El teléfono celular es obligatorio")
    .refine((val) => /^\d+$/.test(val), {
      message: "El número de celular solo debe contener dígitos",
    })
    .refine((val) => val.length === 10, {
      message: "El número de celular debe contener exactamente 10 dígitos",
    }),

  telefonoLocal: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "El número local solo debe contener dígitos",
    })
    .refine((val) => !val || val.length === 10, {
      message: "El número local debe contener exactamente 10 dígitos",
    }),
});

export type RegistroForm = z.infer<typeof registroSchema>;

// Esquema de validación para cambiar la contraseña
export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().nonempty("Debes confirmar la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Tipo inferido para el formulario de cambio de contraseña
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;