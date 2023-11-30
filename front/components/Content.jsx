export function Content() {
    return <div>
        <section className="background-eth text-white">
        <div className="d-flex justify-content-between">
            <div className="text-white text-content-build justify-content-center div-cent-izda">
                <h1 className="">Build Private <br/> Ethereum <br/>Networks</h1>
            </div>
            <div className="text-white text-content-eth justify-content-center div-cent-dcha">
                <p className="">Crea tus propias redes ethereum</p>
            </div> 
        </div>
        </section>
        <section className="m-5 d-flex d-flex justify-content-center">
            <div className="card m-3 w-25 h-25">
            <img src="../img/Faucet2.png" className="card-img-top img-thumbnail"
                        alt="Faucet" />
                <div className="card-body">
                    <h5 className="card-title">Faucet</h5>
                    <p className="card-text">Crea tus propios nodos de ethereum</p>
                </div>
            </div>
            <div className="card m-3 w-25 h-25">
            <img src="../img/Transfer2.png" className="card-img-top img-thumbnail"
                        alt="Transfer" />
                <div className="card-body">
                    <h5 className="card-title">Transfer</h5>
                    <p className="card-text">Realiza transferencias entre cuentas</p>
                </div>
            </div>

        </section>
     </div>
}