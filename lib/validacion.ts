import { z } from "zod";

// Validación para correo institucional
export const correoEsquema = z.object({
  correo: z
    .string()
    .nonempty("Este campo es obligatorio")
    .email("El formato de correo es inválido")
    .endsWith(
      "@alumno.ipn.mx",
      "El correo electrónico debe ser institucional"
    ),
});

export type CorreoFormulario = z.infer<typeof correoEsquema>;

// Validación para boleta
export const boletaEsquema = z
  .string()
  .nonempty("Este campo es obligatorio")
  .refine((val) => /^\d+$/.test(val), {
      message: "La boleta solo debe contener dígitos",
    })
    .refine((val) => val.length === 10, {
      message: "La boleta debe contener exactamente 10 dígitos",
    });

// Validación para contraseña
export const contraseñaEsquema = z
  .string()
  .nonempty("Este campo es obligatorio")
  .min(8, "La contraseña debe tener al menos 8 caracteres");

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

export type RegistroFormulario = z.infer<typeof registroEsquema>;

// Esquema de validación para cambiar la contraseña
export const cambiarContraseñaEsquema = z
  .object({
    contraseña: contraseñaEsquema,
    confirmarContraseña: z.string().nonempty("Debes confirmar la contraseña"),
  })
  .refine((data) => data.contraseña === data.confirmarContraseña, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContraseña"],
  });

export type CambiarContraseñaFormulario = z.infer<typeof cambiarContraseñaEsquema>;

// Esquema para modificar datos del perfil
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
    .nonempty("El sexo es obligatorio")
    .refine((val) => ["Hombre", "Mujer"].includes(val), {
      message: "El sexo debe ser Hombre o Mujer",
    }),

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

//La contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.

// Esquema para alumnos
export const alumnoEsquema = z.object({
  nombre: z
    .string()
    .nonempty("El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),

  apellidoPaterno: z
    .string()
    .nonempty("El apellido paterno es obligatorio")
    .min(2, "Debe tener al menos 2 caracteres"),

  apellidoMaterno: z
    .string()
    .nonempty("El apellido materno es obligatorio")
    .min(2, "Debe tener al menos 2 caracteres"),

  boleta: boletaEsquema,

  curp: z
    .string()
    .nonempty("La CURP es obligatoria")
    .regex(
      /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/,
      "Formato de CURP inválido"
    ),

  rfc: z
    .string()
    .nonempty("El RFC es obligatorio")
    .min(12, "El RFC debe tener al menos 12 caracteres")
    .max(13, "El RFC no puede tener más de 13 caracteres")
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, "Formato de RFC inválido"),

  carrera: z
    .string()
    .nonempty("La carrera es obligatoria")
    .min(5, "Debe tener al menos 5 caracteres"),

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
    .endsWith("@alumno.ipn.mx", "Debe ser un correo institucional"),

  estatus: z
    .string()
    .nonempty("El estatus es obligatorio"),

  calleNumero: z
    .string()
    .nonempty("La calle y número son obligatorios"),

  colonia: z
    .string()
    .nonempty("La colonia es obligatoria"),

  delegacionMunicipio: z
    .string()
    .nonempty("La delegación o municipio es obligatorio"),

  estadoProcedencia: z
    .string()
    .nonempty("El estado de procedencia es obligatorio"),

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
    .nonempty("El sexo es obligatorio")
    .refine((val) => ["H", "M"].includes(val), {
      message: "El sexo debe ser H (Hombre) o M (Mujer)",
    }),

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

export type AlumnoFormulario = z.infer<typeof alumnoEsquema>;
