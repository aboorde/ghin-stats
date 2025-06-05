# GHIN Stats Documentation Index

Welcome to the GHIN Stats documentation. This comprehensive guide covers all aspects of the golf statistics application built with React and Supabase.

## 📁 Documentation Structure

### 01. Architecture & Design
Core technical documentation about system architecture and design patterns.

- **[API_PATTERNS.md](01-architecture/API_PATTERNS.md)** - Comprehensive guide to Supabase query patterns used throughout the application
- **[DATABASE_SCHEMA.md](01-architecture/DATABASE_SCHEMA.md)** - Complete database schema including tables, relationships, and sample queries
- **[DATA_ARCHITECTURE.md](01-architecture/DATA_ARCHITECTURE.md)** - Data flow architecture and system design patterns
- **[RLS_DOCUMENTATION.md](01-architecture/RLS_DOCUMENTATION.md)** - Row Level Security implementation details and policies
- **[COMPONENT_GUIDE.md](01-architecture/COMPONENT_GUIDE.md)** - Detailed guide for all React components in the application

### 02. Implementation Guides
Step-by-step guides for major feature implementations.

- **[AUTHENTICATION_IMPLEMENTATION.md](02-implementation/AUTHENTICATION_IMPLEMENTATION.md)** - Supabase Auth integration and user management
- **[PUBLIC_PROFILES_IMPLEMENTATION.md](02-implementation/PUBLIC_PROFILES_IMPLEMENTATION.md)** - Public profile functionality and privacy controls
- **[SESSION_MANAGEMENT.md](02-implementation/SESSION_MANAGEMENT.md)** - Session handling, token refresh, and timeout management
- **[MIGRATION_GUIDE.md](02-implementation/MIGRATION_GUIDE.md)** - Data migration guide for user ownership assignment

### 03. Development Resources
Guidelines and resources for active development.

- **[CLAUDE_INSTRUCTIONS.md](03-development/CLAUDE_INSTRUCTIONS.md)** - Critical rules, patterns, and guidelines for Claude AI development
- **[COMPONENT_LIBRARY.md](03-development/COMPONENT_LIBRARY.md)** - Atomic design component library with usage examples
- **[create_auth_users_guide.md](03-development/create_auth_users_guide.md)** - Guide for creating authentication users in Supabase

### 04. Deployment
Deployment guides and CI/CD configuration.

- **[DEPLOYMENT_GUIDE.md](04-deployment/DEPLOYMENT_GUIDE.md)** - Comprehensive deployment guide with GitHub Actions and environment setup
- **[DEPLOYMENT.md](04-deployment/DEPLOYMENT.md)** - Quick deployment reference

### 05. Refactoring History
Documentation of major refactoring efforts and architectural improvements.

- **[REFACTORING_SUMMARY.md](05-refactoring-history/REFACTORING_SUMMARY.md)** - Data architecture refactoring from components to model-service-helper pattern
- **[COURSE_REFACTORING_SUMMARY.md](05-refactoring-history/COURSE_REFACTORING_SUMMARY.md)** - Course-specific refactoring details
- **[DETAILED_STATS_REFACTORING_SUMMARY.md](05-refactoring-history/DETAILED_STATS_REFACTORING_SUMMARY.md)** - Detailed statistics component refactoring
- **[YEAR_ANALYSIS_REFACTORING_SUMMARY.md](05-refactoring-history/YEAR_ANALYSIS_REFACTORING_SUMMARY.md)** - Year analysis component refactoring

### 06. Work Logs
Historical work summaries and session notes.

- **[2024-12-04_WORK_SUMMARY.md](06-work-logs/2024-12-04_WORK_SUMMARY.md)** - Daily work summary from December 4, 2024
- **[2024-12_MONTHLY_SUMMARY.md](06-work-logs/2024-12_MONTHLY_SUMMARY.md)** - December 2024 monthly accomplishments
- **[2025-01-06_SESSION_NOTES.md](06-work-logs/2025-01-06_SESSION_NOTES.md)** - Session notes from January 6, 2025

## 🚀 Quick Start Guide

New to the project? Start here:

1. **Read the [README.md](../README.md)** in the root directory for project overview and setup
2. **Review [DATABASE_SCHEMA.md](01-architecture/DATABASE_SCHEMA.md)** to understand the data structure
3. **Check [COMPONENT_GUIDE.md](01-architecture/COMPONENT_GUIDE.md)** for UI component overview
4. **Follow [DEPLOYMENT_GUIDE.md](04-deployment/DEPLOYMENT_GUIDE.md)** to deploy the application

## 🏗️ Architecture Overview

The GHIN Stats application follows these architectural principles:

- **Frontend**: React with functional components and hooks
- **Styling**: Tailwind CSS with utility-first approach
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **State Management**: Local component state (no Redux/Context for simplicity)
- **Data Visualization**: Recharts for all charts and graphs
- **Authentication**: Supabase Auth with JWT tokens
- **Deployment**: GitHub Pages with GitHub Actions CI/CD

## 📊 Key Features

- **Round by Round Analysis**: Track performance over time with filterable tables and charts
- **Hole by Hole View**: Detailed scorecard view for each round
- **Course Summary**: Performance metrics by course with hole-specific analysis
- **Year by Year Analysis**: Historical trends and seasonal patterns
- **Public Profiles**: Share golf statistics publicly with privacy controls
- **GHIN Handicap Calculation**: Accurate handicap index calculation following USGA rules

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for data access
- Privacy controls for public profile visibility
- Secure session management with auto-refresh

## 📝 Contributing

When contributing to this project:

1. Follow the patterns in [CLAUDE_INSTRUCTIONS.md](03-development/CLAUDE_INSTRUCTIONS.md)
2. Use the atomic components from [COMPONENT_LIBRARY.md](03-development/COMPONENT_LIBRARY.md)
3. Maintain the API patterns documented in [API_PATTERNS.md](01-architecture/API_PATTERNS.md)
4. Update relevant documentation when making changes

## 🆘 Troubleshooting

Common issues and solutions:

- **Session Timeout**: Implemented auto-refresh in `useSessionMonitor` hook
- **Build Failures**: Check Tailwind CSS v4 configuration in PostCSS
- **Deployment Issues**: Use `deploy-simple.yml` workflow to bypass environment protection
- **RLS Errors**: Verify user authentication and check RLS policies

## 📅 Last Updated

This documentation index was last updated on January 6, 2025.

For the most recent changes, check the [work logs](06-work-logs/) directory.