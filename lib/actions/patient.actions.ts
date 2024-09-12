"use server";

import { ID, Query } from 'node-appwrite';
import { DATABASE_ID, databases, ENDPOINT, PATIENT_COLLECTION_ID, PROJECT_ID, storage, users } from '../appwrite.config';
import { parseStringify } from '../utils';
import {InputFile} from "node-appwrite/file"
import { BUCKET_ID } from '../appwrite.config';  

export interface CreateUserParams {
  email: string;
  phone: string;
  name: string;
}

export const createUser = async (user: CreateUserParams) => {
  try {
    // Attempt to create a new user
    const newUser = await users.create(
      ID.unique(),       // Generate a unique ID for the new user
      user.email,        // User email
      user.phone,        // User phone number
      undefined,         // Optional password, if any (default: undefined)
      user.name          // User name
    );
    
    console.log('User created successfully:', newUser);
    return newUser;

  } catch (error: any) {
    // If a user with the same email already exists, handle the conflict
    if (error && error.code === 409) {
      try {
        const existingUser = await users.list([
          Query.equal('email', [user.email]),  // Query to find the existing user
        ]);
        console.log('User already exists:', existingUser.users[0]);
        return existingUser.users[0];
      } catch (listError) {
        console.error('Error listing existing users:', listError);
        throw listError;
      }
    }

    // Log and throw the error for other cases
    console.error('Error creating a new user:', error);
    throw error;
  }
};


export const getUser  = async(userId: string) => {
  try{
    const user = await users.get(userId);
    return parseStringify(user);
} catch(error) {
  console.error('Error getting user:', error);
  throw error;
  }
}


export const getPatient = async(userId: string) => {
  try{
    const patients = await databases.listDocuments(
      DATABASE_ID!, 
      PATIENT_COLLECTION_ID!,
      [Query.equal('userId', userId)]
    );
    return parseStringify(patients.documents[0]);
} catch(error) {
  console.error('Error getting user:', error);
  throw error;
  }
}

export const RegisterPatient = async({ identificationDocument , ...patient  }:
  RegisterUserParams) => {
    try {
      let file;
      if(identificationDocument){
        const inputFile = InputFile.fromBuffer(
          identificationDocument?.get('blobFile') as Blob,
          identificationDocument?.get('fileName') as string ,
        )
        file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile)
      }

      const newPatient = await databases.createDocument(
        DATABASE_ID !,
        PATIENT_COLLECTION_ID!,
        ID.unique(),
        {
          identificationDocumentId: file?.$id || null,
          identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
          ...patient

        }
      )
      return parseStringify(newPatient);
      
    } catch (error) {
      console.log('Error registering patient:', error);
      
      
    }
  }