import logo from "../assets/logo.png";

function Navbar() {
    return (
        <>
            <header className="bg-primary text-white">
                <div className="items-center justify-between flex">
                    <a href="kozalisveris.com">
                        <img src={logo} alt="KöZ logo image" className="w-[9rem]" />
                    </a>
                    <div className="flex">
                        <ul className="flex">
                            <li>Dükan</li>
                            <li>Sargytlarym</li>
                            <li>Kargo</li>
                            <li>Kargo</li>
                            <li>Görüşler</li>
                            <li>KSS</li>
                        </ul>
                        <button>+90 541 942 0722</button>
                    </div>
                </div>

            </header>
        </>

    )
}

export default Navbar