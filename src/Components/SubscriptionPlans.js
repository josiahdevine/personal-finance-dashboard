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

const SubscriptionPlans = () => {
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
  
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  // Fetch subscription details and payment methods
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
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
        
        toast.error('Unable to load subscription information');
      } finally {
        setLoading(false);
      }
    }
    
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);
  
  // Handle plan selection
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
    setPaymentError(null);
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
    if (!selectedPlan || !selectedPaymentMethod) return;
    
    try {
      setProcessing(true);
      
      const result = await createSubscription({
        priceId: selectedPlan.id,
        paymentMethodId: selectedPaymentMethod
      });
      
      if (result.status === 'active' || result.status === 'trialing') {
        toast.success('Subscription activated successfully!');
        setSubscription({
          ...result,
          active: true,
          planDetails: selectedPlan
        });
        setShowPaymentForm(false);
      } else if (result.clientSecret) {
        // Subscription requires additional action
        const { error } = await stripe.confirmCardPayment(result.clientSecret);
        
        if (error) {
          throw new Error(error.message);
        } else {
          toast.success('Subscription activated successfully!');
          setSubscription({
            ...result,
            active: true,
            planDetails: selectedPlan
          });
          setShowPaymentForm(false);
        }
      }
    } catch (error) {
      
      setPaymentError(error.message);
      toast.error('Failed to activate subscription');
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle subscription creation with new card
  const handleSubscribeWithNewCard = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements || !selectedPlan) {
      return;
    }
    
    try {
      setProcessing(true);
      
      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // First add the payment method to the customer
      await addPaymentMethod(paymentMethod.id);
      
      // Then create subscription with this payment method
      const result = await createSubscription({
        priceId: selectedPlan.id,
        paymentMethodId: paymentMethod.id
      });
      
      if (result.status === 'active' || result.status === 'trialing') {
        toast.success('Subscription activated successfully!');
        setSubscription({
          ...result,
          active: true,
          planDetails: selectedPlan
        });
        setShowPaymentForm(false);
        
        // Update payment methods list
        const methods = await getPaymentMethods();
        setPaymentMethods(methods);
      } else if (result.clientSecret) {
        // Subscription requires additional action
        const { error } = await stripe.confirmCardPayment(result.clientSecret);
        
        if (error) {
          throw new Error(error.message);
        } else {
          toast.success('Subscription activated successfully!');
          setSubscription({
            ...result,
            active: true,
            planDetails: selectedPlan
          });
          setShowPaymentForm(false);
          
          // Update payment methods list
          const methods = await getPaymentMethods();
          setPaymentMethods(methods);
        }
      }
    } catch (error) {
      
      setPaymentError(error.message);
      toast.error('Failed to activate subscription');
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return;
    }
    
    try {
      setLoading(true);
      const result = await cancelSubscription();
      
      if (result.canceled) {
        toast.success('Subscription canceled. You will have access until the end of your billing period.');
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: new Date(result.currentPeriodEnd)
        });
      }
    } catch (error) {
      
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
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
      <div className="flex justify-center items-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Subscription Plans</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose the plan that best fits your financial management needs. Upgrade anytime to unlock more features.
        </p>
        
        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mt-8 mb-4">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              className={`px-4 py-2 rounded-md ${billingCycle === 'monthly' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
              onClick={() => setBillingCycle('monthly')} onKeyDown={() => setBillingCycle('monthly')} role="button" tabIndex={0}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-md ${billingCycle === 'annual' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
              onClick={() => setBillingCycle('annual')} onKeyDown={() => setBillingCycle('annual')} role="button" tabIndex={0}
            >
              Annual <span className="text-green-500 text-sm">Save 17%</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Current Subscription Information */}
      {subscription && subscription.active && (
        <div className="mb-12 bg-blue-50 p-6 rounded-lg shadow-sm max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Your Current Subscription</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 mb-2">Status: <span className="font-medium text-green-600 capitalize">{subscription.status}</span></p>
              <p className="text-gray-600 mb-2">Plan: <span className="font-medium">{subscription.planDetails?.name || 'Premium'}</span></p>
              <p className="text-gray-600">
                Billing Period Ends: <span className="font-medium">
                  {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
                </span>
              </p>
            </div>
            <div>
              {subscription.cancelAtPeriodEnd ? (
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                  <p className="text-yellow-800">
                    Your subscription has been canceled and will end on {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}.
                  </p>
                  <button 
                    className="mt-3 text-blue-600 hover:underline focus:outline-none"
                    onClick={() => navigate('/contact')} onKeyDown={() => navigate('/contact')} role="button" tabIndex={0}
                  >
                    Contact us to reactivate
                  </button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    onClick={handleCancelSubscription} onKeyDown={handleCancelSubscription} role="button" tabIndex={0}
                    disabled={processing}
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Plans Display */}
      {(!subscription || !subscription.active || subscription.cancelAtPeriodEnd) && (
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plansToDisplay.map((plan) => (
            <div 
              key={plan.id}
              className={`border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col ${
                selectedPlan?.id === plan.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-500">/{plan.interval}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={() => handleSelectPlan(plan)} onKeyDown={() => handleSelectPlan(plan)} role="button" tabIndex={0}
              >
                {subscription && subscription.active && subscription.cancelAtPeriodEnd
                  ? 'Reactivate with this plan'
                  : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Payment Form */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Complete Your Subscription</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowPaymentForm(false)} onKeyDown={() => setShowPaymentForm(false)} role="button" tabIndex={0}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                You've selected the <span className="font-medium">{selectedPlan?.name}</span> plan at <span className="font-medium">${selectedPlan?.price}/{selectedPlan?.interval}</span>.
              </p>
            </div>
            
            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {paymentError}
              </div>
            )}
            
            {paymentMethods.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="Select Payment Method">Select Payment Method</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2" htmlFor="Card Details">Card Details</label>
                  <div className="border border-gray-300 rounded-md p-3">
                    <CardElement options={cardElementOptions} />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  disabled={!stripe || processing}
                >
                  {processing ? 'Processing...' : 'Subscribe Now'}
                </button>
              </form>
            )}
            
            {!showNewCardForm && paymentMethods.length > 0 && (
              <button
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={handleSubscribeWithExistingMethod} onKeyDown={handleSubscribeWithExistingMethod} role="button" tabIndex={0}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Subscribe Now'}
              </button>
            )}
            
            <p className="mt-4 text-sm text-gray-500">
              By subscribing, you agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans; 