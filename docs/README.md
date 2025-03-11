# Personal Finance Dashboard Documentation

> **GLOBAL RULE**: All project documentation MUST be maintained in this `/docs` directory structure. No documentation should be placed elsewhere in the codebase.

## Documentation Structure

### `/api`
API documentation including endpoints, request/response formats, and authentication.
- [API Reference](api/api-reference.md) - Comprehensive API endpoint reference

### `/components`
React component documentation and usage guidelines.
- [UI Components Reference](components/ui-components-reference.md) - Core UI component documentation
- [Component Guidelines](components/guidelines.md) - Standards for component development
- [Performance Optimized Components](components/performance-optimized-components.md) - Performance-focused components

### `/database`
Database-related documentation:
- [Database Schema](database/DATABASE-SCHEMA.md) - Full database schema reference
- [Database Connector](database/database-connector.md) - Core database connection and query handling
- [User Synchronization](database/user-sync.md) - Firebase user synchronization system

### `/development`
Development guidelines, processes, and technical details:
- [Custom Hooks Reference](development/custom-hooks-reference.md) - React hooks usage and implementation
- [Code Quality Tools](development/code-quality-tools.md) - Linting, testing, and code quality tools
- [Architectural Enhancements](development/architectural-enhancements.md) - System architecture improvements
- [ESM Migration Guide](development/esm-migration-guide.md) - ES Modules migration process
- [Mobile Roadmap](development/MOBILE-ROADMAP.md) - Mobile development plan
- [Next Steps](development/NEXT_STEPS.md) - Upcoming development priorities
- [Code Quality](development/code-quality.md) - Code quality standards

### `/deployment`
Deployment guides and configuration documentation.

### `/integrations`
Third-party integration documentation:
- [Plaid Integration](integrations/plaid/README.md) - Complete Plaid integration documentation

### `/frontend`
Frontend-specific documentation.

### `/guides`
General guides and tutorials.

### `/refactoring`
Refactoring plans and guidelines.

### `/security`
Security documentation and best practices.

### `/testing`
Testing strategies, patterns, and procedures.

## Project Documentation

- [UI Design System Progress](ui-design-system-progress.md) - Current status of design system implementation
- [Style Guide](style-guide.md) - Project style guidelines
- [Marketing Strategy](marketing-strategy.md) - Marketing and user acquisition plans
- [Implementation Timeline](implementation-timeline.md) - Project timeline and milestones
- [Implementation Progress Summary](implementation-progress-summary.md) - Current implementation status
- [Competitive Analysis](competitive-analysis.md) - Analysis of competing products
- [Project Status Report](project-status-report.md) - Overall project status
- [Component Structure](COMPONENT_STRUCTURE.md) - Component organization reference
- [Manual Setup](MANUAL_SETUP.md) - Manual project setup instructions

## Deprecated Documentation

The following documents have been replaced or superseded by newer versions:
- `integrations/plaid/plaid-implementation.md` - Superseded by `integrations/plaid/plaid-latest-implementation-guide.md`

## Quick Links

### Setup & Installation
- [Development Environment Setup](guides/development-setup.md)
- [Plaid Development Setup](integrations/plaid/plaid-development-setup.md)
- [Manual Setup](MANUAL_SETUP.md)

### Development
- [Component Guidelines](components/guidelines.md)
- [Custom Hooks Reference](development/custom-hooks-reference.md)
- [UI Components Reference](components/ui-components-reference.md)

### Deployment
- [Production Deployment](deployment/production.md)
- [Plaid Production Deployment](integrations/plaid/plaid-production-deployment.md)

## Contributing to Documentation

### Documentation Standards
1. Use Markdown for all documentation files
2. Include code examples where applicable
3. Keep documentation up-to-date with code changes
4. Add links to related documentation
5. Include troubleshooting sections for common issues

### Adding New Documentation
1. **ALWAYS place new documentation in this `/docs` directory structure**
2. Create new documentation in the appropriate subdirectory
3. Update this README with links to new documentation
4. Follow the established format and style
5. Include necessary metadata and tags
6. Cross-reference related documentation

### Updating Existing Documentation
1. Review and update documentation when making code changes
2. Mark deprecated features or documentation
3. Update examples to reflect current best practices
4. Verify all links and references remain valid

## Maintenance

### Regular Updates
- Documentation is reviewed and updated monthly
- Deprecated features are marked and eventually removed
- New features are documented as they are added
- Examples are tested and verified regularly

### Version Control
- Documentation versions align with software releases
- Major changes are tracked in CHANGELOG.md
- Historical documentation is archived appropriately

## Getting Help
- For documentation issues: File an issue in the repository
- For technical questions: Refer to the appropriate guide
- For immediate assistance: Contact the development team

## License
This documentation is covered under the project's main license. See LICENSE file in the root directory.