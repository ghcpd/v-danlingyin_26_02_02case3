import React from 'react';
import { Subscription, SubscriptionCategory } from '../types/subscription';
import {
  calculateExpenseSummary,
  calculateMonthlyCost,
  calculateYearlyCost,
  formatCurrency,
} from '../utils/calculations';
import './ExpenseSummary.css';

interface ExpenseSummaryProps {
  subscriptions: Subscription[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ subscriptions }) => {
  const summary = calculateExpenseSummary(subscriptions);
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

  const categoryLabels: Record<SubscriptionCategory, string> = {
    streaming: '🎬 Streaming',
    software: '💻 Software',
    utilities: '⚡ Utilities',
    health: '💪 Health',
    education: '📚 Education',
    other: '📦 Other',
  };

  return (
    <div className="expense-summary-container">
      <h2>Expense Summary</h2>

      <div className="summary-cards">
        <div className="summary-card total-monthly">
          <div className="card-icon">💵</div>
          <div className="card-content">
            <h3>Total Monthly</h3>
            <p className="amount">{formatCurrency(summary.totalMonthly)}</p>
            <p className="subtitle">{summary.activeCount} active subscriptions</p>
          </div>
        </div>

        <div className="summary-card total-yearly">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>Total Yearly</h3>
            <p className="amount">{formatCurrency(summary.totalYearly)}</p>
            <p className="subtitle">Estimated annual cost</p>
          </div>
        </div>

        <div className="summary-card subscription-count">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Subscriptions</h3>
            <p className="amount">
              {summary.activeCount} / {summary.activeCount + summary.inactiveCount}
            </p>
            <p className="subtitle">Active / Total</p>
          </div>
        </div>
      </div>

      <div className="breakdown-section">
        <h3>Category Breakdown</h3>
        <div className="category-breakdown">
          {(Object.keys(categoryLabels) as SubscriptionCategory[]).map(category => {
            const categoryTotal = summary.categoryBreakdown[category] || 0;
            const percentage =
              summary.totalMonthly > 0
                ? (categoryTotal / summary.totalMonthly) * 100
                : 0;

            if (categoryTotal === 0) return null;

            return (
              <div key={category} className="category-item">
                <div className="category-header">
                  <span className="category-name">{categoryLabels[category]}</span>
                  <span className="category-amount">
                    {formatCurrency(categoryTotal)}/mo
                  </span>
                </div>
                <div className="category-bar-container">
                  <div
                    className="category-bar"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="category-percentage">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="detailed-list">
        <h3>Active Subscriptions Detail</h3>
        {activeSubscriptions.length === 0 ? (
          <p className="empty-message">No active subscriptions</p>
        ) : (
          <table className="subscriptions-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Billing Cycle</th>
                <th>Cost</th>
                <th>Monthly</th>
                <th>Yearly</th>
              </tr>
            </thead>
            <tbody>
              {activeSubscriptions.map(sub => {
                const monthlyCost = calculateMonthlyCost(sub);
                const yearlyCost = calculateYearlyCost(sub);

                return (
                  <tr key={sub.id}>
                    <td className="name-cell">{sub.name}</td>
                    <td className="category-cell">
                      <span className="category-badge">{sub.category}</span>
                    </td>
                    <td>
                      {sub.billingCycle === 'custom'
                        ? `${sub.customMonths}mo`
                        : sub.billingCycle}
                    </td>
                    <td className="cost-cell">{formatCurrency(sub.cost)}</td>
                    <td className="cost-cell">{formatCurrency(monthlyCost)}</td>
                    <td className="cost-cell">{formatCurrency(yearlyCost)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan={4}>Totals</td>
                <td className="cost-cell total">
                  {formatCurrency(summary.totalMonthly)}
                </td>
                <td className="cost-cell total">
                  {formatCurrency(summary.totalYearly)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <div className="insights-section">
        <h3>💡 Insights</h3>
        <div className="insights">
          {summary.totalMonthly > 0 && (
            <>
              <p>
                • You're spending an average of{' '}
                <strong>
                  {formatCurrency(summary.totalMonthly / summary.activeCount)}
                </strong>{' '}
                per subscription monthly.
              </p>
              <p>
                • Your subscriptions cost you approximately{' '}
                <strong>{formatCurrency(summary.totalMonthly / 30)}</strong> per day.
              </p>
              <p>
                • In 5 years, you'll spend approximately{' '}
                <strong>{formatCurrency(summary.totalYearly * 5)}</strong> on these
                subscriptions.
              </p>
            </>
          )}
          {summary.inactiveCount > 0 && (
            <p className="warning">
              • You have {summary.inactiveCount} inactive subscription
              {summary.inactiveCount > 1 ? 's' : ''}. Consider removing them to keep
              your list clean.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;
