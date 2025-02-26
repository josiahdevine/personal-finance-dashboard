import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getSubscriptionDetails, 
  createSubscription, 
  cancelSubscription,
  getPaymentMethods,
  addPaymentMethod
} from '../services/stripe';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { format } from '../utils/patchedDateFns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Plan data - normally would come from API
const PLANS = [
  {
    id: 'price_basic_monthly',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    features: [
      '5 Financial accounts',
      'Unlimited transactions',
      '3 Budget categories',
      'Basic reports'
    ]
  },
  {
    id: 'price_premium_monthly',
    name: 'Premium',
    price: 19.99,
    interval: 'month',
    features: [
      'Unlimited accounts',
      'Unlimited transactions',
      'Unlimited budgets',
      'Advanced reports',
      'AI financial insights'
    ]
  },
  {
    id: 'price_business_monthly',
    name: 'Business',
    price: 49.99,
    interval: 'month',
    features: [
      'Unlimited accounts',
      'Unlimited transactions',
      'Unlimited budgets',
      'Advanced reports',
      'AI financial insights',
      'Up to 5 team members',
      'Invoicing capabilities'
    ]
  }
];

// Annual plans
const ANNUAL_PLANS = [
  {
    id: 'price_basic_yearly',
    name: 'Basic Annual',
    price: 99.99,
    interval: 'year',
    features: [
      '5 Financial accounts',
      'Unlimited transactions',
      '3 Budget categories',
      'Basic reports',
      '17% savings vs monthly'
    ]
  },
  {
    id: 'price_premium_yearly',
    name: 'Premium Annual',
    price: 199.99,
    interval: 'year',
    features: [
      'Unlimited accounts',
      'Unlimited transactions',
      'Unlimited budgets',
      'Advanced reports',
      'AI financial insights',
      '17% savings vs monthly'
    ]
  },
  {
    id: 'price_business_yearly',
    name: 'Business Annual',
    price: 499.99,
    interval: 'year',
    features: [
      'Unlimited accounts',
      'Unlimited transactions',
      'Unlimited budgets',
      'Advanced reports',
      'AI financial insights',
      'Up to 5 team members',
      'Invoicing capabilities',
      '17% savings vs monthly'
    ]
  }
];

const SubscriptionPlansMobile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  // Mock data for local development
  const MOCK_SUBSCRIPTION = {
    id: 'sub_mock123456',
    active: true,
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    planDetails: {
      id: 'price_premium_monthly',
      name: 'Premium',
      amount: 1999,
      currency: 'usd',
      interval: 'month',
    },
    cancelAtPeriodEnd: false
  };
  
  const MOCK_PAYMENT_METHODS = [
    {
      id: 'pm_mock123456',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025
      },
      billing_details: {
        name: 'Test User',
        email: currentUser?.email || 'test@example.com'
      },
      isDefault: true
    }
  ];
  
  // Fetch subscription details and payment methods
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Check if Stripe is available
        if (!stripe) {
          console.warn('Stripe is not available - using mock data');
          setUseMockData(true);
          setSubscription(MOCK_SUBSCRIPTION);
          setPaymentMethods(MOCK_PAYMENT_METHODS);
          setSelectedPaymentMethod(MOCK_PAYMENT_METHODS[0].id);
          
          if (MOCK_SUBSCRIPTION.planDetails?.interval === 'year') {
            setBillingCycle('annual');
          }
          
          setLoading(false);
          return;
        }
        
        // Continue with real API calls if Stripe is available
        try {
          const subscriptionData = await getSubscriptionDetails();
          setSubscription(subscriptionData);
          
          if (subscriptionData.active) {
            // Set the billing cycle based on current subscription
            if (subscriptionData.planDetails?.interval === 'year') {
              setBillingCycle('annual');
            }
          }
          
          const methods = await getPaymentMethods();
          setPaymentMethods(methods);
          
          if (methods.length > 0) {
            setSelectedPaymentMethod(methods[0].id);
          }
        } catch (error) {
          console.error('Error fetching subscription data:', error);
          toast.error('Unable to load subscription information. Using mock data instead.');
          setUseMockData(true);
          setSubscription(MOCK_SUBSCRIPTION);
          setPaymentMethods(MOCK_PAYMENT_METHODS);
          setSelectedPaymentMethod(MOCK_PAYMENT_METHODS[0].id);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [currentUser, stripe]);
  
  // Handle plan selection
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };
  
  // Handle payment method selection
  const handlePaymentMethodChange = (e) => {
    if (e.target.value === 'new') {
      setShowNewCardForm(true);
      setSelectedPaymentMethod(null);
    } else {
      setShowNewCardForm(false);
      setSelectedPaymentMethod(e.target.value);
    }
  };
  
  // Handle subscription creation with existing payment method
  const handleSubscribeWithExistingMethod = async () => {
    if (useMockData) {
      setProcessing(true);
      // Simulate API call delay
      setTimeout(() => {
        setSubscription({
          ...MOCK_SUBSCRIPTION,
          planDetails: {
            ...MOCK_SUBSCRIPTION.planDetails,
            id: selectedPlan.id,
            name: selectedPlan.name,
            amount: selectedPlan.price * 100,
            interval: selectedPlan.interval
          }
        });
        setProcessing(false);
        setShowPaymentForm(false);
        toast.success(`Successfully subscribed to ${selectedPlan.name} plan!`);
      }, 1500);
      return;
    }
    
    if (!stripe || !selectedPaymentMethod || !selectedPlan) {
      return;
    }
    
    try {
      setProcessing(true);
      setPaymentError(null);
      
      const result = await createSubscription({
        paymentMethodId: selectedPaymentMethod,
        priceId: selectedPlan.id
      });
      
      if (result.error) {
        setPaymentError(result.error.message);
      } else {
        // Subscription created successfully
        setSubscription(result);
        setShowPaymentForm(false);
        toast.success(`Successfully subscribed to ${selectedPlan.name} plan!`);
      }
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle subscription creation with new card
  const handleSubscribeWithNewCard = async (e) => {
    e.preventDefault();
    
    if (useMockData) {
      setProcessing(true);
      // Simulate API call delay
      setTimeout(() => {
        const newMethod = {
          id: `pm_mock_new${Date.now()}`,
          type: 'card',
          card: {
            brand: 'mastercard',
            last4: '5555',
            exp_month: 12,
            exp_year: 2026
          },
          billing_details: {
            name: 'Test User',
            email: currentUser?.email || 'test@example.com'
          },
          isDefault: false
        };
        
        setPaymentMethods([...paymentMethods, newMethod]);
        
        setSubscription({
          ...MOCK_SUBSCRIPTION,
          planDetails: {
            ...MOCK_SUBSCRIPTION.planDetails,
            id: selectedPlan.id,
            name: selectedPlan.name,
            amount: selectedPlan.price * 100,
            interval: selectedPlan.interval
          }
        });
        
        setProcessing(false);
        setShowPaymentForm(false);
        toast.success(`Successfully subscribed to ${selectedPlan.name} plan with new card!`);
      }, 1500);
      return;
    }
    
    if (!stripe || !elements || !selectedPlan) {
      return;
    }
    
    try {
      setProcessing(true);
      setPaymentError(null);
      
      // Get card element
      const cardElement = elements.getElement(CardElement);
      
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      
      if (error) {
        setPaymentError(error.message);
        setProcessing(false);
        return;
      }
      
      // Create subscription with new payment method
      const result = await createSubscription({
        paymentMethodId: paymentMethod.id,
        priceId: selectedPlan.id
      });
      
      if (result.error) {
        setPaymentError(result.error.message);
      } else {
        // Subscription created successfully
        setSubscription(result);
        
        // Refresh payment methods list
        const updatedMethods = await getPaymentMethods();
        setPaymentMethods(updatedMethods);
        
        setShowPaymentForm(false);
        toast.success(`Successfully subscribed to ${selectedPlan.name} plan!`);
      }
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (useMockData) {
      setProcessing(true);
      // Simulate API call delay
      setTimeout(() => {
        setSubscription({
          ...MOCK_SUBSCRIPTION,
          cancelAtPeriodEnd: true
        });
        setProcessing(false);
        toast.success('Your subscription has been canceled. You will still have access until the end of your billing period.');
      }, 1500);
      return;
    }
    
    if (!subscription?.id) return;
    
    try {
      setProcessing(true);
      const result = await cancelSubscription(subscription.id);
      setSubscription(result);
      toast.success('Your subscription has been canceled. You will still have access until the end of your billing period.');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  // Card element styling
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };
  
  // Get the appropriate plans based on billing cycle
  const plansToDisplay = billingCycle === 'monthly' ? PLANS : ANNUAL_PLANS;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Subscription Plans</h1>
        <p className="text-gray-600 text-sm">
          Choose the plan that best fits your financial management needs.
        </p>
        
        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mt-6 mb-4">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex text-sm">
            <button
              className={`px-3 py-1.5 rounded-md ${billingCycle === 'monthly' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-3 py-1.5 rounded-md ${billingCycle === 'annual' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual <span className="text-green-500 text-xs">Save 17%</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Current Subscription Information */}
      {subscription && subscription.active && (
        <div className="mb-8 bg-blue-50 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Your Current Subscription</h2>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">
              Status: <span className="font-medium text-green-600 capitalize">{subscription.status}</span>
            </p>
            <p className="text-sm text-gray-600">
              Plan: <span className="font-medium">{subscription.planDetails?.name || 'Premium'}</span>
            </p>
            <p className="text-sm text-gray-600">
              Billing Period Ends: <span className="font-medium">
                {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
              </span>
            </p>
          </div>
          
          {subscription.cancelAtPeriodEnd ? (
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm">
              <p className="text-yellow-800">
                Your subscription has been canceled and will end on {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}.
              </p>
              <button 
                className="mt-2 text-blue-600 hover:underline focus:outline-none text-sm"
                onClick={() => navigate('/contact')}
              >
                Contact us to reactivate
              </button>
            </div>
          ) : (
            <div className="flex justify-center mt-4">
              <button
                className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                onClick={handleCancelSubscription}
                disabled={processing}
              >
                Cancel Subscription
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Plans Display - Horizontal swipe cards on mobile */}
      {(!subscription || !subscription.active || subscription.cancelAtPeriodEnd) && (
        <div className="overflow-x-auto pb-4 mb-8 -mx-4 px-4">
          <div className="flex space-x-4 w-max">
            {plansToDisplay.map((plan) => (
              <div 
                key={plan.id}
                className={`border rounded-lg shadow-sm p-4 flex flex-col w-[280px] ${
                  selectedPlan?.id === plan.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-2xl font-bold">${plan.price}</span>
                    <span className="text-gray-500 text-sm">/{plan.interval}</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                  onClick={() => handleSelectPlan(plan)}
                >
                  {subscription && subscription.active && subscription.cancelAtPeriodEnd
                    ? 'Reactivate'
                    : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
          {/* Scroll indicator */}
          <div className="flex justify-center mt-4">
            <div className="space-x-1">
              {plansToDisplay.map((_, idx) => (
                <span key={idx} className="inline-block h-1.5 w-1.5 rounded-full bg-gray-300"></span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Form */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Complete Subscription</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowPaymentForm(false)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-5">
              <p className="text-gray-600 text-sm">
                <span className="font-medium">{selectedPlan?.name}</span> plan at <span className="font-medium">${selectedPlan?.price}/{selectedPlan?.interval}</span>
              </p>
            </div>
            
            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                {paymentError}
              </div>
            )}
            
            {paymentMethods.length > 0 && (
              <div className="mb-5">
                <label className="block text-gray-700 text-sm mb-2">Payment Method</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedPaymentMethod || ''}
                  onChange={handlePaymentMethodChange}
                >
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)} ending in {method.card.last4}
                    </option>
                  ))}
                  <option value="new">+ Add new card</option>
                </select>
              </div>
            )}
            
            {(showNewCardForm || paymentMethods.length === 0) && (
              <form onSubmit={handleSubscribeWithNewCard}>
                <div className="mb-5">
                  <label className="block text-gray-700 text-sm mb-2">Card Details</label>
                  <div className="border border-gray-300 rounded-md p-3">
                    <CardElement options={cardElementOptions} />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                  disabled={!stripe || processing}
                >
                  {processing ? 'Processing...' : 'Subscribe Now'}
                </button>
              </form>
            )}
            
            {!showNewCardForm && paymentMethods.length > 0 && (
              <button
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                onClick={handleSubscribeWithExistingMethod}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Subscribe Now'}
              </button>
            )}
            
            <p className="mt-4 text-xs text-gray-500 text-center">
              By subscribing, you agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlansMobile; 