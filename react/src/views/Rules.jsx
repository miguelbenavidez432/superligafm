/* eslint-disable react/no-unknown-property */

export default function Rules() {
    return (
        <>
            <form >
                <h1>REGLAMENTO TEMPORADA 51</h1>

                <p className="whitespace-normal">


                    Se dividirán los equipos en 2 categorías.
                    <strong>Primera División </strong>formada por 14 equipos y
                    <strong>Segunda División </strong>formada por 14 equipos.
                    Estos serán dados por la organización teniendo como parámetro el CA del equipo.<br />
                    Elección de equipos:
                    - La selección de equipos para los usuarios será aleatoria en la primera temporada y cada vez que se reinicie la partida.
                    Finalizada cada una de las temporadas los usuarios podrán mantener su equipo o elegir otro equipo de Primera División
                    (los que jueguen en esa categoría) o Segunda (los que jueguen esa división) según el orden de ubicación luego de finalizar la temporada.
                    Aquellos usuarios que descendieron no podrán elegir el mismo equipo con el que perdieron la categoría.
                    Si por algún motivo un usuario no se presenta a disputar dos partidos en la temporada (no coordinación y/o no presentación)
                    perderán el derecho de mantener el equipo en caso de superar objetivos.
                    En caso de pedir más de 4 postergaciones también perderá el derecho de mantener equipo
                    (se analizará cada caso de postergación en forma particular).<br />
                    -Antes de comenzar la elección, aquellos usuarios que lograron ganar alguna de las competiciones que disputaron,
                    tendrán la posibilidad de elegir permanecer en el equipo que lo hicieron, como así también los equipos que ascendieron
                    (siempre y cuando cumplan con la condición del punto anterior de elección de equipos) .
                    En caso de que no quieran permanecer, elegirán según el orden que les corresponda por ubicación en tabla.
                    Los manager de los equipos que superaron el objetivo de la temporada impuesto por la organización
                    tendrán la posibilidad de permanecer en el equipo (La permanencia en el equipo debe ser confirmada).<br />
                    -Para mantener el equipo, los managers de los descendidos de la temporada anterior deberán mínimamente
                    terminar entre los 6 mejores de la temporada en su nueva división.
                    -Los jugadores que abandonen cada equipo de la liga volverán al club que estuvieron en la última temporada.
                    Es decir, si avanzando la partida Manchester Utd vende a Cristiano Ronaldo (por efecto de la simulación de la partida),
                    se lo volverá a colocar en el equipo inglés. Después de finalizado el mercado de pases y antes de iniciar la temporada
                    los manager de Primera División deberán presentar una lista de 18 jugadores.
                    Los jugadores que no estén en esa lista y sean mayores de 20 años quedarán libres para la próxima temporada o
                    en el equipo de reserva sin jugar según decida cada usuario.<br />
                    <br />
                    <h1>FORMATO DE LA LIGA</h1><br /><br />
                    Primera División<br /><br />
                    Se jugará con el sistema todos contra todos, una sola rueda y en cancha neutral, contabilizando 13 partidos por equipo.
                    Si el equipo que finaliza en la primera posición tiene 5 o menos puntos de ventaja sobre el segundo,
                    los equipos que finalicen en las posiciones 8 y 9 se enfrentarán en el Play-in para acceder a los playoffs.
                    Será a partido único con ventaja en caso de empate para el mejor ubicado (8° posición).
                    Al finalizar la temporada, si el equipo que finaliza en la primera posición tiene 6 o más puntos de ventaja
                    sobre el segundo clasificará de manera directa a semifinales, accediendo los equipos que finalicen en las posiciones 7 y 8
                    al play-in para clasificar a los playoffs.<br /><br />
                    Play-in: -Será a partido único con ventaja en caso de empate para el mejor ubicado (7° posición).<br />
                    Los cruces de Cuartos de Final se realizan mediante elección directa del manager, eligiendo en primer lugar quien se ubique
                    1° en la tabla, pudiendo elegir cualquier rival de los puestos 5º - 8º, y así sucesivamente en la tabla;
                    es decir, los posicionados 1º-4º, pueden elegir a sus rivales en posiciones 5º-8º.<br />
                    El que sea mejor ubicado en la tabla del cruce tendrá ventaja deportiva, clasificando a la siguiente ronda
                    en caso de empate al final de los 90 minutos.<br />
                    En semifinales el mejor ubicado en la tabla de posiciones se enfrentará al peor ubicado en esa tabla de los clasificados a semifinales.
                    En esta instancia y en la final por el título los partidos serán con prórroga y penales en caso de empate.
                    Todos los partidos de las fases eliminatorias se realizan en cancha neutral.<br />
                    El último equipo en la tabla de posiciones descenderá directamente. En caso de haber dos o más equipos en la última posición,
                    se definirá la ubicación en encuentros de desempate. De persistir la igualdad, se tendrán en cuenta los partidos disputados entre sí para definir.
                    Los equipos que se encuentren entre las posiciones 10 y 13 jugarán un playout para definir el último descendido.
                    Los enfrentamientos serán: 10° vs 13° y 12° vs 11°. Los partidos serán en cancha neutral con prórroga y penales.
                    Los perdedores de los cruces se enfrentarán entre sí, en cancha neutral con prórroga y penales.
                    El ganador jugará una promoción contra un equipo de Segunda División y el perdedor descenderá.<br />
                    <br /><br />
                    <h3>Las posiciones finales de Primera División se definirán de la siguiente manera:</h3><br /><br />

                    1° Campeón<br />
                    2° Subcampeón<br />
                    3° Perdedor de las semifinales que más puntos haya sumado en la tabla de posiciones<br />
                    4° El equipo restante de los semifinalistas<br />
                    5° al 8° los equipos que queden eliminados en primera ronda serán ubicados según la tabla de posiciones<br />
                    9°  Perdedor Play-in o 9º<br />
                    10° y 11° Ganador de los playout ubicados según tabla de posiciones<br />
                    12° Equipo que juega la Promoción<br />
                    13° Perdedor del play out<br />
                    14° Equipo en descenso directo.<br />
                    <br />
                    <br />
                    <br />
                    Segunda División<br /><br />
                    Serán 14 equipos, que jugarán todos contra todos en un mismo grupo, jugando cada equipo 13 fechas. El equipo que acabe en 1era posición será campeón y ascenderá directamente a la Primera División. Los equipos que se coloquen del 2° al 9° lugar accederán a los playoffs, mientras que quienes queden del 10° al 14° lugar quedarán eliminados de la temporada. -Los cuartos de final tendrán ventaja deportiva para los equipos ubicados de la 2° a la 5° posición.<br />
                    -Los cruces serán 2° vs 9°, 3° vs 8°, 4° vs 7° y 5° vs 6°.<br />
                    -Las semifinales se disputarán a partido único, con prórroga y penales en caso de empate, los ganadores clasificarán a la final por el Segundo Ascenso, que también se disputará con el mismo formato. El ganador ascenderá a la Primera División, mientras que el perdedor jugará Promoción contra un equipo de Primera División.<br />
                    Las posiciones finales serán determinadas de la siguiente manera:<br />
                    1° Campeón<br />
                    2° Segundo ascendido<br />
                    3° Equipo que juega la Promoción<br />
                    4° Equipo perdedor el encuentro definitorio que determinará el clasificado a la promoción<br />
                    5° al 14° determinado por tabla.<br />
                    <br /><br />
                    Promoción: La jugarán el equipo de Primera División ganador en la última ronda del play out y el perdedor de la final por el segundo ascenso de la Segunda División. Será un solo partido. En caso de empate, el equipo de Primera conservará su lugar en la división.<br />
                    <br />
                    <br />
                    Copa FM<br /><br />
                    La jugarán todos los equipos participantes.<br />
                    <br />
                    Habrá una primera ronda de eliminación entre 24 equipos sorteados al azar. Los 12 ganadores de los duelos se unirán a los restantes 4 equipos divididos en 8 llaves. Los duelos serán a partido único con penales y alargue. Los ganadores pasarán a Cuartos de final. Las llaves siguientes se determinarán por sorteo realizado en el save utilizado para cada temporada.<br />
                    <br />
                    El formato de todas las rondas (incluida la final) será a partido único, en cancha neutral con alargue y penales en caso de igualar en los 90 reglamentarios.<br />
                    <br />
                    En caso de desconexión en el partido se procederá a completar los minutos restantes. Sí terminados esos minutos continúa la igualdad y el tiempo restante para finalizar el encuentro reanudado es mayor a 30 minutos, se jugarán 30 minutos más de ese partido (a modo de alargue) para definir el ganador. De persistir la igualdad, se jugará un nuevo partido desempate con alargues y penales o se completará el partido si en este último el resultado es un empate.<br />
                    <br />
                    <br />
                    Champions League y Europa League<br /><br />
                    Champions League:<br />
                    La jugarán 16 equipos, que serán:<br />
                    -Campeón de Copa FM de la temporada anterior<br />
                    -Campéon defensor de Champions League<br />
                    -Campeón de Europa League de la temporada anterior<br />
                    -Los 14 equipos de Primera División de la presente temporada (en caso de exceso de postulantes, perderá su lugar el ascendido por última instancia a Primera division).<br />
                    -En caso de que se repita alguno de los equipos clasificados el cupo pasará a los equipos de Segunda División, siendo el orden de prioridad: Subcampeón de 2da - equipo que juega promoción - Orden por tabla.<br />
                    Los equipos se repartirán en 4 grupos de 4 equipos, donde cada uno jugará 3 partidos. Accederán a la segunda fase los 2 primeros de cada grupo. A partir de allí se juega a eliminación directa, a partido único con prórroga y penales en caso de empate.<br />
                    Europa League: La clasificación se realizará tomando en cuenta la última temporada jugada. La jugarán los 12 equipos que no clasifiquen a la CL + los terceros de los grupos de UCL de la presente temporada. Será a formato de eliminación directa, a partido único con prórroga y penales en caso de empate.<br />
                    <br />
                    Supercopa FM<br />
                    Se jugará Semifinales y Final entre:<br />
                    -Campeón Primera División<br />
                    -Campeón Copa FM<br />
                    -Campeón Champions League<br />
                    -Campeón Europa League<br />
                    <br />
                    <br />
                    Lista de buena fe<br />
                    <br />Todos los managers deberán tener en sus equipos un máximo de 18 jugadores + 1 Arquero suplente (posibilidad de tener 19 mayores con este) + 5 juveniles (sub– 20) que utilizarán en todos los torneos.
                    <br />Los jugadores que no estén en el primer equipo quedarán inhabilitados durante la simulación de la partida y no podrán ser utilizados en la temporada.<br />
                    En caso de que un manager no pudiese cumplir con la obligación de colocar un arquero entre los sustitutos podrá agregar uno del equipo juvenil sin necesidad de que el mismo esté incluído en la lista de buena fe.<br />
                    Es decir que la lista estará conformada por 24 jugadores de los cuales, mínimamente 5 deberán ser sub 20 (20 años o menos al momento de la partida).<br />
                    En caso de no completar los 6 lugares, estos quedarán libres.<br />
                    Los equipos de Primera División deben tener como promedio máximo de los mejores 16 CA de 160 puntos al cierre del mercado de pases (estén o no incluídos en la lista de buena fe). los equipos de Segunda División deben tener como promedio máximo de los mejores 16 CA de 153 puntos al cierre del mercado de pases (estén o incluídos en la lista de buena fe).<br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    Modo de disputa y plazos<br />
                    -Cada fecha tiene un plazo máximo para disputarse el cual está informado en el calendario anclado en los canales de Discord del servidor, estos pueden ser modificados por la organización a medida que avanza la temporada.<br />
                    -Se podrán adelantar fechas siempre y cuando los dos usuarios hayan completado todos sus partidos previos y el save esté disponible.<br />
                    -Cada usuario debe contactarse con su próximo rival para ponerlo en conocimiento de que ya está disponible para jugar el encuentro. Esto debe ser antes de las últimas 36 horas de plazo para jugar el encuentro. Si esto no se hizo por parte de ninguno de los involucrados, no habrá derecho a reclamar el partido por ganado o pedir postergación.<br />
                    -Si terminado el plazo no se disputó el partido, el resultado del mismo se definirá de la siguiente manera:<br />
                    <br />
                    1 - Si hubo intención de jugarlo, pero no se llegaron a poner de acuerdo en el momento de jugarlo, el resultado será empate y una advertencia para los usuarios.<br />
                    <br />
                    2 - Quedando menos de 24 horas, si uno de los dos usuarios no se presentó para jugar o no contestó a su rival, se le dará el partido por perdido 0-3 y recibirá una amonestación. Esto implica que, si hubo un día y horario pactado para jugar y uno de los dos usuarios no se presentó o bien se respondió/envió un mensaje sin informar horarios disponibles, ese participante tendrá el partido perdido.<br />
                    <br />
                    En caso de que el encuentro se haya programado para un horario y por algún inconveniente, uno de los usuarios no pudo presentarse y quedan, al menos, 18 horas para el vencimiento del plazo, se extenderá ese vencimiento el cuál no será mayor a 24 hs. En caso de no ser posible establecer un horario para jugar (incluyendo el tiempo de aplazo), la organización determinará cuál es el resultado final del partido.<br />
                    <br />
                    3 - Si ninguno de los usuarios mostró intenciones de jugarlo el resultado será 0-0 (Sin suma de puntos) para los equipos y ambos recibirán una amonestación.<br />
                    <br />
                    Para mostrar intención de jugar, cada usuario deberá dar aviso de su disponibilidad en Discord que se usará para tal fin (mensaje directo o privado) a los organizadores como así también a su rival. No se tomarán como intento de coordinación mensajes donde no se haya especificado un día y horario para jugar el partido.<br />
                    <br />
                    Partidos<br />
                    Los partidos se disputarán en el FM 24 utilizando las partidas que la organización entregará previo al inicio de la temporada . Cada usuario que sea local en el calendario determinado por la partida (teniendo en cuenta la primera ronda únicamente) se encargará de descargar la partida, cargarla para que se dispute el encuentro y subir las capturas necesarias. El partido se disputará con velocidad media o más y modo extendido o mayor (Exhaustivo o completo) dependiendo de lo que acuerden los rivales. La reducción de la velocidad durante el partido sin previo aviso, puede ser motivo de sanción. Para cada encuentro, los manager tendrán cómo máximo un plazo de una hora de extradición para presentarse a jugar en el horario pactado previamente.<br />
                    Las partidas cargadas y que el rival esté más de 30 minutos sin aparecer, es decir afk, con pruebas de tiempo, pueden ser  sacionadas por los organizadores, y la sanción puede llegar al extremo de dar como partido perdido al manager que “deje esperando al otro”<br />
                    -En caso de sufrir desconexión durante el encuentro se procederá de la siguiente manera: 1- Se completarán los minutos restantes con 4 más de adición y hasta que la jugada de ese último minuto se corte (tiene que aparecer la lista de jugadores para que termine), con los cambios realizados (también es posible que se realicen cambios antes de reanudar mientras esté dentro del límite de los 5 permitidos).<br />
                    2- Si hubo alguna expulsión, un arquero ocupará la posición de ese jugador salvo que el expulsado sea el portero. En tal caso un jugador de campo ocupa ese lugar.<br />
                    3- Se deberá agregar obligatoriamente un arquero suplente a la reanudación (el mismo debe ser sub-20, puede NO estar inscripto en la lista de buena fe o ser un jugador gris -jugador no real-.)<br />
                    4- En caso de que un jugador amonestado en el primer encuentro vuelva a recibir otra tarjeta amarilla este deberá ser sustituido inmediatamente por el arquero suplente.<br />
                    5- Si algún jugador se lesiona y ya se realizaron los 5 cambios, este deberá ser reemplazado por el arquero suplente o un jugador no competente en esa posición.<br />
                    6- Si terminados los minutos restantes continúa la igualdad en un encuentro de carácter eliminatorio y el tiempo restante para finalizar el encuentro reanudado (segundo partido) es mayor a 30 minutos, se jugarán 30 minutos más de ese partido (a modo de alargue) para definir el ganador. De persistir la igualdad, se jugará un nuevo partido desempate con alargues y penales o se completará el partido si en este último el resultado es un empate.<br />
                    7- Es obligatorio tomar screens con la lista de valoraciones de los 2 equipos.<br />
                    8- En el caso de que el usuario que se desconecta del servidor sea el host y no se haya podido sacar los screen necesarios que muestren el resultado del partido y los cambios realizados, se procederá de la siguiente manera:<br />
                    A- Si ambos usuarios están de acuerdo tanto en el resultado como en los cambios realizados y las estadísticas de los jugadores (Goles, asistencias, tarjetas y lesiones en el caso de que las hubiese) se procederá a continuar el partido dejando en claro cuáles fueron las incidencias el primer encuentro junto con los pantallazos de los minutos restantes, es decir del segundo partido. De todas maneras ambos usuarios pueden recibir sanción por este inconveniente.<br />
                    B- Si no hay acuerdo, se procederá a jugar nuevamente el partido por completo. En este caso, la organización podrá sancionar al usuario que durante el encuentro este en desventaja o quien sea host dependiendo del caso.<br />
                    <br />
                    Al finalizar el partido se mandarán screen donde se pueda ver el resultado, los goleadores (en caso de haberlos), los jugadores amonestados, expulsados o lesionados, valoraciones del partido de los jugadores, las formaciones para verificar que no se seleccione ningún jugador de forma indebida y realice más cambios de los permitidos. Si esto último sucede el usuario que incurrió en esta falta perderá el partido 0-3. El usuario que está obligado a enviar los screen es aquel que sea el host en el partido, pero en caso de estar de acuerdo ambos usuarios podrá enviarlo cualquiera de los dos.<br />
                    Además deberán subir el .pkm (guardar el partido) de dicho partido de modo obligatorio, de no hacerlo habrá sanciones.<br />
                    <br />
                    El encargado de cargar la partida deberá registrar las estadísticas del partido en el excel compartido por la organización. El adversario deberá corroborar que las mismas sean correctas y confirmarlo en el canal de discord. En caso de haber una adulteración en los datos de manera maliciosa, se procederá a dar el partido por perdido y posible descuento de puntos.<br />
                    El registro de los datos en el excel se deberá hacer dentro de las 2 horas posteriores al partido. En caso de no cumplir, primero podrá haber un aviso si un encargado lo notifica dentro de las 2hs posteriores al partido, luego de 12hs sin previo aviso, se le impondrá una multa, que será acumulativa con el paso de tiempo por el cual el partido no sea cargado<br />
                    Sanciones por demora:<br />
                    1- 24 horas: sanción económica<br />
                    2- 36 hrs: sanción económica x2 acumulativa<br />
                    3- 48 hrs: sanción economica x4 acumulativa<br />
                    4- Pasadas 12hs de vencida la fecha: se acumulan las sanciones económicas anteriores + si ganó/empató el partido se le da por pérdido 0-3, y si perdió procede a una quita de 3 puntos.<br />
                    <br />
                    Las solicitudes para escritorio, es decir, pedir los puntos del partido disputado por cualquier razón, tienen un plazo de 6hs desde que se publican las screens correspondientes en el canal. Luego la réplica del mismo, es decir el rival que pierde el partido y quiere justificarse, también tiene un plazo de 6hs extras para hacerlo.<br />
                    Se les recuerda que si el ganador del partido pide escritorio, y el resultado del mismo tuviera una diferencia de 3 o más goles, el pedido será inválido -sea el motivo que sea-.<br />
                    <br />
                    <br />
                    Al finalizar la temporada se tendrá en cuenta la cantidad de desconexiones que tengan los usuarios y en caso de ser considerables, se podrá decidir quitarle el lugar al manager.<br />
                    -Si el ganador del partido pide escritorio, y el resultado del mismo tiene una diferencia de 3 o más goles, el pedido será inválido -sea el motivo que sea-<br />
                    -La organización podrá actuar de oficio en caso de detección de amaño de partidos entre participantes en los cuales afecten directamente/indirectamente a otro manager.<br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    Suspensiones de jugadores<br />
                    1 - Recibirán un partido de sanción los jugadores expulsados durante el partido por acumulación de amarillas. Recibirán 2 partidos de suspensión si reciben roja directa.<br />
                    <br />
                    2 - Recibirán un partido de suspensión los jugadores que acumulen 3 tarjetas amarillas, dos fechas los que acumulen 6 tarjetas amarillas y 3 fechas los que tengan 9 tarjetas amarillas. En Copa FM, Champions League y Europa League recibirán una fecha de suspensión los jugadores que tengan 2 tarjetas amarillas acumuladas.<br />
                    <br />
                    3 - En ambos torneos las tarjetas amarillas se “limpiarán” para los partidos de semifinales en todas las competiciones (las sanciones se deberán cumplir).<br />
                    <br />
                    4 - No podrán ser elegidos para el encuentro siguiente los jugadores que al finalizar el encuentro tengan una “lesión en naranja”.<br />
                    <br />
                    5 - No podrán ser elegidos para los siguientes 2 partidos los jugadores que al finalizar el partido tengan una “lesión en rojo”.<br />
                    <br />
                    6 - Los jugadores que sean suspendidos en los últimos partidos y su sanción quede pendiente, esta se deberá cumplir al inicio de la próxima temporada. Es responsabilidad de la organización avisar (excel de sanciones) que un jugador cuenta con una sanción de la temporada anterior.<br />
                    <br />
                    7 - En caso de que el resultado del encuentro sea determinado por la organización (mala inclusión de un jugador y/o táctica o no presentación de alguno de los managers) se procederá de la siguiente manera:<br />
                    <br />
                    Los goles serán para el capitán del equipo ganador. Si el partido no se disputó, no se contarán los goles.<br />
                    Las lesiones contarán normalmente.<br />
                    Las tarjetas no se tendrán en cuenta.<br />
                    8- Las suspensiones por tarjetas (acumulación de amarillas o expulsiones) expiran independientemente si el jugador sancionado disputó o no el partido donde estaba suspendido. En caso de que el siguiente partido no se dispute por prórroga solicitada (postergación de la fecha), la suspensión deberá cumplirse en el próximo partido inmediato.<br />
                    <br />
                    Las sanciones por tarjetas y lesiones por liga se deberán cumplir sólo por Liga. Lo mismo se aplica para la Copa FM, Champions y Europa League<br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    Objetivos de la Temporada<br />
                    Los equipos tendrán un objetivo mínimo de temporada el cual debe cumplirse para recibir el dinero. Los equipos estarán divididos en grupos y el premio o sanción en su presupuesto para fichajes será de +/- 10.000.000 (Diez millones de euros) por cada escalón que superen o caigan. Para la temporada inicial será determinado por promedio de los mejores 16 CA de cada plantel.<br />
                    Estos serán otorgados por la organización en el inicio de cada temporada.<br />
                    <br />
                    <br />
                    Premios<br />
                    Premio por posición en liga<br />
                    Primera División<br />
                    1° 65.000.000 € + Bloqueo extra de un jugador previo al mercado<br />
                    2° 50.000.000 €<br />
                    Perdedores de las semifinales 40.000.000 €<br />
                    Perdedores 1° ronda de eliminación   25.000.000 €<br />
                    9° 10° y 11° + equipo que no juega promoción 15.000.000 €<br />
                    Descendidos más equipo en promoción 5.000.000 €<br />
                    <br />
                    Segunda División<br />
                    1° 85.000.000 € + Fichaje extra de equipos que no participan en la liga (Debe pagar el coste)<br />
                    2° 70.000.000 €<br />
                    3° 50.000.000 €<br />
                    4° al 9° 35.000.000 €<br />
                    No clasificados a playoff  15.000.000 €<br />
                    <br />
                    Copa FM<br />
                    Por participar en Primera Ronda: 6.000.000 €<br />
                    Por avanzar a Octavos: 6.000.000 €<br />
                    Por avanzar a Cuartos: 6.000.000 €<br />
                    Por avanzar a Semifinal: 10.000.000 €<br />
                    Por avanzar a la Final: 15.000.000 €<br />
                    Por ganar la Copa: 20.000.000 € + Bloqueo extra de un jugador previo al mercado<br />
                    En el caso de los equipos que participan directamente desde octavos, reciben el premio por participar en Primera Ronda si quedan eliminados.<br />
                    <br />
                    Champions League<br />
                    Por participar en Fase de grupos: 5.000.000 € por partido disputado<br />
                    Por avanzar a Cuartos: 7.000.000 €<br />
                    Por avanzar a Semifinal: 7.000.000 €<br />
                    Por avanzar a la Final: 7.000.000 €<br />
                    Por ganar la Copa: 18.000.000 € + Fichajes extra de equipos que no participan en la liga (Debe pagar el coste)<br />
                    <br />
                    Europa League<br />
                    Por participar en Primera Fase: 8.000.000 € por partido disputado (excepto los clasificados de Champions que recibiran 6.000.000 €)<br />
                    Por avanzar a Cuartos: 6.000.000 €<br />
                    Por avanzar a Semifinal: 6.000.000 €<br />
                    Por avanzar a la Final: 6.000.000 €<br />
                    Por ganar la Copa: 10.000.000 € + Fichajes extra de equipos que no participan en la liga (Debe pagar el coste) En caso de que el ganador sea un equipo de 2da división tendrá un bloqueo extra en reemplazo del fichaje extra. Esto será exceptuado en caso de que el mismo equipo sea campeón en a - la Copa FM o b - ascienda a la Primera División, en esa situación mantendría el fichaje extra (pagando el coste).<br />
                    <br />
                    Premio al goleador<br />
                    El equipo que tenga al goleador de la liga en cada división o Copa recibirá un extra de 10.000.000 € (Diez millones de euros).<br />
                    Reglas de desempate: 1-Mayor cantidad de asistencias.  2-Mayor cantidad de partidos jugados (excel mvp).  -Mayor promedio vlg de mvp<br />
                    <br />
                    Premio al asistidor<br />
                    El equipo que tenga al máximo asistidor de la liga en cada división o Copa recibirá un extra de 10.000.000 € (Diez millones de euros).<br />
                    Reglas de desempate: 1-Mayor cantidad goles.  2-Mayor cantidad de partidos jugados (excel mvp).  -Mayor promedio vlg de mvp<br />
                    <br />
                    En caso de repetirse el campeón en alguna competición, sólo podrá tener como máximo un fichaje extra por subasta. Quedará el fichaje restante para el subcampeón de Copa FM. Si esta fuera a tener premio de fichaje extra, quedará para el subcampeón de la Champions League o Europa League (sólo si el subcampeón de Champions tuviese premio). En caso de que los equipos mencionados tengan un fichaje extra, se sorteará entre los subcampeones de Primera y Segunda División.<br />
                    <br />
                    <br />
                    <br />
                    <br />
                    Mercado<br />
                    Bloqueos Primera División: 6 bloqueos por equipo.<br />
                    Bloqueos Segunda División: 4 bloqueos por equipo.<br />
                    <br />
                    Ingreso de Mercado:<br />
                    -El límite para ingresar al mercado es de 160CA excepto en los reset que será de 158CA.<br />
                    -Los equipos de Primera División están obligados a liberar hasta quedar con 18 mayores de 20 años, como máximo. Los de segunda división podrán liberar o no, según su criterio.<br />
                    -NO HAY DINERO por liberado.<br />
                    -No hay límite de liberados para ingresar al mercado.<br />
                    -Los equipos que queden con menos de 18 jugadores mayores luego de esta liberación previa al mercado, van a tener SUBASTAS EXTRAS al 50% (leer subastas extras), la cantidad de subastas extras que pueden adquirir serán las que le falten para completar 18 mayores.<br />
                    <br />
                    <br />
                    Orden del mercado:<br />
                    1- CDR (leer cdr)<br />
                    2- Transferencias entre equipos: Se podrán realizar traspasos de jugadores entre los managers de la superliga pero sin superar los dos jugadores como máximo(1x1, 1x2 o 2x2)<br />
                    3- Subastas (leer subastas)<br />
                    4- Subastas extras una vez cerrado el periodo de cdr.<br />
                    <br />
                    Subastas:<br />
                    Cada equipo podrá fichar hasta 4 jugadores que no forman parte de equipos que participan en la liga con la siguiente restricción: 2 de esos jugadores serán sub 20 (20 o menos años). Estos fichajes serán a modo de subasta. El precio inicial será el que determinó previamente la organización y quien más oferte por el jugador será quien termine incorporándose cuando finalice el mercado de fichajes. La oferta mínima para superar una oferta previa será de 1 millón de Euros. Si un usuario realiza una oferta por un jugador y luego decide bajarse de la subasta, tendrá una sanción de 5 millones de Euros. Además deberá dar aviso al jugador que previamente tenía la subasta más alta. Sino tendrá una sanción adicional de 2 millones de Euros. Si se baja de alguna subasta por segunda vez en el mercado, la sanción será de 10 millones de Euros, la tercera será una sanción de 15 millones. Además deberá dar aviso al jugador que previamente tenía la subasta más alta. Sino tendrá una sanción adicional de 2 millones de Euros.<br />
                    <br />
                    En el caso de fichajes de equipos que no participan primero se deberá ofertar por el jugador de la siguiente manera:<br />
                    <br />
                    Nombre completo del jugador – Equipo al que pertenece – Precio que figura en la pàgina (M o m en caso de millones).<br />
                    <br />
                    Si otro usuario desea ofertar por el jugador deberá superar la primera oferta y anunciarlo de la siguiente manera:<br />
                    <br />
                    Nombre completo – Equipo al que pertenece – Precio superador de la última oferta arrobando (mencionando) al jugador que hizo la última oferta para que este pueda volver a ofertar si así lo decide (UTILIZANDO EL MENSAJE DE LA PRIMERA OFERTA POR EL JUGADOR PARA INICIAR UN HILO). Si nadie más realiza una oferta por el jugador después de 24 horas de iniciada la subasta, quedará para quien realizó la mayor oferta. El mensaje ofertando por un jugador no podrá ser editado. De ser así la oferta no se considerará válida.<br />
                    <br />
                    SI SE REALIZA UNA OFERTA SUPERADORA POR UN JUGADOR HASTA 4 HORAS ANTES DEL CIERRE DEL MERCADO O VENCIMIENTO DE LA SUBASTA, QUIENES YA HAYAN OFERTADO POR ESE JUGADOR TENDRÁN LA OPCIÓN DE CONTESTAR HASTA 1 HORA DESPUÉS DEL CIERRE DE MERCADO O SUBASTA. DE HACERLO EXTENDERÁ EL PLAZO 1 HORA MÁS CON UN MÁXIMO DE 5 HORAS. SI LA OFERTA FUE POR UN JUGADOR AL CIERRE DEL MERCADO DE PASES Y NADIE OFERTÓ PREVIAMENTE, CUALQUIER USUARIO ESTARÁ HABILITADO PARA RESPONDER A ESA SUBASTA (EXCEPTO LOS QUE HAYAN REALIZADO TODAS SUS OFERTAS). SI UNA SUBASTA FUE ABIERTA ANTES DE LAS 4 HORAS PREVIAS A FINALIZAR EL MERCADO, ESTA PERMANECERÁ ABIERTA HASTA UNA HORA DESPUÉS DEL CIERRE DEL PERIODO DE TRASPASO.<br />
                    <br />
                    <br />
                    CDR:<br />
                    -Cualquier manager de la superliga puede ejecutar la CDR y la misma tendrá 6 horas de duración.<br />
                    -El nombre del jugador pujado, DEBE SER EXACTO, tanto mayúsculas, como acentos/tildes/apóstrofos/guión deben estar como el nombre lo indica en el excel de jugadores. CUALQUIER DIFERENCIA A CON EL EXCEL DARÁ COMO INVÁLIDA LA CDR.<br />
                    -El precio establecido será el mínimo a pagar, pero se puede pagar más dinero que el establecido hasta un máximo del 200% del valor inicial del jugador. Ej, Mbappe valor inicial 100M, máximo de valor: 300M.<br />
                    -Ante ofertas igualadas (misma plata), los managers que hayan participado en la cdr, tendrán 3 horas extra para enviar otra oferta sin límite máximo. La oferta que se envía arranca de 0, manteniendo el mínimo de el empate, es decir, deberá enviar en el desempate solamente el monto extra que quiere ofertar para hacerse con el jugador. Ej: en las 6hs de cdr ofertó como máximo 100M, en el desempate quiere elevar su oferta hasta 150M, por lo que deberá solo enviar una oferta de 50M (explicación para juanchi, no puedo hacerla más entendible). Este dinero extra, no entra al vendedor, es decir, solo sirve de desempate.<br />
                    Aclaracion: El vendedor, solamente recibirá el monto de la oferta durante las 6hs, la plata del desempate no formará parte de su presupuesto; el comprador en caso de ganar el desempate, si perderá ese monto del presupuesto.<br />
                    -Ante ofertas superadoras, se debe aceptar la misma, sin excepciones.<br />
                    -La ejecución de las CDR se realizará de manera secreta en el excel dejado por la organización. -Una vez realizada la oferta, el resto de los usuarios podrán ver quien ejecutó la cláusula pero no cual es el monto ofertado. Al transcurrir las 6 horas, aparecerán los montos en la página y los organizadores confirmaron al ganador de la cláusula<br />
                    -Cada equipo puede perder hasta un máximo de 6 jugadores mediante ejecución de la CDR.<br />
                    Los jugadores adquiridos mediante draft o subasta pueden ser intercambiados pero no se podrá ejecutar CDR sobre ellos (Se analizará cada caso en particular pero es posible que algunas cláusulas de rescisión no cuenten para el límite de 6 máximo que pueden ser ejecutadas para cada equipo. Ejemplo: si se ejecuta la cláusula de un jugador de 100 ca 120 de pa 20 y que no estaba en el primer equipo, no contará para el límite de cdr.<br />
                    -Cada manager podrá DEFENDER las CDR que le ejecuten, es decir, puede pujar por su propio jugador, cabe aclarar que obviamente el dinero no queda para el dt, si no que pasa a fondo de la superliga. Esta cdr “defendida” no cuenta para el límite de 6 cdr, pero si logra defender al jugador, este pasará a estar bloqueado y ya no podrá ser nuevamente ejecutado. Este jugador luego puede ser negociado igualmente.<br />
                    <br />
                    Subastas Extras:<br />
                    -Una vez finalizado el periodo de CDR, los managers podrán contar con subastas extras para completar sus equipos.<br />
                    -El precio de estas subastas será del 50% del valor del jugador (precio subasta), y tendrán las mismas reglas que las subastas normales.<br />
                    <br />
                    <br />
                    <br />
                    <br />
                    Presupuestos<br />
                    Serán dados por la organización al inicio de cada Temporada. (por lo menos hasta el proximo reset)<br />
                    <br />
                    Fin de mercado:<br />
                    -Límite CA Primera: 160CA<br />
                    -Límite CA Segunda: 153CA<br />
                    <br />
                    <br />
                    Ingreso de nuevos participantes<br />
                    Si se produce la baja de alguno de los integrantes de la liga, se procederá de la siguiente manera:<br />
                    <br />
                    1-Se les ofrecerá a los managers que estén participando de la liga hacerse cargo del equipo libre según el orden de elección a principio de la temporada.<br />
                    <br />
                    2-Si es un equipo de Segunda División, el manager entrante tomará el control del equipo del manager saliente<br />
                    <br />
                    3-Si la baja es de un manager de Primera División, esta plaza será ofrecida, entre los managers, de acuerdo al orden de elección de inicio de temporada. Este manager tendrá la opción de ocupar ese lugar o ceder la posibilidad de elegir al siguiente de la lista. En caso de acceder a ese cupo, el manager que ingrese a la liga tomará control del equipo libre y obtendrá los beneficios o pérdidas de presupuesto.<br />
                    <br />
                    Sanciones a usuarios<br />
                    -Los usuarios que a lo largo de la temporada acumulen 2 advertencias por no disputar encuentros, tendrán una amonestación.<br />
                    -Los usuarios que tengan 3 amonestaciones por acumulación de advertencias perderán su lugar en la liga.<br />
                    -Los usuarios que tengan 2 amonestaciones consecutivas por no presentarse a jugar sin aviso quedan expulsados de la liga.<br />
                    -Los usuarios que no cumplan con el reglamento pueden ser sancionados por la organización.<br />
                    -Para evitar ser expulsados por no presentarse a jugar los usuarios deberán dar aviso a la administración, de lo contrario pueden disputar más de dos partidos seguidos para que esta se encargue de conseguir un reemplazo y así conservar su lugar en la liga.<br />
                    <br />
                    Solicitud para aplazar partidos<br />
                    -Los participantes tendrán la posibilidad de solicitar se extienda el plazo de vencimiento de la fecha si no coordinan con su rival, un horario dentro de dicho periodo. Esta solicitud deberá realizarse 24 horas antes del cierre de la fecha y el mismo se podrá jugar hasta 24 horas después del vencimiento.<br />
                    -Los encuentros de las distintas competiciones podrán solicitar la extensión del plazo fuera de término pactado (48 horas antes) siempre y cuando sea para que el partido sea transmitido por el canal de Twitch de la SuperligaFM.<br />
                    <br />
                    MVP<br />
                    Explicación: -Con las screens de los partidos que se suban (stats de los jugadores), se tomará las valoraciones de cada jugador y se subirá a la página, fecha por fecha.<br />
                    Reglas:<br />
                    Habrá 1 ganador por fecha tanto en Primera, como Segunda.<br />
                    En caso de empate entre 2 jugadores se desempata de esta forma (mvp por fecha):<br />
                    1 - Goles a favor. 2 - Asistencias. 3 - CA equipo rival. 4 - Ocasiones de goles claras.<br />
                    En caso de desconexión en la partida, se hará promedio entre las 2 valoraciones de las screens. Si solo juega en 1 de esos 2 partidos, se tomará solo esa valoración. En caso de solo subir screen donde no pasaron 20min de partido, no se tomará en cuenta el partido, pero no habrá sanción.<br />
                    En caso de escritorios:<br />
                    -Escritorio a favor: Al final del torneo se dividirá en 1 fecha menos el promedio.<br />
                    -Escritorio en contra: Todos los jugadores recibirán 6.0 de valoración.<br />
                    -0 a 0: Todos los jugadores recibirán 6.0 de valoración.<br />
                    -En caso de imagen ilegible: No se tomará el partido.<br />
                    -Tampoco se dará valoración a jugador que no se muestre en la screen junto con los demás y el encargado de compartir los screen tendrá una sanción de 5M por cada pantallazo mal enviado.<br />
                    -Si las screens están incompletas, y hay reclamo del equipo rival, corresponde multa por cada pantallazo mal enviado.<br />
                    LOS SCREEN MAL SUBIDOS SERÁN MOTIVO DE MULTA (SIN CONSULTAR PREVIAMENTE EL MOTIVO). LOS RECLAMOS CORRESPONDIENTES SERÁN VÁLIDOS DENTRO DE LAS 24 HS DE LA REALIZACIÓN DEL ANUNCIO DE MULTA.<br />
                    <br />
                    MVP Temporada Regular<br />
                    -Corresponderá al jugador más regular de la Temporada, es decir, aquel que cumpla con 9 o más partidos jugados durante la temporada y sea el promedio de valoracion/partidos más alto de la temporada.<br />
                    -Para recibirlo el manager debe haber dirigido la cantidad minima de partidos establecidos previamente (9+ partidos).<br />
                    -En caso de empate de jugador de Temporada, las reglas de desempate son:<br />
                    1 -Cantidad de partidos jugados. 2 - Promedio goles/asistencias. 3 - Posición final del equipo.<br />
                    <br />
                    <br />
                    Equipo Ideal Temporada Regular<br />
                    -Se otorgará premios individuales a cada jugador que haya destacado en su puesto durante la temporada, siempre teniendo como método de evaluación el promedio valoración/partidos.<br />
                    -La táctica con la que se armara el equipo corresponderá con la más utilizada durante la temporada al manager que haya salido tenido más puntos en la tabla general y esté habilitado para recibir premios (9+ partidos dirigidos).<br />
                    -Cada jugador debe haber jugado 9+ partidos dirigido por el manager del equipo para poder recibir la distinción de entrar al equipo ideal.<br />
                    -Este premio se otorgará siempre en Primera División y cuando el encargado tenga tiempo también se otorgará en Segunda División.<br />
                    Reglas de desempate:<br />
                    1-Partidos jugados.  2-Cantidad de veces MVP de su propio equipo. 3-Posición final del equipo.
                    <br /><br />
                    Votaciones de Equipo Ideal<br />
                    -Se realizaran votaciones para adivinar que jugadores serán parte del equipo ideal.<br />
                    -Las reglas y premios se darán cuando se anuncie cada votación.<br />
                    -Queda a disposición del encargado realizarla<br />
                    <br />
                    Premios sección MVP<br />
                    MVP de la fecha ambas divisiones: 10 M por fecha (es decir, 10 M para cada división).<br />
                    MVP de la temporada ambas divisiones: 25 M para cada división<br />
                    Jugadores que integren el IX ideal de Primera División: 5 M para cada división, por cada jugador (incluye DT).<br />
                    <br />
                    <br />
                    SANCIONES POR USO DE BUGS:<br />
                    En el Football Manager existen ciertos bugs que afectan el desarrollo normal del juego. Hacer uso de estos bugs (Repetir roles de los MCD/MEC/MPC/DLC, jugar con 3 MPC y sin delanteros en la formación, jugar sin DLC con MPC) será penalizado dando por perdido el partido a quien lo aplique.<br />
                    En cada caso, los organizadores evaluarán el caso y darán resolución al mismo. El usuario que se viera afectado por algún bug, deberá guardar el partido una vez finalizado y enviarlo a la organización para que este sea analizado y se tome una decisión sobre el mismo. De todas formas, el encuentro debe estar finalizado para que sea válido. En el caso de repetición de roles, para que el pedido sea válido deben haber pasado más de 10 minutos con esa condición o haber marcado un gol, lo que ocurra primero.<br />
                    <br />
                    La autoridad organizativa ostentará el supremo poder decisorio, reservándose la facultad de enmendar, modificar y/o imponer sanciones o reglas, según lo estime conveniente. Estas determinaciones serán formalizadas mediante la redacción de un anuncio cuando corresponda.<br />
                </p>

            </form>
        </>
    )
}
