import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native';

import {
  addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase"; // Certifique-se de que o caminho está correto

// Tipo mais genérico para o seu item
type Registro = { id: string, text: string };

export default function Cadastro() { // Nome do componente com letra maiúscula
  const [inputValue, setInputValue] = useState("");
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Para mostrar um aviso de "Carregando"

  // Carrega os dados assim que a tela abre
  useEffect(() => {
    carregarRegistros();
  }, []);

  async function salvarRegistro() {
    if (inputValue.trim() === "") return; // Evita salvar coisas vazias

    try {
      console.log("Cadastrando --> ", inputValue);
      const docRef = await addDoc(collection(db, "registros_gerais"), { // Nome da coleção no Firebase
        text: inputValue,
        createdAt: serverTimestamp(),
        user: userEmail ?? null,
      });
      
      console.log("Cadastro OK id: ", docRef.id);
      setInputValue(""); // Limpa o input
      await carregarRegistros(); // Recarrega a lista
    } catch (error) {
      console.log("Falha ao cadastrar: ", error);
    }
  }

  async function carregarRegistros() {
    try {
      setLoading(true);
      console.log("Buscando registros...");
      const response = query(collection(db, "registros_gerais"), orderBy("createdAt", "desc"), limit(10));
      const snap = await getDocs(response);
      
      console.log("Total de registros: ", snap.size);
      setRegistros(snap.docs.map(n => ({ id: n.id, text: String(n.data().text ?? "") })));
    } catch (error) {
      console.log("Falha ao carregar registros: ", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, marginTop: 25 }}
      behavior={Platform.select({ ios: "padding", android: "height" })}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        
        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
          Cadastrosinho do Luquinhas
        </Text>

        <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 10, marginTop: 5 }}>
          
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Novo Registro</Text>
          
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Digite o que deseja cadastrar..."
            style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
          />

          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <Pressable 
              onPress={salvarRegistro}
              style={{ padding: 10, borderWidth: 1, borderRadius: 10, backgroundColor: '#e0e0e0' }}
            >
              <Text>Salvar</Text>
            </Pressable>
            
            <Pressable 
              onPress={carregarRegistros}
              style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}
            >
              <Text>Recarregar Lista</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Itens Cadastrados:</Text>
            
            {loading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              registros.map(item => (
                <Text key={item.id} style={{ marginVertical: 2 }}>
                  - {item.text}
                </Text>
              ))
            )}
            
            {registros.length === 0 && !loading && (
              <Text style={{ fontStyle: 'italic', color: 'gray' }}>Nenhum item cadastrado ainda.</Text>
            )}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}