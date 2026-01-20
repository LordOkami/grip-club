import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getFirestoreDb } from './utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import {
  getUserId,
  isAdmin,
  corsHeaders,
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
  successResponse
} from './utils/auth';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // Validate authentication
  console.log('Admin Teams: Validating authentication...');
  const userId = await getUserId(event);
  if (!userId) {
    console.log('Admin Teams: No userId found, returning unauthorized');
    return unauthorizedResponse();
  }
  console.log('Admin Teams: User authenticated:', userId);

  // Check admin permission
  console.log('Admin Teams: Checking admin permissions...');
  if (!(await isAdmin(event))) {
    console.log('Admin Teams: User is not admin, returning forbidden');
    return forbiddenResponse();
  }
  console.log('Admin Teams: Admin permission verified');

  // Initialize Firestore
  console.log('Admin Teams: Initializing Firestore...');
  let db;
  try {
    db = getFirestoreDb();
    console.log('Admin Teams: Firestore initialized successfully');
  } catch (initError: any) {
    console.error('Admin Teams: Firestore initialization error:', initError);
    return errorResponse(`Firestore initialization error: ${initError.message}`, 500);
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        // Get all teams with pilots and staff
        console.log('Admin Teams: Fetching teams from Firestore...');
        const teamsSnapshot = await db.collection('teams')
          .orderBy('createdAt', 'desc')
          .get();
        console.log('Admin Teams: Found', teamsSnapshot.size, 'teams');

        const teamsWithCounts = await Promise.all(
          teamsSnapshot.docs.map(async (teamDoc) => {
            const teamData = { id: teamDoc.id, ...teamDoc.data() };

            // Get pilots subcollection
            const pilotsSnapshot = await teamDoc.ref.collection('pilots').get();
            const pilots = pilotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Get staff subcollection
            const staffSnapshot = await teamDoc.ref.collection('staff').get();
            const staff = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            return {
              ...teamData,
              pilots,
              staff,
              pilotsCount: pilots.length,
              staffCount: staff.length
            };
          })
        );

        // Get all pilots for detailed stats
        const allPilots = teamsWithCounts.flatMap(t => t.pilots || []);
        const allStaff = teamsWithCounts.flatMap(t => t.staff || []);

        // Calculate stats by motorcycle experience
        const experienceStats = {
          principiante: allPilots.filter((p: any) => p.motorcycleExperience === 'principiante').length,
          rutero: allPilots.filter((p: any) => p.motorcycleExperience === 'rutero').length,
          tandero_iniciado: allPilots.filter((p: any) => p.motorcycleExperience === 'tandero_iniciado').length,
          tandero_medio: allPilots.filter((p: any) => p.motorcycleExperience === 'tandero_medio').length,
          tandero_rapido: allPilots.filter((p: any) => p.motorcycleExperience === 'tandero_rapido').length,
          semi_pro: allPilots.filter((p: any) => p.motorcycleExperience === 'semi_pro').length
        };

        // Calculate stats by engine size
        const engineStats = {
          '125cc_4t': teamsWithCounts.filter((t: any) => t.engineCapacity === '125cc_4t').length,
          '50cc_2t': teamsWithCounts.filter((t: any) => t.engineCapacity === '50cc_2t').length
        };

        // Calculate stats by staff role
        const staffRoleStats = {
          mechanic: allStaff.filter((s: any) => s.role === 'mechanic').length,
          coordinator: allStaff.filter((s: any) => s.role === 'coordinator').length,
          support: allStaff.filter((s: any) => s.role === 'support').length
        };

        // Get registration dates for timeline
        const registrationsByDate = teamsWithCounts.reduce((acc: Record<string, number>, team: any) => {
          // Handle Firestore Timestamp
          let date = '';
          if (team.createdAt) {
            if (team.createdAt.toDate) {
              date = team.createdAt.toDate().toISOString().split('T')[0];
            } else if (typeof team.createdAt === 'string') {
              date = team.createdAt.split('T')[0];
            }
          }
          if (date) {
            acc[date] = (acc[date] || 0) + 1;
          }
          return acc;
        }, {});

        // Get teams without GDPR consent
        const teamsWithoutGdpr = teamsWithCounts.filter((t: any) => !t.gdprConsent).length;

        // Calculate conversion rate
        const conversionRate = teamsWithCounts.length > 0
          ? Math.round((teamsWithCounts.filter((t: any) => t.status === 'confirmed').length / teamsWithCounts.length) * 100)
          : 0;

        // Average pilots per team
        const avgPilotsPerTeam = teamsWithCounts.length > 0
          ? (allPilots.length / teamsWithCounts.length).toFixed(1)
          : '0';

        // Count teams with pending photo reviews
        const pendingPhotoReviews = teamsWithCounts.filter((t: any) => t.motorcyclePhotoStatus === 'pending').length;

        // Calculate stats
        const stats = {
          total: teamsWithCounts.length,
          draft: teamsWithCounts.filter((t: any) => t.status === 'draft').length,
          pending: teamsWithCounts.filter((t: any) => t.status === 'pending').length,
          confirmed: teamsWithCounts.filter((t: any) => t.status === 'confirmed').length,
          cancelled: teamsWithCounts.filter((t: any) => t.status === 'cancelled').length,
          totalPilots: allPilots.length,
          totalStaff: allStaff.length,
          experienceLevels: experienceStats,
          engineTypes: engineStats,
          staffRoles: staffRoleStats,
          registrationsByDate: registrationsByDate,
          teamsWithoutGdpr: teamsWithoutGdpr,
          conversionRate: conversionRate,
          avgPilotsPerTeam: avgPilotsPerTeam,
          pendingPhotoReviews: pendingPhotoReviews
        };

        return successResponse({ teams: teamsWithCounts, stats });
      }

      case 'PUT': {
        // Update team status or photo status
        const teamId = event.queryStringParameters?.id;
        if (!teamId) {
          return errorResponse('Team ID is required');
        }

        const body = JSON.parse(event.body || '{}');

        // Only allow specific updates from admin
        const allowedUpdates: Record<string, any> = {};
        if (body.status && ['draft', 'pending', 'confirmed', 'cancelled'].includes(body.status)) {
          allowedUpdates.status = body.status;
        }

        // Allow photo status updates
        if (body.motorcyclePhotoStatus && ['pending', 'approved', 'rejected'].includes(body.motorcyclePhotoStatus)) {
          allowedUpdates.motorcyclePhotoStatus = body.motorcyclePhotoStatus;
        }

        if (Object.keys(allowedUpdates).length === 0) {
          return errorResponse('No valid fields to update');
        }

        allowedUpdates.updatedAt = FieldValue.serverTimestamp();

        const teamRef = db.collection('teams').doc(teamId);
        await teamRef.update(allowedUpdates);

        const updatedDoc = await teamRef.get();

        return successResponse({ team: { id: updatedDoc.id, ...updatedDoc.data() } });
      }

      case 'DELETE': {
        // Delete team and its subcollections
        const teamId = event.queryStringParameters?.id;
        if (!teamId) {
          return errorResponse('Team ID is required');
        }

        const teamRef = db.collection('teams').doc(teamId);

        // Delete pilots subcollection
        const pilotsSnapshot = await teamRef.collection('pilots').get();
        const deletePilots = pilotsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePilots);

        // Delete staff subcollection
        const staffSnapshot = await teamRef.collection('staff').get();
        const deleteStaff = staffSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteStaff);

        // Delete team document
        await teamRef.delete();

        return successResponse({ message: 'Team deleted successfully' });
      }

      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error: any) {
    console.error('Admin Teams Error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

export { handler };
