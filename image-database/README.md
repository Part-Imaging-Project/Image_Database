# Image Database Management System

A centralized system for storing, organizing, and managing part images captured by PLC and camera systems. This application provides a robust interface for viewing, filtering, and retrieving manufacturing part images with comprehensive metadata.

## Features

- **Centralized Image Storage**: Secure storage for all part images with metadata
- **Advanced Search & Filtering**: Find images by part number, date, status, and more
- **Grid & List Views**: Multiple viewing options for image browsing
- **Detailed Metadata**: Track comprehensive information about each image capture
- **Authentication**: Secure user access with Auth0 integration
- **ERP Integration Ready**: Built to connect with Odoo ERP systems
- **AI Processing Ready**: Structured data model suitable for AI image recognition

## System Requirements

- Node.js 18.17.0 or later
- npm 9.6.7 or later
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Technologies Used

- **Frontend**: React 18.2.0, Next.js 15.3.2
- **Styling**: Tailwind CSS 3.3.0
- **Authentication**: Auth0 NextJS Auth0 3.5.0
- **State Management**: React Hooks
- **Typescript**: 5.3.0

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/image-database.git
   cd image-database
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file with the following variables:
   ```
   AUTH0_SECRET='your-auth0-secret'
   AUTH0_BASE_URL='http://localhost:3000'
   AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
   AUTH0_CLIENT_ID='your-auth0-client-id'
   AUTH0_CLIENT_SECRET='your-auth0-client-secret'
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Authentication

The system uses Auth0 for authentication. Users must be logged in to access the dashboard and gallery features.

### Dashboard

The dashboard provides:
- Quick statistics on your image database
- Recent uploads overview
- Processing status information
- Quick access to all sections of the application

### Gallery

The gallery offers:
- Grid and list viewing options
- Filtering by part categories
- Search functionality
- Detailed image information
- Download, edit and management capabilities

### Image Upload (Coming Soon)

The upload feature will allow:
- Multiple file upload
- Metadata tagging
- Automatic processing integration

## Backend Integration

This frontend is designed to integrate with:
- Azure/PostgreSQL database
- Express.js backend API
- Azure Blob Storage for image files

Follow these steps for backend integration:
1. Configure your API endpoints in `src/services/api.js`
2. Update authentication configuration for your backend services
3. Ensure CORS is properly configured on your backend

## Deployment

To build the application for production:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## Technical Specifications

- **Browser Compatibility**: Chrome 90+, Firefox 90+, Edge 90+, Safari 14+
- **Responsive Design**: Mobile, Tablet and Desktop support
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Core Web Vitals optimized

## Version Information

- Next.js: 15.3.2
- React: 18.2.0
- TypeScript: 5.3.0
- Auth0 Next.js SDK: 3.5.0
- Tailwind CSS: 3.3.0
- Node.js: 18.17.0 (minimum)
- ESLint: 8.54.0

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact the development team or create an issue in this repository.