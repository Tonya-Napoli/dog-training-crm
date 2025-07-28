import React from 'react';
import BaseModal from './BaseModal.jsx';
import ClientAssignmentForm from '../forms/ClientAssignmentForm.jsx';

const AssignClientsModal = ({ 
  isOpen, 
  onClose, 
  trainer, 
  clients, 
  onAssign 
}) => {
  if (!trainer) return null;

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose}
      title={`Assign Clients to ${trainer.firstName} ${trainer.lastName}`}
      maxWidth="max-w-2xl"
    >
      <ClientAssignmentForm
        trainer={trainer}
        clients={clients}
        onAssign={onAssign}
        onCancel={onClose}
      />
    </BaseModal>
  );
};

export default AssignClientsModal;