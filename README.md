# Subscription & Expense Tracker

A modern, desktop-first web application for tracking recurring subscriptions and fixed expenses. Built with React, TypeScript, and Vite.

![Subscription Tracker](https://img.shields.io/badge/React-18.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)

## 🎯 Features

### Core Functionality
- ✅ **Add, Edit, and Delete Subscriptions** - Manage all your recurring expenses
- ✅ **Multiple Billing Cycles** - Support for monthly, yearly, and custom billing periods
- ✅ **Active/Inactive Status** - Toggle subscription status without deletion
- ✅ **Expense Calculations** - Automatic monthly and yearly cost aggregation
- ✅ **Upcoming Renewals** - Visual notifications for subscriptions renewing within 30 days
- ✅ **Category Filtering** - Filter subscriptions by category or status
- ✅ **Expense Summary Dashboard** - Detailed breakdown of spending by category
- ✅ **Data Persistence** - All data saved to browser localStorage

### User Interface
- 🎨 Modern, gradient-based design
- 📱 Responsive layout (desktop-first)
- 🔔 Visual renewal reminders
- 📊 Interactive expense charts and breakdowns
- 💡 Smart insights about spending habits

## 🏗️ Architecture & Design

### Technology Stack
- **React 18.2** - UI framework
- **TypeScript** - Type safety and better developer experience
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server
- **CSS3** - Modern styling with CSS variables

### Project Structure
```
subscription-expense-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── SubscriptionList.tsx
│   │   ├── SubscriptionList.css
│   │   ├── SubscriptionForm.tsx
│   │   ├── SubscriptionForm.css
│   │   ├── ExpenseSummary.tsx
│   │   └── ExpenseSummary.css
│   ├── types/              # TypeScript type definitions
│   │   └── subscription.ts
│   ├── utils/              # Utility functions
│   │   ├── calculations.ts # Expense calculation logic
│   │   └── storage.ts      # localStorage management
│   ├── App.tsx             # Main app component with routing
│   ├── App.css
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 📊 Data Models

### Subscription Type
```typescript
interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  cost: number;
  billingCycle: BillingCycle;
  customMonths?: number;
  startDate: string;
  endDate?: string;
  status: SubscriptionStatus;
}
```

### Supporting Types
- **BillingCycle**: `'monthly' | 'yearly' | 'custom'`
- **SubscriptionStatus**: `'active' | 'inactive'`
- **SubscriptionCategory**: `'streaming' | 'software' | 'utilities' | 'health' | 'education' | 'other'`

## 🧮 Recurring Calculations Explained

### Monthly Cost Calculation
The application normalizes all subscription costs to a monthly basis:

```typescript
Monthly Cost = {
  monthly: cost
  yearly: cost / 12
  custom: cost / customMonths
}
```

This allows for accurate comparison and aggregation across different billing cycles.

### Yearly Cost Calculation
```typescript
Yearly Cost = Monthly Cost × 12
```

### Next Renewal Date
The algorithm calculates the next renewal date by:
1. Starting from the subscription's start date
2. Adding billing cycle months repeatedly until the date is in the future
3. Checking against the end date (if specified)
4. Returning null if subscription is inactive or past end date

```typescript
function getNextRenewalDate(subscription: Subscription): Date | null {
  // If inactive or ended, no renewal
  if (subscription.status === 'inactive' || isPastEndDate(subscription)) {
    return null;
  }
  
  // Add billing cycle months until date is in future
  let nextRenewal = new Date(subscription.startDate);
  while (nextRenewal <= today) {
    nextRenewal.setMonth(nextRenewal.getMonth() + billingMonths);
  }
  
  return nextRenewal;
}
```

### Upcoming Renewals
Subscriptions renewing within the next 30 days are:
- Automatically detected
- Sorted by days until renewal
- Displayed prominently at the top of the subscription list

### Expense Aggregation
Total monthly expenses = Sum of all active subscriptions' monthly costs
Total yearly expenses = Total monthly expenses × 12

Category breakdown calculates the monthly cost for each category and shows percentage distribution.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd subscription-expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173` (or the URL shown in terminal)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📱 Application Screens

### 1. Subscription List (Home Page)
**Route**: `/`

**Features**:
- Grid display of all subscriptions
- Filter by status (all/active/inactive)
- Filter by category
- Upcoming renewals notification section (30-day window)
- Quick actions: Edit, Toggle Status, Delete
- Visual distinction between active and inactive subscriptions

### 2. Add/Edit Subscription
**Routes**: `/add`, `/edit/:id`

**Features**:
- Form validation with error messages
- Support for all billing cycle types
- Optional end date field
- Status selection
- Responsive form layout

### 3. Expense Summary
**Route**: `/summary`

**Features**:
- Three summary cards showing:
  - Total monthly expenses
  - Total yearly expenses
  - Active vs total subscription count
- Category breakdown with visual bar charts
- Detailed table of all active subscriptions
- Smart insights section with:
  - Average cost per subscription
  - Daily spending estimate
  - 5-year projection
  - Warnings about inactive subscriptions

## 💾 Data Storage

The application uses **localStorage** for data persistence:
- Data is automatically saved on every change
- Initial mock data is provided on first load
- No backend or authentication required
- Data persists across browser sessions

**Storage Key**: `subscription-tracker-data`

### Mock Data
The application includes 8 sample subscriptions covering various categories and billing cycles to demonstrate all features.

## 🎨 Design Principles

1. **Desktop-First**: Optimized for desktop viewing with responsive mobile support
2. **Visual Hierarchy**: Important information (costs, renewals) is visually prominent
3. **Clear Distinctions**: Active vs inactive subscriptions are easy to distinguish
4. **Progressive Disclosure**: Details are available without overwhelming the user
5. **Immediate Feedback**: All actions (add, edit, delete) reflect instantly
6. **Accessibility**: Semantic HTML, clear labels, and keyboard navigation

## 🔄 State Management

State is managed using React's built-in hooks:
- `useState` for component-level state
- `useEffect` for side effects (loading/saving data)
- Props drilling for data flow (appropriate for app size)
- No external state management library needed

## 🧪 Testing the Application

### Test Scenarios

1. **Add a New Subscription**
   - Click "+ Add Subscription"
   - Fill in all required fields
   - Try different billing cycles
   - Verify it appears in the list

2. **Edit Subscription**
   - Click "Edit" on any subscription
   - Modify fields
   - Verify changes are reflected

3. **Toggle Status**
   - Click "Deactivate" on an active subscription
   - Verify it appears grayed out
   - Check that totals update correctly

4. **Filter Subscriptions**
   - Use status filter dropdown
   - Use category filter dropdown
   - Verify correct subscriptions display

5. **View Expense Summary**
   - Navigate to "Summary" page
   - Verify all calculations are correct
   - Check category breakdown percentages

6. **Test Renewal Notifications**
   - Add a subscription with start date 10 days ago and monthly billing
   - Verify it appears in upcoming renewals section

## 🚨 Error Handling

The application includes comprehensive error handling:
- Form validation with clear error messages
- localStorage error catching with fallback to mock data
- Confirmation dialogs for destructive actions (delete)
- Required field indicators

## 🔮 Future Enhancements

Potential improvements for future versions:
- Export data to CSV/PDF
- Import subscriptions from files
- Currency selection
- Multiple reminder thresholds
- Subscription sharing/collaboration
- Budget alerts
- Historical data tracking
- Dark mode

## 📄 License

This project is open source and available for personal and commercial use.

## 👨‍💻 Development Notes

### Key Implementation Details

1. **Date Handling**: All dates are stored as ISO strings for consistency
2. **ID Generation**: Simple timestamp-based ID generation (sufficient for client-side app)
3. **Currency**: Hardcoded to USD with `Intl.NumberFormat` for formatting
4. **Routing**: React Router v6 for declarative routing
5. **Styling**: Component-scoped CSS with global CSS variables for theming

### Performance Considerations

- Calculations are performed on-demand (not cached) - acceptable for typical subscription counts
- LocalStorage is accessed on mount and updates only - minimal performance impact
- Re-renders are optimized through proper React patterns

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
