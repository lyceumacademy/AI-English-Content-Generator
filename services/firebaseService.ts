import { db } from '../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { PassageResult, StoredMaterial } from '../types';

const materialsCollection = collection(db, 'generated_materials');

export const saveMaterial = async (title: string, results: PassageResult[]): Promise<string> => {
    const docRef = await addDoc(materialsCollection, {
        title,
        results,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const getMaterials = async (): Promise<StoredMaterial[]> => {
    const q = query(materialsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
    } as StoredMaterial));
};

export const deleteMaterial = async (docId: string): Promise<void> => {
    const docRef = doc(db, 'generated_materials', docId);
    await deleteDoc(docRef);
};
