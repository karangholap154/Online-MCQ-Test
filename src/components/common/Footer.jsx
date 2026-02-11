
const Footer = () => {
  return (
    <footer className="bg-light border-top mt-auto">
      <div className="container py-3">
        <div className="row">
          <div className="col text-center text-muted">
            Made with{" "}
            <i className="bi bi-heart-fill text-danger mx-1"></i>
            Candorworks &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
