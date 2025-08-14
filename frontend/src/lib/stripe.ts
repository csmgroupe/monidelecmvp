import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error('Missing Stripe public key');
}

export const stripe = await loadStripe(stripePublicKey);

export const PLANS = {
  STARTER: {
    name: 'Starter',
    id: 'price_starter',
    price: 49,
    annualPrice: 39,
    projectsPerMonth: 10,
    features: [
      'Analyse des plans ≤ 100 m²',
      'Support email (48h)',
      'Mises à jour gratuites'
    ]
  },
  PRO: {
    name: 'Pro',
    id: 'price_pro',
    price: 129,
    annualPrice: 103,
    projectsPerMonth: 30,
    features: [
      'Toutes les fonctionnalités Starter',
      'Surface illimitée',
      'Support prioritaire (24h)',
      '3 utilisateurs inclus'
    ]
  },
  EXPERT: {
    name: 'Expert',
    id: 'price_expert',
    price: 249,
    annualPrice: 199,
    projectsPerMonth: 100,
    features: [
      'Toutes les fonctionnalités Pro',
      'Support dédié (4h)',
      'Formation sur site annuelle',
      '10 utilisateurs inclus'
    ]
  }
};