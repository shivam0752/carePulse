"use server";

import { ID, Query } from 'node-appwrite';
import { APPOINTMENT_COLLECTION_ID, DATABASE_ID, databases, ENDPOINT, messaging, PATIENT_COLLECTION_ID, PROJECT_ID, storage, users } from '../appwrite.config';
import { parseStringify } from '../utils';
import { Appointment } from '@/types/appwrite.types';
import { revalidatePath } from 'next/cache';
import { formatDateTime } from '../utils';

export const createAppointment = async (appointment: CreateAppointmentParams) => {
   try {
      const newAppointment = await databases.createDocument(
         DATABASE_ID !,
         APPOINTMENT_COLLECTION_ID!,
         ID.unique(),
         appointment
       )
       return parseStringify(newAppointment);
      
   } catch (error) {
      console.error(error);
   }
}

export const getAppointment = async (appointmentId: string)=>{
   try {
      const appointment = await databases.getDocument(
         DATABASE_ID!,
         APPOINTMENT_COLLECTION_ID!,
         appointmentId,
      )
      return parseStringify(appointment);
      
   } catch (error) {
      console.log(error);
      
   }
}

export const getRecentAppointmentList = async() => {
   try {
      const appointments = await databases.listDocuments(
         DATABASE_ID!,
         APPOINTMENT_COLLECTION_ID!,
         [Query.orderDesc('$createdAt')]
      );
      const initialCounts = {
         scheduledCount: 0,
         pendingCount: 0,
         cancelledCount: 0,
      }
      const counts = (appointments.documents as Appointment[]).reduce((acc, appointment) =>{
         switch (appointment.status) {
            case "scheduled":
              acc.scheduledCount++;
              break;
            case "pending":
              acc.pendingCount++;
              break;
            case "cancelled":
              acc.cancelledCount++;
              break;
          }
          return acc;
      }, initialCounts);

      const data = {
         totalCount: appointments.total,
         ...counts,
         documents: appointments.documents,
      }

      return parseStringify(data);

   } catch (error) {
      console.error(error);
      
   }
}

export const updateAppointment = async ({
   appointmentId,
   userId,
   appointment,
   type,
 }: UpdateAppointmentParams) => {
   try {
     // Update the appointment in the database
     const updatedAppointment = await databases.updateDocument(
       DATABASE_ID!,
       APPOINTMENT_COLLECTION_ID!,
       appointmentId,
       appointment
     );
 
     if (!updatedAppointment) {
       throw new Error("Appointment not found");
     }

      // notifications
      const smsMessage = `Greetings from CarePulse. ${type === "schedule" ? `Your appointment is confirmed for ${formatDateTime(appointment.schedule!).dateTime} with Dr. ${appointment.primaryPhysician}` : `We regret to inform that your appointment for ${formatDateTime(appointment.schedule!).dateTime} is cancelled. Reason:  ${appointment.cancellationReason}`}.`;
  
     await sendSMSNotification(userId, smsMessage)

     revalidatePath('/admin');
     // Return the updated appointment data
     return parseStringify(updatedAppointment);
   } catch (error) {
     // Log the error and rethrow it if necessary
     console.error("Error updating appointment:", error);
     throw error; // Rethrow to propagate error if needed
   }
 };
 

 export const sendSMSNotification = async (userId: string, content: string) => {
   try {

      const message = await messaging.createSms(
         ID.unique(),
         content,
         [],
         [userId]
      )

      return parseStringify(message);
      
   } catch (error) {
      console.log(error);
      
   }
 }