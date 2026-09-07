import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import '../css/SharedComponents.css';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="em-modal-overlay" onClick={onClose}>
      <div className="em-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="em-modal-header">
          <h3>{title}</h3>
          <button className="em-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="em-modal-body">
          {children}
        </div>

        {footer && (
          <div className="em-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
