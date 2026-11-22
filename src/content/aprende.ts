/** Cápsulas cortas (2–3 minutos) y glosario. Tono: claro, sin culpa, con ejemplos en pesos. */
export type Capsule = {
  id: string
  title: string
  minutes: number
  topic: 'Organiza' | 'Construye' | 'Entiende'
  summary: string
  body: string[]
  tryIt: { label: string; to: string }
}

export const CAPSULES: Capsule[] = [
  {
    id: 'balance-mensual',
    title: 'Por qué un balance al mes basta',
    minutes: 2,
    topic: 'Organiza',
    summary: 'No necesitas anotar cada tinto. Mirar el mes completo ya muestra hacia dónde va tu plata.',
    body: [
      'Anotar cada compra cansa, y casi todo el mundo lo deja a las dos semanas. Un balance mensual pide menos: cuánto entró, cuánto salió y en qué grandes grupos.',
      'Lo valioso es la comparación. Si en octubre te quedaron $620.000 y en noviembre $675.000, ya sabes que algo mejoró. Y si bajó, puedes ver en qué categoría cambió.',
      'No tiene que ser exacto. Un valor aproximado que registras cada mes vale más que uno perfecto que nunca llega.',
    ],
    tryIt: { label: 'Hacer mi balance', to: '/app/organiza' },
  },
  {
    id: 'esenciales',
    title: 'Gastos esenciales: tu piso',
    minutes: 2,
    topic: 'Organiza',
    summary: 'Son los que necesitas para vivir aunque todo lo demás se detenga. Conocerlos te da calma.',
    body: [
      'Vivienda, comida, transporte, servicios, salud, educación y las cuotas de deudas son esenciales: si dejas de pagarlos, tu día a día se complica.',
      'Saber cuánto suman es la base para casi todo lo demás: cuánto necesitas de respaldo, cuánto puedes destinar a metas y qué tanto margen tienes.',
      'Como referencia, muchas guías sugieren que lo esencial no pase de la mitad de lo que entra. Es una guía, no una regla: en ciudades caras o con ingresos bajos es normal que sea más.',
    ],
    tryIt: { label: 'Revisar mis categorías', to: '/app/organiza/categorias' },
  },
  {
    id: 'pagate-primero',
    title: 'Págate primero',
    minutes: 2,
    topic: 'Construye',
    summary: 'Aparta para tus metas apenas te pagan, no con lo que sobre a fin de mes.',
    body: [
      'Si esperas a ver qué sobra, casi nunca sobra. Los gastos se acomodan a la plata disponible.',
      'La alternativa es decidir una cantidad y separarla el día del pago: en un bolsillo, en otra cuenta o en un CDT. Aunque sea poco, el hábito importa más que el monto.',
      'Empieza con algo que no te ahogue, por ejemplo el 5 % de lo que entra, y súbelo cuando veas que puedes.',
    ],
    tryIt: { label: 'Crear una meta', to: '/app/construye' },
  },
  {
    id: 'respaldo',
    title: 'El respaldo para imprevistos',
    minutes: 3,
    topic: 'Construye',
    summary: 'Una reserva de 3 a 6 meses de gastos esenciales para que un susto no se vuelva deuda.',
    body: [
      'Un daño en la moto, una consulta médica o un mes sin trabajo pasan. Sin reserva, la salida suele ser la tarjeta de crédito o un préstamo, y eso encarece el problema.',
      'La meta común es tener entre 3 y 6 meses de gastos esenciales. Si tu ingreso es variable o tienes personas a cargo, conviene apuntar más alto.',
      'Guárdalo donde lo puedas sacar rápido y sin perder valor, separado de la plata del día a día. Úsalo solo para imprevistos reales, y cuando lo uses, vuelve a llenarlo sin culparte: para eso existe.',
    ],
    tryIt: { label: 'Ver mi respaldo', to: '/app/construye/respaldo' },
  },
  {
    id: 'metas-smart',
    title: 'Metas que sí se cumplen',
    minutes: 2,
    topic: 'Construye',
    summary: 'Una meta con nombre, monto y fecha se convierte en un número mensual que puedes seguir.',
    body: [
      '"Ahorrar más" es un deseo. "Viaje a Cartagena, $2.400.000, para junio" es una meta: tiene nombre, monto y fecha.',
      'Con esos tres datos sale el número que importa: cuánto apartar al mes. Si ese número no cabe, puedes mover la fecha o el monto sin sentir que fallaste.',
      'Ponerle un porqué ayuda en los meses difíciles. Recordar para qué ahorras hace más fácil decir que no a un gasto.',
    ],
    tryIt: { label: 'Crear una meta', to: '/app/construye' },
  },
  {
    id: 'gastos-hormiga',
    title: 'Gastos hormiga sin culpa',
    minutes: 2,
    topic: 'Organiza',
    summary: 'Los pequeños gastos frecuentes suman. No se trata de eliminarlos, sino de elegirlos.',
    body: [
      'Un café de $6.000 cinco días a la semana son unos $130.000 al mes y más de $1.500.000 al año.',
      'No hay que dejar de disfrutar. La idea es saber cuánto suman para decidir si te dan lo que valen.',
      'El simulador de salidas te ayuda a ver ese efecto en tus planes con amigos y qué podrías lograr si cambias un poco.',
    ],
    tryIt: { label: 'Probar el simulador', to: '/app/organiza/salidas' },
  },
  {
    id: 'presupuesto',
    title: 'Un presupuesto que no aprieta',
    minutes: 2,
    topic: 'Organiza',
    summary: 'Pon topes solo en dos o tres categorías que se te salen de las manos.',
    body: [
      'Presupuestar todo a la vez agota. Empieza por las categorías variables que más cambian de un mes a otro, como salidas, compras o domicilios.',
      'Basa el tope en lo que realmente gastas, no en lo que quisieras. Si gastas $380.000 en salidas, un tope de $300.000 es un reto alcanzable; uno de $100.000 probablemente no.',
      'Si te pasas, no pasa nada: el dato te sirve para ajustar el tope o el hábito el próximo mes.',
    ],
    tryIt: { label: 'Poner un presupuesto', to: '/app/organiza/presupuestos' },
  },
  {
    id: 'interes-compuesto',
    title: 'El interés compuesto, en simple',
    minutes: 3,
    topic: 'Entiende',
    summary: 'Ganar intereses sobre los intereses hace que el tiempo trabaje a tu favor.',
    body: [
      'Si guardas $1.000.000 a una tasa del 10 % efectivo anual, al año tienes $1.100.000. Al segundo año ganas intereses también sobre esos $100.000: llegas a $1.210.000.',
      'Con los años la diferencia crece mucho. Por eso empezar pronto, aunque sea con poco, suele pesar más que el monto.',
      'Lo mismo pasa al revés con las deudas: los intereses sobre intereses hacen que una deuda sin pagar crezca rápido.',
    ],
    tryIt: { label: 'Ver mis estadísticas', to: '/app/entiende' },
  },
  {
    id: 'deudas',
    title: 'Deudas: cuál pagar primero',
    minutes: 3,
    topic: 'Construye',
    summary: 'Dos caminos válidos: la más cara primero (ahorras más) o la más pequeña primero (ganas impulso).',
    body: [
      'Paga siempre el mínimo de todas para no generar intereses de mora. Lo que te sobre, ponlo en una sola deuda a la vez.',
      'Método avalancha: primero la de mayor tasa de interés. Es el que menos plata te cuesta en total.',
      'Método bola de nieve: primero la de menor saldo. Cerrar deudas rápido motiva, y la motivación también cuenta. Elige el que puedas sostener.',
    ],
    tryIt: { label: 'Revisar mis gastos', to: '/app/organiza' },
  },
  {
    id: 'ingreso-variable',
    title: 'Si tu ingreso cambia cada mes',
    minutes: 2,
    topic: 'Organiza',
    summary: 'Planea con tu mes flojo, no con el bueno, y usa los meses buenos para tu respaldo.',
    body: [
      'Si eres independiente o vendes por tu cuenta, mira tus ingresos de los últimos meses y toma como base el más bajo.',
      'Cubre tus esenciales con esa base. Lo que entre por encima va primero al respaldo y luego a tus metas.',
      'Con ingresos variables, un respaldo de 6 meses o más da mucha tranquilidad para los meses flojos.',
    ],
    tryIt: { label: 'Ver mi respaldo', to: '/app/construye/respaldo' },
  },
]

export const GLOSSARY: { term: string; meaning: string }[] = [
  { term: 'Balance mensual', meaning: 'Resumen de un mes: lo que entró, lo que salió y lo que quedó.' },
  { term: 'Gasto esencial', meaning: 'Gasto necesario para vivir: vivienda, comida, transporte, servicios, salud, educación y deudas.' },
  { term: 'Gasto fijo', meaning: 'Se repite con el mismo valor cada mes, como el arriendo o el plan del celular.' },
  { term: 'Gasto variable', meaning: 'Se repite pero su valor cambia, como el mercado o las salidas.' },
  { term: 'Gasto ocasional', meaning: 'Aparece de vez en cuando, como ropa, regalos o un arreglo.' },
  { term: 'Respaldo para imprevistos', meaning: 'Reserva de dinero para emergencias. También se le llama fondo de emergencia.' },
  { term: 'Meta de ahorro', meaning: 'Objetivo con nombre, monto y, si quieres, fecha.' },
  { term: 'Presupuesto', meaning: 'Tope que te pones para una categoría en un mes.' },
  { term: 'Tasa de interés', meaning: 'Porcentaje que se gana al ahorrar o se paga al deber, en un período.' },
  { term: 'Efectivo anual (E.A.)', meaning: 'Tasa que muestra cuánto se gana o se paga en un año completo, ya con los intereses sobre intereses.' },
  { term: 'Interés compuesto', meaning: 'Ganar (o pagar) intereses sobre intereses acumulados.' },
  { term: 'CDT', meaning: 'Certificado de Depósito a Término: dejas un dinero quieto por un plazo a cambio de un interés.' },
  { term: 'Inflación', meaning: 'Subida general de precios. Hace que el mismo dinero alcance para menos con el tiempo.' },
  { term: 'Liquidez', meaning: 'Qué tan rápido puedes convertir algo en dinero disponible sin perder valor.' },
  { term: 'Gastos hormiga', meaning: 'Gastos pequeños y frecuentes que, sumados, pesan en el mes.' },
  { term: 'Ingreso variable', meaning: 'Ingreso que cambia de un mes a otro, común en independientes y comerciantes.' },
]
