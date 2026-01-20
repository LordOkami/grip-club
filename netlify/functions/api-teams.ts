import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getFirestoreDb } from './utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
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
  const userId = await getUserId(event);
  if (!userId) {
    return unauthorizedResponse();
  }

  const db = getFirestoreDb();

  try {
    switch (event.httpMethod) {
      case 'GET': {
        // Get team for current user with pilots and staff
        const teamsRef = db.collection('teams');
        const teamQuery = await teamsRef.where('representativeUserId', '==', userId).limit(1).get();

        if (teamQuery.empty) {
          return successResponse({ team: null });
        }

        const teamDoc = teamQuery.docs[0];
        const teamData = { id: teamDoc.id, ...teamDoc.data() };

        // Get pilots subcollection
        const pilotsSnapshot = await teamDoc.ref.collection('pilots').orderBy('createdAt').get();
        const pilots = pilotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get staff subcollection
        const staffSnapshot = await teamDoc.ref.collection('staff').orderBy('createdAt').get();
        const staff = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return successResponse({ team: { ...teamData, pilots, staff } });
      }

      case 'POST': {
        // Create new team
        const body = JSON.parse(event.body || '{}');

        // Check if user already has a team
        const existingQuery = await db.collection('teams')
          .where('representativeUserId', '==', userId)
          .limit(1)
          .get();

        if (!existingQuery.empty) {
          return errorResponse('Ya tienes un equipo registrado / You already have a registered team');
        }

        // Check registration settings
        const settingsDoc = await db.collection('settings').doc('registration').get();
        const settings = settingsDoc.data();

        if (!settings?.registrationOpen) {
          return errorResponse('Las inscripciones están cerradas / Registrations are closed');
        }

        // Check deadline
        if (settings.registrationDeadline && new Date(settings.registrationDeadline) < new Date()) {
          return errorResponse('El plazo de inscripción ha terminado / Registration deadline has passed');
        }

        // Check team limit
        const teamsCount = await db.collection('teams').count().get();
        const count = teamsCount.data().count;

        if (settings.maxTeams && count >= settings.maxTeams) {
          return errorResponse('Se ha alcanzado el número máximo de equipos / Maximum number of teams reached');
        }

        // Validate required fields
        if (!body.name || !body.numberOfPilots) {
          return errorResponse('Nombre de equipo y número de pilotos son obligatorios / Team name and number of pilots are required');
        }

        if (body.numberOfPilots < 4 || body.numberOfPilots > 8) {
          return errorResponse('El número de pilotos debe ser entre 4 y 8 / Number of pilots must be between 4 and 8');
        }

        // Create team
        const teamRef = db.collection('teams').doc();
        const now = FieldValue.serverTimestamp();

        const teamData: Record<string, any> = {
          representativeUserId: userId,
          name: body.name,
          preferredNumber: body.preferredNumber || null,
          numberOfPilots: body.numberOfPilots,
          representativeName: body.representativeName || '',
          representativeSurname: body.representativeSurname || '',
          representativeDni: body.representativeDni || '',
          representativePhone: body.representativePhone || '',
          representativeEmail: body.representativeEmail || '',
          address: body.address || '',
          municipality: body.municipality || '',
          postalCode: body.postalCode || '',
          province: body.province || '',
          motorcycleBrand: body.motorcycleBrand || '',
          motorcycleModel: body.motorcycleModel || '',
          motorcyclePhoto: body.motorcyclePhoto || null,
          motorcyclePhotoStatus: body.motorcyclePhoto ? 'pending' : null,
          engineCapacity: body.engineCapacity || '125cc_4t',
          registrationDate: body.registrationDate || '',
          modifications: body.modifications || '',
          comments: body.comments || '',
          gdprConsent: body.gdprConsent || false,
          gdprConsentDate: body.gdprConsent ? new Date().toISOString() : null,
          status: 'draft',
          createdAt: now,
          updatedAt: now
        };

        await teamRef.set(teamData);

        return successResponse({ team: { id: teamRef.id, ...teamData } }, 201);
      }

      case 'PUT': {
        // Update team
        const body = JSON.parse(event.body || '{}');

        // Find user's team
        const teamQuery = await db.collection('teams')
          .where('representativeUserId', '==', userId)
          .limit(1)
          .get();

        if (teamQuery.empty) {
          return errorResponse('Equipo no encontrado / Team not found', 404);
        }

        const teamDoc = teamQuery.docs[0];
        const existingData = teamDoc.data();

        // Remove fields that shouldn't be updated
        delete body.id;
        delete body.representativeUserId;
        delete body.createdAt;
        delete body.status; // Status changes should be separate
        delete body.motorcyclePhotoStatus; // Only admin can change this

        // If a new photo is uploaded, reset status to pending
        if (body.motorcyclePhoto && body.motorcyclePhoto !== existingData?.motorcyclePhoto) {
          body.motorcyclePhotoStatus = 'pending';
        }

        // Add updated timestamp
        body.updatedAt = FieldValue.serverTimestamp();

        await teamDoc.ref.update(body);

        const updatedDoc = await teamDoc.ref.get();

        return successResponse({ team: { id: updatedDoc.id, ...updatedDoc.data() } });
      }

      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error: any) {
    console.error('API Teams Error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
};

export { handler };
