import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Subscription, SubscriptionCategory, SubscriptionStatus } from '../types/subscription';
import {
  calculateMonthlyCost,
  formatCurrency,
  formatDate,
  getNextRenewalDate,
  getUpcomingRenewals,
} from '../utils/calculations';
import './SubscriptionList.css';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onDelete: (id: string) => void;
  onUpdate: (subscription: Subscription) => void;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onDelete,
  onUpdate,
}) => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<SubscriptionCategory | 'all'>('all');

  const filteredSubscriptions = subscriptions.filter(sub => {
    const statusMatch = filterStatus === 'all' || sub.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || sub.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const upcomingRenewals = getUpcomingRenewals(subscriptions);

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handleToggleStatus = (subscription: Subscription) => {
    const newStatus: SubscriptionStatus = 
      subscription.status === 'active' ? 'inactive' : 'active';
    onUpdate({ ...subscription, status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      onDelete(id);
    }
  };

  return (
    <div className="subscription-list-container">
      <div className="list-header">
        <h2>Your Subscriptions</h2>
        <div className="filters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="streaming">Streaming</option>
            <option value="software">Software</option>
            <option value="utilities">Utilities</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {upcomingRenewals.length > 0 && (
        <div className="upcoming-renewals">
          <h3>🔔 Upcoming Renewals (Next 30 Days)</h3>
          <div className="renewals-list">
            {upcomingRenewals.map(({ subscription, renewalDate, daysUntilRenewal }) => (
              <div key={subscription.id} className="renewal-item">
                <span className="renewal-name">{subscription.name}</span>
                <span className="renewal-date">
                  {formatDate(renewalDate)} ({daysUntilRenewal} day{daysUntilRenewal !== 1 ? 's' : ''})
                </span>
                <span className="renewal-cost">{formatCurrency(subscription.cost)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="subscriptions-grid">
        {filteredSubscriptions.length === 0 ? (
          <div className="empty-state">
            <p>No subscriptions found. Add your first subscription to get started!</p>
          </div>
        ) : (
          filteredSubscriptions.map(subscription => {
            const monthlyCost = calculateMonthlyCost(subscription);
            const nextRenewal = getNextRenewalDate(subscription);

            return (
              <div
                key={subscription.id}
                className={`subscription-card ${subscription.status}`}
              >
                <div className="card-header">
                  <h3>{subscription.name}</h3>
                  <span className={`status-badge ${subscription.status}`}>
                    {subscription.status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="subscription-info">
                    <div className="info-row">
                      <span className="label">Category:</span>
                      <span className="value category">{subscription.category}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Billing:</span>
                      <span className="value">
                        {subscription.billingCycle === 'custom'
                          ? `Every ${subscription.customMonths} months`
                          : subscription.billingCycle}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Cost:</span>
                      <span className="value cost-highlight">
                        {formatCurrency(subscription.cost)}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Monthly:</span>
                      <span className="value">{formatCurrency(monthlyCost)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Start Date:</span>
                      <span className="value">{formatDate(subscription.startDate)}</span>
                    </div>
                    {subscription.endDate && (
                      <div className="info-row">
                        <span className="label">End Date:</span>
                        <span className="value">{formatDate(subscription.endDate)}</span>
                      </div>
                    )}
                    {nextRenewal && subscription.status === 'active' && (
                      <div className="info-row">
                        <span className="label">Next Renewal:</span>
                        <span className="value renewal-highlight">
                          {formatDate(nextRenewal)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => handleEdit(subscription.id)}
                    className="btn btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(subscription)}
                    className="btn btn-toggle"
                  >
                    {subscription.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id)}
                    className="btn btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SubscriptionList;
