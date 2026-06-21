export default function FixtureSecondDivision() {

    const numFechas = 13;
    const fechaImages = [];

    for (let i = 1; i <= numFechas; i++) {
        const imageUrl = `/segunda_division_fecha_${i}.png`;
        fechaImages.push(
            <div key={i} className="mb-6">
                <h2 className="text-center text-white font-bold text-lg sm:text-xl mb-3">Fecha {i}</h2>
                <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/50 p-2">
                    <img className="mx-auto w-full max-w-[1200px] h-auto" src={imageUrl} alt={`Fecha ${i}`} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down">
            <h1 className="text-center text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-widest mb-8">
                SEGUNDA DIVISION
            </h1>

            <div>
                {fechaImages}
            </div>
        </div>
    )
}