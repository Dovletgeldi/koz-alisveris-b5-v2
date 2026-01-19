import { RATES } from "../config";

function Hero() {
    return (
        <>
            <section id="home" className="intro-section">
                <div className="container">
                    <div className="row align-items-center text-white">
                        <div className="col-md-6 intros">
                            <h1 className="display-2">
                                <span className="display-2--intro">Bitirýän <br />işimiz näme?</span>
                                <span className="display-2--description">
                                    <span className="" style={{ textTransform: "capitalize" }}>türkiýeden</span> zakaz kabul edýäris. <br />
                                    <span className="" style={{ textTransform: "capitalize" }}>Beýlekilerden</span> tapawutlylykda, <br />
                                    <span className="highlight">
                                        diňe <a href="https://trendyol.com" className="highlight">Trendyol</a> bilen çäklenmän
                                    </span> <br />
                                    eýsem <span className="" style={{ textTransform: "capitalize" }}>Türkiýede</span> hyzmat berýän <br />
                                    <span className="highlight">ähli saýtlardan</span> zakaz kabul edýäris.
                                </span>
                            </h1>
                        </div>
                        <div className="col-md-6 intros text-end">
                            <div className="video-box">
                                <img src="images/arts/online-shopping.png" alt="online shopping illustration" className="img-fluid" />
                            </div>
                        </div>
                    </div>
                    <div id="price" className="row align-items-center text-white anchor">
                        <div className="col-md-6 intros">
                            <div className="video-box">
                                <img src="images/arts/price.png" alt="online shopping illustration" className="img-fluid" />
                            </div>
                        </div>
                        <div className="col-md-6 intros">
                            <h1 className="display-2 ms-5">
                                <span className="display-2--intro">
                                    1 tl = {RATES.post} tmt <br />
                                    1 kg = MUGT
                                </span>
                                <span className="display-2--description">
                                    300 TMT üsti mary şäher içi; <br />
                                    500 TMT üsti aşgabat şäher içi; <br />
                                    1000 TMT üsti ýurdumyzyň ähli künjegine; <br />
                                    <span className="highlight"> mugt eltip bermek </span>
                                    hyzmatymyz bolar.
                                </span>
                            </h1>
                        </div>
                    </div>
                </div>

                <svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path fill="#ffffff" fillOpacity="1"
                        d="M0,160L40,165.3C80,171,160,181,240,197.3C320,213,400,235,480,224C560,213,640,171,720,165.3C800,160,880,192,960,208C1040,224,1120,224,1200,213.3C1280,203,1360,181,1400,170.7L1440,160L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z">
                    </path>
                </svg>
            </section>
        </>
    );
}

export default Hero;