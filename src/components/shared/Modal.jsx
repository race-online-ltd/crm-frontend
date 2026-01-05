const Modal = ({ show, onClose, title, children, onSave }) => {
  if (!show) return null;

  return (
    <>
      {/* Backdrop for static effect */}
      <div className="modal-backdrop fade show"></div>

      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">{title}</h1>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button
    type="submit"
    form="acknowledgeForm"
    className="btn btn-primary"
  >
    Acknowledge
  </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
