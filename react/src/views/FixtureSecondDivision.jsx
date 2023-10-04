export default function FixtureSecondDivision() {

    const numFechas = 13;
    const fechaImages = [];

    for (let i = 1; i <= numFechas; i++) {
        const imageUrl = `/segunda_division_fecha_${i}.png`;
        fechaImages.push(
            <div key={i}>
                <h2 className="text-center">Fecha {i}</h2>
                <img className="mx-auto my-5 h-100 w-auto" src={imageUrl} alt={`Fecha ${i}`} />
            </div>
        );
    }

    return (
        <>
            <h1 className="text-center"><strong>SEGUNDA DIVISION</strong></h1>

            <div>
                {fechaImages}
            </div>
        </>
    )
}