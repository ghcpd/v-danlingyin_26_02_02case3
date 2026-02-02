import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Subscription } from './types/subscription';
import { loadSubscriptions, saveSubscriptions } from './utils/storage';
import SubscriptionList from './components/SubscriptionList';
import SubscriptionForm from './components/SubscriptionForm';
import ExpenseSummary from './components/ExpenseSummary';
import './App.css';

function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const loaded = loadSubscriptions();
    setSubscriptions(loaded);
  }, []);

  useEffect(() => {
    if (subscriptions.length > 0) {
      saveSubscriptions(subscriptions);
    }
  }, [subscriptions]);

  const addSubscription = (subscription: Subscription) => {
    setSubscriptions([...subscriptions, subscription]);
  };

  const updateSubscription = (updatedSub: Subscription) => {
    setSubscriptions(
      subscriptions.map(sub => (sub.id === updatedSub.id ? updatedSub : sub))
    );
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>💰 Subscription & Expense Tracker</h1>
          <nav className="app-nav">
            <Link to="/" className="nav-link">Subscriptions</Link>
            <Link to="/summary" className="nav-link">Summary</Link>
            <Link to="/add" className="nav-link nav-link-primary">+ Add Subscription</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={
                <SubscriptionList
                  subscriptions={subscriptions}
                  onDelete={deleteSubscription}
                  onUpdate={updateSubscription}
                />
              }
            />
            <Route
              path="/add"
              element={
                <SubscriptionForm
                  onSave={addSubscription}
                  onCancel={() => {}}
                />
              }
            />
            <Route
              path="/edit/:id"
              element={
                <SubscriptionForm
                  subscriptions={subscriptions}
                  onSave={updateSubscription}
                  onCancel={() => {}}
                />
              }
            />
            <Route
              path="/summary"
              element={<ExpenseSummary subscriptions={subscriptions} />}
            />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>© 2026 Subscription Tracker - Manage your recurring expenses</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
