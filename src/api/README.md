# Configuración de API

## URL Base
La URL base de la API está configurada en `config.ts`. Por defecto está configurada como:
```
http://137.184.191.81
```

Si necesitas cambiar la URL, edita el archivo `src/api/config.ts` y modifica la constante `API_BASE_URL`.

## Endpoints de Empleados

### GET /users
Obtiene todos los empleados.

### POST /users
Crea un nuevo empleado. El cuerpo de la petición debe incluir:
- `nombre`: string (obligatorio)
- `segundoNombre`: string (opcional)
- `apellidoPaterno`: string (obligatorio)
- `apellidoMaterno`: string (opcional)
- `correo`: string (obligatorio) - debe ser un email válido
- `contraseña`: string (obligatorio)

### PATCH /users/{id}
Actualiza un empleado existente. Todos los campos son opcionales.

### DELETE /users/{id}
Elimina un empleado.

## Uso

```typescript
import { employeesAPI } from './api/employees';

// Obtener todos los empleados
const employees = await employeesAPI.getAll();

// Crear un nuevo empleado
const newEmployee = await employeesAPI.create(formData);

// Actualizar un empleado
const updated = await employeesAPI.update(id, updateData);

// Eliminar un empleado
await employeesAPI.delete(id);
```

## Manejo de Errores

Los errores se manejan automáticamente y se muestran mensajes al usuario. Si hay un error de conexión, se usan datos mock como fallback.

