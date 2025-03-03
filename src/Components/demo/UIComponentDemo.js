import React, { useState } from 'react';
import {
  Button,
  Card,
  Input,
  Select,
  Checkbox,
  Toggle,
  Tabs,
  Badge,
  Modal
} from '../ui';

/**
 * Component for demonstrating the UI component library
 * 
 * @component
 * @example
 * ```jsx
 * <UIComponentDemo />
 * ```
 */
const UIComponentDemo = () => {
  // Form state
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    category: '',
    notifications: true,
    terms: false,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorField, setErrorField] = useState(null);

  // Tabs
  const tabs = [
    { 
      id: 'form', 
      label: 'Form Components',
      badge: 'New' 
    },
    { 
      id: 'display', 
      label: 'Display Components' 
    },
    { 
      id: 'feedback', 
      label: 'Feedback Components' 
    },
    { 
      id: 'styles', 
      label: 'Style Variants',
      badge: '4' 
    },
  ];
  
  const [activeTab, setActiveTab] = useState('form');

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formValues.name) {
      setErrorField('name');
      return;
    }
    if (!formValues.email) {
      setErrorField('email');
      return;
    }
    if (!formValues.terms) {
      setErrorField('terms');
      return;
    }
    
    // Success - open modal with form data
    setErrorField(null);
    setIsModalOpen(true);
  };

  // Status badge renderer
  const renderStatusBadge = (status) => {
    const statusVariants = {
      'active': { variant: 'success', label: 'Active' },
      'pending': { variant: 'warning', label: 'Pending' },
      'inactive': { variant: 'danger', label: 'Inactive' },
      'beta': { variant: 'primary', label: 'Beta' },
    };
    
    const { variant, label } = statusVariants[status] || statusVariants.active;
    
    return (
      <Badge variant={variant} size="md" rounded="full">
        {label}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">UI Component Library Demo</h1>
      
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        align="left"
        size="md"
        variant="underline"
      >
        {(activeTab) => (
          <div className="mt-6">
            {/* Form Components Tab */}
            {activeTab === 'form' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Form Example</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Full Name"
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    isRequired
                    isError={errorField === 'name'}
                    errorText="Name is required"
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formValues.email}
                    onChange={handleInputChange}
                    isRequired
                    isError={errorField === 'email'}
                    errorText="Email is required"
                    helperText="We'll never share your email with anyone else."
                  />
                  
                  <Select
                    label="Category"
                    id="category"
                    name="category"
                    value={formValues.category}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select a category', disabled: true },
                      { value: 'personal', label: 'Personal' },
                      { value: 'work', label: 'Work' },
                      { value: 'other', label: 'Other' },
                    ]}
                    placeholder="Select a category"
                  />
                  
                  <Toggle
                    label="Enable notifications"
                    checked={formValues.notifications}
                    onChange={(e) => handleInputChange({
                      target: { name: 'notifications', type: 'checkbox', checked: e.target.checked }
                    })}
                    id="notifications"
                    name="notifications"
                    helperText="You'll receive email notifications about account activity."
                  />
                  
                  <Checkbox
                    label="I agree to the Terms and Conditions"
                    checked={formValues.terms}
                    onChange={(e) => handleInputChange({
                      target: { name: 'terms', type: 'checkbox', checked: e.target.checked }
                    })}
                    id="terms"
                    name="terms"
                    isRequired
                    isError={errorField === 'terms'}
                    errorText="You must agree to the terms to continue"
                  />
                  
                  <div className="flex justify-end space-x-4">
                    <Button 
                      onClick={() => setFormValues({
                        name: '',
                        email: '',
                        category: '',
                        notifications: true,
                        terms: false,
                      })}
                      onKeyDown={() => setFormValues({
                        name: '',
                        email: '',
                        category: '',
                        notifications: true,
                        terms: false,
                      })}
                      role="button"
                      tabIndex={0}
                    >
                      Reset
                    </Button>
                    <Button variant="primary" type="submit">
                      Submit
                    </Button>
                  </div>
                </form>
              </Card>
            )}
            
            {/* Display Components Tab */}
            {activeTab === 'display' && (
              <div className="space-y-8">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Cards & Badges</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium">Basic Card</h3>
                        {renderStatusBadge('active')}
                      </div>
                      <p className="mt-2 text-gray-600">This is a simple card with a status badge.</p>
                    </Card>
                    
                    <Card className="p-4 border border-gray-200 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium">Feature Card</h3>
                        {renderStatusBadge('beta')}
                      </div>
                      <p className="mt-2 text-gray-600">This card shows a feature that's in beta.</p>
                    </Card>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Badge Showcase</h2>
                  <div className="flex flex-wrap gap-4">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="purple">Purple</Badge>
                    <Badge variant="pink">Pink</Badge>
                    <Badge variant="dark">Dark</Badge>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-4">
                    <span className="text-gray-700">Status indicators:</span>
                    <Badge isDot variant="success" className="mr-2" />
                    <span className="text-gray-600 mr-4">Online</span>
                    
                    <Badge isDot variant="warning" className="mr-2" />
                    <span className="text-gray-600 mr-4">Away</span>
                    
                    <Badge isDot variant="danger" className="mr-2" />
                    <span className="text-gray-600">Offline</span>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Feedback Components Tab */}
            {activeTab === 'feedback' && (
              <div className="space-y-8">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Modals & Dialogs</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Click the button below to open a modal dialog.
                    </p>
                    <Button 
                      variant="primary" 
                      onClick={() => setIsModalOpen(true)}
                      onKeyDown={() => setIsModalOpen(true)}
                      role="button"
                      tabIndex={0}
                    >
                      Open Modal
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Status Messages</h2>
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Badge variant="success" className="mt-0.5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            Your changes have been saved successfully.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Badge variant="warning" className="mt-0.5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            There are unsaved changes. Please save your work before leaving.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Badge variant="danger" className="mt-0.5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            An error occurred while processing your request. Please try again.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Style Variants Tab */}
            {activeTab === 'styles' && (
              <div className="space-y-8">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Button Variants</h2>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="success">Success</Button>
                      <Button variant="danger">Danger</Button>
                      <Button variant="warning">Warning</Button>
                      <Button variant="info">Info</Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <Button variant="primary" size="sm">Small</Button>
                      <Button variant="primary" size="md">Medium</Button>
                      <Button variant="primary" size="lg">Large</Button>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Tab Variants</h2>
                  <div className="space-y-6">
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-md font-medium mb-2">Underline Tabs</h3>
                        <Tabs
                          tabs={[
                            { id: 'tab1', label: 'Tab 1' },
                            { id: 'tab2', label: 'Tab 2' },
                            { id: 'tab3', label: 'Tab 3' },
                          ]}
                          variant="underline"
                        >
                          {(tab) => (
                            <div className="p-4 bg-gray-50 rounded">
                              Content for {tab}
                            </div>
                          )}
                        </Tabs>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">Pills Tabs</h3>
                        <Tabs
                          tabs={[
                            { id: 'tab1', label: 'Tab 1' },
                            { id: 'tab2', label: 'Tab 2' },
                            { id: 'tab3', label: 'Tab 3' },
                          ]}
                          variant="pills"
                        >
                          {(tab) => (
                            <div className="p-4 bg-gray-50 rounded">
                              Content for {tab}
                            </div>
                          )}
                        </Tabs>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">Boxed Tabs</h3>
                        <Tabs
                          tabs={[
                            { id: 'tab1', label: 'Tab 1' },
                            { id: 'tab2', label: 'Tab 2' },
                            { id: 'tab3', label: 'Tab 3' },
                          ]}
                          variant="boxed"
                        >
                          {(tab) => (
                            <div className="p-4 bg-gray-50 rounded">
                              Content for {tab}
                            </div>
                          )}
                        </Tabs>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </Tabs>
      
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Submitted"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Thank you for submitting the form! Here's what we received:</p>
          
          <div className="bg-gray-50 p-4 rounded">
            <dl className="divide-y divide-gray-200">
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Name:</dt>
                <dd className="text-sm text-gray-900 col-span-2">{formValues.name}</dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Email:</dt>
                <dd className="text-sm text-gray-900 col-span-2">{formValues.email}</dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Category:</dt>
                <dd className="text-sm text-gray-900 col-span-2">{formValues.category || 'N/A'}</dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Notifications:</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {formValues.notifications ? 'Enabled' : 'Disabled'}
                </dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Terms:</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {formValues.terms ? 'Accepted' : 'Not accepted'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={() => setIsModalOpen(false)} onKeyDown={() => setIsModalOpen(false)} role="button" tabIndex={0}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UIComponentDemo; 