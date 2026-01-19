export default function Header() {
    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-dark menu bg-primary shadow fixed-top">
                <div className="container">
                    <a className="navbar-brand" href="#">
                        <img src="images/logo.png" alt="logo image" />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link" href="dukan.html">Dükan</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="order-track.html">Sargytlarym</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#services">Kargo</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#testimonials">Görüşler</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#faq">KSS</a>
                            </li>
                        </ul>
                        <button onClick="location.href='https://s.imoim.net/xSZ5dO'" type="button" className="rounded-pill btn-rounded">
                            +90 541 942 0722
                            <span><img src="images/social media/imo-white.png" alt="imo image" /></span>
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    )
}