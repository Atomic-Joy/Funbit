# Responsive Joke Generator Application
This is a professional, single-page React application designed to retrieve and display humor content. It features a fully responsive, two-panel interface, dynamic theming, and integrated error handling for external API interactions.

## Core Features
Dual API Source: The application randomly fetches content from one of two external APIs: [JokeAPI.dev](https://jokeapi.dev/) and [icanhazdadjoke.com](icanhazdadjoke.com).

Exponential Backoff Implementation: A stable fetchWithBackoff utility is utilized to manage network failures and API rate limiting by implementing an exponential backoff retry mechanism.

Theming: Includes a comprehensive Dark Mode / Light Mode toggle, utilizing a Forest Green and Cream color palette.

Responsive Architecture: The layout dynamically adapts between a stacked configuration on mobile devices and a split-panel configuration on desktop, optimizing control accessibility and display.

Technical Foundation: Developed using modern React functional components and hooks (useState, useEffect, and useCallback) to ensure optimal performance and code structure.

## Technical Stack
Framework: React (Functional Components and Hooks)

Styling: Tailwind CSS (Used for utility-first styling)

Iconography: Lucide-React

Content Providers:

1. https://v2.jokeapi.dev/

2. https://icanhazdadjoke.com/

## Deployment and Setup
This is a single-file React component intended for a sandbox or Canvas environment. Local deployment requires a standard Node.js/npm environment.

File Acquisition: Save the provided contents of the App.jsx component file.

Project Initialization: Establish a React project environment (e.g., using Vite or Create React App).

Dependency Installation: Ensure the core React and Lucide-React packages are installed.

'''bash
npm install react react-dom lucide-react
'''

Integration: Integrate the App.jsx content into your main application file (e.g., src/App.jsx).

## Application Operation
Initial State: Content retrieval is initiated automatically upon component mounting.

Content Refresh: Click the "Surprise me !!" button to manually fetch new content from the randomly selected API source.

Interface Customization: Use the Sun/Moon icon located on the component divider to switch between Dark Mode (Slate and Emerald) and Light Mode (Off-White and Lime).

External References: The Info and GitHub icons provide external links to API documentation and the project source code repository.