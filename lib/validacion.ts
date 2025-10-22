import { z } from "zod";

// Validación para correo institucional
export const correoEsquema = z.object({
  correo: z
    .string()
    .nonempty("El correo electrónico institucional es obligatorio")
    .endsWith(
      "@alumno.ipn.mx",
      "El correo electrónico debe ser institucional (@alumno.ipn.mx)"
    ),
});

export type CorreoFormulario = z.infer<typeof correoEsquema>;

// Validación para boleta
export const boletaEsquema = z
  .string()
  .nonempty("El número de boleta es obligatorio")
  .refine((val) => /^\d+$/.test(val), {
    message: "El número de boleta solo debe contener dígitos",
  })
  .refine((val) => val.length === 10, {
    message: "El número de boleta debe contener exactamente 10 dígitos",
  });

// Validación para contraseña
export const contraseñaEsquema = z
  .string()
  .nonempty("Este campo es obligatorio")

// Esquema para inicio de sesión
export const iniciarSesionEsquema = z.object({
  boleta: boletaEsquema,
  contraseña: contraseñaEsquema,
});

export type IniciarSesionFormulario = z.infer<typeof iniciarSesionEsquema>;

// Esquema para registro 
export const registroEsquema = z.object({
  rfc: z
    .string()
    .nonempty("El RFC es obligatorio")
    .min(12, "El RFC debe tener al menos 12 caracteres")
    .max(13, "El RFC no puede tener más de 13 caracteres")
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, "Formato de RFC inválido"),

  calle: z
    .string()
    .nonempty("La calle es obligatoria")
    .min(3, "Debe tener al menos 3 caracteres"),

  colonia: z
    .string()
    .nonempty("La colonia es obligatoria")
    .min(3, "Debe tener al menos 3 caracteres"),

  municipio: z
    .string()
    .nonempty("El municipio es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres"),

  estado: z
    .string()
    .nonempty("El estado es obligatorio")
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
    .nonempty("El sexo es obligatorio"),

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

export type RegistroFormulario = z.infer<typeof registroEsquema>;

// Esquema de validación para cambiar la contraseña
export const cambiarContraseñaEsquema = z
  .object({
    contraseña: contraseñaEsquema
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[a-z]/, "La contraseña debe tener al menos una letra minúscula")
      .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula")
      .regex(/\d/, "La contraseña debe tener al menos un número"),
    confirmarContraseña: z.string().nonempty("Debes confirmar la contraseña"),
  })
  .refine((data) => data.contraseña === data.confirmarContraseña, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContraseña"],
  });

export type CambiarContraseñaFormulario = z.infer<typeof cambiarContraseñaEsquema>;

// Esquema para modificar datos del perfil de alumno
export const modificarPerfilEsquema = z.object({
  calle: z
    .string()
    .nonempty("La calle es obligatoria")
    .min(3, "Debe tener al menos 3 caracteres"),

  colonia: z
    .string()
    .nonempty("La colonia es obligatoria")
    .min(3, "Debe tener al menos 3 caracteres"),

  municipio: z
    .string()
    .nonempty("El municipio es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres"),

  estado: z
    .string()
    .nonempty("El estado es obligatorio")
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
    .nonempty("El sexo es obligatorio"),

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
    .refine((val) => !val || (val.length >= 7 && val.length <= 10), {
      message: "El número local debe tener entre 7 y 10 dígitos",
    }),
});

export type ModificarPerfilFormulario = z.infer<typeof modificarPerfilEsquema>;

// Esquema para modificar datos del perfil de personal administrativo
export const modificarPerfilAdminEsquema = z.object({
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
    .refine((val) => !val || (val.length >= 7 && val.length <= 10), {
      message: "El número local debe tener entre 7 y 10 dígitos",
    }),
});

export type ModificarPerfilAdminFormulario = z.infer<typeof modificarPerfilAdminEsquema>;

// Esquema para alumnos
export const alumnoEsquema = z.object({
  nombre: z
    .string()
    .nonempty("El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .refine((val) => /^\D*$/.test(val), {
      message: "El nombre no puede contener dígitos",
    }),

  apellido_paterno: z
    .string()
    .nonempty("El apellido paterno es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres")
    .refine((val) => /^\D*$/.test(val), {
      message: "El apellido paterno no puede contener dígitos",
    }),

  apellido_materno: z
    .string()
    .nonempty("El apellido materno es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres")
    .refine((val) => /^\D*$/.test(val), {
      message: "El apellido materno no puede contener dígitos",
    }),

  boleta: boletaEsquema,

  curp: z
    .string()
    .nonempty("La CURP es obligatoria")
    .regex(
      /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/,
      "Formato de CURP inválido"
    ),

  carrera: z
    .string()
    .nonempty("La carrera es obligatoria"),

  generacion: z
    .string()
    .nonempty("La generación es obligatoria"),

  promedio: z
    .string()
    .nonempty("El promedio es obligatorio")
    .refine((val) => !isNaN(Number(val)), {
      message: "El promedio debe ser un número",
    })
    .refine((val) => Number(val) >= 0 && Number(val) <= 10, {
      message: "El promedio debe estar entre 0 y 10",
    }),

  correo: z
    .string()
    .nonempty("El correo es obligatorio")
    .email("Formato de correo inválido")
    .endsWith("@alumno.ipn.mx", "Debe ser un correo institucional (@alumno.ipn.mx)"),

  estatus: z
    .string()
    .nonempty("El estatus es obligatorio"),
});

export type AlumnoFormulario = z.infer<typeof alumnoEsquema>;

// Esquema para alumnos
export const personalEsquema = z.object({
  nombre: z
    .string()
    .nonempty("El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .refine((val) => /^\D*$/.test(val), {
      message: "El nombre no puede contener dígitos",
    }),

  apellido_paterno: z
    .string()
    .nonempty("El apellido paterno es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres")
    .refine((val) => /^\D*$/.test(val), {
      message: "El apellido paterno no puede contener dígitos",
    }),

  apellido_materno: z
    .string()
    .nonempty("El apellido materno es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres")
    .refine((val) => /^\D*$/.test(val), {
      message: "El apellido materno no puede contener dígitos",
    }),

  numempleado: z.string()
    .nonempty("El número de empleado es obligatorio")
    .refine((val) => /^\d+$/.test(val), {
      message: "El número de empleado solo debe contener dígitos",
    })
    .refine((val) => val.length === 10, {
      message: "El número de empleado debe contener exactamente 10 dígitos",
    }),

  curp: z
    .string()
    .nonempty("La CURP es obligatoria")
    .regex(
      /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/,
      "Formato de CURP inválido"
    ),

  sexo: z
    .string()
    .nonempty("El sexo es obligatorio"),

  estatus: z
    .string()
    .nonempty("El estatus es obligatorio"),

  perfil: z
    .string()
    .nonempty("El perfil es obligatorio"),

  correo: z
    .string()
    .nonempty("El correo es obligatorio")
    .email("Formato de correo inválido")
    .endsWith("@alumno.ipn.mx", "Debe ser un correo institucional (@alumno.ipn.mx)"),

  telcelular: z
    .string()
    .nonempty("El teléfono celular es obligatorio")
    .refine((val) => /^\d+$/.test(val), {
      message: "El número de celular solo debe contener dígitos",
    })
    .refine((val) => val.length === 10, {
      message: "El número de celular debe contener exactamente 10 dígitos",
    }),

  tellocal: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "El número local solo debe contener dígitos",
    })
    .refine((val) => !val || (val.length >= 7 && val.length <= 10), {
      message: "El número local debe tener entre 7 y 10 dígitos",
    }),
});

export type PersonalFormulario = z.infer<typeof personalEsquema>;

// Esquema para reportes
export const reporteEsquema = z.object({
  descripcion: z.string().min(1, "La descripción no puede estar vacía."),
  evidencias: z
    .array(z.object({
      nombre: z.string(),
      peso: z.string(),
      tipo: z.enum(["image", "audio", "pdf"]),
    }))
    .max(5, "No puedes agregar más de 5 evidencias."),
});

export type ReporteFormulario = z.infer<typeof reporteEsquema>;