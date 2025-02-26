import React, { useState } from 'react';
import { useTheme, Button, Card, FormInput, Alert } from '../../contexts/ThemeContext';

/**
 * UIComponentDemo - Showcases all the themed components and styling options
 * This component is useful for designers and developers to see available theme elements
 */
const UIComponentDemo = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('colors');
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('option1');

  // Helper function to render color palette
  const renderColorPalette = () => {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold mb-4">Color Palette</h2>
        
        {Object.entries(theme.colors).map(([colorName, colorVariants]) => {
          if (typeof colorVariants === 'object') {
            return (
              <div key={colorName} className="mb-6">
                <h3 className="text-lg font-medium capitalize mb-2">{colorName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(colorVariants).map(([shade, hexValue]) => (
                    <div key={`${colorName}-${shade}`} className="flex flex-col items-center">
                      <div 
                        className="w-16 h-16 rounded-md shadow-md mb-2"
                        style={{ backgroundColor: hexValue }}
                      ></div>
                      <span className="text-xs font-mono">{shade}</span>
                      <span className="text-xs font-mono">{hexValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          } else if (typeof colorVariants === 'string') {
            return (
              <div key={colorName} className="mb-6">
                <h3 className="text-lg font-medium capitalize mb-2">{colorName}</h3>
                <div className="flex items-center">
                  <div 
                    className="w-16 h-16 rounded-md shadow-md mr-4"
                    style={{ backgroundColor: colorVariants }}
                  ></div>
                  <span className="text-sm font-mono">{colorVariants}</span>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  // Helper function to render typography
  const renderTypography = () => {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold mb-4">Typography</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Font Families</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <p className="text-sm text-gray-500 mb-2">Primary Font</p>
                <p style={{ fontFamily: theme.typography.fontFamily.primary }}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <p className="text-sm text-gray-500 mb-2">Secondary Font</p>
                <p style={{ fontFamily: theme.typography.fontFamily.secondary }}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Font Sizes</h3>
            <div className="space-y-4">
              {Object.entries(theme.typography.fontSize).map(([name, size]) => (
                <div key={name} className="flex items-center border-b pb-2">
                  <div className="w-24 text-sm text-gray-500">{name}</div>
                  <div style={{ fontSize: size }} className="flex-1">
                    The quick brown fox jumps over the lazy dog
                  </div>
                  <div className="text-xs text-gray-400 font-mono">{size}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Font Weights</h3>
            <div className="space-y-4">
              {Object.entries(theme.typography.fontWeight).map(([name, weight]) => (
                <div key={name} className="flex items-center border-b pb-2">
                  <div className="w-24 text-sm text-gray-500">{name}</div>
                  <div style={{ fontWeight: weight }} className="flex-1">
                    The quick brown fox jumps over the lazy dog
                  </div>
                  <div className="text-xs text-gray-400 font-mono">{weight}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to render buttons
  const renderButtons = () => {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Button Variants</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="info">Info</Button>
              <Button variant="light">Light</Button>
              <Button variant="dark">Dark</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Button Sizes</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Button States</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="primary">Normal</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="primary" loading>Loading</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Button with Icons</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" leftIcon="➕">Left Icon</Button>
              <Button variant="primary" rightIcon="➡️">Right Icon</Button>
              <Button variant="primary" iconOnly>🔍</Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to render cards
  const renderCards = () => {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold mb-4">Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-medium mb-2">Basic Card</h3>
            <p className="text-gray-600">This is a basic card with default styling.</p>
          </Card>

          <Card padding="lg" shadow="md">
            <h3 className="text-lg font-medium mb-2">Card with Large Padding</h3>
            <p className="text-gray-600">This card has larger padding and medium shadow.</p>
          </Card>

          <Card variant="outlined">
            <h3 className="text-lg font-medium mb-2">Outlined Card</h3>
            <p className="text-gray-600">This is an outlined card variant.</p>
          </Card>

          <Card padding="md" shadow="lg" bgColor={theme.colors.primary[50]}>
            <h3 className="text-lg font-medium mb-2">Colored Background Card</h3>
            <p className="text-gray-600">This card has a colored background.</p>
          </Card>

          <Card header="Card with Header and Footer" footer="Card Footer Content">
            <p className="text-gray-600">This card has a header and footer section.</p>
          </Card>
        </div>
      </div>
    );
  };

  // Helper function to render form elements
  const renderForms = () => {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Text Inputs</h3>
            
            <FormInput
              label="Standard Input"
              placeholder="Enter text here"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            
            <FormInput
              label="Disabled Input"
              placeholder="Disabled input"
              disabled
            />
            
            <FormInput
              label="Input with Error"
              placeholder="Enter text here"
              error="This field is required"
            />
            
            <FormInput
              label="Input with Helper Text"
              placeholder="Enter text here"
              helperText="This is some helpful instruction text"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Select Inputs</h3>
            
            <FormInput
              type="select"
              label="Select Input"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
              ]}
            />
            
            <h3 className="text-lg font-medium mb-2 mt-6">Checkbox & Radio</h3>
            
            <FormInput
              type="checkbox"
              label="Checkbox Option"
            />
            
            <FormInput
              type="radio"
              label="Radio Option 1"
              name="radioGroup"
              value="radio1"
            />
            
            <FormInput
              type="radio"
              label="Radio Option 2"
              name="radioGroup"
              value="radio2"
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Alerts</h3>
          <div className="space-y-4">
            <Alert variant="info">This is an informational alert</Alert>
            <Alert variant="success">This is a success alert</Alert>
            <Alert variant="warning">This is a warning alert</Alert>
            <Alert variant="danger">This is a danger alert</Alert>
          </div>
        </div>
      </div>
    );
  };

  // Navigation tabs
  const tabs = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards' },
    { id: 'forms', label: 'Forms' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">UI Component Demo</h1>
      
      {/* Navigation */}
      <div className="flex border-b mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.id 
                ? 'border-b-2 border-primary-500 text-primary-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="mt-8">
        {activeTab === 'colors' && renderColorPalette()}
        {activeTab === 'typography' && renderTypography()}
        {activeTab === 'buttons' && renderButtons()}
        {activeTab === 'cards' && renderCards()}
        {activeTab === 'forms' && renderForms()}
      </div>
    </div>
  );
};

export default UIComponentDemo; 