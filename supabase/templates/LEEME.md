# Plantillas de correo

Correos de Seivin en español, con los colores de la marca. Supabase no las toma del
repositorio en el proyecto en línea: hay que pegarlas una vez en el panel.

En Supabase → Authentication → Emails → Templates:

| Plantilla en Supabase | Asunto | Archivo |
| --- | --- | --- |
| Confirm sign up | Confirma tu correo en Seivin | `confirmar.html` |
| Reset password | Crea una nueva contraseña para Seivin | `recuperar.html` |
| Change email address | Confirma tu nuevo correo en Seivin | `cambio-correo.html` |

En cada una: reemplaza el asunto, pega el contenido completo del archivo en el cuerpo y
guarda. La variable `{{ .ConfirmationURL }}` la completa Supabase con el enlace.
