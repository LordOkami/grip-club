import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { supabase } from './utils/supabase';
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
  const userId = getUserId(event);
  if (!userId) {
    return unauthorizedResponse();
  }

  // Check admin permission
  if (!isAdmin(event)) {
    return forbiddenResponse();
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        // Get all teams with pilots and staff counts
        const { data, error } = await supabase
          .from('teams')
          .select(`
            *,
            pilots (id, name, surname, email, phone, dni, driving_level, is_representative, track_experience),
            team_staff (id, name, role, dni, phone)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Add counts to each team
        const teamsWithCounts = data?.map(team => ({
          ...team,
          pilots_count: team.pilots?.length || 0,
          staff_count: team.team_staff?.length || 0
        }));

        // Get all pilots for detailed stats
        const allPilots = teamsWithCounts?.flatMap(t => t.pilots || []) || [];
        const allStaff = teamsWithCounts?.flatMap(t => t.team_staff || []) || [];

        // Calculate stats by driving level
        const drivingLevelStats = {
          beginner: allPilots.filter(p => p.driving_level === 'beginner').length,
          intermediate: allPilots.filter(p => p.driving_level === 'intermediate').length,
          advanced: allPilots.filter(p => p.driving_level === 'advanced').length,
          expert: allPilots.filter(p => p.driving_level === 'expert').length
        };

        // Calculate stats by engine size
        const engineStats = {
          '125cc_4t': teamsWithCounts?.filter(t => t.motorcycle_engine === '125cc_4t').length || 0,
          '50cc_2t': teamsWithCounts?.filter(t => t.motorcycle_engine === '50cc_2t').length || 0
        };

        // Calculate stats by staff role
        const staffRoleStats = {
          mechanic: allStaff.filter(s => s.role === 'mechanic').length,
          coordinator: allStaff.filter(s => s.role === 'coordinator').length,
          support: allStaff.filter(s => s.role === 'support').length
        };

        // Get registration dates for timeline
        const registrationsByDate = teamsWithCounts?.reduce((acc: Record<string, number>, team) => {
          const date = team.created_at?.split('T')[0];
          if (date) {
            acc[date] = (acc[date] || 0) + 1;
          }
          return acc;
        }, {}) || {};

        // Get teams without GDPR consent
        const teamsWithoutGdpr = teamsWithCounts?.filter(t => !t.gdpr_consent).length || 0;

        // Calculate conversion rate
        const conversionRate = teamsWithCounts && teamsWithCounts.length > 0
          ? Math.round((teamsWithCounts.filter(t => t.status === 'confirmed').length / teamsWithCounts.length) * 100)
          : 0;

        // Average pilots per team
        const avgPilotsPerTeam = teamsWithCounts && teamsWithCounts.length > 0
          ? (allPilots.length / teamsWithCounts.length).toFixed(1)
          : '0';

        // Calculate stats
        const stats = {
          total: teamsWithCounts?.length || 0,
          draft: teamsWithCounts?.filter(t => t.status === 'draft').length || 0,
          pending: teamsWithCounts?.filter(t => t.status === 'pending').length || 0,
          confirmed: teamsWithCounts?.filter(t => t.status === 'confirmed').length || 0,
          cancelled: teamsWithCounts?.filter(t => t.status === 'cancelled').length || 0,
          total_pilots: allPilots.length,
          total_staff: allStaff.length,
          driving_levels: drivingLevelStats,
          engine_types: engineStats,
          staff_roles: staffRoleStats,
          registrations_by_date: registrationsByDate,
          teams_without_gdpr: teamsWithoutGdpr,
          conversion_rate: conversionRate,
          avg_pilots_per_team: avgPilotsPerTeam
        };

        return successResponse({ teams: teamsWithCounts, stats });
      }

      case 'PUT': {
        // Update team status
        const teamId = event.queryStringParameters?.id;
        if (!teamId) {
          return errorResponse('Team ID is required');
        }

        const body = JSON.parse(event.body || '{}');

        // Only allow status updates from admin
        const allowedUpdates: Record<string, any> = {};
        if (body.status && ['draft', 'pending', 'confirmed', 'cancelled'].includes(body.status)) {
          allowedUpdates.status = body.status;
        }

        if (Object.keys(allowedUpdates).length === 0) {
          return errorResponse('No valid fields to update');
        }

        const { data, error } = await supabase
          .from('teams')
          .update(allowedUpdates)
          .eq('id', teamId)
          .select()
          .single();

        if (error) throw error;

        return successResponse({ team: data });
      }

      case 'DELETE': {
        // Delete team
        const teamId = event.queryStringParameters?.id;
        if (!teamId) {
          return errorResponse('Team ID is required');
        }

        const { error } = await supabase
          .from('teams')
          .delete()
          .eq('id', teamId);

        if (error) throw error;

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
