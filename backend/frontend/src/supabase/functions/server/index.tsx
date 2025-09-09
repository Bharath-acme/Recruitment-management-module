import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Helper function to get user from token
async function getUserFromToken(authorization: string | undefined) {
  if (!authorization?.startsWith('Bearer ')) {
    return null
  }
  
  const token = authorization.split(' ')[1]
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) throw error
    return user
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

// User signup endpoint
app.post('/make-server-66aec17b/signup', async (c) => {
  try {
    const { email, password, userData } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name: userData.name,
        role: userData.role,
        company: userData.company,
        country: userData.country
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.error('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    // Store additional user data in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name: userData.name,
      role: userData.role,
      company: userData.company,
      country: userData.country,
      created_at: new Date().toISOString()
    })

    return c.json({ success: true, user: data.user })
  } catch (error) {
    console.error('Signup endpoint error:', error)
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

// Dashboard data endpoint
app.get('/make-server-66aec17b/dashboard', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    
    // For demo purposes, return sample data
    const dashboardData = {
      metrics: [
        {
          title: 'Open Positions',
          value: 24,
          change: '+12%',
          changeType: 'increase',
          iconName: 'FileText',
          route: '/requisitions'
        },
        {
          title: 'Active Candidates',
          value: 187,
          change: '+8%',
          changeType: 'increase',
          iconName: 'Users',
          route: '/candidates'
        },
        {
          title: 'Scheduled Interviews',
          value: 15,
          change: '+3',
          changeType: 'increase',
          iconName: 'Calendar',
          route: '/interviews'
        },
        {
          title: 'Pending Offers',
          value: 8,
          change: '-2',
          changeType: 'decrease',
          iconName: 'HandHeart',
          route: '/offers'
        },
        {
          title: 'Time to Hire (Days)',
          value: 28,
          change: '-5%',
          changeType: 'decrease',
          iconName: 'Clock',
          route: '/analytics'
        },
        {
          title: 'Offer Acceptance Rate',
          value: '85%',
          change: '+3%',
          changeType: 'increase',
          iconName: 'Target',
          route: '/analytics'
        }
      ],
      requisitions: [],
      interviews: [],
      approvals: []
    }

    return c.json(dashboardData)
  } catch (error) {
    console.error('Dashboard endpoint error:', error)
    return c.json({ error: 'Failed to load dashboard data' }, 500)
  }
})

// Requisitions endpoints
app.get('/make-server-66aec17b/requisitions', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    const status = c.req.query('status') || 'all'
    
    // Get requisitions from KV store
    const requisitions = await kv.getByPrefix('requisition:') || []
    
    let filteredRequisitions = requisitions
    if (status !== 'all') {
      filteredRequisitions = requisitions.filter(req => 
        req.status.toLowerCase() === status.toLowerCase()
      )
    }

    return c.json({ requisitions: filteredRequisitions })
  } catch (error) {
    console.error('Get requisitions error:', error)
    return c.json({ error: 'Failed to load requisitions' }, 500)
  }
})

app.post('/make-server-66aec17b/requisitions', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    const user = await getUserFromToken(authorization)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const requisitionData = await c.req.json()
    
    // Generate requisition ID
    const reqId = `REQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    
    const requisition = {
      id: reqId,
      ...requisitionData,
      status: 'Pending Approval',
      approvalStatus: 'Pending',
      daysOpen: 0,
      applicants: 0,
      filled: 0,
      recruiter: user.user_metadata?.name || user.email,
      createdDate: new Date().toISOString(),
      sla: 30 // Default SLA
    }

    // Store in KV
    await kv.set(`requisition:${reqId}`, requisition)

    return c.json({ success: true, requisition })
  } catch (error) {
    console.error('Create requisition error:', error)
    return c.json({ error: 'Failed to create requisition' }, 500)
  }
})

// Candidates endpoints
app.get('/make-server-66aec17b/candidates', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    const stage = c.req.query('stage') || 'all'
    
    const candidates = await kv.getByPrefix('candidate:') || []
    
    let filteredCandidates = candidates
    if (stage !== 'all') {
      filteredCandidates = candidates.filter(candidate => 
        candidate.stage?.toLowerCase() === stage.toLowerCase()
      )
    }

    return c.json({ candidates: filteredCandidates })
  } catch (error) {
    console.error('Get candidates error:', error)
    return c.json({ error: 'Failed to load candidates' }, 500)
  }
})

app.post('/make-server-66aec17b/candidates', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    const candidateData = await c.req.json()
    
    // Generate candidate ID
    const candidateId = `CND-${Date.now()}`
    
    const candidate = {
      id: candidateId,
      ...candidateData,
      stage: 'Applied',
      status: 'Active',
      createdDate: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }

    await kv.set(`candidate:${candidateId}`, candidate)

    return c.json({ success: true, candidate })
  } catch (error) {
    console.error('Create candidate error:', error)
    return c.json({ error: 'Failed to create candidate' }, 500)
  }
})

// Interviews endpoints
app.get('/make-server-66aec17b/interviews', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    const status = c.req.query('status') || 'all'
    
    const interviews = await kv.getByPrefix('interview:') || []
    
    let filteredInterviews = interviews
    if (status !== 'all') {
      filteredInterviews = interviews.filter(interview => 
        interview.status?.toLowerCase() === status.toLowerCase()
      )
    }

    return c.json({ interviews: filteredInterviews })
  } catch (error) {
    console.error('Get interviews error:', error)
    return c.json({ error: 'Failed to load interviews' }, 500)
  }
})

app.post('/make-server-66aec17b/interviews', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    const user = await getUserFromToken(authorization)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const interviewData = await c.req.json()
    
    const interviewId = `INT-${Date.now()}`
    
    const interview = {
      id: interviewId,
      ...interviewData,
      status: 'Scheduled',
      createdBy: user.id,
      createdDate: new Date().toISOString()
    }

    await kv.set(`interview:${interviewId}`, interview)

    return c.json({ success: true, interview })
  } catch (error) {
    console.error('Create interview error:', error)
    return c.json({ error: 'Failed to schedule interview' }, 500)
  }
})

// Offers endpoints
app.get('/make-server-66aec17b/offers', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    const status = c.req.query('status') || 'all'
    
    const offers = await kv.getByPrefix('offer:') || []
    
    let filteredOffers = offers
    if (status !== 'all') {
      filteredOffers = offers.filter(offer => 
        offer.status?.toLowerCase() === status.toLowerCase()
      )
    }

    return c.json({ offers: filteredOffers })
  } catch (error) {
    console.error('Get offers error:', error)
    return c.json({ error: 'Failed to load offers' }, 500)
  }
})

app.post('/make-server-66aec17b/offers', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    const user = await getUserFromToken(authorization)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const offerData = await c.req.json()
    
    const offerId = `OFF-${Date.now()}`
    
    const offer = {
      id: offerId,
      ...offerData,
      status: 'Draft',
      approvalStatus: 'Pending',
      createdBy: user.id,
      createdDate: new Date().toISOString()
    }

    await kv.set(`offer:${offerId}`, offer)

    return c.json({ success: true, offer })
  } catch (error) {
    console.error('Create offer error:', error)
    return c.json({ error: 'Failed to create offer' }, 500)
  }
})

// Analytics endpoints
app.get('/make-server-66aec17b/analytics', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    
    // Generate sample analytics data
    const analyticsData = {
      timeToHire: {
        average: 28,
        trend: -5,
        byDepartment: [
          { name: 'Engineering', value: 32 },
          { name: 'Product', value: 25 },
          { name: 'Design', value: 22 },
          { name: 'Sales', value: 18 }
        ]
      },
      sourceEffectiveness: [
        { source: 'LinkedIn', candidates: 45, interviews: 12, offers: 3 },
        { source: 'Job Boards', candidates: 32, interviews: 8, offers: 2 },
        { source: 'Referrals', candidates: 28, interviews: 15, offers: 6 },
        { source: 'Agencies', candidates: 15, interviews: 5, offers: 1 }
      ],
      hiringFunnel: [
        { stage: 'Applied', count: 120 },
        { stage: 'Screening', count: 80 },
        { stage: 'Interview', count: 35 },
        { stage: 'Offer', count: 12 },
        { stage: 'Hired', count: 8 }
      ]
    }

    return c.json(analyticsData)
  } catch (error) {
    console.error('Analytics endpoint error:', error)
    return c.json({ error: 'Failed to load analytics data' }, 500)
  }
})

// Health check endpoint
app.get('/make-server-66aec17b/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404)
})

serve(app.fetch)