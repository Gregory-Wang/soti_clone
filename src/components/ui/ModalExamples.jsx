import React from 'react'
import Modal from "@/components/ui/modal.jsx";
import { useRef } from 'react';

/**
 * Modal component usage examples
 * Demonstrates how to create different types of dialogs
 */

// Example 1: User login dialog
// Username
// Please enter username
// Password
// Please enter password
// Cancel
// Login
// Login successful
// Welcome back!
// Login failed
// Username or password incorrect
// User Login
// Example 2: Device configuration dialog
// Device Name
// Please enter device name
// IP Address
// Please enter IP address
// Port
// Save
// Save successful
// Device configuration updated
// Save failed
// Please check network connection and try again
// Device Configuration
// Example 3: Confirmation dialog (no form)
// Cancel
// Confirm
// Operation successful
// Operation completed
// Operation failed
// Please try again later
// Close
export const LoginModal = ({ onClose, onLogin }) => {
    const modalRef = useRef(null);
    const firstInputRef = useRef(null);

    const formConfig = {
        fields: [
            {
                name: 'username',
                label: 'Username',
                type: 'text',
                required: true,
                errorMessage: 'Please enter username',
                ref: firstInputRef
            },
            {
                name: 'password',
                label: 'Password',
                type: 'password',
                required: true,
                errorMessage: 'Please enter password'
            }
        ],
        validation: true
    };

    const buttons = [
        {
            type: 'cancel',
            text: 'Cancel'
        },
        {
            type: 'submit',
            text: 'Login',
            onClick: async (formData) => {
                await onLogin(formData.username, formData.password);
                return { success: true };
            }
        }
    ];

    const resultConfig = {
        success: {
            type: 'success',
            icon: 'fa-sign-in-alt',
            title: 'Login successful',
            message: 'Welcome back!'
        },
        error: {
            type: 'error',
            icon: 'fa-exclamation-triangle',
            title: 'Login failed',
            message: 'Username or password incorrect'
        },
        duration: 2000
    };

    return (
        <Modal
            ref={modalRef}
            title="User Login"
            onClose={onClose}
            formConfig={formConfig}
            buttons={buttons}
            resultConfig={resultConfig}
        />
    );
};

// Example 2: Device configuration dialog
export const DeviceConfigModal = ({ onClose, onSave }) => {
    const modalRef = useRef(null);
    const firstInputRef = useRef(null);

    const formConfig = {
        fields: [
            {
                name: 'deviceName',
                label: 'Device Name',
                type: 'text',
                required: true,
                errorMessage: 'Please enter device name',
                ref: firstInputRef
            },
            {
                name: 'ipAddress',
                label: 'IP Address',
                type: 'text',
                required: true,
                errorMessage: 'Please enter IP address'
            },
            {
                name: 'port',
                label: 'Port',
                type: 'number',
                required: false,
                defaultValue: '8080'
            }
        ],
        validation: true
    };

    const buttons = [
        {
            type: 'cancel',
            text: 'Cancel'
        },
        {
            type: 'submit',
            text: 'Save',
            onClick: async (formData) => {
                await onSave(formData);
                return { success: true };
            }
        }
    ];

    const resultConfig = {
        success: {
            type: 'success',
            icon: 'fa-save',
            title: 'Save successful',
            message: 'Device configuration updated'
        },
        error: {
            type: 'error',
            icon: 'fa-exclamation-triangle',
            title: 'Save failed',
            message: 'Please check network connection and try again'
        },
        duration: 2000
    };

    return (
        <Modal
            ref={modalRef}
            title="Device Configuration"
            onClose={onClose}
            formConfig={formConfig}
            buttons={buttons}
            resultConfig={resultConfig}
        />
    );
};

// Example 3: Confirmation dialog (no form)
export const ConfirmModal = ({ onClose, onConfirm, title, message }) => {
    const modalRef = useRef(null);

    const buttons = [
        {
            type: 'cancel',
            text: 'Cancel'
        },
        {
            type: 'submit',
            text: 'Confirm',
            onClick: async () => {
                await onConfirm();
                return { success: true };
            }
        }
    ];

    const resultConfig = {
        success: {
            type: 'success',
            icon: 'fa-check',
            title: 'Operation successful',
            message: 'Operation completed'
        },
        error: {
            type: 'error',
            icon: 'fa-exclamation-triangle',
            title: 'Operation failed',
            message: 'Please try again later'
        },
        duration: 1500
    };

    return (
        <Modal
            ref={modalRef}
            title={title}
            onClose={onClose}
            buttons={buttons}
            resultConfig={resultConfig}
        >
            <div className="text-center py-4">
                <p className="text-gray-600">{message}</p>
            </div>
        </Modal>
    );
};

// Example 4: Custom content dialog
export const CustomModal = ({ onClose, title, children }) => {
    const modalRef = useRef(null);

    const buttons = [
        {
            type: 'cancel',
            text: 'Close'
        }
    ];

    return (
        <Modal
            ref={modalRef}
            title={title}
            onClose={onClose}
            buttons={buttons}
        >
            {children}
        </Modal>
    );
}; 