import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Copy, Check } from "lucide-react";

const TestGenLink = ({ show, onHide, link }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!navigator.clipboard) {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } else {
      navigator.clipboard.writeText(link);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const characters = link.split('').slice(0, 8);
  while (characters.length < 8) {
    characters.push('');
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="fw-semibold">Generated Test Shortcode</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <div className="mb-3">
          <label className="form-label fs-6 text-muted small mb-3">Your Shortcode</label>
        </div>

        <div className="row g-3">
          {/* Character boxes */}
          <div className="col-12">
            <div className="row justify-content-center g-2">
              {characters.map((char, index) => (
                <div key={index} className="col-auto">
                  <div className="otp-box border rounded text-center font-monospace fw-semibold fs-4 bg-light d-flex align-items-center justify-content-center">
                    {char}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copy button */}
          <div className="col-12">
            <div className="row justify-content-center mt-2">
              <div className="col-auto">
                <Button
                  variant={copied ? "success" : "secondary"}
                  onClick={copyToClipboard}
                  className="px-4"
                >
                  {copied ? (
                    <>
                      <Check size={18} className="me-2" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} className="me-2" />
                      <span>Copy Code</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-muted small">
          <p className="text-success fw-bold">Share this shortcode with your candidate. They can use it to access their test.</p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TestGenLink;