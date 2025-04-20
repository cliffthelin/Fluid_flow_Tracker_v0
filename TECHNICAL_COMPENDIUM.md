# Flow Tracker Technical Compendium

This document provides a comprehensive overview of the Flow Tracker application's codebase, including detailed explanations of each component, utility, and service.

## Table of Contents

1. [Introduction](#introduction)
2. [Core Components](#core-components)
3. [Testing Components](#testing-components)
4. [Utilities and Services](#utilities-and-services)
5. [PWA Features](#pwa-features)
6. [Accessibility Features](#accessibility-features)

## Introduction

Flow Tracker is a Progressive Web Application (PWA) designed to help users monitor and track their urinary health. The application provides tools for recording urination events, tracking fluid intake, and analyzing patterns over time. All data is stored locally on the user's device, ensuring complete privacy and security.

## Core Components

### Header

The Header component provides the main navigation and branding for the application. It includes the app title, a font size adjustment control, and a dark mode toggle.

Key features:
- Non-sticky design that scrolls with the page
- Responsive layout that adapts to different screen sizes
- Accessible controls with proper ARIA attributes
- Theme toggle with visual indicators

### FlowEntryForm

The FlowEntryForm component allows users to record new urination events and fluid intake.

Key features:
- Timer-assisted duration tracking
- Real-time flow rate calculation
- Comprehensive data collection
- Tabbed interface for flow and fluid intake
- Form validation and error handling

### FluidStats

The FluidStats component visualizes the user's tracking data with statistics and charts.

Key features:
- Multiple visualization types (table, line chart, heatmap, scatter plot)
- Time period filtering (week, month, year, all)
- Data type filtering (flow, intake, both)
- Metric filtering (rate, volume, etc.)
- Sharing functionality with fallback

### DataManagement

The DataManagement component provides tools for managing the user's recorded data.

Key features:
- Monthly grouping of entries
- Export and import functionality
- Mock data generation for testing
- Entry deletion
- Data sharing with clipboard fallback

### Resources

The Resources component provides educational materials and references about urinary health.

Key features:
- Categorized resource listings
- Custom resource management
- External link handling
- Resource editing and deletion

### Help

The Help component provides documentation and support information.

Key features:
- Collapsible sections for easy navigation
- Comprehensive user manual
- Development tools and tests
- Builders log for tracking development history

## Testing Components

### HeaderTest

The HeaderTest component tests whether the header is properly configured to scroll with the page.

Key features:
- Automatic test execution on component mount
- Manual test execution button
- Visual feedback about test results
- Detailed error messages

### ContrastTest

The ContrastTest component tests the contrast ratios of text elements against WCAG AA standards.

Key features:
- Comprehensive element testing
- Theme mode toggle
- Detailed results table
- Color visualization
- Compliance summary

### ManualTest

The ManualTest component tests the availability and validity of the user manual.

Key features:
- File accessibility testing
- Content validation
- Structure verification
- Error reporting

## Utilities and Services

### Share Service

The Share Service provides utilities for sharing content from the application.

Key features:
- Environment detection for reliable sharing
- Clipboard fallback for all platforms
- Error handling
- Consistent user experience

### Database Service

The Database Service provides utilities for storing and retrieving data using IndexedDB.

Key features:
- IndexedDB storage for offline capability
- Data migration from localStorage
- Batch operations for performance
- Error handling and fallbacks

### Builder Log

The Builder Log tracks the development process and issues encountered during the building of the app.

Key features:
- Comprehensive development history
- Exportable log
- Timestamp tracking
- Test verification

## PWA Features

### Service Worker

The Service Worker enables offline functionality and improved performance.

Key features:
- Asset caching
- Offline capability
- Cache management
- Background sync

### Manifest

The Web App Manifest provides metadata for the PWA.

Key features:
- App identity
- Installation support
- Home screen integration
- App shortcuts

### Installation

The InstallPrompt component provides a UI for installing the PWA.

Key features:
- Installation detection
- User-friendly prompt
- Installation handling
- Status tracking

## Accessibility Features

### Contrast Compliance

The application ensures text has sufficient contrast against its background.

Key features:
- WCAG AA compliance
- Dark mode support
- Testing tools
- Visual feedback

### Keyboard Navigation

The application supports keyboard navigation for accessibility.

Key features:
- Focusable elements
- Visible focus indicators
- Logical tab order
- ARIA attributes

### Screen Reader Support

The application provides proper semantics for screen readers.

Key features:
- Semantic HTML
- ARIA attributes
- Status announcements
- Alternative text

## How to Use This Compendium

This technical compendium is designed to help developers understand the Flow Tracker codebase. Use it to:

1. Get an overview of the application architecture
2. Find specific components and their functionality
3. Understand the design decisions and implementation details
4. Learn about the accessibility and PWA features

For more detailed information, refer to the inline comments in the source code.
