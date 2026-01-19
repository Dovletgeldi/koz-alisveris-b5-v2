import { useState } from "react";
import { RATES } from "../config";

function ConverterModal() {
    const [tlValue, setTlValue] = useState("");

    // Calculate values instantly
    const resAfter = tlValue ? Math.ceil(parseFloat(tlValue) * RATES.post) : "-";
    const resPre = tlValue ? Math.ceil(parseFloat(tlValue) * RATES.pre) : "-";
    const resHalf = tlValue ? Math.ceil(parseFloat(tlValue) * RATES.half) : "-";

    const clearInput = () => setTlValue("");

    return (
        <div className="modal fade" id="converterModal" tabIndex="-1" aria-labelledby="converterModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content p-4 position-relative"
                    style={{ borderRadius: "2rem", border: "none", boxShadow: "0 1rem 3rem rgba(0,0,0,0.175)" }}>
                    <button type="button" className="btn-close position-absolute" data-bs-dismiss="modal" aria-label="Close"
                        style={{ top: "1.5rem", right: "1.5rem", zIndex: 10 }}></button>

                    <div className="modal-header border-0 justify-content-center">
                        <h5 className="modal-title fw-bold display-6 text-center" id="converterModalLabel" style={{ fontSize: "2.2rem" }}>TL
                            <i className="fa-solid fa-right-long mx-2" style={{ fontSize: "0.8em", opacity: 0.8 }}></i> TMT
                        </h5>
                    </div>

                    <div className="modal-body text-center pt-2">
                        <p className="mb-4 text-muted">Harydyň TL bahasy girizeniňizde ähli töleg usullary hasaplanar. <span
                            className="badge bg-success-subtle text-success ms-2">KG MUGT</span></p>

                        <div className="input-group mb-4 shadow-sm rounded-4 overflow-hidden" style={{ border: "2px solid #f27a1a" }}>
                            <div className="form-floating flex-grow-1">
                                <input
                                    type="number"
                                    id="tl-price"
                                    className="form-control border-0"
                                    placeholder="100"
                                    value={tlValue}
                                    onChange={(e) => setTlValue(e.target.value)}
                                    style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center", height: "70px" }}
                                />
                                <label htmlFor="tl-price">TL Mukdaryny Giriň</label>
                            </div>
                            <button className="btn bg-white border-0 px-3" type="button" onClick={clearInput}
                                style={{ fontSize: "1.2rem", color: "#6c757d", borderRadius: 0 }}>
                                <i className="fa-solid fa-circle-xmark"></i>
                            </button>
                        </div>

                        <div className="results-grid row gx-3 gy-3 mt-2">
                            <div className="col-4">
                                <div
                                    className="py-4 px-2 rounded-4 bg-light border h-100 d-flex flex-column align-items-center justify-content-between text-center">
                                    <small className="text-muted mb-1" style={{ fontSize: "0.6rem", lineHeight: 1 }}>50% Öňünden</small>
                                    <div className="fw-bold text-dark" style={{ fontSize: "1rem", lineHeight: 1.1 }}>{resHalf}</div>
                                    <small className="text-muted mt-1" style={{ fontSize: "0.5rem", opacity: 0.8 }}>(1 TL: <span
                                        className="half-tl-rate">{RATES.half}</span>)</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div
                                    className="py-4 px-2 rounded-4 bg-white border-2 h-100 d-flex flex-column align-items-center justify-content-between text-center highlight-card"
                                    style={{ borderColor: "#f27a1a", transform: "scale(1.1)", boxShadow: "0 10px 25px rgba(242, 122, 26, 0.15)", zIndex: 2 }}>
                                    <small className="text-secondary fw-bold mb-1" style={{ fontSize: "0.65rem", lineHeight: 1 }}>100%
                                        Soňundan</small>
                                    <div className="fw-bold text-primary" style={{ fontSize: "1.2rem", lineHeight: 1.1 }}>{resAfter}</div>
                                    <small className="text-muted mt-1" style={{ fontSize: "0.55rem", opacity: 0.8 }}>(1 TL: <span
                                        className="post-tl-rate">{RATES.post}</span>)</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div
                                    className="py-4 px-2 rounded-4 bg-light border h-100 d-flex flex-column align-items-center justify-content-between text-center">
                                    <small className="text-muted mb-1" style={{ fontSize: "0.6rem", lineHeight: 1 }}>100% Öňünden</small>
                                    <div className="fw-bold text-dark" style={{ fontSize: "1rem", lineHeight: 1.1 }}>{resPre}</div>
                                    <small className="text-muted mt-1" style={{ fontSize: "0.5rem", opacity: 0.8 }}>(1 TL: <span
                                        className="pre-tl-rate">{RATES.pre}</span>)</small>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-top">
                            <p className="small text-muted mb-0 py-2">Bizi saýlanyňyz üçin minnetdar!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConverterModal;