import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { supabase } from './utils/supabase';
import {
  getUserId,
  corsHeaders,
  unauthorizedResponse,
  errorResponse,
  successResponse
} from './utils/auth';

const MAX_STAFF = 4;

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

  // Get user's team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id')
    .eq('representative_user_id', userId)
    .single();

  if (teamError || !team) {
    return errorResponse('Primero debes crear un equipo / You must create a team first', 400);
  }

  // Get staff ID from query string for PUT/DELETE
  const staffId = event.queryStringParameters?.id;

  try {
    switch (event.httpMethod) {
      case 'GET': {
        // Get all staff for the team
        const { data, error } = await supabase
          .from('team_staff')
          .select('*')
          .eq('team_id', team.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        return successResponse({ staff: data || [] });
      }

      case 'POST': {
        // Add new staff member
        const body = JSON.parse(event.body || '{}');

        // Check staff count
        const { count } = await supabase
          .from('team_staff')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.id);

        if (count !== null && count >= MAX_STAFF) {
          return errorResponse(
            `El equipo ya tiene el máximo de staff (${MAX_STAFF}) / Team already has maximum staff (${MAX_STAFF})`
          );
        }

        // Validate required fields
        if (!body.name || !body.role) {
          return errorResponse('Nombre y rol son obligatorios / Name and role are required');
        }

        // Validate role
        const validRoles = ['mechanic', 'coordinator', 'support'];
        if (!validRoles.includes(body.role)) {
          return errorResponse('Rol inválido / Invalid role');
        }

        // Create staff member
        const { data, error } = await supabase
          .from('team_staff')
          .insert({
            team_id: team.id,
            name: body.name,
            dni: body.dni,
            phone: body.phone,
            role: body.role
          })
          .select()
          .single();

        if (error) throw error;

        return successResponse({ staff: data }, 201);
      }

      case 'PUT': {
        // Update staff member
        if (!staffId) {
          return errorResponse('Staff ID required');
        }

        const body = JSON.parse(event.body || '{}');

        // Verify staff belongs to user's team
        const { data: existingStaff } = await supabase
          .from('team_staff')
          .select('id')
          .eq('id', staffId)
          .eq('team_id', team.id)
          .single();

        if (!existingStaff) {
          return errorResponse('Staff no encontrado / Staff not found', 404);
        }

        // Validate role if provided
        if (body.role) {
          const validRoles = ['mechanic', 'coordinator', 'support'];
          if (!validRoles.includes(body.role)) {
            return errorResponse('Rol inválido / Invalid role');
          }
        }

        // Remove fields that shouldn't be updated
        delete body.id;
        delete body.team_id;
        delete body.created_at;

        const { data, error } = await supabase
          .from('team_staff')
          .update(body)
          .eq('id', staffId)
          .eq('team_id', team.id)
          .select()
          .single();

        if (error) throw error;

        return successResponse({ staff: data });
      }

      case 'DELETE': {
        // Remove staff member
        if (!staffId) {
          return errorResponse('Staff ID required');
        }

        // Verify staff belongs to user's team
        const { data: staffToDelete } = await supabase
          .from('team_staff')
          .select('id')
          .eq('id', staffId)
          .eq('team_id', team.id)
          .single();

        if (!staffToDelete) {
          return errorResponse('Staff no encontrado / Staff not found', 404);
        }

        // Delete staff
        const { error } = await supabase
          .from('team_staff')
          .delete()
          .eq('id', staffId)
          .eq('team_id', team.id);

        if (error) throw error;

        return successResponse({ success: true });
      }

      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error: any) {
    console.error('API Staff Error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

export { handler };
