/**
 * Subscription & Expense Tracker Application
 * 
 * This application helps users track recurring subscriptions and fixed expenses.
 * 
 * DATA MODEL:
 * - Subscription: { id, name, category, cost, billingCycle, customMonths, startDate, endDate, status }
 * 
 * BILLING CYCLE CALCULATIONS:
 * - Monthly: cost as-is
 * - Yearly: cost / 12 for monthly equivalent
 * - Custom (n months): cost / n for monthly equivalent
 * 
 * RENEWAL DATE CALCULATION:
 * - Based on startDate + billing cycle intervals
 * - Finds next occurrence after current date
 */

// ============================================
// Data Store & Mock Data
// ============================================

const CATEGORIES = {
    streaming: { icon: '🎬', name: 'Streaming' },
    software: { icon: '💻', name: 'Software' },
    utilities: { icon: '⚡', name: 'Utilities' },
    entertainment: { icon: '🎮', name: 'Entertainment' },
    health: { icon: '💪', name: 'Health & Fitness' },
    education: { icon: '📚', name: 'Education' },
    other: { icon: '📦', name: 'Other' }
};

// In-memory data store
let subscriptions = [];
let deleteTargetId = null;

// Generate unique ID
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Initialize with mock data
function initializeMockData() {
    const today = new Date();
    
    subscriptions = [
        {
            id: generateId(),
            name: 'Netflix',
            category: 'streaming',
            cost: 15.99,
            billingCycle: 'monthly',
            customMonths: null,
            startDate: '2024-01-15',
            endDate: null,
            status: 'active'
        },
        {
            id: generateId(),
            name: 'Spotify Premium',
            category: 'streaming',
            cost: 9.99,
            billingCycle: 'monthly',
            customMonths: null,
            startDate: '2024-02-01',
            endDate: null,
            status: 'active'
        },
        {
            id: generateId(),
            name: 'Adobe Creative Cloud',
            category: 'software',
            cost: 599.88,
            billingCycle: 'yearly',
            customMonths: null,
            startDate: '2024-06-01',
            endDate: null,
            status: 'active'
        },
        {
            id: generateId(),
            name: 'Microsoft 365',
            category: 'software',
            cost: 99.99,
            billingCycle: 'yearly',
            customMonths: null,
            startDate: '2024-03-15',
            endDate: null,
            status: 'active'
        },
        {
            id: generateId(),
            name: 'Gym Membership',
            category: 'health',
            cost: 49.99,
            billingCycle: 'monthly',
            customMonths: null,
            startDate: '2024-01-01',
            endDate: null,
            status: 'active'
        },
        {
            id: generateId(),
            name: 'AWS Services',
            category: 'software',
            cost: 150.00,
            billingCycle: 'monthly',
            customMonths: null,
            startDate: '2023-06-01',
            endDate: null,
            status: 'active'
        },
        {
            id: generateId(),
            name: 'Coursera Plus',
            category: 'education',
            cost: 399.00,
            billingCycle: 'yearly',
            customMonths: null,
            startDate: '2024-09-01',
            endDate: null,
            status: 'active'
        },
        {
            id: generateId(),
            name: 'Disney+',
            category: 'streaming',
            cost: 13.99,
            billingCycle: 'monthly',
            customMonths: null,
            startDate: '2024-04-01',
            endDate: '2024-10-01',
            status: 'inactive'
        },
        {
            id: generateId(),
            name: 'Internet Service',
            category: 'utilities',
            cost: 79.99,
            billingCycle: 'monthly',
            customMonths: null,
            startDate: '2023-01-01',
            endDate: null,
            status: 'active'
        },
        {
            id: generateId(),
            name: 'Cloud Storage Plan',
            category: 'software',
            cost: 29.97,
            billingCycle: 'custom',
            customMonths: 3,
            startDate: '2024-01-01',
            endDate: null,
            status: 'active'
        }
    ];
    
    saveToLocalStorage();
}

// ============================================
// Local Storage Operations
// ============================================

function saveToLocalStorage() {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('subscriptions');
    if (stored) {
        subscriptions = JSON.parse(stored);
    } else {
        initializeMockData();
    }
}

// ============================================
// Cost Calculation Functions
// ============================================

/**
 * Calculate monthly cost from any billing cycle
 * @param {Object} sub - Subscription object
 * @returns {number} - Monthly cost
 */
function getMonthlyEquivalent(sub) {
    if (sub.status === 'inactive') return 0;
    
    switch (sub.billingCycle) {
        case 'monthly':
            return sub.cost;
        case 'yearly':
            return sub.cost / 12;
        case 'custom':
            return sub.cost / (sub.customMonths || 1);
        default:
            return sub.cost;
    }
}

/**
 * Calculate yearly cost from any billing cycle
 * @param {Object} sub - Subscription object
 * @returns {number} - Yearly cost
 */
function getYearlyEquivalent(sub) {
    return getMonthlyEquivalent(sub) * 12;
}

/**
 * Get total monthly expenses
 * @returns {number}
 */
function getTotalMonthlyExpenses() {
    return subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, sub) => sum + getMonthlyEquivalent(sub), 0);
}

/**
 * Get total yearly expenses
 * @returns {number}
 */
function getTotalYearlyExpenses() {
    return getTotalMonthlyExpenses() * 12;
}

// ============================================
// Date Calculation Functions
// ============================================

/**
 * Calculate next renewal date based on start date and billing cycle
 * @param {Object} sub - Subscription object
 * @returns {Date|null} - Next renewal date or null if inactive/ended
 */
function getNextRenewalDate(sub) {
    if (sub.status === 'inactive') return null;
    if (sub.endDate && new Date(sub.endDate) < new Date()) return null;
    
    const startDate = new Date(sub.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let monthsPerCycle;
    switch (sub.billingCycle) {
        case 'monthly':
            monthsPerCycle = 1;
            break;
        case 'yearly':
            monthsPerCycle = 12;
            break;
        case 'custom':
            monthsPerCycle = sub.customMonths || 1;
            break;
        default:
            monthsPerCycle = 1;
    }
    
    // Calculate how many cycles have passed
    const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 
                     + (today.getMonth() - startDate.getMonth());
    
    let cyclesPassed = Math.floor(monthsDiff / monthsPerCycle);
    if (cyclesPassed < 0) cyclesPassed = 0;
    
    // Calculate next renewal
    let nextRenewal = new Date(startDate);
    nextRenewal.setMonth(startDate.getMonth() + (cyclesPassed * monthsPerCycle));
    
    // If next renewal is in the past or today, add one more cycle
    while (nextRenewal <= today) {
        nextRenewal.setMonth(nextRenewal.getMonth() + monthsPerCycle);
    }
    
    // Check if it exceeds end date
    if (sub.endDate && nextRenewal > new Date(sub.endDate)) {
        return null;
    }
    
    return nextRenewal;
}

/**
 * Get days until next renewal
 * @param {Object} sub - Subscription object
 * @returns {number|null} - Days until renewal or null
 */
function getDaysUntilRenewal(sub) {
    const renewalDate = getNextRenewalDate(sub);
    if (!renewalDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

/**
 * Get subscriptions with upcoming renewals (next 7 days)
 * @returns {Array}
 */
function getUpcomingRenewals() {
    return subscriptions
        .filter(sub => {
            const days = getDaysUntilRenewal(sub);
            return days !== null && days <= 7;
        })
        .sort((a, b) => {
            const daysA = getDaysUntilRenewal(a);
            const daysB = getDaysUntilRenewal(b);
            return daysA - daysB;
        });
}

// ============================================
// Utility Functions
// ============================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCycle(sub) {
    switch (sub.billingCycle) {
        case 'monthly':
            return 'Monthly';
        case 'yearly':
            return 'Yearly';
        case 'custom':
            return `Every ${sub.customMonths} months`;
        default:
            return sub.billingCycle;
    }
}

function getCategoryIcon(category) {
    return CATEGORIES[category]?.icon || '📦';
}

// ============================================
// UI Rendering Functions
// ============================================

function renderSummaryCards() {
    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const upcomingCount = getUpcomingRenewals().length;
    
    document.getElementById('monthly-total').textContent = formatCurrency(getTotalMonthlyExpenses());
    document.getElementById('yearly-total').textContent = formatCurrency(getTotalYearlyExpenses());
    document.getElementById('active-count').textContent = activeCount;
    document.getElementById('upcoming-count').textContent = upcomingCount;
    
    // Also update summary view
    document.getElementById('summary-monthly').textContent = formatCurrency(getTotalMonthlyExpenses());
    document.getElementById('summary-yearly').textContent = formatCurrency(getTotalYearlyExpenses());
}

function renderUpcomingRenewals() {
    const container = document.getElementById('upcoming-renewals');
    const renewals = getUpcomingRenewals();
    
    if (renewals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✨</div>
                <p>No upcoming renewals in the next 7 days</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = renewals.map(sub => {
        const days = getDaysUntilRenewal(sub);
        const renewalDate = getNextRenewalDate(sub);
        const isUrgent = days <= 3;
        
        return `
            <div class="renewal-item ${isUrgent ? 'urgent' : ''}">
                <div class="renewal-info">
                    <div class="renewal-icon">${getCategoryIcon(sub.category)}</div>
                    <div class="renewal-details">
                        <h4>${sub.name}</h4>
                        <span>${formatCurrency(sub.cost)} • ${formatCycle(sub)}</span>
                    </div>
                </div>
                <div class="renewal-date">
                    <div class="date">${formatDate(renewalDate)}</div>
                    <div class="days-left">${days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `In ${days} days`}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderRecentSubscriptions() {
    const container = document.getElementById('recent-subscriptions');
    const recent = subscriptions.slice(0, 6);
    
    if (recent.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No subscriptions yet. Add your first one!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recent.map(sub => {
        const renewalDate = getNextRenewalDate(sub);
        
        return `
            <div class="subscription-card ${sub.status}">
                <div class="sub-card-header">
                    <div class="sub-card-title">
                        <div class="sub-card-icon">${getCategoryIcon(sub.category)}</div>
                        <div>
                            <h4>${sub.name}</h4>
                            <span class="sub-card-category">${sub.category}</span>
                        </div>
                    </div>
                    <div class="sub-card-cost">
                        <div class="amount">${formatCurrency(sub.cost)}</div>
                        <div class="cycle">${formatCycle(sub)}</div>
                    </div>
                </div>
                <div class="sub-card-details">
                    <div class="sub-detail">
                        <div class="sub-detail-label">Status</div>
                        <div class="sub-detail-value">${sub.status === 'active' ? '🟢 Active' : '⚫ Inactive'}</div>
                    </div>
                    <div class="sub-detail">
                        <div class="sub-detail-label">Next Renewal</div>
                        <div class="sub-detail-value">${renewalDate ? formatDate(renewalDate) : 'N/A'}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderSubscriptionsTable() {
    const container = document.getElementById('subscriptions-table-body');
    
    // Get filter values
    const statusFilter = document.getElementById('filter-status').value;
    const categoryFilter = document.getElementById('filter-category').value;
    const cycleFilter = document.getElementById('filter-cycle').value;
    
    // Apply filters
    let filtered = subscriptions.filter(sub => {
        if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && sub.category !== categoryFilter) return false;
        if (cycleFilter !== 'all' && sub.billingCycle !== cycleFilter) return false;
        return true;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <p>No subscriptions match your filters</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(sub => {
        const renewalDate = getNextRenewalDate(sub);
        const daysUntil = getDaysUntilRenewal(sub);
        const isUpcoming = daysUntil !== null && daysUntil <= 7;
        
        return `
            <tr class="${sub.status}">
                <td>
                    <div class="table-name">
                        <div class="table-icon">${getCategoryIcon(sub.category)}</div>
                        <span>${sub.name}</span>
                    </div>
                </td>
                <td><span class="category-badge">${sub.category}</span></td>
                <td><strong>${formatCurrency(sub.cost)}</strong></td>
                <td>${formatCycle(sub)}</td>
                <td>
                    ${renewalDate ? `
                        <span ${isUpcoming ? 'style="color: var(--warning-color); font-weight: 600;"' : ''}>
                            ${formatDate(renewalDate)}
                            ${isUpcoming ? `<br><small>(${daysUntil === 0 ? 'Today' : daysUntil + ' days'})</small>` : ''}
                        </span>
                    ` : 'N/A'}
                </td>
                <td><span class="status-badge ${sub.status}">${sub.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="editSubscription('${sub.id}')" title="Edit">✏️</button>
                        <button class="action-btn delete" onclick="confirmDelete('${sub.id}')" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderCategoryBreakdown() {
    const container = document.getElementById('category-breakdown');
    
    // Group by category
    const categoryData = {};
    subscriptions.filter(s => s.status === 'active').forEach(sub => {
        if (!categoryData[sub.category]) {
            categoryData[sub.category] = { count: 0, monthlyCost: 0 };
        }
        categoryData[sub.category].count++;
        categoryData[sub.category].monthlyCost += getMonthlyEquivalent(sub);
    });
    
    const categories = Object.entries(categoryData).sort((a, b) => b[1].monthlyCost - a[1].monthlyCost);
    
    if (categories.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p>No active subscriptions to analyze</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = categories.map(([category, data]) => `
        <div class="category-item">
            <div class="category-info">
                <div class="category-icon ${category}">${getCategoryIcon(category)}</div>
                <div>
                    <div class="category-name">${CATEGORIES[category]?.name || category}</div>
                    <div class="category-count">${data.count} subscription${data.count > 1 ? 's' : ''}</div>
                </div>
            </div>
            <div class="category-cost">
                <div class="amount">${formatCurrency(data.monthlyCost)}</div>
                <div class="label">per month</div>
            </div>
        </div>
    `).join('');
}

function renderCycleBreakdown() {
    const container = document.getElementById('cycle-breakdown');
    
    // Group by billing cycle
    const cycleData = { monthly: { count: 0, total: 0 }, yearly: { count: 0, total: 0 }, custom: { count: 0, total: 0 } };
    
    subscriptions.filter(s => s.status === 'active').forEach(sub => {
        cycleData[sub.billingCycle].count++;
        cycleData[sub.billingCycle].total += sub.cost;
    });
    
    container.innerHTML = `
        <div class="cycle-item">
            <div class="cycle-name">Monthly</div>
            <div class="cycle-amount">${formatCurrency(cycleData.monthly.total)}</div>
            <div class="cycle-count">${cycleData.monthly.count} subscription${cycleData.monthly.count !== 1 ? 's' : ''}</div>
        </div>
        <div class="cycle-item">
            <div class="cycle-name">Yearly</div>
            <div class="cycle-amount">${formatCurrency(cycleData.yearly.total)}</div>
            <div class="cycle-count">${cycleData.yearly.count} subscription${cycleData.yearly.count !== 1 ? 's' : ''}</div>
        </div>
        <div class="cycle-item">
            <div class="cycle-name">Custom Cycle</div>
            <div class="cycle-amount">${formatCurrency(cycleData.custom.total)}</div>
            <div class="cycle-count">${cycleData.custom.count} subscription${cycleData.custom.count !== 1 ? 's' : ''}</div>
        </div>
    `;
}

function renderTimelineChart() {
    const container = document.getElementById('timeline-chart');
    
    // Calculate monthly costs for next 12 months
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        let cost = 0;
        
        subscriptions.filter(s => s.status === 'active').forEach(sub => {
            const startDate = new Date(sub.startDate);
            const endDate = sub.endDate ? new Date(sub.endDate) : null;
            
            // Check if subscription is active in this month
            if (startDate <= date && (!endDate || endDate >= date)) {
                cost += getMonthlyEquivalent(sub);
            }
        });
        
        months.push({ name: monthName, cost });
    }
    
    const maxCost = Math.max(...months.map(m => m.cost), 1);
    
    container.innerHTML = `
        <div class="timeline-bars">
            ${months.map(month => {
                const heightPercent = (month.cost / maxCost) * 100;
                return `
                    <div class="timeline-bar">
                        <div class="bar-value">${formatCurrency(month.cost)}</div>
                        <div class="bar" style="height: ${heightPercent}%"></div>
                        <div class="bar-label">${month.name}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ============================================
// UI Update Function
// ============================================

function updateAllViews() {
    renderSummaryCards();
    renderUpcomingRenewals();
    renderRecentSubscriptions();
    renderSubscriptionsTable();
    renderCategoryBreakdown();
    renderCycleBreakdown();
    renderTimelineChart();
}

// ============================================
// Modal & Form Handling
// ============================================

function openModal(mode = 'add', subscription = null) {
    const modal = document.getElementById('subscription-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('subscription-form');
    
    // Reset form
    form.reset();
    document.getElementById('subscription-id').value = '';
    document.getElementById('custom-cycle-group').style.display = 'none';
    
    // Set default start date to today
    document.getElementById('sub-start-date').value = new Date().toISOString().split('T')[0];
    
    if (mode === 'edit' && subscription) {
        title.textContent = 'Edit Subscription';
        document.getElementById('subscription-id').value = subscription.id;
        document.getElementById('sub-name').value = subscription.name;
        document.getElementById('sub-category').value = subscription.category;
        document.getElementById('sub-cost').value = subscription.cost;
        document.getElementById('sub-cycle').value = subscription.billingCycle;
        document.getElementById('sub-start-date').value = subscription.startDate;
        document.getElementById('sub-end-date').value = subscription.endDate || '';
        document.getElementById('sub-status').value = subscription.status;
        
        if (subscription.billingCycle === 'custom') {
            document.getElementById('custom-cycle-group').style.display = 'block';
            document.getElementById('sub-custom-months').value = subscription.customMonths;
        }
    } else {
        title.textContent = 'Add Subscription';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('subscription-modal').classList.remove('active');
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('subscription-id').value;
    const name = document.getElementById('sub-name').value.trim();
    const category = document.getElementById('sub-category').value;
    const cost = parseFloat(document.getElementById('sub-cost').value);
    const billingCycle = document.getElementById('sub-cycle').value;
    const customMonths = billingCycle === 'custom' ? parseInt(document.getElementById('sub-custom-months').value) : null;
    const startDate = document.getElementById('sub-start-date').value;
    const endDate = document.getElementById('sub-end-date').value || null;
    const status = document.getElementById('sub-status').value;
    
    // Validation
    if (!name || !category || isNaN(cost) || cost < 0 || !startDate) {
        alert('Please fill in all required fields correctly.');
        return;
    }
    
    if (billingCycle === 'custom' && (!customMonths || customMonths < 1)) {
        alert('Please specify a valid custom cycle duration.');
        return;
    }
    
    const subscriptionData = {
        name,
        category,
        cost,
        billingCycle,
        customMonths,
        startDate,
        endDate,
        status
    };
    
    if (id) {
        // Update existing
        const index = subscriptions.findIndex(s => s.id === id);
        if (index !== -1) {
            subscriptions[index] = { ...subscriptions[index], ...subscriptionData };
        }
    } else {
        // Add new
        subscriptions.unshift({
            id: generateId(),
            ...subscriptionData
        });
    }
    
    saveToLocalStorage();
    closeModal();
    updateAllViews();
}

function editSubscription(id) {
    const subscription = subscriptions.find(s => s.id === id);
    if (subscription) {
        openModal('edit', subscription);
    }
}

function confirmDelete(id) {
    const subscription = subscriptions.find(s => s.id === id);
    if (!subscription) return;
    
    deleteTargetId = id;
    document.getElementById('delete-sub-name').textContent = subscription.name;
    document.getElementById('delete-modal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
    deleteTargetId = null;
}

function deleteSubscription() {
    if (deleteTargetId) {
        subscriptions = subscriptions.filter(s => s.id !== deleteTargetId);
        saveToLocalStorage();
        closeDeleteModal();
        updateAllViews();
    }
}

// ============================================
// Navigation
// ============================================

function switchView(viewId) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewId) {
            item.classList.add('active');
        }
    });
    
    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewId}-view`).classList.add('active');
}

// ============================================
// Event Listeners
// ============================================

function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            switchView(item.dataset.view);
        });
    });
    
    // Add subscription buttons
    document.getElementById('add-subscription-btn').addEventListener('click', () => openModal('add'));
    document.getElementById('add-subscription-btn-2').addEventListener('click', () => openModal('add'));
    
    // Modal controls
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('subscription-form').addEventListener('submit', handleFormSubmit);
    
    // Delete modal controls
    document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);
    document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', deleteSubscription);
    
    // Billing cycle change (show/hide custom months)
    document.getElementById('sub-cycle').addEventListener('change', (e) => {
        const customGroup = document.getElementById('custom-cycle-group');
        customGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
    });
    
    // Filters
    document.getElementById('filter-status').addEventListener('change', renderSubscriptionsTable);
    document.getElementById('filter-category').addEventListener('change', renderSubscriptionsTable);
    document.getElementById('filter-cycle').addEventListener('change', renderSubscriptionsTable);
    
    // Close modals on overlay click
    document.getElementById('subscription-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
    
    document.getElementById('delete-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeDeleteModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeDeleteModal();
        }
    });
}

// ============================================
// Application Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initializeEventListeners();
    updateAllViews();
    
    console.log('Subscription & Expense Tracker initialized');
    console.log(`Loaded ${subscriptions.length} subscriptions`);
});

// Expose functions for inline onclick handlers
window.editSubscription = editSubscription;
window.confirmDelete = confirmDelete;
