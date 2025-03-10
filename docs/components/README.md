# Component Documentation

This directory contains comprehensive documentation for all UI components in the application. Each component has its own markdown file with consistent structure for easy reference.

## Documentation Structure

### Available Component Documentation

#### Dashboard Widgets
- [HealthScoreWidget](./HealthScoreWidget.md) - Financial health visualization
- [AccountSummary](./AccountSummary.md) - Summary of accounts and balances
- [BudgetOverview](./BudgetOverview.md) - Budget progress and category breakdown
- [CashFlowWidget](./CashFlowWidget.md) - Cash flow predictions and forecasting
- [RecentTransactionsWidget](./RecentTransactionsWidget.md) - Recent transaction display
- [InsightsWidget](./InsightsWidget.md) - Financial insights and suggestions
- [GoalsProgressWidget](./GoalsProgressWidget.md) - Financial goals tracking

#### Core Components
- [Button](./Button.md) - Core button component with multiple variants
- [Card](./Card.md) - Container component for grouping related content
- [Input](./Input.md) - Text input fields
- [Select](./Select.md) - Selection controls
- [Checkbox](./Checkbox.md) - Checkbox controls
- [DatePicker](./DatePicker.md) - Date selection

#### Chart Components
- [LineChart](./LineChart.md) - Line chart visualization
- [BarChart](./BarChart.md) - Bar chart visualization
- [PieChart](./PieChart.md) - Pie/Donut chart visualization

#### Layout Components
- [ResponsiveContainer](./ResponsiveContainer.md) - Responsive layout container
- [ResponsiveGrid](./ResponsiveGrid.md) - Grid layout with responsive breakpoints
- [ResponsiveFlex](./ResponsiveFlex.md) - Flex layout with responsive adjustments

## Documentation Template

Each component should be documented using the following structure:

```markdown
# Component Name

Brief description of the component and its purpose.

## Screenshot

![Component Name](../images/components/component-name.png)

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

How to import and use the component.

## Usage

### Basic Usage

```tsx
<ComponentName prop1="value" />
```

### With Options/Variants

```tsx
<ComponentName
  variant="primary"
  size="lg"
  onClick={() => {}}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `prop1` | `string` | Yes | - | Description of prop1 |
| `prop2` | `number` | No | `0` | Description of prop2 |

### Interface Definitions (if applicable)

```tsx
interface ComponentProps {
  // Props definition
}

interface SubComponent {
  // Related interface
}
```

## Theming

How theming works with this component.

## Accessibility

Accessibility features and considerations.

## Implementation Notes

Technical details, caveats, or special considerations.

## Examples

Real-world examples of component usage.

## Best Practices

Guidelines for using the component effectively.

## Related Components

Links to related components.

## Changelog

Version history and changes.

## Contributing

Guidelines for modifying this component.
```

## Documentation Guidelines

When writing component documentation, follow these guidelines:

1. **Be thorough**: Include all relevant information about the component.
2. **Show examples**: Provide clear usage examples for different scenarios.
3. **Document all props**: Every prop should be documented with type, requirement, defaults, and description.
4. **Include interfaces**: Document any interfaces associated with the component.
5. **Highlight accessibility**: Document accessibility features and considerations.
6. **Explain theming**: Document how theming affects the component.
7. **Provide context**: Explain where and how the component should be used.
8. **Maintain consistency**: Follow the template structure for all components.

## Previewing Documentation

Documentation can be previewed using any Markdown viewer. We recommend using Visual Studio Code's built-in Markdown preview feature or tools like [Docsify](https://docsify.js.org/) for a more interactive experience.

## Contributing

When adding new components or updating existing ones, please ensure the documentation is updated accordingly. Follow the template provided and ensure all sections are completed. 