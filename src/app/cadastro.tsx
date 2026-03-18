import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text, TextInput,
    View
} from 'react-native';

import { db } from "../lib/firebase";

import {
    addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp
} from "firebase/firestore";

type Note = {id: string, text: string};

export default function cadastro(){
const [noteText, setNoteText] = useState("Primeira anotação");
const [notes, setNotes] = useState<Note[]>([]);
const [userEmail, setUserEmail] = useState<string | null>(null);

async function AddNote(){
    try {
      console.log("Cadastro --> ", noteText);
      const docRef = await addDoc(collection(db, "notes"), {
        text: noteText,
        createdAt: serverTimestamp(),
        user: userEmail ?? null,
      })
      console.log("Cadastro OK id: ", docRef.id);
      setNoteText("")
      await refreshNotes();
    } catch (error) {
      console.log("Cadastro failed ", error);
    }
  }
  async function refreshNotes(){
    try {
      console.log("REFRESH NOTES !!!");
      const response = query(collection(db,"notes"), orderBy("createdAt", "desc"), limit(10));
      const snap = await getDocs(response);
      console.log("NOTES count: ", snap.size);
      setNotes(snap.docs.map(n => ({id: n.id, text:String(n.data().text ?? "") })));
    } catch (error) {
      console.log("refreshNotes failed ", error)      
    }
  }
return (
    <KeyboardAvoidingView
    style={{ flex:1, marginTop:25}}
    behavior={Platform.select({ios:"padding", android:"height"})}
    >
      <ScrollView contentContainerStyle={{padding:16, gap:16}}>
        <Text style={{padding:16, gap:16}}
        >Expo/React + Firebase(mínimo)</Text>
        <View 
        style={{padding:12, borderWidth:1, borderRadius:12, 
        gap:10, marginTop:5}}>
        </View>
        <View style={{padding:12, borderWidth:1, borderRadius:12, 
          gap:10, marginTop:5}}>
          <Text style={{fontSize:16, fontWeight: "600"}}
          >Firestore</Text>
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Nome do aluno"
            style={{borderWidth:1, borderRadius:10, padding:10}}
          ></TextInput>
          <View style={{flexDirection:"row", gap:10, flexWrap:"wrap"}}>
            <Pressable onPress={AddNote}
            style={{padding:10, borderWidth:1, borderRadius:10 }}
            ><Text>Salvar nota</Text></Pressable>
            <Pressable onPress={refreshNotes}
            style={{padding:10, borderWidth:1, borderRadius:10 }}
            ><Text>Recarregar</Text></Pressable>
          </View>
          <View>
            {notes.map(n => (
              <Text key={n.id}>- {n.text}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}