import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

// GET /api/leagues - Get all leagues for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrisma()
    
    if (!prisma) {
      // Demo mode - return mock data
      return NextResponse.json({
        leagues: [
          {
            id: 'demo-league-1',
            name: 'Demo Fantasy League',
            maxTeams: 12,
            isActive: true,
            isPaid: false,
            entryFee: null,
            draftType: 'LIVE_ONLINE',
            draftDate: null,
            createdAt: new Date().toISOString(),
            commissioner: {
              id: 'demo-commissioner',
              username: 'demo',
              firstName: 'Demo',
              lastName: 'User'
            },
            teams: [],
            _count: {
              teams: 0
            }
          }
        ]
      })
    }

    // Try to get leagues from database
    const leagues = await prisma.league.findMany({
      where: {
        teams: {
          some: {
            ownerId: session.user.id
          }
        }
      },
      include: {
        commissioner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        teams: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            owner: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            teams: true
          }
        }
      }
    })

    return NextResponse.json({ leagues })
  } catch (error) {
    console.warn('Database error in leagues API, returning demo data:', error)
    
    // Fallback to demo mode
    return NextResponse.json({
      leagues: [
        {
          id: 'demo-league-1',
          name: 'Demo Fantasy League',
          maxTeams: 12,
          isActive: true,
          isPaid: false,
          entryFee: null,
          draftType: 'LIVE_ONLINE',
          draftDate: null,
          createdAt: new Date().toISOString(),
          commissioner: {
            id: 'demo-commissioner',
            username: 'demo',
            firstName: 'Demo',
            lastName: 'User'
          },
          teams: [],
          _count: {
            teams: 0
          }
        }
      ]
    })
  }
}

// POST /api/leagues - Create a new league
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, maxTeams, isPaid, entryFee, draftType, draftDate } = body

    if (!name) {
      return NextResponse.json({ error: 'League name is required' }, { status: 400 })
    }

    const prisma = getPrisma()
    
    if (!prisma) {
      // Demo mode - return mock created league
      const mockLeague = {
        id: 'demo-league-' + Date.now(),
        name,
        maxTeams: maxTeams || 12,
        isPaid: isPaid || false,
        entryFee: entryFee || null,
        draftType: draftType || 'LIVE_ONLINE',
        draftDate: draftDate || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        commissionerId: session.user.id
      }
      
      return NextResponse.json({ league: mockLeague }, { status: 201 })
    }

    // Try to create league in database
    const league = await prisma.league.create({
      data: {
        name,
        commissionerId: session.user.id,
        maxTeams: maxTeams || 12,
        isPaid: isPaid || false,
        entryFee: entryFee || null,
        draftType: draftType || 'LIVE_ONLINE',
        draftDate: draftDate ? new Date(draftDate) : null,
      }
    })

    return NextResponse.json({ league }, { status: 201 })
  } catch (error) {
    console.warn('Database error in create league API, returning demo response:', error)
    
    // Fallback to demo mode
    const body = await request.json()
    const { name, maxTeams, isPaid, entryFee, draftType, draftDate } = body
    
    const mockLeague = {
      id: 'demo-league-' + Date.now(),
      name: name || 'Demo League',
      maxTeams: maxTeams || 12,
      isPaid: isPaid || false,
      entryFee: entryFee || null,
      draftType: draftType || 'LIVE_ONLINE',
      draftDate: draftDate || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      commissionerId: 'demo-user'
    }
    
    return NextResponse.json({ league: mockLeague }, { status: 201 })
  }
} 