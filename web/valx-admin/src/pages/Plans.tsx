import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export default function Plans() {
  const { token } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // This would fetch from /subscriptions/plans.json via API
      // For now, show default plans
      setPlans([
        { id: 'free', name: 'Free', price: 0, features: ['FM', 'TV', 'Free content'] },
        { id: 'premium', name: 'Premium', price: 499, features: ['Movies', 'Courses', 'Ad-free'] },
      ]);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Subscription Plans</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px' }}>
            <h2 style={{ marginBottom: '1rem' }}>{plan.name}</h2>
            <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              ${plan.price / 100} {plan.price === 0 && '/ month'}
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {plan.features.map((feature, idx) => (
                <li key={idx} style={{ padding: '0.5rem 0', borderTop: idx > 0 ? '1px solid #333' : 'none' }}>
                  ✓ {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#1a1a1a', borderRadius: '8px', color: '#ccc' }}>
        <p>Note: Plan editing functionality will be implemented in a future update.</p>
      </div>
    </div>
  );
}

