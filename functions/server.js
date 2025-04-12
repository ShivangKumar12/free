import express from 'express';
import serverless from 'serverless-http';
import { MemStorage } from '../server/storage.js';

// Initialize memory storage
const storage = new MemStorage();

const app = express();
const router = express.Router();

// Middleware
app.use(express.json());

// Enable CORS with stricter settings for production
app.use((req, res, next) => {
  // In production, restrict to your domain
  const allowedOrigins = [
    'https://shivang-portfolio.netlify.app', 
    'https://www.shivang-portfolio.netlify.app'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // For local development or unknown origins
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Projects routes
router.get('/projects', async (req, res) => {
  try {
    const projects = await storage.getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const project = await storage.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/projects/:id', async (req, res) => {
  try {
    const project = await storage.updateProject(parseInt(req.params.id), req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const success = await storage.deleteProject(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reviews routes
router.get('/reviews', async (req, res) => {
  try {
    const reviews = req.query.admin === 'true' 
      ? await storage.getAllReviews()
      : await storage.getApprovedReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const review = await storage.createReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/reviews/:id/approve', async (req, res) => {
  try {
    const review = await storage.approveReview(parseInt(req.params.id));
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const success = await storage.deleteReview(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resume routes
router.post('/resumes', async (req, res) => {
  try {
    const resume = await storage.createResume(req.body);
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Message routes
router.post('/messages', async (req, res) => {
  try {
    const message = await storage.createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Social links routes
router.get('/social-links', async (req, res) => {
  try {
    const links = await storage.getSocialLinks();
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/social-links', async (req, res) => {
  try {
    const links = await storage.updateSocialLinks(req.body);
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api', router);

// Health check route
app.get('/.netlify/functions/server/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Export the handler for Netlify Functions
export const handler = serverless(app);