import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Subscription,
  BillingCycle,
  SubscriptionCategory,
  SubscriptionStatus,
} from '../types/subscription';
import { generateId } from '../utils/calculations';
import './SubscriptionForm.css';

interface SubscriptionFormProps {
  subscriptions?: Subscription[];
  onSave: (subscription: Subscription) => void;
  onCancel: () => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscriptions = [],
  onSave,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const existingSubscription = isEditMode
    ? subscriptions.find(sub => sub.id === id)
    : null;

  const [formData, setFormData] = useState<Subscription>({
    id: existingSubscription?.id || generateId(),
    name: existingSubscription?.name || '',
    category: existingSubscription?.category || 'other',
    cost: existingSubscription?.cost || 0,
    billingCycle: existingSubscription?.billingCycle || 'monthly',
    customMonths: existingSubscription?.customMonths,
    startDate: existingSubscription?.startDate || new Date().toISOString().split('T')[0],
    endDate: existingSubscription?.endDate || '',
    status: existingSubscription?.status || 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' || name === 'customMonths' ? parseFloat(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.cost <= 0) {
      newErrors.cost = 'Cost must be greater than 0';
    }

    if (formData.billingCycle === 'custom' && (!formData.customMonths || formData.customMonths <= 0)) {
      newErrors.customMonths = 'Custom billing cycle must be at least 1 month';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const subscriptionToSave: Subscription = {
      ...formData,
      endDate: formData.endDate || undefined,
      customMonths: formData.billingCycle === 'custom' ? formData.customMonths : undefined,
    };

    onSave(subscriptionToSave);
    navigate('/');
  };

  const handleCancelClick = () => {
    navigate('/');
  };

  return (
    <div className="subscription-form-container">
      <div className="form-wrapper">
        <h2>{isEditMode ? 'Edit Subscription' : 'Add New Subscription'}</h2>

        <form onSubmit={handleSubmit} className="subscription-form">
          <div className="form-group">
            <label htmlFor="name">
              Subscription Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="e.g., Netflix, Spotify"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="streaming">Streaming</option>
              <option value="software">Software</option>
              <option value="utilities">Utilities</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cost">
                Cost ($) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={errors.cost ? 'error' : ''}
              />
              {errors.cost && <span className="error-message">{errors.cost}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="billingCycle">
                Billing Cycle <span className="required">*</span>
              </label>
              <select
                id="billingCycle"
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {formData.billingCycle === 'custom' && (
            <div className="form-group">
              <label htmlFor="customMonths">
                Billing Period (months) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="customMonths"
                name="customMonths"
                value={formData.customMonths || ''}
                onChange={handleChange}
                min="1"
                step="1"
                className={errors.customMonths ? 'error' : ''}
                placeholder="e.g., 3, 6, 24"
              />
              {errors.customMonths && (
                <span className="error-message">{errors.customMonths}</span>
              )}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                Start Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? 'error' : ''}
              />
              {errors.startDate && (
                <span className="error-message">{errors.startDate}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date (Optional)</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={errors.endDate ? 'error' : ''}
              />
              {errors.endDate && <span className="error-message">{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">
              Status <span className="required">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancelClick} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-submit">
              {isEditMode ? 'Update Subscription' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionForm;
