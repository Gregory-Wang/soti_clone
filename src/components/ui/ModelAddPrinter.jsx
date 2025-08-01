import React from 'react'
import Modal from "@/components/ui/modal.jsx";
import { useRef, useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage.js';

/**
 * Independent add printer Modal component
 * Supports global calls, does not depend on specific parent components
 */
const ModelAddPrinter = ({ 
    isOpen, 
    onClose, 
    onAdd, 
    // Optional custom configuration
    customConfig = {}
}) => {
    const { t } = useLanguage();
    const modalRef = useRef(null);
    const firstInputRef = useRef(null);

    // Default form configuration
    const defaultFormConfig = {
        fields: [
            {
                name: 'printerName',
                label: t('printerName'),
                type: 'text',
                required: true,
                errorMessage: t('pleaseEnterPrinterName'),
                ref: firstInputRef
            },
            {
                name: 'clientId',
                label: t('clientId'),
                type: 'text',
                required: true,
                errorMessage: t('pleaseEnterClientId')
            }
        ],
        validation: true
    };

    // Default button configuration
    const defaultButtons = [
        {
            type: 'cancel',
            text: t('cancel')
        },
        {
            type: 'submit',
            text: t('add'),
            onClick: async (formData) => {
                try {
                    // Execute add logic
                    await onAdd(formData.printerName, formData.clientId);
                    return { success: true };
                } catch (error) {
                    // Directly throw error, let modal component handle specific error message
                    throw error;
                }
            }
        }
    ];

    // Default result prompt configuration
    const defaultResultConfig = {
        success: {
            type: 'success',
            icon: 'fa-check',
            title: t('addSuccess'),
            message: t('printerAddedSuccessfully')
        },
        error: {
            type: 'error',
            icon: 'fa-exclamation-triangle',
            title: t('addFailed'),
            message: t('addFailedCheckInput')
        },
        duration: 1000 // Reduce to 1 second, let user see feedback faster
    };

    // Merge custom configuration
    const formConfig = customConfig.formConfig || defaultFormConfig;
    const buttons = customConfig.buttons || defaultButtons;
    const resultConfig = customConfig.resultConfig || defaultResultConfig;

    // Handle close, directly call parent component's onClose
    const handleClose = () => {
        onClose();
    };

    // Only render Modal when isOpen is true
    if (!isOpen) return null;

    return (
        <Modal
            ref={modalRef}
            title={t('addPrinter')}
            onClose={handleClose}
            formConfig={formConfig}
            buttons={buttons}
            resultConfig={resultConfig}
        />
    );
}

export default ModelAddPrinter