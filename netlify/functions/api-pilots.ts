import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { supabase } from './utils/supabase';
import {
  getUserId,
  corsHeaders,
  unauthorizedResponse,
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

  // Get user's team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, number_of_pilots')
    .eq('representative_user_id', userId)
    .single();

  if (teamError || !team) {
    return errorResponse('Primero debes crear un equipo / You must create a team first', 400);
  }

  // Get pilot ID from query string for PUT/DELETE
  const pilotId = event.queryStringParameters?.id;

  try {
    switch (event.httpMethod) {
      case 'GET': {
        // Get all pilots for the team
        const { data, error } = await supabase
          .from('pilots')
          .select('*')
          .eq('team_id', team.id)
          .order('pilot_number', { ascending: true });

        if (error) throw error;

        return successResponse({ pilots: data || [] });
      }

      case 'POST': {
        // Add new pilot
        const body = JSON.parse(event.body || '{}');

        // Check pilot count
        const { count } = await supabase
          .from('pilots')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.id);

        if (count !== null && count >= team.number_of_pilots) {
          return errorResponse(
            `El equipo ya tiene el máximo de pilotos (${team.number_of_pilots}) / Team already has maximum pilots (${team.number_of_pilots})`
          );
        }

        // Validate required fields
        const requiredFields = ['name', 'surname', 'dni', 'email', 'phone', 'emergency_contact_name', 'emergency_contact_phone'];
        for (const field of requiredFields) {
          if (!body[field]) {
            return errorResponse(`Campo obligatorio: ${field} / Required field: ${field}`);
          }
        }

        // Check DNI uniqueness within team
        const { data: existingDni } = await supabase
          .from('pilots')
          .select('id')
          .eq('team_id', team.id)
          .eq('dni', body.dni)
          .single();

        if (existingDni) {
          return errorResponse('Ya existe un piloto con ese DNI en el equipo / A pilot with that ID already exists in the team');
        }

        // Get next pilot number
        const nextNumber = (count || 0) + 1;

        // Create pilot
        const { data, error } = await supabase
          .from('pilots')
          .insert({
            team_id: team.id,
            name: body.name,
            surname: body.surname,
            dni: body.dni,
            email: body.email,
            phone: body.phone,
            emergency_contact_name: body.emergency_contact_name,
            emergency_contact_phone: body.emergency_contact_phone,
            driving_level: body.driving_level || 'amateur',
            track_experience: body.track_experience,
            is_representative: body.is_representative || false,
            pilot_number: nextNumber
          })
          .select()
          .single();

        if (error) throw error;

        // Update team status if minimum pilots reached
        if (nextNumber >= 4) {
          await supabase
            .from('teams')
            .update({ status: 'pending' })
            .eq('id', team.id)
            .eq('status', 'draft');
        }

        return successResponse({ pilot: data }, 201);
      }

      case 'PUT': {
        // Update pilot
        if (!pilotId) {
          return errorResponse('Pilot ID required');
        }

        const body = JSON.parse(event.body || '{}');

        // Verify pilot belongs to user's team
        const { data: existingPilot } = await supabase
          .from('pilots')
          .select('id')
          .eq('id', pilotId)
          .eq('team_id', team.id)
          .single();

        if (!existingPilot) {
          return errorResponse('Piloto no encontrado / Pilot not found', 404);
        }

        // If changing DNI, check uniqueness
        if (body.dni) {
          const { data: dniCheck } = await supabase
            .from('pilots')
            .select('id')
            .eq('team_id', team.id)
            .eq('dni', body.dni)
            .neq('id', pilotId)
            .single();

          if (dniCheck) {
            return errorResponse('Ya existe un piloto con ese DNI en el equipo / A pilot with that ID already exists in the team');
          }
        }

        // Remove fields that shouldn't be updated
        delete body.id;
        delete body.team_id;
        delete body.created_at;
        delete body.pilot_number;

        const { data, error } = await supabase
          .from('pilots')
          .update(body)
          .eq('id', pilotId)
          .eq('team_id', team.id)
          .select()
          .single();

        if (error) throw error;

        return successResponse({ pilot: data });
      }

      case 'DELETE': {
        // Remove pilot
        if (!pilotId) {
          return errorResponse('Pilot ID required');
        }

        // Verify pilot belongs to user's team and is not representative
        const { data: pilotToDelete } = await supabase
          .from('pilots')
          .select('id, is_representative, pilot_number')
          .eq('id', pilotId)
          .eq('team_id', team.id)
          .single();

        if (!pilotToDelete) {
          return errorResponse('Piloto no encontrado / Pilot not found', 404);
        }

        if (pilotToDelete.is_representative) {
          return errorResponse('No puedes eliminar al representante del equipo / Cannot delete the team representative');
        }

        // Delete pilot
        const { error } = await supabase
          .from('pilots')
          .delete()
          .eq('id', pilotId)
          .eq('team_id', team.id);

        if (error) throw error;

        // Reorder remaining pilots
        const { data: remainingPilots } = await supabase
          .from('pilots')
          .select('id, pilot_number')
          .eq('team_id', team.id)
          .order('pilot_number', { ascending: true });

        if (remainingPilots) {
          for (let i = 0; i < remainingPilots.length; i++) {
            if (remainingPilots[i].pilot_number !== i + 1) {
              await supabase
                .from('pilots')
                .update({ pilot_number: i + 1 })
                .eq('id', remainingPilots[i].id);
            }
          }
        }

        // Update team status if below minimum
        const { count } = await supabase
          .from('pilots')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.id);

        if (count !== null && count < 4) {
          await supabase
            .from('teams')
            .update({ status: 'draft' })
            .eq('id', team.id);
        }

        return successResponse({ success: true });
      }

      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error: any) {
    console.error('API Pilots Error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

export { handler };
