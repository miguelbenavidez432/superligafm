<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Rule;

class RuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Limpiamos la tabla antes de insertar para evitar duplicados si lo corres varias veces
        Rule::truncate();

        $rules = [
            [
                'section_key' => 'equipos',
                'title' => 'Elección de Equipos',
                'icon' => '🏟️',
                'order_index' => 1,
                'content' => <<<HTML
<h3 class="font-bold text-white text-lg">Se dividirán los equipos en 2 categorías.</h3>
<p><strong>Primera División</strong> formada por 14 equipos y <strong>Segunda División</strong> formada por 14 equipos.</p>
<p>Estos serán dados por la organización teniendo como parámetro el CA del equipo.</p>
<ul class="list-disc pl-5 space-y-3">
    <li>La selección de equipos para los usuarios será aleatoria en la primera temporada y cada vez que se reinicie la partida. Finalizada cada una de las temporadas los usuarios podrán mantener su equipo o elegir otro equipo de Primera División o Segunda según el orden de ubicación luego de finalizar la temporada.</li>
    <li>Aquellos usuarios que descendieron no podrán elegir el mismo equipo con el que perdieron la categoría.</li>
    <li>Si por algún motivo un usuario no se presenta a disputar dos partidos en la temporada perderán el derecho de mantener el equipo en caso de superar objetivos.</li>
    <li>En caso de pedir más de 4 postergaciones también perderá el derecho de mantener equipo.</li>
    <li>Si un usuario disputa menos del 50% de los partidos de la temporada, perderá el derecho a permanecer en el mismo equipo la siguiente temporada.</li>
    <li>Antes de comenzar la elección, aquellos usuarios que lograron ganar alguna competición o ascender, tendrán la posibilidad de elegir permanecer en el equipo que lo hicieron.</li>
    <li>Los manager de los equipos que superaron el objetivo de la temporada impuesto por la organización tendrán la posibilidad de permanecer en el equipo.</li>
    <li>Para mantener el equipo, los managers de los descendidos de la temporada anterior deberán mínimamente terminar entre los 6 mejores de la temporada en su nueva división.</li>
    <li>Los jugadores que abandonen cada equipo de la liga volverán al club que estuvieron en la última temporada.</li>
</ul>
HTML
            ],
            [
                'section_key' => 'formato',
                'title' => 'Formato de la Liga',
                'icon' => '📊',
                'order_index' => 2,
                'content' => <<<HTML
<h3 class="font-bold text-blue-400 text-lg border-b border-slate-700 pb-2">Primera División</h3>
<p>Se jugará con el sistema todos contra todos, una sola rueda y en cancha neutral, contabilizando 13 partidos por equipo.</p>
<p>Si el equipo que finaliza en la primera posición tiene 5 o menos puntos de ventaja sobre el segundo, clasificarán a playoff los 8 primeros equipos de la tabla de posiciones. Si tiene 6 o más puntos de ventaja, clasificará de manera directa a semifinales, accediendo los equipos entre el 2° y 7° a la primer ronda de playoffs.</p>
<p>Los cruces de Cuartos de Final se realizan mediante elección directa del manager, eligiendo en primer lugar quien se ubique 1° en la tabla, pudiendo elegir cualquier rival de los puestos 5º - 8º. El mejor ubicado tendrá ventaja deportiva (clasifica en caso de empate).</p>
<p>En semifinales y final los partidos serán con prórroga y penales en caso de empate.</p>
<p>El último descenderá directamente. Del 10° al 13° jugarán un playout para definir el último descendido y una promoción.</p>

<h3 class="font-bold text-blue-400 text-lg border-b border-slate-700 pb-2 mt-6">Segunda División</h3>
<p>Serán 14 equipos, todos contra todos (13 fechas). El 1° será campeón y ascenderá directamente. Los equipos del 2° al 9° lugar accederán a los playoffs.</p>
<p>Los cuartos de final tendrán ventaja deportiva para los equipos ubicados de la 2° a la 5° posición. Las semifinales y la final por el Segundo Ascenso se disputarán a partido único, con prórroga y penales.</p>
<p><strong>Promoción:</strong> La jugarán el equipo de Primera División ganador del play out y el perdedor de la final por el segundo ascenso de Segunda División. A un solo partido (con ventaja deportiva para el de Primera).</p>

<h3 class="font-bold text-blue-400 text-lg border-b border-slate-700 pb-2 mt-6">Copas Internacionales</h3>
<p><strong>Copa FM:</strong> La jugarán todos los equipos. Primera ronda de 24 equipos, luego los ganadores se unen a los 4 restantes en Octavos. Todo a partido único con penales y alargue.</p>
<p><strong>Champions League:</strong> La jugarán 16 equipos (Campeones defensores, Copa FM y los de Primera División). Fase de grupos (4x4) y luego eliminación directa.</p>
<p><strong>Europa League:</strong> La jugarán los 12 equipos que no clasifiquen a la CL + los terceros de los grupos de UCL. Eliminación directa.</p>
<p><strong>Supercopa FM:</strong> Semifinales y Final entre Campeón Primera, Campeón Copa FM, Campeón Champions y Campeón Europa League.</p>
HTML
            ],
            [
                'section_key' => 'lista',
                'title' => 'Lista de buena fe',
                'icon' => '📋',
                'order_index' => 3,
                'content' => <<<HTML
<p>Todos los managers deberán tener en sus equipos un máximo de 20 jugadores mayores de 20 años + 4 juveniles (sub–20) que utilizarán en todos los torneos. Los jugadores que no estén en el primer equipo quedarán inhabilitados.</p>
<p>En caso de que un manager no pudiese cumplir con la obligación de colocar un arquero entre los sustitutos (reanudación por desconexión) podrá agregar uno del equipo juvenil (sub-20) sin necesidad de que esté en la lista.</p>
<ul class="list-disc pl-5 mt-2 space-y-2">
    <li>Primera División: Promedio máximo de los mejores 16 CA de <strong>160 puntos</strong>.</li>
    <li>Segunda División: Promedio máximo de los mejores 16 CA de <strong>155 puntos</strong>.</li>
</ul>
HTML
            ],
            [
                'section_key' => 'plazos',
                'title' => 'Modo de disputa y plazos',
                'icon' => '⏳',
                'order_index' => 4,
                'content' => <<<HTML
<ul class="list-disc pl-5 space-y-3">
    <li>Cada fecha tiene un plazo máximo informado en el calendario de Discord.</li>
    <li>Cada usuario debe contactarse con su rival antes de las últimas 36 horas de plazo para jugar.</li>
    <li><strong>Si no se disputa:</strong>
        <ul class="list-circle pl-5 mt-2 space-y-1 text-slate-400">
            <li>Intención mutua sin acuerdo: Empate y advertencia.</li>
            <li>Ausencia de uno (menos de 24hs restantes): Pierde 0-3 y amonestación.</li>
            <li>Ninguno mostró intención: 0-0 (Sin puntos) y amonestación para ambos.</li>
        </ul>
    </li>
    <li>Para pedir escritorio por inactividad del rival se deben cumplir plazos estrictos y haber notificado al rival previamente.</li>
</ul>
HTML
            ],
            [
                'section_key' => 'partidos',
                'title' => 'Partidos (Simulación y Reglas)',
                'icon' => '🎮',
                'order_index' => 5,
                'content' => <<<HTML
<p>Los partidos se disputarán en FM 24 con la partida oficial. El Local es el host. Velocidad media o más y modo extendido o mayor.</p>
<p class="font-bold mt-4 text-white">Desconexiones:</p>
<ul class="list-disc pl-5 space-y-2 mb-4">
    <li>Se completarán los minutos restantes + 4 de adición.</li>
    <li>Se debe agregar obligatoriamente un arquero suplente a la reanudación (sub-20).</li>
    <li>Obligatorio tomar screens con la lista de valoraciones de los 2 equipos.</li>
</ul>
<p class="font-bold text-white">Reporte de Resultados:</p>
<p>Al finalizar se mandarán screens del resultado, goleadores, tarjetas, lesiones, valoraciones y formaciones. Obligatorio subir el .pkm.</p>
<p>El host debe registrar las estadísticas en el Excel en menos de 2 horas. Multas económicas y de puntos por demoras (hasta pérdida del partido si superan las 12hs).</p>
HTML
            ],
            [
                'section_key' => 'suspensiones',
                'title' => 'Suspensiones de jugadores',
                'icon' => '🟨',
                'order_index' => 6,
                'content' => <<<HTML
<ul class="list-disc pl-5 space-y-3">
    <li>Expulsión por doble amarilla: 1 partido. Roja directa: 2 partidos.</li>
    <li>Acumulación amarillas en Liga: 1 partido (a las 3), 2 partidos (a las 6) y 3 partidos (a las 9).</li>
    <li>Acumulación amarillas Copas: 1 partido (a las 2).</li>
    <li>Las tarjetas se "limpian" en semifinales, pero las sanciones pendientes DEBEN cumplirse.</li>
    <li>Lesión Naranja: Inhabilitado para el siguiente partido.</li>
    <li>Lesión Roja: Inhabilitado para los siguientes 2 partidos.</li>
    <li>Las sanciones de Liga se cumplen en Liga, y las de Copas en Copas.</li>
</ul>
HTML
            ],
            [
                'section_key' => 'objetivos',
                'title' => 'Objetivos de la Temporada',
                'icon' => '🎯',
                'order_index' => 7,
                'content' => <<<HTML
<p>Premio o sanción en presupuesto de +/- 10.000.000 € por cada escalón superado/caído respecto al objetivo.</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
    <div class="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
        <h4 class="font-bold text-green-400 mb-2">Liga (1era División)</h4>
        <ul class="text-sm space-y-1">
            <li>1°: 150M € + Bloqueo 50%</li>
            <li>2°: 120M €</li>
            <li>Semis: 100M €</li>
            <li>1ra Ronda Playoffs: 85M €</li>
            <li>9°, 10°, 11°: 70M €</li>
            <li>Descendidos: 55M €</li>
        </ul>
    </div>
    <div class="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
        <h4 class="font-bold text-green-400 mb-2">Copas</h4>
        <ul class="text-sm space-y-1">
            <li>Campeón Copa FM: 40M € + Bloqueo 50%</li>
            <li>Campeón Champions: 40M € + Fichaje Extra</li>
            <li>Campeón Europa L.: 30M € + Fichaje Extra</li>
            <li>Goleador / Asistidor: 10M € extra c/u.</li>
        </ul>
    </div>
</div>
HTML
            ],
            [
                'section_key' => 'mercado',
                'title' => 'Mercado de Pases',
                'icon' => '💰',
                'order_index' => 8,
                'content' => <<<HTML
<p><strong>Bloqueos:</strong> 4 bloqueos por equipo en ambas divisiones.</p>
<p><strong>Límite CA de Ingreso:</strong> 160 CA (158 CA en reset). 1era Div obligada a liberar hasta quedar con 18 mayores.</p>

<h4 class="font-bold text-white mt-4">Orden del Mercado:</h4>
<ol class="list-decimal pl-5 space-y-1 text-slate-300">
    <li>CDR</li>
    <li>Transferencias entre equipos (máx 2x2)</li>
    <li>Subastas</li>
    <li>Subastas Extras</li>
</ol>

<h4 class="font-bold text-white mt-4">Subastas:</h4>
<p class="mb-2">Hasta 4 jugadores libres (2 de ellos sub-20 obligatorios). Oferta mínima de superación: 1M €. Sanciones económicas severas por bajarse de una subasta.</p>
<p class="bg-yellow-900/30 text-yellow-300 p-3 rounded border border-yellow-700/50 text-sm">
    <strong>Regla de Cierre:</strong> Ofertas en las últimas 4hs extienden la subasta 1 hora para los previos ofertantes (máx 5hs).
</p>

<h4 class="font-bold text-white mt-4">CDR (Cláusulas):</h4>
<ul class="list-disc pl-5 space-y-1">
    <li>Duración: 6 horas. Secretas a través de Excel.</li>
    <li>Máximo a pagar: 200% del valor.</li>
    <li>En empate, hay 3 horas de desempate ciego.</li>
    <li>Máximo 6 CDR perdidas por equipo.</li>
    <li>Se pueden "Defender" las CDR de tu propio jugador.</li>
</ul>
HTML
            ],
            [
                'section_key' => 'nuevos',
                'title' => 'Ingreso de nuevos participantes',
                'icon' => '👋',
                'order_index' => 9,
                'content' => <<<HTML
<p>Si se produce una baja:</p>
<ol class="list-decimal pl-5 space-y-2">
    <li>Se ofrecerá a los managers actuales hacerse cargo según el orden de elección.</li>
    <li>Si es de Segunda, el nuevo toma el control directo.</li>
    <li>Si es de Primera, se ofrece a los actuales primero. Si alguien sube, el nuevo toma el equipo que quedó libre.</li>
</ol>
HTML
            ],
            [
                'section_key' => 'sanciones',
                'title' => 'Sanciones y Aplazamientos',
                'icon' => '⚖️',
                'order_index' => 10,
                'content' => <<<HTML
<h4 class="font-bold text-white">Sanciones a Usuarios</h4>
<ul class="list-disc pl-5 space-y-1 mb-4">
    <li>2 Advertencias = 1 Amonestación.</li>
    <li>3 Amonestaciones = Expulsión de la liga.</li>
    <li>2 Incomparecencias consecutivas sin aviso = Expulsión directa.</li>
</ul>

<h4 class="font-bold text-white">Aplazar Partidos</h4>
<p>Se debe solicitar extensión 24hs antes del cierre. Extiende el plazo 24hs extra. Partidos transmitidos por Twitch pueden aplazarse fuera de término.</p>
HTML
            ],
            [
                'section_key' => 'bugs',
                'title' => 'Sanciones por uso de Bugs',
                'icon' => '🚫',
                'order_index' => 11,
                'content' => <<<HTML
<div class="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl">
    <p class="text-red-200 font-medium">Hacer uso de bugs reconocidos será penalizado dando por perdido el partido a quien lo aplique.</p>
    <ul class="list-disc pl-5 mt-2 text-sm text-red-300 space-y-1">
        <li>Repetir roles de los MCD/MEC/MPC/DLC.</li>
        <li>Jugar con 3 MPC y sin delanteros en la formación.</li>
        <li>Jugar sin DLC pero usando MPC.</li>
    </ul>
    <p class="mt-3 text-sm text-slate-400">
        La autoridad organizativa ostentará el supremo poder decisorio para enmendar, modificar y/o imponer sanciones según lo estime conveniente.
    </p>
</div>
HTML
            ]
        ];

        foreach ($rules as $rule) {
            Rule::create($rule);
        }
    }
}
