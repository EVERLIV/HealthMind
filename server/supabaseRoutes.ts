import express, { Request, Response } from 'express';
import { 
  UserService, 
  HealthProfileService, 
  BloodAnalysisService, 
  BiomarkerService, 
  ChatService, 
  HealthMetricsService 
} from './supabaseApi';
import { isSupabaseConnected } from './supabase';

const router = express.Router();

// Health check for Supabase
router.get('/health/supabase', async (req: Request, res: Response) => {
  try {
    const connected = isSupabaseConnected();
    res.json({
      status: 'ok',
      supabase: connected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// User routes
router.post('/api/users', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const user = await UserService.createUser(req.body);
    if (!user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health profile routes
router.post('/api/health-profiles', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const profile = await HealthProfileService.createProfile(req.body);
    if (!profile) {
      return res.status(400).json({ error: 'Failed to create health profile' });
    }

    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating health profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/health-profiles/:userId', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const profile = await HealthProfileService.getProfileByUserId(req.params.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Health profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching health profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/api/health-profiles/:userId', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const profile = await HealthProfileService.updateProfile(req.params.userId, req.body);
    if (!profile) {
      return res.status(404).json({ error: 'Health profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error updating health profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Blood analysis routes
router.post('/api/blood-analyses', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const analysis = await BloodAnalysisService.createAnalysis(req.body);
    if (!analysis) {
      return res.status(400).json({ error: 'Failed to create blood analysis' });
    }

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Error creating blood analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/blood-analyses/:userId', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const analyses = await BloodAnalysisService.getAnalysesByUserId(req.params.userId);
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching blood analyses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/api/blood-analyses/:id', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const analysis = await BloodAnalysisService.updateAnalysis(req.params.id, req.body);
    if (!analysis) {
      return res.status(404).json({ error: 'Blood analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Error updating blood analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Biomarker routes
router.get('/api/biomarkers', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const biomarkers = await BiomarkerService.getAllBiomarkers();
    res.json(biomarkers);
  } catch (error) {
    console.error('Error fetching biomarkers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/biomarkers/category/:category', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const biomarkers = await BiomarkerService.getBiomarkersByCategory(req.params.category);
    res.json(biomarkers);
  } catch (error) {
    console.error('Error fetching biomarkers by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/biomarker-results/:analysisId', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const results = await BiomarkerService.getBiomarkerResultsByAnalysisId(req.params.analysisId);
    res.json(results);
  } catch (error) {
    console.error('Error fetching biomarker results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat routes
router.post('/api/chat/sessions', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const session = await ChatService.createSession(req.body);
    if (!session) {
      return res.status(400).json({ error: 'Failed to create chat session' });
    }

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/chat/sessions/:userId', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const sessions = await ChatService.getSessionsByUserId(req.params.userId);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/api/chat/messages', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const message = await ChatService.createMessage(req.body);
    if (!message) {
      return res.status(400).json({ error: 'Failed to create chat message' });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating chat message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/chat/messages/:sessionId', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const messages = await ChatService.getMessagesBySessionId(req.params.sessionId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health metrics routes
router.post('/api/health-metrics', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const metrics = await HealthMetricsService.createMetrics(req.body);
    if (!metrics) {
      return res.status(400).json({ error: 'Failed to create health metrics' });
    }

    res.status(201).json(metrics);
  } catch (error) {
    console.error('Error creating health metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/health-metrics/:userId', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const limit = parseInt(req.query.limit as string) || 30;
    const metrics = await HealthMetricsService.getMetricsByUserId(req.params.userId, limit);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
