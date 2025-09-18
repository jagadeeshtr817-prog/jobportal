# Job Application Portal

A full-stack web application for job listings and applications management.

## Features

- 🔍 Browse and search job listings
- 📝 Submit job applications with resume upload
- 💼 Master admin dashboard for application management
- 🔒 Secure authentication system
- 📱 Responsive design for all devices

## Tech Stack

### Frontend
- HTML5
- CSS3 (with modern animations and transitions)
- JavaScript (ES6+)
- Custom responsive design system

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose ODM)
- JSON Web Tokens for authentication

## Project Structure

```
job-portal/
├── server.js              # Express server configuration
├── routes/               
│   ├── master.js         # Admin routes
│   └── api.js            # API routes
├── models/
│   ├── Job.js            # Job schema
│   └── Application.js     # Application schema
├── public/               
│   ├── index.html        # Main job listing page
│   ├── style.css         # Global styles
│   ├── script.js         # Frontend JavaScript
│   └── master-dashboard.html  # Admin dashboard
└── config/
    └── db.js             # Database configuration
```

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/jagadeeshtr817-prog/jobportal.git
cd jobportal
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a .env file in the root directory:
\`\`\`env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
MASTER_USERNAME=admin
MASTER_PASSWORD=secure_password
\`\`\`

4. Start the server:
\`\`\`bash
# Development with auto-reload
npm run dev

# Production
npm start
\`\`\`

## API Endpoints

### Jobs
- GET `/api/jobs` - Get all jobs
- POST `/api/jobs` - Create a new job (admin only)
- GET `/api/jobs/:id` - Get specific job
- PUT `/api/jobs/:id` - Update job (admin only)
- DELETE `/api/jobs/:id` - Delete job (admin only)

### Applications
- POST `/api/applications` - Submit job application
- GET `/api/master/applications` - Get all applications (admin only)
- GET `/api/master/applications/:id` - Get specific application (admin only)
- PUT `/api/master/applications/:id` - Update application status (admin only)

## Features in Detail

### Job Listings
- Real-time search functionality
- Filter by job type, location, and experience
- Detailed job descriptions with required skills
- Easy application process

### Application System
- Multi-step application form
- File upload for resumes
- Automatic email notifications
- Application status tracking

### Admin Dashboard
- Comprehensive application management
- Application statistics and analytics
- Bulk actions for applications
- Search and filter capabilities

## Security Features

- Password hashing
- JWT authentication
- Form validation
- XSS protection
- CORS enabled
- Rate limiting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a new branch (\`git checkout -b feature/improvement\`)
3. Commit changes (\`git commit -am 'Add new feature'\`)
4. Push to branch (\`git push origin feature/improvement\`)
5. Open a Pull Request

## Development

To run the project in development mode with auto-reload:

\`\`\`bash
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- MongoDB Atlas for database hosting
- Express.js community for excellent middleware
- Node.js community for great packages

## Contact

- Creator: Jagadeesh TR
- GitHub: [@jagadeeshtr817-prog](https://github.com/jagadeeshtr817-prog)

## Roadmap

- [ ] Add email verification
- [ ] Implement OAuth authentication
- [ ] Add advanced search filters
- [ ] Implement real-time notifications
- [ ] Add mobile app version