import React, { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Toggle } from '../components/ui/Toggle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Checkbox } from '../components/ui/Checkbox';
import { Alert } from '../components/ui/Alert';
import { ProgressBar } from '../components/ui/ProgressBar';

export const UIComponentDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [toggleState, setToggleState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(false);

  const tabs = [
    { id: 'form', label: 'Form Components', badge: '4' },
    { id: 'display', label: 'Display Components', badge: '2' },
    { id: 'feedback', label: 'Feedback Components', badge: '2' },
    { id: 'variants', label: 'Style Variants' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">UI Component Demo</h1>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab}>
          {/* Content will be conditionally rendered below */}
        </TabsContent>
      </Tabs>

      <div className="space-y-12">
        {activeTab === 'form' && (
          <section>
            <h2 className="text-xl font-semibold mb-6">Form Components</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Toggle</h3>
                <div className="space-y-4">
                  <Toggle
                    checked={toggleState}
                    onChange={setToggleState}
                    label="Basic Toggle"
                  />
                  <Toggle
                    checked={toggleState}
                    onChange={setToggleState}
                    label="Small Toggle"
                    size="sm"
                  />
                  <Toggle
                    checked={toggleState}
                    onChange={setToggleState}
                    label="Large Toggle with Left Label"
                    size="lg"
                    labelPosition="left"
                  />
                  <Toggle
                    checked={toggleState}
                    onChange={setToggleState}
                    label="Disabled Toggle"
                    disabled
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Checkbox</h3>
                <div className="space-y-4">
                  <Checkbox
                    checked={checkboxState}
                    onChange={setCheckboxState}
                    label="Basic Checkbox"
                  />
                  <Checkbox
                    checked={checkboxState}
                    onChange={setCheckboxState}
                    label="Required Checkbox"
                    required
                  />
                  <Checkbox
                    checked={checkboxState}
                    onChange={setCheckboxState}
                    label="Checkbox with Helper Text"
                    helperText="This is some helpful text"
                  />
                  <Checkbox
                    checked={checkboxState}
                    onChange={setCheckboxState}
                    label="Checkbox with Error"
                    error="This field is required"
                  />
                  <Checkbox
                    checked={checkboxState}
                    onChange={setCheckboxState}
                    label="Disabled Checkbox"
                    disabled
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'display' && (
          <section>
            <h2 className="text-xl font-semibold mb-6">Display Components</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Badge</h3>
                <div className="space-x-2">
                  <Badge>Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="dark">Dark</Badge>
                </div>
                <div className="mt-4 space-x-2">
                  <Badge size="sm" dot>Small</Badge>
                  <Badge size="md" dot>Medium</Badge>
                  <Badge size="lg" dot>Large</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Progress Bar</h3>
                <div className="space-y-4">
                  <ProgressBar value={30} showLabel />
                  <ProgressBar
                    value={60}
                    variant="success"
                    size="lg"
                    showLabel
                    labelPosition="inside"
                  />
                  <ProgressBar
                    value={85}
                    variant="warning"
                    size="sm"
                    showLabel
                  />
                  <ProgressBar
                    value={45}
                    variant="danger"
                    animated
                    showLabel
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'feedback' && (
          <section>
            <h2 className="text-xl font-semibold mb-6">Feedback Components</h2>
            
            <div className="space-y-4">
              <Alert
                variant="info"
                title="Information"
                dismissible
              >
                This is an informational message.
              </Alert>
              <Alert
                variant="success"
                title="Success"
                dismissible
              >
                Your changes have been saved successfully.
              </Alert>
              <Alert
                variant="warning"
                title="Warning"
                dismissible
              >
                Please review your information before proceeding.
              </Alert>
              <Alert
                variant="error"
                title="Error"
                dismissible
              >
                An error occurred while processing your request.
              </Alert>
            </div>
          </section>
        )}

        {activeTab === 'variants' && (
          <section>
            <h2 className="text-xl font-semibold mb-6">Style Variants</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Tab Variants</h3>
                <div className="space-y-6">
                  <Tabs defaultValue="tab1">
                    <TabsList>
                      {[
                        { id: 'tab1', label: 'Underline Tab 1' },
                        { id: 'tab2', label: 'Underline Tab 2' }
                      ].map(tab => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value="tab1">
                      Content for tab 1
                    </TabsContent>
                    <TabsContent value="tab2">
                      Content for tab 2
                    </TabsContent>
                  </Tabs>

                  <Tabs defaultValue="tab1">
                    <TabsList>
                      {[
                        { id: 'tab1', label: 'Pills Tab 1' },
                        { id: 'tab2', label: 'Pills Tab 2' }
                      ].map(tab => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value="tab1">
                      Content for tab 1
                    </TabsContent>
                    <TabsContent value="tab2">
                      Content for tab 2
                    </TabsContent>
                  </Tabs>

                  <Tabs defaultValue="tab1">
                    <TabsList>
                      {[
                        { id: 'tab1', label: 'Boxed Tab 1' },
                        { id: 'tab2', label: 'Boxed Tab 2' }
                      ].map(tab => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value="tab1">
                      Content for tab 1
                    </TabsContent>
                    <TabsContent value="tab2">
                      Content for tab 2
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}; 
