import { useEffect } from "react";

import { CheckCircle } from "lucide-react";

const ThankYou = () => {
 
  useEffect(() => {
    const timer = setTimeout(() => {
      window.close();
      window.location.href = "https://www.google.com";
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white p-3 p-md-4">
        <div
          className="card shadow-lg border-0 rounded-4 w-100"
          style={{ maxWidth: "540px" }}
        >
          <div className="card-body p-4 p-sm-5 text-center">
            <div className="mb-3 mb-md-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle p-3"
                style={{ width: "80px", height: "80px" }}
              >
                <CheckCircle
                  size={48}
                  className="text-success d-none d-sm-block"
                />
                <CheckCircle
                  size={40}
                  className="text-success d-block d-sm-none"
                />
              </div>
            </div>
            <h1 className="card-title h2 h1-md fw-bold text-dark mb-3">
              Thank You!
            </h1>
            <p className="fs-5 fs-md-4 text-secondary mb-3 mb-md-4">
              Your test has been submitted successfully, contact your HR for
              further details.
            </p>
            <p className="small text-muted mt-3 mt-md-4 mb-0 px-2">
              If the window doesn't close, please close it manually.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYou;
