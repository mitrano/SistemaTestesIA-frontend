import React from 'react';
import { useState, useEffect } from "react";
import {
  Container,
  Button,
  TextField,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  IconButton
} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const API_URL = "http://localhost:8000";

function App() {
  const [prompt, setPrompt] = useState("");
  const [questionsCount, setQuestionsCount] = useState(5);
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [difficulty, setDifficulty] = useState("medium");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: "" });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    const response = await fetch(`${API_URL}/tests`);
    const data = await response.json();
    setTests(data);
  };

  const createTest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          questions_count: questionsCount,
          question_type: questionType,
          difficulty,
        }),
      });
      if (response.ok) {
        setFeedback({ open: true, message: "Teste criado com sucesso!" });
        fetchTests();
        setPrompt("");
      }
    } catch (error) {
      setFeedback({ open: true, message: "Erro ao criar teste." });
    }
    setLoading(false);
  };

  const deleteTest = async (id) => {
    try {
      await fetch(`${API_URL}/tests/${id}`, { method: "DELETE" });
      setFeedback({ open: true, message: "Teste excluído com sucesso!" });
      fetchTests();
    } catch (error) {
      setFeedback({ open: true, message: "Erro ao excluir teste." });
    }
  };

  const copyToClipboard = (test) => {
    navigator.clipboard.writeText(JSON.stringify(test, null, 2));
    setFeedback({ open: true, message: "Teste copiado para área de transferência!" });
  };

  return (
    <Container style={{ padding: "20px", maxWidth: "600px" }}>
      <h1 style={{ color: "#1976D2", textAlign: "center" }}>Gerador de Testes com IA</h1>

      <TextField
        fullWidth
        label="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <TextField
        type="number"
        label="Número de questões"
        value={questionsCount}
        onChange={(e) => setQuestionsCount(Number(e.target.value))}
        style={{ marginBottom: 10 }}
        fullWidth
      />

      <FormControl fullWidth style={{ marginBottom: 10 }}>
        <InputLabel>Tipo de questão</InputLabel>
        <Select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
        >
          <MenuItem value="multiple_choice">Múltipla escolha</MenuItem>
          <MenuItem value="discursive">Discursiva</MenuItem>
          <MenuItem value="mixed">Mista</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth style={{ marginBottom: 10 }}>
        <InputLabel>Dificuldade</InputLabel>
        <Select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <MenuItem value="easy">Fácil</MenuItem>
          <MenuItem value="medium">Médio</MenuItem>
          <MenuItem value="hard">Difícil</MenuItem>
        </Select>
      </FormControl>

      <Button
        onClick={createTest}
        variant="contained"
        color="primary"
        style={{ marginTop: 10 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Criar Teste"}
      </Button>

      {tests.map((test) => (
        <Card key={test.id} style={{ marginTop: 10, backgroundColor: "#f9f9f9" }}>
          <CardContent>
            <h2 style={{ color: "#1976D2" }}>{test.title}</h2>
            <pre style={{ backgroundColor: "#eee", padding: 10, borderRadius: 5 }}>
              {JSON.stringify(test.questions, null, 2)}
            </pre>
            <Button onClick={() => deleteTest(test.id)} color="secondary">
              Excluir
            </Button>
            <IconButton onClick={() => copyToClipboard(test)}>
              <ContentCopyIcon />
            </IconButton>
          </CardContent>
        </Card>
      ))}

      {/* Feedback Snackbar */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback({ open: false, message: "" })}
        message={feedback.message}
      />
    </Container>
  );
}

export default App;
